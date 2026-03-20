import { TRPCError } from "@trpc/server";
import { createHash, randomBytes } from "crypto";
import { z } from "zod";
import {
  addToWaitlist,
  createAttendee,
  createGuestOrder,
  createOrder,
  createOrderItem,
  getAttendeeById,
  getAttendeeByQrHash,
  getAttendeesByEvent,
  getAttendeesByUser,
  getCheckinStats,
  getDiscountByCode,
  getEventById,
  getGuestOrderByToken,
  getNotificationSettings,
  getOrderById,
  getOrdersByUser,
  getReminderSettingByAttendee,
  getSeatReservationsByOrder,
  getTenantById,
  getTenantForUser,
  getTicketById,
  getWaitlistByUserAndTicket,
  getWaitlistCountByTicket,
  getWaitlistsByUser,
  incrementTicketSoldCount,
  removeFromWaitlist,
  updateAttendee,
  updateGuestOrder,
  updateOrder,
  upsertReminderSetting,
} from "../db";
import { ENV } from "../_core/env";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { notifyOwner } from "../_core/notification";
import { sendTicketConfirmationEmail } from "../email";

function generateQrHash(orderId: number, ticketId: number, userId: number, index: number): string {
  const raw = `${orderId}-${ticketId}-${userId}-${index}-${randomBytes(16).toString("hex")}`;
  return createHash("sha256").update(raw).digest("hex");
}

export const orderRouter = router({
  // Create payment intent (Stripe)
  createPaymentIntent: protectedProcedure
    .input(
      z.object({
        eventId: z.number(),
        items: z.array(z.object({ ticketId: z.number(), quantity: z.number().min(1).max(10) })),
        discountCode: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const event = await getEventById(input.eventId);
      if (!event || event.status !== "published") {
        throw new TRPCError({ code: "NOT_FOUND", message: "イベントが見つかりません" });
      }

      const tenant = await getTenantById(event.tenantId);
      if (!tenant) throw new TRPCError({ code: "NOT_FOUND" });

      // Calculate total
      let subtotal = 0;
      const itemDetails = [];
      for (const item of input.items) {
        const ticket = await getTicketById(item.ticketId);
        if (!ticket || ticket.eventId !== input.eventId || !ticket.isActive) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `チケット ${item.ticketId} が無効です` });
        }
        if (ticket.quantity - ticket.soldCount < item.quantity) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `チケット「${ticket.name}」の在庫が不足しています` });
        }
        subtotal += ticket.price * item.quantity;
        itemDetails.push({ ticket, quantity: item.quantity });
      }

      // Apply discount
      let discountAmount = 0;
      let discountId: number | undefined;
      if (input.discountCode) {
        const discount = await getDiscountByCode(input.discountCode, event.tenantId);
        if (discount) {
          if (discount.discountType === "percentage") {
            discountAmount = Math.floor(subtotal * (discount.discountValue / 100));
          } else {
            discountAmount = Math.min(discount.discountValue, subtotal);
          }
          discountId = discount.id;
        }
      }

      const totalAmount = Math.max(0, subtotal - discountAmount);
      const feeRate = parseFloat(tenant.platformFeeRate as string);
      const platformFee = Math.floor(totalAmount * feeRate);

      // If free ticket, skip Stripe
      if (totalAmount === 0) {
        const orderId = await createOrder({
          userId: ctx.user.id,
          tenantId: event.tenantId,
          eventId: input.eventId,
          totalAmount: 0,
          platformFee: 0,
          discountAmount,
          discountId,
          status: "succeeded",
        });

        for (const item of itemDetails) {
          await createOrderItem({ orderId, ticketId: item.ticket.id, quantity: item.quantity, unitPrice: item.ticket.price });
          await incrementTicketSoldCount(item.ticket.id, item.quantity);
          for (let i = 0; i < item.quantity; i++) {
            const qrCodeHash = generateQrHash(orderId, item.ticket.id, ctx.user.id, i);
            await createAttendee({
              orderItemId: orderId,
              orderId,
              ticketId: item.ticket.id,
              eventId: input.eventId,
              tenantId: event.tenantId,
              userId: ctx.user.id,
              qrCodeHash,
            });
          }
        }

        // 無料チケット購入確認メール送信（非同期・非ブロッキング）
        try {
          const { getUserById } = await import("../db");
          const user = await getUserById(ctx.user.id);
          if (user?.email) {
            const eventData = await getEventById(input.eventId);
            const firstItem = itemDetails[0];
            const qrHashes: string[] = [];
            for (const item of itemDetails) {
              for (let i = 0; i < item.quantity; i++) {
                qrHashes.push(generateQrHash(orderId, item.ticket.id, ctx.user.id, i));
              }
            }
            await sendTicketConfirmationEmail({
              to: user.email,
              recipientName: user.name ?? user.email,
              eventTitle: eventData?.title ?? `イベントID:${input.eventId}`,
              eventDatetime: eventData?.startDatetime
                ? new Date(eventData.startDatetime).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })
                : "",
              eventLocation: eventData?.isOnline ? "オンライン" : (eventData?.location ?? ""),
              ticketType: firstItem?.ticket.name ?? "チケット",
              quantity: itemDetails.reduce((s, i) => s + i.quantity, 0),
              totalAmount: 0,
              currency: "jpy",
              orderId,
              qrCodeHashes: qrHashes,
              resendApiKey: ENV.resendApiKey,
            });
          }
        } catch (emailErr) {
          console.error("[FreeTicket] Email failed (non-fatal):", emailErr);
        }
        return { orderId, clientSecret: null, isFree: true };
      }

      // Stripe payment intent
      const stripeSecretKey = ENV.stripeSecretKey;
      if (!stripeSecretKey) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe未設定" });

      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(stripeSecretKey);

      const paymentIntentParams: any = {
        amount: totalAmount,
        currency: "jpy",
        metadata: {
          eventId: input.eventId.toString(),
          userId: ctx.user.id.toString(),
          tenantId: event.tenantId.toString(),
        },
      };

      // Stripe Connect: route to organizer
      if (tenant.stripeAccountId && tenant.stripeAccountStatus === "active") {
        paymentIntentParams.application_fee_amount = platformFee;
        paymentIntentParams.transfer_data = { destination: tenant.stripeAccountId };
      }

      const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

      // Create pending order
      const orderId = await createOrder({
        userId: ctx.user.id,
        tenantId: event.tenantId,
        eventId: input.eventId,
        stripePaymentIntentId: paymentIntent.id,
        totalAmount,
        platformFee,
        discountAmount,
        discountId,
        status: "pending",
      });

      for (const item of itemDetails) {
        await createOrderItem({ orderId, ticketId: item.ticket.id, quantity: item.quantity, unitPrice: item.ticket.price });
      }

      return { orderId, clientSecret: paymentIntent.client_secret, isFree: false };
    }),

  // Confirm payment and issue QR codes
  confirmPayment: protectedProcedure
    .input(z.object({ orderId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const order = await getOrderById(input.orderId);
      if (!order || order.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
      if (order.status === "succeeded") return { success: true };

      const stripeSecretKey = ENV.stripeSecretKey;
      if (!stripeSecretKey || !order.stripePaymentIntentId) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(stripeSecretKey);
      const pi = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);

      if (pi.status !== "succeeded") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "決済が完了していません" });
      }

      await updateOrder(order.id, { status: "succeeded", stripeChargeId: pi.latest_charge as string });

      // Issue QR codes
      const { getOrderItemsByOrder } = await import("../db");
      const items = await getOrderItemsByOrder(order.id);
      for (const item of items) {
        await incrementTicketSoldCount(item.ticketId, item.quantity);
        for (let i = 0; i < item.quantity; i++) {
          const qrCodeHash = generateQrHash(order.id, item.ticketId, ctx.user.id, i);
          await createAttendee({
            orderItemId: item.id,
            orderId: order.id,
            ticketId: item.ticketId,
            eventId: order.eventId,
            tenantId: order.tenantId,
            userId: ctx.user.id,
            qrCodeHash,
          });
        }
      }

      // 購入確認メール送信（非同期・非ブロッキング）
      try {
        const { getUserById, getOrderItemsByOrder: getItems } = await import("../db");
        const user = await getUserById(ctx.user.id);
        if (user?.email) {
          const event = await getEventById(order.eventId);
          const orderItems = await getItems(order.id);
          const attendees = await (await import("../db")).getAttendeesByOrder(order.id);
          const qrHashes = attendees.map((a: { qrCodeHash: string }) => a.qrCodeHash);
          const firstItem = orderItems[0];
          let ticketName = "チケット";
          if (firstItem) {
            const ticket = await getTicketById(firstItem.ticketId);
            ticketName = ticket?.name ?? "チケット";
          }
          await sendTicketConfirmationEmail({
            to: user.email,
            recipientName: user.name ?? user.email,
            eventTitle: event?.title ?? `イベントID:${order.eventId}`,
            eventDatetime: event?.startDatetime
              ? new Date(event.startDatetime).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })
              : "",
            eventLocation: event?.isOnline ? "オンライン" : (event?.location ?? ""),
            ticketType: ticketName,
            quantity: orderItems.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0),
            totalAmount: order.totalAmount,
            currency: "jpy",
            orderId: order.id,
            qrCodeHashes: qrHashes,
            resendApiKey: ENV.resendApiKey,
          });
        }
      } catch (emailErr) {
        console.error("[ConfirmPayment] Email failed (non-fatal):", emailErr);
      }
      // 購入通知：主催者へ通知（設定に基づき・非同期・非ブロッキング）
      try {
        const notifSettings = await getNotificationSettings(order.tenantId);
        if (!notifSettings || notifSettings.notifyOnPurchase) {
          const event = await getEventById(order.eventId);
          const eventTitle = event?.title ?? `イベントID:${order.eventId}`;
          await notifyOwner({
            title: `✅ チケット購入 - ${eventTitle}`,
            content: `新しいチケット購入が完了しました。\n注文ID: ${order.id}\n金額: ¥${order.totalAmount.toLocaleString()}\n購入時刻: ${new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}`,
          });
        }
      } catch (notifyErr) {
        console.error("[ConfirmPayment] Notification failed (non-fatal):", notifyErr);
      }
      return { success: true };
    }),

  // My orders
  myOrders: protectedProcedure.query(async ({ ctx }) => {
    return getOrdersByUser(ctx.user.id);
  }),

  // My tickets (attendee records with QR)
  myTickets: protectedProcedure.query(async ({ ctx }) => {
    return getAttendeesByUser(ctx.user.id);
  }),

  // Organizer: list attendees for an event
  eventAttendees: protectedProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ ctx, input }) => {
      const tenantResult = await getTenantForUser(ctx.user.id);
      if (!tenantResult) throw new TRPCError({ code: "FORBIDDEN" });

      const event = await getEventById(input.eventId);
      if (!event || event.tenantId !== tenantResult.tenant.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return getAttendeesByEvent(input.eventId);
    }),

  // Organizer: QR checkin
  checkin: protectedProcedure
    .input(z.object({ qrCodeHash: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const tenantResult = await getTenantForUser(ctx.user.id);
      if (!tenantResult) throw new TRPCError({ code: "FORBIDDEN" });

      const attendee = await getAttendeeByQrHash(input.qrCodeHash);
      if (!attendee) throw new TRPCError({ code: "NOT_FOUND", message: "無効なQRコードです" });
      if (attendee.tenantId !== tenantResult.tenant.id) throw new TRPCError({ code: "FORBIDDEN" });

      if (attendee.status === "checked_in") {
        return { success: false, message: "既にチェックイン済みです", attendee };
      }
      if (attendee.status === "cancelled") {
        return { success: false, message: "キャンセルされたチケットです", attendee };
      }

      await updateAttendee(attendee.id, {
        status: "checked_in",
        checkedInAt: new Date(),
        checkedInBy: ctx.user.id,
      });

      // 入場通知：主催者へ通知（設定に基づき・非同期・非ブロッキング）
      try {
        const notifSettings = await getNotificationSettings(tenantResult.tenant.id);
        if (!notifSettings || notifSettings.notifyOnCheckin) {
          const event = await getEventById(attendee.eventId);
          const ticket = await getTicketById(attendee.ticketId);
          // 座席番号を取得（指定席の場合）
          let seatInfo = "";
          if (attendee.orderId) {
            const seatReservations = await getSeatReservationsByOrder(attendee.orderId);
            if (seatReservations.length > 0) {
              seatInfo = ` 座席: ${seatReservations.map((r) => r.seat.seatNumber).join(", ")}`;
            }
          }
          const eventTitle = event?.title ?? `イベントID:${attendee.eventId}`;
          const ticketName = ticket?.name ?? "チケット";
          await notifyOwner({
            title: `🎫 入場確認 - ${eventTitle}`,
            content: `${ticketName}のQRコードが読み取られました。${seatInfo}\n入場時刻: ${new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}`,
          });
        }
      } catch (notifyErr) {
        console.error("[Checkin] Notification failed (non-fatal):", notifyErr);
      }

      return { success: true, message: "チェックイン完了", attendee };
    }),

  // Organizer: get checkin stats for an event
  checkinStats: protectedProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ ctx, input }) => {
      const tenantResult = await getTenantForUser(ctx.user.id);
      if (!tenantResult) throw new TRPCError({ code: "FORBIDDEN" });
      return getCheckinStats(input.eventId, tenantResult.tenant.id);
    }),

  // Organizer: manual checkin by attendee ID (from attendee list)
  checkinById: protectedProcedure
    .input(z.object({ attendeeId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const tenantResult = await getTenantForUser(ctx.user.id);
      if (!tenantResult) throw new TRPCError({ code: "FORBIDDEN" });
      const attendee = await getAttendeeById(input.attendeeId);
      if (!attendee) throw new TRPCError({ code: "NOT_FOUND", message: "参加者が見つかりません" });
      if (attendee.tenantId !== tenantResult.tenant.id) throw new TRPCError({ code: "FORBIDDEN" });
      if (attendee.status === "checked_in") {
        return { success: false, message: "既にチェックイン済みです" };
      }
      await updateAttendee(attendee.id, {
        status: "checked_in",
        checkedInAt: new Date(),
        checkedInBy: ctx.user.id,
      });
      return { success: true, message: "チェックイン完了" };
    }),

  // Organizer: undo checkin by attendee ID
  uncheckinById: protectedProcedure
    .input(z.object({ attendeeId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const tenantResult = await getTenantForUser(ctx.user.id);
      if (!tenantResult) throw new TRPCError({ code: "FORBIDDEN" });
      const attendee = await getAttendeeById(input.attendeeId);
      if (!attendee) throw new TRPCError({ code: "NOT_FOUND", message: "参加者が見つかりません" });
      if (attendee.tenantId !== tenantResult.tenant.id) throw new TRPCError({ code: "FORBIDDEN" });
      await updateAttendee(attendee.id, {
        status: "issued",
        checkedInAt: null,
        checkedInBy: null,
      });
      return { success: true, message: "チェックインを取り消しました" };
    }),

  // Guest checkout: create payment intent without login
  guestCreatePaymentIntent: publicProcedure
    .input(
      z.object({
        eventId: z.number(),
        email: z.string().email(),
        name: z.string().min(1),
        items: z.array(z.object({ ticketId: z.number(), quantity: z.number().min(1).max(10) })),
      })
    )
    .mutation(async ({ input }) => {
      const event = await getEventById(input.eventId);
      if (!event || event.status !== "published") {
        throw new TRPCError({ code: "NOT_FOUND", message: "イベントが見つかりません" });
      }
      const tenant = await getTenantById(event.tenantId);
      if (!tenant) throw new TRPCError({ code: "NOT_FOUND" });

      let totalAmount = 0;
      const itemDetails = [];
      for (const item of input.items) {
        const ticket = await getTicketById(item.ticketId);
        if (!ticket || ticket.eventId !== input.eventId || !ticket.isActive) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `チケット ${item.ticketId} が無効です` });
        }
        if (ticket.quantity - ticket.soldCount < item.quantity) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `チケット「${ticket.name}」の在庫が不足しています` });
        }
        totalAmount += ticket.price * item.quantity;
        itemDetails.push({ ticket, quantity: item.quantity });
      }

      const token = randomBytes(32).toString("hex");

      // Free ticket: create guest order immediately as succeeded
      if (totalAmount === 0) {
        const guestOrderId = await createGuestOrder({
          email: input.email,
          name: input.name,
          eventId: input.eventId,
          tenantId: event.tenantId,
          totalAmount: 0,
          status: "succeeded",
          token,
        });
        return { guestOrderId, clientSecret: null, isFree: true, token };
      }

      const stripeSecretKey = ENV.stripeSecretKey;
      if (!stripeSecretKey) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe未設定" });
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(stripeSecretKey);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmount,
        currency: "jpy",
        receipt_email: input.email,
        metadata: {
          eventId: input.eventId.toString(),
          guestEmail: input.email,
          guestName: input.name,
          tenantId: event.tenantId.toString(),
        },
      });

      const guestOrderId = await createGuestOrder({
        email: input.email,
        name: input.name,
        eventId: input.eventId,
        tenantId: event.tenantId,
        totalAmount,
        stripePaymentIntentId: paymentIntent.id,
        status: "pending",
        token,
      });

      return { guestOrderId, clientSecret: paymentIntent.client_secret, isFree: false, token };
    }),

  // Guest checkout: confirm payment by token
  guestConfirmPayment: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      const guestOrder = await getGuestOrderByToken(input.token);
      if (!guestOrder) throw new TRPCError({ code: "NOT_FOUND", message: "注文が見つかりません" });
      if (guestOrder.status === "succeeded") return { success: true };

      if (guestOrder.stripePaymentIntentId) {
        const stripeSecretKey = ENV.stripeSecretKey;
        if (!stripeSecretKey) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(stripeSecretKey);
        const pi = await stripe.paymentIntents.retrieve(guestOrder.stripePaymentIntentId);
        if (pi.status !== "succeeded") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "決済が完了していません" });
        }
      }

      await updateGuestOrder(guestOrder.id, { status: "succeeded" });
      return { success: true };
    }),

  // Guest checkout: get order status by token
  guestOrderStatus: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const guestOrder = await getGuestOrderByToken(input.token);
      if (!guestOrder) throw new TRPCError({ code: "NOT_FOUND" });
      const event = await getEventById(guestOrder.eventId);
      return {
        id: guestOrder.id,
        email: guestOrder.email,
        name: guestOrder.name,
        status: guestOrder.status,
        totalAmount: guestOrder.totalAmount,
        eventTitle: event?.title ?? "",
        eventStartDatetime: event?.startDatetime,
        createdAt: guestOrder.createdAt,
      };
    }),

  // ─── Waitlist（キャンセル待ち） ──────────────────────────────────────────────

  // キャンセル待ち登録
  joinWaitlist: protectedProcedure
    .input(z.object({ eventId: z.number(), ticketId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const event = await getEventById(input.eventId);
      if (!event || event.status !== "published") {
        throw new TRPCError({ code: "NOT_FOUND", message: "イベントが見つかりません" });
      }
      const ticket = await getTicketById(input.ticketId);
      if (!ticket || ticket.eventId !== input.eventId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "チケットが見つかりません" });
      }
      // 既に登録済みか確認
      const existing = await getWaitlistByUserAndTicket(ctx.user.id, input.ticketId);
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "既にキャンセル待ちに登録済みです" });
      }
      const waitlistId = await addToWaitlist({
        userId: ctx.user.id,
        eventId: input.eventId,
        ticketId: input.ticketId,
        tenantId: event.tenantId,
        position: 0,
      });
      const count = await getWaitlistCountByTicket(input.ticketId);
      return { waitlistId, position: count };
    }),

  // キャンセル待ち解除
  leaveWaitlist: protectedProcedure
    .input(z.object({ ticketId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await removeFromWaitlist(ctx.user.id, input.ticketId);
      return { success: true };
    }),

  // 自分のキャンセル待ち一覧
  myWaitlists: protectedProcedure.query(async ({ ctx }) => {
    const waitlists = await getWaitlistsByUser(ctx.user.id);
    const results = await Promise.all(
      waitlists.map(async (w) => {
        const event = await getEventById(w.eventId);
        const ticket = await getTicketById(w.ticketId);
        const position = await getWaitlistCountByTicket(w.ticketId);
        return {
          ...w,
          eventTitle: event?.title ?? "",
          eventStartDatetime: event?.startDatetime,
          ticketName: ticket?.name ?? "",
          queueLength: position,
        };
      })
    );
    return results;
  }),

  // チケットのキャンセル待ち人数を取得（公開）
  waitlistCount: publicProcedure
    .input(z.object({ ticketId: z.number() }))
    .query(async ({ input }) => {
      const count = await getWaitlistCountByTicket(input.ticketId);
      return { count };
    }),

  // 自分がキャンセル待ちに登録しているか確認
  myWaitlistStatus: protectedProcedure
    .input(z.object({ ticketId: z.number() }))
    .query(async ({ ctx, input }) => {
      const entry = await getWaitlistByUserAndTicket(ctx.user.id, input.ticketId);
      return { isWaiting: !!entry, entry: entry ?? null };
    }),

  // リマインダー設定を取得
  getReminderSetting: protectedProcedure
    .input(z.object({ attendeeId: z.number() }))
    .query(async ({ ctx, input }) => {
      const attendee = await getAttendeeById(input.attendeeId);
      if (!attendee || attendee.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const setting = await getReminderSettingByAttendee(input.attendeeId);
      return {
        remind24h: setting?.remind24h ?? true,
        remind1h: setting?.remind1h ?? true,
      };
    }),

  // リマインダー設定を更新
  setReminderSetting: protectedProcedure
    .input(
      z.object({
        attendeeId: z.number(),
        eventId: z.number(),
        remind24h: z.boolean(),
        remind1h: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const attendee = await getAttendeeById(input.attendeeId);
      if (!attendee || attendee.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await upsertReminderSetting({
        userId: ctx.user.id,
        attendeeId: input.attendeeId,
        eventId: input.eventId,
        remind24h: input.remind24h,
        remind1h: input.remind1h,
      });
      return { success: true };
    }),
});
