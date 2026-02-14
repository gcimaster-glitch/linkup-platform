import { Context, Next } from 'hono';
import { verify } from 'hono/jwt';
import type { Bindings } from '../index';

export async function authMiddleware(
  c: Context<{ Bindings: Bindings }>,
  next: Next
) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ 
      error: 'Unauthorized: Missing token',
      message: 'ログインが必要です'
    }, 401);
  }

  const token = authHeader.substring(7);

  try {
    const decoded = await verify(token, c.env.JWT_SECRET) as { sub: string; role?: string };
    
    // ユーザー情報をコンテキストに設定
    c.set('userId', decoded.sub);
    
    // ユーザーの存在確認とrole取得
    if (c.env.DB) {
        const user: any = await c.env.DB
          .prepare('SELECT user_id, email, role, display_name, avatar_url, kyc_status FROM users WHERE user_id = ?')
          .bind(decoded.sub)
          .first();

        if (!user) {
          return c.json({ 
            error: 'Unauthorized: User not found',
            message: 'ユーザーが見つかりません' 
          }, 401);
        }
        
        // roleをコンテキストに設定
        c.set('user', user);
        c.set('role', user.role);
    } else {
        // Fallback for mock/no-db
        const mockUser = { user_id: decoded.sub, role: decoded.role || 'user' };
        c.set('user', mockUser);
        c.set('role', mockUser.role);
    }

    await next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return c.json({ 
      error: 'Unauthorized: Invalid token',
      message: 'トークンが無効です。再ログインしてください。'
    }, 401);
  }
}

export async function organizerMiddleware(
  c: Context<{ Bindings: Bindings }>,
  next: Next
) {
  const user = c.get('user');
  const role = c.get('role');

  // organizer または admin のみ許可
  if (!user || (role !== 'organizer' && role !== 'admin')) {
    return c.json({ 
      error: 'Forbidden: Organizer or Admin role required',
      message: 'イベント主催者または管理者の権限が必要です',
      your_role: role || 'unknown',
      required_role: 'organizer or admin'
    }, 403);
  }

  await next();
}

export async function adminMiddleware(
  c: Context<{ Bindings: Bindings }>,
  next: Next
) {
  const user = c.get('user');
  const role = c.get('role');

  // admin のみ許可
  if (!user || role !== 'admin') {
    return c.json({ 
      error: 'Forbidden: Admin role required',
      message: '管理者権限が必要です',
      your_role: role || 'unknown',
      required_role: 'admin'
    }, 403);
  }

  await next();
}
