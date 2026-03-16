// Cloudflare Workers用 通知スタブ
// TODO: Resend等のメール通知サービスに接続

export type NotificationPayload = {
  title: string;
  content: string;
};

export async function notifyOwner(payload: NotificationPayload): Promise<boolean> {
  console.log("[Notification] notifyOwner:", payload.title);
  // TODO: メール通知を実装
  return true;
}
