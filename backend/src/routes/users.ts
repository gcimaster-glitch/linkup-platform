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
