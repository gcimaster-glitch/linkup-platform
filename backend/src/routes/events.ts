import { Hono } from 'hono';
import { v4 as uuidv4 } from 'uuid';
import type { Bindings } from '../index';
import { authMiddleware } from '../middleware/auth';

const eventRoutes = new Hono<{ Bindings: Bindings, Variables: { user: any, userId: string } }>();

// GET /api/events (一覧)
eventRoutes.get('/', async (c) => {
  const db = c.env.DB;
  const { limit = '50', search } = c.req.query();

  try {
    let query = `
      SELECT e.*, u.display_name as organizer_name 
      FROM events e 
      LEFT JOIN users u ON e.organizer_id = u.user_id 
      WHERE e.status = 'published'
    `;
    const params: any[] = [];

    if (search) {
      query += ' AND (e.title LIKE ? OR e.category LIKE ? OR e.venue_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY e.created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const { results } = await db.prepare(query).bind(...params).all();
    
    // 価格情報の付加
    const events = await Promise.all(results.map(async (e: any) => {
      const ticket = await db.prepare('SELECT MIN(price) as price FROM tickets WHERE event_id = ?').bind(e.event_id).first();
      return { ...e, price: ticket?.price ?? 0 };
    }));

    return c.json({ success: true, events });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// GET /api/events/:id (詳細)
eventRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  const db = c.env.DB;

  try {
    const event: any = await db.prepare(`
      SELECT e.*, u.display_name as organizer_name, u.avatar_url as organizer_avatar
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.user_id
      WHERE e.event_id = ?
    `).bind(id).first();

    if (!event) return c.json({ error: 'Not found' }, 404);

    const { results: tickets } = await db.prepare('SELECT * FROM tickets WHERE event_id = ?').bind(id).all();

    return c.json({ success: true, event: { ...event, tickets } });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// POST /api/events (作成)
eventRoutes.post('/', authMiddleware, async (c) => {
  const db = c.env.DB;
  const userId = c.get('userId');
  const body = await c.req.json();
  const eventId = `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  
  try {
    // イベント保存（venue_address カラムは存在しないため除外）
    await db.prepare(`
      INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, start_datetime, end_datetime, status, cover_image_url, max_attendees, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      eventId, 
      'group-1', 
      userId,
      body.title,
      `slug-${eventId}`,
      body.description || '',
      body.event_type || 'offline',
      body.category || 'tech',
      body.venue_name || '',
      body.start_datetime,
      body.end_datetime || null,
      body.status || 'published',
      body.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
      body.max_attendees || null
    ).run();

    // チケット保存
    // フロントは ticket_name または name を送る可能性があるため両方対応
    const tickets = body.tickets && body.tickets.length > 0
      ? body.tickets
      : [{ name: '一般参加', price: body.price || 0 }];
    
    const ticketStmts = tickets.map((t: any) => {
      const ticketId = `tkt-${uuidv4()}`;
      const ticketName = t.ticket_name || t.name || '一般';
      const price = Number(t.price) || 0;
      // quantity_available カラムを使用（stock は存在しない）
      const qty = Number(t.quantity_total || t.quantity_available || t.capacity || t.stock || body.max_attendees || 100);
      
      return db.prepare(`
        INSERT INTO tickets (ticket_id, event_id, name, description, price, quantity_total, quantity_available, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(ticketId, eventId, ticketName, t.desc || t.description || '', price, qty, qty);
    });
    
    await db.batch(ticketStmts);

    return c.json({ success: true, event_id: eventId });
  } catch (e: any) {
    console.error('Event creation error:', e);
    return c.json({ error: 'Creation failed: ' + e.message }, 500);
  }
});

// PUT /api/events/:id (更新)
eventRoutes.put('/:id', authMiddleware, async (c) => {
  const db = c.env.DB;
  const userId = c.get('userId');
  const eventId = c.req.param('id');
  const body = await c.req.json();

  try {
    const existing: any = await db.prepare('SELECT organizer_id FROM events WHERE event_id = ?').bind(eventId).first();
    if (!existing) return c.json({ error: 'Not found' }, 404);

    await db.prepare(`
      UPDATE events SET 
        title = ?, 
        description = ?, 
        category = ?, 
        event_type = ?,
        venue_name = ?, 
        start_datetime = ?, 
        end_datetime = ?, 
        cover_image_url = ?,
        status = ?,
        max_attendees = ?
      WHERE event_id = ?
    `).bind(
      body.title, 
      body.description || '',
      body.category || 'tech',
      body.event_type || 'offline',
      body.venue_name || '',
      body.start_datetime, 
      body.end_datetime || null, 
      body.cover_image_url || null,
      body.status || 'published',
      body.max_attendees || null,
      eventId
    ).run();

    // チケット更新処理
    if (body.tickets && body.tickets.length > 0) {
      const { results: existingOrders } = await db.prepare(
        'SELECT COUNT(*) as count FROM orders WHERE event_id = ?'
      ).bind(eventId).all();
      const hasOrders = existingOrders?.[0] && (existingOrders[0] as any).count > 0;
      
      if (!hasOrders) {
        // 注文がない場合のみ削除して再作成
        await db.prepare('DELETE FROM tickets WHERE event_id = ?').bind(eventId).run();
        
        const ticketStmts = body.tickets.map((t: any) => {
          const ticketId = `tkt-${uuidv4()}`;
          const ticketName = t.ticket_name || t.name || '一般';
          const price = Number(t.price) || 0;
          const qty = Number(t.quantity_total || t.quantity_available || t.capacity || t.stock || 100);
          
          return db.prepare(`
            INSERT INTO tickets (ticket_id, event_id, name, description, price, quantity_total, quantity_available, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          `).bind(ticketId, eventId, ticketName, t.desc || t.description || '', price, qty, qty);
        });
        
        await db.batch(ticketStmts);
      } else {
        // 注文あり → 既存チケットを quantity_available で更新
        for (const t of body.tickets) {
          if (t.id && t.id.startsWith('tkt-')) {
            const price = Number(t.price) || 0;
            const qty = Number(t.quantity_total || t.quantity_available || t.capacity || t.stock || 100);
            await db.prepare(`
              UPDATE tickets SET 
                name = ?,
                description = ?,
                price = ?,
                quantity_total = ?,
                quantity_available = ?
              WHERE ticket_id = ? AND event_id = ?
            `).bind(
              t.ticket_name || t.name || '一般',
              t.desc || t.description || '',
              price, qty, qty,
              t.id, eventId
            ).run();
          }
        }
      }
    }

    return c.json({ success: true });
  } catch (e: any) {
    console.error('Event update error:', e);
    return c.json({ error: e.message }, 500);
  }
});

// DELETE /api/events/:id
eventRoutes.delete('/:id', authMiddleware, async (c) => {
  const db = c.env.DB;
  const eventId = c.req.param('id');

  try {
    await db.batch([
      db.prepare('DELETE FROM tickets WHERE event_id = ?').bind(eventId),
      db.prepare('DELETE FROM events WHERE event_id = ?').bind(eventId)
    ]);
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

export { eventRoutes };
