import { ENV } from "../_core/env";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  getAdminStats,
  getAllTenants,
  getAllUsers,
  getPlatformSetting,
  setPlatformSetting,
  updateTenant,
  updateUserRole,
  searchUsers,
  getUserById,
  suspendUser,
} from "../db";
import { notifyOwner } from "../_core/notification";
import { protectedProcedure, router } from "../_core/trpc";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "管理者権限が必要です" });
  return next({ ctx });
});

export const adminRouter = router({
  // KPI stats
  stats: adminProcedure.query(async () => {
    return getAdminStats();
  }),

  // User management
  users: adminProcedure
    .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
    .query(async ({ input }) => {
      return getAllUsers(input.limit, input.offset);
    }),

  updateUserRole: adminProcedure
    .input(z.object({ userId: z.number(), role: z.enum(["user", "admin"]) }))
    .mutation(async ({ input }) => {
      await updateUserRole(input.userId, input.role);
      return { success: true };
    }),

  searchUsers: adminProcedure
    .input(z.object({ query: z.string().default(""), limit: z.number().default(50), offset: z.number().default(0) }))
    .query(async ({ input }) => {
      return searchUsers(input.query, input.limit, input.offset);
    }),

  getUserDetail: adminProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const u = await getUserById(input.userId);
      if (!u) throw new TRPCError({ code: "NOT_FOUND", message: "ユーザーが見つかりません" });
      return u;
    }),

  suspendUser: adminProcedure
    .input(z.object({ userId: z.number(), suspended: z.boolean() }))
    .mutation(async ({ input }) => {
      await suspendUser(input.userId, input.suspended);
      return { success: true };
    }),

  // Send notification/email to a specific user
  sendUserNotification: adminProcedure
    .input(z.object({
      userId: z.number(),
      userEmail: z.string().email(),
      userName: z.string(),
      subject: z.string().min(1).max(200),
      message: z.string().min(1).max(5000),
    }))
    .mutation(async ({ input }) => {
      const resendApiKey = ENV.resendApiKey;
      if (!resendApiKey) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "RESEND_API_KEYが設定されていません" });
      }
      const safeMessage = input.message.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const html = [
        "<!DOCTYPE html>",
        '<html lang="ja">',
        '<head><meta charset="UTF-8"></head>',
        '<body style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">',
        '  <div style="background: #000; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">',
        '    <h1 style="color: #fff; margin: 0; font-size: 24px;">LINK-UP</h1>',
        "  </div>",
        '  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">',
        `    <p>${input.userName} 様</p>`,
        "    <p>LINK-UP運営事務局よりお知らせです。</p>",
        `    <div style="background: #fff; border: 1px solid #e0e0e0; border-radius: 6px; padding: 20px; margin: 20px 0; white-space: pre-wrap;">${safeMessage}</div>`,
        '    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">',
        '    <p style="font-size: 12px; color: #999; text-align: center;">',
        "      株式会社 国際資源 / LINK-UP<br>",
        "      〒105-0023 東京都港区芝浦1-13-10 第3東運ビル<br>",
        "      Email: linkup@inre.co.jp",
        "    </p>",
        "  </div>",
        "</body>",
        "</html>",
      ].join("\n");

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "LINK-UP <noreply@link-up.live>",
          to: [input.userEmail],
          subject: `[運営からのお知らせ] ${input.subject}`,
          html,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `メール送信に失敗しました: ${err}` });
      }
      // オーナーにも通知
      await notifyOwner({
        title: `[管理者送信] ${input.subject} → ${input.userName}`,
        content: `宛先: ${input.userName} (${input.userEmail})\n\n${input.message}`,
      });
      return { success: true };
    }),

  // Tenant management
  tenants: adminProcedure
    .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
    .query(async ({ input }) => {
      return getAllTenants(input.limit, input.offset);
    }),

  toggleTenant: adminProcedure
    .input(z.object({ tenantId: z.number(), isActive: z.boolean() }))
    .mutation(async ({ input }) => {
      await updateTenant(input.tenantId, { isActive: input.isActive });
      return { success: true };
    }),

  updateTenantPlan: adminProcedure
    .input(z.object({ tenantId: z.number(), plan: z.enum(["free", "pro"]) }))
    .mutation(async ({ input }) => {
      await updateTenant(input.tenantId, { plan: input.plan });
      return { success: true };
    }),

  // Platform fee settings
  getFeeSettings: adminProcedure.query(async () => {
    const defaultFee = await getPlatformSetting("default_platform_fee_rate");
    return { defaultFeeRate: defaultFee ?? "0.10" };
  }),

  updateFeeSettings: adminProcedure
    .input(z.object({ defaultFeeRate: z.string().regex(/^\d+(\.\d+)?$/) }))
    .mutation(async ({ input }) => {
      await setPlatformSetting("default_platform_fee_rate", input.defaultFeeRate);
      return { success: true };
    }),
});
