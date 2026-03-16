import { clearSessionCookie } from "./_core/auth";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { adminRouter } from "./routers/admin";
import { adsRouter } from "./routers/ads";
import { affiliateRouter } from "./routers/affiliate";
import { announcementRouter } from "./routers/announcement";
import { connectRouter } from "./routers/connect";
import { discountRouter } from "./routers/discount";
import { eventRouter } from "./routers/event";
import { marketingRouter } from "./routers/marketing";
import { orderRouter } from "./routers/order";
import { smsRouter } from "./routers/sms";
import { tenantRouter } from "./routers/tenant";
import { ticketRouter } from "./routers/ticket";
import { transferRouter } from "./routers/transfer";
import { uploadRouter } from "./routers/upload";
import { userRouter } from "./routers/user";
import { seatRouter } from "./routers/seat";
import { contactRouter } from "./routers/contact";
import { gbizRouter } from "./routers/gbiz";
import { payoutRouter } from "./routers/payout";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      // Cloudflare Workers用: レスポンスヘッダーにSet-Cookieを設定
      // ctx.resHeaders はindex.tsで注入したHeaders
      if (ctx.resHeaders) {
        ctx.resHeaders.set("Set-Cookie", clearSessionCookie());
      }
      return { success: true } as const;
    }),
  }),
  tenant: tenantRouter,
  connect: connectRouter,
  event: eventRouter,
  ticket: ticketRouter,
  order: orderRouter,
  admin: adminRouter,
  upload: uploadRouter,
  discount: discountRouter,
  affiliate: affiliateRouter,
  sms: smsRouter,
  marketing: marketingRouter,
  user: userRouter,
  transfer: transferRouter,
  ads: adsRouter,
  announcement: announcementRouter,
  seat: seatRouter,
  contact: contactRouter,
  gbiz: gbizRouter,
  payout: payoutRouter,
});

export type AppRouter = typeof appRouter;
