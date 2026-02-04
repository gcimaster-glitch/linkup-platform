import { Hono } from 'hono';
import { Resend } from 'resend';

export const emailRoutes = new Hono<{ Bindings: { RESEND_API_KEY: string } }>();

// Basic Send Endpoint
emailRoutes.post('/send', async (c) => {
  const { to, subject, html } = await c.req.json();
  const apiKey = c.env.RESEND_API_KEY;

  if (!apiKey) {
    return c.json({ success: false, error: 'Resend API Key not configured' }, 500);
  }

  const resend = new Resend(apiKey);

  try {
    const data = await resend.emails.send({
      from: 'LinkUp <onboarding@resend.dev>',
      to: to,
      subject: subject,
      html: html,
    });

    return c.json({ success: true, data });
  } catch (error) {
    console.error('Email send error:', error);
    return c.json({ success: false, error: error.message }, 400);
  }
});

// Ticket Purchase Confirmation Endpoint (Structured)
emailRoutes.post('/send-ticket', async (c) => {
  const { to, userName, eventName, ticketName, price, ticketId, qrUrl } = await c.req.json();
  const apiKey = c.env.RESEND_API_KEY;

  if (!apiKey) {
    // For demo/dev mode without key, verify we don't crash
    console.warn('Resend API Key missing. Skipping email.');
    return c.json({ success: false, error: 'Resend API Key not configured' }, 200); // Return 200 to not break frontend flow
  }

  const resend = new Resend(apiKey);

  // Modern HTML Email Template
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>チケット購入完了のお知らせ</title>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; margin-top: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { background-color: #2563EB; padding: 32px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; }
        .content { padding: 32px; color: #334155; }
        .ticket-info { background-color: #F8FAFC; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #E2E8F0; }
        .row { display: flex; justify-content: space-between; margin-bottom: 12px; }
        .label { color: #64748B; font-size: 14px; }
        .value { font-weight: bold; color: #1E293B; }
        .qr-section { text-align: center; margin-top: 32px; }
        .qr-img { width: 150px; height: 150px; }
        .footer { background-color: #F1F5F9; padding: 24px; text-align: center; color: #94A3B8; font-size: 12px; }
        .button { display: inline-block; background-color: #2563EB; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 9999px; font-weight: bold; margin-top: 24px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>LinkUp</h1>
        </div>
        <div class="content">
          <p>こんにちは、${userName}様</p>
          <p>イベントのチケット購入が完了しました。<br>当日はこのメールまたはマイページのQRコードを提示してご入場ください。</p>
          
          <div class="ticket-info">
            <div class="row">
              <span class="label">イベント名</span>
              <span class="value">${eventName}</span>
            </div>
            <div class="row">
              <span class="label">チケット種別</span>
              <span class="value">${ticketName}</span>
            </div>
            <div class="row">
              <span class="label">支払金額</span>
              <span class="value">¥${price.toLocaleString()}</span>
            </div>
            <div class="row">
              <span class="label">チケットID</span>
              <span class="value">#${ticketId}</span>
            </div>
          </div>

          <div class="qr-section">
            <p style="font-size: 14px; color: #64748B; margin-bottom: 16px;">入場用QRコード</p>
            <img src="${qrUrl}" alt="QR Code" class="qr-img">
          </div>

          <div style="text-align: center;">
            <a href="https://link-up.live" class="button">マイページで確認する</a>
          </div>
        </div>
        <div class="footer">
          <p>© 2026 LinkUp Inc. All rights reserved.</p>
          <p>東京都渋谷区渋谷2-24-12 渋谷スクランブルスクエア</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const data = await resend.emails.send({
      from: 'LinkUp <tickets@link-up.live>', // Ideal sender
      to: to,
      subject: `【LinkUp】チケット購入完了: ${eventName}`,
      html: htmlContent,
    });

    return c.json({ success: true, data });
  } catch (error) {
    console.error('Email send error:', error);
    return c.json({ success: false, error: error.message }, 400);
  }
});
