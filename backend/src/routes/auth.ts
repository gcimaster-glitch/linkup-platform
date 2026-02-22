import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { sign, verify } from 'hono/jwt';
import * as bcrypt from 'bcryptjs';
import type { Bindings } from '../index';
import { authMiddleware } from '../middleware/auth';

/**
 * Auth Routes
 *
 * セキュリティポリシー:
 * - JWT署名は必ず検証する（バイパス禁止）
 * - パスワードはbcryptのみ（プレーンテキスト比較禁止）
 * - 登録できるロールは attendee/organizer のみ（admin不可）
 * - 開発用エンドポイントは本番では無効化
 *
 * 実際のDBスキーマ（schema-checkで確認済み）:
 *   user_id, email, phone_number, password_hash, display_name,
 *   avatar_url, role, stripe_customer_id, stripe_account_id,
 *   kyc_status, kyc_verification_id, two_factor_enabled,
 *   two_factor_secret, created_at, updated_at
 */

const app = new Hono<{ Bindings: Bindings }>();

// ─── バリデーションスキーマ ────────────────────────

const registerSchema = z.object({
  email:    z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上にしてください'),
  name:     z.string().min(1).max(50).optional(),
  // attendee/organizer のみ登録可（admin は管理者が付与）
  role:     z.enum(['attendee', 'organizer']).default('attendee'),
});

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

// ─── ヘルパー ─────────────────────────────────────

function buildUserResponse(user: any) {
  return {
    user_id:      user.user_id,
    id:           user.user_id,
    display_name: user.display_name || user.email?.split('@')[0] || 'ユーザー',
    name:         user.display_name || user.email?.split('@')[0] || 'ユーザー',
    email:        user.email,
    role:         user.role || 'attendee',
    avatar_url:   user.avatar_url,
    icon_url:     user.avatar_url,
    kyc_status:   user.kyc_status || 'unverified',
    kycStatus:    user.kyc_status || 'unverified',
  };
}

async function generateToken(userId: string, role: string, jwtSecret: string) {
  return sign(
    { sub: userId, role, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 },
    jwtSecret
  );
}

// ─── 新規登録 ─────────────────────────────────────

app.post('/register', zValidator('json', registerSchema), async (c) => {
  const { email, password, name, role } = c.req.valid('json');

  try {
    const db = c.env.DB;
    if (!db) return c.json({ error: 'Database not available' }, 500);

    // 重複チェック
    const existing = await db.prepare(
      'SELECT user_id FROM users WHERE email = ?'
    ).bind(email).first();
    if (existing) {
      return c.json({ error: 'このメールアドレスは既に登録されています' }, 409);
    }

    const userId      = `u-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const displayName = name || email.split('@')[0];
    const avatarUrl   = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=2563EB&color=fff`;
    // 必ずbcryptでハッシュ化（プレーンテキスト保存禁止）
    const passwordHash = await bcrypt.hash(password, 12);

    await db.prepare(
      `INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, kyc_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', datetime('now'), datetime('now'))`
    ).bind(userId, email, passwordHash, displayName, avatarUrl, role).run();

    // 主催者の場合はorganizer_profilesにも追加
    if (role === 'organizer') {
      try {
        await db.prepare(
          `INSERT INTO organizer_profiles (organizer_id, organization_name, created_at)
           VALUES (?, ?, datetime('now'))`
        ).bind(userId, displayName).run();
      } catch (e) {
        console.warn('organizer_profiles insert skipped:', e);
      }
    }

    const token = await generateToken(userId, role, c.env.JWT_SECRET);

    return c.json({
      success: true,
      message: '登録が完了しました',
      email_verification_required: false,
      token,
      user: buildUserResponse({ user_id: userId, email, display_name: displayName, avatar_url: avatarUrl, role }),
    }, 201);

  } catch (error: any) {
    console.error('Register error:', error);
    return c.json({ error: 'ユーザー登録に失敗しました' }, 500);
  }
});

// ─── ログイン ─────────────────────────────────────

app.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');

  try {
    const db = c.env.DB;
    if (!db) return c.json({ error: 'Database not available' }, 500);

    const user: any = await db.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).first();

    // ユーザーが存在しない場合も同じメッセージ（ユーザー存在列挙攻撃対策）
    if (!user || !user.password_hash) {
      return c.json({ error: 'メールアドレスまたはパスワードが正しくありません' }, 401);
    }

    // bcryptのみで検証（プレーンテキスト比較は禁止）
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return c.json({ error: 'メールアドレスまたはパスワードが正しくありません' }, 401);
    }

    const token = await generateToken(user.user_id, user.role || 'attendee', c.env.JWT_SECRET);

    return c.json({
      success: true,
      token,
      user: buildUserResponse(user),
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return c.json({ error: 'ログインに失敗しました' }, 500);
  }
});

// ─── 現在のユーザー情報取得 ───────────────────────

app.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: Missing token', message: 'ログインが必要です' }, 401);
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = c.env.JWT_SECRET;

  if (!jwtSecret) {
    return c.json({ error: 'Server configuration error' }, 500);
  }

  // JWT署名を必ず検証（バイパス禁止）
  let userId: string | null = null;
  try {
    const payload = await verify(token, jwtSecret, 'HS256') as { sub?: string };
    userId = payload.sub || null;
  } catch (_verifyErr) {
    return c.json({ error: 'Unauthorized: Invalid token', message: 'トークンが無効です。再ログインしてください。' }, 401);
  }

  if (!userId) {
    return c.json({ error: 'Unauthorized: No user ID in token' }, 401);
  }

  try {
    const db = c.env.DB;
    if (!db) return c.json({ error: 'Database not available' }, 500);

    const user: any = await db.prepare(
      'SELECT user_id, email, display_name, avatar_url, role, kyc_status FROM users WHERE user_id = ?'
    ).bind(userId).first();

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({
      success: true,
      user: buildUserResponse(user),
    });
  } catch (error: any) {
    console.error('/me DB error:', error?.message || error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ─── プロフィール更新 ─────────────────────────────

app.put('/profile', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId' as any) as string;
    const db = c.env.DB;
    if (!db) return c.json({ error: 'Database not available' }, 500);

    const body = await c.req.json();
    const updates: string[] = [];
    const values: any[]     = [];

    if (body.name !== undefined) {
      updates.push('display_name = ?');
      values.push(String(body.name).slice(0, 50));
    }
    if (body.avatar_url !== undefined) {
      updates.push('avatar_url = ?');
      values.push(body.avatar_url);
    }

    if (updates.length === 0) {
      return c.json({ error: '更新するフィールドがありません' }, 400);
    }

    updates.push("updated_at = datetime('now')");
    values.push(userId);

    await db.prepare(
      `UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`
    ).bind(...values).run();

    const updated: any = await db.prepare(
      'SELECT user_id, email, display_name, avatar_url, role, kyc_status FROM users WHERE user_id = ?'
    ).bind(userId).first();

    return c.json({
      success: true,
      message: 'プロフィールを更新しました',
      user: buildUserResponse(updated),
    });

  } catch (error: any) {
    console.error('Profile update error:', error);
    return c.json({ error: 'プロフィールの更新に失敗しました' }, 500);
  }
});

// ─── ヘルスチェック ───────────────────────────────

app.get('/health', (c) => c.json({ status: 'ok', db_binding: !!c.env.DB }));

// ─── DBスキーマ確認（本番では無効） ──────────────

app.get('/schema-check', async (c) => {
  if (c.env.ENVIRONMENT === 'production') {
    return c.json({ error: 'Not available in production' }, 403);
  }
  try {
    if (!c.env.DB) return c.json({ error: 'DB not bound' }, 500);
    const cols = await c.env.DB.prepare(
      "SELECT name FROM pragma_table_info('users')"
    ).all();
    return c.json({ columns: cols.results?.map((r: any) => r.name) });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

export { app as authRoutes };
