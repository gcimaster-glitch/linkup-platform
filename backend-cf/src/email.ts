// Cloudflare Workers用 Resend メール送信実装 - プロレベルHTMLテンプレート
import { Resend } from "resend";

export interface EmailResult {
  success: boolean;
  error?: string;
}

function getResend(apiKey: string): Resend {
  return new Resend(apiKey);
}

const FROM_ADDRESS = "LINK-UP <noreply@link-up.live>";
const REPLY_TO = "support@link-up.live";
const BRAND_COLOR = "#6366f1";
const BRAND_GRADIENT = "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)";

// ============================================================
// 共通HTMLパーツ
// ============================================================
function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>LINK-UP</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:'Helvetica Neue',Arial,'Hiragino Kaku Gothic ProN','Hiragino Sans',Meiryo,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <!-- ヘッダー -->
      <tr>
        <td style="background:${BRAND_GRADIENT};padding:32px 40px;text-align:center;">
          <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:12px;padding:8px 20px;margin-bottom:12px;">
            <span style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:2px;">LINK-UP</span>
          </div>
          <p style="color:rgba(255,255,255,0.85);margin:0;font-size:13px;letter-spacing:1px;">人と機会を繋げる</p>
        </td>
      </tr>
      <!-- 本文 -->
      ${content}
      <!-- フッター -->
      <tr>
        <td style="background:#f9fafb;padding:24px 40px;border-top:1px solid #e5e7eb;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center">
                <p style="color:#9ca3af;font-size:12px;margin:0 0 8px;">このメールはLINK-UPから自動送信されています。</p>
                <p style="color:#9ca3af;font-size:12px;margin:0 0 8px;">
                  <a href="https://link-up.live" style="color:${BRAND_COLOR};text-decoration:none;">link-up.live</a>
                  &nbsp;|&nbsp;
                  <a href="mailto:support@link-up.live" style="color:${BRAND_COLOR};text-decoration:none;">お問い合わせ</a>
                </p>
                <p style="color:#d1d5db;font-size:11px;margin:0;">© 2026 LINK-UP. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function infoRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:14px;width:40%;">${label}</td>
    <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#111827;font-size:14px;font-weight:600;">${value}</td>
  </tr>`;
}

function ctaButton(text: string, url: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:0 auto;">
    <tr>
      <td align="center" style="background:${BRAND_GRADIENT};border-radius:10px;padding:14px 36px;">
        <a href="${url}" style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;letter-spacing:0.5px;">${text}</a>
      </td>
    </tr>
  </table>`;
}

function alertBox(icon: string, title: string, body: string, color: string = "#f0fdf4", borderColor: string = "#10b981"): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:${color};border-left:4px solid ${borderColor};border-radius:8px;margin-bottom:24px;">
    <tr>
      <td style="padding:16px 20px;">
        <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#111827;">${icon} ${title}</p>
        <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">${body}</p>
      </td>
    </tr>
  </table>`;
}

// ============================================================
// 1. チケット購入確認メール
// ============================================================
export interface TicketConfirmationEmailParams {
  to: string;
  recipientName: string;
  eventTitle: string;
  eventDatetime: string;
  eventLocation: string;
  ticketType: string;
  quantity: number;
  totalAmount: number;
  currency: string;
  orderId: string;
  qrCodeHashes?: string[];
  resendApiKey?: string;
}

export async function sendTicketConfirmationEmail(params: TicketConfirmationEmailParams): Promise<EmailResult> {
  try {
    const apiKey = params.resendApiKey;
    if (!apiKey) return { success: false, error: "RESEND_API_KEY not set" };
    const resend = getResend(apiKey);
    const isFree = params.totalAmount === 0;
    const amountStr = isFree ? "無料" : `¥${params.totalAmount.toLocaleString("ja-JP")}`;

    const qrSection = params.qrCodeHashes && params.qrCodeHashes.length > 0
      ? `<tr><td style="padding:24px 40px;">
          ${alertBox("🎫", "入場QRコード", "以下のQRコードハッシュを入場時にご提示ください。当日は画面をご提示いただくか、印刷してお持ちください。", "#eff6ff", "#3b82f6")}
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:8px;padding:16px;">
            ${params.qrCodeHashes.map((h, i) => `<tr><td style="padding:6px 12px;font-size:12px;color:#6b7280;">チケット ${i + 1}</td><td style="padding:6px 12px;font-family:monospace;font-size:12px;color:#374151;word-break:break-all;">${h}</td></tr>`).join("")}
          </table>
        </td></tr>`
      : "";

    const content = `
      <tr>
        <td style="padding:32px 40px 0;">
          <p style="font-size:16px;color:#374151;margin:0 0 8px;">こんにちは、<strong>${params.recipientName}</strong> 様</p>
          <p style="font-size:14px;color:#6b7280;margin:0 0 24px;">この度はLINK-UPをご利用いただきありがとうございます。</p>
          ${alertBox("✅", isFree ? "無料チケットの登録が完了しました" : "お支払いが確認できました", `「${params.eventTitle}」のチケット登録が完了しました。当日は入場QRコードをご提示ください。`)}
        </td>
      </tr>
      <tr>
        <td style="padding:0 40px 24px;">
          <h2 style="font-size:15px;font-weight:700;color:#111827;margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid #e5e7eb;">📋 ご注文内容</h2>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${infoRow("イベント名", params.eventTitle)}
            ${infoRow("開催日時", params.eventDatetime)}
            ${infoRow("会場", params.eventLocation || "オンライン")}
            ${infoRow("チケット種別", params.ticketType)}
            ${infoRow("枚数", `${params.quantity}枚`)}
            ${infoRow("合計金額", amountStr)}
            ${infoRow("注文ID", `#${params.orderId}`)}
          </table>
        </td>
      </tr>
      ${qrSection}
      <tr>
        <td style="padding:16px 40px 32px;text-align:center;">
          ${ctaButton("マイチケットを確認する", "https://link-up.live/mypage/tickets")}
          <p style="color:#9ca3af;font-size:12px;margin:16px 0 0;">ご不明な点はサポートまでお問い合わせください。</p>
        </td>
      </tr>`;

    const html = emailWrapper(content);
    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [params.to],
      replyTo: REPLY_TO,
      subject: `【LINK-UP】チケット購入確認 - ${params.eventTitle}`,
      html,
    });
    if (result.error) return { success: false, error: result.error.message };
    return { success: true };
  } catch (err) { return { success: false, error: String(err) }; }
}

export const sendTicketPurchaseEmail = sendTicketConfirmationEmail;

// ============================================================
// 2. 注文キャンセル完了メール
// ============================================================
export async function sendOrderCancelEmail(params: {
  to: string;
  recipientName: string;
  eventTitle: string;
  orderId: string;
  refundAmount?: number;
  resendApiKey?: string;
}): Promise<EmailResult> {
  try {
    const apiKey = params.resendApiKey;
    if (!apiKey) return { success: false, error: "RESEND_API_KEY not set" };
    const resend = getResend(apiKey);
    const hasRefund = params.refundAmount && params.refundAmount > 0;
    const refundStr = hasRefund ? `¥${params.refundAmount!.toLocaleString("ja-JP")}` : "なし";

    const content = `
      <tr>
        <td style="padding:32px 40px 0;">
          <p style="font-size:16px;color:#374151;margin:0 0 8px;">こんにちは、<strong>${params.recipientName}</strong> 様</p>
          <p style="font-size:14px;color:#6b7280;margin:0 0 24px;">ご注文のキャンセルが完了しました。</p>
          ${alertBox("🔔", "キャンセル処理が完了しました", `「${params.eventTitle}」のご注文をキャンセルしました。またのご利用をお待ちしております。`, "#fff7ed", "#f97316")}
        </td>
      </tr>
      <tr>
        <td style="padding:0 40px 24px;">
          <h2 style="font-size:15px;font-weight:700;color:#111827;margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid #e5e7eb;">📋 キャンセル詳細</h2>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${infoRow("イベント名", params.eventTitle)}
            ${infoRow("注文ID", `#${params.orderId}`)}
            ${infoRow("キャンセル日時", new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }))}
            ${infoRow("返金金額", refundStr)}
          </table>
          ${hasRefund ? `<div style="margin-top:16px;padding:16px;background:#eff6ff;border-radius:8px;"><p style="margin:0;font-size:13px;color:#1d4ed8;">💳 <strong>返金について：</strong>クレジットカードへの返金は通常3〜7営業日以内に反映されます。</p></div>` : ""}
        </td>
      </tr>
      <tr>
        <td style="padding:16px 40px 32px;text-align:center;">
          ${ctaButton("他のイベントを探す", "https://link-up.live/events")}
          <p style="color:#9ca3af;font-size:12px;margin:16px 0 0;">返金に関するお問い合わせは <a href="mailto:support@link-up.live" style="color:${BRAND_COLOR};">support@link-up.live</a> までご連絡ください。</p>
        </td>
      </tr>`;

    const html = emailWrapper(content);
    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [params.to],
      replyTo: REPLY_TO,
      subject: `【LINK-UP】注文キャンセル完了 - ${params.eventTitle}`,
      html,
    });
    if (result.error) return { success: false, error: result.error.message };
    return { success: true };
  } catch (err) { return { success: false, error: String(err) }; }
}

// ============================================================
// 3. キャンセル待ち通知メール
// ============================================================
export async function sendWaitlistNotificationEmail(params: {
  to: string;
  recipientName: string;
  eventTitle: string;
  eventDatetime: string;
  ticketType: string;
  reservationDeadline: string;
  purchaseUrl: string;
  resendApiKey?: string;
}): Promise<EmailResult> {
  try {
    const apiKey = params.resendApiKey;
    if (!apiKey) return { success: false, error: "RESEND_API_KEY not set" };
    const resend = getResend(apiKey);

    const content = `
      <tr>
        <td style="padding:32px 40px 0;">
          <p style="font-size:16px;color:#374151;margin:0 0 8px;">こんにちは、<strong>${params.recipientName}</strong> 様</p>
          <p style="font-size:14px;color:#6b7280;margin:0 0 24px;">お待たせしました！空席のお知らせです。</p>
          ${alertBox("🎉", "空席が出ました！", `「${params.eventTitle}」に空席が発生しました。購入期限までにお手続きください。`, "#fefce8", "#eab308")}
        </td>
      </tr>
      <tr>
        <td style="padding:0 40px 24px;">
          <h2 style="font-size:15px;font-weight:700;color:#111827;margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid #e5e7eb;">📋 イベント情報</h2>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${infoRow("イベント名", params.eventTitle)}
            ${infoRow("開催日時", params.eventDatetime)}
            ${infoRow("チケット種別", params.ticketType)}
            ${infoRow("購入期限", params.reservationDeadline)}
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:0 40px 16px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;">
            <tr>
              <td style="padding:16px 20px;">
                <p style="margin:0;font-size:14px;color:#dc2626;font-weight:700;">⏰ 購入期限にご注意ください</p>
                <p style="margin:4px 0 0;font-size:13px;color:#7f1d1d;">期限を過ぎると自動的に次の方へ権利が移ります。お早めにお手続きください。</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 40px 32px;text-align:center;">
          ${ctaButton("今すぐチケットを購入する", params.purchaseUrl)}
          <p style="color:#9ca3af;font-size:12px;margin:16px 0 0;">このメールに心当たりがない場合は無視してください。</p>
        </td>
      </tr>`;

    const html = emailWrapper(content);
    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [params.to],
      replyTo: REPLY_TO,
      subject: `【LINK-UP】空席のお知らせ - ${params.eventTitle}`,
      html,
    });
    if (result.error) return { success: false, error: result.error.message };
    return { success: true };
  } catch (err) { return { success: false, error: String(err) }; }
}

// ============================================================
// 4. チケット譲渡メール
// ============================================================
export async function sendTransferEmail(params: {
  to: string;
  recipientName: string;
  senderName: string;
  eventTitle: string;
  eventDatetime: string;
  ticketType: string;
  acceptUrl: string;
  resendApiKey?: string;
}): Promise<EmailResult> {
  try {
    const apiKey = params.resendApiKey;
    if (!apiKey) return { success: false, error: "RESEND_API_KEY not set" };
    const resend = getResend(apiKey);

    const content = `
      <tr>
        <td style="padding:32px 40px 0;">
          <p style="font-size:16px;color:#374151;margin:0 0 8px;">こんにちは、<strong>${params.recipientName}</strong> 様</p>
          <p style="font-size:14px;color:#6b7280;margin:0 0 24px;"><strong>${params.senderName}</strong> さんからチケットが届いています。</p>
          ${alertBox("🎁", `${params.senderName}さんからチケットが届きました`, `「${params.eventTitle}」のチケットを受け取るには、下のボタンをクリックしてください。`, "#f0fdf4", "#10b981")}
        </td>
      </tr>
      <tr>
        <td style="padding:0 40px 24px;">
          <h2 style="font-size:15px;font-weight:700;color:#111827;margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid #e5e7eb;">🎫 チケット情報</h2>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${infoRow("イベント名", params.eventTitle)}
            ${infoRow("開催日時", params.eventDatetime)}
            ${infoRow("チケット種別", params.ticketType)}
            ${infoRow("送り主", params.senderName)}
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:0 40px 16px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;">
            <tr>
              <td style="padding:16px 20px;">
                <p style="margin:0;font-size:14px;color:#1d4ed8;font-weight:700;">ℹ️ チケット受け取りについて</p>
                <p style="margin:4px 0 0;font-size:13px;color:#1e40af;">受け取りリンクには有効期限があります。お早めにお手続きください。LINKUPアカウントをお持ちでない場合は、新規登録後に受け取ることができます。</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 40px 32px;text-align:center;">
          ${ctaButton("チケットを受け取る", params.acceptUrl)}
          <p style="color:#9ca3af;font-size:12px;margin:16px 0 0;">このメールに心当たりがない場合は無視してください。</p>
        </td>
      </tr>`;

    const html = emailWrapper(content);
    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [params.to],
      replyTo: REPLY_TO,
      subject: `【LINK-UP】${params.senderName}さんからチケットが届きました`,
      html,
    });
    if (result.error) return { success: false, error: result.error.message };
    return { success: true };
  } catch (err) { return { success: false, error: String(err) }; }
}

// ============================================================
// 5. イベントリマインダーメール
// ============================================================
export async function sendReminderEmail(params: {
  to: string;
  recipientName: string;
  eventTitle: string;
  eventDatetime: string;
  eventLocation: string;
  isOnline?: boolean;
  onlineUrl?: string;
  resendApiKey?: string;
}): Promise<EmailResult> {
  try {
    const apiKey = params.resendApiKey;
    if (!apiKey) return { success: false, error: "RESEND_API_KEY not set" };
    const resend = getResend(apiKey);
    const locationLabel = params.isOnline ? "オンライン開催" : params.eventLocation;

    const onlineSection = params.isOnline && params.onlineUrl
      ? `<tr>
          <td style="padding:0 40px 16px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0;font-size:14px;color:#166534;font-weight:700;">💻 オンライン参加リンク</p>
                  <p style="margin:8px 0 0;"><a href="${params.onlineUrl}" style="color:${BRAND_COLOR};font-size:13px;word-break:break-all;">${params.onlineUrl}</a></p>
                </td>
              </tr>
            </table>
          </td>
        </tr>`
      : "";

    const content = `
      <tr>
        <td style="padding:32px 40px 0;">
          <p style="font-size:16px;color:#374151;margin:0 0 8px;">こんにちは、<strong>${params.recipientName}</strong> 様</p>
          <p style="font-size:14px;color:#6b7280;margin:0 0 24px;">明日のイベント開催をお知らせします。お忘れなくご参加ください！</p>
          ${alertBox("⏰", "明日開催！準備はよろしいですか？", `「${params.eventTitle}」は明日開催です。当日は入場QRコードをご用意ください。`, "#fefce8", "#eab308")}
        </td>
      </tr>
      <tr>
        <td style="padding:0 40px 24px;">
          <h2 style="font-size:15px;font-weight:700;color:#111827;margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid #e5e7eb;">📅 イベント詳細</h2>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${infoRow("イベント名", params.eventTitle)}
            ${infoRow("開催日時", params.eventDatetime)}
            ${infoRow("会場", locationLabel)}
          </table>
        </td>
      </tr>
      ${onlineSection}
      <tr>
        <td style="padding:0 40px 16px;">
          <h2 style="font-size:15px;font-weight:700;color:#111827;margin:0 0 12px;">✅ 当日の持ち物チェック</h2>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;padding:4px 0;">
            <tr><td style="padding:8px 20px;font-size:14px;color:#374151;">☑ スマートフォン（入場QRコード表示用）</td></tr>
            <tr><td style="padding:8px 20px;font-size:14px;color:#374151;">☑ 本人確認書類（必要な場合）</td></tr>
            ${!params.isOnline ? `<tr><td style="padding:8px 20px;font-size:14px;color:#374151;">☑ 会場への交通手段の確認</td></tr>` : ""}
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 40px 32px;text-align:center;">
          ${ctaButton("マイチケットを確認する", "https://link-up.live/mypage/tickets")}
          <p style="color:#9ca3af;font-size:12px;margin:16px 0 0;">ご不明な点は主催者またはサポートまでお問い合わせください。</p>
        </td>
      </tr>`;

    const html = emailWrapper(content);
    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [params.to],
      replyTo: REPLY_TO,
      subject: `【LINK-UP】明日開催！${params.eventTitle}`,
      html,
    });
    if (result.error) return { success: false, error: result.error.message };
    return { success: true };
  } catch (err) { return { success: false, error: String(err) }; }
}

// ============================================================
// 6. 主催者からのお知らせメール
// ============================================================
export async function sendAnnouncementEmail(params: {
  to: string;
  recipientName: string;
  eventTitle: string;
  organizerName: string;
  subject: string;
  message: string;
  resendApiKey?: string;
}): Promise<EmailResult> {
  try {
    const apiKey = params.resendApiKey;
    if (!apiKey) return { success: false, error: "RESEND_API_KEY not set" };
    const resend = getResend(apiKey);
    // 改行をHTMLの<br>に変換
    const messageHtml = params.message.replace(/\n/g, "<br>");

    const content = `
      <tr>
        <td style="padding:32px 40px 0;">
          <p style="font-size:16px;color:#374151;margin:0 0 8px;">こんにちは、<strong>${params.recipientName}</strong> 様</p>
          <p style="font-size:14px;color:#6b7280;margin:0 0 24px;">「${params.eventTitle}」の主催者からお知らせが届いています。</p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 40px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background:${BRAND_GRADIENT};padding:16px 24px;">
                <p style="margin:0;color:#ffffff;font-size:13px;font-weight:600;">📢 主催者からのメッセージ</p>
                <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:12px;">${params.organizerName} より</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <h2 style="font-size:18px;font-weight:700;color:#111827;margin:0 0 16px;">${params.subject}</h2>
                <div style="font-size:14px;color:#374151;line-height:1.8;">${messageHtml}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:0 40px 24px;">
          <h2 style="font-size:15px;font-weight:700;color:#111827;margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid #e5e7eb;">📋 イベント情報</h2>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${infoRow("イベント名", params.eventTitle)}
            ${infoRow("主催者", params.organizerName)}
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:0 40px 32px;text-align:center;">
          ${ctaButton("イベントページを確認する", "https://link-up.live/events")}
          <p style="color:#9ca3af;font-size:12px;margin:16px 0 0;">このメールは参加登録済みの方にのみ送信されています。</p>
        </td>
      </tr>`;

    const html = emailWrapper(content);
    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [params.to],
      replyTo: REPLY_TO,
      subject: `【LINK-UP】${params.organizerName}より: ${params.subject}`,
      html,
    });
    if (result.error) return { success: false, error: result.error.message };
    return { success: true };
  } catch (err) { return { success: false, error: String(err) }; }
}

// ============================================================
// 7. イベント変更通知メール
// ============================================================
export async function sendEventChangeNotificationEmail(params: {
  to: string;
  recipientName: string;
  eventTitle: string;
  changeDetails?: string;
  changes?: string;
  eventUrl?: string;
  resendApiKey?: string;
}): Promise<EmailResult> {
  try {
    const apiKey = params.resendApiKey;
    if (!apiKey) return { success: false, error: "RESEND_API_KEY not set" };
    const resend = getResend(apiKey);
    const detail = params.changeDetails ?? params.changes ?? "詳細は主催者にお問い合わせください。";
    const detailHtml = detail.replace(/\n/g, "<br>");
    const eventUrl = params.eventUrl ?? "https://link-up.live/events";

    const content = `
      <tr>
        <td style="padding:32px 40px 0;">
          <p style="font-size:16px;color:#374151;margin:0 0 8px;">こんにちは、<strong>${params.recipientName}</strong> 様</p>
          <p style="font-size:14px;color:#6b7280;margin:0 0 24px;">参加予定のイベントに変更がありましたのでお知らせします。</p>
          ${alertBox("⚠️", "イベント情報に変更があります", `「${params.eventTitle}」の情報が更新されました。最新情報をご確認ください。`, "#fff7ed", "#f97316")}
        </td>
      </tr>
      <tr>
        <td style="padding:0 40px 24px;">
          <h2 style="font-size:15px;font-weight:700;color:#111827;margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid #e5e7eb;">📋 変更内容</h2>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${infoRow("イベント名", params.eventTitle)}
          </table>
          <div style="margin-top:16px;padding:16px 20px;background:#f9fafb;border-radius:8px;font-size:14px;color:#374151;line-height:1.8;">${detailHtml}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:0 40px 16px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;">
            <tr>
              <td style="padding:16px 20px;">
                <p style="margin:0;font-size:14px;color:#1d4ed8;font-weight:700;">ℹ️ ご注意</p>
                <p style="margin:4px 0 0;font-size:13px;color:#1e40af;">変更内容によってはチケットの払い戻しが可能な場合があります。詳細はイベントページまたは主催者にお問い合わせください。</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 40px 32px;text-align:center;">
          ${ctaButton("イベントページで最新情報を確認する", eventUrl)}
          <p style="color:#9ca3af;font-size:12px;margin:16px 0 0;">ご不明な点は <a href="mailto:support@link-up.live" style="color:${BRAND_COLOR};">support@link-up.live</a> までお問い合わせください。</p>
        </td>
      </tr>`;

    const html = emailWrapper(content);
    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [params.to],
      replyTo: REPLY_TO,
      subject: `【LINK-UP】イベント変更のお知らせ - ${params.eventTitle}`,
      html,
    });
    if (result.error) return { success: false, error: result.error.message };
    return { success: true };
  } catch (err) { return { success: false, error: String(err) }; }
}
