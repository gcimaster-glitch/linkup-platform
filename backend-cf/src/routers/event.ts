import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { sql, eq } from "drizzle-orm";
import { getDb } from "../db";
import { events } from "../schema";
import {
  createEvent,
  createTicket,
  getAttendeeEmailsByEvent,
  getEventAnalytics,
  getEventById,
  getEventsByTenant,
  getPublishedEvents,
  getTenantForUser,
  getTicketsByEvent,
  updateEvent,
  addFavorite,
  removeFavorite,
  getFavoriteEventIds,
  getFavoritesByUser,
} from "../db";
import { sendEventChangeNotificationEmail } from "../email";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";

export const eventRouter = router({
  // Public: list published events
  list: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        category: z.string().optional(),
        isOnline: z.boolean().optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        minPrice: z.number().min(0).optional(),
        maxPrice: z.number().min(0).optional(),
        hasAvailability: z.boolean().optional(),
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      return getPublishedEvents(input);
    }),

  // Public: search suggestions (fast, returns titles + organizer names)
  suggest: publicProcedure
    .input(z.object({ q: z.string().min(1).max(100) }))
    .query(async ({ input }) => {
      const results = await getPublishedEvents({ search: input.q, limit: 8 });
      return results.map((e) => ({
        id: e.id,
        title: e.title,
        category: e.category ?? null,
        organizerName: (e as any).organizerName ?? null,
      }));
    }),

  // Public: get event detail with tickets
  detail: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const event = await getEventById(input.id);
      if (!event) throw new TRPCError({ code: "NOT_FOUND" });
      const ticketList = await getTicketsByEvent(input.id);
      return { event, tickets: ticketList };
    }),

  // Organizer: list my events
  myEvents: protectedProcedure.query(async ({ ctx }) => {
    const tenantResult = await getTenantForUser(ctx.user.id);
    if (!tenantResult) throw new TRPCError({ code: "FORBIDDEN", message: "オーガナイザー登録が必要です" });
    return getEventsByTenant(tenantResult.tenant.id);
  }),

  // Organizer: create event
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        coverImageUrl: z.string().optional(),
        location: z.string().optional(),
        onlineUrl: z.string().optional(),
        isOnline: z.boolean().default(false),
        category: z.string().optional(),
        startDatetime: z.string(),
        endDatetime: z.string(),
        nearestStation: z.string().optional(),
        parkingInfo: z.string().optional(),
        accessNotes: z.string().optional(),
        customFormFields: z.array(z.object({
          id: z.string(),
          label: z.string(),
          type: z.enum(["text", "textarea", "select", "radio", "checkbox"]),
          required: z.boolean(),
          options: z.array(z.string()).optional(),
          placeholder: z.string().optional(),
        })).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const tenantResult = await getTenantForUser(ctx.user.id);
      if (!tenantResult) throw new TRPCError({ code: "FORBIDDEN", message: "オーガナイザー登録が必要です" });

      const eventId = await createEvent({
        ...input,
        tenantId: tenantResult.tenant.id,
        createdBy: ctx.user.id,
        startDatetime: new Date(input.startDatetime),
        endDatetime: new Date(input.endDatetime),
      });
      return { eventId };
    }),

  // Organizer: update event
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        coverImageUrl: z.string().optional().nullable(),
        location: z.string().optional(),
        onlineUrl: z.string().optional().nullable(),
        isOnline: z.boolean().optional(),
        category: z.string().optional(),
        startDatetime: z.string().optional(),
        endDatetime: z.string().optional(),
        status: z.enum(["draft", "published", "cancelled", "archived"]).optional(),
        nearestStation: z.string().optional().nullable(),
        parkingInfo: z.string().optional().nullable(),
        accessNotes: z.string().optional().nullable(),
        notifyAttendees: z.boolean().default(true),
        customFormFields: z.array(z.object({
          id: z.string(),
          label: z.string(),
          type: z.enum(["text", "textarea", "select", "radio", "checkbox"]),
          required: z.boolean(),
          options: z.array(z.string()).optional(),
          placeholder: z.string().optional(),
        })).optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const tenantResult = await getTenantForUser(ctx.user.id);
      if (!tenantResult) throw new TRPCError({ code: "FORBIDDEN" });

      const event = await getEventById(input.id);
      if (!event || event.tenantId !== tenantResult.tenant.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // ── 変更検知: 通知対象フィールドの差分を記録 ──
      const changes: Array<{ field: string; oldValue: string; newValue: string }> = [];
      const fmt = (d: Date | null | undefined) =>
        d ? new Date(d).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }) : "";

      if (input.startDatetime && event.startDatetime) {
        const oldVal = fmt(event.startDatetime);
        const newVal = fmt(new Date(input.startDatetime));
        if (oldVal !== newVal) changes.push({ field: "開始日時", oldValue: oldVal, newValue: newVal });
      }
      if (input.endDatetime && event.endDatetime) {
        const oldVal = fmt(event.endDatetime);
        const newVal = fmt(new Date(input.endDatetime));
        if (oldVal !== newVal) changes.push({ field: "終了日時", oldValue: oldVal, newValue: newVal });
      }
      if (input.location !== undefined && input.location !== event.location) {
        changes.push({ field: "会場", oldValue: event.location ?? "", newValue: input.location ?? "" });
      }
      if (input.isOnline !== undefined && input.isOnline !== event.isOnline) {
        changes.push({ field: "開催形式", oldValue: event.isOnline ? "オンライン" : "会場開催", newValue: input.isOnline ? "オンライン" : "会場開催" });
      }

      const { id, notifyAttendees, ...updateData } = input;
      const data: Record<string, any> = { ...updateData };
      if (input.startDatetime) data.startDatetime = new Date(input.startDatetime);
      if (input.endDatetime) data.endDatetime = new Date(input.endDatetime);
      await updateEvent(id, data);

      // ── 変更通知メール送信 ──
      if (notifyAttendees && changes.length > 0) {
        const attendeeEmails = await getAttendeeEmailsByEvent(id);
        const origin = (ctx.req.headers.origin as string) || "https://link-up.live";
        const eventUrl = `${origin}/events/${id}`;
        const sendResults = await Promise.allSettled(
          attendeeEmails.map((a) =>
            sendEventChangeNotificationEmail({
              to: a.email,
              recipientName: a.name ?? "ご参加者",
              eventTitle: event.title,
              changes,
              eventUrl,
              resendApiKey: ENV.resendApiKey,
            })
          )
        );
        const sent = sendResults.filter((r) => r.status === "fulfilled" && (r as any).value?.success).length;
        console.log(`[Event] Change notification sent to ${sent}/${attendeeEmails.length} attendees for event #${id}`);
        return { success: true, notifiedCount: sent, changes };
      }

      return { success: true, notifiedCount: 0, changes };
    }),

  // Public: increment share count
  incrementShare: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(events).set({ shareCount: sql`shareCount + 1` }).where(eq(events.id, input.id));
      return { success: true };
    }),

  // Public: increment view count
  incrementView: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(events).set({ viewCount: sql`viewCount + 1` }).where(eq(events.id, input.id));
      return { success: true };
    }),

   // Organizer: publish/unpublish
  setStatus: protectedProcedure
    .input(z.object({ id: z.number(), status: z.enum(["draft", "published", "cancelled", "archived"]) }))
    .mutation(async ({ ctx, input }) => {
      const tenantResult = await getTenantForUser(ctx.user.id);
      if (!tenantResult) throw new TRPCError({ code: "FORBIDDEN" });
      const event = await getEventById(input.id);
      if (!event || event.tenantId !== tenantResult.tenant.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await updateEvent(input.id, { status: input.status });
      return { success: true };
    }),

  // Organizer: duplicate event (copy event + tickets, status=draft)
  duplicate: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const tenantResult = await getTenantForUser(ctx.user.id);
      if (!tenantResult) throw new TRPCError({ code: "FORBIDDEN", message: "オーガナイザー登録が必要です" });

      // Verify ownership
      const original = await getEventById(input.id);
      if (!original || original.tenantId !== tenantResult.tenant.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Copy event with modified title and reset status to draft
      const { id: _id, createdAt: _ca, updatedAt: _ua, shareCount: _sc, viewCount: _vc, soldCount: _sold, ...eventData } = original as any;
      const newEventId = await createEvent({
        ...eventData,
        title: `[コピー] ${original.title}`,
        status: "draft",
        soldCount: 0,
        shareCount: 0,
        viewCount: 0,
        tenantId: tenantResult.tenant.id,
        createdBy: ctx.user.id,
      });

      // Copy all active tickets
      const originalTickets = await getTicketsByEvent(input.id);
      for (const ticket of originalTickets) {
        const { id: _tid, createdAt: _tca, updatedAt: _tua, soldCount: _tsold, ...ticketData } = ticket as any;
        await createTicket({
          ...ticketData,
          eventId: newEventId,
          soldCount: 0,
        });
      }

      return { newEventId };
    }),

  // ─── AIアシスト: タイトルからイベント情報を一括補完 ────────────────────────────
  assistWithAI: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        category: z.string().optional(),
        location: z.string().optional(),
        isOnline: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const prompt = `以下のイベント情報を元に、日本語でイベントの詳細情報を補完してください。

イベント名: ${input.title}
${input.description ? `現在の説明: ${input.description}` : ""}
${input.category ? `カテゴリ: ${input.category}` : ""}
${input.location ? `場所: ${input.location}` : ""}
${input.isOnline ? "オンラインイベント" : ""}

以下のJSON形式で返答してください：
{
  "description": "吸引力のあるイベント説明文（200文字程度）",
  "category": "最適なカテゴリ（音楽/テクノロジー/ビジネス/アート/スポーツ/フード/教育/その他のいずれか）",
  "tags": ["タグ、1", "タグ、2", "タグ、3", "タグ、4", "タグ、5"],
  "suggestedTitle": "より魅力的なタイトル候補（元のタイトルを改善）",
  "accessNotes": "アクセス情報の提案（場所があれば）"
}`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "あなたはイベントマーケティングの専門家です。日本のイベント主催者のために、魅力的なイベント説明文やタグを生成します。" },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "event_assist",
            strict: true,
            schema: {
              type: "object",
              properties: {
                description: { type: "string" },
                category: { type: "string" },
                tags: { type: "array", items: { type: "string" } },
                suggestedTitle: { type: "string" },
                accessNotes: { type: "string" },
              },
              required: ["description", "category", "tags", "suggestedTitle", "accessNotes"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI応答が空です" });
      return typeof content === "string" ? JSON.parse(content) : content;
    }),

  // ─── タグ自動生成 ───────────────────────────────────────────────────────────────────────────
  suggestTags: protectedProcedure
    .input(
      z.object({
        text: z.string().min(1).max(500),
        category: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: "イベントのテキストから標签（タグ）を最大5個生成してください。タグは短いキーワードで、検索しやすいものにしてください。" },
          { role: "user", content: `イベント情報: ${input.text}${input.category ? ` (カテゴリ: ${input.category})` : ""}` },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "tag_suggestions",
            strict: true,
            schema: {
              type: "object",
              properties: {
                tags: { type: "array", items: { type: "string" } },
              },
              required: ["tags"],
              additionalProperties: false,
            },
          },
        },
      });
      const content = response.choices[0]?.message?.content;
      if (!content) return { tags: [] };
      const parsed = typeof content === "string" ? JSON.parse(content) : content;
      return { tags: (parsed.tags as string[]).slice(0, 5) };
    }),

  // ─── 推奨ワード ──────────────────────────────────────────────────────────────────────────────
  suggestWords: protectedProcedure
    .input(
      z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        field: z.enum(["description", "location", "accessNotes", "parkingInfo"]).default("description"),
      })
    )
    .mutation(async ({ input }) => {
      const context = [
        input.title ? `タイトル: ${input.title}` : "",
        input.category ? `カテゴリ: ${input.category}` : "",
        input.description ? `現在の説明: ${input.description}` : "",
      ].filter(Boolean).join("\n");

      const fieldLabels: Record<string, string> = {
        description: "イベント説明文",
        location: "会場名・住所",
        accessNotes: "アクセス情報",
        parkingInfo: "驑車場情報",
      };

      const response = await invokeLLM({
        messages: [
          { role: "system", content: `イベント作成フォームの「${fieldLabels[input.field]}」欄に入力できる短いフレーズやキーワードを提案してください。各提案は10文字以内で、クリックするだけで入力できる内容にしてください。` },
          { role: "user", content: `${context}\n\n「${fieldLabels[input.field]}」欄の推奨ワード・フレーズを8個提案してください。` },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "word_suggestions",
            strict: true,
            schema: {
              type: "object",
              properties: {
                words: { type: "array", items: { type: "string" } },
              },
              required: ["words"],
              additionalProperties: false,
            },
          },
        },
      });
      const content = response.choices[0]?.message?.content;
      if (!content) return { words: [] };
      const parsed = typeof content === "string" ? JSON.parse(content) : content;
      return { words: (parsed.words as string[]).slice(0, 8) };
    }),

  // 複製イベント向け: AIが内容更新を提案
  suggestDuplicateUpdate: protectedProcedure
    .input(z.object({ eventId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const tenantResult = await getTenantForUser(ctx.user.id);
      if (!tenantResult) throw new TRPCError({ code: "FORBIDDEN" });
      const event = await getEventById(input.eventId);
      if (!event || event.tenantId !== tenantResult.tenant.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const today = new Date();
      const todayStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
      const tagsStr = Array.isArray((event as any).tags) ? ((event as any).tags as string[]).join(", ") : "未設定";

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "あなたはイベント運営のアシスタントです。過去に開催したイベントの複製が作成されました。内容を次回開催向けにリフレッシュするための提案をJSON形式で返してください。",
          },
          {
            role: "user",
            content: `以下のイベント情報を元に、次回開催向けに内容をリフレッシュした提案をしてください。

タイトル: ${event.title}
説明文: ${event.description || "未設定"}
カテゴリ: ${event.category || "未設定"}
タグ: ${tagsStr}
今日の日付: ${todayStr}

要求:
1. 説明文を「次回開催」を意識した内容にリフレッシュ（前回の参加者への感謝や次回への期待感を含める）
2. タグを最大新6個、現在のトレンドを反映した内容に更新
3. 開催日時のヒント（「次回は来月開催予定」等のアドバイス文字列、実際の日時は設定しない）
4. 変更理由の要約（ユーザーに表示する簡潔な説明）`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "duplicate_suggestions",
            strict: true,
            schema: {
              type: "object",
              properties: {
                description: { type: "string", description: "リフレッシュされた説明文" },
                tags: { type: "array", items: { type: "string" }, description: "更新されたタグ配列" },
                dateHint: { type: "string", description: "開催日時のアドバイス文字列" },
                reason: { type: "string", description: "変更理由の要約" },
              },
              required: ["description", "tags", "dateHint", "reason"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AIの応答が空です" });
      const parsed = typeof content === "string" ? JSON.parse(content) : content;
      return {
        description: parsed.description as string,
        tags: (parsed.tags as string[]).slice(0, 6),
        dateHint: parsed.dateHint as string,
        reason: parsed.reason as string,
      };
    }),

    // Protected: get event analytics (organizer only)
  analytics: protectedProcedure
    .input(z.object({ eventId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const tenantInfo = await getTenantForUser(ctx.user.id);
      if (!tenantInfo) throw new TRPCError({ code: "FORBIDDEN", message: "主催者アカウントが必要です" });
      // イベントが自分のテナントに属しているか確認
      const event = await getEventById(input.eventId);
      if (!event) throw new TRPCError({ code: "NOT_FOUND", message: "イベントが見つかりません" });
      if (event.tenantId !== tenantInfo.tenant.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "このイベントへのアクセス権がありません" });
      }
      return getEventAnalytics(input.eventId, tenantInfo.tenant.id);
    }),

  // Protected: get favorite event IDs for current user
  myFavoriteIds: protectedProcedure
    .query(async ({ ctx }) => {
      return getFavoriteEventIds(ctx.user.id);
    }),

  // Protected: get favorited events (full event objects) for current user
  myFavorites: protectedProcedure
    .query(async ({ ctx }) => {
      const favorites = await getFavoritesByUser(ctx.user.id);
      if (favorites.length === 0) return [];
      const eventIds = favorites.map((f) => f.eventId);
      const allEvents = await Promise.all(eventIds.map((id) => getEventById(id)));
      return allEvents.filter((e): e is NonNullable<typeof e> => e !== undefined);
    }),

  // Protected: toggle favorite
  toggleFavorite: protectedProcedure
    .input(z.object({ eventId: z.number().int().positive(), isFavorite: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      if (input.isFavorite) {
        await addFavorite(ctx.user.id, input.eventId);
      } else {
        await removeFavorite(ctx.user.id, input.eventId);
      }
      return { success: true, isFavorite: input.isFavorite };
    }),
});
