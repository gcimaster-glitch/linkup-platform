import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { announcements } from "../schema";
import { eq, and, gte, isNull, or, desc, like, sql } from "drizzle-orm";

export const announcementRouter = router({
  // Public: list published, non-expired announcements
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(5),
        offset: z.number().min(0).default(0),
        type: z.enum(["info", "warning", "success", "event"]).optional(),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { items: [], total: 0 };
      const limit = input?.limit ?? 5;
      const offset = input?.offset ?? 0;
      const now = new Date();
      const baseWhere = and(
        eq(announcements.isPublished, true),
        or(isNull(announcements.expiresAt), gte(announcements.expiresAt, now)),
        input?.type ? eq(announcements.type, input.type) : undefined,
        input?.search ? like(announcements.title, `%${input.search}%`) : undefined
      );
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(announcements)
        .where(baseWhere);
      const rows = await db
        .select()
        .from(announcements)
        .where(baseWhere)
        .orderBy(desc(announcements.publishedAt))
        .limit(limit)
        .offset(offset);
      return { items: rows, total: Number(count) };
    }),

  // Public: get single published announcement by id
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [row] = await db
        .select()
        .from(announcements)
        .where(eq(announcements.id, input.id))
        .limit(1);
      if (!row || !row.isPublished) throw new TRPCError({ code: "NOT_FOUND" });
      return row;
    }),

  // Admin: get single announcement by id (including drafts) for preview
  getByIdPreview: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [row] = await db
        .select()
        .from(announcements)
        .where(eq(announcements.id, input.id))
        .limit(1);
      if (!row) throw new TRPCError({ code: "NOT_FOUND" });
      return row;
    }),

  // Admin: list all announcements
  adminList: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
    const db = await getDb();
    if (!db) return [];
    const rows = await db
      .select()
      .from(announcements)
      .orderBy(desc(announcements.createdAt));
    return rows;
  }),

  // Admin: create announcement
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        content: z.string().min(1),
        type: z.enum(["info", "warning", "success", "event"]).default("info"),
        isPublished: z.boolean().default(false),
        publishedAt: z.string().optional(),
        expiresAt: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [result] = await db.insert(announcements).values({
        title: input.title,
        content: input.content,
        type: input.type,
        isPublished: input.isPublished,
        publishedAt: input.publishedAt
          ? new Date(input.publishedAt)
          : input.isPublished
          ? new Date()
          : null,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        createdBy: ctx.user.id,
      });
      return { id: (result as any).insertId };
    }),

  // Admin: update announcement
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        content: z.string().min(1).optional(),
        type: z.enum(["info", "warning", "success", "event"]).optional(),
        isPublished: z.boolean().optional(),
        publishedAt: z.string().nullable().optional(),
        expiresAt: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { id, publishedAt, expiresAt, ...rest } = input;
      const updateData: Record<string, unknown> = { ...rest };
      if (publishedAt !== undefined)
        updateData.publishedAt = publishedAt ? new Date(publishedAt) : null;
      if (expiresAt !== undefined)
        updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
      if (rest.isPublished === true && !publishedAt)
        updateData.publishedAt = new Date();
      await db
        .update(announcements)
        .set(updateData)
        .where(eq(announcements.id, id));
      return { success: true };
    }),

  // Admin: delete announcement
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(announcements).where(eq(announcements.id, input.id));
      return { success: true };
    }),
});
