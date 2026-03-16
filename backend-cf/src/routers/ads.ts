import { and, eq, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";
import { ads } from "../schema";
import { getDb } from "../db";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";

const adminCheck = (role: string) => {
  if (role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "権限がありません" });
};

export const adsRouter = router({
  // 有効な広告を取得（公開）
  active: publicProcedure
    .input(
      z.object({
        placement: z.enum(["list_banner", "detail_sidebar", "checkout"]),
        category: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const now = new Date();
      const conditions = [
        eq(ads.isActive, true),
        eq(ads.placement, input.placement),
        lte(ads.startsAt, now),
        gte(ads.endsAt, now),
      ];
      if (input.category) {
        conditions.push(
          sql`(${ads.targetCategory} IS NULL OR ${ads.targetCategory} = ${input.category})` as any
        );
      }
      return db
        .select()
        .from(ads)
        .where(and(...conditions))
        .limit(3);
    }),

  // インプレッション記録
  impression: publicProcedure
    .input(z.object({ adId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return;
      await db
        .update(ads)
        .set({ impressions: sql`${ads.impressions} + 1` })
        .where(eq(ads.id, input.adId));
    }),

  // クリック記録
  click: publicProcedure
    .input(z.object({ adId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return;
      await db
        .update(ads)
        .set({ clicks: sql`${ads.clicks} + 1` })
        .where(eq(ads.id, input.adId));
    }),

  // 管理者: 広告一覧（統計含む）
  adminList: protectedProcedure.query(async ({ ctx }) => {
    adminCheck(ctx.user.role);
    const db = await getDb();
    if (!db) return [];
    return db.select().from(ads).orderBy(ads.createdAt);
  }),

  // 管理者: 広告作成
  adminCreate: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        imageUrl: z.string().url(),
        linkUrl: z.string().url(),
        targetCategory: z.string().optional().nullable(),
        placement: z.enum(["list_banner", "detail_sidebar", "checkout"]),
        startsAt: z.string(),
        endsAt: z.string(),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      adminCheck(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [result] = await db.insert(ads).values({
        title: input.title,
        imageUrl: input.imageUrl,
        linkUrl: input.linkUrl,
        targetCategory: input.targetCategory ?? null,
        placement: input.placement,
        startsAt: new Date(input.startsAt),
        endsAt: new Date(input.endsAt),
        isActive: input.isActive,
      });
      return { success: true, id: (result as any).insertId };
    }),

  // 管理者: 広告更新
  adminUpdate: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(255),
        imageUrl: z.string().url(),
        linkUrl: z.string().url(),
        targetCategory: z.string().optional().nullable(),
        placement: z.enum(["list_banner", "detail_sidebar", "checkout"]),
        startsAt: z.string(),
        endsAt: z.string(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      adminCheck(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db
        .update(ads)
        .set({
          title: input.title,
          imageUrl: input.imageUrl,
          linkUrl: input.linkUrl,
          targetCategory: input.targetCategory ?? null,
          placement: input.placement,
          startsAt: new Date(input.startsAt),
          endsAt: new Date(input.endsAt),
          isActive: input.isActive,
        })
        .where(eq(ads.id, input.id));
      return { success: true };
    }),

  // 管理者: 広告削除
  adminDelete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      adminCheck(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(ads).where(eq(ads.id, input.id));
      return { success: true };
    }),

  // 管理者: 広告有効/無効切り替え
  adminToggle: protectedProcedure
    .input(z.object({ id: z.number(), isActive: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      adminCheck(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(ads).set({ isActive: input.isActive }).where(eq(ads.id, input.id));
      return { success: true };
    }),

  // 管理者: 統計サマリー
  adminStats: protectedProcedure.query(async ({ ctx }) => {
    adminCheck(ctx.user.role);
    const db = await getDb();
    if (!db) return { totalAds: 0, activeAds: 0, totalImpressions: 0, totalClicks: 0, avgCtr: 0 };
    const all = await db.select().from(ads);
    const totalImpressions = all.reduce((s, a) => s + (a.impressions ?? 0), 0);
    const totalClicks = all.reduce((s, a) => s + (a.clicks ?? 0), 0);
    return {
      totalAds: all.length,
      activeAds: all.filter((a) => a.isActive).length,
      totalImpressions,
      totalClicks,
      avgCtr: totalImpressions > 0 ? Math.round((totalClicks / totalImpressions) * 10000) / 100 : 0,
    };
  }),
});
