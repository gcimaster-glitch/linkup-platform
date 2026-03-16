import crypto from "crypto";
import { and, desc, eq, ne, sql } from "drizzle-orm";
import { z } from "zod";
import {
  attendees,
  eventReminders,
  events,
  userPoints,
  users,
} from "../schema";
import { getDb } from "../db";
import { ENV } from "../_core/env";
import { protectedProcedure, router } from "../_core/trpc";
import { storagePut } from "../storage";

function randomSuffix() {
  return crypto.randomBytes(6).toString("hex");
}

export const userRouter = router({
  // ─── Profile ────────────────────────────────────────────────────────────────
  me: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return ctx.user;
    const result = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
    return result[0] ?? ctx.user;
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100).optional(),
        bio: z.string().max(500).optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const updateSet: Record<string, unknown> = {};
      if (input.name !== undefined) updateSet.name = input.name;
      if (input.bio !== undefined) updateSet.bio = input.bio;
      await db.update(users).set(updateSet).where(eq(users.id, ctx.user.id));
      return { success: true };
    }),

  uploadAvatar: protectedProcedure
    .input(
      z.object({
        base64: z.string(),
        mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const buffer = Buffer.from(input.base64, "base64");
      const ext = input.mimeType.split("/")[1];
      const key = `avatars/${ctx.user.id}-${randomSuffix()}.${ext}`;
      const { url } = await storagePut(key, buffer, input.mimeType);
      await db.update(users).set({ avatarUrl: url }).where(eq(users.id, ctx.user.id));
      return { url };
    }),

  uploadCover: protectedProcedure
    .input(
      z.object({
        base64: z.string(),
        mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const buffer = Buffer.from(input.base64, "base64");
      const ext = input.mimeType.split("/")[1];
      const key = `covers/${ctx.user.id}-${randomSuffix()}.${ext}`;
      const { url } = await storagePut(key, buffer, input.mimeType);
      await db.update(users).set({ coverImageUrl: url }).where(eq(users.id, ctx.user.id));
      return { url };
    }),

  // ─── Email Verification ──────────────────────────────────────────────────────
  sendEmailVerification: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");
    if (!ctx.user.email) throw new Error("メールアドレスが設定されていません");

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    await db.update(users).set({
      emailVerificationToken: token,
      emailVerificationExpiresAt: expiresAt,
    }).where(eq(users.id, ctx.user.id));

    const verifyUrl = `${process.env.APP_URL || "https://link-up.live"}/verify-email?token=${token}`;
    // メール送信（Resend API）
    const resendKey = ENV.resendApiKey;
    if (resendKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
        body: JSON.stringify({
          from: "LINK-UP <noreply@link-up.live>",
          to: ctx.user.email,
          subject: "【LINK-UP】メールアドレスの確認",
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px"><h2 style="color:#4f46e5">メールアドレスの確認</h2><p>${ctx.user.name ?? "ユーザー"} 様、</p><p>以下のボタンをクリックしてメールアドレスを確認してください。</p><a href="${verifyUrl}" style="display:inline-block;background:#4f46e5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">メールアドレスを確認する</a><p style="color:#6b7280;font-size:12px">このリンクは24時間有効です。</p></div>`,
        }),
      });
    }
    return { success: true };
  }),

  verifyEmail: protectedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const [user] = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      if (!user) throw new Error("ユーザーが見つかりません");
      if (user.emailVerificationToken !== input.token) throw new Error("無効なトークンです");
      if (user.emailVerificationExpiresAt && user.emailVerificationExpiresAt < new Date()) {
        throw new Error("トークンの有効期限が切れています");
      }
      await db.update(users).set({
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiresAt: null,
      }).where(eq(users.id, ctx.user.id));
      return { success: true };
    }),

  // ─── Points ──────────────────────────────────────────────────────────────────
  pointsBalance: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { balance: 0 };
    const [user] = await db.select({ balance: users.pointsBalance }).from(users).where(eq(users.id, ctx.user.id)).limit(1);
    return { balance: user?.balance ?? 0 };
  }),

  pointsHistory: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(userPoints).where(eq(userPoints.userId, ctx.user.id)).orderBy(desc(userPoints.createdAt)).limit(50);
  }),

  // ─── Recommendations ─────────────────────────────────────────────────────────
  recommendations: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    // 過去に参加したイベントのカテゴリを取得
    const pastAttendees = await db
      .select({ category: events.category })
      .from(attendees)
      .innerJoin(events, eq(attendees.eventId, events.id))
      .where(eq(attendees.userId, ctx.user.id))
      .limit(10);

    const categorySet = new Set(pastAttendees.map((a) => a.category).filter(Boolean) as string[]);
    const categories = Array.from(categorySet);

    // 参加済みイベントIDを取得
    const attendedEventIds = await db
      .select({ eventId: attendees.eventId })
      .from(attendees)
      .where(eq(attendees.userId, ctx.user.id));
    const excludeIds = attendedEventIds.map((a) => a.eventId);

    // カテゴリが一致する未参加の公開イベントを取得
    if (categories.length > 0) {
      const recommended = await db
        .select()
        .from(events)
        .where(
          and(
            eq(events.status, "published"),
            sql`${events.category} IN (${sql.join(categories.map((c) => sql`${c}`), sql`, `)})`,
            excludeIds.length > 0
              ? sql`${events.id} NOT IN (${sql.join(excludeIds.map((id) => sql`${id}`), sql`, `)})`
              : sql`1=1`
          )
        )
        .orderBy(desc(events.startDatetime))
        .limit(6);
      if (recommended.length >= 3) return recommended;
    }

    // フォールバック: 最新の公開イベント
    return db
      .select()
      .from(events)
      .where(eq(events.status, "published"))
      .orderBy(desc(events.startDatetime))
      .limit(6);
  }),

  // ─── Event Reminders ─────────────────────────────────────────────────────────
  setReminder: protectedProcedure
    .input(z.object({ eventId: z.number(), orderId: z.number(), reminderType: z.enum(["24h", "1h"]) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      // 重複チェック
      const existing = await db
        .select()
        .from(eventReminders)
        .where(
          and(
            eq(eventReminders.eventId, input.eventId),
            eq(eventReminders.userId, ctx.user.id),
            eq(eventReminders.reminderType, input.reminderType)
          )
        )
        .limit(1);
      if (existing.length > 0) return { success: true, alreadySet: true };
      await db.insert(eventReminders).values({
        eventId: input.eventId,
        userId: ctx.user.id,
        orderId: input.orderId,
        reminderType: input.reminderType,
      });
      return { success: true, alreadySet: false };
    }),
});
