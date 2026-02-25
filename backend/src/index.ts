import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { eventRoutes } from './routes/events';
import { orderRoutes } from './routes/orders';
import { organizerRoutes } from './routes/organizer';
import { authRoutes } from './routes/auth';
import { campaignRoutes } from './routes/campaigns';
import { seoRoutes } from './routes/seo';
import { emailRoutes } from './routes/email';
import { adminRoutes } from './routes/admin';
import { uploadRoutes } from './routes/upload';
import { userRoutes } from './routes/users';
import { transferRoutes } from './routes/transfers';
import { checkinRoutes } from './routes/checkin';
import { paymentRoutes } from './routes/payment';

export type Bindings = {
  DB: D1Database;
  AI: any;
  R2?: R2Bucket;
  R2_PUBLIC_DOMAIN?: string;
  IMGBB_API_KEY?: string;
  JWT_SECRET: string;
  RESEND_API_KEY: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_PUBLISHABLE_KEY?: string;
  ENVIRONMENT: string;
  FRONTEND_URL: string;
};

// Context variables set by auth middleware
export type Variables = {
  userId: string;
  user: any;
  role: string;
};

// ─── レート制限ストア（メモリ内: Workersのリクエスト間で共有しないが十分な抑止力） ───
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function rateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true; // allowed
  }

  if (entry.count >= maxRequests) {
    return false; // blocked
  }

  entry.count++;
  return true; // allowed
}

// ─── 許可オリジン ────────────────────────────────────
const ALLOWED_ORIGINS = [
  'https://link-up.live',
  'https://www.link-up.live',
  'https://linkup-platform.pages.dev',
  // ローカル開発用
  'http://localhost:3000',
  'http://localhost:8080',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:8080',
];

const app = new Hono<{ Bindings: Bindings }>();

// ─── CORS middleware（特定オリジンのみ許可） ──────────
app.use('/*', async (c, next) => {
  const origin = c.req.header('Origin') || '';
  const allowed = ALLOWED_ORIGINS.includes(origin);

  // Preflight
  if (c.req.method === 'OPTIONS') {
    const headers: Record<string, string> = {
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Max-Age': '600',
    };
    if (allowed) {
      headers['Access-Control-Allow-Origin'] = origin;
      headers['Access-Control-Allow-Credentials'] = 'true';
    }
    return new Response(null, { status: 204, headers });
  }

  await next();

  if (allowed) {
    c.res.headers.set('Access-Control-Allow-Origin', origin);
    c.res.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  // セキュリティヘッダー
  c.res.headers.set('X-Content-Type-Options', 'nosniff');
  c.res.headers.set('X-Frame-Options', 'DENY');
  c.res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
});

// ─── レート制限ミドルウェア（ログイン・登録エンドポイント） ─
app.use('/api/auth/login', async (c, next) => {
  if (c.req.method === 'POST') {
    const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';
    const key = `login:${ip}`;
    // 10分間に20回まで
    if (!rateLimit(key, 20, 10 * 60 * 1000)) {
      return c.json({
        error: 'Too Many Requests',
        message: 'ログイン試行が多すぎます。しばらく経ってから再試行してください。',
      }, 429);
    }
  }
  await next();
});

app.use('/api/auth/register', async (c, next) => {
  if (c.req.method === 'POST') {
    const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';
    const key = `register:${ip}`;
    // 1時間に10回まで
    if (!rateLimit(key, 10, 60 * 60 * 1000)) {
      return c.json({
        error: 'Too Many Requests',
        message: '登録試行が多すぎます。しばらく経ってから再試行してください。',
      }, 429);
    }
  }
  await next();
});

// Logger middleware
app.use('*', logger());

// Routes
app.route('/api/auth', authRoutes);
app.route('/api/events', eventRoutes);
app.route('/api/orders', orderRoutes);
app.route('/api/organizer', organizerRoutes);
app.route('/api/email', emailRoutes);
app.route('/api/campaigns', campaignRoutes);
app.route('/api/admin', adminRoutes);
app.route('/api/upload', uploadRoutes);
app.route('/api/users', userRoutes);
app.route('/api/transfers', transferRoutes);
app.route('/api/checkin', checkinRoutes);
app.route('/api/payment', paymentRoutes);

// SEO Routes (sitemap.xml, og-image)
// Mounted at root so /sitemap.xml works directly
app.route('/', seoRoutes);

// Health check
app.get('/', (c) => c.text('LinkUp Backend API is running!'));

export default app;
