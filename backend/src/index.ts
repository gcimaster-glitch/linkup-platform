import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import { groupRoutes } from './routes/groups';
import { eventRoutes } from './routes/events';
import { ticketRoutes } from './routes/tickets';
import { orderRoutes } from './routes/orders';
import { checkinRoutes } from './routes/checkin';
import { notificationRoutes } from './routes/notifications';
import { campaignRoutes } from './routes/campaigns';
import { aiRoutes } from './routes/ai';
import { webhookRoutes } from './routes/webhooks';

// 型定義
export type Bindings = {
  DB: D1Database;
  R2: R2Bucket;
  KV: KVNamespace;
  AI: any;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  GEMINI_API_KEY: string;
  NTT_API_KEY: string;
  NTT_API_SECRET: string;
  JWT_SECRET: string;
  FRONTEND_URL: string;
  ENVIRONMENT: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// ミドルウェア
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors({
  origin: (origin) => origin, // 本番環境では適切に制限
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

// ヘルスチェック
app.get('/', (c) => {
  return c.json({
    status: 'ok',
    service: 'Event Ticket Platform API',
    version: '1.0.0',
    environment: c.env.ENVIRONMENT,
  });
});

app.get('/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// ルート登録
app.route('/api/auth', authRoutes);
app.route('/api/users', userRoutes);
app.route('/api/groups', groupRoutes);
app.route('/api/events', eventRoutes);
app.route('/api/tickets', ticketRoutes);
app.route('/api/orders', orderRoutes);
app.route('/api/checkin', checkinRoutes);
app.route('/api/notifications', notificationRoutes);
app.route('/api/campaigns', campaignRoutes);
app.route('/api/ai', aiRoutes);
app.route('/webhooks', webhookRoutes);

// 404ハンドラ
app.notFound((c) => {
  return c.json({ error: 'Not Found', path: c.req.path }, 404);
});

// エラーハンドラ
app.onError((err, c) => {
  console.error(`Error: ${err.message}`, err);
  return c.json({
    error: 'Internal Server Error',
    message: c.env.ENVIRONMENT === 'development' ? err.message : 'An error occurred',
  }, 500);
});

export default app;
