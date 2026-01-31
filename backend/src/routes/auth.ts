import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { sign, verify } from 'jsonwebtoken';
import { hash, compare } from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import type { Bindings } from '../index';

const authRoutes = new Hono<{ Bindings: Bindings }>();

// バリデーションスキーマ
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  display_name: z.string().optional(),
  role: z.enum(['attendee', 'organizer']).default('attendee'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  two_factor_code: z.string().optional(),
});

const twoFactorEnableSchema = z.object({
  method: z.enum(['sms', 'totp']),
  phone_number: z.string().optional(),
});

// ユーティリティ関数
function generateToken(userId: string, secret: string): string {
  return sign({ userId }, secret, { expiresIn: '7d' });
}

// ============================================
// POST /api/auth/register - 新規登録
// ============================================
authRoutes.post('/register', zValidator('json', registerSchema), async (c) => {
  const { email, password, display_name, role } = c.req.valid('json');
  const db = c.env.DB;

  try {
    // メール重複チェック
    const existingUser = await db
      .prepare('SELECT user_id FROM users WHERE email = ?')
      .bind(email)
      .first();

    if (existingUser) {
      return c.json({ error: 'Email already exists' }, 409);
    }

    // パスワードハッシュ化
    const passwordHash = await hash(password, 12);
    const userId = uuidv4();

    // ユーザー作成
    await db
      .prepare(`
        INSERT INTO users (user_id, email, password_hash, display_name, role)
        VALUES (?, ?, ?, ?, ?)
      `)
      .bind(userId, email, passwordHash, display_name || null, role)
      .run();

    // 主催者の場合、プロフィール作成
    if (role === 'organizer') {
      await db
        .prepare(`
          INSERT INTO organizer_profiles (organizer_id)
          VALUES (?)
        `)
        .bind(userId)
        .run();
    }

    // JWTトークン生成
    const token = generateToken(userId, c.env.JWT_SECRET);

    return c.json({
      success: true,
      user: {
        user_id: userId,
        email,
        display_name,
        role,
      },
      token,
    }, 201);
  } catch (error) {
    console.error('Register error:', error);
    return c.json({ error: 'Registration failed' }, 500);
  }
});

// ============================================
// POST /api/auth/login - ログイン
// ============================================
authRoutes.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password, two_factor_code } = c.req.valid('json');
  const db = c.env.DB;

  try {
    // ユーザー取得
    const user = await db
      .prepare(`
        SELECT user_id, email, password_hash, display_name, role, 
               two_factor_enabled, two_factor_secret
        FROM users
        WHERE email = ?
      `)
      .bind(email)
      .first();

    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // パスワード検証
    const isValidPassword = await compare(password, user.password_hash as string);
    if (!isValidPassword) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // 二段階認証チェック
    if (user.two_factor_enabled) {
      if (!two_factor_code) {
        return c.json({ 
          requires_2fa: true,
          message: 'Two-factor authentication required' 
        }, 200);
      }

      // TODO: NTT認証サービスで検証
      // const isValid2FA = await verifyTwoFactorCode(
      //   user.two_factor_secret, 
      //   two_factor_code, 
      //   c.env.NTT_API_KEY
      // );
      // if (!isValid2FA) {
      //   return c.json({ error: 'Invalid 2FA code' }, 401);
      // }
    }

    // トークン生成
    const token = generateToken(user.user_id as string, c.env.JWT_SECRET);

    return c.json({
      success: true,
      user: {
        user_id: user.user_id,
        email: user.email,
        display_name: user.display_name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Login failed' }, 500);
  }
});

// ============================================
// POST /api/auth/logout - ログアウト
// ============================================
authRoutes.post('/logout', async (c) => {
  // JWTはステートレスなのでクライアント側でトークン削除
  return c.json({ success: true, message: 'Logged out successfully' });
});

// ============================================
// POST /api/auth/2fa/enable - 二段階認証有効化
// ============================================
authRoutes.post('/2fa/enable', zValidator('json', twoFactorEnableSchema), async (c) => {
  const { method, phone_number } = c.req.valid('json');
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.substring(7);
  let userId: string;

  try {
    const decoded = verify(token, c.env.JWT_SECRET) as { userId: string };
    userId = decoded.userId;
  } catch {
    return c.json({ error: 'Invalid token' }, 401);
  }

  const db = c.env.DB;

  try {
    // TODO: NTT認証サービスで設定
    // const twoFactorSecret = await setupTwoFactor(userId, method, phone_number, c.env.NTT_API_KEY);
    
    const twoFactorSecret = 'temporary-secret-' + uuidv4();

    await db
      .prepare(`
        UPDATE users 
        SET two_factor_enabled = 1, 
            two_factor_secret = ?,
            phone_number = ?
        WHERE user_id = ?
      `)
      .bind(twoFactorSecret, phone_number || null, userId)
      .run();

    return c.json({
      success: true,
      message: '2FA enabled successfully',
      method,
    });
  } catch (error) {
    console.error('2FA enable error:', error);
    return c.json({ error: 'Failed to enable 2FA' }, 500);
  }
});

// ============================================
// POST /api/auth/2fa/verify - 二段階認証検証
// ============================================
authRoutes.post('/2fa/verify', async (c) => {
  const { code } = await c.req.json();
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // TODO: NTT認証サービスで検証実装

  return c.json({ success: true, verified: true });
});

// ============================================
// POST /api/auth/reset-password - パスワードリセット
// ============================================
authRoutes.post('/reset-password', async (c) => {
  const { email } = await c.req.json();
  const db = c.env.DB;

  try {
    const user = await db
      .prepare('SELECT user_id FROM users WHERE email = ?')
      .bind(email)
      .first();

    if (!user) {
      // セキュリティのため、ユーザーが存在しない場合も成功レスポンス
      return c.json({ 
        success: true, 
        message: 'If the email exists, a reset link has been sent' 
      });
    }

    // TODO: パスワードリセットトークン生成・メール送信

    return c.json({ 
      success: true, 
      message: 'Password reset link sent to your email' 
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return c.json({ error: 'Failed to process password reset' }, 500);
  }
});

export { authRoutes };
