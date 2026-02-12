import { Hono } from 'hono';
import { v4 as uuidv4 } from 'uuid';
import type { Bindings } from '../index';
import { verify } from 'hono/jwt';

const orderRoutes = new Hono<{ Bindings: Bindings }>();

// 認証ミドルウェア
orderRoutes.use('/*', async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) return c.json({ error: 'Unauthorized' }, 401);
  const token = authHeader.split(' ')[1];
  try {
    const payload = await verify(token, c.env.JWT_SECRET);
    c.set('user', payload);
    await next();
  } catch (e) {
    return c.json({ error: 'Invalid token' }, 401);
  }
});

orderRoutes.post('/', async (c) => {
  const db = c.env.DB;
  const { ticket_id, quantity, event_id, promo_code } = await c.req.json();
  const user = c.get('user');
  const userId = user.sub;

  if (!ticket_id || !quantity || quantity <= 0) {
    return c.json({ error: 'Invalid request' }, 400);
  }

  const orderId = `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

  try {
    // 1. チケットとイベント、主催者情報の取得
    const ticket: any = await db.prepare('SELECT * FROM tickets WHERE ticket_id = ?').bind(ticket_id).first();
    if (!ticket) return c.json({ error: 'Ticket not found' }, 404);

    // 在庫チェック
    if (ticket.stock < quantity) {
      return c.json({ error: 'Not enough stock' }, 400);
    }

    const event: any = await db.prepare('SELECT * FROM events WHERE event_id = ?').bind(ticket.event_id).first();
    if (!event) return c.json({ error: 'Event not found' }, 404);

    const organizer: any = await db.prepare('SELECT * FROM organizer_profiles WHERE organizer_id = ?').bind(event.organizer_id).first();
    
    // 2. 割引計算 (キャンペーン適用)
    let discountAmount = 0;
    let campaignId = null;
    let appliedPromoCode = null;

    if (promo_code) {
        const now = new Date().toISOString();
        const campaign: any = await db.prepare(`
            SELECT * FROM campaigns 
            WHERE promo_code = ? 
            AND status = 'active'
            AND start_datetime <= ?
            AND end_datetime >= ?
        `).bind(promo_code, now, now).first();

        if (campaign) {
            // Check limits
            if (!campaign.max_uses || campaign.current_uses < campaign.max_uses) {
                // Check event restriction
                if (!campaign.event_id || campaign.event_id === ticket.event_id) {
                    campaignId = campaign.campaign_id;
                    appliedPromoCode = promo_code;
                    
                    if (campaign.discount_type === 'fixed_amount') {
                        discountAmount = campaign.discount_value;
                    } else {
                        // Percentage
                        const subTotal = ticket.price * quantity;
                        discountAmount = Math.floor(subTotal * (campaign.discount_value / 100));
                    }
                }
            }
        }
    }

    // 3. 最終金額計算
    const subTotal = ticket.price * quantity;
    const finalAmount = Math.max(0, subTotal - discountAmount);

    // 4. プラットフォーム手数料計算
    let platformFeeRate = 0.05; // デフォルト 5%

    // 主催者タイプによる優遇 (NPO/個人は無料)
    if (organizer) {
        if (organizer.type === 'npo' || organizer.type === 'individual') {
            platformFeeRate = 0;
        }
    }

    const platformFee = Math.floor(finalAmount * platformFeeRate);

    // 5. トランザクション実行 (D1 Batch)
    const batch = [
      // 在庫減少
      db.prepare('UPDATE tickets SET stock = stock - ?, sold_count = sold_count + ? WHERE ticket_id = ?').bind(quantity, quantity, ticket_id),
      
      // 注文作成
      db.prepare(`
        INSERT INTO orders (order_id, user_id, event_id, order_number, total_amount, platform_fee, payment_status, payment_method, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'completed', 'credit_card', CURRENT_TIMESTAMP)
      `).bind(orderId, userId, ticket.event_id, orderNumber, finalAmount, platformFee)
    ];

    // キャンペーン利用数の更新
    if (campaignId) {
        batch.push(
            db.prepare('UPDATE campaigns SET current_uses = current_uses + 1 WHERE campaign_id = ?').bind(campaignId)
        );
    }

    await db.batch(batch);

    return c.json({ 
      success: true, 
      order: { 
        order_id: orderId,
        order_number: orderNumber,
        subtotal: subTotal,
        discount: discountAmount,
        total: finalAmount,
        fee: platformFee,
        promo_code: appliedPromoCode
      } 
    });
  } catch (e: any) {
    console.error('Order Error:', e);
    return c.json({ error: e.message || 'Order processing failed' }, 500);
  }
});

// ユーザーの注文履歴取得
orderRoutes.get('/', async (c) => {
  const db = c.env.DB;
  const user = c.get('user');
  const userId = user.sub;

  try {
    const orders = await db.prepare(`
      SELECT 
        o.order_id,
        o.order_number,
        o.total_amount,
        o.platform_fee,
        o.payment_status,
        o.payment_method,
        o.created_at,
        e.event_id,
        e.title as event_title,
        e.cover_image_url,
        e.start_datetime,
        e.end_datetime,
        e.venue_name
      FROM orders o
      LEFT JOIN events e ON o.event_id = e.event_id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `).bind(userId).all();

    return c.json({ 
      success: true, 
      orders: orders.results || []
    });
  } catch (e: any) {
    console.error('Get Orders Error:', e);
    return c.json({ error: e.message || 'Failed to get orders' }, 500);
  }
});

export { orderRoutes };
