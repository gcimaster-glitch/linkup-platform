import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware, organizerMiddleware } from '../middleware/auth';
import type { Bindings } from '../index';

const app = new Hono<{ Bindings: Bindings }>();

// Auth Middleware for all routes
app.use('*', authMiddleware);

// Organizer Middleware ONLY for management routes
// We'll apply it manually to GET / and POST /

const campaignSchema = z.object({
  title: z.string().min(1),
  campaign_type: z.enum(['early_bird', 'discount_code', 'featured_listing', 'email_blast', 'npo_support']),
  description: z.string().optional(),
  discount_type: z.enum(['percentage', 'fixed_amount']).optional(),
  discount_value: z.number().optional(),
  promo_code: z.string().optional(),
  start_datetime: z.string(),
  end_datetime: z.string(),
  status: z.enum(['active', 'paused', 'completed']).default('active')
});

// 検証用スキーマ
const verifySchema = z.object({
    promo_code: z.string().min(1),
    event_id: z.string().optional()
});

// List Campaigns (Organizer Only)
app.get('/', organizerMiddleware, async (c) => {
  const db = c.env.DB;
  const organizerId = c.get('userId');

  try {
    const { results } = await db.prepare(
      'SELECT * FROM campaigns WHERE organizer_id = ? ORDER BY created_at DESC'
    ).bind(organizerId).all();
    return c.json({ success: true, campaigns: results });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// Create Campaign (Organizer Only)
app.post('/', organizerMiddleware, zValidator('json', campaignSchema), async (c) => {
  const db = c.env.DB;
  const organizerId = c.get('userId');
  const body = c.req.valid('json');
  
  const campaignId = `cmp-${Date.now()}`;
  
  // Generate promo code if type is discount_code and code is missing
  let promoCode = body.promo_code;
  if (body.campaign_type === 'discount_code' && !promoCode) {
      promoCode = 'PROMO-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // Set default discount if missing (Demo logic)
  const discountType = body.discount_type || 'percentage';
  const discountValue = body.discount_value || 10; // 10% default

  try {
    await db.prepare(`
      INSERT INTO campaigns (
        campaign_id, organizer_id, title, campaign_type, description,
        discount_type, discount_value, promo_code,
        start_datetime, end_datetime, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      campaignId, organizerId, body.title, body.campaign_type, body.description || null,
      discountType, discountValue, promoCode || null,
      body.start_datetime, body.end_datetime, body.status
    ).run();

    return c.json({ success: true, campaign_id: campaignId, promo_code: promoCode });
  } catch (e: any) {
    console.error(e);
    return c.json({ error: e.message }, 500);
  }
});

// Verify Promo Code (Accessible by any logged in user)
app.post('/verify', zValidator('json', verifySchema), async (c) => {
    const db = c.env.DB;
    const { promo_code, event_id } = c.req.valid('json');
    const now = new Date().toISOString();

    try {
        const campaign: any = await db.prepare(`
            SELECT * FROM campaigns 
            WHERE promo_code = ? 
            AND status = 'active'
            AND start_datetime <= ?
            AND end_datetime >= ?
        `).bind(promo_code, now, now).first();

        if (!campaign) {
            return c.json({ success: false, error: '無効または期限切れのコードです' }, 404);
        }

        // Check if campaign is limited to specific event (if event_id set in campaign)
        if (campaign.event_id && event_id && campaign.event_id !== event_id) {
            return c.json({ success: false, error: 'このイベントには使用できません' }, 400);
        }

        // Check max uses
        if (campaign.max_uses && campaign.current_uses >= campaign.max_uses) {
            return c.json({ success: false, error: '利用上限に達しています' }, 400);
        }

        return c.json({ 
            success: true, 
            campaign: {
                id: campaign.campaign_id,
                title: campaign.title,
                discount_type: campaign.discount_type,
                discount_value: campaign.discount_value
            }
        });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

export { app as campaignRoutes };
