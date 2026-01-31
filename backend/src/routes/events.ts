import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import type { Bindings } from '../index';
import { authMiddleware } from '../middleware/auth';

const eventRoutes = new Hono<{ Bindings: Bindings }>();

// バリデーションスキーマ
const createEventSchema = z.object({
  group_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  event_type: z.enum(['online', 'offline', 'hybrid']),
  category: z.string().optional(),
  venue_name: z.string().optional(),
  venue_address: z.string().optional(),
  venue_lat: z.number().optional(),
  venue_lng: z.number().optional(),
  online_meeting_url: z.string().url().optional(),
  start_datetime: z.string().datetime(),
  end_datetime: z.string().datetime(),
  timezone: z.string().default('Asia/Tokyo'),
  max_attendees: z.number().int().positive().optional(),
  requires_approval: z.boolean().default(false),
});

// ============================================
// POST /api/events - イベント作成
// ============================================
eventRoutes.post('/', authMiddleware, zValidator('json', createEventSchema), async (c) => {
  const userId = c.get('userId');
  const data = c.req.valid('json');
  const db = c.env.DB;

  try {
    // グループの所有者確認
    const group = await db
      .prepare('SELECT organizer_id FROM groups WHERE group_id = ?')
      .bind(data.group_id)
      .first();

    if (!group || group.organizer_id !== userId) {
      return c.json({ error: 'Unauthorized to create event for this group' }, 403);
    }

    const eventId = uuidv4();
    const slug = `${data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;

    await db
      .prepare(`
        INSERT INTO events (
          event_id, group_id, organizer_id, title, slug, description,
          event_type, category, venue_name, venue_address, venue_lat, venue_lng,
          online_meeting_url, start_datetime, end_datetime, timezone,
          max_attendees, requires_approval
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        eventId,
        data.group_id,
        userId,
        data.title,
        slug,
        data.description || null,
        data.event_type,
        data.category || null,
        data.venue_name || null,
        data.venue_address || null,
        data.venue_lat || null,
        data.venue_lng || null,
        data.online_meeting_url || null,
        data.start_datetime,
        data.end_datetime,
        data.timezone,
        data.max_attendees || null,
        data.requires_approval ? 1 : 0
      )
      .run();

    const event = await db
      .prepare('SELECT * FROM events WHERE event_id = ?')
      .bind(eventId)
      .first();

    return c.json({ success: true, event }, 201);
  } catch (error) {
    console.error('Create event error:', error);
    return c.json({ error: 'Failed to create event' }, 500);
  }
});

// ============================================
// GET /api/events - イベント一覧取得
// ============================================
eventRoutes.get('/', async (c) => {
  const db = c.env.DB;
  const { 
    category, 
    event_type, 
    status = 'published',
    search,
    limit = '20',
    offset = '0',
  } = c.req.query();

  try {
    let query = `
      SELECT 
        e.*,
        g.group_name,
        g.cover_image_url as group_cover_image,
        o.display_name as organizer_name,
        o.avatar_url as organizer_avatar
      FROM events e
      LEFT JOIN groups g ON e.group_id = g.group_id
      LEFT JOIN users o ON e.organizer_id = o.user_id
      WHERE e.status = ?
    `;
    const params: any[] = [status];

    if (category) {
      query += ' AND e.category = ?';
      params.push(category);
    }

    if (event_type) {
      query += ' AND e.event_type = ?';
      params.push(event_type);
    }

    if (search) {
      query += ' AND (e.title LIKE ? OR e.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY e.start_datetime ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const stmt = db.prepare(query).bind(...params);
    const { results } = await stmt.all();

    return c.json({ 
      success: true, 
      events: results,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    return c.json({ error: 'Failed to fetch events' }, 500);
  }
});

// ============================================
// GET /api/events/:id - イベント詳細取得
// ============================================
eventRoutes.get('/:id', async (c) => {
  const eventId = c.req.param('id');
  const db = c.env.DB;

  try {
    // イベント情報取得
    const event = await db
      .prepare(`
        SELECT 
          e.*,
          g.group_name,
          g.cover_image_url as group_cover_image,
          o.display_name as organizer_name,
          o.avatar_url as organizer_avatar,
          op.organization_name,
          op.rating as organizer_rating
        FROM events e
        LEFT JOIN groups g ON e.group_id = g.group_id
        LEFT JOIN users o ON e.organizer_id = o.user_id
        LEFT JOIN organizer_profiles op ON e.organizer_id = op.organizer_id
        WHERE e.event_id = ? OR e.slug = ?
      `)
      .bind(eventId, eventId)
      .first();

    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }

    // チケット情報取得
    const { results: tickets } = await db
      .prepare(`
        SELECT * FROM tickets 
        WHERE event_id = ? AND is_hidden = 0
        ORDER BY price ASC
      `)
      .bind(event.event_id)
      .all();

    // 閲覧数を増加
    await db
      .prepare('UPDATE events SET view_count = view_count + 1 WHERE event_id = ?')
      .bind(event.event_id)
      .run();

    return c.json({
      success: true,
      event: {
        ...event,
        tickets,
      },
    });
  } catch (error) {
    console.error('Get event error:', error);
    return c.json({ error: 'Failed to fetch event' }, 500);
  }
});

// ============================================
// PUT /api/events/:id - イベント更新
// ============================================
eventRoutes.put('/:id', authMiddleware, zValidator('json', createEventSchema.partial()), async (c) => {
  const userId = c.get('userId');
  const eventId = c.req.param('id');
  const data = c.req.valid('json');
  const db = c.env.DB;

  try {
    // 権限確認
    const event = await db
      .prepare('SELECT organizer_id FROM events WHERE event_id = ?')
      .bind(eventId)
      .first();

    if (!event || event.organizer_id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // 更新クエリ生成
    const updates: string[] = [];
    const params: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    });

    if (updates.length === 0) {
      return c.json({ error: 'No fields to update' }, 400);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(eventId);

    await db
      .prepare(`UPDATE events SET ${updates.join(', ')} WHERE event_id = ?`)
      .bind(...params)
      .run();

    const updatedEvent = await db
      .prepare('SELECT * FROM events WHERE event_id = ?')
      .bind(eventId)
      .first();

    return c.json({ success: true, event: updatedEvent });
  } catch (error) {
    console.error('Update event error:', error);
    return c.json({ error: 'Failed to update event' }, 500);
  }
});

// ============================================
// POST /api/events/:id/publish - イベント公開
// ============================================
eventRoutes.post('/:id/publish', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const eventId = c.req.param('id');
  const db = c.env.DB;

  try {
    const event = await db
      .prepare('SELECT * FROM events WHERE event_id = ?')
      .bind(eventId)
      .first();

    if (!event || event.organizer_id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    if (event.status === 'published') {
      return c.json({ error: 'Event already published' }, 400);
    }

    await db
      .prepare(`
        UPDATE events 
        SET status = 'published', published_at = CURRENT_TIMESTAMP 
        WHERE event_id = ?
      `)
      .bind(eventId)
      .run();

    // フォロワーに通知
    // TODO: グループフォロワーに新イベント通知を送信

    return c.json({ success: true, message: 'Event published successfully' });
  } catch (error) {
    console.error('Publish event error:', error);
    return c.json({ error: 'Failed to publish event' }, 500);
  }
});

// ============================================
// DELETE /api/events/:id - イベント削除
// ============================================
eventRoutes.delete('/:id', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const eventId = c.req.param('id');
  const db = c.env.DB;

  try {
    const event = await db
      .prepare('SELECT organizer_id FROM events WHERE event_id = ?')
      .bind(eventId)
      .first();

    if (!event || event.organizer_id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    await db
      .prepare('DELETE FROM events WHERE event_id = ?')
      .bind(eventId)
      .run();

    return c.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    return c.json({ error: 'Failed to delete event' }, 500);
  }
});

export { eventRoutes };
