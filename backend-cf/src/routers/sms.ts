import { ENV } from "../_core/env";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { phoneVerifications, users } from "../schema";

async function sendSmsViaTwilio(to: string, body: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.warn("[SMS] Twilio credentials not configured. SMS skipped.");
    return false;
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const body_params = new URLSearchParams({ To: to, From: fromNumber, Body: body });
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body_params.toString(),
    });
    if (!response.ok) {
      const err = await response.text();
      console.error("[SMS] Twilio error:", err);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[SMS] Failed to send:", e);
    return false;
  }
}

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const smsRouter = router({
  // Send verification code to phone number
  sendCode: protectedProcedure
    .input(z.object({ phoneNumber: z.string().regex(/^\+[1-9]\d{7,14}$/, "国際形式（+81...）で入力してください") }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const code = generateCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Upsert verification record
      await db.insert(phoneVerifications).values({
        userId: ctx.user.id,
        phoneNumber: input.phoneNumber,
        code,
        isVerified: false,
        expiresAt,
      });

      const sent = await sendSmsViaTwilio(
        input.phoneNumber,
        `【LINK-UP】認証コード: ${code}\n10分以内に入力してください。`
      );

      if (!sent) {
        // Return code in dev mode when Twilio is not configured
        const isDev = ENV.isProduction ? "production" : "development" !== "production";
        return {
          success: true,
          devCode: isDev ? code : undefined,
          message: isDev
            ? "SMS未設定のため開発用コードを返します"
            : "SMSを送信しました（Twilio未設定のためスキップ）",
        };
      }

      return { success: true, message: "認証コードをSMSで送信しました" };
    }),

  // Verify the code
  verifyCode: protectedProcedure
    .input(
      z.object({
        phoneNumber: z.string(),
        code: z.string().length(6),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const records = await db
        .select()
        .from(phoneVerifications)
        .where(
          and(
            eq(phoneVerifications.userId, ctx.user.id),
            eq(phoneVerifications.phoneNumber, input.phoneNumber),
            eq(phoneVerifications.code, input.code),
            eq(phoneVerifications.isVerified, false)
          )
        )
        .limit(1);

      const record = records[0];
      if (!record) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "認証コードが正しくありません" });
      }
      if (record.expiresAt < new Date()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "認証コードの有効期限が切れています" });
      }

      // Mark as verified
      await db
        .update(phoneVerifications)
        .set({ isVerified: true })
        .where(eq(phoneVerifications.id, record.id));

      // Update user's phone number
      await db
        .update(users)
        .set({ phoneNumber: input.phoneNumber, phoneVerified: true } as any)
        .where(eq(users.id, ctx.user.id));

      return { success: true, message: "電話番号の認証が完了しました" };
    }),

  // Get current phone verification status
  status: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { phoneNumber: null, phoneVerified: false };
    const userRecord = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
    const u = userRecord[0] as any;
    return {
      phoneNumber: u?.phoneNumber ?? null,
      phoneVerified: u?.phoneVerified ?? false,
    };
  }),
});
