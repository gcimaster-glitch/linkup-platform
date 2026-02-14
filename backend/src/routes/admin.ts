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
    
    // DBからユーザー情報を取得
    const user: any = await c.env.DB
      .prepare('SELECT user_id, email, role, display_name, avatar_url, kyc_status FROM users WHERE user_id = ?')
      .bind(payload.sub)
      .first();
    
    if (!user) {
      return c.json({ error: 'User not found' }, 401);
    }
    
    // adminロールのみ許可
    if (user.role !== 'admin') {
      return c.json({ 
        error: 'Forbidden: Admin role required',
        message: '管理者権限が必要です',
        your_role: user.role
      }, 403);
    }
    
    c.set('user', user);
    c.set('userId', user.user_id);
    c.set('role', user.role);
    await next();
  } catch (e) {
    console.error('Admin auth error:', e);
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
  const user = c.get('user');
  const adminId = user.user_id;

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

// イベント一覧取得（承認待ち含む）
adminRoutes.get('/events', async (c) => {
  try {
    const status = c.req.query('status'); // 'pending', 'published', 'rejected', 'all'
    
    let query = 'SELECT * FROM events';
    const params: any[] = [];
    
    if (status && status !== 'all') {
      query += ' WHERE status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    return c.json({ success: true, events: results });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// イベント承認
adminRoutes.put('/events/:id/approve', async (c) => {
  const eventId = c.req.param('id');
  const user = c.get('user');
  const adminId = user.user_id;
  const db = c.env.DB;

  try {
    // イベントを承認済みに変更
    await db.prepare(`
      UPDATE events 
      SET 
        status = 'published', 
        approval_status = 'approved',
        approved_at = datetime('now'),
        approved_by = ?
      WHERE event_id = ?
    `).bind(adminId, eventId).run();
    
    // TODO: 主催者に承認通知メール送信
    // const event = await db.prepare('SELECT * FROM events WHERE event_id = ?').bind(eventId).first();
    // await sendApprovalEmail(event);
    
    return c.json({ success: true, message: 'イベントを承認しました' });
  } catch (e: any) {
    console.error('Event approval error:', e);
    return c.json({ error: e.message }, 500);
  }
});

// イベント却下
adminRoutes.put('/events/:id/reject', async (c) => {
  const eventId = c.req.param('id');
  const user = c.get('user');
  const adminId = user.user_id;
  const db = c.env.DB;
  const { reason } = await c.req.json();

  if (!reason) {
    return c.json({ error: '却下理由を入力してください' }, 400);
  }

  try {
    // イベントを却下に変更
    await db.prepare(`
      UPDATE events 
      SET 
        status = 'rejected', 
        approval_status = 'rejected',
        rejection_reason = ?,
        rejected_at = datetime('now'),
        rejected_by = ?
      WHERE event_id = ?
    `).bind(reason, adminId, eventId).run();
    
    // TODO: 主催者に却下通知メール送信
    // const event = await db.prepare('SELECT * FROM events WHERE event_id = ?').bind(eventId).first();
    // await sendRejectionEmail(event, reason);
    
    return c.json({ success: true, message: 'イベントを却下しました' });
  } catch (e: any) {
    console.error('Event rejection error:', e);
    return c.json({ error: e.message }, 500);
  }
});

// イベント削除
adminRoutes.delete('/events/:id', async (c) => {
  const eventId = c.req.param('id');
  const db = c.env.DB;

  try {
    // イベントを論理削除
    await db.prepare(`
      UPDATE events 
      SET status = 'deleted', deleted_at = datetime('now')
      WHERE event_id = ?
    `).bind(eventId).run();
    
    return c.json({ success: true, message: 'イベントを削除しました' });
  } catch (e: any) {
    console.error('Event deletion error:', e);
    return c.json({ error: e.message }, 500);
  }
});

// ユーザー一覧取得
adminRoutes.get('/users', async (c) => {
  try {
    const role = c.req.query('role'); // 'attendee', 'organizer', 'admin', 'all'
    const kycStatus = c.req.query('kyc'); // 'none', 'pending', 'verified', 'rejected', 'all'
    
    let query = 'SELECT user_id, email, display_name, role, avatar_url, kyc_status, email_verified, created_at, last_login FROM users WHERE 1=1';
    const params: any[] = [];
    
    if (role && role !== 'all') {
      query += ' AND role = ?';
      params.push(role);
    }
    
    if (kycStatus && kycStatus !== 'all') {
      query += ' AND kyc_status = ?';
      params.push(kycStatus);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    return c.json({ success: true, users: results });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// ユーザー詳細取得
adminRoutes.get('/users/:id', async (c) => {
  const userId = c.req.param('id');
  
  try {
    const user = await c.env.DB.prepare('SELECT * FROM users WHERE user_id = ?').bind(userId).first();
    
    if (!user) {
      return c.json({ error: 'ユーザーが見つかりません' }, 404);
    }
    
    return c.json({ success: true, user });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// ユーザー更新
adminRoutes.put('/users/:id', async (c) => {
  const userId = c.req.param('id');
  const body = await c.req.json();
  const db = c.env.DB;

  try {
    const updates: string[] = [];
    const params: any[] = [];
    
    if (body.display_name !== undefined) {
      updates.push('display_name = ?');
      params.push(body.display_name);
    }
    if (body.email !== undefined) {
      updates.push('email = ?');
      params.push(body.email);
    }
    if (body.role !== undefined) {
      updates.push('role = ?');
      params.push(body.role);
    }
    if (body.kyc_status !== undefined) {
      updates.push('kyc_status = ?');
      params.push(body.kyc_status);
    }
    
    if (updates.length === 0) {
      return c.json({ error: '更新する項目がありません' }, 400);
    }
    
    params.push(userId);
    
    await db.prepare(`
      UPDATE users 
      SET ${updates.join(', ')}, updated_at = datetime('now')
      WHERE user_id = ?
    `).bind(...params).run();
    
    return c.json({ success: true, message: 'ユーザー情報を更新しました' });
  } catch (e: any) {
    console.error('User update error:', e);
    return c.json({ error: e.message }, 500);
  }
});

// KYC承認
adminRoutes.put('/users/:id/kyc', async (c) => {
  const userId = c.req.param('id');
  const { status } = await c.req.json(); // 'verified' or 'rejected'
  const db = c.env.DB;

  if (!['verified', 'rejected'].includes(status)) {
    return c.json({ error: '無効なステータスです' }, 400);
  }

  try {
    await db.prepare(`
      UPDATE users 
      SET kyc_status = ?, updated_at = datetime('now')
      WHERE user_id = ?
    `).bind(status, userId).run();
    
    return c.json({ success: true, message: 'KYCステータスを更新しました' });
  } catch (e: any) {
    console.error('KYC update error:', e);
    return c.json({ error: e.message }, 500);
  }
});

// ダッシュボード統計
adminRoutes.get('/stats', async (c) => {
  const db = c.env.DB;
  
  try {
    // ユーザー統計
    const userStats: any = await db.prepare(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'organizer' THEN 1 ELSE 0 END) as total_organizers,
        SUM(CASE WHEN role = 'attendee' THEN 1 ELSE 0 END) as total_attendees,
        SUM(CASE WHEN kyc_status = 'verified' THEN 1 ELSE 0 END) as verified_users
      FROM users
    `).first();
    
    // イベント統計
    const eventStats: any = await db.prepare(`
      SELECT 
        COUNT(*) as total_events,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published_events,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_events,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft_events
      FROM events
    `).first();
    
    // 売上統計
    const revenueStats: any = await db.prepare(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(total_amount) as total_revenue,
        SUM(platform_fee) as total_platform_fees
      FROM orders
      WHERE payment_status = 'completed'
    `).first();
    
    return c.json({ 
      success: true, 
      stats: {
        users: userStats || {},
        events: eventStats || {},
        revenue: revenueStats || {}
      }
    });
  } catch (e: any) {
    console.error('Stats error:', e);
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
