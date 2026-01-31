# 🚀 LinkUp デプロイ - 実行手順書

## プロジェクト情報
- **プロジェクト名**: linkup-platform  
- **ドメイン**: linkup-demo.pages.dev  
- **Cloudflare**: ログイン済み ✅

---

## 📦 ダウンロード

### [📥 デプロイ準備完了版をダウンロード (77KB)](computer:///mnt/user-data/outputs/linkup-deploy-ready.tar.gz)

このパッケージには以下が含まれています:
- ✅ quick-deploy.sh (自動デプロイスクリプト)
- ✅ DEPLOY_GUIDE.md (詳細手順書)
- ✅ 完全なソースコード

---

## 🎯 デプロイ方法（2つから選択）

### 方法A: 自動デプロイスクリプト（推奨）⚡

```bash
# 1. パッケージ解凍
tar -xzf linkup-deploy-ready.tar.gz
cd linkup

# 2. スクリプト実行
./quick-deploy.sh
```

スクリプトが対話形式で以下を実行します:
1. D1データベース作成
2. スキーマ適用
3. R2バケット作成
4. バックエンドデプロイ

### 方法B: 手動ステップバイステップ📝

詳細は `DEPLOY_GUIDE.md` を参照してください。

---

## ⚡ クイックスタート（最速5分）

### ステップ1: Wranglerログイン確認

```bash
wrangler whoami
```

ログインしていない場合:
```bash
wrangler login
```

### ステップ2: D1データベース作成

```bash
cd linkup
wrangler d1 create linkup-db
```

**重要:** 出力される `database_id` をコピー

```bash
# 例: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

`backend/wrangler.toml` を開いて:
```toml
database_id = "YOUR_D1_DATABASE_ID"
```
↓
```toml
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### ステップ3: スキーマ適用

```bash
wrangler d1 execute linkup-db --file=database/schema.sql --remote
```

成功メッセージが表示されればOK。

### ステップ4: R2バケット作成

```bash
wrangler r2 bucket create linkup-storage
```

### ステップ5: Secrets設定

```bash
cd backend

# JWT Secret (自動生成)
openssl rand -base64 32 | wrangler secret put JWT_SECRET
```

Stripeキーは後で設定可能（オプション）:
```bash
wrangler secret put STRIPE_SECRET_KEY
# 入力: sk_test_xxxxx
```

### ステップ6: バックエンドデプロイ

```bash
# 依存関係インストール
npm install

# デプロイ
npm run deploy
```

成功すると、Worker URLが表示されます:
```
✨ Published linkup-backend
  https://linkup-backend.YOUR_SUBDOMAIN.workers.dev
```

**このURLをメモしてください！**

### ステップ7: GitHubリポジトリ作成

1. https://github.com/new にアクセス
2. リポジトリ名: `linkup-platform`
3. Private推奨
4. Create repository

```bash
# ローカルで初期化
cd /path/to/linkup
git init
git add .
git commit -m "🔗 LinkUp - 人と機会を繋げる"

# リモート追加
git remote add origin https://github.com/YOUR_USERNAME/linkup-platform.git
git branch -M main
git push -u origin main
```

### ステップ8: Cloudflare Pages設定

#### オプション1: Dashboard（推奨）

1. https://dash.cloudflare.com → **Pages**
2. **Create a project** → **Connect to Git**
3. GitHubリポジトリ `linkup-platform` を選択
4. ビルド設定:

```
Project name: linkup-demo
Production branch: main
Build command: npm run build
Build output directory: out
Root directory: frontend
```

5. 環境変数:

```
NEXT_PUBLIC_API_URL=https://linkup-backend.YOUR_SUBDOMAIN.workers.dev
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx (後で設定可)
```

6. **Save and Deploy**

#### オプション2: Wrangler CLI

```bash
cd frontend
npm install
npm run build
npx wrangler pages deploy out --project-name=linkup-demo
```

---

## ✅ デプロイ確認

### バックエンド確認

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

**LinkUpのトップページが表示されればデプロイ成功！** 🎉

---

## 🎯 デプロイ後の設定

### 1. GitHub Actions設定（自動デプロイ用）

GitHub リポジトリ → Settings → Secrets and variables → Actions

追加するSecrets:
```
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_ACCOUNT_ID=your_account_id
```

**Cloudflare API Token取得:**
1. Cloudflare Dashboard → My Profile → API Tokens
2. Create Token → "Edit Cloudflare Workers" テンプレート
3. Continue to summary → Create Token
4. トークンをコピー（一度しか表示されません）

これで、GitHubにpushするたびに自動デプロイされます！

### 2. カスタムドメイン設定（オプション）

独自ドメインを使用する場合:

**フロントエンド:**
1. Pages → linkup-demo → Custom domains
2. Add custom domain: `linkup.yourdomain.com`
3. CNAMEレコードが自動追加

**バックエンド:**
```bash
wrangler routes add api.yourdomain.com/* linkup-backend
```

---

## 🐛 よくあるエラーと解決法

### エラー: "wrangler: command not found"

```bash
npm install -g wrangler
```

### エラー: "Authentication required"

```bash
wrangler login
```

### エラー: "Database not found"

`backend/wrangler.toml` の `database_id` が正しく設定されているか確認:
```bash
wrangler d1 list
```

### ビルドエラー

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📊 デプロイ状況チェックリスト

- [ ] Cloudflareにログイン
- [ ] D1データベース作成
- [ ] wrangler.toml にdatabase_id設定
- [ ] スキーマ適用
- [ ] R2バケット作成
- [ ] JWT_SECRET設定
- [ ] バックエンドデプロイ成功
- [ ] Worker URL確認
- [ ] GitHubリポジトリ作成
- [ ] コードプッシュ
- [ ] Cloudflare Pages設定
- [ ] フロントエンドデプロイ成功
- [ ] ブラウザで動作確認

---

## 🎉 次のステップ

デプロイ完了後:

1. **テストユーザー作成**
```bash
curl -X POST https://linkup-backend.YOUR_SUBDOMAIN.workers.dev/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "display_name": "テストユーザー",
    "role": "organizer"
  }'
```

2. **Stripe連携** (Phase 2)
   - Stripe Dashboard でWebhook設定
   - 決済機能実装

3. **QR入場管理テスト**
   - イベント作成
   - チケット生成
   - QRコード受付テスト

---

## 📞 サポート

問題が発生した場合:
1. `DEPLOY_GUIDE.md` の詳細手順を確認
2. `wrangler tail linkup-backend` でログ確認
3. Cloudflare Dashboard でエラーログ確認

---

**🔗 LinkUp - 人と機会を繋げる**

デプロイ成功を祈っています！ 🚀
