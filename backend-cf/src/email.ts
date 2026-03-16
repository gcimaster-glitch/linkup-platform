// Cloudflare Workers用 メール送信スタブ
// TODO: Resend APIを使ったメール送信を実装

export interface EmailResult {
  success: boolean;
  error?: string;
}

export async function sendTicketConfirmationEmail(..._args: unknown[]): Promise<EmailResult> {
  console.log("[Email] sendTicketConfirmationEmail called");
  return { success: true };
}

export async function sendTicketPurchaseEmail(..._args: unknown[]): Promise<EmailResult> {
  console.log("[Email] sendTicketPurchaseEmail called");
  return { success: true };
}

export async function sendEventChangeNotificationEmail(..._args: unknown[]): Promise<EmailResult> {
  console.log("[Email] sendEventChangeNotificationEmail called");
  return { success: true };
}

export async function sendOrderCancelEmail(..._args: unknown[]): Promise<EmailResult> {
  console.log("[Email] sendOrderCancelEmail called");
  return { success: true };
}

export async function sendWaitlistNotificationEmail(..._args: unknown[]): Promise<EmailResult> {
  console.log("[Email] sendWaitlistNotificationEmail called");
  return { success: true };
}

export async function sendTransferEmail(..._args: unknown[]): Promise<EmailResult> {
  console.log("[Email] sendTransferEmail called");
  return { success: true };
}

export async function sendReminderEmail(..._args: unknown[]): Promise<EmailResult> {
  console.log("[Email] sendReminderEmail called");
  return { success: true };
}

export async function sendAnnouncementEmail(..._args: unknown[]): Promise<EmailResult> {
  console.log("[Email] sendAnnouncementEmail called");
  return { success: true };
}
