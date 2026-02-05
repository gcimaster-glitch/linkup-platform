import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import QRCode from 'qrcode';
import { createHmac } from 'node:crypto';
import type { Bindings } from '../index';
import { authMiddleware } from '../middleware/auth';

const checkinRoutes = new Hono<{ Bindings: Bindings }>();

// バリデーションスキーマ
const qrScanSchema = z.object({
  qr_code_data: z.string(),
  event_id: z.string().uuid(),
  device_id: z.string().optional(),
  location: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }).optional(),
});

const tapCheckinSchema = z.object({
  order_ticket_id: z.string().uuid(),
  event_id: z.string().uuid(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
});

// ============================================
// QRコード生成ユーティリティ
// ============================================
async function generateQRCode(orderTicketId: string, secretKey: string): Promise<{
  qrCodeData: string;
  qrCodeUrl: string;
}> {
  // QRコードデータ: orderTicketId + タイムスタンプ + HMAC署名
  const timestamp = Date.now();
  const payload = `${orderTicketId}:${timestamp}`;
  
  // HMAC-SHA256署名
  const hmac = createHmac('sha256', secretKey);
  hmac.update(payload);
  const signature = hmac.digest('hex');
  
  const qrCodeData = `LINKUP:${payload}:${signature}`;
  
  // QRコード画像生成
  const qrCodeImage = await QRCode.toDataURL(qrCodeData, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    width: 512,
    margin: 2,
  });
  
  return {
    qrCodeData,
    qrCodeUrl: qrCodeImage, // Data URL
  };
}

// QRコード検証
function verifyQRCode(qrCodeData: string, secretKey: string): {
  valid: boolean;
  orderTicketId?: string;
  error?: string;
} {
  try {
    // フォーマット確認: LINKUP:orderTicketId:timestamp:signature
    if (!qrCodeData.startsWith('LINKUP:')) {
      return { valid: false, error: 'Invalid QR format' };
    }
    
    const parts = qrCodeData.substring(7).split(':');
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid QR structure' };
    }
    
    const [orderTicketId, timestamp, signature] = parts;
    
    // タイムスタンプ検証(発行から24時間以内)
    const now = Date.now();
    const qrTimestamp = parseInt(timestamp);
    if (now - qrTimestamp > 24 * 60 * 60 * 1000) {
      return { valid: false, error: 'QR code expired' };
    }
    
    // 署名検証
    const payload = `${orderTicketId}:${timestamp}`;
    const hmac = createHmac('sha256', secretKey);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');
    
    if (signature !== expectedSignature) {
      return { valid: false, error: 'Invalid signature' };
    }
    
    return { valid: true, orderTicketId };
  } catch (error) {
    return { valid: false, error: 'Verification failed' };
  }
}

// ============================================
// POST /api/checkin/generate - QRコード生成
// ============================================
checkinRoutes.post('/generate', authMiddleware, async (c) => {
  const { order_ticket_id } = await c.req.json();
  const db = c.env.DB;
  const secretKey = c.env.JWT_SECRET;

  try {
    // チケット確認
    const ticket = await db
      .prepare(`
        SELECT ot.*, o.user_id, o.event_id, e.title as event_title
        FROM order_tickets ot
        JOIN orders o ON ot.order_id = o.order_id
        JOIN events e ON o.event_id = e.event_id
        WHERE ot.order_ticket_id = ?
      `)
      .bind(order_ticket_id)
      .first();

    if (!ticket) {
      return c.json({ error: 'Ticket not found' }, 404);
    }

    // QRコード生成
    const { qrCodeData, qrCodeUrl } = await generateQRCode(order_ticket_id, secretKey);

    // R2にアップロード(Data URLをBlobに変換)
    const base64Data = qrCodeUrl.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    
    const qrFileName = `qr/${order_ticket_id}.png`;
    await c.env.R2.put(qrFileName, buffer, {
      httpMetadata: {
        contentType: 'image/png',
      },
    });

    const r2Url = `https://pub-YOUR_R2_ID.r2.dev/${qrFileName}`;

    // DBに保存
    await db
      .prepare(`
        UPDATE order_tickets 
        SET qr_code_data = ?, qr_code_url = ?
        WHERE order_ticket_id = ?
      `)
      .bind(qrCodeData, r2Url, order_ticket_id)
      .run();

    return c.json({
      success: true,
      qr_code_url: r2Url,
      qr_code_data: qrCodeData,
      ticket: {
        order_ticket_id: ticket.order_ticket_id,
        event_title: ticket.event_title,
        attendee_name: ticket.attendee_name,
      },
    });
  } catch (error) {
    console.error('Generate QR error:', error);
    return c.json({ error: 'Failed to generate QR code' }, 500);
  }
});

// ============================================
// POST /api/checkin/scan - QRスキャン受付
// ============================================
checkinRoutes.post('/scan', authMiddleware, zValidator('json', qrScanSchema), async (c) => {
  const userId = c.get('userId');
  const { qr_code_data, event_id, device_id, location } = c.req.valid('json');
  const db = c.env.DB;
  const secretKey = c.env.JWT_SECRET;

  try {
    // QRコード検証
    const verification = verifyQRCode(qr_code_data, secretKey);
    if (!verification.valid) {
      return c.json({ 
        error: verification.error,
        success: false 
      }, 400);
    }

    const orderTicketId = verification.orderTicketId!;

    // チケット情報取得
    const ticket = await db
      .prepare(`
        SELECT 
          ot.*,
          o.event_id,
          o.user_id,
          e.title as event_title,
          e.organizer_id,
          u.display_name as attendee_display_name
        FROM order_tickets ot
        JOIN orders o ON ot.order_id = o.order_id
        JOIN events e ON o.event_id = e.event_id
        LEFT JOIN users u ON o.user_id = u.user_id
        WHERE ot.order_ticket_id = ?
      `)
      .bind(orderTicketId)
      .first();

    if (!ticket) {
      return c.json({ error: 'Ticket not found', success: false }, 404);
    }

    // イベント確認
    if (ticket.event_id !== event_id) {
      return c.json({ 
        error: 'Ticket is for a different event',
        success: false 
      }, 400);
    }

    // 主催者権限確認
    if (ticket.organizer_id !== userId) {
      return c.json({ error: 'Unauthorized', success: false }, 403);
    }

    // キャンセル済みチェック
    if (ticket.check_in_status === 'cancelled') {
      return c.json({ 
        error: 'Ticket has been cancelled',
        success: false 
      }, 400);
    }

    // 二重チェックイン防止
    if (ticket.check_in_status === 'checked_in') {
      return c.json({
        error: 'Already checked in',
        success: false,
        checked_in_at: ticket.checked_in_at,
        ticket_info: {
          attendee_name: ticket.attendee_name || ticket.attendee_display_name,
          event_title: ticket.event_title,
        },
      }, 400);
    }

    // チェックイン実行
    await db
      .prepare(`
        UPDATE order_tickets
        SET 
          check_in_status = 'checked_in',
          checked_in_at = CURRENT_TIMESTAMP,
          checked_in_by = ?
        WHERE order_ticket_id = ?
      `)
      .bind(userId, orderTicketId)
      .run();

    // イベントの参加者数を更新
    await db
      .prepare('UPDATE events SET current_attendees = current_attendees + 1 WHERE event_id = ?')
      .bind(event_id)
      .run();

    // メール通知を送信（非同期、エラーは無視）
    const checkedInAt = new Date().toISOString();
    try {
      // 参加者へのメール通知
      if (ticket.attendee_email) {
        await fetch(`${c.env.API_BASE_URL || 'https://api.link-up.live'}/api/email/send-checkin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: ticket.attendee_email,
            userName: ticket.attendee_name || ticket.attendee_display_name,
            eventName: ticket.event_title,
            ticketName: 'チケット',
            checkedInAt,
            isOrganizer: false,
          }),
        }).catch(e => console.error('Failed to send attendee email:', e));
      }

      // 主催者へのメール通知
      const organizer: any = await db
        .prepare('SELECT email FROM users WHERE user_id = ?')
        .bind(ticket.organizer_id)
        .first();
      
      if (organizer?.email) {
        await fetch(`${c.env.API_BASE_URL || 'https://api.link-up.live'}/api/email/send-checkin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: organizer.email,
            userName: ticket.attendee_name || ticket.attendee_display_name,
            eventName: ticket.event_title,
            ticketName: 'チケット',
            checkedInAt,
            isOrganizer: true,
          }),
        }).catch(e => console.error('Failed to send organizer email:', e));
      }
    } catch (emailError) {
      console.error('Email notification error:', emailError);
      // メール送信失敗してもチェックインは成功とする
    }

    return c.json({
      success: true,
      message: 'Check-in successful!',
      ticket_info: {
        order_ticket_id: orderTicketId,
        attendee_name: ticket.attendee_name || ticket.attendee_display_name,
        attendee_email: ticket.attendee_email,
        event_title: ticket.event_title,
        checked_in_at: checkedInAt,
      },
    });
  } catch (error) {
    console.error('QR scan error:', error);
    return c.json({ error: 'Failed to process check-in', success: false }, 500);
  }
});

// ============================================
// POST /api/checkin/tap - タップ受付
// ============================================
checkinRoutes.post('/tap', authMiddleware, zValidator('json', tapCheckinSchema), async (c) => {
  const userId = c.get('userId');
  const { order_ticket_id, event_id, location } = c.req.valid('json');
  const db = c.env.DB;

  try {
    // チケット情報取得
    const ticket = await db
      .prepare(`
        SELECT 
          ot.*,
          o.event_id,
          o.user_id,
          e.title as event_title,
          e.venue_lat,
          e.venue_lng,
          u.display_name
        FROM order_tickets ot
        JOIN orders o ON ot.order_id = o.order_id
        JOIN events e ON o.event_id = e.event_id
        LEFT JOIN users u ON o.user_id = u.user_id
        WHERE ot.order_ticket_id = ? AND o.user_id = ?
      `)
      .bind(order_ticket_id, userId)
      .first();

    if (!ticket) {
      return c.json({ error: 'Ticket not found or unauthorized', success: false }, 404);
    }

    if (ticket.event_id !== event_id) {
      return c.json({ error: 'Ticket is for a different event', success: false }, 400);
    }

    // 位置情報確認(会場から500m以内)
    if (ticket.venue_lat && ticket.venue_lng) {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        ticket.venue_lat,
        ticket.venue_lng
      );

      if (distance > 500) {
        return c.json({
          error: 'You are too far from the event venue',
          success: false,
          distance_meters: Math.round(distance),
        }, 400);
      }
    }

    // 二重チェックイン防止
    if (ticket.check_in_status === 'checked_in') {
      return c.json({
        error: 'Already checked in',
        success: false,
        checked_in_at: ticket.checked_in_at,
      }, 400);
    }

    // タップ受付実行
    await db
      .prepare(`
        UPDATE order_tickets
        SET 
          check_in_status = 'checked_in',
          checked_in_at = CURRENT_TIMESTAMP,
          checked_in_by = ?
        WHERE order_ticket_id = ?
      `)
      .bind(userId, order_ticket_id)
      .run();

    return c.json({
      success: true,
      message: 'タップ受付が完了しました!',
      ticket_info: {
        attendee_name: ticket.attendee_name || ticket.display_name,
        event_title: ticket.event_title,
        checked_in_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Tap check-in error:', error);
    return c.json({ error: 'Failed to process tap check-in', success: false }, 500);
  }
});

// ============================================
// GET /api/checkin/stats/:eventId - 受付統計
// ============================================
checkinRoutes.get('/stats/:eventId', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const eventId = c.req.param('eventId');
  const db = c.env.DB;

  try {
    // 主催者権限確認
    const event = await db
      .prepare('SELECT organizer_id FROM events WHERE event_id = ?')
      .bind(eventId)
      .first();

    if (!event || event.organizer_id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // 統計取得
    const stats = await db
      .prepare(`
        SELECT 
          COUNT(*) as total_tickets,
          SUM(CASE WHEN check_in_status = 'checked_in' THEN 1 ELSE 0 END) as checked_in,
          SUM(CASE WHEN check_in_status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN check_in_status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
        FROM order_tickets ot
        JOIN orders o ON ot.order_id = o.order_id
        WHERE o.event_id = ? AND o.payment_status = 'completed'
      `)
      .bind(eventId)
      .first();

    // 時間帯別チェックイン
    const { results: timeStats } = await db
      .prepare(`
        SELECT 
          strftime('%H:00', checked_in_at) as hour,
          COUNT(*) as count
        FROM order_tickets ot
        JOIN orders o ON ot.order_id = o.order_id
        WHERE o.event_id = ? AND check_in_status = 'checked_in'
        GROUP BY hour
        ORDER BY hour
      `)
      .bind(eventId)
      .all();

    return c.json({
      success: true,
      stats: {
        total_tickets: stats?.total_tickets || 0,
        checked_in: stats?.checked_in || 0,
        pending: stats?.pending || 0,
        cancelled: stats?.cancelled || 0,
        check_in_rate: stats?.total_tickets 
          ? ((stats.checked_in / stats.total_tickets) * 100).toFixed(1)
          : '0.0',
      },
      time_distribution: timeStats,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return c.json({ error: 'Failed to fetch statistics' }, 500);
  }
});

// ============================================
// GET /api/checkin/list/:eventId - 参加者リスト
// ============================================
checkinRoutes.get('/list/:eventId', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const eventId = c.req.param('eventId');
  const db = c.env.DB;

  try {
    // 主催者権限確認
    const event = await db
      .prepare('SELECT organizer_id FROM events WHERE event_id = ?')
      .bind(eventId)
      .first();

    if (!event || event.organizer_id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // 参加者リスト取得
    const { results: attendees } = await db
      .prepare(`
        SELECT 
          ot.order_ticket_id,
          ot.attendee_name,
          ot.attendee_email,
          ot.check_in_status,
          ot.checked_in_at,
          t.ticket_name,
          o.order_number
        FROM order_tickets ot
        JOIN orders o ON ot.order_id = o.order_id
        JOIN tickets t ON ot.ticket_id = t.ticket_id
        WHERE o.event_id = ? AND o.payment_status = 'completed'
        ORDER BY ot.checked_in_at DESC, ot.attendee_name ASC
      `)
      .bind(eventId)
      .all();

    return c.json({
      success: true,
      attendees,
    });
  } catch (error) {
    console.error('Get attendee list error:', error);
    return c.json({ error: 'Failed to fetch attendee list' }, 500);
  }
});

// ============================================
// ユーティリティ: 距離計算(Haversine formula)
// ============================================
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // 地球の半径(メートル)
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // メートル単位
}

export { checkinRoutes };
