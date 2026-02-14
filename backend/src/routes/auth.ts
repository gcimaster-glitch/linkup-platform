import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { sign } from 'hono/jwt';
import * as bcrypt from 'bcryptjs';
import type { Bindings } from '../index';
import { ResendService } from '../services/resend';
import { authMiddleware } from '../middleware/auth';

const app = new Hono<{ Bindings: Bindings }>();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
  name: z.string().min(1).optional(),
  role: z.enum(['attendee', 'organizer']).default('attendee'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// 新規登録（メール認証付き）
app.post('/register', zValidator('json', registerSchema), async (c) => {
  const { email, password, name, role } = c.req.valid('json');

  try {
    const db = c.env.DB;
    
    // Check duplication
    if (db) {
        const existing = await db.prepare('SELECT user_id FROM users WHERE email = ?').bind(email).first();
        if (existing) {
            return c.json({ error: 'Email already exists' }, 409);
        }
    }

    const userId = `u-${Date.now()}`; // Simple ID
    const userName = name || email.split('@')[0];
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=2563EB&color=fff`;
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Generate email verification token
    const verificationToken = uuidv4();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    if (db) {
        // Insert user with email_verified = 0 (migration required)
        await db.prepare(
            'INSERT INTO users (user_id, email, password_hash, name, role, avatar_url, kyc_status, email_verified, email_verification_token, email_verification_expires) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        ).bind(userId, email, passwordHash, userName, role, avatarUrl, 'unverified', 0, verificationToken, verificationExpires).run();
        
        if (role === 'organizer') {
            await db.prepare(
                'INSERT INTO organizer_profiles (organizer_id, organization_name, rating) VALUES (?, ?, 0.0)'
            ).bind(userId, userName).run();
        }
        
        // Send verification email
        const resend = new ResendService(c.env.RESEND_API_KEY);
        const verificationUrl = `${c.env.FRONTEND_URL || 'https://link-up.live'}/verify-email?token=${verificationToken}`;
        
        const emailResult = await resend.sendEmail(
            email,
            'LinkUp - メールアドレスの確認',
            `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    h1 { color: #2563EB; font-size: 28px; margin-bottom: 20px; }
                    p { color: #475569; font-size: 16px; line-height: 1.6; margin: 15px 0; }
                    .button { display: inline-block; background: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
                    .footer { color: #94a3b8; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🎉 LinkUpへようこそ！</h1>
                    <p>アカウント登録ありがとうございます。</p>
                    <p>以下のボタンをクリックして、メールアドレスを確認してください：</p>
                    <a href="${verificationUrl}" class="button">メールアドレスを確認する</a>
                    <p style="color: #64748b; font-size: 14px;">このリンクは24時間有効です。</p>
                    <div class="footer">
                        <p>このメールに心当たりがない場合は、このメールを無視してください。</p>
                        <p>© 2026 LinkUp. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            `
        );
        
        console.log(`[Email Verification] Token: ${verificationToken}, URL: ${verificationUrl}, Result:`, emailResult);
    } else {
        console.warn('DB binding not found, skipping persistence');
    }

    // Return success but indicate email verification is pending
    return c.json({ 
      success: true, 
      message: '登録が完了しました。確認メールを送信しました。',
      email_verification_required: true,
      user: { 
        id: userId, 
        name: userName, 
        email, 
        role, 
        icon: avatarUrl,
        kycStatus: 'unverified',
        emailVerified: false
      } 
    }, 201);

  } catch (error) {
    console.error(error);
    return c.json({ error: 'Registration failed' }, 500);
  }
});

// ログイン
app.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');

  try {
    const db = c.env.DB;
    let user: any = null;

    if (db) {
        user = await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
    } else {
        // Mock fallback if DB is missing (should not be used in this deploy)
        if (email === 'organizer@demo.com' && password === 'demo') {
             user = { user_id: 'u-organizer-001', role: 'organizer', display_name: 'LinkUp Official', password_hash: '$2a$10$X7.G.6.G.6.G.6.G.6.G.6.G.6.G.6.G.6.G.6.G.6', avatar_url: '...', kyc_status: 'verified' };
        } else if (email === 'user@demo.com' && password === 'demo') {
             user = { user_id: 'u-user-001', role: 'attendee', display_name: 'Demo User', password_hash: '$2a$10$X7.G.6.G.6.G.6.G.6.G.6.G.6.G.6.G.6.G.6.G.6', avatar_url: '...', kyc_status: 'verified' };
        }
    }
    
    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Verify Password
    // In demo mode or if bcrypt hash is not standard (e.g. dummy from seed), allow 'demo' check if hash matches 'demo' string? 
    // No, standard flow: bcrypt compare.
    // The seed data has valid bcrypt hashes for 'demo' password: $2a$10$X7.G.6.G.6.G.6.G.6.G.6.G.6.G.6.G.6.G.6.G.6
    
    // Fallback for demo users seeded with plain text or non-standard hash if any (though seed file uses bcrypt hash)
    // If the hash in DB is exactly 'demo', compare plain text
    let isValid = false;
    if (user.password_hash === 'demo' && password === 'demo') {
        isValid = true;
    } else {
        isValid = await bcrypt.compare(password, user.password_hash);
    }
    
    if (!isValid) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const token = await sign({ sub: user.user_id, role: user.role, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 }, c.env.JWT_SECRET);

    return c.json({
      success: true,
      token,
      user: {
        user_id: user.user_id,
        id: user.user_id,
        display_name: user.display_name,
        name: user.display_name,
        email: user.email,
        role: user.role,
        icon_url: user.avatar_url,
        icon: user.avatar_url,
        avatar_url: user.avatar_url,
        kyc_status: user.kyc_status || 'unverified',
        kycStatus: user.kyc_status || 'unverified'
      }
    });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Login failed' }, 500);
  }
});

// 現在のユーザー情報取得（認証必須）
app.get('/me', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    return c.json({
      success: true,
      user: {
        user_id: user.user_id,
        id: user.user_id,
        display_name: user.display_name,
        name: user.display_name,
        email: user.email,
        role: user.role,
        icon_url: user.avatar_url,
        icon: user.avatar_url,
        avatar_url: user.avatar_url,
        kyc_status: user.kyc_status || 'unverified',
        kycStatus: user.kyc_status || 'unverified'
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    return c.json({ error: 'Failed to get user info' }, 500);
  }
});

// デモ用: ユーザーリスト取得 (本来は管理者のみ)
app.get('/users', async (c) => {
    try {
        if (c.env.DB) {
            const result = await c.env.DB.prepare('SELECT email, name, role FROM users LIMIT 50').all();
            return c.json({ users: result.results });
        }
        return c.json({ users: [], message: 'DB binding not found' });
    } catch (e) {
        return c.json({ error: e.message, stack: e.stack }, 500);
    }
});

// ヘルスチェック
app.get('/health', (c) => c.json({ status: 'ok', db_binding: !!c.env.DB }));

// メール認証エンドポイント
app.get('/verify-email', async (c) => {
    const token = c.req.query('token');
    
    if (!token) {
        return c.json({ error: 'Verification token is required' }, 400);
    }
    
    try {
        const db = c.env.DB;
        
        if (!db) {
            return c.json({ error: 'Database not available' }, 500);
        }
        
        // Query user with verification token
        const user: any = await db.prepare(
            'SELECT * FROM users WHERE email_verification_token = ? AND email_verification_expires > datetime("now")'
        ).bind(token).first();
        
        if (!user) {
            return c.json({ 
                error: 'Invalid or expired verification token',
                message: '確認リンクが無効または期限切れです。再度登録してください。'
            }, 400);
        }
        
        // Update user: verify email and clear token
        await db.prepare(
            'UPDATE users SET email_verified = 1, email_verification_token = NULL, email_verification_expires = NULL WHERE user_id = ?'
        ).bind(user.user_id).run();
        
        // Generate JWT token for auto-login
        const token_jwt = await sign({
            userId: user.user_id,
            email: user.email,
            role: user.role,
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
        }, c.env.JWT_SECRET || 'development-secret-key');
        
        return c.json({ 
            success: true, 
            message: 'メールアドレスが確認されました。ログインできます。',
            token: token_jwt,
            user: {
                id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role,
                icon: user.avatar_url,
                kycStatus: user.kyc_status || 'unverified',
                emailVerified: true
            }
        });
        
    } catch (error) {
        console.error('Verification error:', error);
        return c.json({ error: 'Verification failed', message: '確認に失敗しました。' }, 500);
    }
});

// プロフィール更新（認証必要）
app.put('/profile', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) return c.json({ error: 'Unauthorized' }, 401);
  
  const token = authHeader.split(' ')[1];
  const db = c.env.DB;
  
  try {
    // JWTトークンの検証
    const { verify } = await import('hono/jwt');
    const payload = await verify(token, c.env.JWT_SECRET);
    const userId = payload.sub;
    
    const body = await c.req.json();
    const { avatar_url, name, bio, cover_image_url } = body;
    
    // プロフィール更新
    const updates: string[] = [];
    const values: any[] = [];
    
    if (avatar_url !== undefined) {
      updates.push('avatar_url = ?');
      values.push(avatar_url);
    }
    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (bio !== undefined) {
      updates.push('bio = ?');
      values.push(bio);
    }
    if (cover_image_url !== undefined) {
      updates.push('cover_image_url = ?');
      values.push(cover_image_url);
    }
    
    if (updates.length === 0) {
      return c.json({ error: 'No fields to update' }, 400);
    }
    
    values.push(userId);
    
    await db.prepare(`
      UPDATE users 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).bind(...values).run();
    
    // 更新後のユーザー情報を取得
    const user: any = await db.prepare('SELECT * FROM users WHERE user_id = ?')
      .bind(userId).first();
    
    return c.json({ 
      success: true, 
      message: 'プロフィールを更新しました',
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        bio: user.bio
      }
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return c.json({ error: error.message || 'Profile update failed' }, 500);
  }
});

export { app as authRoutes };
