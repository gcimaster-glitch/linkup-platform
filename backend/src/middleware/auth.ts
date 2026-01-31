import { Context, Next } from 'hono';
import { verify } from 'jsonwebtoken';
import type { Bindings } from '../index';

export async function authMiddleware(
  c: Context<{ Bindings: Bindings }>,
  next: Next
) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: Missing token' }, 401);
  }

  const token = authHeader.substring(7);

  try {
    const decoded = verify(token, c.env.JWT_SECRET) as { userId: string };
    
    // ユーザー情報をコンテキストに設定
    c.set('userId', decoded.userId);
    
    // ユーザーの存在確認
    const user = await c.env.DB
      .prepare('SELECT user_id, email, role FROM users WHERE user_id = ?')
      .bind(decoded.userId)
      .first();

    if (!user) {
      return c.json({ error: 'Unauthorized: User not found' }, 401);
    }

    c.set('user', user);
    await next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return c.json({ error: 'Unauthorized: Invalid token' }, 401);
  }
}

export async function organizerMiddleware(
  c: Context<{ Bindings: Bindings }>,
  next: Next
) {
  const user = c.get('user');

  if (!user || user.role !== 'organizer') {
    return c.json({ error: 'Forbidden: Organizer role required' }, 403);
  }

  await next();
}
