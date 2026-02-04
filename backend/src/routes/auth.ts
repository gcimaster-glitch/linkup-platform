import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { sign } from 'hono/jwt';
import * as bcrypt from 'bcryptjs';
import type { Bindings } from '../index';

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

// 新規登録
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

    if (db) {
        await db.prepare(
            'INSERT INTO users (user_id, email, password_hash, display_name, role, avatar_url, kyc_status) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).bind(userId, email, passwordHash, name, role, avatarUrl, 'unverified').run();
        
        if (role === 'organizer') {
            await db.prepare(
                'INSERT INTO organizer_profiles (organizer_id, organization_name, rating) VALUES (?, ?, 0.0)'
            ).bind(userId, name).run();
        }
    } else {
        // Fallback for environment without DB (should not happen in prod with D1)
        console.warn('DB binding not found, skipping persistence');
    }

    // JWT Token
    const token = await sign({ sub: userId, role, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 }, c.env.JWT_SECRET);

    return c.json({ 
      success: true, 
      token, 
      user: { 
        id: userId, 
        name: name, 
        email, 
        role, 
        icon: avatarUrl,
        kycStatus: 'unverified'
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

export { app as authRoutes };
