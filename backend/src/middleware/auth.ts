import { Context, Next } from 'hono';
import { verify } from 'hono/jwt';
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
    const decoded = await verify(token, c.env.JWT_SECRET) as { sub: string };
    
    // ユーザー情報をコンテキストに設定
    c.set('userId', decoded.sub);
    
    // ユーザーの存在確認
    if (c.env.DB) {
        const user = await c.env.DB
          .prepare('SELECT user_id, email, role FROM users WHERE user_id = ?')
          .bind(decoded.sub)
          .first();

        if (!user) {
          return c.json({ error: 'Unauthorized: User not found' }, 401);
        }
        c.set('user', user);
    } else {
        // Fallback for mock/no-db
        c.set('user', { user_id: decoded.sub, role: 'organizer' });
    }

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
