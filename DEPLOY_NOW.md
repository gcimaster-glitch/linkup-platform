# 🚀 LinkUp Deployment Guide (Platinum Edition)

## 📌 現在のステータス
- **バージョン**: Platinum Edition v7.9
- **デプロイ状況**: 準備完了 (Cloudflare API Token待ち)
- **最新プレビュー**: [Preview Link](https://3000-i1wckx5o5mxykkf07it7c-2e77fc33.sandbox.novita.ai)

## 🔑 デモアカウント情報 (DB登録済み)
以下の情報でログイン可能です。

| アカウント | メールアドレス | パスワード | 権限 |
| :--- | :--- | :--- | :--- |
| **主催者 (Organizer)** | `organizer@demo.com` | `demo` | 主催者, KYC認証済 |
| **一般ユーザー (User)** | `user@demo.com` | `demo` | 一般権限, KYC認証済 |

## 🛠 デプロイ手順

### 1. Cloudflare API Tokenの準備
デプロイには **Cloudflare API Token** が必要です。
※ `re_` で始まるトークンは Resend (メール送信) 用であり、デプロイには使用できません。

### 2. コマンド実行
```bash
export CLOUDFLARE_API_TOKEN=your_token_here
npm run deploy:all
```

## 🔄 更新内容
- **新規登録機能**: 実装完了 (DB連携)
- **認証フロー**: JWTベースのセッション管理
- **静的ページ**: 運営会社、利用規約等をフッターに連携
