import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware, organizerMiddleware } from '../middleware/auth';
import type { Bindings, Variables } from '../index';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();


// Middleware
app.use('*', authMiddleware);
app.use('*', organizerMiddleware);

// Profile Settings Schema
const profileSchema = z.object({
  organization_name: z.string().min(1),
  description: z.string().optional(),
  website_url: z.string().url().optional().or(z.literal('')),
  type: z.enum(['corporate', 'npo', 'individual']),
  banner_image_url: z.string().optional()
});

// Payout Request Schema
const payoutSchema = z.object({
  amount: z.number().min(1000), // Min payout 1000 JPY
  is_early: z.boolean().default(false),
  bank_info: z.object({
    bank_name: z.string(),
    branch_name: z.string(),
    account_type: z.string(),
    account_number: z.string(),
    account_holder: z.string()
  }).optional()
});

// ダッシュボード統計
app.get('/stats', async (c) => {
  const db = c.env.DB;
  const organizerId = c.get('userId');

  try {
    // 1. 売上集計 (自分のイベントのオーダーを集計)
    // orders -> events -> organizer_id check
    const stats: any = await db.prepare(`
      SELECT 
        COUNT(o.order_id) as total_orders,
        SUM(o.total_amount) as total_revenue,
        SUM(o.platform_fee) as total_fees
      FROM orders o
      JOIN events e ON o.event_id = e.event_id
      WHERE e.organizer_id = ? AND o.payment_status = 'completed'
    `).bind(organizerId).first();

    // 2. イベント数
    const events: any = await db.prepare(`
      SELECT COUNT(*) as count FROM events WHERE organizer_id = ?
    `).bind(organizerId).first();

    // 3. プロフィール情報 (Fee計算用)
    const profile: any = await db.prepare('SELECT * FROM organizer_profiles WHERE organizer_id = ?').bind(organizerId).first();
    
    // 4. 手数料ロジック
    // デフォルト5%、NPO/個人は0%
    let feeRate = 5.0;
    if (profile && (profile.type === 'npo' || profile.type === 'individual')) {
        feeRate = 0.0;
    }

    return c.json({
      success: true,
      stats: {
        revenue: stats?.total_revenue || 0,
        platform_revenue: stats?.total_fees || 0,
        orders: stats?.total_orders || 0,
        events: events?.count || 0,
        followers: profile?.follower_count || 0,
        fee_rate: feeRate, // フロントエンド表示用
        organizer_type: profile?.type || 'corporate'
      }
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// イベント一覧 (管理用)
app.get('/events', async (c) => {
  const db = c.env.DB;
  const organizerId = c.get('userId');

  try {
    const { results } = await db.prepare(`
      SELECT * FROM events 
      WHERE organizer_id = ? 
      ORDER BY created_at DESC
    `).bind(organizerId).all();

    return c.json({ success: true, events: results });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 振込申請 作成
app.post('/payouts', zValidator('json', payoutSchema), async (c) => {
    const db = c.env.DB;
    const organizerId = c.get('userId');
    const { amount, is_early, bank_info } = c.req.valid('json');

    // 本来はここで残高チェックを行う (orders - payouts)
    // 今回は簡易的にチェックなしで作成

    // 手数料計算
    let feeRate = is_early ? 5.0 : 0.0; // 早期振込は一律5%
    const feeAmount = Math.floor(amount * (feeRate / 100));
    const payoutAmount = amount - feeAmount;

    try {
        const payoutId = `pyt-${Date.now()}`;
        
        await db.prepare(`
            INSERT INTO payouts (payout_id, organizer_id, amount, fee_amount, payout_amount, status, payout_method, bank_account_info)
            VALUES (?, ?, ?, ?, ?, 'requested', 'bank_transfer', ?)
        `).bind(
            payoutId,
            organizerId,
            amount,
            feeAmount,
            payoutAmount,
            bank_info ? JSON.stringify(bank_info) : null
        ).run();

        return c.json({ success: true, payout_id: payoutId });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// 振込申請 履歴
app.get('/payouts', async (c) => {
    const db = c.env.DB;
    const organizerId = c.get('userId');
    
    try {
        const { results } = await db.prepare('SELECT * FROM payouts WHERE organizer_id = ? ORDER BY requested_at DESC').bind(organizerId).all();
        return c.json({ success: true, payouts: results });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// プロフィール設定 取得
app.get('/settings', async (c) => {
    const db = c.env.DB;
    const organizerId = c.get('userId');
    const profile = await db.prepare('SELECT * FROM organizer_profiles WHERE organizer_id = ?').bind(organizerId).first();
    return c.json({ success: true, profile });
});

// プロフィール設定 更新
app.put('/settings', zValidator('json', profileSchema), async (c) => {
    const db = c.env.DB;
    const organizerId = c.get('userId');
    const body = c.req.valid('json');

    try {
        // Upsert logic
        const exists = await db.prepare('SELECT 1 FROM organizer_profiles WHERE organizer_id = ?').bind(organizerId).first();
        
        if (exists) {
            await db.prepare(`
                UPDATE organizer_profiles 
                SET organization_name = ?, description = ?, website_url = ?, type = ?, banner_image_url = ?
                WHERE organizer_id = ?
            `).bind(
                body.organization_name, 
                body.description || null, 
                body.website_url || null, 
                body.type,
                body.banner_image_url || null,
                organizerId
            ).run();
        } else {
            await db.prepare(`
                INSERT INTO organizer_profiles (organizer_id, organization_name, description, website_url, type, banner_image_url)
                VALUES (?, ?, ?, ?, ?, ?)
            `).bind(
                organizerId,
                body.organization_name, 
                body.description || null, 
                body.website_url || null, 
                body.type,
                body.banner_image_url || null
            ).run();
        }

        return c.json({ success: true });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// Download attendees CSV for an event
app.get('/events/:event_id/attendees/csv', async (c) => {
    const db = c.env.DB;
    const organizerId = c.get('userId');
    const eventId = c.req.param('event_id');

    try {
        // Verify event ownership
        const event: any = await db.prepare('SELECT organizer_id, title FROM events WHERE event_id = ?')
            .bind(eventId).first();
        
        if (!event) {
            return c.json({ error: 'Event not found' }, 404);
        }

        if (event.organizer_id !== organizerId) {
            return c.json({ error: 'Forbidden' }, 403);
        }

        // Fetch attendees data
        // orders テーブルは ticket_id と quantity を直接持つ
        // order_tickets テーブルは存在しないため orders + tickets を JOIN
        // users テーブルのカラム: user_id, email, display_name, phone_number, role 等
        const attendees = await db.prepare(`
            SELECT 
                u.user_id,
                u.display_name,
                u.email,
                u.phone_number,
                o.order_id,
                o.order_number,
                o.total_amount,
                o.created_at as purchase_date,
                o.quantity,
                o.payment_status,
                t.name as ticket_name,
                t.ticket_name as ticket_name_alt
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.user_id
            LEFT JOIN tickets t ON o.ticket_id = t.ticket_id
            WHERE o.event_id = ? AND o.payment_status = 'completed'
            ORDER BY o.created_at ASC
        `).bind(eventId).all();

        // Generate CSV
        const csvHeader = 'ユーザーID,氏名,メールアドレス,電話番号,注文番号,購入金額,購入日時,チケット名,数量\n';
        
        const csvRows = (attendees.results || []).map((a: any) => {
            const displayName = a.display_name || '';
            const phone = a.phone_number || '';
            const ticketName = a.ticket_name || a.ticket_name_alt || '一般参加';
            
            // Escape commas and quotes in CSV
            const escape = (str: string) => {
                str = String(str || '');
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            };

            return `${escape(a.user_id)},${escape(displayName)},${escape(a.email)},${escape(phone)},${escape(a.order_number)},${a.total_amount},${a.purchase_date},${escape(ticketName)},${a.quantity || 1}`;
        }).join('\n');

        const csv = csvHeader + csvRows;
        const fileName = `attendees_${eventId}_${new Date().toISOString().slice(0, 10)}.csv`;

        // Return CSV with proper headers
        return new Response(csv, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="${fileName}"`,
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (e: any) {
        console.error('Error generating attendees CSV:', e);
        return c.json({ error: e.message }, 500);
    }
});

export { app as organizerRoutes };
