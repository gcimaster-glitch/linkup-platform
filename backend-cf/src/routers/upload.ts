import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { storagePut } from "../storage";
import { nanoid } from "nanoid";

export const uploadRouter = router({
  // Upload event cover image (base64 encoded)
  eventCover: protectedProcedure
    .input(
      z.object({
        base64: z.string(),
        mimeType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]),
        filename: z.string().max(255),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const maxSize = 5 * 1024 * 1024; // 5MB
      const buffer = Buffer.from(input.base64, "base64");
      if (buffer.byteLength > maxSize) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "画像サイズは5MB以下にしてください" });
      }

      const ext = input.mimeType.split("/")[1];
      const key = `event-covers/${ctx.user.id}-${nanoid(8)}.${ext}`;
      const { url } = await storagePut(key, buffer, input.mimeType);
      return { url, key };
    }),

  // Upload organizer logo
  tenantLogo: protectedProcedure
    .input(
      z.object({
        base64: z.string(),
        mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const maxSize = 2 * 1024 * 1024; // 2MB
      const buffer = Buffer.from(input.base64, "base64");
      if (buffer.byteLength > maxSize) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "ロゴサイズは2MB以下にしてください" });
      }

      const ext = input.mimeType.split("/")[1];
      const key = `tenant-logos/${ctx.user.id}-${nanoid(8)}.${ext}`;
      const { url } = await storagePut(key, buffer, input.mimeType);
      return { url, key };
    }),
});
