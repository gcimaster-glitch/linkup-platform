import crypto from "crypto";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { attendees, events, ticketTransfers, tickets, users } from "../schema";
import { getDb } from "../db";
import { ENV } from "../_core/env";
import { protectedProcedure, router } from "../_core/trpc";

export const transferRouter = router({
  // チケットを友人に譲渡（メール送信）
  initiate: protectedProcedure
    .input(
      z.object({
        attendeeId: z.number(),
        toEmail: z.string().email(),
        origin: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      // 自分のチケットか確認
      const [attendee] = await db
        .select()
        .from(attendees)
        .where(and(eq(attendees.id, input.attendeeId), eq(attendees.userId, ctx.user.id)))
        .limit(1);
      if (!attendee) throw new Error("チケットが見つかりません");
      if (attendee.status === "checked_in") throw new Error("チェックイン済みのチケットは譲渡できません");

      // 自分自身への譲渡禁止
      if (ctx.user.email === input.toEmail) throw new Error("自分自身には譲渡できません");

      // 既存の未処理譲渡があればキャンセル
      await db
        .update(ticketTransfers)
        .set({ status: "cancelled" })
        .where(
          and(
            eq(ticketTransfers.attendeeId, input.attendeeId),
            eq(ticketTransfers.status, "pending")
          )
        );

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7日

      await db.insert(ticketTransfers).values({
        attendeeId: input.attendeeId,
        fromUserId: ctx.user.id,
        toEmail: input.toEmail,
        token,
        expiresAt,
      });

      // イベント情報取得
      const [event] = await db.select().from(events).where(eq(events.id, attendee.eventId)).limit(1);
      const [ticket] = await db.select().from(tickets).where(eq(tickets.id, attendee.ticketId)).limit(1);

      const acceptUrl = `${input.origin}/transfer/accept?token=${token}`;

      // メール送信
      const resendKey = ENV.resendApiKey;
      if (resendKey) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
          body: JSON.stringify({
            from: "LINK-UP <noreply@link-up.live>",
            to: input.toEmail,
            subject: `【LINK-UP】${ctx.user.name ?? "ユーザー"}さんからチケットが届きました`,
            html: `
              <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
                <h2 style="color:#4f46e5">🎫 チケット譲渡のお知らせ</h2>
                <p>${ctx.user.name ?? "ユーザー"} さんから <strong>${event?.title ?? "イベント"}</strong> の <strong>${ticket?.name ?? "チケット"}</strong> が届きました。</p>
                <a href="${acceptUrl}" style="display:inline-block;background:#4f46e5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">チケットを受け取る</a>
                <p style="color:#6b7280;font-size:12px">このリンクは7日間有効です。</p>
              </div>
            `,
          }),
        });
      }

      return { success: true, token };
    }),

  // 譲渡を受け取る
  accept: protectedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      const [transfer] = await db
        .select()
        .from(ticketTransfers)
        .where(and(eq(ticketTransfers.token, input.token), eq(ticketTransfers.status, "pending")))
        .limit(1);

      if (!transfer) throw new Error("無効または期限切れの譲渡リンクです");
      if (transfer.expiresAt < new Date()) throw new Error("譲渡リンクの有効期限が切れています");
      if (transfer.fromUserId === ctx.user.id) throw new Error("自分が送った譲渡は受け取れません");

      // attendeeのuserIdを変更
      await db
        .update(attendees)
        .set({ userId: ctx.user.id })
        .where(eq(attendees.id, transfer.attendeeId));

      // transferをacceptedに
      await db
        .update(ticketTransfers)
        .set({ status: "accepted", toUserId: ctx.user.id, acceptedAt: new Date() })
        .where(eq(ticketTransfers.id, transfer.id));

      return { success: true };
    }),

  // 自分の受信した譲渡一覧
  myTransfers: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(ticketTransfers)
      .where(eq(ticketTransfers.fromUserId, ctx.user.id))
      .orderBy(ticketTransfers.createdAt)
      .limit(20);
  }),

  // 譲渡をキャンセル
  cancel: protectedProcedure
    .input(z.object({ transferId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db
        .update(ticketTransfers)
        .set({ status: "cancelled" })
        .where(
          and(
            eq(ticketTransfers.id, input.transferId),
            eq(ticketTransfers.fromUserId, ctx.user.id),
            eq(ticketTransfers.status, "pending")
          )
        );
      return { success: true };
    }),
});
