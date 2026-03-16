import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { discounts, tenantMembers } from "../schema";

export const discountRouter = router({
  // Organizer: list discounts for their tenant
  list: protectedProcedure
    .input(z.object({ tenantId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      // Verify ownership
      const membership = await db
        .select()
        .from(tenantMembers)
        .where(and(eq(tenantMembers.tenantId, input.tenantId), eq(tenantMembers.userId, ctx.user.id)))
        .limit(1);
      if (!membership[0]) throw new TRPCError({ code: "FORBIDDEN" });

      return db.select().from(discounts).where(eq(discounts.tenantId, input.tenantId));
    }),

  // Organizer: create discount code
  create: protectedProcedure
    .input(
      z.object({
        tenantId: z.number(),
        eventId: z.number().optional(),
        code: z.string().min(3).max(50).toUpperCase(),
        discountType: z.enum(["percentage", "fixed"]),
        discountValue: z.number().min(1),
        maxUses: z.number().optional(),
        expiresAt: z.string().optional(),
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

      await db.insert(discounts).values({
        tenantId: input.tenantId,
        eventId: input.eventId,
        code: input.code.toUpperCase(),
        discountType: input.discountType,
        discountValue: input.discountValue,
        maxUses: input.maxUses,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
      });
      return { success: true };
    }),

  // Organizer: toggle active status
  toggle: protectedProcedure
    .input(z.object({ id: z.number(), isActive: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const discount = await db.select().from(discounts).where(eq(discounts.id, input.id)).limit(1);
      if (!discount[0]) throw new TRPCError({ code: "NOT_FOUND" });

      const membership = await db
        .select()
        .from(tenantMembers)
        .where(and(eq(tenantMembers.tenantId, discount[0].tenantId), eq(tenantMembers.userId, ctx.user.id)))
        .limit(1);
      if (!membership[0]) throw new TRPCError({ code: "FORBIDDEN" });

      await db.update(discounts).set({ isActive: input.isActive }).where(eq(discounts.id, input.id));
      return { success: true };
    }),

  // Public: validate a discount code at checkout
  validate: publicProcedure
    .input(
      z.object({
        code: z.string(),
        tenantId: z.number(),
        eventId: z.number().optional(),
        amount: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const now = new Date();
      const results = await db
        .select()
        .from(discounts)
        .where(
          and(
            eq(discounts.code, input.code.toUpperCase()),
            eq(discounts.tenantId, input.tenantId),
            eq(discounts.isActive, true)
          )
        )
        .limit(1);

      const discount = results[0];
      if (!discount) {
        return { valid: false, message: "無効な割引コードです" };
      }
      if (discount.expiresAt && discount.expiresAt < now) {
        return { valid: false, message: "この割引コードは期限切れです" };
      }
      if (discount.maxUses !== null && discount.usedCount >= discount.maxUses) {
        return { valid: false, message: "この割引コードは使用回数の上限に達しました" };
      }
      if (discount.eventId && input.eventId && discount.eventId !== input.eventId) {
        return { valid: false, message: "このイベントには使用できない割引コードです" };
      }

      let discountAmount = 0;
      if (discount.discountType === "percentage") {
        discountAmount = Math.floor((input.amount * discount.discountValue) / 100);
      } else {
        discountAmount = Math.min(discount.discountValue, input.amount);
      }

      return {
        valid: true,
        discountId: discount.id,
        discountAmount,
        discountType: discount.discountType,
        discountValue: discount.discountValue,
        finalAmount: input.amount - discountAmount,
        message: `${discount.discountType === "percentage" ? `${discount.discountValue}%` : `¥${discount.discountValue.toLocaleString()}`}割引が適用されます`,
      };
    }),
});
