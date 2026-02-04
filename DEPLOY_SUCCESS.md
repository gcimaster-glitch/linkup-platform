# 🚀 LinkUp Deployment Success (Platinum Edition)

## 📌 現在のステータス
- **バージョン**: Platinum Edition v7.9.1
- **デプロイ完了日時**: 2026-02-02
- **URL**: https://link-up.live

## ✅ データベース連携 (D1 Integrated)
- **データベース名**: `linkup-db`
- **状態**: 完全稼働中 (テーブル作成・データ投入済)
- **認証**: バックエンドAPIはD1データベースを参照して認証を行います。

## 🔑 デモアカウント情報
以下の情報で本番環境にログイン可能です。

| アカウント | メールアドレス | パスワード | 権限 |
| :--- | :--- | :--- | :--- |
| **主催者 (Organizer)** | `organizer@demo.com` | `demo` | 主催者, KYC認証済 |
| **一般ユーザー (User)** | `user@demo.com` | `demo` | 一般権限, KYC認証済 |

## 🛠 技術仕様
- **Frontend**: Cloudflare Pages (React/Next.js derived Static HTML)
- **Backend**: Cloudflare Workers (Hono framework)
- **Database**: Cloudflare D1 (SQLite)
- **Email**: Resend API

## 🔄 トラブルシューティング
ログインに失敗する場合は、ブラウザのキャッシュをクリアするか、シークレットウィンドウでお試しください。
万が一「Server Error」が表示される場合は、データベース接続の一時的な問題の可能性があります。数分待って再試行してください。
