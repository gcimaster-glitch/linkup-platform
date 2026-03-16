import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { ENV } from "../_core/env";

// GBizINFO APIのレスポンス型
interface GBizHojinInfo {
  corporate_number: string;
  name: string;
  location: string;
  postal_code: string;
  status: string;
  update_date: string;
  number_of_activity: string;
}

interface GBizResponse {
  "hojin-infos"?: GBizHojinInfo[];
  message?: string;
  errors?: unknown[];
}

const GBIZ_API_BASE = "https://info.gbiz.go.jp/hojin/v1/hojin";

async function fetchGBiz(params: Record<string, string>): Promise<GBizHojinInfo[]> {
  const token = ENV.gbizInfoApiToken;
  if (!token) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "GBizINFO APIトークンが設定されていません" });

  const url = new URL(GBIZ_API_BASE);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url.toString(), {
    headers: {
      "X-hojinInfo-api-token": token,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    if (res.status === 404) return [];
    throw new TRPCError({ code: "BAD_GATEWAY", message: `GBizINFO APIエラー: ${res.status}` });
  }

  const data: GBizResponse = await res.json();
  return data["hojin-infos"] ?? [];
}

export const gbizRouter = router({
  // 法人番号または法人名で検索
  search: protectedProcedure
    .input(
      z.object({
        corporateNumber: z.string().length(13).optional(),
        name: z.string().min(2).max(100).optional(),
      }).refine((d) => d.corporateNumber || d.name, {
        message: "法人番号または法人名のいずれかを入力してください",
      })
    )
    .query(async ({ input }) => {
      let results: GBizHojinInfo[] = [];

      if (input.corporateNumber) {
        // 法人番号で検索
        results = await fetchGBiz({ corporate_number: input.corporateNumber });
        // 完全一致フィルタ
        results = results.filter((h) => h.corporate_number === input.corporateNumber);
      } else if (input.name) {
        results = await fetchGBiz({ name: input.name });
      }

      return results.slice(0, 20).map((h) => ({
        corporateNumber: h.corporate_number,
        name: h.name,
        location: h.location,
        postalCode: h.postal_code,
        status: h.status,
      }));
    }),
});
