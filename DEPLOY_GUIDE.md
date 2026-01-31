# 🚀 LinkUp デプロイガイド

## プロジェクト情報
- **プロジェクト名**: linkup-platform
- **ドメイン**: linkup-demo.pages.dev
- **GitHub**: linkup-platform

---

## 📋 デプロイ手順

### ステップ1: Cloudflare D1データベース作成

```bash
# Wranglerがインストールされているか確認
wrangler --version

# なければインストール
npm install -g wrangler

# Cloudflareにログイン
wrangler login

# D1データベース作成
wrangler d1 create linkup-db
```

**重要:** 出力される `database_id` をコピーしてください。

例:
```
✅ Successfully created DB 'linkup-db'!
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

次に、`backend/wrangler.toml` を開いて、`YOUR_D1_DATABASE_ID` を実際のIDに置き換えてください。

---

### ステップ2: データベーススキーマ適用

```bash
# プロジェクトディレクトリに移動
cd /path/to/linkup

# スキーマをリモートDBに適用
wrangler d1 execute linkup-db --file=database/schema.sql --remote
```

確認:
```bash
# テーブル作成確認
wrangler d1 execute linkup-db --command="SELECT name FROM sqlite_master WHERE type='table';" --remote
```

---

### ステップ3: R2バケット作成

```bash
# R2バケット作成
wrangler r2 bucket create linkup-storage

# 確認
wrangler r2 bucket list
```

---

### ステップ4: KVネームスペース作成

```bash
# KV作成
wrangler kv:namespace create LINKUP_KV
```

出力される `id` を `backend/wrangler.toml` の `YOUR_KV_NAMESPACE_ID` に設定してください。

---

### ステップ5: Secrets設定

```bash
cd backend

# JWT Secret (32文字以上のランダム文字列)
wrangler secret put JWT_SECRET
# 入力例: openssl rand -base64 32 で生成した値

# Stripe Secret Key (テストモード)
wrangler secret put STRIPE_SECRET_KEY
# 入力: sk_test_xxxxxx

# Stripe Publishable Key は環境変数として設定
# (後でGitHub Secretsに追加)

# Gemini API Key (オプション)
wrangler secret put GEMINI_API_KEY
# 入力: your_gemini_api_key
```

---

### ステップ6: バックエンドデプロイ

```bash
cd backend

# 依存関係インストール
npm install

# デプロイ
npm run deploy
```

成功すると、Worker URLが表示されます:
```
Published linkup-backend
  https://linkup-backend.YOUR_SUBDOMAIN.workers.dev
```

このURLをメモしてください（フロントエンドで使用）。

---

### ステップ7: GitHubリポジトリ作成

1. https://github.com/new にアクセス
2. リポジトリ名: `linkup-platform`
3. Description: `LinkUp - 人と機会を繋げる`
4. Private推奨
5. Create repository

```bash
# ローカルでGit初期化
cd /path/to/linkup
git init
git add .
git commit -m "Initial commit: LinkUp - 人と機会を繋げる"

# リモート追加
git remote add origin https://github.com/YOUR_USERNAME/linkup-platform.git

# プッシュ
git branch -M main
git push -u origin main
```

---

### ステップ8: Cloudflare Pages設定

#### 方法1: Dashboard経由（推奨）

1. https://dash.cloudflare.com/ にアクセス
2. **Pages** → **Create a project**
3. **Connect to Git** → GitHubを選択
4. `linkup-platform` リポジトリを選択
5. ビルド設定:
   ```
   Project name: linkup-demo
   Production branch: main
   Build command: npm run build
   Build output directory: out
   Root directory: frontend
   ```

6. 環境変数設定:
   ```
   NEXT_PUBLIC_API_URL=https://linkup-backend.YOUR_SUBDOMAIN.workers.dev
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
   ```

7. **Save and Deploy**

#### 方法2: Wrangler経由

```bash
cd frontend

# ビルド
npm install
npm run build

# デプロイ
npx wrangler pages deploy out --project-name=linkup-demo
```

---

### ステップ9: GitHub Secrets設定（CI/CD用）

GitHubリポジトリ → Settings → Secrets and variables → Actions

以下を追加:
```
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_ACCOUNT_ID=your_account_id
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
GEMINI_API_KEY=your_gemini_key
API_URL=https://linkup-backend.YOUR_SUBDOMAIN.workers.dev
```

**Cloudflare API Token取得方法:**
1. Cloudflare Dashboard → My Profile → API Tokens
2. Create Token → Edit Cloudflare Workers テンプレート
3. トークンをコピー

---

### ステップ10: カスタムドメイン設定（オプション）

#### Cloudflare Pagesでドメイン追加

1. Pages → linkup-demo → Custom domains
2. Set up a custom domain
3. ドメイン入力: `linkup.yourdomain.com`
4. CNAMEレコードが自動追加されます

#### Workers (API) にドメイン追加

```bash
wrangler routes add api.yourdomain.com/* linkup-backend
```

または Dashboard:
1. Workers & Pages → linkup-backend
2. Settings → Triggers → Custom Domains
3. Add Custom Domain: `api.yourdomain.com`

---

## ✅ デプロイ確認

### バックエンドAPI確認

```bash
curl https://linkup-backend.YOUR_SUBDOMAIN.workers.dev/health
```

期待される応答:
```json
{"status":"healthy","timestamp":"2026-01-31T..."}
```

### フロントエンド確認

ブラウザで開く:
```
https://linkup-demo.pages.dev
```

---

## 🎯 次のステップ

1. **Stripe Webhook設定**
   - Stripe Dashboard → Developers → Webhooks
   - エンドポイント追加: `https://linkup-backend.YOUR_SUBDOMAIN.workers.dev/webhooks/stripe`
   - イベント選択: `payment_intent.*`, `customer.*`

2. **メール送信設定**
   - SendGrid または Resend アカウント作成
   - API Key取得
   - `wrangler secret put SENDGRID_API_KEY`

3. **テストデータ投入**
   ```bash
   # テストユーザー作成
   curl -X POST https://linkup-backend.YOUR_SUBDOMAIN.workers.dev/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","role":"organizer"}'
   ```

---

## 🐛 トラブルシューティング

### エラー: "Database not found"
```bash
# database_idを確認
wrangler d1 list

# wrangler.tomlと一致するか確認
cat backend/wrangler.toml | grep database_id
```

### エラー: "Authentication failed"
```bash
# 再ログイン
wrangler logout
wrangler login
```

### ビルドエラー
```bash
# 依存関係再インストール
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📞 サポート

問題が発生した場合:
1. このガイドのトラブルシューティングを確認
2. `wrangler tail linkup-backend` でログ確認
3. GitHub Actionsのログを確認

---

**🎉 デプロイ完了後、https://linkup-demo.pages.dev にアクセスして確認してください！**
