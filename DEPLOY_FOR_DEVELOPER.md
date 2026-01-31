# 🔗 LinkUp - 完全自動デプロイガイド

## 📦 開発者向け：このパッケージについて

このパッケージをダウンロードしたら、以下の手順で自動デプロイできます。

---

## 🚀 クイックスタート（5分で完了）

### 前提条件
- Node.js 18以上
- Cloudflareアカウント（ログイン済み）
- GitHubアカウント

### ステップ1: ダウンロード・解凍

```bash
# ダウンロードしたファイルを解凍
tar -xzf linkup-final.tar.gz
cd linkup
```

### ステップ2: 自動デプロイ実行

```bash
# 実行権限付与
chmod +x auto-deploy.sh

# 自動デプロイ開始
./auto-deploy.sh
```

**このスクリプトが自動で行うこと：**
1. ✅ Cloudflare D1データベース作成
2. ✅ データベーススキーマ適用
3. ✅ R2バケット作成
4. ✅ KVネームスペース作成
5. ✅ Secrets設定（対話式）
6. ✅ バックエンドデプロイ
7. ✅ GitHubリポジトリ作成
8. ✅ コードpush
9. ✅ Cloudflare Pages自動連携

### ステップ3: 完了

デプロイ完了後、以下のURLでアクセス可能：
- **フロントエンド**: https://linkup-demo.pages.dev
- **バックエンドAPI**: https://linkup-backend.your-subdomain.workers.dev

---

## 🔧 詳細セットアップ（手動の場合）

自動スクリプトが使えない場合は、以下の手順を実行：

### 1. Wrangler CLIインストール

```bash
npm install -g wrangler

# Cloudflareログイン
wrangler login
```

### 2. データベース作成

```bash
# D1データベース作成
wrangler d1 create linkup-db

# 出力された database_id を backend/wrangler.toml に設定
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# スキーマ適用
wrangler d1 execute linkup-db --file=database/schema.sql --remote
```

### 3. R2・KV作成

```bash
# R2バケット
wrangler r2 bucket create linkup-storage

# KVネームスペース
wrangler kv:namespace create LINKUP_KV
# 出力されたidをwrangler.tomlに設定
```

### 4. Secrets設定

```bash
cd backend

# JWT Secret（自動生成）
openssl rand -base64 32 | wrangler secret put JWT_SECRET

# Stripe（テストキー）
wrangler secret put STRIPE_SECRET_KEY
# 入力: sk_test_...

wrangler secret put STRIPE_PUBLISHABLE_KEY
# 入力: pk_test_...

# Gemini API（オプション）
wrangler secret put GEMINI_API_KEY
# 入力: your_api_key
```

### 5. バックエンドデプロイ

```bash
cd backend
npm install
npm run deploy
```

### 6. GitHubリポジトリ作成

```bash
# GitHubで新規リポジトリ作成
# リポジトリ名: linkup-platform

cd ..
git init
git add .
git commit -m "Initial commit: LinkUp - 人と機会を繋げる"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/linkup-platform.git
git push -u origin main
```

### 7. Cloudflare Pages連携

1. Cloudflare Dashboard → Pages → Create a project
2. Connect to Git → GitHubリポジトリ選択
3. ビルド設定:
   ```
   Build command: npm run build
   Build output directory: out
   Root directory: frontend
   ```
4. 環境変数設定:
   ```
   NEXT_PUBLIC_API_URL=https://linkup-backend.YOUR_SUBDOMAIN.workers.dev
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
5. Save and Deploy

---

## 📊 デプロイ後の確認

### ヘルスチェック

```bash
# バックエンドAPI
curl https://linkup-backend.YOUR_SUBDOMAIN.workers.dev/health

# 期待されるレスポンス:
# {"status":"healthy","timestamp":"2026-01-31T..."}
```

### データベース確認

```bash
# テーブル一覧
wrangler d1 execute linkup-db --command="SELECT name FROM sqlite_master WHERE type='table';" --remote

# 期待される出力: 16テーブル
```

---

## 🎯 GitHub Actions自動デプロイ設定

### GitHub Secretsに追加

リポジトリ Settings → Secrets and variables → Actions:

```
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_ACCOUNT_ID=your_account_id
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
GEMINI_API_KEY=your_key
```

### 自動デプロイ確認

```bash
# コード変更してpush
git add .
git commit -m "Update: Test auto deploy"
git push origin main

# GitHub Actions → Actionsタブで確認
# 自動でCloudflareへデプロイされる
```

---

## 🔐 本番環境への移行

### Stripe本番キー設定

```bash
cd backend
wrangler secret put STRIPE_SECRET_KEY --env production
# 入力: sk_live_...

wrangler secret put STRIPE_PUBLISHABLE_KEY --env production
# 入力: pk_live_...
```

### 本番デプロイ

```bash
npm run deploy --env production
```

---

## 🆘 トラブルシューティング

### エラー: "Database not found"
```bash
# database_idを確認
wrangler d1 list

# wrangler.tomlと一致しているか確認
cat backend/wrangler.toml | grep database_id
```

### エラー: "Authentication failed"
```bash
# 再ログイン
wrangler logout
wrangler login
```

### GitHub Actionsが失敗
1. Secretsが正しく設定されているか確認
2. wrangler.tomlのバインディング確認
3. ログを確認: Actions → 失敗したワークフロー

---

## 📞 サポート

問題が発生した場合:
- **ドキュメント**: `docs/`フォルダ内の各種マニュアル
- **ログ確認**: `wrangler tail linkup-backend`
- **GitHub Issues**: リポジトリでIssue作成

---

## 🎉 デプロイ完了後

以下のURLでLinkUpにアクセス:
- **本番サイト**: https://linkup-demo.pages.dev
- **管理画面**: https://linkup-demo.pages.dev/admin
- **API**: https://linkup-backend.YOUR_SUBDOMAIN.workers.dev

次のステップ:
1. ✅ QR入場管理システムのテスト
2. ✅ Stripe決済統合
3. ✅ メール通知設定
4. ✅ 独自ドメイン設定

---

**🔗 LinkUp - 人と機会を繋げる**

Made with ❤️ by てつじ
