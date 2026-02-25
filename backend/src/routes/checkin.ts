import { Hono } from 'hono';
import type { Bindings, Variables } from '../index';
import { authMiddleware } from '../middleware/auth';
import { verifyQRHmac, buildQRData } from '../utils/qr';

const checkinRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// ============================================================
// POST /api/checkin/generate-qr
// QRコードデータを生成して返す（認証必須・本人のみ）
// リクエスト: { order_id }
// レスポンス: { success, qr_data, order_number, event_title }
// ============================================================
checkinRoutes.post('/generate-qr', authMiddleware, async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  const { order_id } = await c.req.json();

  if (!order_id) {
    return c.json({ success: false, error: '注文IDが必要です' }, 400);
  }

  try {
    // 注文情報取得（本人確認）
    const order: any = await db.prepare(`
      SELECT
        o.order_id, o.order_number, o.user_id, o.event_id,
        o.payment_status, o.checkin_status, o.total_amount,
        e.title as event_title, e.start_datetime,
        e.venue_name
      FROM orders o
      JOIN events e ON o.event_id = e.event_id
      WHERE o.order_id = ?
    `).bind(order_id).first();

    if (!order) {
      return c.json({ success: false, error: '注文が見つかりません' }, 404);
    }

    // 本人確認（admin は全チケットアクセス可）
    if (order.user_id !== user.user_id && user.role !== 'admin') {
      return c.json({ success: false, error: 'このチケットにアクセスする権限がありません' }, 403);
    }

    // 支払い済み確認
    if (order.payment_status !== 'completed') {
      return c.json({
        success: false,
        error: '支払いが完了していない注文のQRコードは生成できません',
        payment_status: order.payment_status,
      }, 400);
    }

    // QRデータ生成（HMAC署名付き）
    const qrData = await buildQRData(order_id, c.env.JWT_SECRET);

    return c.json({
      success: true,
      qr_data: qrData,
      order_number: order.order_number,
      event_title: order.event_title,
      start_datetime: order.start_datetime,
      venue_name: order.venue_name,
    });
  } catch (e: any) {
    console.error('Generate QR error:', e);
    return c.json({ success: false, error: e.message || 'QRコード生成に失敗しました' }, 500);
  }
});

// ============================================================
// POST /api/checkin/verify
// QRコードをスキャンしてチェックインを実行（主催者・admin専用）
// リクエスト: { qr_data, event_id }
// レスポンス: { success, message, attendee_name, order_number, checked_in_at }
// ============================================================
checkinRoutes.post('/verify', authMiddleware, async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  const { qr_data, event_id } = await c.req.json();

  if (user.role !== 'organizer' && user.role !== 'admin') {
    return c.json({ success: false, error: '主催者権限が必要です' }, 403);
  }

  if (!qr_data || !event_id) {
    return c.json({ success: false, error: 'QRデータとイベントIDが必要です' }, 400);
  }

  try {
    // QRデータのパース: LINKUP:{orderId}:{timestamp}:{sig}
    if (!qr_data.startsWith('LINKUP:')) {
      return c.json({ success: false, error: '無効なQRコード形式です' }, 400);
    }

    const parts = qr_data.substring(7).split(':');
    if (parts.length < 3) {
      return c.json({ success: false, error: 'QRコードの形式が正しくありません' }, 400);
    }

    const [orderId, timestampStr] = parts;
    const timestamp = parseInt(timestampStr, 10);

    // タイムスタンプ検証（発行から48時間以内）
    const now = Date.now();
    if (isNaN(timestamp) || now - timestamp > 48 * 60 * 60 * 1000) {
      return c.json({ success: false, error: 'QRコードの有効期限が切れています（48時間）' }, 400);
    }

    // HMAC署名検証
    const isValidSig = await verifyQRHmac(orderId, timestampStr, parts[2], c.env.JWT_SECRET);
    if (!isValidSig) {
      return c.json({ success: false, error: 'QRコードの署名が無効です（偽造防止）' }, 400);
    }

    // 注文情報取得
    const order: any = await db.prepare(`
      SELECT
        o.order_id, o.order_number, o.user_id, o.event_id,
        o.payment_status, o.checkin_status, o.checked_in_at,
        o.total_amount,
        e.title as event_title, e.organizer_id,
        u.display_name as attendee_name, u.email as attendee_email
      FROM orders o
      JOIN events e ON o.event_id = e.event_id
      JOIN users u ON o.user_id = u.user_id
      WHERE o.order_id = ?
    `).bind(orderId).first();

    if (!order) {
      return c.json({ success: false, error: '注文が見つかりません' }, 404);
    }

    // 支払い状態確認
    if (order.payment_status !== 'completed') {
      return c.json({
        success: false,
        error: '支払いが完了していないチケットです',
        payment_status: order.payment_status,
      }, 400);
    }

    // イベント一致確認
    if (order.event_id !== event_id) {
      return c.json({
        success: false,
        error: 'このQRコードは別のイベント用です',
        ticket_event: order.event_title,
      }, 400);
    }

    // 主催者権限確認（管理者は全イベントにアクセス可）
    if (user.role === 'organizer' && order.organizer_id !== user.user_id) {
      return c.json({ success: false, error: '主催者権限がありません（別の主催者のイベントです）' }, 403);
    }

    // 重複チェックイン確認
    if (order.checkin_status === 'checked_in') {
      return c.json({
        success: false,
        error: 'このチケットはすでにチェックイン済みです',
        already_checked_in: true,
        checked_in_at: order.checked_in_at,
        attendee_name: order.attendee_name,
        order_number: order.order_number,
      }, 409);
    }

    // チェックイン実行
    const checkinAt = new Date().toISOString();
    await db.batch([
      // 注文にチェックイン情報を記録
      db.prepare(`
        UPDATE orders
        SET checkin_status = 'checked_in', checked_in_at = ?
        WHERE order_id = ?
      `).bind(checkinAt, orderId),

      // イベントの参加者数を+1
      db.prepare(`
        UPDATE events
        SET current_attendees = COALESCE(current_attendees, 0) + 1
        WHERE event_id = ?
      `).bind(event_id),
    ]);

    return c.json({
      success: true,
      message: 'チェックイン完了！',
      order_number: order.order_number,
      attendee_name: order.attendee_name,
      attendee_email: order.attendee_email,
      event_title: order.event_title,
      checked_in_at: checkinAt,
    });

  } catch (e: any) {
    console.error('Checkin verify error:', e);
    return c.json({ success: false, error: e.message || 'チェックイン処理に失敗しました' }, 500);
  }
});

// ============================================================
// GET /api/checkin/status/:orderId
// チェックイン状態を確認（主催者・admin専用）
// ============================================================
checkinRoutes.get('/status/:orderId', authMiddleware, async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  const orderId = c.req.param('orderId');

  if (user.role !== 'organizer' && user.role !== 'admin') {
    return c.json({ success: false, error: '主催者権限が必要です' }, 403);
  }

  try {
    const order: any = await db.prepare(`
      SELECT
        o.order_id, o.order_number, o.checkin_status, o.checked_in_at,
        o.payment_status, o.total_amount,
        e.title as event_title,
        u.display_name as attendee_name, u.email as attendee_email
      FROM orders o
      JOIN events e ON o.event_id = e.event_id
      JOIN users u ON o.user_id = u.user_id
      WHERE o.order_id = ?
    `).bind(orderId).first();

    if (!order) {
      return c.json({ success: false, error: '注文が見つかりません' }, 404);
    }

    return c.json({
      success: true,
      order_id: order.order_id,
      order_number: order.order_number,
      checkin_status: order.checkin_status,
      checked_in_at: order.checked_in_at,
      attendee_name: order.attendee_name,
      event_title: order.event_title,
    });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

export { checkinRoutes };
