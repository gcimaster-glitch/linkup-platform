import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq, and, sql, desc } from "drizzle-orm";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { affiliates, affiliateConversions, tenantMembers, events } from "../schema";
import { nanoid } from "nanoid";

export const affiliateRouter = router({
  // Organizer: list affiliate links for tenant
  list: protectedProcedure
    .input(z.object({ tenantId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const membership = await db
        .select()
        .from(tenantMembers)
        .where(and(eq(tenantMembers.tenantId, input.tenantId), eq(tenantMembers.userId, ctx.user.id)))
        .limit(1);
      if (!membership[0]) throw new TRPCError({ code: "FORBIDDEN" });
      return db.select().from(affiliates).where(eq(affiliates.tenantId, input.tenantId));
    }),

  // Organizer: create affiliate link
  create: protectedProcedure
    .input(
      z.object({
        tenantId: z.number(),
        eventId: z.number().optional(),
        commissionRate: z.number().min(0).max(1).default(0.05),
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

      const refCode = nanoid(10).toUpperCase();
      await db.insert(affiliates).values({
        tenantId: input.tenantId,
        eventId: input.eventId,
        userId: ctx.user.id,
        refCode,
        commissionRate: input.commissionRate.toFixed(4) as any,
      });
      return { refCode };
    }),

  // Public: track click (increment click count)
  trackClick: publicProcedure
    .input(z.object({ refCode: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db
        .update(affiliates)
        .set({ totalClicks: sql`${affiliates.totalClicks} + 1` })
        .where(eq(affiliates.refCode, input.refCode));
      return { success: true };
    }),

  // Organizer: list conversions for an affiliate link
  conversions: protectedProcedure
    .input(z.object({ affiliateId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const affiliate = await db
        .select()
        .from(affiliates)
        .where(eq(affiliates.id, input.affiliateId))
        .limit(1);
      if (!affiliate[0]) throw new TRPCError({ code: "NOT_FOUND" });

      const membership = await db
        .select()
        .from(tenantMembers)
        .where(and(eq(tenantMembers.tenantId, affiliate[0].tenantId), eq(tenantMembers.userId, ctx.user.id)))
        .limit(1);
      if (!membership[0]) throw new TRPCError({ code: "FORBIDDEN" });

      return db
        .select()
        .from(affiliateConversions)
        .where(eq(affiliateConversions.affiliateId, input.affiliateId));
    }),

  // Organizer: tenant-wide affiliate report (all links aggregated)
  tenantReport: protectedProcedure
    .input(z.object({ tenantId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { links: [], totalClicks: 0, totalConversions: 0, totalEarnings: 0 };

      const membership = await db
        .select()
        .from(tenantMembers)
        .where(and(eq(tenantMembers.tenantId, input.tenantId), eq(tenantMembers.userId, ctx.user.id)))
        .limit(1);
      if (!membership[0]) throw new TRPCError({ code: "FORBIDDEN" });

      const links = await db
        .select({
          id: affiliates.id,
          refCode: affiliates.refCode,
          eventId: affiliates.eventId,
          eventTitle: events.title,
          commissionRate: affiliates.commissionRate,
          totalClicks: affiliates.totalClicks,
          totalConversions: affiliates.totalConversions,
          totalEarnings: affiliates.totalEarnings,
          isActive: affiliates.isActive,
          createdAt: affiliates.createdAt,
        })
        .from(affiliates)
        .leftJoin(events, eq(affiliates.eventId, events.id))
        .where(eq(affiliates.tenantId, input.tenantId))
        .orderBy(desc(affiliates.totalEarnings));

      const totals = links.reduce(
        (acc, l) => ({
          totalClicks: acc.totalClicks + (l.totalClicks ?? 0),
          totalConversions: acc.totalConversions + (l.totalConversions ?? 0),
          totalEarnings: acc.totalEarnings + (l.totalEarnings ?? 0),
        }),
        { totalClicks: 0, totalConversions: 0, totalEarnings: 0 }
      );

      return { links, ...totals };
    }),

  // Organizer: per-link detailed report with daily conversion history
  linkReport: protectedProcedure
    .input(z.object({ affiliateId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { affiliate: null, conversions: [], dailyStats: [] };

      // アフィリエイトリンク取得
      const [aff] = await db
        .select({ tenantId: affiliates.tenantId })
        .from(affiliates)
        .where(eq(affiliates.id, input.affiliateId))
        .limit(1);
      if (!aff) throw new TRPCError({ code: "NOT_FOUND" });

      // 権限確認
      const [mem] = await db
        .select()
        .from(tenantMembers)
        .where(and(eq(tenantMembers.tenantId, aff.tenantId), eq(tenantMembers.userId, ctx.user.id)))
        .limit(1);
      if (!mem) throw new TRPCError({ code: "FORBIDDEN" });

      // アフィリエイト詳細（イベント名JOIN）
      const [affiliate] = await db
        .select({
          id: affiliates.id,
          refCode: affiliates.refCode,
          eventId: affiliates.eventId,
          eventTitle: events.title,
          commissionRate: affiliates.commissionRate,
          totalClicks: affiliates.totalClicks,
          totalConversions: affiliates.totalConversions,
          totalEarnings: affiliates.totalEarnings,
          isActive: affiliates.isActive,
          createdAt: affiliates.createdAt,
        })
        .from(affiliates)
        .leftJoin(events, eq(affiliates.eventId, events.id))
        .where(eq(affiliates.id, input.affiliateId))
        .limit(1);

      // コンバージョン一覧（最新30件）
      const conversions = await db
        .select()
        .from(affiliateConversions)
        .where(eq(affiliateConversions.affiliateId, input.affiliateId))
        .orderBy(desc(affiliateConversions.createdAt))
        .limit(30);

      // 日別コンバージョン集計（過去30日）
      const dailyStats = await db
        .select({
          date: sql<string>`DATE(${affiliateConversions.createdAt})`,
          conversions: sql<number>`COUNT(${affiliateConversions.id})`,
          earnings: sql<number>`COALESCE(SUM(${affiliateConversions.commission}), 0)`,
        })
        .from(affiliateConversions)
        .where(
          and(
            eq(affiliateConversions.affiliateId, input.affiliateId),
            sql`${affiliateConversions.createdAt} >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
          )
        )
        .groupBy(sql`DATE(${affiliateConversions.createdAt})`)
        .orderBy(sql`DATE(${affiliateConversions.createdAt}) ASC`);

      return { affiliate, conversions, dailyStats };
    }),
});
