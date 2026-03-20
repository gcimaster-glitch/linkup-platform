// Cloudflare Workers用 Resend メール送信実装
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
    const resend = getResend(apiKey);
    const amountStr = params.totalAmount === 0 ? "無料" : "¥" + params.totalAmount.toLocaleString("ja-JP");
    const html = "<html><body>" + params.recipientName + " 様、" + params.eventTitle + "のチケット購入ありがとうございます。注文ID: " + params.orderId + " 金額: " + amountStr + "</body></html>";
    const result = await resend.emails.send({ from: FROM_ADDRESS, to: [params.to], replyTo: REPLY_TO, subject: "【LINK-UP】チケット購入確認 - " + params.eventTitle, html });
    if (result.error) return { success: false, error: result.error.message };
    return { success: true };
  } catch (err) { return { success: false, error: String(err) }; }
}

export const sendTicketPurchaseEmail = sendTicketConfirmationEmail;

export async function sendOrderCancelEmail(params: { to: string; recipientName: string; eventTitle: string; orderId: string; refundAmount?: number; resendApiKey?: string; }): Promise<EmailResult> {
  try {
    const apiKey = params.resendApiKey;
    const resend = getResend(apiKey);
    const html = "<html><body>" + params.recipientName + " 様、注文ID: " + params.orderId + " のキャンセルが完了しました。</body></html>";
    const result = await resend.emails.send({ from: FROM_ADDRESS, to: [params.to], replyTo: REPLY_TO, subject: "【LINK-UP】注文キャンセル完了 - " + params.eventTitle, html });
    if (result.error) return { success: false, error: result.error.message };
    return { success: true };
  } catch (err) { return { success: false, error: String(err) }; }
}

export async function sendWaitlistNotificationEmail(params: { to: string; recipientName: string; eventTitle: string; eventDatetime: string; ticketType: string; reservationDeadline: string; purchaseUrl: string; resendApiKey?: string; }): Promise<EmailResult> {
  try {
    const apiKey = params.resendApiKey;
    const resend = getResend(apiKey);
    const html = "<html><body>" + params.recipientName + " 様、" + params.eventTitle + "に空席が出ました。購入期限: " + params.reservationDeadline + "</body></html>";
    const result = await resend.emails.send({ from: FROM_ADDRESS, to: [params.to], replyTo: REPLY_TO, subject: "【LINK-UP】空席のお知らせ - " + params.eventTitle, html });
    if (result.error) return { success: false, error: result.error.message };
    return { success: true };
  } catch (err) { return { success: false, error: String(err) }; }
}

export async function sendTransferEmail(params: { to: string; recipientName: string; senderName: string; eventTitle: string; eventDatetime: string; ticketType: string; acceptUrl: string; resendApiKey?: string; }): Promise<EmailResult> {
  try {
    const apiKey = params.resendApiKey;
    const resend = getResend(apiKey);
    const html = "<html><body>" + params.recipientName + " 様、" + params.senderName + "さんからチケットが届きました。</body></html>";
    const result = await resend.emails.send({ from: FROM_ADDRESS, to: [params.to], replyTo: REPLY_TO, subject: "【LINK-UP】" + params.senderName + "さんからチケットが届きました", html });
    if (result.error) return { success: false, error: result.error.message };
    return { success: true };
  } catch (err) { return { success: false, error: String(err) }; }
}

export async function sendReminderEmail(params: { to: string; recipientName: string; eventTitle: string; eventDatetime: string; eventLocation: string; isOnline?: boolean; onlineUrl?: string; resendApiKey?: string; }): Promise<EmailResult> {
  try {
    const apiKey = params.resendApiKey;
    const resend = getResend(apiKey);
    const html = "<html><body>" + params.recipientName + " 様、明日開催: " + params.eventTitle + " " + params.eventDatetime + "</body></html>";
    const result = await resend.emails.send({ from: FROM_ADDRESS, to: [params.to], replyTo: REPLY_TO, subject: "【LINK-UP】明日開催！" + params.eventTitle, html });
    if (result.error) return { success: false, error: result.error.message };
    return { success: true };
  } catch (err) { return { success: false, error: String(err) }; }
}

export async function sendAnnouncementEmail(params: { to: string; recipientName: string; eventTitle: string; organizerName: string; subject: string; message: string; resendApiKey?: string; }): Promise<EmailResult> {
  try {
    const apiKey = params.resendApiKey;
    const resend = getResend(apiKey);
    const html = "<html><body>" + params.recipientName + " 様、" + params.organizerName + "より: " + params.subject + "<br>" + params.message + "</body></html>";
    const result = await resend.emails.send({ from: FROM_ADDRESS, to: [params.to], replyTo: REPLY_TO, subject: "【LINK-UP】" + params.organizerName + "より: " + params.subject, html });
    if (result.error) return { success: false, error: result.error.message };
    return { success: true };
  } catch (err) { return { success: false, error: String(err) }; }
}

export async function sendEventChangeNotificationEmail(params: { to: string; recipientName: string; eventTitle: string; changeDetails?: string; changes?: string; eventUrl?: string; resendApiKey?: string; }): Promise<EmailResult> {
  try {
    const apiKey = params.resendApiKey;
    const resend = getResend(apiKey);
    const detail = params.changeDetails ?? params.changes ?? ""; const html = "<html><body>" + params.recipientName + " 様、" + params.eventTitle + "に変更があります。" + detail + (params.eventUrl ? " <a href='" + params.eventUrl + "'>詳細を確認する</a>" : "") + "</body></html>";
    const result = await resend.emails.send({ from: FROM_ADDRESS, to: [params.to], replyTo: REPLY_TO, subject: "【LINK-UP】イベント変更のお知らせ - " + params.eventTitle, html });
    if (result.error) return { success: false, error: result.error.message };
    return { success: true };
  } catch (err) { return { success: false, error: String(err) }; }
}
