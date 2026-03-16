import { ENV } from "../_core/env";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createSeatMap,
  createSeatOptionPlan,
  createSeatReservation,
  deleteSeatMap,
  expirePendingReservations,
  getActiveSeatOptionPlan,
  getEventById,
  getSeatById,
  getSeatMapById,
  getSeatMapsByEvent,
  getSeatReservationBySeat,
  getSeatReservationByUserAndEvent,
  getSeatReservationsByOrder,
  getSeatsBySeatMap,
  getSeatsByEvent,
  getTenantByOwnerId,
  updateSeatMap,
  updateSeatReservation,
  updateSeatStatus,
  createSeatsForMap,
  updateSeatMapAnalyzeStatus,
  replaceVisualSeats,
  getVisualSeatMapById,
  getVisualSeatMapsByEvent,
} from "../db";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { storagePut } from "../storage";
import { analyzeSeatImageWithLLM } from "../seatAnalysis";
// 指定席オプション料金（1イベントあたり）
const SEAT_OPTION_PRICE_JPY = 1000; // ¥1,000/イベント

export const seatRouter = router({
  // ─── 主催者向け：座席マップ一覧取得 ──────────────────────────────────────
  getByEvent: publicProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ input }) => {
      const maps = await getSeatMapsByEvent(input.eventId);
      const result = await Promise.all(
        maps.map(async (map) => {
          const seatList = await getSeatsBySeatMap(map.id);
          return { ...map, seats: seatList };
        })
      );
      return result;
    }),

  // ─── 公開：座席状態取得（購入者が座席を選ぶ際に使用） ───────────────────
  getSeatStatus: publicProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ input }) => {
      await expirePendingReservations();
      const maps = await getSeatMapsByEvent(input.eventId);
      const result = await Promise.all(
        maps.map(async (map) => {
          const seatList = await getSeatsBySeatMap(map.id);
          return { ...map, seats: seatList };
        })
      );
      return result;
    }),

  // ─── 主催者向け：座席マップ作成 ──────────────────────────────────────────
  createMap: protectedProcedure
    .input(
      z.object({
        eventId: z.number(),
        ticketId: z.number(),
        name: z.string().min(1).max(255),
        rows: z.number().int().min(1).max(50),
        cols: z.number().int().min(1).max(50),
        rowLabel: z.string().default("A"),
        colStartNumber: z.number().int().default(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // イベントの所有者確認
      const event = await getEventById(input.eventId);
      if (!event) throw new TRPCError({ code: "NOT_FOUND", message: "イベントが見つかりません" });

      const tenant = await getTenantByOwnerId(ctx.user.id);
      if (!tenant || tenant.id !== event.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "このイベントの編集権限がありません" });
      }

      // 指定席オプションが有効か確認
      const plan = await getActiveSeatOptionPlan(tenant.id, input.eventId);
      if (!plan) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "指定席オプションが有効ではありません。先にオプションを購入してください。",
        });
      }

      const seatMapId = await createSeatMap({
        eventId: input.eventId,
        ticketId: input.ticketId,
        name: input.name,
        rows: input.rows,
        cols: input.cols,
        rowLabel: input.rowLabel,
        colStartNumber: input.colStartNumber,
      });

      // 座席を自動生成
      const seatCount = await createSeatsForMap(
        seatMapId,
        input.eventId,
        input.rows,
        input.cols,
        input.rowLabel,
        input.colStartNumber
      );

      return { seatMapId, seatCount };
    }),

  // ─── 主催者向け：座席マップ更新 ──────────────────────────────────────────
  updateMap: protectedProcedure
    .input(
      z.object({
        seatMapId: z.number(),
        name: z.string().min(1).max(255).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const map = await getSeatMapById(input.seatMapId);
      if (!map) throw new TRPCError({ code: "NOT_FOUND" });

      const event = await getEventById(map.eventId);
      if (!event) throw new TRPCError({ code: "NOT_FOUND" });

      const tenant = await getTenantByOwnerId(ctx.user.id);
      if (!tenant || tenant.id !== event.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await updateSeatMap(input.seatMapId, {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      });

      return { success: true };
    }),

  // ─── 主催者向け：座席マップ削除 ──────────────────────────────────────────
  deleteMap: protectedProcedure
    .input(z.object({ seatMapId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const map = await getSeatMapById(input.seatMapId);
      if (!map) throw new TRPCError({ code: "NOT_FOUND" });

      const event = await getEventById(map.eventId);
      if (!event) throw new TRPCError({ code: "NOT_FOUND" });

      const tenant = await getTenantByOwnerId(ctx.user.id);
      if (!tenant || tenant.id !== event.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await deleteSeatMap(input.seatMapId);
      return { success: true };
    }),

  // ─── 購入者向け：座席仮押さえ ─────────────────────────────────────────────
  reserveSeat: protectedProcedure
    .input(
      z.object({
        seatId: z.number(),
        eventId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await expirePendingReservations();

      // 既に予約済みか確認
      const existing = await getSeatReservationByUserAndEvent(ctx.user.id, input.eventId);
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "このイベントには既に座席が予約されています。先に現在の予約をキャンセルしてください。",
        });
      }

      // 座席の状態確認
      const seat = await getSeatById(input.seatId);
      if (!seat) throw new TRPCError({ code: "NOT_FOUND", message: "座席が見つかりません" });
      if (seat.status !== "available") {
        throw new TRPCError({ code: "CONFLICT", message: "この座席はすでに選択されています" });
      }

      // 座席を仮押さえ
      await updateSeatStatus(input.seatId, "reserved");

      // 15分の有効期限で予約レコード作成
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      const reservationId = await createSeatReservation({
        seatId: input.seatId,
        eventId: input.eventId,
        userId: ctx.user.id,
        status: "pending",
        expiresAt,
      });

      return { reservationId, seatNumber: seat.seatNumber, expiresAt };
    }),

  // ─── 購入者向け：座席仮押さえ解除 ───────────────────────────────────────
  cancelReservation: protectedProcedure
    .input(z.object({ eventId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const reservation = await getSeatReservationByUserAndEvent(ctx.user.id, input.eventId);
      if (!reservation) return { success: true };

      await updateSeatReservation(reservation.id, { status: "cancelled" });
      await updateSeatStatus(reservation.seatId, "available");

      return { success: true };
    }),

  // ─── 購入者向け：自分の座席予約確認 ─────────────────────────────────────
  getMyReservation: protectedProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ input, ctx }) => {
      await expirePendingReservations();
      const reservation = await getSeatReservationByUserAndEvent(ctx.user.id, input.eventId);
      if (!reservation) return null;

      const seat = await getSeatById(reservation.seatId);
      return { ...reservation, seat };
    }),

  // ─── 注文確定時に座席予約を確定 ──────────────────────────────────────────
  confirmReservation: protectedProcedure
    .input(z.object({ eventId: z.number(), orderId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const reservation = await getSeatReservationByUserAndEvent(ctx.user.id, input.eventId);
      if (!reservation) return { success: false };

      await updateSeatReservation(reservation.id, {
        status: "confirmed",
        orderId: input.orderId,
      });
      await updateSeatStatus(reservation.seatId, "sold");

      return { success: true };
    }),

  // ─── チェックイン時の座席消込 ────────────────────────────────────────────
  checkinSeat: protectedProcedure
    .input(z.object({ seatId: z.number(), attendeeId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const tenant = await getTenantByOwnerId(ctx.user.id);
      if (!tenant) throw new TRPCError({ code: "FORBIDDEN" });

      const reservation = await getSeatReservationBySeat(input.seatId);
      if (!reservation) throw new TRPCError({ code: "NOT_FOUND", message: "座席予約が見つかりません" });

      await updateSeatReservation(reservation.id, {
        status: "checked_in",
        attendeeId: input.attendeeId,
        checkedInAt: new Date(),
      });

      const seat = await getSeatById(input.seatId);
      return { success: true, seatNumber: seat?.seatNumber };
    }),

  // ─── 注文に紐づく座席情報取得 ────────────────────────────────────────────
  getByOrder: protectedProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async ({ input, ctx }) => {
      const reservations = await getSeatReservationsByOrder(input.orderId);
      return reservations;
    }),

  // ─── 指定席オプション購入（Stripe Checkout） ─────────────────────────────
  purchaseOption: protectedProcedure
    .input(
      z.object({
        eventId: z.number(),
        origin: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const tenant = await getTenantByOwnerId(ctx.user.id);
      if (!tenant) throw new TRPCError({ code: "FORBIDDEN", message: "テナントが見つかりません" });

      const event = await getEventById(input.eventId);
      if (!event) throw new TRPCError({ code: "NOT_FOUND" });
      if (event.tenantId !== tenant.id) throw new TRPCError({ code: "FORBIDDEN" });

      // 既に有効なプランがあるか確認
      const existing = await getActiveSeatOptionPlan(tenant.id, input.eventId);
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "このイベントには既に指定席オプションが有効です" });
      }

      // Stripe Checkout セッション作成
      const stripeSecretKey = ENV.stripeSecretKey;
      if (!stripeSecretKey) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe未設定" });
      const StripeLib = (await import("stripe")).default;
      const stripe = new StripeLib(stripeSecretKey);
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "jpy",
              product_data: {
                name: `指定席オプション - ${event.title}`,
                description: "イベントに指定席機能を追加します（1イベントあたり）",
              },
              unit_amount: SEAT_OPTION_PRICE_JPY,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${input.origin}/organizer/events/${input.eventId}/seats?seat_option=success`,
        cancel_url: `${input.origin}/organizer/events/${input.eventId}/seats?seat_option=cancelled`,
        client_reference_id: ctx.user.id.toString(),
        metadata: {
          type: "seat_option",
          tenant_id: tenant.id.toString(),
          event_id: input.eventId.toString(),
          user_id: ctx.user.id.toString(),
        },
        allow_promotion_codes: true,
      });

      return { checkoutUrl: session.url };
    }),

  //  // ─── 指定席オプション有効確認 ────────────────────────────────────────────
  checkOption: protectedProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ input, ctx }) => {
      const tenant = await getTenantByOwnerId(ctx.user.id);
      if (!tenant) return { hasOption: false };
      const plan = await getActiveSeatOptionPlan(tenant.id, input.eventId);
      return { hasOption: !!plan, plan: plan ?? null };
    }),
  // ─── Webhook後の指定席オプション有効化（内部用） ─────────────────────────
  activateOption: protectedProcedure
    .input(
      z.object({
        tenantId: z.number(),
        eventId: z.number(),
        stripePaymentIntentId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      await createSeatOptionPlan({
        tenantId: input.tenantId,
        eventId: input.eventId,
        planType: "per_event",
        stripePaymentIntentId: input.stripePaymentIntentId,
        status: "active",
      });
      return { success: true };
    }),

  // ─── ビジュアル型座席マップ一覧取得 ─────────────────────────────────────
  getVisualByEvent: protectedProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ input, ctx }) => {
      const tenant = await getTenantByOwnerId(ctx.user.id);
      if (!tenant) throw new TRPCError({ code: "FORBIDDEN" });
      const maps = await getVisualSeatMapsByEvent(input.eventId);
      const result = await Promise.all(
        maps.map(async (map) => {
          const seatList = await getSeatsBySeatMap(map.id);
          return { ...map, seats: seatList };
        })
      );
      return result;
    }),

  // ─── ビジュアル型座席マップ作成（空マップ） ─────────────────────────────
  createVisualMap: protectedProcedure
    .input(
      z.object({
        eventId: z.number(),
        ticketId: z.number(),
        name: z.string().min(1).max(100),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const tenant = await getTenantByOwnerId(ctx.user.id);
      if (!tenant) throw new TRPCError({ code: "FORBIDDEN" });
      const event = await getEventById(input.eventId);
      if (!event || event.tenantId !== tenant.id) throw new TRPCError({ code: "FORBIDDEN" });
      const mapId = await createSeatMap({
        eventId: input.eventId,
        ticketId: input.ticketId,
        name: input.name,
        rows: 0,
        cols: 0,
        rowLabel: "A",
        colStartNumber: 1,
        mapType: "visual",
        analyzeStatus: "none",
      });
      return { mapId };
    }),

  // ─── 画像アップロード → LLM Vision解析 ──────────────────────────────────
  analyzeImage: protectedProcedure
    .input(
      z.object({
        seatMapId: z.number(),
        imageBase64: z.string(), // base64エンコードされた画像データ
        mimeType: z.string().default("image/png"),
        originalWidth: z.number().int().positive(),
        originalHeight: z.number().int().positive(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const tenant = await getTenantByOwnerId(ctx.user.id);
      if (!tenant) throw new TRPCError({ code: "FORBIDDEN" });
      const seatMap = await getVisualSeatMapById(input.seatMapId);
      if (!seatMap) throw new TRPCError({ code: "NOT_FOUND" });
      // ステータスをprocessingに更新
      await updateSeatMapAnalyzeStatus(input.seatMapId, "processing");
      try {
        // base64 → Buffer
        const imageBuffer = Buffer.from(input.imageBase64, "base64");
        // S3にアップロード
        const s3Key = `seat-maps/${input.seatMapId}/source-${Date.now()}.png`;
        const { url: imageUrl } = await storagePut(s3Key, imageBuffer, input.mimeType);
        // LLM Vision解析
        const result = await analyzeSeatImageWithLLM(
          imageBuffer,
          input.originalWidth,
          input.originalHeight,
          input.seatMapId
        );
        // 解析結果をDBに保存
        await updateSeatMapAnalyzeStatus(input.seatMapId, "completed", {
          sourceImageUrl: imageUrl,
          svgWidth: result.svgWidth,
          svgHeight: result.svgHeight,
        });
        return {
          success: true,
          imageUrl,
          result,
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await updateSeatMapAnalyzeStatus(input.seatMapId, "failed", { analyzeError: msg });
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `解析失敗: ${msg}` });
      }
    }),

  // ─── 解析結果を確定して座席を保存 ────────────────────────────────────────
  saveVisualSeats: protectedProcedure
    .input(
      z.object({
        seatMapId: z.number(),
        seats: z.array(
          z.object({
            seatNumber: z.string(),
            row: z.string(),
            col: z.number().int(),
            posX: z.number(),
            posY: z.number(),
            shape: z.enum(["circle", "rect"]),
            sectionName: z.string().nullable().optional(),
            sectionColor: z.string().nullable().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const tenant = await getTenantByOwnerId(ctx.user.id);
      if (!tenant) throw new TRPCError({ code: "FORBIDDEN" });
      const seatMap = await getVisualSeatMapById(input.seatMapId);
      if (!seatMap) throw new TRPCError({ code: "NOT_FOUND" });
      const count = await replaceVisualSeats(
        input.seatMapId,
        seatMap.eventId,
        input.seats.map((s) => ({
          ...s,
          sectionName: s.sectionName ?? null,
          sectionColor: s.sectionColor ?? null,
        }))
      );
      return { success: true, count };
    }),

  // ─── ビジュアル型座席マップ詳細取得（座席付き） ─────────────────────────
  getVisualMapDetail: protectedProcedure
    .input(z.object({ seatMapId: z.number() }))
    .query(async ({ input, ctx }) => {
      const tenant = await getTenantByOwnerId(ctx.user.id);
      if (!tenant) throw new TRPCError({ code: "FORBIDDEN" });
      const seatMap = await getVisualSeatMapById(input.seatMapId);
      if (!seatMap) throw new TRPCError({ code: "NOT_FOUND" });
      const seatList = await getSeatsBySeatMap(input.seatMapId);
      return { ...seatMap, seats: seatList };
    }),
});
