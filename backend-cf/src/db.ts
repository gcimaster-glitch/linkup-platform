import { and, asc, desc, eq, gte, like, lte, or, sql } from "drizzle-orm";
import { getDb } from "./_core/db-client";
import {
  Attendee,
  Discount,
  Event,
  EventAnnouncement,
  GuestOrder,
  InsertEvent,
  InsertEventAnnouncement,
  InsertGuestOrder,
  InsertOrder,
  InsertReminderSetting,
  InsertSeatMap,
  InsertTenant,
  InsertTenantNotificationSettings,
  InsertUser,
  InsertWaitlist,
  Order,
  ReminderSetting,
  Tenant,
  TenantNotificationSettings,
  Ticket,
  Waitlist,
  attendees,
  discounts,
  eventAnnouncements,
  events,
  guestOrders,
  orderItems,
  orders,
  platformSettings,
  seatMaps,
  seatOptionPlans,
  seatReservations,
  seats,
  tenantMembers,
  reminderSettings,
  tenantNotificationSettings,
  tenants,
  tickets,
  users,
  waitlists,
  eventFavorites,
  EventFavorite,
  socialAccounts,
  InsertSocialAccount,
} from "./schema";
import { ENV } from "./_core/env";

// TiDB Serverless接続（Cloudflare Workers用）
export async function getDb() {
  if (!ENV.databaseUrl) {
    console.warn("[Database] DATABASE_URL not set");
    return null;
  }
  const { getDb: _getDb } = await import("./_core/db-client");
  return _getDb(ENV.databaseUrl);
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }

  values.lastSignedIn = new Date();
  updateSet.lastSignedIn = new Date();

  if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function getAllUsers(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt)).limit(limit).offset(offset);
}

export async function updateUserRole(userId: number, role: "user" | "admin") {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

export async function searchUsers(query: string, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  if (!query.trim()) {
    return db.select().from(users).orderBy(desc(users.createdAt)).limit(limit).offset(offset);
  }
  const q = `%${query}%`;
  return db.select().from(users)
    .where(or(like(users.name, q), like(users.email, q)))
    .orderBy(desc(users.createdAt)).limit(limit).offset(offset);
}

export async function suspendUser(userId: number, suspended: boolean) {
  const db = await getDb();
  if (!db) return;
  // suspendedフラグをbioフィールドに記録（schema変更不要の暫定実装）
  await db.update(users).set({ bio: suspended ? "__SUSPENDED__" : null }).where(eq(users.id, userId));
}

// ─── Tenants ──────────────────────────────────────────────────────────────────
export async function createTenant(data: InsertTenant): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(tenants).values(data);
  return (result[0] as any).insertId;
}

export async function getTenantById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tenants).where(eq(tenants.id, id)).limit(1);
  return result[0];
}

export async function getTenantBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tenants).where(eq(tenants.slug, slug)).limit(1);
  return result[0];
}

export async function getTenantByOwnerId(ownerId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tenants).where(eq(tenants.ownerId, ownerId)).limit(1);
  return result[0];
}

export async function getTenantForUser(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select({ tenant: tenants, role: tenantMembers.role })
    .from(tenantMembers)
    .innerJoin(tenants, eq(tenantMembers.tenantId, tenants.id))
    .where(eq(tenantMembers.userId, userId))
    .limit(1);
  return result[0];
}

export async function getAllTenants(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tenants).orderBy(desc(tenants.createdAt)).limit(limit).offset(offset);
}

export async function updateTenant(id: number, data: Partial<Tenant>) {
  const db = await getDb();
  if (!db) return;
  await db.update(tenants).set(data).where(eq(tenants.id, id));
}

export async function addTenantMember(tenantId: number, userId: number, role: "owner" | "admin" | "member") {
  const db = await getDb();
  if (!db) return;
  await db.insert(tenantMembers).values({ tenantId, userId, role });
}

// ─── Events ───────────────────────────────────────────────────────────────────
export async function createEvent(data: InsertEvent): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(events).values(data);
  return (result[0] as any).insertId;
}

export async function getEventById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select({
      id: events.id,
      tenantId: events.tenantId,
      title: events.title,
      description: events.description,
      coverImageUrl: events.coverImageUrl,
      location: events.location,
      onlineUrl: events.onlineUrl,
      isOnline: events.isOnline,
      category: events.category,
      startDatetime: events.startDatetime,
      endDatetime: events.endDatetime,
      status: events.status,
      viewCount: events.viewCount,
      shareCount: events.shareCount,
      createdBy: events.createdBy,
      createdAt: events.createdAt,
      updatedAt: events.updatedAt,
      nearestStation: events.nearestStation,
      parkingInfo: events.parkingInfo,
      accessNotes: events.accessNotes,
      organizerName: tenants.name,
      organizerSlug: tenants.slug,
      organizerLogoUrl: tenants.logoUrl,
      customFormFields: events.customFormFields,
      requiredKycLevel: events.requiredKycLevel,
    })
    .from(events)
    .leftJoin(tenants, eq(events.tenantId, tenants.id))
    .where(eq(events.id, id))
    .limit(1);
  return result[0];
}

export async function getPublishedEvents(opts: {
  search?: string;
  category?: string;
  isOnline?: boolean;
  dateFrom?: string;
  dateTo?: string;
  minPrice?: number;
  maxPrice?: number;
  hasAvailability?: boolean;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const baseConditions = [eq(events.status, "published")];
  if (opts.category) baseConditions.push(eq(events.category, opts.category));
  if (opts.isOnline !== undefined) baseConditions.push(eq(events.isOnline, opts.isOnline));
  if (opts.dateFrom) baseConditions.push(sql`${events.startDatetime} >= ${new Date(opts.dateFrom)}` as any);
  if (opts.dateTo) baseConditions.push(sql`${events.startDatetime} <= ${new Date(opts.dateTo)}` as any);

  // 価格帯・定員残数フィルタ（該当イベントに条件を満たすチケットが1種類以上存在すること）
  if (opts.minPrice !== undefined || opts.maxPrice !== undefined || opts.hasAvailability) {
    const ticketConditions: any[] = [];
    if (opts.minPrice !== undefined) ticketConditions.push(sql`${tickets.price} >= ${opts.minPrice}`);
    if (opts.maxPrice !== undefined) ticketConditions.push(sql`${tickets.price} <= ${opts.maxPrice}`);
    if (opts.hasAvailability) {
      ticketConditions.push(
        sql`${tickets.quantity} > (SELECT COALESCE(COUNT(*), 0) FROM attendees WHERE attendees.ticket_id = ${tickets.id} AND attendees.status != 'cancelled')`
      );
    }
    const priceSubquery = db
      .select({ eventId: tickets.eventId })
      .from(tickets)
      .where(and(...ticketConditions) as any)
      .groupBy(tickets.eventId);
    baseConditions.push(sql`${events.id} IN (${priceSubquery})` as any);
  }

  const selectFields = {
    id: events.id,
    tenantId: events.tenantId,
    title: events.title,
    description: events.description,
    coverImageUrl: events.coverImageUrl,
    location: events.location,
    onlineUrl: events.onlineUrl,
    isOnline: events.isOnline,
    category: events.category,
    startDatetime: events.startDatetime,
    endDatetime: events.endDatetime,
    status: events.status,
    createdBy: events.createdBy,
    createdAt: events.createdAt,
    updatedAt: events.updatedAt,
    organizerName: tenants.name,
    // アクティブチケットの最低価格（無料は0）
    lowestPrice: sql<number>`(SELECT COALESCE(MIN(t2.price), 0) FROM tickets t2 WHERE t2.eventId = ${events.id} AND t2.isActive = 1)`,
    // 総残席数（定員 - 発行済み）
    totalAvailable: sql<number>`(SELECT COALESCE(SUM(t3.quantity - t3.soldCount), 0) FROM tickets t3 WHERE t3.eventId = ${events.id} AND t3.isActive = 1)`,
    // 総定員
    totalCapacity: sql<number>`(SELECT COALESCE(SUM(t4.quantity), 0) FROM tickets t4 WHERE t4.eventId = ${events.id} AND t4.isActive = 1)`,
  };

  if (!opts.search) {
    return db
      .select(selectFields)
      .from(events)
      .leftJoin(tenants, eq(events.tenantId, tenants.id))
      .where(and(...baseConditions))
      .orderBy(desc(events.startDatetime))
      .limit(opts.limit ?? 20)
      .offset(opts.offset ?? 0);
  }

  // Full-text cross search: event title / description / category / location / organizer name
  const textConditions = [
    ...baseConditions,
    or(
      like(events.title, `%${opts.search}%`),
      like(events.description, `%${opts.search}%`),
      like(events.category, `%${opts.search}%`),
      like(events.location, `%${opts.search}%`),
      like(tenants.name, `%${opts.search}%`)
    ) as any,
  ];

  return db
    .select(selectFields)
    .from(events)
    .leftJoin(tenants, eq(events.tenantId, tenants.id))
    .where(and(...textConditions))
    .orderBy(desc(events.startDatetime))
    .limit(opts.limit ?? 20)
    .offset(opts.offset ?? 0);
}

export async function getEventsByTenant(tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(events).where(eq(events.tenantId, tenantId)).orderBy(desc(events.createdAt));
}

export async function updateEvent(id: number, data: Partial<Event>) {
  const db = await getDb();
  if (!db) return;
  await db.update(events).set(data).where(eq(events.id, id));
}

// ─── Tickets ──────────────────────────────────────────────────────────────────
export async function createTicket(data: typeof tickets.$inferInsert): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(tickets).values(data);
  return (result[0] as any).insertId;
}

export async function getTicketsByEvent(eventId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tickets).where(and(eq(tickets.eventId, eventId), eq(tickets.isActive, true)));
}

export async function getTicketById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tickets).where(eq(tickets.id, id)).limit(1);
  return result[0];
}

export async function updateTicket(id: number, data: Partial<Ticket>) {
  const db = await getDb();
  if (!db) return;
  await db.update(tickets).set(data).where(eq(tickets.id, id));
}

export async function deleteTicket(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(tickets).where(eq(tickets.id, id));
}

export async function incrementTicketSoldCount(ticketId: number, qty: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(tickets).set({ soldCount: sql`${tickets.soldCount} + ${qty}` }).where(eq(tickets.id, ticketId));
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export async function createOrder(data: InsertOrder): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(orders).values(data);
  return (result[0] as any).insertId;
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result[0];
}

export async function getOrdersByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function getOrdersByTenant(tenantId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.tenantId, tenantId)).orderBy(desc(orders.createdAt)).limit(limit);
}

export async function updateOrder(id: number, data: Partial<Order>) {
  const db = await getDb();
  if (!db) return;
  await db.update(orders).set(data).where(eq(orders.id, id));
}

export async function updateOrderByPaymentIntent(paymentIntentId: string, data: Partial<Order>) {
  const db = await getDb();
  if (!db) return;
  await db.update(orders).set(data).where(eq(orders.stripePaymentIntentId, paymentIntentId));
}

export async function getOrderByPaymentIntent(paymentIntentId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.stripePaymentIntentId, paymentIntentId)).limit(1);
  return result[0];
}

export async function createOrderItem(data: typeof orderItems.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(orderItems).values(data);
}

export async function getOrderItemsByOrder(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

// ─── Attendees ────────────────────────────────────────────────────────────────
export async function createAttendee(data: typeof attendees.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(attendees).values(data);
}

export async function getAttendeeById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(attendees).where(eq(attendees.id, id)).limit(1);
  return result[0];
}

export async function getAttendeeByQrHash(qrCodeHash: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(attendees).where(eq(attendees.qrCodeHash, qrCodeHash)).limit(1);
  return result[0];
}

export async function getAttendeesByEvent(eventId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ attendee: attendees, user: users })
    .from(attendees)
    .innerJoin(users, eq(attendees.userId, users.id))
    .where(eq(attendees.eventId, eventId))
    .orderBy(desc(attendees.createdAt));
}

export async function getAttendeesByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ attendee: attendees, event: events, ticket: tickets })
    .from(attendees)
    .innerJoin(events, eq(attendees.eventId, events.id))
    .innerJoin(tickets, eq(attendees.ticketId, tickets.id))
    .where(eq(attendees.userId, userId))
    .orderBy(desc(attendees.createdAt));
}

export async function getAttendeesByOrder(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(attendees).where(eq(attendees.orderId, orderId));
}
export async function updateAttendee(id: number, data: Partial<Attendee>) {
  const db = await getDb();
  if (!db) return;
  await db.update(attendees).set(data).where(eq(attendees.id, id));
}

// ─── Discounts ────────────────────────────────────────────────────────────────
export async function getDiscountByCode(code: string, tenantId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(discounts)
    .where(and(eq(discounts.code, code), eq(discounts.tenantId, tenantId), eq(discounts.isActive, true)))
    .limit(1);
  return result[0];
}

export async function createDiscount(data: typeof discounts.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(discounts).values(data);
}

export async function getDiscountsByTenant(tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(discounts).where(eq(discounts.tenantId, tenantId)).orderBy(desc(discounts.createdAt));
}

// ─── Platform Settings ────────────────────────────────────────────────────────
export async function getPlatformSetting(key: string): Promise<string | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(platformSettings).where(eq(platformSettings.key, key)).limit(1);
  return result[0]?.value;
}

export async function setPlatformSetting(key: string, value: string) {
  const db = await getDb();
  if (!db) return;
  await db
    .insert(platformSettings)
    .values({ key, value })
    .onDuplicateKeyUpdate({ set: { value } });
}

// ─── Admin Stats ──────────────────────────────────────────────────────────────
export async function getAdminStats() {
  const db = await getDb();
  if (!db) return { totalUsers: 0, totalTenants: 0, totalEvents: 0, totalRevenue: 0 };

  const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
  const [tenantCount] = await db.select({ count: sql<number>`count(*)` }).from(tenants);
  const [eventCount] = await db.select({ count: sql<number>`count(*)` }).from(events).where(eq(events.status, "published"));
  const [revenueResult] = await db
    .select({ total: sql<number>`COALESCE(SUM(totalAmount), 0)` })
    .from(orders)
    .where(eq(orders.status, "succeeded"));

  return {
    totalUsers: Number(userCount?.count ?? 0),
    totalTenants: Number(tenantCount?.count ?? 0),
    totalEvents: Number(eventCount?.count ?? 0),
    totalRevenue: Number(revenueResult?.total ?? 0),
  };
}

export async function getTenantStats(tenantId: number) {
  const db = await getDb();
  if (!db) return { totalRevenue: 0, totalOrders: 0, totalAttendees: 0 };

  const [revenueResult] = await db
    .select({ total: sql<number>`COALESCE(SUM(totalAmount), 0)` })
    .from(orders)
    .where(and(eq(orders.tenantId, tenantId), eq(orders.status, "succeeded")));

  const [orderCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(and(eq(orders.tenantId, tenantId), eq(orders.status, "succeeded")));

  const [attendeeCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(attendees)
    .where(eq(attendees.tenantId, tenantId));

  return {
    totalRevenue: Number(revenueResult?.total ?? 0),
    totalOrders: Number(orderCount?.count ?? 0),
    totalAttendees: Number(attendeeCount?.count ?? 0),
  };
}

// ─── Monthly Sales for Organizer Dashboard ────────────────────────────────────────────────
export async function getMonthlySales(tenantId: number, months = 6) {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select({
      month: sql<string>`DATE_FORMAT(${orders.createdAt}, '%Y-%m')`,
      revenue: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
      orderCount: sql<number>`COUNT(${orders.id})`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.tenantId, tenantId),
        eq(orders.status, "succeeded"),
        sql`${orders.createdAt} >= DATE_SUB(NOW(), INTERVAL ${months} MONTH)`
      )
    )
    .groupBy(sql`DATE_FORMAT(${orders.createdAt}, '%Y-%m')`)
    .orderBy(sql`DATE_FORMAT(${orders.createdAt}, '%Y-%m') ASC`);
  return result.map((r) => ({
    month: r.month as string,
    revenue: Number(r.revenue),
    orderCount: Number(r.orderCount),
  }));
}

// ─── Per-Event Sales for Organizer Dashboard ────────────────────────────────────────────────
export async function getEventSales(tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select({
      eventId: orders.eventId,
      eventTitle: events.title,
      revenue: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
      orderCount: sql<number>`COUNT(${orders.id})`,
      attendeeCount: sql<number>`COALESCE(COUNT(${orders.id}), 0)`,
    })
    .from(orders)
    .innerJoin(events, eq(orders.eventId, events.id))
    .where(and(eq(orders.tenantId, tenantId), eq(orders.status, "succeeded")))
    .groupBy(orders.eventId, events.title)
    .orderBy(sql`SUM(${orders.totalAmount}) DESC`)
    .limit(10);
  return result.map((r) => ({
    eventId: r.eventId,
    eventTitle: r.eventTitle,
    revenue: Number(r.revenue),
    orderCount: Number(r.orderCount),
    attendeeCount: Number(r.attendeeCount),
  }));
}

// ─── Attendees with order info for CSV export ────────────────────────────────────────────────
export async function getAttendeesForExport(tenantId: number, eventId?: number) {
  const db = await getDb();
  if (!db) return [];
  const conditions: any[] = [eq(attendees.tenantId, tenantId)];
  if (eventId) conditions.push(eq(attendees.eventId, eventId));
  const result = await db
    .select({
      id: attendees.id,
      qrCodeHash: attendees.qrCodeHash,
      status: attendees.status,
      ticketType: tickets.name,
      checkedInAt: attendees.checkedInAt,
      eventTitle: events.title,
      createdAt: attendees.createdAt,
      userId: attendees.userId,
    })
    .from(attendees)
    .leftJoin(tickets, eq(attendees.ticketId, tickets.id))
    .leftJoin(events, eq(attendees.eventId, events.id))
    .where(and(...conditions))
    .orderBy(attendees.createdAt);
  return result;
}

// ─── Checkin Stats for an event ──────────────────────────────────────────────────────────────
export async function getCheckinStats(eventId: number, tenantId: number) {
  const db = await getDb();
  if (!db) return { total: 0, checkedIn: 0, pending: 0 };
  const [totalResult, checkedInResult] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(attendees)
      .where(and(eq(attendees.eventId, eventId), eq(attendees.tenantId, tenantId))),
    db
      .select({ count: sql<number>`count(*)` })
      .from(attendees)
      .where(
        and(
          eq(attendees.eventId, eventId),
          eq(attendees.tenantId, tenantId),
          eq(attendees.status, "checked_in")
        )
      ),
  ]);
  const total = Number(totalResult[0]?.count ?? 0);
  const checkedIn = Number(checkedInResult[0]?.count ?? 0);
  return { total, checkedIn, pending: total - checkedIn };
}

// ─── Event Change Notification ────────────────────────────────────────────────
/** イベントの購入済み参加者（issued/checked_in）のメールアドレス・名前を取得 */
export async function getAttendeeEmailsByEvent(eventId: number): Promise<Array<{ email: string; name: string }>> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({ email: users.email, name: users.name })
    .from(attendees)
    .innerJoin(users, eq(attendees.userId, users.id))
    .where(
      and(
        eq(attendees.eventId, eventId),
        or(eq(attendees.status, "issued"), eq(attendees.status, "checked_in"))
      )
    );
  // deduplicate by email
  const seen = new Set<string>();
  return rows.filter((r) => {
    if (!r.email) return false;
    if (seen.has(r.email)) return false;
    seen.add(r.email);
    return true;
  }) as Array<{ email: string; name: string }>;
}

// ─── Seat Maps ────────────────────────────────────────────────────────────────
export async function createSeatMap(data: InsertSeatMap): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(seatMaps).values(data);
  return (result[0] as any).insertId;
}

export async function getSeatMapsByEvent(eventId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(seatMaps).where(and(eq(seatMaps.eventId, eventId), eq(seatMaps.isActive, true)));
}

export async function getSeatMapById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(seatMaps).where(eq(seatMaps.id, id)).limit(1);
  return result[0];
}

export async function updateSeatMap(id: number, data: Partial<typeof seatMaps.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(seatMaps).set(data).where(eq(seatMaps.id, id));
}

export async function deleteSeatMap(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(seatMaps).set({ isActive: false }).where(eq(seatMaps.id, id));
}

// ─── Seats ────────────────────────────────────────────────────────────────────
export async function createSeatsForMap(seatMapId: number, eventId: number, rows: number, cols: number, rowLabel: string, colStartNumber: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  // 行ラベルを生成（A, B, C...）
  const rowLabels: string[] = [];
  const startCharCode = rowLabel.toUpperCase().charCodeAt(0);
  for (let r = 0; r < rows; r++) {
    rowLabels.push(String.fromCharCode(startCharCode + r));
  }

  const seatData: typeof seats.$inferInsert[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const colNum = colStartNumber + c;
      seatData.push({
        seatMapId,
        eventId,
        seatNumber: `${rowLabels[r]}-${colNum}`,
        row: rowLabels[r],
        col: colNum,
        status: "available",
      });
    }
  }

  // バッチ挿入
  if (seatData.length > 0) {
    await db.insert(seats).values(seatData);
  }
  return seatData.length;
}

export async function getSeatsByEvent(eventId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(seats).where(eq(seats.eventId, eventId)).orderBy(seats.row, seats.col);
}

export async function getSeatsBySeatMap(seatMapId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(seats).where(eq(seats.seatMapId, seatMapId)).orderBy(seats.row, seats.col);
}

export async function getSeatById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(seats).where(eq(seats.id, id)).limit(1);
  return result[0];
}

export async function updateSeatStatus(id: number, status: "available" | "reserved" | "sold" | "blocked") {
  const db = await getDb();
  if (!db) return;
  await db.update(seats).set({ status }).where(eq(seats.id, id));
}

// ─── Seat Reservations ────────────────────────────────────────────────────────
export async function createSeatReservation(data: typeof seatReservations.$inferInsert): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(seatReservations).values(data);
  return (result[0] as any).insertId;
}

export async function getSeatReservationByUserAndEvent(userId: number, eventId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(seatReservations)
    .where(
      and(
        eq(seatReservations.userId, userId),
        eq(seatReservations.eventId, eventId),
        or(
          eq(seatReservations.status, "pending"),
          eq(seatReservations.status, "confirmed")
        ) as any
      )
    )
    .limit(1);
  return result[0];
}

export async function getSeatReservationBySeat(seatId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(seatReservations)
    .where(
      and(
        eq(seatReservations.seatId, seatId),
        or(
          eq(seatReservations.status, "pending"),
          eq(seatReservations.status, "confirmed")
        ) as any
      )
    )
    .limit(1);
  return result[0];
}

export async function updateSeatReservation(id: number, data: Partial<typeof seatReservations.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(seatReservations).set(data).where(eq(seatReservations.id, id));
}

export async function getSeatReservationsByOrder(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ reservation: seatReservations, seat: seats })
    .from(seatReservations)
    .innerJoin(seats, eq(seatReservations.seatId, seats.id))
    .where(eq(seatReservations.orderId, orderId));
}

export async function expirePendingReservations() {
  const db = await getDb();
  if (!db) return;
  const now = new Date();
  // 期限切れのpending予約を取得してseatをavailableに戻す
  const expired = await db
    .select()
    .from(seatReservations)
    .where(
      and(
        eq(seatReservations.status, "pending"),
        sql`${seatReservations.expiresAt} < ${now}` as any
      )
    );
  for (const res of expired) {
    await db.update(seatReservations).set({ status: "cancelled" }).where(eq(seatReservations.id, res.id));
    await db.update(seats).set({ status: "available" }).where(eq(seats.id, res.seatId));
  }
}

// ─── Seat Option Plans ────────────────────────────────────────────────────────
export async function getActiveSeatOptionPlan(tenantId: number, eventId?: number) {
  const db = await getDb();
  if (!db) return undefined;
  const conditions = [eq(seatOptionPlans.tenantId, tenantId), eq(seatOptionPlans.status, "active")];
  if (eventId) conditions.push(eq(seatOptionPlans.eventId, eventId));
  const result = await db.select().from(seatOptionPlans).where(and(...conditions)).limit(1);
  return result[0];
}

export async function createSeatOptionPlan(data: typeof seatOptionPlans.$inferInsert): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(seatOptionPlans).values(data);
  return (result[0] as any).insertId;
}

// ─── Visual Seat Map DB Helpers ────────────────────────────────────────────────

/**
 * ビジュアル型座席マップの解析ステータスを更新する
 */
export async function updateSeatMapAnalyzeStatus(
  id: number,
  status: "none" | "processing" | "completed" | "failed",
  opts?: { sourceImageUrl?: string; svgWidth?: number; svgHeight?: number; analyzeError?: string }
) {
  const db = await getDb();
  if (!db) return;
  await db.update(seatMaps).set({
    analyzeStatus: status,
    ...(opts?.sourceImageUrl !== undefined ? { sourceImageUrl: opts.sourceImageUrl } : {}),
    ...(opts?.svgWidth !== undefined ? { svgWidth: opts.svgWidth } : {}),
    ...(opts?.svgHeight !== undefined ? { svgHeight: opts.svgHeight } : {}),
    ...(opts?.analyzeError !== undefined ? { analyzeError: opts.analyzeError } : {}),
  }).where(eq(seatMaps.id, id));
}

/**
 * ビジュアル型座席を一括挿入する（既存の座席を削除してから挿入）
 */
export async function replaceVisualSeats(
  seatMapId: number,
  eventId: number,
  seatList: Array<{
    seatNumber: string;
    row: string;
    col: number;
    posX: number;
    posY: number;
    shape: "circle" | "rect";
    sectionName?: string | null;
    sectionColor?: string | null;
  }>
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  // 既存の座席を削除
  await db.delete(seats).where(eq(seats.seatMapId, seatMapId));

  if (seatList.length === 0) return 0;

  // 新しい座席を一括挿入（500件ずつバッチ処理）
  const BATCH_SIZE = 500;
  let inserted = 0;
  for (let i = 0; i < seatList.length; i += BATCH_SIZE) {
    const batch = seatList.slice(i, i + BATCH_SIZE).map((s) => ({
      seatMapId,
      eventId,
      seatNumber: s.seatNumber,
      row: s.row,
      col: s.col,
      posX: s.posX,
      posY: s.posY,
      shape: s.shape,
      sectionName: s.sectionName ?? null,
      sectionColor: s.sectionColor ?? null,
      status: "available" as const,
    }));
    await db.insert(seats).values(batch);
    inserted += batch.length;
  }
  return inserted;
}

/**
 * ビジュアル型座席マップを取得する（mapType=visual のみ）
 */
export async function getVisualSeatMapById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(seatMaps).where(
    and(eq(seatMaps.id, id), eq(seatMaps.mapType, "visual"))
  ).limit(1);
  return result[0] ?? null;
}

/**
 * イベントのビジュアル型座席マップ一覧を取得する
 */
export async function getVisualSeatMapsByEvent(eventId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(seatMaps).where(
    and(eq(seatMaps.eventId, eventId), eq(seatMaps.mapType, "visual"), eq(seatMaps.isActive, true))
  );
}

// ─── Daily Sales for Organizer Dashboard ────────────────────────────────────────────────
/**
 * 直近 N 日間の日別売上を返す
 * @param tenantId テナントID
 * @param days 取得日数（デフォルト30日）
 */
export async function getDailySales(tenantId: number, days = 30) {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select({
      day: sql<string>`DATE_FORMAT(${orders.createdAt}, '%Y-%m-%d')`,
      revenue: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
      orderCount: sql<number>`COUNT(${orders.id})`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.tenantId, tenantId),
        eq(orders.status, "succeeded"),
        sql`${orders.createdAt} >= DATE_SUB(NOW(), INTERVAL ${days} DAY)`
      )
    )
    .groupBy(sql`DATE_FORMAT(${orders.createdAt}, '%Y-%m-%d')`)
    .orderBy(sql`DATE_FORMAT(${orders.createdAt}, '%Y-%m-%d') ASC`);
  return result.map((r) => ({
    day: r.day as string,
    revenue: Number(r.revenue),
    orderCount: Number(r.orderCount),
  }));
}

// ─── Weekly Sales for Organizer Dashboard ────────────────────────────────────────────────
/**
 * 直近 N 週間の週別売上を返す
 * @param tenantId テナントID
 * @param weeks 取得週数（デフォルト12週）
 */
export async function getWeeklySales(tenantId: number, weeks = 12) {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select({
      week: sql<string>`DATE_FORMAT(DATE_SUB(${orders.createdAt}, INTERVAL WEEKDAY(${orders.createdAt}) DAY), '%Y-%m-%d')`,
      revenue: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
      orderCount: sql<number>`COUNT(${orders.id})`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.tenantId, tenantId),
        eq(orders.status, "succeeded"),
        sql`${orders.createdAt} >= DATE_SUB(NOW(), INTERVAL ${weeks} WEEK)`
      )
    )
    .groupBy(sql`DATE_FORMAT(DATE_SUB(${orders.createdAt}, INTERVAL WEEKDAY(${orders.createdAt}) DAY), '%Y-%m-%d')`)
    .orderBy(sql`DATE_FORMAT(DATE_SUB(${orders.createdAt}, INTERVAL WEEKDAY(${orders.createdAt}) DAY), '%Y-%m-%d') ASC`);
  return result.map((r) => ({
    week: r.week as string,
    revenue: Number(r.revenue),
    orderCount: Number(r.orderCount),
  }));
}

// ─── Ticket Breakdown for Organizer Dashboard ────────────────────────────────────────────────
/**
 * チケット種別ごとの販売数・売上を返す（円グラフ用）
 * @param tenantId テナントID
 */
export async function getTicketBreakdown(tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select({
      ticketName: tickets.name,
      ticketPrice: tickets.price,
      quantity: sql<number>`COUNT(${attendees.id})`,
      revenue: sql<number>`COALESCE(SUM(${tickets.price}), 0)`,
    })
    .from(attendees)
    .innerJoin(tickets, eq(attendees.ticketId, tickets.id))
    .where(
      and(
        eq(attendees.tenantId, tenantId),
        or(eq(attendees.status, "issued"), eq(attendees.status, "checked_in"))
      )
    )
    .groupBy(tickets.id, tickets.name, tickets.price)
    .orderBy(sql`COUNT(${attendees.id}) DESC`)
    .limit(10);
  return result.map((r) => ({
    ticketName: r.ticketName,
    ticketPrice: Number(r.ticketPrice),
    quantity: Number(r.quantity),
    revenue: Number(r.revenue),
  }));
}

// ─── Phase 50: Individual Event Analytics ─────────────────────────────────────

/**
 * 個別イベントの分析データを取得する
 * - 日別売上推移（過去30日）
 * - チケット種別販売比率
 * - チェックイン率
 * - サマリー（総売上・注文数・参加者数）
 */
export async function getEventAnalytics(eventId: number, tenantId: number) {
  const db = await getDb();
  if (!db) {
    return {
      viewCount: 0,
      dailySales: [],
      ticketBreakdown: [],
      checkinStats: { total: 0, checkedIn: 0, rate: 0 },
      summary: { totalRevenue: 0, totalOrders: 0, totalAttendees: 0, conversionRate: 0 },
    };
  }

  // イベントの閲覧数を取得
  const eventRow = await db.select({ viewCount: events.viewCount }).from(events).where(eq(events.id, eventId)).limit(1);
  const viewCount = eventRow[0]?.viewCount ?? 0;

  // 日別売上推移（過去30日）
  const dailySalesResult = await db
    .select({
      date: sql<string>`DATE(${orders.createdAt})`,
      revenue: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
      orderCount: sql<number>`COUNT(${orders.id})`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.eventId, eventId),
        eq(orders.tenantId, tenantId),
        eq(orders.status, "succeeded"),
        sql`${orders.createdAt} >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
      )
    )
    .groupBy(sql`DATE(${orders.createdAt})`)
    .orderBy(sql`DATE(${orders.createdAt}) ASC`);

  // チケット種別販売比率
  const ticketBreakdownResult = await db
    .select({
      ticketName: tickets.name,
      ticketPrice: tickets.price,
      quantity: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)`,
      revenue: sql<number>`COALESCE(SUM(${orderItems.quantity} * ${orderItems.unitPrice}), 0)`,
    })
    .from(orderItems)
    .innerJoin(tickets, eq(orderItems.ticketId, tickets.id))
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(
      and(
        eq(tickets.eventId, eventId),
        eq(orders.status, "succeeded")
      )
    )
    .groupBy(tickets.id, tickets.name, tickets.price)
    .orderBy(sql`COALESCE(SUM(${orderItems.quantity}), 0) DESC`);

  // チェックイン統計
  const checkinResult = await db
    .select({
      status: attendees.status,
      count: sql<number>`COUNT(${attendees.id})`,
    })
    .from(attendees)
    .where(eq(attendees.eventId, eventId))
    .groupBy(attendees.status);

  const totalAttendees = checkinResult.reduce((sum, r) => sum + Number(r.count), 0);
  const checkedIn = checkinResult.find((r) => r.status === "checked_in");
  const checkedInCount = checkedIn ? Number(checkedIn.count) : 0;

  // サマリー
  const summaryResult = await db
    .select({
      totalRevenue: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
      totalOrders: sql<number>`COUNT(${orders.id})`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.eventId, eventId),
        eq(orders.tenantId, tenantId),
        eq(orders.status, "succeeded")
      )
    );

  const summary = summaryResult[0] ?? { totalRevenue: 0, totalOrders: 0 };
  const totalOrders = Number(summary.totalOrders);
  const conversionRate = viewCount > 0 ? Math.round((totalOrders / viewCount) * 100 * 10) / 10 : 0;

  return {
    viewCount,
    dailySales: dailySalesResult.map((r) => ({
      date: r.date,
      revenue: Number(r.revenue),
      orderCount: Number(r.orderCount),
    })),
    ticketBreakdown: ticketBreakdownResult.map((r) => ({
      ticketName: r.ticketName,
      ticketPrice: Number(r.ticketPrice),
      quantity: Number(r.quantity),
      revenue: Number(r.revenue),
    })),
    checkinStats: {
      total: totalAttendees,
      checkedIn: checkedInCount,
      rate: totalAttendees > 0 ? Math.round((checkedInCount / totalAttendees) * 100) : 0,
    },
    summary: {
      totalRevenue: Number(summary.totalRevenue),
      totalOrders,
      totalAttendees,
      conversionRate,
    },
  };
}

// ─── Guest Orders ─────────────────────────────────────────────────────────────
export async function createGuestOrder(data: InsertGuestOrder): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(guestOrders).values(data);
  return (result[0] as any).insertId;
}

export async function getGuestOrderByToken(token: string): Promise<GuestOrder | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(guestOrders).where(eq(guestOrders.token, token)).limit(1);
  return result[0];
}

export async function getGuestOrderById(id: number): Promise<GuestOrder | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(guestOrders).where(eq(guestOrders.id, id)).limit(1);
  return result[0];
}

export async function updateGuestOrder(id: number, data: Partial<GuestOrder>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(guestOrders).set(data as any).where(eq(guestOrders.id, id));
}

// ─── Tenant Notification Settings ─────────────────────────────────────────────
export async function getNotificationSettings(tenantId: number): Promise<TenantNotificationSettings | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(tenantNotificationSettings)
    .where(eq(tenantNotificationSettings.tenantId, tenantId))
    .limit(1);
  return result[0];
}

export async function upsertNotificationSettings(
  tenantId: number,
  data: Partial<Omit<InsertTenantNotificationSettings, "id" | "tenantId" | "createdAt" | "updatedAt">>
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .insert(tenantNotificationSettings)
    .values({ tenantId, ...data })
    .onDuplicateKeyUpdate({ set: data });
}

// ─── Waitlists（キャンセル待ち） ────────────────────────────────────────────────

export async function getWaitlistByUserAndTicket(userId: number, ticketId: number): Promise<Waitlist | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(waitlists)
    .where(
      and(
        eq(waitlists.userId, userId),
        eq(waitlists.ticketId, ticketId),
        or(eq(waitlists.status, "waiting"), eq(waitlists.status, "notified"))
      )
    )
    .limit(1);
  return result[0];
}

export async function getWaitlistByEvent(eventId: number): Promise<Waitlist[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(waitlists)
    .where(and(eq(waitlists.eventId, eventId), eq(waitlists.status, "waiting")))
    .orderBy(asc(waitlists.createdAt));
}

export async function getWaitlistCountByTicket(ticketId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(waitlists)
    .where(and(eq(waitlists.ticketId, ticketId), eq(waitlists.status, "waiting")));
  return result[0]?.count ?? 0;
}

export async function getWaitlistsByUser(userId: number): Promise<Waitlist[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(waitlists)
    .where(
      and(
        eq(waitlists.userId, userId),
        or(eq(waitlists.status, "waiting"), eq(waitlists.status, "notified"))
      )
    )
    .orderBy(desc(waitlists.createdAt));
}

export async function addToWaitlist(data: InsertWaitlist): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  // 現在の最大positionを取得して+1
  const maxPos = await db
    .select({ maxPos: sql<number>`COALESCE(MAX(${waitlists.position}), 0)` })
    .from(waitlists)
    .where(and(eq(waitlists.ticketId, data.ticketId), eq(waitlists.status, "waiting")));
  const position = (maxPos[0]?.maxPos ?? 0) + 1;
  const result = await db.insert(waitlists).values({ ...data, position });
  return (result[0] as any).insertId;
}

export async function removeFromWaitlist(userId: number, ticketId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(waitlists)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(
      and(
        eq(waitlists.userId, userId),
        eq(waitlists.ticketId, ticketId),
        or(eq(waitlists.status, "waiting"), eq(waitlists.status, "notified"))
      )
    );
}

export async function updateWaitlistStatus(
  id: number,
  status: "waiting" | "notified" | "purchased" | "expired" | "cancelled",
  extra?: { notifiedAt?: Date; purchaseDeadline?: Date }
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(waitlists)
    .set({ status, updatedAt: new Date(), ...extra })
    .where(eq(waitlists.id, id));
}

// ─── Event Announcements（参加者向けアナウンス） ──────────────────────────────────

export async function createEventAnnouncement(data: InsertEventAnnouncement): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(eventAnnouncements).values(data);
  return (result[0] as any).insertId;
}

export async function getEventAnnouncements(eventId: number): Promise<EventAnnouncement[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(eventAnnouncements)
    .where(eq(eventAnnouncements.eventId, eventId))
    .orderBy(desc(eventAnnouncements.createdAt));
}

export async function getEventAttendeeCount(
  eventId: number,
  audience: "all" | "checked_in" | "not_checked_in"
): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const conditions: any[] = [eq(attendees.eventId, eventId)];
  if (audience === "checked_in") conditions.push(eq(attendees.status, "checked_in"));
  if (audience === "not_checked_in") conditions.push(eq(attendees.status, "issued"));
  const result = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${attendees.userId})` })
    .from(attendees)
    .where(and(...conditions));
  return result[0]?.count ?? 0;
}

// ─── Reminder Settings（参加者リマインダー設定） ──────────────────────────────────
export async function upsertReminderSetting(data: InsertReminderSetting): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .insert(reminderSettings)
    .values(data)
    .onDuplicateKeyUpdate({
      set: {
        remind24h: data.remind24h,
        remind1h: data.remind1h,
        updatedAt: new Date(),
      },
    });
}

export async function getReminderSettingByAttendee(attendeeId: number): Promise<ReminderSetting | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(reminderSettings)
    .where(eq(reminderSettings.attendeeId, attendeeId))
    .limit(1);
  return result[0];
}

export async function getReminderSettingsByUser(userId: number): Promise<ReminderSetting[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reminderSettings).where(eq(reminderSettings.userId, userId));
}

/**
 * リマインダー送信対象を取得する
 * - windowStart〜windowEnd の間に開催されるイベントの参加者で
 * - リマインダー設定が有効かつ未送信のもの
 */
export async function getPendingReminders(opts: {
  windowStart: Date;
  windowEnd: Date;
  type: "24h" | "1h";
}): Promise<
  Array<{
    reminderSetting: ReminderSetting;
    attendee: Attendee;
    event: Event;
    ticket: Ticket;
    userEmail: string | null;
    userName: string | null;
  }>
> {
  const db = await getDb();
  if (!db) return [];

  const sentAtCol = opts.type === "24h" ? reminderSettings.reminded24hAt : reminderSettings.reminded1hAt;
  const enabledCol = opts.type === "24h" ? reminderSettings.remind24h : reminderSettings.remind1h;

  const rows = await db
    .select({
      reminderSetting: reminderSettings,
      attendee: attendees,
      event: events,
      ticket: tickets,
      userEmail: users.email,
      userName: users.name,
    })
    .from(reminderSettings)
    .innerJoin(attendees, eq(reminderSettings.attendeeId, attendees.id))
    .innerJoin(events, eq(reminderSettings.eventId, events.id))
    .innerJoin(tickets, eq(attendees.ticketId, tickets.id))
    .innerJoin(users, eq(reminderSettings.userId, users.id))
    .where(
      and(
        eq(enabledCol, true),
        sql`${sentAtCol} IS NULL`,
        eq(attendees.status, "issued"),
        gte(events.startDatetime, opts.windowStart),
        lte(events.startDatetime, opts.windowEnd)
      )
    );

  return rows;
}

export async function markReminderSent(id: number, type: "24h" | "1h"): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const now = new Date();
  if (type === "24h") {
    await db.update(reminderSettings).set({ reminded24hAt: now, updatedAt: now }).where(eq(reminderSettings.id, id));
  } else {
    await db.update(reminderSettings).set({ reminded1hAt: now, updatedAt: now }).where(eq(reminderSettings.id, id));
  }
}

// ─── Event Favorites（お気に入り） ────────────────────────────────────────────────
export async function getFavoritesByUser(userId: number): Promise<EventFavorite[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(eventFavorites).where(eq(eventFavorites.userId, userId)).orderBy(desc(eventFavorites.createdAt));
}

export async function getFavoriteEventIds(userId: number): Promise<number[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({ eventId: eventFavorites.eventId }).from(eventFavorites).where(eq(eventFavorites.userId, userId));
  return rows.map((r) => r.eventId);
}

export async function addFavorite(userId: number, eventId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  // 重複を避けるため既存チェック
  const existing = await db.select().from(eventFavorites).where(and(eq(eventFavorites.userId, userId), eq(eventFavorites.eventId, eventId))).limit(1);
  if (existing.length === 0) {
    await db.insert(eventFavorites).values({ userId, eventId });
  }
}

export async function removeFavorite(userId: number, eventId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(eventFavorites).where(and(eq(eventFavorites.userId, userId), eq(eventFavorites.eventId, eventId)));
}

// ─── Social Accounts（ソーシャルログイン） ────────────────────────────────────────
export async function findSocialAccount(provider: "google" | "line", providerAccountId: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(socialAccounts)
    .where(and(eq(socialAccounts.provider, provider), eq(socialAccounts.providerAccountId, providerAccountId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertSocialAccount(data: InsertSocialAccount): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .insert(socialAccounts)
    .values(data)
    .onDuplicateKeyUpdate({
      set: {
        userId: data.userId,
        name: data.name ?? null,
        email: data.email ?? null,
        updatedAt: new Date(),
      },
    });
}
