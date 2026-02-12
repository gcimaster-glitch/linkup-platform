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

export type Bindings = {
  DB: D1Database;
  AI: any;
  R2?: R2Bucket;
  R2_PUBLIC_DOMAIN?: string;
  IMGBB_API_KEY?: string;
  JWT_SECRET: string;
  RESEND_API_KEY: string;
  ENVIRONMENT: string;
  FRONTEND_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS middleware
app.use('/*', cors({
  origin: '*', // In production, replace with specific origins
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}));

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

// SEO Routes (sitemap.xml, og-image)
// Mounted at root so /sitemap.xml works directly
app.route('/', seoRoutes);

// Health check
app.get('/', (c) => c.text('LinkUp Backend API is running!'));

export default app;
