// 空ファイルとして作成 - 後で実装
import { Hono } from 'hono';
import type { Bindings } from '../index';

const userRoutes = new Hono<{ Bindings: Bindings }>();
const groupRoutes = new Hono<{ Bindings: Bindings }>();
const ticketRoutes = new Hono<{ Bindings: Bindings }>();
const orderRoutes = new Hono<{ Bindings: Bindings }>();
const checkinRoutes = new Hono<{ Bindings: Bindings }>();
const notificationRoutes = new Hono<{ Bindings: Bindings }>();
const campaignRoutes = new Hono<{ Bindings: Bindings }>();
const aiRoutes = new Hono<{ Bindings: Bindings }>();
const webhookRoutes = new Hono<{ Bindings: Bindings }>();

// TODO: 各ルートの実装

export {
  userRoutes,
  groupRoutes,
  ticketRoutes,
  orderRoutes,
  checkinRoutes,
  notificationRoutes,
  campaignRoutes,
  aiRoutes,
  webhookRoutes,
};
