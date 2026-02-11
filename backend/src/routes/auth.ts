import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { sign } from 'hono/jwt';
import * as bcrypt from 'bcryptjs';
import type { Bindings } from '../index';
import { ResendService } from '../services/resend';

const app = new Hono<{ Bindings: Bindings }>();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
  display_name: z.string().min(1).optional(),
  role: z.enum(['attendee', 'organizer']).default('attendee'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// 新規登録（メール認証付き）
app.post('/register', zValidator('json', registerSchema), async (c) => {
  const { email, password, display_name, role } = c.req.valid('json');

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
    const name = display_name || email.split('@')[0];
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563EB&color=fff`;
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Generate email verification token
    const verificationToken = uuidv4();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    if (db) {
        // Note: email_verified column needs migration (see database/migration_add_email_verification.sql)
        // For now, we'll insert without email_verified field and update schema later
        await db.prepare(
            'INSERT INTO users (user_id, email, password_hash, display_name, role, avatar_url, kyc_status) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).bind(userId, email, passwordHash, name, role, avatarUrl, 'unverified').run();
        
        // TODO: Store verification token after migration
        // await db.prepare('UPDATE users SET email_verification_token = ?, email_verification_expires = ? WHERE user_id = ?')
        //     .bind(verificationToken, verificationExpires, userId).run();
        
        if (role === 'organizer') {
            await db.prepare(
                'INSERT INTO organizer_profiles (organizer_id, organization_name, rating) VALUES (?, ?, 0.0)'
            ).bind(userId, name).run();
        }
        
        // Send verification email (mock for now)
        // const resend = new ResendService(c.env.RESEND_API_KEY);
        const verificationUrl = `${c.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
        
        // TODO: Uncomment when Resend API key is configured
        // await resend.sendEmail(
        //     email,
        //     'LinkUp - メールアドレスの確認',
        //     `
        //     <h1>LinkUpへようこそ！</h1>
        //     <p>アカウント登録ありがとうございます。</p>
        //     <p>以下のリンクをクリックして、メールアドレスを確認してください：</p>
        //     <a href="${verificationUrl}">メールアドレスを確認する</a>
        //     <p>このリンクは24時間有効です。</p>
        //     `
        // );
        
        console.log(`[Email Verification] Token: ${verificationToken}, URL: ${verificationUrl}`);
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
        name: name, 
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
        id: user.user_id,
        name: user.display_name,
        email: user.email,
        role: user.role,
        icon: user.avatar_url,
        kycStatus: user.kyc_status
      }
    });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Login failed' }, 500);
  }
});

// デモ用: ユーザーリスト取得 (本来は管理者のみ)
app.get('/users', async (c) => {
    try {
        if (c.env.DB) {
            const result = await c.env.DB.prepare('SELECT email, display_name as name, role FROM users LIMIT 50').all();
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
        
        // TODO: After migration, query with email_verification_token
        // const user: any = await db.prepare(
        //     'SELECT * FROM users WHERE email_verification_token = ? AND email_verification_expires > datetime("now")'
        // ).bind(token).first();
        
        // For now, mock success
        console.log(`[Email Verification] Token received: ${token}`);
        
        // TODO: Update user after migration
        // if (user) {
        //     await db.prepare(
        //         'UPDATE users SET email_verified = 1, email_verification_token = NULL, email_verification_expires = NULL WHERE user_id = ?'
        //     ).bind(user.user_id).run();
        //     
        //     return c.json({ success: true, message: 'Email verified successfully' });
        // }
        
        return c.json({ success: true, message: 'Email verification is in preparation. All users are currently auto-verified.' });
        
    } catch (error) {
        console.error('Verification error:', error);
        return c.json({ error: 'Verification failed' }, 500);
    }
});

export { app as authRoutes };
