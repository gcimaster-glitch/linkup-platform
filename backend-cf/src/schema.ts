import {
  boolean,
  decimal,
  double,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── Core Users ───────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  phoneNumber: varchar("phoneNumber", { length: 20 }),
  phoneVerified: boolean("phoneVerified").default(false).notNull(),
  // Profile extensions
  avatarUrl: text("avatarUrl"),
  coverImageUrl: text("coverImageUrl"),
  bio: text("bio"),
  // Email verification
  emailVerified: boolean("emailVerified").default(false).notNull(),
  emailVerificationToken: varchar("emailVerificationToken", { length: 128 }),
  emailVerificationExpiresAt: timestamp("emailVerificationExpiresAt"),
  // Points balance (cached sum for performance)
  pointsBalance: int("pointsBalance").default(0).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Tenants (Organizer Groups) ───────────────────────────────────────────────
export const tenants = mysqlTable("tenants", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  logoUrl: text("logoUrl"),
  plan: mysqlEnum("plan", ["free", "pro"]).default("free").notNull(),
  stripeAccountId: varchar("stripeAccountId", { length: 255 }),
  stripeAccountStatus: mysqlEnum("stripeAccountStatus", ["pending", "active", "restricted"]).default("pending"),
  platformFeeRate: decimal("platformFeeRate", { precision: 5, scale: 4 }).default("0.1000").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  ownerId: int("ownerId").notNull(),
  customDomain: varchar("customDomain", { length: 255 }),
  // 法人情報（GBizINFO連携）
  corporateNumber: varchar("corporateNumber", { length: 13 }),
  legalName: varchar("legalName", { length: 255 }),
  postalCode: varchar("postalCode", { length: 8 }),
  address: text("address"),
  representativeName: varchar("representativeName", { length: 255 }),
  phoneNumber: varchar("phoneNumber", { length: 20 }),
  websiteUrl: varchar("websiteUrl", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = typeof tenants.$inferInsert;

// ─── Tenant Members ───────────────────────────────────────────────────────────
export const tenantMembers = mysqlTable("tenant_members", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["owner", "admin", "member"]).default("member").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TenantMember = typeof tenantMembers.$inferSelect;

// ─── Events ───────────────────────────────────────────────────────────────────
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  coverImageUrl: text("coverImageUrl"),
  location: varchar("location", { length: 500 }),
  onlineUrl: text("onlineUrl"),
  isOnline: boolean("isOnline").default(false).notNull(),
  category: varchar("category", { length: 100 }),
  startDatetime: timestamp("startDatetime").notNull(),
  endDatetime: timestamp("endDatetime").notNull(),
  status: mysqlEnum("status", ["draft", "published", "cancelled", "archived"]).default("draft").notNull(),
  requiredKycLevel: int("requiredKycLevel").default(0).notNull(),
  createdBy: int("createdBy").notNull(),
  shareCount: int("shareCount").default(0).notNull(),
  viewCount: int("viewCount").default(0).notNull(),
   nearestStation: varchar("nearestStation", { length: 255 }),
  parkingInfo: text("parkingInfo"),
  accessNotes: text("accessNotes"),
  // カスタム参加者フォームフィールド（JSON配列）
  customFormFields: json("customFormFields").$type<Array<{
    id: string;
    label: string;
    type: "text" | "textarea" | "select" | "radio" | "checkbox";
    required: boolean;
    options?: string[];
    placeholder?: string;
  }>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

// ─── Tickets ──────────────────────────────────────────────────────────────────
export const tickets = mysqlTable("tickets", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  tenantId: int("tenantId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: int("price").notNull().default(0),
  quantity: int("quantity").notNull(),
  soldCount: int("soldCount").notNull().default(0),
  salesStartDatetime: timestamp("salesStartDatetime"),
  salesEndDatetime: timestamp("salesEndDatetime"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = typeof tickets.$inferInsert;

// ─── Discount Codes ───────────────────────────────────────────────────────────
export const discounts = mysqlTable("discounts", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  eventId: int("eventId"),
  code: varchar("code", { length: 50 }).notNull(),
  discountType: mysqlEnum("discountType", ["percentage", "fixed"]).notNull(),
  discountValue: int("discountValue").notNull(),
  maxUses: int("maxUses"),
  usedCount: int("usedCount").default(0).notNull(),
  expiresAt: timestamp("expiresAt"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Discount = typeof discounts.$inferSelect;

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tenantId: int("tenantId").notNull(),
  eventId: int("eventId").notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  stripeChargeId: varchar("stripeChargeId", { length: 255 }),
  totalAmount: int("totalAmount").notNull(),
  platformFee: int("platformFee").notNull().default(0),
  discountId: int("discountId"),
  discountAmount: int("discountAmount").default(0).notNull(),
  status: mysqlEnum("status", ["pending", "succeeded", "failed", "refunded", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// ─── Order Items ──────────────────────────────────────────────────────────────
export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  ticketId: int("ticketId").notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: int("unitPrice").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;

// ─── Attendees (QR Code Records) ─────────────────────────────────────────────
export const attendees = mysqlTable("attendees", {
  id: int("id").autoincrement().primaryKey(),
  orderItemId: int("orderItemId").notNull(),
  orderId: int("orderId").notNull(),
  ticketId: int("ticketId").notNull(),
  eventId: int("eventId").notNull(),
  tenantId: int("tenantId").notNull(),
  userId: int("userId").notNull(),
   qrCodeHash: varchar("qrCodeHash", { length: 128 }).notNull().unique(),
  status: mysqlEnum("status", ["issued", "checked_in", "cancelled"]).default("issued").notNull(),
  checkedInAt: timestamp("checkedInAt"),
  checkedInBy: int("checkedInBy"),
  // カスタムフォーム回答（JSON）: {"q1":"株式会社テスト","q2":"営業部"}
  formAnswers: json("formAnswers").$type<Record<string, string | string[]>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Attendee = typeof attendees.$inferSelect;

// ─── Affiliates ─────────────────────────────────────────────────────────────
export const affiliates = mysqlTable("affiliates", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  eventId: int("eventId"),
  userId: int("userId").notNull(),
  refCode: varchar("refCode", { length: 50 }).notNull().unique(),
  commissionRate: decimal("commissionRate", { precision: 5, scale: 4 }).default("0.0500").notNull(),
  totalClicks: int("totalClicks").default(0).notNull(),
  totalConversions: int("totalConversions").default(0).notNull(),
  totalEarnings: int("totalEarnings").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Affiliate = typeof affiliates.$inferSelect;
export type InsertAffiliate = typeof affiliates.$inferInsert;

// ─── Affiliate Conversions ────────────────────────────────────────────────────
export const affiliateConversions = mysqlTable("affiliate_conversions", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull(),
  orderId: int("orderId").notNull(),
  amount: int("amount").notNull(),
  commission: int("commission").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AffiliateConversion = typeof affiliateConversions.$inferSelect;

// ─── Phone Verifications ──────────────────────────────────────────────────────
export const phoneVerifications = mysqlTable("phone_verifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  phoneNumber: varchar("phoneNumber", { length: 20 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  isVerified: boolean("isVerified").default(false).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PhoneVerification = typeof phoneVerifications.$inferSelect;

// ─── Users Phone (verified) ───────────────────────────────────────────────────
// Note: phoneNumber is stored on users table via migration

// ─── Ticket Transfers ────────────────────────────────────────────────────────
export const ticketTransfers = mysqlTable("ticket_transfers", {
  id: int("id").autoincrement().primaryKey(),
  attendeeId: int("attendeeId").notNull(),
  fromUserId: int("fromUserId").notNull(),
  toEmail: varchar("toEmail", { length: 320 }).notNull(),
  toUserId: int("toUserId"),
  token: varchar("token", { length: 128 }).notNull().unique(),
  status: mysqlEnum("status", ["pending", "accepted", "cancelled"]).default("pending").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  acceptedAt: timestamp("acceptedAt"),
});

export type TicketTransfer = typeof ticketTransfers.$inferSelect;

// ─── User Points ──────────────────────────────────────────────────────────────
export const userPoints = mysqlTable("user_points", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  amount: int("amount").notNull(), // positive = earn, negative = use
  reason: mysqlEnum("reason", ["purchase", "referral", "bonus", "used", "expired", "admin"]).notNull(),
  orderId: int("orderId"),
  description: varchar("description", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserPoint = typeof userPoints.$inferSelect;

// ─── Advertisements ───────────────────────────────────────────────────────────
export const ads = mysqlTable("ads", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  imageUrl: text("imageUrl").notNull(),
  linkUrl: text("linkUrl").notNull(),
  targetCategory: varchar("targetCategory", { length: 100 }), // null = all categories
  placement: mysqlEnum("placement", ["list_banner", "detail_sidebar", "checkout"]).default("list_banner").notNull(),
  startsAt: timestamp("startsAt").notNull(),
  endsAt: timestamp("endsAt").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  impressions: int("impressions").default(0).notNull(),
  clicks: int("clicks").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Ad = typeof ads.$inferSelect;
export type InsertAd = typeof ads.$inferInsert;

// ─── Event Reminders ─────────────────────────────────────────────────────────
export const eventReminders = mysqlTable("event_reminders", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  userId: int("userId").notNull(),
  orderId: int("orderId").notNull(),
  reminderType: mysqlEnum("reminderType", ["24h", "1h"]).default("24h").notNull(),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EventReminder = typeof eventReminders.$inferSelect;

// ─── Platform Settings ────────────────────────────────────────────────────────
export const platformSettings = mysqlTable("platform_settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Announcements ────────────────────────────────────────────────────────────
export const announcements = mysqlTable("announcements", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  type: mysqlEnum("type", ["info", "warning", "success", "event"]).default("info").notNull(),
  isPublished: boolean("isPublished").default(false).notNull(),
  publishedAt: timestamp("publishedAt"),
  expiresAt: timestamp("expiresAt"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = typeof announcements.$inferInsert;

// ─── Seat Maps（指定席マップ） ────────────────────────────────────────────────
export const seatMaps = mysqlTable("seat_maps", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  ticketId: int("ticketId").notNull(), // どのチケット種別に紐づくか
  name: varchar("name", { length: 255 }).notNull(), // 例: "S席エリア"
  // シンプル型（グリッド）
  rows: int("rows").notNull().default(0),         // 行数（縦）
  cols: int("cols").notNull().default(0),         // 列数（横）
  rowLabel: varchar("rowLabel", { length: 10 }).default("A").notNull(), // 行ラベル開始（A〜Z）
  colStartNumber: int("colStartNumber").default(1).notNull(), // 列番号開始
  // ビジュアル型（SVGマップ）
  mapType: mysqlEnum("mapType", ["simple", "visual"]).default("simple").notNull(),
  svgWidth: int("svgWidth"),           // SVGキャンバス幅（ビジュアル型のみ）
  svgHeight: int("svgHeight"),         // SVGキャンバス高さ（ビジュアル型のみ）
  sourceImageUrl: text("sourceImageUrl"),  // アップロードされたPDF→画像のS3 URL
  analyzeStatus: mysqlEnum("analyzeStatus", ["none", "processing", "completed", "failed"]).default("none").notNull(),
  analyzeError: text("analyzeError"),  // 解析エラーメッセージ
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SeatMap = typeof seatMaps.$inferSelect;
export type InsertSeatMap = typeof seatMaps.$inferInsert;

// ─── Seats（個別座席） ────────────────────────────────────────────────────────
export const seats = mysqlTable("seats", {
  id: int("id").autoincrement().primaryKey(),
  seatMapId: int("seatMapId").notNull(),
  eventId: int("eventId").notNull(),
  seatNumber: varchar("seatNumber", { length: 20 }).notNull(), // 例: "A-1", "B-12"
  row: varchar("row", { length: 5 }).notNull(),   // 例: "A", "B"
  col: int("col").notNull(),                       // 例: 1, 2, 3
  // ビジュアル型追加フィールド
  posX: double("posX"),                            // SVG上のX座標（ビジュアル型のみ）
  posY: double("posY"),                            // SVG上のY座標（ビジュアル型のみ）
  shape: mysqlEnum("shape", ["circle", "rect"]).default("rect").notNull(),
  sectionName: varchar("sectionName", { length: 100 }), // セクション名（例: "S席", "A席"）
  sectionColor: varchar("sectionColor", { length: 20 }), // セクションカラー（例: "#FFD700"）
  status: mysqlEnum("status", ["available", "reserved", "sold", "blocked"]).default("available").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Seat = typeof seats.$inferSelect;
export type InsertSeat = typeof seats.$inferInsert;

// ─── Seat Reservations（座席予約） ───────────────────────────────────────────
export const seatReservations = mysqlTable("seat_reservations", {
  id: int("id").autoincrement().primaryKey(),
  seatId: int("seatId").notNull(),
  eventId: int("eventId").notNull(),
  userId: int("userId").notNull(),
  orderId: int("orderId"),           // 購入確定後に紐付け
  attendeeId: int("attendeeId"),     // チェックイン後に紐付け
  status: mysqlEnum("status", ["pending", "confirmed", "cancelled", "checked_in"]).default("pending").notNull(),
  expiresAt: timestamp("expiresAt"), // 仮押さえ有効期限（15分）
  checkedInAt: timestamp("checkedInAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SeatReservation = typeof seatReservations.$inferSelect;
export type InsertSeatReservation = typeof seatReservations.$inferInsert;

// ─── Seat Option Plans（指定席オプション課金） ───────────────────────────────
export const seatOptionPlans = mysqlTable("seat_option_plans", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  planType: mysqlEnum("planType", ["per_event", "monthly"]).default("per_event").notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  status: mysqlEnum("status", ["active", "expired", "cancelled"]).default("active").notNull(),
  eventId: int("eventId"),           // per_eventの場合のみ
  expiresAt: timestamp("expiresAt"), // monthlyの場合の有効期限
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type SeatOptionPlan = typeof seatOptionPlans.$inferSelect;

// ─── Guest Orders（ゲスト購入） ────────────────────────────────────────────────
export const guestOrders = mysqlTable("guest_orders", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  eventId: int("eventId").notNull(),
  tenantId: int("tenantId").notNull(),
  totalAmount: int("totalAmount").notNull().default(0),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  status: mysqlEnum("status", ["pending", "succeeded", "failed", "cancelled"]).default("pending").notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type GuestOrder = typeof guestOrders.$inferSelect;
export type InsertGuestOrder = typeof guestOrders.$inferInsert;

// ─── Tenant Notification Settings（主催者メール通知設定） ──────────────────────
export const tenantNotificationSettings = mysqlTable("tenant_notification_settings", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull().unique(),
  // チケット購入時の通知
  notifyOnPurchase: boolean("notifyOnPurchase").default(true).notNull(),
  // チェックイン時の通知
  notifyOnCheckin: boolean("notifyOnCheckin").default(false).notNull(),
  // キャンセル時の通知
  notifyOnCancel: boolean("notifyOnCancel").default(true).notNull(),
  // 日次サマリー通知（毎日の売上・参加者数まとめ）
  notifyDailySummary: boolean("notifyDailySummary").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type TenantNotificationSettings = typeof tenantNotificationSettings.$inferSelect;
export type InsertTenantNotificationSettings = typeof tenantNotificationSettings.$inferInsert;

// ─── Waitlists（キャンセル待ち） ────────────────────────────────────────────────
export const waitlists = mysqlTable("waitlists", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  eventId: int("eventId").notNull(),
  ticketId: int("ticketId").notNull(),
  tenantId: int("tenantId").notNull(),
  // 繰り上がり通知済みか
  notified: boolean("notified").default(false).notNull(),
  notifiedAt: timestamp("notifiedAt"),
  // 繰り上がり後の購入期限（48時間以内に購入しなければ次の人へ）
  purchaseDeadline: timestamp("purchaseDeadline"),
  // 優先順位（登録順）
  position: int("position").notNull().default(0),
  status: mysqlEnum("status", ["waiting", "notified", "purchased", "expired", "cancelled"]).default("waiting").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Waitlist = typeof waitlists.$inferSelect;
export type InsertWaitlist = typeof waitlists.$inferInsert;

// ─── Event Announcements（参加者向けアナウンス） ──────────────────────────────────
export const eventAnnouncements = mysqlTable("event_announcements", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  eventId: int("eventId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  // 送信対象（all: 全参加者, checked_in: チェックイン済みのみ, not_checked_in: 未チェックインのみ）
  targetAudience: mysqlEnum("targetAudience", ["all", "checked_in", "not_checked_in"]).default("all").notNull(),
  sentCount: int("sentCount").default(0).notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type EventAnnouncement = typeof eventAnnouncements.$inferSelect;
export type InsertEventAnnouncement = typeof eventAnnouncements.$inferInsert;

// ─── Reminder Settings（参加者リマインダー設定） ──────────────────────────────────
export const reminderSettings = mysqlTable("reminder_settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  attendeeId: int("attendeeId").notNull().unique(),
  eventId: int("eventId").notNull(),
  // 24時間前リマインダー
  remind24h: boolean("remind24h").default(true).notNull(),
  reminded24hAt: timestamp("reminded24hAt"),
  // 1時間前リマインダー
  remind1h: boolean("remind1h").default(true).notNull(),
  reminded1hAt: timestamp("reminded1hAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ReminderSetting = typeof reminderSettings.$inferSelect;
export type InsertReminderSetting = typeof reminderSettings.$inferInsert;

// ─── Event Favorites（お気に入りイベント） ────────────────────────────────────────
export const eventFavorites = mysqlTable("event_favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  eventId: int("eventId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type EventFavorite = typeof eventFavorites.$inferSelect;
export type InsertEventFavorite = typeof eventFavorites.$inferInsert;

// ─── Social Accounts（ソーシャルログイン連携） ────────────────────────────────────
// Google・LINEなどのOAuthプロバイダーとユーザーを紐付けるテーブル
// openId = "{provider}:{providerAccountId}" の形式でusersテーブルと紐付け
export const socialAccounts = mysqlTable("social_accounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  provider: mysqlEnum("provider", ["google", "line"]).notNull(),
  providerAccountId: varchar("providerAccountId", { length: 256 }).notNull(),
  email: varchar("email", { length: 320 }),
  name: text("name"),
  avatarUrl: text("avatarUrl"),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SocialAccount = typeof socialAccounts.$inferSelect;
export type InsertSocialAccount = typeof socialAccounts.$inferInsert;

// ─── Bank Accounts（主催者の振込先口座） ──────────────────────────────────────────
export const bankAccounts = mysqlTable("bank_accounts", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  // 銀行情報
  bankName: varchar("bankName", { length: 100 }).notNull(),
  bankCode: varchar("bankCode", { length: 10 }),
  branchName: varchar("branchName", { length: 100 }).notNull(),
  branchCode: varchar("branchCode", { length: 10 }),
  accountType: mysqlEnum("accountType", ["ordinary", "checking"]).default("ordinary").notNull(),
  accountNumber: varchar("accountNumber", { length: 20 }).notNull(),
  accountHolder: varchar("accountHolder", { length: 100 }).notNull(),
  // 状態
  isDefault: boolean("isDefault").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type BankAccount = typeof bankAccounts.$inferSelect;
export type InsertBankAccount = typeof bankAccounts.$inferInsert;

// ─── Payout Requests（精算申請） ──────────────────────────────────────────────────
export const payoutRequests = mysqlTable("payout_requests", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  eventId: int("eventId").notNull(),
  bankAccountId: int("bankAccountId").notNull(),
  requestedBy: int("requestedBy").notNull(), // userId
  // 金額情報
  grossAmount: int("grossAmount").notNull(),      // チケット販売総額（円）
  platformFee: int("platformFee").notNull(),      // プラットフォーム手数料（円）
  paymentFee: int("paymentFee").notNull(),        // 決済手数料（円）
  netAmount: int("netAmount").notNull(),          // 振込金額（円）= gross - platformFee - paymentFee
  // 状態管理
  status: mysqlEnum("status", [
    "pending",    // 申請中（管理者確認待ち）
    "approved",   // 承認済み（振込処理待ち）
    "transferred",// 振込完了
    "rejected",   // 却下
    "cancelled",  // キャンセル（主催者による取り消し）
  ]).default("pending").notNull(),
  // 管理者操作
  reviewedBy: int("reviewedBy"),                  // 承認/却下した管理者userId
  reviewedAt: timestamp("reviewedAt"),
  reviewNote: text("reviewNote"),                 // 承認/却下メモ
  // 振込情報
  transferredAt: timestamp("transferredAt"),
  transferNote: text("transferNote"),             // 振込メモ（振込番号など）
  // タイムスタンプ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type PayoutRequest = typeof payoutRequests.$inferSelect;
export type InsertPayoutRequest = typeof payoutRequests.$inferInsert;
