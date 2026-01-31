# 🚀 セットアップガイド - GitHub連携 + Cloudflare自動デプロイ

## 📋 前提条件

- Node.js 18以上
- GitHubアカウント
- Cloudflareアカウント
- Stripeアカウント
- Google Cloud(Gemini API用)
- NTT認証サービスアカウント

---

## 🔧 Step 1: GitHubリポジトリ作成

### 1-1. リポジトリ作成

```bash
# GitHubで新しいリポジトリを作成
# リポジトリ名: event-ticket-platform
# 可視性: Private推奨
```

### 1-2. ローカルプロジェクトの初期化

```bash
# プロジェクトディレクトリに移動
cd /path/to/event-ticket-platform

# Gitリポジトリ初期化
git init

# リモートリポジトリ追加
git remote add origin https://github.com/yourusername/event-ticket-platform.git

# 初回コミット
git add .
git commit -m "Initial commit: Event Ticket Platform setup"

# プッシュ
git branch -M main
git push -u origin main
```

---

## ☁️ Step 2: Cloudflare設定

### 2-1. Cloudflare Workers設定

```bash
# Wrangler CLIインストール
npm install -g wrangler

# Cloudflareログイン
wrangler login
```

### 2-2. D1データベース作成

```bash
# データベース作成
wrangler d1 create event-ticket-db

# 出力例:
# ✅ Successfully created DB 'event-ticket-db'!
# 
# [[d1_databases]]
# binding = "DB"
# database_name = "event-ticket-db"
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# ⬆️ このdatabase_idをコピーして backend/wrangler.toml に貼り付け
```

### 2-3. スキーマ適用

```bash
# リモートデータベースにスキーマ適用
wrangler d1 execute event-ticket-db --file=database/schema.sql --remote

# 確認
wrangler d1 execute event-ticket-db --command="SELECT name FROM sqlite_master WHERE type='table';" --remote
```

### 2-4. R2バケット作成

```bash
# R2バケット作成
wrangler r2 bucket create event-images

# CORS設定
cat > cors-config.json << 'EOF'
{
  "AllowedOrigins": ["*"],
  "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
  "AllowedHeaders": ["*"],
  "MaxAgeSeconds": 3600
}
EOF

wrangler r2 bucket cors put event-images --cors-config=cors-config.json
```

### 2-5. KVネームスペース作成

```bash
# KV作成
wrangler kv:namespace create "EVENT_TICKET_KV"

# 出力されたidを backend/wrangler.toml に貼り付け
```

### 2-6. Secrets設定

```bash
cd backend

# JWT Secret
wrangler secret put JWT_SECRET
# 入力: 強固なランダム文字列(32文字以上推奨)

# Stripe(テスト環境)
wrangler secret put STRIPE_SECRET_KEY
# 入力: sk_test_...

wrangler secret put STRIPE_WEBHOOK_SECRET
# 入力: whsec_...

# Gemini AI
wrangler secret put GEMINI_API_KEY
# 入力: your_gemini_api_key

# NTT認証
wrangler secret put NTT_API_KEY
# 入力: your_ntt_api_key

wrangler secret put NTT_API_SECRET
# 入力: your_ntt_api_secret
```

---

## 🔗 Step 3: GitHub ActionsでCI/CD設定

### 3-1. GitHubシークレット設定

1. GitHubリポジトリページを開く
2. `Settings` → `Secrets and variables` → `Actions`
3. `New repository secret` で以下を追加:

```
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_ACCOUNT_ID=your_account_id
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
GEMINI_API_KEY=your_gemini_key
NTT_API_KEY=your_ntt_key
NTT_API_SECRET=your_ntt_secret
API_URL=https://event-ticket-backend.your-subdomain.workers.dev
```

**Cloudflare API Tokenの取得方法:**
1. Cloudflare Dashboard → `My Profile` → `API Tokens`
2. `Create Token` → `Edit Cloudflare Workers` テンプレート選択
3. 権限を確認して `Continue to summary` → `Create Token`
4. トークンをコピー(一度しか表示されない!)

---

## 🚀 Step 4: デプロイ実行

### 4-1. バックエンドデプロイ

```bash
cd backend

# 依存関係インストール
npm install

# ローカルテスト
npm run dev
# → http://localhost:8787 でアクセス

# 本番デプロイ
npm run deploy

# デプロイ成功後、URLが表示される:
# Published event-ticket-backend
# https://event-ticket-backend.your-subdomain.workers.dev
```

### 4-2. フロントエンドデプロイ(Cloudflare Pages)

**方法1: Cloudflare Dashboard経由(推奨)**

1. Cloudflare Dashboard → `Pages` → `Create a project`
2. `Connect to Git` → GitHubリポジトリを選択
3. ビルド設定:
   ```
   Project name: event-ticket-platform
   Production branch: main
   Build command: npm run build
   Build output directory: out
   Root directory: frontend
   ```
4. 環境変数設定:
   ```
   NEXT_PUBLIC_API_URL=https://event-ticket-backend.your-subdomain.workers.dev
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
5. `Save and Deploy`

**方法2: Wrangler CLI経由**

```bash
cd frontend

# 依存関係インストール
npm install

# ビルド
npm run build

# デプロイ
npx wrangler pages deploy out --project-name=event-ticket-platform
```

---

## 🌐 Step 5: カスタムドメイン設定

### 5-1. Workers(バックエンド)

```bash
# カスタムドメインルート追加
wrangler routes add api.yourdomain.com/* event-ticket-backend

# または Cloudflare Dashboard:
# Workers & Pages → event-ticket-backend → Settings → Triggers → Custom Domains
```

### 5-2. Pages(フロントエンド)

1. Pages Dashboard → プロジェクト選択
2. `Custom domains` → `Set up a custom domain`
3. ドメイン入力: `yourdomain.com`
4. CNAMEレコードが自動追加される

---

## 🔄 Step 6: 自動デプロイの確認

### 6-1. コード変更をプッシュ

```bash
# フロントエンドを少し変更
echo "// Test comment" >> frontend/src/app/page.tsx

# コミット&プッシュ
git add .
git commit -m "Test: Auto deploy"
git push origin main
```

### 6-2. GitHub Actionsの確認

1. GitHubリポジトリ → `Actions` タブ
2. ワークフローの実行状況を確認
3. 成功すると自動的にCloudflareへデプロイ

---

## 🧪 Step 7: 動作確認

### 7-1. APIヘルスチェック

```bash
curl https://event-ticket-backend.your-subdomain.workers.dev/health

# 期待されるレスポンス:
# {"status":"healthy","timestamp":"2026-01-31T..."}
```

### 7-2. フロントエンドアクセス

```
https://event-ticket-platform.pages.dev
または
https://yourdomain.com
```

### 7-3. データベース確認

```bash
# テーブル一覧
wrangler d1 execute event-ticket-db --command="SELECT name FROM sqlite_master WHERE type='table';" --remote

# ユーザー数確認
wrangler d1 execute event-ticket-db --command="SELECT COUNT(*) as count FROM users;" --remote
```

---

## 📊 Step 8: モニタリング設定

### 8-1. Cloudflare Analytics

- Workers Dashboard → Analytics タブ
- リクエスト数、エラー率、レスポンスタイムを確認

### 8-2. ログ確認

```bash
# リアルタイムログ
wrangler tail event-ticket-backend --format pretty

# 特定の期間のログ
wrangler tail event-ticket-backend --since 1h
```

---

## 🔐 Step 9: セキュリティ確認

### チェックリスト

- [ ] `.env`ファイルが`.gitignore`に含まれている
- [ ] GitHub Secretsが正しく設定されている
- [ ] JWT_SECRETが強固(32文字以上のランダム文字列)
- [ ] Stripe本番キーは本番環境のみに設定
- [ ] CORS設定が適切(本番では特定ドメインのみ許可)
- [ ] D1データベースのバックアップ設定済み

---

## 🛠️ トラブルシューティング

### エラー: "Database not found"

```bash
# database_idを確認
wrangler d1 list

# wrangler.tomlのdatabase_idと一致するか確認
cat backend/wrangler.toml | grep database_id
```

### エラー: "Authentication failed"

```bash
# Cloudflare再ログイン
wrangler logout
wrangler login
```

### GitHub Actionsが失敗

1. Actions タブでログを確認
2. Secretsが正しく設定されているか確認
3. wrangler.tomlのバインディング設定を確認

### CORS エラー

```bash
# R2のCORS設定確認
wrangler r2 bucket cors get event-images

# 再設定
wrangler r2 bucket cors put event-images --cors-config=cors-config.json
```

---

## 📚 次のステップ

1. ✅ **Stripe Webhookの設定** → `docs/stripe-setup.md`
2. ✅ **メール通知の実装** → SendGrid/Resend統合
3. ✅ **QRコード生成の実装** → R2へのアップロード
4. ✅ **AIコンシェルジュの実装** → Gemini API統合
5. ✅ **本番環境への切り替え** → Stripe本番キー設定

---

## 🎉 完了!

これでGitHub連携 + Cloudflare自動デプロイ環境が整いました。
コードをpushするだけで自動的にデプロイされます!

何か問題があれば、`wrangler tail`でログを確認してください。
