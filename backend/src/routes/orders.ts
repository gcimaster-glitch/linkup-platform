import { Hono } from 'hono';
import { v4 as uuidv4 } from 'uuid';
import type { Bindings, Variables } from '../index';
import { authMiddleware } from '../middleware/auth';
import { ResendService } from '../services/resend';

const orderRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();


// 認証ミドルウェアを適用
orderRoutes.use('/*', authMiddleware);

orderRoutes.post('/', async (c) => {
  const db = c.env.DB;
  const { ticket_id, quantity, event_id, promo_code } = await c.req.json();
  const user = c.get('user');
  const userId = user.user_id;

  if (!ticket_id || !quantity || quantity <= 0) {
    return c.json({ error: 'Invalid request' }, 400);
  }

  const orderId = `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

  try {
    // 1. チケットとイベント、主催者情報の取得
    const ticket: any = await db.prepare('SELECT * FROM tickets WHERE ticket_id = ?').bind(ticket_id).first();
    if (!ticket) return c.json({ error: 'Ticket not found' }, 404);

    // 在庫チェック (カラム名: quantity_available)
    const availableStock = ticket.quantity_available ?? ticket.stock ?? 0;
    if (availableStock < quantity) {
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
      // 在庫減少 (quantity_available カラムを使用)
      db.prepare('UPDATE tickets SET quantity_available = quantity_available - ? WHERE ticket_id = ?').bind(quantity, ticket_id),
      
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

    // チケット購入メール送信
    if (c.env.RESEND_API_KEY) {
        try {
            const resend = new ResendService(c.env.RESEND_API_KEY);
            const userRecord: any = await db.prepare('SELECT email, name, display_name FROM users WHERE user_id = ?').bind(userId).first();
            const userName = userRecord?.display_name || userRecord?.name || 'お客様';
            const userEmail = userRecord?.email;
            
            if (userEmail) {
                await resend.sendEmail(
                    userEmail,
                    `LinkUp - チケット購入完了: ${event.title}`,
                    `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
                            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                            h1 { color: #2563EB; font-size: 24px; margin-bottom: 20px; }
                            .ticket-info { background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 20px 0; }
                            .ticket-info p { margin: 8px 0; color: #475569; }
                            .total { font-size: 20px; font-weight: bold; color: #2563EB; margin-top: 10px; }
                            .footer { color: #94a3b8; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>🎫 チケット購入完了</h1>
                            <p>${userName}様</p>
                            <p>チケットのご購入ありがとうございます。</p>
                            
                            <div class="ticket-info">
                                <p><strong>イベント名:</strong> ${event.title}</p>
                                <p><strong>チケット:</strong> ${ticket.ticket_name}</p>
                                <p><strong>数量:</strong> ${quantity}枚</p>
                                <p><strong>開催日時:</strong> ${new Date(event.start_datetime).toLocaleString('ja-JP')}</p>
                                <p><strong>会場:</strong> ${event.venue_name || 'オンライン'}</p>
                                ${appliedPromoCode ? `<p><strong>プロモコード:</strong> ${appliedPromoCode} (¥${discountAmount.toLocaleString()}割引)</p>` : ''}
                                <p class="total">合計金額: ¥${finalAmount.toLocaleString()}</p>
                            </div>
                            
                            <p>ご購入いただいたチケットは、マイページの「チケット」タブからご確認いただけます。</p>
                            
                            <div class="footer">
                                <p>このメールは自動送信されています。</p>
                                <p>© 2026 LinkUp. All rights reserved.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                    `
                );
                console.log(`[Ticket Purchase Email] Sent to ${userEmail} for order ${orderNumber}`);
            }
        } catch (emailError: any) {
            console.error('Failed to send purchase email:', emailError);
            // メール送信失敗は非致命的エラー（注文自体は成功）
        }
    }

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

// 注文詳細取得
orderRoutes.get('/:id', async (c) => {
  const db = c.env.DB;
  const user = c.get('user');
  const userId = user.user_id;
  const orderId = c.req.param('id');

  try {
    // ordersテーブルは ticket_id カラムを持たない構造のため
    // orders + events のJOINで基本情報を取得
    const order: any = await db.prepare(`
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
      WHERE o.order_id = ? AND o.user_id = ?
    `).bind(orderId, userId).first();

    if (!order) {
      return c.json({ error: '注文が見つかりません' }, 404);
    }

    // イベントのチケット情報を別途取得（最初のアクティブなチケット）
    let ticketInfo: any = null;
    if (order.event_id) {
      ticketInfo = await db.prepare(`
        SELECT name as ticket_name, ticket_name as ticket_name_alt, price
        FROM tickets
        WHERE event_id = ?
        ORDER BY created_at ASC
        LIMIT 1
      `).bind(order.event_id).first();
    }

    return c.json({ 
      success: true, 
      order: {
        ...order,
        ticket_name: ticketInfo?.ticket_name || ticketInfo?.ticket_name_alt || '一般参加',
        ticket_price: ticketInfo?.price ?? null
      }
    });
  } catch (e: any) {
    console.error('Get Order Detail Error:', e);
    return c.json({ error: e.message || 'Failed to get order' }, 500);
  }
});

// ユーザーの注文履歴取得
orderRoutes.get('/', async (c) => {
  const db = c.env.DB;
  const user = c.get('user');
  const userId = user.user_id;

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
