import { ENV } from "../_core/env";
/**
 * payout.ts — 精算管理ルーター
 * 主催者向け：振込先口座管理・精算申請
 * 管理者向け：精算承認・振込処理・一覧管理
 */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, desc, sql } from "drizzle-orm";
import { getDb } from "../db";
import {
  bankAccounts,
  payoutRequests,
  events,
  orders,
  orderItems,
  tickets,
  tenantMembers,
} from "../schema";
import { protectedProcedure, router } from "../_core/trpc";

// ─── 管理者チェックミドルウェア ───────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "管理者権限が必要です" });
  }
  return next({ ctx });
});

// ─── テナントメンバーチェック ─────────────────────────────────────────────────
async function assertTenantMember(userId: number, tenantId: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB接続エラー" });
  const member = await db
    .select()
    .from(tenantMembers)
    .where(and(eq(tenantMembers.userId, userId), eq(tenantMembers.tenantId, tenantId)))
    .limit(1);
  if (!member.length) {
    throw new TRPCError({ code: "FORBIDDEN", message: "このテナントへのアクセス権がありません" });
  }
}

// ─── 手数料計算ヘルパー ───────────────────────────────────────────────────────
function calcFees(grossAmount: number) {
  const platformFee = Math.floor(grossAmount * 0.05);   // プラットフォーム手数料 5%
  const paymentFee = Math.floor(grossAmount * 0.036);   // Stripe決済手数料 3.6%
  const netAmount = grossAmount - platformFee - paymentFee;
  return { platformFee, paymentFee, netAmount };
}

export const payoutRouter = router({
  // ─── 振込先口座 ─────────────────────────────────────────────────────────────

  /** 振込先口座一覧取得 */
  listBankAccounts: protectedProcedure
    .input(z.object({ tenantId: z.number() }))
    .query(async ({ ctx, input }) => {
      await assertTenantMember(ctx.user.id, input.tenantId);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB接続エラー" });
      return db
        .select()
        .from(bankAccounts)
        .where(eq(bankAccounts.tenantId, input.tenantId))
        .orderBy(desc(bankAccounts.isDefault), desc(bankAccounts.createdAt));
    }),

  /** 振込先口座登録 */
  createBankAccount: protectedProcedure
    .input(
      z.object({
        tenantId: z.number(),
        bankName: z.string().min(1).max(100),
        bankCode: z.string().max(10).optional(),
        branchName: z.string().min(1).max(100),
        branchCode: z.string().max(10).optional(),
        accountType: z.enum(["ordinary", "checking"]).default("ordinary"),
        accountNumber: z.string().min(1).max(20),
        accountHolder: z.string().min(1).max(100),
        isDefault: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertTenantMember(ctx.user.id, input.tenantId);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB接続エラー" });
      const { tenantId, ...rest } = input;

      if (rest.isDefault) {
        await db
          .update(bankAccounts)
          .set({ isDefault: false })
          .where(eq(bankAccounts.tenantId, tenantId));
      }

      const [result] = await db.insert(bankAccounts).values({ tenantId, ...rest });
      return { id: (result as any).insertId };
    }),

  /** 振込先口座削除 */
  deleteBankAccount: protectedProcedure
    .input(z.object({ id: z.number(), tenantId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await assertTenantMember(ctx.user.id, input.tenantId);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB接続エラー" });

      const inUse = await db
        .select({ id: payoutRequests.id })
        .from(payoutRequests)
        .where(
          and(
            eq(payoutRequests.bankAccountId, input.id),
            sql`${payoutRequests.status} IN ('pending', 'approved')`
          )
        )
        .limit(1);
      if (inUse.length) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "精算申請中の口座は削除できません" });
      }
      await db
        .delete(bankAccounts)
        .where(and(eq(bankAccounts.id, input.id), eq(bankAccounts.tenantId, input.tenantId)));
      return { success: true };
    }),

  // ─── 精算申請 ────────────────────────────────────────────────────────────────

  /** イベントの精算可能な売上情報を取得 */
  getEventPayoutSummary: protectedProcedure
    .input(z.object({ eventId: z.number(), tenantId: z.number() }))
    .query(async ({ ctx, input }) => {
      await assertTenantMember(ctx.user.id, input.tenantId);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB接続エラー" });

      const [event] = await db
        .select()
        .from(events)
        .where(and(eq(events.id, input.eventId), eq(events.tenantId, input.tenantId)))
        .limit(1);

      if (!event) throw new TRPCError({ code: "NOT_FOUND", message: "イベントが見つかりません" });

      const now = new Date();
      const eventEnded = event.endDatetime ? new Date(event.endDatetime) < now : false;

      const salesRows = await db
        .select({
          totalAmount: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
          totalTickets: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)`,
        })
        .from(orders)
        .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
        .innerJoin(tickets, eq(orderItems.ticketId, tickets.id))
        .where(and(eq(tickets.eventId, input.eventId), sql`${orders.status} = 'paid'`));

      const grossAmount = Number(salesRows[0]?.totalAmount ?? 0);
      const totalTickets = Number(salesRows[0]?.totalTickets ?? 0);
      const { platformFee, paymentFee, netAmount } = calcFees(grossAmount);

      const existingPayout = await db
        .select()
        .from(payoutRequests)
        .where(
          and(
            eq(payoutRequests.eventId, input.eventId),
            eq(payoutRequests.tenantId, input.tenantId),
            sql`${payoutRequests.status} NOT IN ('rejected', 'cancelled')`
          )
        )
        .limit(1);

      return {
        event: {
          id: event.id,
          title: event.title,
          endDatetime: event.endDatetime,
          status: event.status,
        },
        eventEnded,
        grossAmount,
        platformFee,
        paymentFee,
        netAmount,
        totalTickets,
        existingPayout: existingPayout[0] ?? null,
        canApply: eventEnded && grossAmount > 0 && !existingPayout.length,
      };
    }),

  /** 精算申請一覧（主催者） */
  listMyPayouts: protectedProcedure
    .input(z.object({ tenantId: z.number() }))
    .query(async ({ ctx, input }) => {
      await assertTenantMember(ctx.user.id, input.tenantId);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB接続エラー" });

      return db
        .select({
          payout: payoutRequests,
          event: { id: events.id, title: events.title, endDatetime: events.endDatetime },
          bankAccount: {
            id: bankAccounts.id,
            bankName: bankAccounts.bankName,
            branchName: bankAccounts.branchName,
            accountNumber: bankAccounts.accountNumber,
            accountHolder: bankAccounts.accountHolder,
          },
        })
        .from(payoutRequests)
        .innerJoin(events, eq(payoutRequests.eventId, events.id))
        .innerJoin(bankAccounts, eq(payoutRequests.bankAccountId, bankAccounts.id))
        .where(eq(payoutRequests.tenantId, input.tenantId))
        .orderBy(desc(payoutRequests.createdAt));
    }),

  /** 精算申請を作成 */
  createPayoutRequest: protectedProcedure
    .input(
      z.object({
        tenantId: z.number(),
        eventId: z.number(),
        bankAccountId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertTenantMember(ctx.user.id, input.tenantId);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB接続エラー" });

      const [event] = await db
        .select()
        .from(events)
        .where(and(eq(events.id, input.eventId), eq(events.tenantId, input.tenantId)))
        .limit(1);

      if (!event) throw new TRPCError({ code: "NOT_FOUND", message: "イベントが見つかりません" });

      const now = new Date();
      if (!event.endDatetime || new Date(event.endDatetime) >= now) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "イベント終了後に精算申請が可能です" });
      }

      const existing = await db
        .select({ id: payoutRequests.id })
        .from(payoutRequests)
        .where(
          and(
            eq(payoutRequests.eventId, input.eventId),
            eq(payoutRequests.tenantId, input.tenantId),
            sql`${payoutRequests.status} NOT IN ('rejected', 'cancelled')`
          )
        )
        .limit(1);

      if (existing.length) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "このイベントの精算申請は既に存在します" });
      }

      const [bankAccount] = await db
        .select()
        .from(bankAccounts)
        .where(and(eq(bankAccounts.id, input.bankAccountId), eq(bankAccounts.tenantId, input.tenantId)))
        .limit(1);

      if (!bankAccount) throw new TRPCError({ code: "NOT_FOUND", message: "振込先口座が見つかりません" });

      const salesRows = await db
        .select({ totalAmount: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)` })
        .from(orders)
        .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
        .innerJoin(tickets, eq(orderItems.ticketId, tickets.id))
        .where(and(eq(tickets.eventId, input.eventId), sql`${orders.status} = 'paid'`));

      const grossAmount = Number(salesRows[0]?.totalAmount ?? 0);
      if (grossAmount <= 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "精算可能な売上がありません" });
      }

      const { platformFee, paymentFee, netAmount } = calcFees(grossAmount);

      const [result] = await db.insert(payoutRequests).values({
        tenantId: input.tenantId,
        eventId: input.eventId,
        bankAccountId: input.bankAccountId,
        requestedBy: ctx.user.id,
        grossAmount,
        platformFee,
        paymentFee,
        netAmount,
        status: "pending",
      });

      return { id: (result as any).insertId, netAmount };
    }),

  /** 精算申請をキャンセル（主催者） */
  cancelPayoutRequest: protectedProcedure
    .input(z.object({ id: z.number(), tenantId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await assertTenantMember(ctx.user.id, input.tenantId);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB接続エラー" });

      const [payout] = await db
        .select()
        .from(payoutRequests)
        .where(and(eq(payoutRequests.id, input.id), eq(payoutRequests.tenantId, input.tenantId)))
        .limit(1);

      if (!payout) throw new TRPCError({ code: "NOT_FOUND", message: "精算申請が見つかりません" });
      if (payout.status !== "pending") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "申請中の精算のみキャンセルできます" });
      }

      await db
        .update(payoutRequests)
        .set({ status: "cancelled" })
        .where(eq(payoutRequests.id, input.id));

      return { success: true };
    }),

  // ─── 管理者向け ──────────────────────────────────────────────────────────────

  /** 精算申請一覧（管理者） */
  adminListPayouts: adminProcedure
    .input(
      z.object({
        status: z
          .enum(["pending", "approved", "transferred", "rejected", "cancelled", "all"])
          .default("all"),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB接続エラー" });

      const conditions =
        input.status === "all"
          ? undefined
          : eq(payoutRequests.status, input.status as any);

      return db
        .select({
          payout: payoutRequests,
          event: { id: events.id, title: events.title, endDatetime: events.endDatetime },
          bankAccount: {
            id: bankAccounts.id,
            bankName: bankAccounts.bankName,
            branchName: bankAccounts.branchName,
            accountNumber: bankAccounts.accountNumber,
            accountHolder: bankAccounts.accountHolder,
          },
        })
        .from(payoutRequests)
        .innerJoin(events, eq(payoutRequests.eventId, events.id))
        .innerJoin(bankAccounts, eq(payoutRequests.bankAccountId, bankAccounts.id))
        .where(conditions)
        .orderBy(desc(payoutRequests.createdAt))
        .limit(input.limit)
        .offset(input.offset);
    }),

  /** 精算申請を承認（管理者） */
  adminApprovePayout: adminProcedure
    .input(z.object({ id: z.number(), reviewNote: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB接続エラー" });

      const [payout] = await db
        .select()
        .from(payoutRequests)
        .where(eq(payoutRequests.id, input.id))
        .limit(1);

      if (!payout) throw new TRPCError({ code: "NOT_FOUND", message: "精算申請が見つかりません" });
      if (payout.status !== "pending") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "申請中の精算のみ承認できます" });
      }

      await db
        .update(payoutRequests)
        .set({ status: "approved", reviewedBy: ctx.user.id, reviewedAt: new Date(), reviewNote: input.reviewNote ?? null })
        .where(eq(payoutRequests.id, input.id));

      return { success: true };
    }),

  /** 精算申請を却下（管理者） */
  adminRejectPayout: adminProcedure
    .input(z.object({ id: z.number(), reviewNote: z.string().min(1, "却下理由を入力してください") }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB接続エラー" });

      const [payout] = await db
        .select()
        .from(payoutRequests)
        .where(eq(payoutRequests.id, input.id))
        .limit(1);

      if (!payout) throw new TRPCError({ code: "NOT_FOUND", message: "精算申請が見つかりません" });
      if (!["pending", "approved"].includes(payout.status)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "申請中または承認済みの精算のみ却下できます" });
      }

      await db
        .update(payoutRequests)
        .set({ status: "rejected", reviewedBy: ctx.user.id, reviewedAt: new Date(), reviewNote: input.reviewNote })
        .where(eq(payoutRequests.id, input.id));

      return { success: true };
    }),

  /** 振込完了を記録（管理者） */
  adminMarkTransferred: adminProcedure
    .input(z.object({ id: z.number(), transferNote: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB接続エラー" });

      const [payout] = await db
        .select()
        .from(payoutRequests)
        .where(eq(payoutRequests.id, input.id))
        .limit(1);

      if (!payout) throw new TRPCError({ code: "NOT_FOUND", message: "精算申請が見つかりません" });
      if (payout.status !== "approved") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "承認済みの精算のみ振込完了にできます" });
      }

      await db
        .update(payoutRequests)
        .set({ status: "transferred", transferredAt: new Date(), transferNote: input.transferNote ?? null })
        .where(eq(payoutRequests.id, input.id));

      return { success: true };
    }),
});
