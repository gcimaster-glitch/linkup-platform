# Event Ticket Platform - デプロイ手順

## 🚀 初回セットアップ

### 1. Cloudflareアカウント準備

```bash
# Wrangler CLIインストール
npm install -g wrangler

# Cloudflareにログイン
wrangler login
```

### 2. D1データベース作成

```bash
# データベース作成
wrangler d1 create event-ticket-db

# 出力されたdatabase_idをwrangler.tomlに設定
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# スキーマ適用
wrangler d1 execute event-ticket-db --file=database/schema.sql --remote
```

### 3. R2バケット作成

```bash
# R2バケット作成
wrangler r2 bucket create event-images

# CORS設定
wrangler r2 bucket cors put event-images --cors-config='{
  "AllowedOrigins": ["https://yourdomain.com"],
  "AllowedMethods": ["GET", "PUT", "POST"],
  "AllowedHeaders": ["*"]
}'
```

### 4. KVネームスペース作成

```bash
# KV作成(セッション・キャッシュ用)
wrangler kv:namespace create "EVENT_TICKET_KV"

# 出力されたidをwrangler.tomlに設定
```

### 5. Secretsの設定

```bash
cd backend

# Stripe
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET

# Gemini AI
wrangler secret put GEMINI_API_KEY

# NTT認証
wrangler secret put NTT_API_KEY
wrangler secret put NTT_API_SECRET
```

## 📦 バックエンドデプロイ

```bash
cd backend

# 依存関係インストール
npm install

# ローカルテスト
npm run dev

# 本番デプロイ
npm run deploy
```

## 🌐 フロントエンドデプロイ

### Cloudflare Pages連携

1. Cloudflare Dashboardで「Pages」を開く
2. 「Create a project」→「Connect to Git」
3. GitHubリポジトリを選択
4. ビルド設定:
   ```
   Build command: npm run build
   Build output directory: out
   Root directory: frontend
   ```
5. 環境変数を設定:
   ```
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```
6. 「Save and Deploy」

### 手動デプロイ

```bash
cd frontend

# 依存関係インストール
npm install

# ビルド
npm run build

# Cloudflare Pagesへデプロイ
npx wrangler pages deploy out --project-name=event-ticket-platform
```

## 🔗 カスタムドメイン設定

### 1. Cloudflare Workers (API)

```bash
# ルート追加
wrangler routes add api.yourdomain.com/* event-ticket-backend
```

### 2. Cloudflare Pages (フロントエンド)

1. Pages Dashboard → プロジェクト選択
2. 「Custom domains」→「Set up a custom domain」
3. ドメイン入力: `yourdomain.com`
4. DNS設定:
   ```
   Type: CNAME
   Name: @
   Content: event-ticket-platform.pages.dev
   ```

## 🗄️ データベースマイグレーション

```bash
# 新しいマイグレーション作成
cd database/migrations
touch 001_add_new_feature.sql

# マイグレーション実行
wrangler d1 execute event-ticket-db --file=database/migrations/001_add_new_feature.sql --remote
```

## 🔄 GitHub Actions自動デプロイ

### シークレット設定

GitHubリポジトリ Settings → Secrets and variables → Actions で以下を設定:

```
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_ACCOUNT_ID=your_account_id
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
GEMINI_API_KEY=your_gemini_key
NTT_API_KEY=your_ntt_key
NTT_API_SECRET=your_ntt_secret
```

### デプロイフロー

1. コードをpush
2. GitHub Actionsが自動実行
3. フロントエンド・バックエンドが自動デプロイ
4. デプロイ完了通知

## 🧪 ローカル開発環境

### バックエンド

```bash
cd backend
npm run dev
# → http://localhost:8787
```

### フロントエンド

```bash
cd frontend
npm run dev
# → http://localhost:3000
```

### データベース(ローカル)

```bash
# ローカルD1データベース使用
wrangler d1 execute event-ticket-db --file=database/schema.sql --local

# ローカルで動作確認
cd backend
npm run dev
```

## 📊 モニタリング

### Cloudflare Dashboard

- Workers: リクエスト数、エラー率、レスポンスタイム
- Pages: ビルド履歴、デプロイ状況
- D1: クエリ実行回数、ストレージ使用量
- R2: ストレージ使用量、リクエスト数

### ログ確認

```bash
# Workersログ
wrangler tail

# リアルタイムログ
wrangler tail --format pretty
```

## 🔒 セキュリティチェックリスト

- [ ] 全てのSecretが正しく設定されている
- [ ] CORS設定が適切
- [ ] JWT_SECRETが強固なランダム文字列
- [ ] Stripe本番キーに切り替え
- [ ] D1データベースのバックアップ設定
- [ ] R2のアクセス権限確認
- [ ] 環境変数のハードコード確認

## 🆘 トラブルシューティング

### デプロイエラー

```bash
# Wranglerバージョン確認
wrangler --version

# キャッシュクリア
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### データベース接続エラー

```bash
# D1バインディング確認
wrangler d1 list

# データベースID確認
cat backend/wrangler.toml | grep database_id
```

### 環境変数が反映されない

```bash
# Secrets確認
wrangler secret list

# 環境変数再設定
wrangler secret put VARIABLE_NAME
```

## 📚 参考資料

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [Stripe Integration Guide](https://stripe.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
