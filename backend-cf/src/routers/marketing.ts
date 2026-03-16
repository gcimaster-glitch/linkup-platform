import { ENV } from "../_core/env";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq, and, inArray } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { attendees, tenantMembers, users, events } from "../schema";
import { sendTicketConfirmationEmail } from "../email";

// ─── LINE helper ─────────────────────────────────────────────────────────────
async function sendLineMessage(to: string, message: string): Promise<boolean> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    console.warn("[LINE] LINE_CHANNEL_ACCESS_TOKEN not configured. Skipped.");
    return false;
  }
  try {
    const res = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to,
        messages: [{ type: "text", text: message }],
      }),
    });
    return res.ok;
  } catch (e) {
    console.error("[LINE] Failed:", e);
    return false;
  }
}

export const marketingRouter = router({
  // Organizer: get attendee list for an event (for bulk messaging)
  getEventAttendees: protectedProcedure
    .input(z.object({ eventId: z.number(), tenantId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const membership = await db
        .select()
        .from(tenantMembers)
        .where(and(eq(tenantMembers.tenantId, input.tenantId), eq(tenantMembers.userId, ctx.user.id)))
        .limit(1);
      if (!membership[0]) throw new TRPCError({ code: "FORBIDDEN" });

      const rows = await db
        .select({ userId: attendees.userId, status: attendees.status })
        .from(attendees)
        .where(and(eq(attendees.eventId, input.eventId), eq(attendees.tenantId, input.tenantId)));

      const userIdSet = new Set(rows.map((r) => r.userId));
      const userIds = Array.from(userIdSet);
      if (userIds.length === 0) return [];

      const userList = await db
        .select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .where(inArray(users.id, userIds));

      return userList;
    }),

  // Organizer: send bulk email to event attendees
  sendBulkEmail: protectedProcedure
    .input(
      z.object({
        tenantId: z.number(),
        eventId: z.number(),
        subject: z.string().min(1).max(255),
        body: z.string().min(1).max(10000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const membership = await db
        .select()
        .from(tenantMembers)
        .where(and(eq(tenantMembers.tenantId, input.tenantId), eq(tenantMembers.userId, ctx.user.id)))
        .limit(1);
      if (!membership[0]) throw new TRPCError({ code: "FORBIDDEN" });

      // Get event info
      const eventList = await db.select().from(events).where(eq(events.id, input.eventId)).limit(1);
      const event = eventList[0];
      if (!event || event.tenantId !== input.tenantId) throw new TRPCError({ code: "NOT_FOUND" });

      // Get unique attendee user IDs
      const rows = await db
        .select({ userId: attendees.userId })
        .from(attendees)
        .where(and(eq(attendees.eventId, input.eventId), eq(attendees.tenantId, input.tenantId)));
      const userIdSet2 = new Set(rows.map((r) => r.userId));
      const userIds = Array.from(userIdSet2);
      if (userIds.length === 0) return { sent: 0, message: "参加者がいません" };

      const userList = await db
        .select({ email: users.email, name: users.name })
        .from(users)
        .where(inArray(users.id, userIds));

      let sent = 0;
      for (const u of userList) {
        if (!u.email) continue;
        try {
          // Use generic email via Resend
          const resendApiKey = ENV.resendApiKey;
          if (resendApiKey) {
            const { Resend } = await import("resend");
            const resend = new Resend(resendApiKey);
            await resend.emails.send({
              from: "LINK-UP <noreply@link-up.live>",
              to: u.email,
              subject: input.subject,
              html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
                <h2 style="color:#6366f1">${event.title}</h2>
                <p>こんにちは、${u.name ?? "参加者"} さん</p>
                <div style="white-space:pre-wrap">${input.body}</div>
                <hr style="margin:24px 0;border-color:#e5e7eb"/>
                <p style="color:#9ca3af;font-size:12px">このメールはLINK-UPを通じて送信されました。</p>
              </div>`,
            });
          }
          sent++;
        } catch (e) {
          console.error("[Marketing] Email failed for", u.email, e);
        }
      }

      return { sent, total: userList.length, message: `${sent}件のメールを送信しました` };
    }),

  // Organizer: send LINE message to attendees (requires LINE user IDs stored separately)
  sendLineBlast: protectedProcedure
    .input(
      z.object({
        tenantId: z.number(),
        lineUserIds: z.array(z.string()).min(1).max(150),
        message: z.string().min(1).max(2000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const membership = await db
        .select()
        .from(tenantMembers)
        .where(and(eq(tenantMembers.tenantId, input.tenantId), eq(tenantMembers.userId, ctx.user.id)))
        .limit(1);
      if (!membership[0]) throw new TRPCError({ code: "FORBIDDEN" });

      let sent = 0;
      for (const lineUserId of input.lineUserIds) {
        const ok = await sendLineMessage(lineUserId, input.message);
        if (ok) sent++;
      }

      return { sent, total: input.lineUserIds.length };
    }),
});
