import { Hono } from 'hono';
import { v4 as uuidv4 } from 'uuid';
import type { Bindings, Variables } from '../index';
import { authMiddleware } from '../middleware/auth';
import { ResendService } from '../services/resend';

const transferRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();


// Apply authentication middleware
transferRoutes.use('/*', authMiddleware);

// Create a ticket transfer request
transferRoutes.post('/create', async (c) => {
  const db = c.env.DB;
  const user = c.get('user');
  const fromUserId = user.user_id;
  const { order_ticket_id, to_email, message } = await c.req.json();

  if (!order_ticket_id || !to_email) {
    return c.json({ error: 'Missing required fields' }, 400);
  }

  try {
    // Verify the ticket belongs to the user
    const ticket: any = await db.prepare(`
      SELECT ot.*, o.user_id, o.event_id, e.title as event_title, e.start_datetime
      FROM order_tickets ot
      LEFT JOIN orders o ON ot.order_id = o.order_id
      LEFT JOIN events e ON o.event_id = e.event_id
      WHERE ot.order_ticket_id = ?
    `).bind(order_ticket_id).first();

    if (!ticket) {
      return c.json({ error: 'Ticket not found' }, 404);
    }

    if (ticket.user_id !== fromUserId) {
      return c.json({ error: 'You do not own this ticket' }, 403);
    }

    // Check if ticket is already transferred
    if (ticket.transferred_to) {
      return c.json({ error: 'This ticket has already been transferred' }, 400);
    }

    // Check if there's a pending transfer
    const existingTransfer: any = await db.prepare(`
      SELECT * FROM ticket_transfers 
      WHERE order_ticket_id = ? AND status = 'pending'
    `).bind(order_ticket_id).first();

    if (existingTransfer) {
      return c.json({ error: 'There is already a pending transfer for this ticket' }, 400);
    }

    // Generate transfer code (8-character alphanumeric)
    const transferCode = uuidv4().substring(0, 8).toUpperCase();
    const transferId = `xfer-${Date.now()}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    // Create transfer record
    await db.prepare(`
      INSERT INTO ticket_transfers (
        transfer_id, order_ticket_id, from_user_id, to_email,
        status, transfer_code, message, expires_at, created_at
      ) VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(transferId, order_ticket_id, fromUserId, to_email, transferCode, message || null, expiresAt).run();

    // Send transfer email
    if (c.env.RESEND_API_KEY) {
      try {
        const resend = new ResendService(c.env.RESEND_API_KEY);
        const fromUser = await db.prepare('SELECT display_name, name, email FROM users WHERE user_id = ?').bind(fromUserId).first() as any;
        const fromName = fromUser?.display_name || fromUser?.name || 'A user';
        const transferUrl = `${c.env.FRONTEND_URL}/transfer-accept?code=${transferCode}`;

        await resend.sendEmail(
          to_email,
          `LinkUp - ${fromName}さんからチケットが譲渡されました`,
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
              .code { font-size: 28px; font-weight: bold; color: #2563EB; background: #EFF6FF; padding: 15px; border-radius: 8px; text-align: center; letter-spacing: 3px; margin: 20px 0; }
              .button { display: inline-block; background: #2563EB; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
              .button:hover { background: #1E40AF; }
              .message { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; border-radius: 4px; }
              .footer { color: #94a3b8; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🎫 チケット譲渡のお知らせ</h1>
              <p>${fromName}さんから、チケットが譲渡されました。</p>
              
              <div class="ticket-info">
                <p><strong>イベント名:</strong> ${ticket.event_title}</p>
                <p><strong>チケット:</strong> ${ticket.ticket_name}</p>
                <p><strong>開催日時:</strong> ${new Date(ticket.start_datetime).toLocaleString('ja-JP')}</p>
              </div>

              ${message ? `
              <div class="message">
                <p><strong>メッセージ:</strong></p>
                <p>${message}</p>
              </div>
              ` : ''}
              
              <p><strong>譲渡コード:</strong></p>
              <div class="code">${transferCode}</div>
              
              <p>以下のボタンをクリックして、チケットを受け取ってください。</p>
              <p style="text-align: center;">
                <a href="${transferUrl}" class="button">チケットを受け取る</a>
              </p>
              
              <p><small>※ この譲渡リンクは7日間有効です。期限を過ぎると無効になります。</small></p>
              <p><small>※ チケットを受け取るには、LinkUpアカウントでログインする必要があります。</small></p>
              
              <div class="footer">
                <p>このメールは自動送信されています。</p>
                <p>© 2026 LinkUp. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
          `
        );
        console.log(`[Ticket Transfer Email] Sent to ${to_email} for transfer ${transferId}`);
      } catch (emailError) {
        console.error('Failed to send transfer email:', emailError);
      }
    }

    return c.json({
      success: true,
      transfer: {
        transfer_id: transferId,
        transfer_code: transferCode,
        to_email,
        expires_at: expiresAt
      }
    });
  } catch (error: any) {
    console.error('Error creating ticket transfer:', error);
    return c.json({ error: 'Failed to create transfer' }, 500);
  }
});

// Get user's outgoing transfers (sent)
transferRoutes.get('/sent', async (c) => {
  const db = c.env.DB;
  const user = c.get('user');
  const userId = user.user_id;

  try {
    const transfers = await db.prepare(`
      SELECT 
        tt.*,
        ot.ticket_name,
        e.title as event_title,
        e.start_datetime,
        e.cover_image_url
      FROM ticket_transfers tt
      LEFT JOIN order_tickets ot ON tt.order_ticket_id = ot.order_ticket_id
      LEFT JOIN orders o ON ot.order_id = o.order_id
      LEFT JOIN events e ON o.event_id = e.event_id
      WHERE tt.from_user_id = ?
      ORDER BY tt.created_at DESC
    `).bind(userId).all();

    return c.json({ success: true, transfers: transfers.results || [] });
  } catch (error: any) {
    console.error('Error fetching sent transfers:', error);
    return c.json({ error: 'Failed to fetch transfers' }, 500);
  }
});

// Get user's incoming transfers (received)
transferRoutes.get('/received', async (c) => {
  const db = c.env.DB;
  const user = c.get('user');
  const userEmail = user.email;

  try {
    const transfers = await db.prepare(`
      SELECT 
        tt.*,
        ot.ticket_name,
        e.title as event_title,
        e.start_datetime,
        e.cover_image_url,
        u.display_name as from_name,
        u.email as from_email
      FROM ticket_transfers tt
      LEFT JOIN order_tickets ot ON tt.order_ticket_id = ot.order_ticket_id
      LEFT JOIN orders o ON ot.order_id = o.order_id
      LEFT JOIN events e ON o.event_id = e.event_id
      LEFT JOIN users u ON tt.from_user_id = u.user_id
      WHERE tt.to_email = ? AND tt.status = 'pending'
      ORDER BY tt.created_at DESC
    `).bind(userEmail).all();

    return c.json({ success: true, transfers: transfers.results || [] });
  } catch (error: any) {
    console.error('Error fetching received transfers:', error);
    return c.json({ error: 'Failed to fetch transfers' }, 500);
  }
});

// Accept a ticket transfer
transferRoutes.post('/accept', async (c) => {
  const db = c.env.DB;
  const user = c.get('user');
  const toUserId = user.user_id;
  const toEmail = user.email;
  const { transfer_code } = await c.req.json();

  if (!transfer_code) {
    return c.json({ error: 'Transfer code is required' }, 400);
  }

  try {
    // Find the transfer
    const transfer: any = await db.prepare(`
      SELECT * FROM ticket_transfers 
      WHERE transfer_code = ? AND to_email = ?
    `).bind(transfer_code, toEmail).first();

    if (!transfer) {
      return c.json({ error: 'Transfer not found or not addressed to you' }, 404);
    }

    // Check if already accepted/rejected/cancelled
    if (transfer.status !== 'pending') {
      return c.json({ error: `Transfer is already ${transfer.status}` }, 400);
    }

    // Check if expired
    if (new Date(transfer.expires_at) < new Date()) {
      await db.prepare('UPDATE ticket_transfers SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE transfer_id = ?')
        .bind('expired', transfer.transfer_id).run();
      return c.json({ error: 'Transfer has expired' }, 400);
    }

    // Get ticket and order info
    const ticket: any = await db.prepare(`
      SELECT ot.*, o.order_id, o.user_id as original_user_id, o.event_id
      FROM order_tickets ot
      LEFT JOIN orders o ON ot.order_id = o.order_id
      WHERE ot.order_ticket_id = ?
    `).bind(transfer.order_ticket_id).first();

    if (!ticket) {
      return c.json({ error: 'Ticket not found' }, 404);
    }

    // Create a new order for the recipient
    const newOrderId = `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newOrderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    await db.batch([
      // Create new order for recipient
      db.prepare(`
        INSERT INTO orders (order_id, user_id, event_id, order_number, total_amount, platform_fee, payment_status, payment_method, created_at)
        VALUES (?, ?, ?, ?, 0, 0, 'completed', 'transfer', CURRENT_TIMESTAMP)
      `).bind(newOrderId, toUserId, ticket.event_id, newOrderNumber),

      // Update the ticket to point to new order
      db.prepare(`
        UPDATE order_tickets 
        SET order_id = ?, transferred_from = ?, transferred_to = ?, transfer_date = CURRENT_TIMESTAMP
        WHERE order_ticket_id = ?
      `).bind(newOrderId, ticket.original_user_id, toUserId, transfer.order_ticket_id),

      // Update transfer status
      db.prepare(`
        UPDATE ticket_transfers 
        SET status = 'accepted', to_user_id = ?, transferred_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE transfer_id = ?
      `).bind(toUserId, transfer.transfer_id)
    ]);

    // Send confirmation emails
    if (c.env.RESEND_API_KEY) {
      try {
        const resend = new ResendService(c.env.RESEND_API_KEY);
        
        // Get event info
        const event: any = await db.prepare('SELECT title FROM events WHERE event_id = ?').bind(ticket.event_id).first();
        
        // Email to recipient
        const toUser = await db.prepare('SELECT display_name, name FROM users WHERE user_id = ?').bind(toUserId).first() as any;
        const toName = toUser?.display_name || toUser?.name || 'お客様';
        
        await resend.sendEmail(
          toEmail,
          `LinkUp - チケット譲渡完了: ${event?.title}`,
          `
          <h1>🎉 チケットを受け取りました</h1>
          <p>${toName}様</p>
          <p>チケットの譲渡が完了しました。マイページからご確認いただけます。</p>
          <p><strong>イベント:</strong> ${event?.title}</p>
          <p><strong>チケット:</strong> ${ticket.ticket_name}</p>
          `
        );

        // Email to sender
        const fromUser = await db.prepare('SELECT email, display_name, name FROM users WHERE user_id = ?').bind(transfer.from_user_id).first() as any;
        const fromName = fromUser?.display_name || fromUser?.name || 'お客様';
        
        await resend.sendEmail(
          fromUser.email,
          `LinkUp - チケット譲渡完了: ${event?.title}`,
          `
          <h1>✅ チケット譲渡が完了しました</h1>
          <p>${fromName}様</p>
          <p>${toEmail}へのチケット譲渡が完了しました。</p>
          <p><strong>イベント:</strong> ${event?.title}</p>
          <p><strong>チケット:</strong> ${ticket.ticket_name}</p>
          `
        );
      } catch (emailError) {
        console.error('Failed to send transfer confirmation emails:', emailError);
      }
    }

    return c.json({ 
      success: true, 
      message: 'Transfer accepted successfully',
      order_id: newOrderId
    });
  } catch (error: any) {
    console.error('Error accepting transfer:', error);
    return c.json({ error: 'Failed to accept transfer' }, 500);
  }
});

// Reject a ticket transfer
transferRoutes.post('/reject', async (c) => {
  const db = c.env.DB;
  const user = c.get('user');
  const toEmail = user.email;
  const { transfer_code } = await c.req.json();

  if (!transfer_code) {
    return c.json({ error: 'Transfer code is required' }, 400);
  }

  try {
    const transfer: any = await db.prepare(`
      SELECT * FROM ticket_transfers 
      WHERE transfer_code = ? AND to_email = ?
    `).bind(transfer_code, toEmail).first();

    if (!transfer) {
      return c.json({ error: 'Transfer not found' }, 404);
    }

    if (transfer.status !== 'pending') {
      return c.json({ error: `Transfer is already ${transfer.status}` }, 400);
    }

    await db.prepare('UPDATE ticket_transfers SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE transfer_id = ?')
      .bind('rejected', transfer.transfer_id).run();

    // Notify sender
    if (c.env.RESEND_API_KEY) {
      try {
        const resend = new ResendService(c.env.RESEND_API_KEY);
        const fromUser = await db.prepare('SELECT email FROM users WHERE user_id = ?').bind(transfer.from_user_id).first() as any;
        
        await resend.sendEmail(
          fromUser.email,
          'LinkUp - チケット譲渡が拒否されました',
          `<p>${toEmail}がチケット譲渡を拒否しました。</p>`
        );
      } catch (emailError) {
        console.error('Failed to send rejection email:', emailError);
      }
    }

    return c.json({ success: true, message: 'Transfer rejected' });
  } catch (error: any) {
    console.error('Error rejecting transfer:', error);
    return c.json({ error: 'Failed to reject transfer' }, 500);
  }
});

// Cancel a transfer (by sender)
transferRoutes.post('/cancel', async (c) => {
  const db = c.env.DB;
  const user = c.get('user');
  const userId = user.user_id;
  const { transfer_id } = await c.req.json();

  if (!transfer_id) {
    return c.json({ error: 'Transfer ID is required' }, 400);
  }

  try {
    const transfer: any = await db.prepare(`
      SELECT * FROM ticket_transfers WHERE transfer_id = ? AND from_user_id = ?
    `).bind(transfer_id, userId).first();

    if (!transfer) {
      return c.json({ error: 'Transfer not found' }, 404);
    }

    if (transfer.status !== 'pending') {
      return c.json({ error: `Transfer is already ${transfer.status}` }, 400);
    }

    await db.prepare('UPDATE ticket_transfers SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE transfer_id = ?')
      .bind('cancelled', transfer_id).run();

    return c.json({ success: true, message: 'Transfer cancelled' });
  } catch (error: any) {
    console.error('Error cancelling transfer:', error);
    return c.json({ error: 'Failed to cancel transfer' }, 500);
  }
});

export { transferRoutes };
