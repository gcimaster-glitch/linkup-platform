import { ENV } from "../_core/env";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getTenantForUser, updateTenant } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

export const connectRouter = router({
  // Get Stripe Connect account status for current tenant
  status: protectedProcedure.query(async ({ ctx }) => {
    const result = await getTenantForUser(ctx.user.id);
    if (!result) return null;

    const { tenant } = result;
    return {
      stripeAccountId: tenant.stripeAccountId ?? null,
      stripeAccountStatus: tenant.stripeAccountStatus ?? "pending",
      isConnected: !!tenant.stripeAccountId && tenant.stripeAccountStatus === "active",
    };
  }),

  // Create Stripe Connect account and return onboarding URL
  createAccount: protectedProcedure
    .input(
      z.object({
        origin: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const stripeSecretKey = ENV.stripeSecretKey;
      if (!stripeSecretKey) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe is not configured" });
      }

      const result = await getTenantForUser(ctx.user.id);
      if (!result) {
        throw new TRPCError({ code: "NOT_FOUND", message: "テナントが見つかりません" });
      }
      if (result.role !== "owner" && result.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "オーナーまたは管理者のみ実行できます" });
      }

      const { tenant } = result;
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(stripeSecretKey);

      let accountId = tenant.stripeAccountId;

      // Create account if not exists
      if (!accountId) {
        const account = await stripe.accounts.create({
          type: "express",
          country: "JP",
          email: ctx.user.email ?? undefined,
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
          business_type: "individual",
          metadata: {
            tenantId: tenant.id.toString(),
            tenantName: tenant.name,
            userId: ctx.user.id.toString(),
          },
        });
        accountId = account.id;
        await updateTenant(tenant.id, {
          stripeAccountId: accountId,
          stripeAccountStatus: "pending",
        });
      }

      // Create onboarding link
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${input.origin}/organizer/stripe-connect?refresh=true`,
        return_url: `${input.origin}/organizer/stripe-connect?success=true`,
        type: "account_onboarding",
      });

      return { url: accountLink.url, accountId };
    }),

  // Refresh onboarding link (if expired)
  refreshLink: protectedProcedure
    .input(z.object({ origin: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      const stripeSecretKey = ENV.stripeSecretKey;
      if (!stripeSecretKey) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe is not configured" });
      }

      const result = await getTenantForUser(ctx.user.id);
      if (!result?.tenant.stripeAccountId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Stripeアカウントが見つかりません" });
      }

      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(stripeSecretKey);

      const accountLink = await stripe.accountLinks.create({
        account: result.tenant.stripeAccountId,
        refresh_url: `${input.origin}/organizer/stripe-connect?refresh=true`,
        return_url: `${input.origin}/organizer/stripe-connect?success=true`,
        type: "account_onboarding",
      });

      return { url: accountLink.url };
    }),

  // Verify account status from Stripe API and sync to DB
  verify: protectedProcedure.mutation(async ({ ctx }) => {
    const stripeSecretKey = ENV.stripeSecretKey;
    if (!stripeSecretKey) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe is not configured" });
    }

    const result = await getTenantForUser(ctx.user.id);
    if (!result?.tenant.stripeAccountId) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Stripeアカウントが見つかりません" });
    }

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeSecretKey);

    const account = await stripe.accounts.retrieve(result.tenant.stripeAccountId);
    const isActive =
      account.charges_enabled && account.payouts_enabled && account.details_submitted;

    const newStatus = isActive ? "active" : account.details_submitted ? "restricted" : "pending";

    await updateTenant(result.tenant.id, {
      stripeAccountStatus: newStatus as "pending" | "active" | "restricted",
    });

    return {
      accountId: account.id,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      status: newStatus,
    };
  }),
});
