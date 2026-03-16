import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  addTenantMember,
  createEventAnnouncement,
  createTenant,
  getAllTenants,
  getAttendeesForExport,
  getDailySales,
  getEventAnnouncements,
  getEventAttendeeCount,
  getEventById,
  getEventSales,
  getMonthlySales,
  getNotificationSettings,
  getTicketBreakdown,
  getTenantBySlug,
  getTenantForUser,
  getTenantStats,
  getWeeklySales,
  updateTenant,
  upsertNotificationSettings,
  getWaitlistByEvent,
  updateWaitlistStatus,
} from "../db";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";

export const tenantRouter = router({
  // Get the tenant for the current user
  myTenant: protectedProcedure.query(async ({ ctx }) => {
    const result = await getTenantForUser(ctx.user.id);
    return result ?? null;
  }),

  // Create a new tenant (organizer registration)
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(255),
        slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
        description: z.string().optional(),
        // 法人情報
        corporateNumber: z.string().length(13).optional(),
        legalName: z.string().max(255).optional(),
        postalCode: z.string().max(8).optional(),
        address: z.string().optional(),
        representativeName: z.string().max(255).optional(),
        phoneNumber: z.string().max(20).optional(),
        websiteUrl: z.string().url().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check slug uniqueness
      const existing = await getTenantBySlug(input.slug);
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "このスラッグは既に使用されています" });

      const tenantId = await createTenant({
        name: input.name,
        slug: input.slug,
        description: input.description,
        ownerId: ctx.user.id,
        corporateNumber: input.corporateNumber,
        legalName: input.legalName,
        postalCode: input.postalCode,
        address: input.address,
        representativeName: input.representativeName,
        phoneNumber: input.phoneNumber,
        websiteUrl: input.websiteUrl,
      });

      await addTenantMember(tenantId, ctx.user.id, "owner");
      return { tenantId };
    }),

  // Update tenant info
  update: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(255).optional(),
        description: z.string().optional(),
        logoUrl: z.string().url().optional().nullable(),
        // 法人情報
        corporateNumber: z.string().length(13).optional().nullable(),
        legalName: z.string().max(255).optional().nullable(),
        postalCode: z.string().max(10).optional().nullable(),
        address: z.string().max(500).optional().nullable(),
        representativeName: z.string().max(255).optional().nullable(),
        phoneNumber: z.string().max(20).optional().nullable(),
        websiteUrl: z.string().url().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await getTenantForUser(ctx.user.id);
      if (!result) throw new TRPCError({ code: "NOT_FOUND", message: "テナントが見つかりません" });
      if (result.role !== "owner" && result.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await updateTenant(result.tenant.id, input);
      return { success: true };
    }),

  // Admin: list all tenants
  adminList: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
    return getAllTenants(100);
  }),

  // Admin: toggle tenant active status
  adminToggle: protectedProcedure
    .input(z.object({ tenantId: z.number(), isActive: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      await updateTenant(input.tenantId, { isActive: input.isActive });
      return { success: true };
    }),

  // Set custom domain for tenant
  setCustomDomain: protectedProcedure
    .input(z.object({ tenantId: z.number(), customDomain: z.string().min(3) }))
    .mutation(async ({ ctx, input }) => {
      const result = await getTenantForUser(ctx.user.id);
      if (!result) throw new TRPCError({ code: "NOT_FOUND" });
      if (result.tenant.id !== input.tenantId) throw new TRPCError({ code: "FORBIDDEN" });
      if (result.role !== "owner" && result.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      await updateTenant(input.tenantId, { customDomain: input.customDomain } as any);
      return { success: true };
    }),

  // Get stats for current tenant
  stats: protectedProcedure.query(async ({ ctx }) => {
    const result = await getTenantForUser(ctx.user.id);
    if (!result) return null;
    return getTenantStats(result.tenant.id);
  }),

  // Get monthly sales data for chart
  monthlySales: protectedProcedure
    .input(z.object({ months: z.number().min(1).max(24).default(6) }))
    .query(async ({ ctx, input }) => {
      const result = await getTenantForUser(ctx.user.id);
      if (!result) return [];
      return getMonthlySales(result.tenant.id, input.months);
    }),

  // Get per-event sales breakdown
  eventSales: protectedProcedure.query(async ({ ctx }) => {
    const result = await getTenantForUser(ctx.user.id);
    if (!result) return [];
    return getEventSales(result.tenant.id);
  }),

  // Get daily sales data for chart
  dailySales: protectedProcedure
    .input(z.object({ days: z.number().min(7).max(90).default(30) }))
    .query(async ({ ctx, input }) => {
      const result = await getTenantForUser(ctx.user.id);
      if (!result) return [];
      return getDailySales(result.tenant.id, input.days);
    }),

  // Get weekly sales data for chart
  weeklySales: protectedProcedure
    .input(z.object({ weeks: z.number().min(4).max(52).default(12) }))
    .query(async ({ ctx, input }) => {
      const result = await getTenantForUser(ctx.user.id);
      if (!result) return [];
      return getWeeklySales(result.tenant.id, input.weeks);
    }),

  // Get ticket type breakdown for pie chart
  ticketBreakdown: protectedProcedure.query(async ({ ctx }) => {
    const result = await getTenantForUser(ctx.user.id);
    if (!result) return [];
    return getTicketBreakdown(result.tenant.id);
  }),

  // Export attendees as CSV data
  exportAttendees: protectedProcedure
    .input(z.object({ eventId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const result = await getTenantForUser(ctx.user.id);
      if (!result) throw new TRPCError({ code: "FORBIDDEN" });
      return getAttendeesForExport(result.tenant.id, input.eventId);
    }),

  // Get notification settings for current tenant
  getNotificationSettings: protectedProcedure.query(async ({ ctx }) => {
    const result = await getTenantForUser(ctx.user.id);
    if (!result) throw new TRPCError({ code: "FORBIDDEN" });
    const settings = await getNotificationSettings(result.tenant.id);
    // 未設定の場合はデフォルト値を返す
    return settings ?? {
      id: 0,
      tenantId: result.tenant.id,
      notifyOnPurchase: true,
      notifyOnCheckin: false,
      notifyOnCancel: true,
      notifyDailySummary: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }),

  // Update notification settings
  updateNotificationSettings: protectedProcedure
    .input(z.object({
      notifyOnPurchase: z.boolean(),
      notifyOnCheckin: z.boolean(),
      notifyOnCancel: z.boolean(),
      notifyDailySummary: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await getTenantForUser(ctx.user.id);
      if (!result) throw new TRPCError({ code: "FORBIDDEN" });
      await upsertNotificationSettings(result.tenant.id, input);
      return { success: true };
    }),

  // ─── 参加者向けアナウンス ──────────────────────────────────────────────

  // アナウンス一覧取得
  getEventAnnouncements: protectedProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ ctx, input }) => {
      const result = await getTenantForUser(ctx.user.id);
      if (!result) throw new TRPCError({ code: "FORBIDDEN" });
      const event = await getEventById(input.eventId);
      if (!event || event.tenantId !== result.tenant.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return getEventAnnouncements(input.eventId);
    }),

  // アナウンス送信（参加者全員へnotifyOwner経由）
  sendAnnouncement: protectedProcedure
    .input(z.object({
      eventId: z.number(),
      title: z.string().min(1).max(255),
      content: z.string().min(1),
      targetAudience: z.enum(["all", "checked_in", "not_checked_in"]).default("all"),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await getTenantForUser(ctx.user.id);
      if (!result) throw new TRPCError({ code: "FORBIDDEN" });
      const event = await getEventById(input.eventId);
      if (!event || event.tenantId !== result.tenant.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      // 対象参加者数を取得
      const recipientCount = await getEventAttendeeCount(input.eventId, input.targetAudience);
      // アナウンスをDBに保存
      const announcementId = await createEventAnnouncement({
        tenantId: result.tenant.id,
        eventId: input.eventId,
        title: input.title,
        content: input.content,
        targetAudience: input.targetAudience,
        sentCount: recipientCount,
        createdBy: ctx.user.id,
      });
      // 主催者へ送信内容を通知（notifyOwner経由）
      const audienceLabel = input.targetAudience === "all" ? "全参加者" : input.targetAudience === "checked_in" ? "チェックイン済み" : "未チェックイン";
      await import("../_core/notification").then(({ notifyOwner }) =>
        notifyOwner({
          title: `\ud83d\udce2 アナウンス送信完了 - ${event.title}`,
          content: `アナウンス「${input.title}」を${audienceLabel}${recipientCount}名に送信しました。\n\n${input.content}`,
        })
      ).catch(() => {});
      return { announcementId, sentCount: recipientCount };
    }),

  // ─── Waitlist Management (Organizer) ─────────────────────────────────────
  waitlistByEvent: protectedProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ ctx, input }) => {
      const result = await getTenantForUser(ctx.user.id);
      if (!result) throw new TRPCError({ code: "FORBIDDEN" });
      const event = await getEventById(input.eventId);
      if (!event || event.tenantId !== result.tenant.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return getWaitlistByEvent(input.eventId);
    }),

  promoteWaitlist: protectedProcedure
    .input(z.object({ waitlistId: z.number(), eventId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const result = await getTenantForUser(ctx.user.id);
      if (!result) throw new TRPCError({ code: "FORBIDDEN" });
      const event = await getEventById(input.eventId);
      if (!event || event.tenantId !== result.tenant.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const purchaseDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000);
      await updateWaitlistStatus(input.waitlistId, "notified", {
        notifiedAt: new Date(),
        purchaseDeadline,
      });
      return { success: true, purchaseDeadline };
    }),

  cancelWaitlistEntry: protectedProcedure
    .input(z.object({ waitlistId: z.number(), eventId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const result = await getTenantForUser(ctx.user.id);
      if (!result) throw new TRPCError({ code: "FORBIDDEN" });
      const event = await getEventById(input.eventId);
      if (!event || event.tenantId !== result.tenant.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await updateWaitlistStatus(input.waitlistId, "cancelled");
      return { success: true };
    }),
});
