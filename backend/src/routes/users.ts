import { Hono } from 'hono';
import type { Bindings } from '../index';
import { authMiddleware } from '../middleware/auth';

const userRoutes = new Hono<{ Bindings: Bindings, Variables: { userId: string } }>();

// 認証が必要なルート
userRoutes.use('/*', authMiddleware);

// ユーザーの興味・関心タグ取得
userRoutes.get('/interests', async (c) => {
  const db = c.env.DB;
  const userId = c.get('userId');

  try {
    const { results } = await db.prepare(`
      SELECT tag 
      FROM user_interests 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).bind(userId).all();

    const tags = results.map((row: any) => row.tag);
    
    return c.json({ success: true, tags });
  } catch (error: any) {
    console.error('Get interests error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ユーザーの興味・関心タグ追加
userRoutes.post('/interests', async (c) => {
  const db = c.env.DB;
  const userId = c.get('userId');
  const { tag } = await c.req.json();

  if (!tag || typeof tag !== 'string' || tag.trim() === '') {
    return c.json({ error: 'タグを入力してください' }, 400);
  }

  const trimmedTag = tag.trim();

  try {
    // 重複チェック
    const existing = await db.prepare(`
      SELECT 1 FROM user_interests 
      WHERE user_id = ? AND tag = ?
    `).bind(userId, trimmedTag).first();

    if (existing) {
      return c.json({ error: 'このタグは既に登録されています' }, 400);
    }

    // タグ追加
    await db.prepare(`
      INSERT INTO user_interests (user_id, tag, created_at)
      VALUES (?, ?, datetime('now'))
    `).bind(userId, trimmedTag).run();

    return c.json({ success: true, message: 'タグを追加しました' });
  } catch (error: any) {
    console.error('Add interest error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ユーザーの興味・関心タグ削除
userRoutes.delete('/interests/:tag', async (c) => {
  const db = c.env.DB;
  const userId = c.get('userId');
  const tag = decodeURIComponent(c.req.param('tag'));

  try {
    await db.prepare(`
      DELETE FROM user_interests 
      WHERE user_id = ? AND tag = ?
    `).bind(userId, tag).run();

    return c.json({ success: true, message: 'タグを削除しました' });
  } catch (error: any) {
    console.error('Delete interest error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ユーザーのお気に入りイベント一覧取得
userRoutes.get('/favorites', async (c) => {
  const db = c.env.DB;
  const userId = c.get('userId');

  try {
    const { results } = await db.prepare(`
      SELECT 
        f.favorite_id,
        f.created_at as favorited_at,
        e.event_id,
        e.title,
        e.description,
        e.category,
        e.cover_image_url,
        e.venue_name,
        e.venue_address,
        e.start_datetime,
        e.end_datetime,
        e.organizer_name,
        e.status
      FROM user_favorites f
      LEFT JOIN events e ON f.event_id = e.event_id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `).bind(userId).all();

    return c.json({ success: true, favorites: results || [] });
  } catch (error: any) {
    console.error('Get favorites error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// イベントをお気に入りに追加
userRoutes.post('/favorites/:eventId', async (c) => {
  const db = c.env.DB;
  const userId = c.get('userId');
  const eventId = c.req.param('eventId');

  try {
    // イベント存在確認
    const event = await db.prepare('SELECT event_id FROM events WHERE event_id = ?')
      .bind(eventId).first();
    
    if (!event) {
      return c.json({ error: 'イベントが見つかりません' }, 404);
    }

    // 重複チェック
    const existing = await db.prepare(`
      SELECT 1 FROM user_favorites 
      WHERE user_id = ? AND event_id = ?
    `).bind(userId, eventId).first();

    if (existing) {
      return c.json({ error: '既にお気に入りに追加されています' }, 400);
    }

    // お気に入り追加
    const favoriteId = `fav-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await db.prepare(`
      INSERT INTO user_favorites (favorite_id, user_id, event_id, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `).bind(favoriteId, userId, eventId).run();

    return c.json({ 
      success: true, 
      message: 'お気に入りに追加しました',
      favorite_id: favoriteId
    });
  } catch (error: any) {
    console.error('Add favorite error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// イベントをお気に入りから削除
userRoutes.delete('/favorites/:eventId', async (c) => {
  const db = c.env.DB;
  const userId = c.get('userId');
  const eventId = c.req.param('eventId');

  try {
    const result = await db.prepare(`
      DELETE FROM user_favorites 
      WHERE user_id = ? AND event_id = ?
    `).bind(userId, eventId).run();

    if (result.meta.changes === 0) {
      return c.json({ error: 'お気に入りが見つかりません' }, 404);
    }

    return c.json({ 
      success: true, 
      message: 'お気に入りから削除しました'
    });
  } catch (error: any) {
    console.error('Delete favorite error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// お気に入り状態確認
userRoutes.get('/favorites/:eventId/check', async (c) => {
  const db = c.env.DB;
  const userId = c.get('userId');
  const eventId = c.req.param('eventId');

  try {
    const favorite = await db.prepare(`
      SELECT favorite_id FROM user_favorites 
      WHERE user_id = ? AND event_id = ?
    `).bind(userId, eventId).first();

    return c.json({ 
      success: true, 
      isFavorite: !!favorite 
    });
  } catch (error: any) {
    console.error('Check favorite error:', error);
    return c.json({ error: error.message }, 500);
  }
});

const groupRoutes = new Hono<{ Bindings: Bindings }>();
const ticketRoutes = new Hono<{ Bindings: Bindings }>();
const orderRoutes = new Hono<{ Bindings: Bindings }>();
const checkinRoutes = new Hono<{ Bindings: Bindings }>();
const notificationRoutes = new Hono<{ Bindings: Bindings }>();
const campaignRoutes = new Hono<{ Bindings: Bindings }>();
const aiRoutes = new Hono<{ Bindings: Bindings }>();
const webhookRoutes = new Hono<{ Bindings: Bindings }>();

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
