import { ENV } from "../_core/env";
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { notifyOwner } from "../_core/notification";

function buildAutoReplyHtml(name: string, subjectLabel: string, email: string, message: string): string {
  return [
    "<!DOCTYPE html>",
    '<html lang="ja">',
    "<head><meta charset=\"UTF-8\"></head>",
    "<body style=\"font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;\">",
    "  <div style=\"background: #000; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;\">",
    "    <h1 style=\"color: #fff; margin: 0; font-size: 24px;\">LINK-UP</h1>",
    "  </div>",
    "  <div style=\"background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;\">",
    "    <p>" + name + " 様</p>",
    "    <p>この度はLINK-UPへお問い合わせいただき、誠にありがとうございます。</p>",
    "    <p>以下の内容でお問い合わせを受け付けました。担当者より順次ご連絡いたします。</p>",
    "    <div style=\"background: #fff; border: 1px solid #e0e0e0; border-radius: 6px; padding: 20px; margin: 20px 0;\">",
    "      <table style=\"width: 100%; border-collapse: collapse; font-size: 14px;\">",
    "        <tr><td style=\"padding: 8px 0; color: #666; width: 140px;\">お問い合わせ種別</td><td style=\"padding: 8px 0;\">" + subjectLabel + "</td></tr>",
    "        <tr><td style=\"padding: 8px 0; color: #666;\">お名前</td><td style=\"padding: 8px 0;\">" + name + "</td></tr>",
    "        <tr><td style=\"padding: 8px 0; color: #666;\">メールアドレス</td><td style=\"padding: 8px 0;\">" + email + "</td></tr>",
    "        <tr><td style=\"padding: 8px 0; color: #666; vertical-align: top;\">お問い合わせ内容</td><td style=\"padding: 8px 0; white-space: pre-wrap;\">" + message.replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</td></tr>",
    "      </table>",
    "    </div>",
    "    <p style=\"font-size: 13px; color: #666;\">",
    "      ※ このメールは自動送信です。このメールに返信しないでください。<br>",
    "      ※ お問い合わせへの回答は、通常2〜3営業日以内にご連絡いたします。",
    "    </p>",
    "    <hr style=\"border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;\">",
    "    <p style=\"font-size: 12px; color: #999; text-align: center;\">",
    "      株式会社 国際資源 / LINK-UP<br>",
    "      〒105-0023 東京都港区芝浦1-13-10 第3東運ビル<br>",
    "      Email: linkup@inre.co.jp",
    "    </p>",
    "  </div>",
    "</body>",
    "</html>",
  ].join("\n");
}

export const contactRouter = router({
  submit: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "お名前を入力してください").max(100),
        email: z.string().email("有効なメールアドレスを入力してください"),
        subject: z.enum([
          "ticket_purchase",
          "event_inquiry",
          "organizer_inquiry",
          "account",
          "payment",
          "other",
        ]),
        message: z.string().min(10, "お問い合わせ内容は10文字以上で入力してください").max(2000),
      })
    )
    .mutation(async ({ input }) => {
      const subjectLabels: Record<string, string> = {
        ticket_purchase: "チケット購入について",
        event_inquiry: "イベントについて",
        organizer_inquiry: "主催者登録・出店について",
        account: "アカウントについて",
        payment: "決済・支払いについて",
        other: "その他",
      };

      const subjectLabel = subjectLabels[input.subject] || input.subject;

      // オーナーへ通知
      await notifyOwner({
        title: `【お問い合わせ】${subjectLabel} - ${input.name}`,
        content: [
          `**お問い合わせ種別:** ${subjectLabel}`,
          `**お名前:** ${input.name}`,
          `**メールアドレス:** ${input.email}`,
          `**内容:**`,
          input.message,
        ].join("\n"),
      });

      // 自動返信メール送信（Resend）
      try {
        const resendApiKey = ENV.resendApiKey;
        if (resendApiKey) {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "LINK-UP <noreply@link-up.live>",
              to: [input.email],
              subject: "【LINK-UP】お問い合わせを受け付けました",
              html: buildAutoReplyHtml(input.name, subjectLabel, input.email, input.message),
            }),
          });
        }
      } catch (e) {
        // メール送信失敗は無視（オーナー通知は届いている）
        console.error("[Contact] Auto-reply email failed:", e);
      }

      return { success: true };
    }),
});
