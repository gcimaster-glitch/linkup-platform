# 🚀 バックエンド手動デプロイ手順書

**対象**: Cloudflare Workers (linkup-backend)  
**作成日**: 2026-02-13  
**バージョン**: v3.8.4-AUTH-FIX  

---

## 📋 事前準備

### 必要なもの
- [ ] Cloudflareアカウント
- [ ] linkup-backend Workers プロジェクト (既存)
- [ ] GitHubアカウント (gcimaster-glitch)
- [ ] リポジトリアクセス権限

---

## 🎯 デプロイ方法の選択

### 方法A: Cloudflare Dashboard からのデプロイ（推奨）
最も簡単で確実な方法。ブラウザのみで完結。

### 方法B: GitHub Actions での自動デプロイ
一度設定すれば、以降はgit pushで自動デプロイ。

### 方法C: ローカルからWrangler CLI
`wrangler deploy` コマンドでデプロイ。APIトークンが必要。

---

## 🌐 方法A: Cloudflare Dashboard デプロイ

### ステップ1: Cloudflare Dashboardにログイン

```
1. https://dash.cloudflare.com/ にアクセス
2. メールアドレスとパスワードでログイン
```

---

### ステップ2: Workers プロジェクトを開く

```
1. 左メニューから "Workers & Pages" をクリック
2. 既存のWorker "linkup-backend" を選択
   または
   新規作成: "Create application" → "Create Worker"
```

---

### ステップ3: 設定の確認

#### 3-1. Settings → Variables で環境変数を設定

**必須の環境変数:**

| 変数名 | 値 | タイプ |
|--------|---|--------|
| `JWT_SECRET` | `linkup-production-secret-key-2026-v1-secure` | Text |
| `ENVIRONMENT` | `production` | Text |
| `FRONTEND_URL` | `https://link-up.live` | Text |

**設定手順:**
```
1. Settings タブをクリック
2. Variables セクションまでスクロール
3. "Add variable" をクリック
4. Variable name: JWT_SECRET
5. Value: linkup-production-secret-key-2026-v1-secure
6. Type: Text (not encrypted)
7. "Save" をクリック
```

⚠️ **重要**: JWT_SECRETは必ず設定してください。これがないと認証が機能しません。

---

#### 3-2. Settings → Bindings でD1データベースをバインド

**必須のバインディング:**

| バインディング名 | タイプ | リソース |
|----------------|--------|----------|
| `DB` | D1 Database | `linkup-db` |

**設定手順:**
```
1. Settings → Bindings セクション
2. "Add binding" をクリック
3. Variable name: DB
4. Type: D1 Database を選択
5. D1 Database: linkup-db を選択
6. "Save" をクリック
```

---

### ステップ4: コードのデプロイ

#### 方法4-1: Quick Edit でコードを直接貼り付け

```
1. "Quick edit" ボタンをクリック
2. エディタが開く
3. 以下のコードを貼り付け (または最新のbackend/src/index.tsを使用)
4. "Save and deploy" をクリック
```

**コードの取得:**
```bash
# GitHubから最新コードを取得
https://github.com/gcimaster-glitch/linkup-platform/tree/main/backend/src
```

---

#### 方法4-2: GitHub連携でデプロイ (推奨)

```
1. Settings → Deployments
2. "Connect to Git" をクリック
3. GitHub を選択
4. リポジトリ選択: gcimaster-glitch/linkup-platform
5. Branch: main
6. Build configuration:
   - Build command: cd backend && npm install && npm run build
   - Build output directory: backend/dist
   - Root directory: backend
7. "Save and Deploy" をクリック
```

**メリット:**
- 自動ビルド
- git pushで自動デプロイ
- ロールバック機能

---

### ステップ5: デプロイ完了確認

```
1. Deployments タブで進行状況を確認
2. 緑色の "Active" バッジが表示されたら成功
3. Worker URL をクリックして動作確認
```

**期待される URL:**
```
https://linkup-backend.gcimaster.workers.dev
```

**ヘルスチェック:**
```bash
curl https://linkup-backend.gcimaster.workers.dev/health

# 期待されるレスポンス:
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2026-02-13T02:30:00Z"
}
```

---

## 🔄 方法B: GitHub Actions 自動デプロイ

### ステップ1: Cloudflare API Token取得

```
1. Cloudflare Dashboard → My Profile → API Tokens
2. "Create Token" をクリック
3. Template: "Edit Cloudflare Workers" を選択
4. Token name: GitHub Actions Deploy
5. Permissions:
   - Account → Workers Scripts → Edit
   - Account → D1 → Edit
6. "Continue to summary" → "Create Token"
7. トークンをコピー（一度しか表示されません）
```

---

### ステップ2: GitHub Secretsに登録

```
1. https://github.com/gcimaster-glitch/linkup-platform
2. Settings → Secrets and variables → Actions
3. "New repository secret" をクリック
4. Name: CLOUDFLARE_API_TOKEN
5. Secret: (コピーしたトークンを貼り付け)
6. "Add secret" をクリック
```

---

### ステップ3: GitHub Actions ワークフローファイル作成

**ファイル**: `.github/workflows/deploy-backend.yml`

```yaml
name: Deploy Backend to Cloudflare Workers

on:
  push:
    branches:
      - main
    paths:
      - 'backend/**'
      - '.github/workflows/deploy-backend.yml'

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy Backend
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd backend
          npm install
          
      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          workingDirectory: backend
          command: deploy
```

---

### ステップ4: プッシュして自動デプロイ

```bash
git add .github/workflows/deploy-backend.yml
git commit -m "ci: GitHub Actions でバックエンド自動デプロイ設定"
git push origin main
```

**確認:**
```
1. GitHub → Actions タブ
2. "Deploy Backend to Cloudflare Workers" ワークフローを確認
3. 緑色のチェックマークが表示されたら成功
```

---

## 🖥️ 方法C: Wrangler CLI デプロイ

### 前提条件
- Node.js 18+ インストール済み
- Cloudflare API Token取得済み

---

### ステップ1: API Tokenを環境変数に設定

**macOS/Linux:**
```bash
export CLOUDFLARE_API_TOKEN="your-api-token-here"
```

**Windows (PowerShell):**
```powershell
$env:CLOUDFLARE_API_TOKEN="your-api-token-here"
```

---

### ステップ2: デプロイコマンド実行

```bash
cd backend
npm install
npx wrangler deploy
```

**期待される出力:**
```
Total Upload: 150 KiB / gzip: 45 KiB
Uploaded linkup-backend (1.23 sec)
Published linkup-backend (0.45 sec)
  https://linkup-backend.gcimaster.workers.dev
Current Deployment ID: abcd1234-5678-90ef-ghij-klmnopqrstuv
```

---

## ✅ デプロイ後の確認

### 1. ヘルスチェック

```bash
curl https://linkup-backend.gcimaster.workers.dev/health
```

**期待されるレスポンス:**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2026-02-13T02:30:00Z"
}
```

---

### 2. 認証テスト

**ログインAPI:**
```bash
curl -X POST https://linkup-backend.gcimaster.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@linkup.com","password":"demo123"}'
```

**期待されるレスポンス:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "name": "Demo User",
    "email": "demo@linkup.com",
    "role": "organizer"
  }
}
```

---

### 3. イベント作成テスト（認証必須）

```bash
# 1. ログインしてトークン取得
TOKEN=$(curl -X POST https://linkup-backend.gcimaster.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@linkup.com","password":"demo123"}' \
  | jq -r '.token')

# 2. イベント作成
curl -X POST https://linkup-backend.gcimaster.workers.dev/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "テストイベント",
    "category": "tech",
    "start_datetime": "2026-03-01T10:00:00Z",
    "end_datetime": "2026-03-01T12:00:00Z",
    "venue_name": "渋谷会場",
    "status": "draft"
  }'
```

**期待されるレスポンス:**
```json
{
  "success": true,
  "event": {
    "event_id": "evt-1234567890",
    "title": "テストイベント",
    "status": "draft"
  }
}
```

---

## 🔧 トラブルシューティング

### エラー: "Unauthorized: Invalid token"

**原因**: JWT_SECRETが設定されていない

**解決策**:
```
1. Cloudflare Dashboard → Workers → linkup-backend
2. Settings → Variables
3. JWT_SECRET が設定されているか確認
4. 値: linkup-production-secret-key-2026-v1-secure
```

---

### エラー: "Database binding not found"

**原因**: D1データベースがバインドされていない

**解決策**:
```
1. Settings → Bindings
2. "Add binding" をクリック
3. Variable name: DB
4. Type: D1 Database
5. D1 Database: linkup-db を選択
```

---

### エラー: "Module not found"

**原因**: ビルドが正しく実行されていない

**解決策**:
```bash
cd backend
npm install
npm run build
npx wrangler deploy
```

---

## 🎯 デプロイ完了チェックリスト

- [ ] Cloudflare Workersにデプロイ成功
- [ ] 環境変数 `JWT_SECRET` 設定完了
- [ ] D1データベース `DB` バインド完了
- [ ] ヘルスチェック成功 (200 OK)
- [ ] ログインAPI成功 (トークン取得)
- [ ] イベント作成API成功 (認証あり)
- [ ] フロントエンドから動作確認
- [ ] エラーログ確認 (Cloudflare Dashboard → Logs)

---

## 📞 サポート

デプロイ中に問題が発生した場合:

1. **Cloudflare Dashboard → Workers → linkup-backend → Logs** でエラーログを確認
2. GitHubリポジトリのIssuesで質問
3. Cloudflareドキュメント: https://developers.cloudflare.com/workers/

---

## 📚 参考資料

- [Cloudflare Workers ドキュメント](https://developers.cloudflare.com/workers/)
- [Wrangler CLI リファレンス](https://developers.cloudflare.com/workers/wrangler/)
- [D1 Database](https://developers.cloudflare.com/d1/)
- [GitHub Actions for Cloudflare](https://github.com/cloudflare/wrangler-action)

---

**作成者**: Claude AI Assistant  
**最終更新**: 2026-02-13 02:30:00 (JST)  
**バージョン**: v3.8.4-AUTH-FIX

---

*このドキュメントは手動デプロイ用のガイドです。質問があればお気軽にお問い合わせください。*
