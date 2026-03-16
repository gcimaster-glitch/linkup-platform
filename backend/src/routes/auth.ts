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

// ─── 管理者初回セットアップ / パスワードリセット ──────────────────────────
// setup_key 検証済みの場合のみ使用可能

app.post('/setup-admin', async (c) => {
  try {
    const db = c.env.DB;
    if (!db) return c.json({ error: 'Database not available' }, 500);

    const body = await c.req.json();
    const { email, password, setup_key, reset } = body;

    // セットアップキー検証
    const expectedKey = 'linkup-admin-setup-2026';
    if (setup_key !== expectedKey) {
      return c.json({ error: 'Invalid setup key' }, 403);
    }

    const targetEmail = email || 'admin@link-up.live';
    const targetPassword = password || 'Admin@2026!';
    const passwordHash = await bcrypt.hash(targetPassword, 12);

    // 既存adminを確認
    const existingAdmin: any = await db.prepare(
      "SELECT user_id, email FROM users WHERE role = 'admin' LIMIT 1"
    ).first();

    if (existingAdmin && !reset) {
      // reset=true の場合はパスワードをリセット、そうでなければ409
      return c.json({ 
        error: 'Admin user already exists. Use reset=true to reset password.',
        admin_id: existingAdmin.user_id,
        admin_email: existingAdmin.email
      }, 409);
    }

    if (existingAdmin && reset) {
      // 既存管理者のパスワードとメールをリセット
      await db.prepare(
        `UPDATE users SET password_hash = ?, email = ?, updated_at = datetime('now') WHERE user_id = ?`
      ).bind(passwordHash, targetEmail, existingAdmin.user_id).run();

      const token = await generateToken(existingAdmin.user_id, 'admin', c.env.JWT_SECRET);
      return c.json({
        success: true,
        message: '管理者パスワードをリセットしました',
        user_id: existingAdmin.user_id,
        email: targetEmail,
        token,
      });
    }

    // 新規admin作成
    const userId = `u-admin-${Date.now()}`;
    const displayName = 'システム管理者';
    const avatarUrl = `https://ui-avatars.com/api/?name=Admin&background=DC2626&color=fff`;

    await db.prepare(
      `INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, kyc_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'admin', 'verified', datetime('now'), datetime('now'))`
    ).bind(userId, targetEmail, passwordHash, displayName, avatarUrl).run();

    const token = await generateToken(userId, 'admin', c.env.JWT_SECRET);

    return c.json({
      success: true,
      message: '管理者アカウントを作成しました',
      user_id: userId,
      email: targetEmail,
      token,
    }, 201);

  } catch (error: any) {
    console.error('Setup admin error:', error);
    return c.json({ error: 'セットアップに失敗しました: ' + error.message }, 500);
  }
});

// ─── Google OAuth ─────────────────────────────────────────

app.get('/google', (c) => {
  const clientId = c.env.GOOGLE_CLIENT_ID;
  if (!clientId) return c.json({ error: 'Google OAuth not configured' }, 500);

  const frontendUrl = c.env.FRONTEND_URL || 'https://link-up.live';
  const returnPath = c.req.query('return') || '/';
  const state = btoa(JSON.stringify({ returnPath }));
  const redirectUri = `${frontendUrl}/api/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: 'select_account',
  });

  return c.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

app.get('/google/callback', async (c) => {
  const { code, state, error } = c.req.query() as Record<string, string>;
  const frontendUrl = c.env.FRONTEND_URL || 'https://link-up.live';

  if (error || !code) {
    return c.redirect(`${frontendUrl}/?auth_error=${encodeURIComponent(error || 'no_code')}`);
  }

  let returnPath = '/';
  try {
    const decoded = JSON.parse(atob(state || ''));
    returnPath = decoded.returnPath || '/';
  } catch (_) {}

  try {
    const clientId = c.env.GOOGLE_CLIENT_ID!;
    const clientSecret = c.env.GOOGLE_CLIENT_SECRET!;
    const redirectUri = `${frontendUrl}/api/auth/google/callback`;

    // アクセストークン取得
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    const tokenData: any = await tokenRes.json();
    if (!tokenData.access_token) {
      return c.redirect(`${frontendUrl}/?auth_error=${encodeURIComponent('token_exchange_failed')}`);
    }

    // ユーザー情報取得
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const googleUser: any = await userRes.json();
    if (!googleUser.email) {
      return c.redirect(`${frontendUrl}/?auth_error=${encodeURIComponent('no_email')}`);
    }

    const db = c.env.DB;
    // 既存ユーザー検索
    let user: any = await db.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(googleUser.email).first();

    if (!user) {
      // 新規作成
      const userId = `u-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const displayName = googleUser.name || googleUser.email.split('@')[0];
      const avatarUrl = googleUser.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=2563EB&color=fff`;
      await db.prepare(
        `INSERT INTO users (user_id, email, display_name, avatar_url, role, kyc_status, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'attendee', 'verified', datetime('now'), datetime('now'))`
      ).bind(userId, googleUser.email, displayName, avatarUrl).run();
      user = { user_id: userId, email: googleUser.email, display_name: displayName, avatar_url: avatarUrl, role: 'attendee', kyc_status: 'verified' };
    }

    const token = await generateToken(user.user_id, user.role || 'attendee', c.env.JWT_SECRET);
    const cleanPath = returnPath.startsWith('/') ? returnPath : '/';
    return c.redirect(`${frontendUrl}${cleanPath}?auth_token=${token}&auth_provider=google`);

  } catch (err: any) {
    console.error('Google OAuth callback error:', err);
    return c.redirect(`${frontendUrl}/?auth_error=${encodeURIComponent('server_error')}`);
  }
});

// ─── LINE OAuth ──────────────────────────────────────────

app.get('/line', (c) => {
  const channelId = c.env.LINE_CHANNEL_ID;
  if (!channelId) return c.json({ error: 'LINE OAuth not configured' }, 500);

  const frontendUrl = c.env.FRONTEND_URL || 'https://link-up.live';
  const returnPath = c.req.query('return') || '/';
  const state = btoa(JSON.stringify({ returnPath }));
  const redirectUri = `${frontendUrl}/api/auth/line/callback`;

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: channelId,
    redirect_uri: redirectUri,
    state,
    scope: 'profile openid email',
  });

  return c.redirect(`https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`);
});

app.get('/line/callback', async (c) => {
  const { code, state, error } = c.req.query() as Record<string, string>;
  const frontendUrl = c.env.FRONTEND_URL || 'https://link-up.live';

  if (error || !code) {
    return c.redirect(`${frontendUrl}/?auth_error=${encodeURIComponent(error || 'no_code')}`);
  }

  let returnPath = '/';
  try {
    const decoded = JSON.parse(atob(state || ''));
    returnPath = decoded.returnPath || '/';
  } catch (_) {}

  try {
    const channelId = c.env.LINE_CHANNEL_ID!;
    const channelSecret = c.env.LINE_CHANNEL_SECRET!;
    const redirectUri = `${frontendUrl}/api/auth/line/callback`;

    // アクセストークン取得
    const tokenRes = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: channelId,
        client_secret: channelSecret,
      }),
    });
    const tokenData: any = await tokenRes.json();
    if (!tokenData.access_token) {
      return c.redirect(`${frontendUrl}/?auth_error=${encodeURIComponent('token_exchange_failed')}`);
    }

    // ユーザー情報取得
    const profileRes = await fetch('https://api.line.me/v2/profile', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const lineProfile: any = await profileRes.json();

    // メールアドレスは id_tokenから取得
    let email: string | null = null;
    if (tokenData.id_token) {
      try {
        const payload = JSON.parse(atob(tokenData.id_token.split('.')[1]));
        email = payload.email || null;
      } catch (_) {}
    }

    const lineId = lineProfile.userId;
    if (!lineId) {
      return c.redirect(`${frontendUrl}/?auth_error=${encodeURIComponent('no_user_id')}`);
    }

    const db = c.env.DB;
    // LINE IDで検索（メールがない場合に対応）
    let user: any = email
      ? await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first()
      : await db.prepare("SELECT * FROM users WHERE display_name LIKE ? AND role != 'admin'").bind(`%${lineId}%`).first();

    if (!user) {
      const userId = `u-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const displayName = lineProfile.displayName || `LINEユーザー`;
      const avatarUrl = lineProfile.pictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=06C755&color=fff`;
      const userEmail = email || `line_${lineId}@line.user`;
      await db.prepare(
        `INSERT INTO users (user_id, email, display_name, avatar_url, role, kyc_status, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'attendee', 'verified', datetime('now'), datetime('now'))`
      ).bind(userId, userEmail, displayName, avatarUrl).run();
      user = { user_id: userId, email: userEmail, display_name: displayName, avatar_url: avatarUrl, role: 'attendee', kyc_status: 'verified' };
    }

    const token = await generateToken(user.user_id, user.role || 'attendee', c.env.JWT_SECRET);
    const cleanPath = returnPath.startsWith('/') ? returnPath : '/';
    return c.redirect(`${frontendUrl}${cleanPath}?auth_token=${token}&auth_provider=line`);

  } catch (err: any) {
    console.error('LINE OAuth callback error:', err);
    return c.redirect(`${frontendUrl}/?auth_error=${encodeURIComponent('server_error')}`);
  }
});

// ─── ヘルスチェック ────────────────────

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
