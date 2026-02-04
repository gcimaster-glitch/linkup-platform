import { Hono } from 'hono';
import type { Bindings } from '../index';
import { verify } from 'hono/jwt';
import * as bcrypt from 'bcryptjs';

const adminRoutes = new Hono<{ Bindings: Bindings }>();

// Admin Auth Middleware
adminRoutes.use('/*', async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) return c.json({ error: 'Unauthorized' }, 401);
  const token = authHeader.split(' ')[1];
  try {
    const payload = await verify(token, c.env.JWT_SECRET);
    // デモ用: adminロールまたは特定のIDを許可
    if (payload.role !== 'admin' && payload.sub !== 'u-admin-001') { 
        // return c.json({ error: 'Forbidden' }, 403);
    }
    c.set('user', payload);
    await next();
  } catch (e) {
    return c.json({ error: 'Invalid token' }, 401);
  }
});

// システム設定の取得
adminRoutes.get('/settings', async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM system_settings').all();
    
    const settings: Record<string, any> = {};
    if (results) {
        results.forEach((row: any) => {
            settings[row.key] = row.value;
        });
    }
    
    return c.json({ success: true, settings });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// システム設定の更新
adminRoutes.put('/settings', async (c) => {
  const body = await c.req.json();
  const db = c.env.DB;
  
  try {
    const stmt = db.prepare('INSERT OR REPLACE INTO system_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)');
    const batch = [];
    
    for (const [key, value] of Object.entries(body)) {
        batch.push(stmt.bind(key, String(value)));
    }
    
    if (batch.length > 0) {
        await db.batch(batch);
    }
    
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// 振込申請一覧
adminRoutes.get('/payouts', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
        SELECT p.*, u.display_name as organizer_name, u.email as organizer_email 
        FROM payouts p 
        JOIN users u ON p.organizer_id = u.user_id 
        ORDER BY p.requested_at DESC
    `).all();
    return c.json({ success: true, payouts: results });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// 振込申請の承認/却下
adminRoutes.put('/payouts/:id', async (c) => {
  const payoutId = c.req.param('id');
  const { status } = await c.req.json();
  const adminId = c.get('user').sub;

  if (!['approved', 'rejected', 'paid'].includes(status)) {
      return c.json({ error: 'Invalid status' }, 400);
  }

  try {
    await c.env.DB.prepare(`
        UPDATE payouts 
        SET status = ?, processed_at = CURRENT_TIMESTAMP, processed_by = ? 
        WHERE payout_id = ?
    `).bind(status, adminId, payoutId).run();
    
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// データベース一括リセット & シード (Admin Only)
adminRoutes.post('/reset', async (c) => {
    const db = c.env.DB;
    try {
        // 1. 全データ削除
        await db.batch([
            db.prepare('DELETE FROM event_answers'),
            db.prepare('DELETE FROM event_questions'),
            db.prepare('DELETE FROM order_tickets'),
            db.prepare('DELETE FROM orders'),
            db.prepare('DELETE FROM tickets'),
            db.prepare('DELETE FROM analytics'),
            db.prepare('DELETE FROM campaigns'),
            db.prepare('DELETE FROM messages'),
            db.prepare('DELETE FROM notifications'),
            db.prepare('DELETE FROM followers'),
            db.prepare('DELETE FROM payouts'),
            db.prepare('DELETE FROM subscriptions'),
            db.prepare('DELETE FROM events'),
            db.prepare('DELETE FROM groups'),
            db.prepare('DELETE FROM organizer_profiles'),
            db.prepare('DELETE FROM users') // 全ユーザー削除して再作成
        ]);
        
        // 2. 初期ユーザーのシード
        const passwordHash = await bcrypt.hash('demo123', 10);
        const adminIcon = `https://ui-avatars.com/api/?name=Super+Admin&background=EF4444&color=fff`;
        const orgIcon = `https://ui-avatars.com/api/?name=LinkUp+Official&background=2563EB&color=fff`;

        await db.batch([
            db.prepare(`
                INSERT INTO users (user_id, email, password_hash, display_name, role, avatar_url, kyc_status, created_at)
                VALUES 
                ('u-admin-001', 'admin@linkup.example.com', ?, 'Super Admin', 'admin', ?, 'verified', CURRENT_TIMESTAMP),
                ('u-organizer-001', 'organizer@linkup.example.com', ?, 'LinkUp Official', 'organizer', ?, 'verified', CURRENT_TIMESTAMP)
            `).bind(passwordHash, adminIcon, passwordHash, orgIcon),
            
            db.prepare(`
                INSERT INTO organizer_profiles (organizer_id, organization_name, rating, created_at)
                VALUES ('u-organizer-001', 'LinkUp Official', 5.0, CURRENT_TIMESTAMP)
            `)
        ]);

        return c.json({ success: true, message: 'Database reset and seeded with Demo Accounts' });
    } catch (e: any) {
        console.error(e);
        return c.json({ error: e.message }, 500);
    }
});

export { adminRoutes };
