import { Hono } from 'hono';
import type { Bindings } from '../index';

const app = new Hono<{ Bindings: Bindings }>();

// 特定イベントのチケット一覧取得
app.get('/:eventId', async (c) => {
  const eventId = c.req.param('eventId');
  const db = c.env.DB;

  try {
    const { results } = await db.prepare(
      'SELECT * FROM tickets WHERE event_id = ? AND is_hidden = 0 ORDER BY price ASC'
    ).bind(eventId).all();

    return c.json({ success: true, tickets: results });
  } catch (error) {
    return c.json({ error: 'Failed to fetch tickets' }, 500);
  }
});

export { app as ticketRoutes };
