# 🚀 緊急デプロイ手順書 (2026-02-14)

## 概要
現在、重要な修正がコード化されていますが、**バックエンドがデプロイされていないため、本番環境では古いコードが実行されています**。

## 現在の状況

### ✅ 完了している作業
1. バックエンド: GET /api/auth/profile エンドポイント追加 ✅
2. フロントエンド: 古い renderDashboard() 関数削除 (208行) ✅
3. GitHub へのコミット＆プッシュ完了 ✅
4. バックアップ作成完了 (185MB) ✅

### ❌ 未完了（緊急対応必要）
1. **バックエンドデプロイ** ← これが最優先！
2. フロントエンドデプロイ
3. データベース移行0008, 0009の適用

## 問題の詳細

### 現在のテスト結果
```bash
=== ログインテスト ===
✅ Login response status: 200
✅ Token 取得成功

=== プロフィール取得テスト ===
❌ Profile response status: 401
❌ Error: "Unauthorized: Invalid token"
```

### 原因
- **新しいGET /api/auth/profileエンドポイントはコードに追加済み**
- **しかし、本番環境には古いバックエンドコードが実行されている**
- **そのため、プロフィールエンドポイントが存在せず、エラーが発生**

## 緊急デプロイ手順

### 手順1: Cloudflare APIトークン取得

1. https://dash.cloudflare.com/profile/api-tokens にアクセス
2. 「Create Token」をクリック
3. テンプレート「Edit Cloudflare Workers」を選択
4. または以下の権限を設定:
   - Account: Workers Scripts - Edit
   - Account: Workers KV Storage - Edit  
   - Zone: Workers Routes - Edit
5. 「Continue to summary」→「Create Token」
6. トークンをコピー（表示されるのは1回のみ！）

### 手順2: バックエンドデプロイ

```bash
# ターミナルを開く
cd /home/user/webapp/backend

# Cloudflare API トークンを設定
export CLOUDFLARE_API_TOKEN="your-token-here"

# デプロイ実行
npm run deploy

# または wrangler を直接使用
npx wrangler deploy
```

**期待される出力:**
```
✨ Built successfully, built project size is 245 KiB.
⛅️ wrangler 4.x.x
------------------
Total Upload: 245 KiB / gzip: 65 KiB
Uploaded linkup-backend (2.34 sec)
Deployed linkup-backend triggers (0.21 sec)
  https://linkup-backend.gcimaster.workers.dev
Current Version ID: 0eb56915-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### 手順3: デプロイ確認テスト

```bash
# バックエンドが動作しているか確認
curl https://linkup-backend.gcimaster.workers.dev/

# 期待される出力: "LinkUp Backend API is running!"

# ログインテスト
curl -X POST https://linkup-backend.gcimaster.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@linkup.live","password":"Admin@2026!"}'

# トークンを取得したら、プロフィールテスト
TOKEN="<上記で取得したトークン>"
curl -X GET https://linkup-backend.gcimaster.workers.dev/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"

# 期待される出力: ユーザー情報のJSON（エラーではなく）
```

### 手順4: フロントエンドデプロイ（オプション）

```bash
cd /home/user/webapp/frontend/dist_static_fallback

# Cloudflare Pages にデプロイ
npx wrangler pages deploy . --project-name=linkup-frontend

# または、既存のプロジェクト名を使用
# npx wrangler pages deploy . --project-name=link-up-live
```

## トラブルシューティング

### エラー: "CLOUDFLARE_API_TOKEN environment variable is required"

**解決策:**
```bash
export CLOUDFLARE_API_TOKEN="your-actual-token-here"
# そして再度デプロイ実行
npm run deploy
```

### エラー: "Authentication error"

**解決策:**
1. トークンの権限を確認
2. 新しいトークンを作成
3. アカウントIDを確認: `wrangler whoami`

### エラー: "Project already exists"

**解決策:**
```bash
# 既存のプロジェクトを更新
npx wrangler deploy --force
```

## デプロイ後の確認項目

### ✅ バックエンド確認
- [ ] API ルートが応答する (`/`)
- [ ] ログインが正常に動作 (`/api/auth/login`)
- [ ] **プロフィール取得が正常に動作** (`/api/auth/profile`) ← 最重要！
- [ ] イベント一覧取得が動作 (`/api/events`)

### ✅ フロントエンド確認
- [ ] トップページが表示される
- [ ] ログインフォームが動作する
- [ ] ログイン後、ダッシュボードが表示される（白画面にならない）
- [ ] メニューリンクが正常に動作する
- [ ] 古いデータが表示されない

## デプロイ後のテスト実行

```bash
cd /home/user/webapp

# 統合テストを実行
node test_comprehensive.js

# 期待される結果:
# ✅ 合格: 10+ テスト
# ❌ 不合格: 0〜2 テスト
# 成功率: 85%以上
```

## バックアップからの復元手順（万が一の場合）

```bash
cd /home/user

# バックアップを展開
tar -xzf linkup-platform-backup-20260214-130816.tar.gz

# 元の場所に復元
cp -r webapp-backup/* webapp/

# GitHubから前のバージョンをチェックアウト
cd webapp
git checkout 381b1e0  # 前のコミット
```

## タイムライン

### 即座に実施（推定10分）
1. ✅ Cloudflare API Token 取得 (2分)
2. ✅ バックエンドデプロイ (5分)
3. ✅ デプロイ確認テスト (3分)

### 次のステップ（推定30分）
4. フロントエンドデプロイ (5分)
5. 統合テスト実行 (10分)
6. データベース移行0008適用 (15分)

### 最終確認（推定20分）
7. E2Eテスト実施 (15分)
8. ドキュメント更新 (5分)

## 連絡事項

### デプロイ成功後
1. 統合テスト結果をレポート
2. 本番環境URLの動作確認
3. ユーザーに引き渡し可能な状態になったことを報告

### デプロイ失敗時
1. エラーログを保存
2. バックアップから復元
3. 問題の詳細を調査

---

**作成日時**: 2026-02-14 13:17 JST  
**優先度**: 🔴 最高優先  
**ステータス**: 待機中（Cloudflare API Token必要）  
**推定所要時間**: 10分

## 重要な注意事項

⚠️ **このデプロイを実行しない限り、以下の問題は解決されません**:
- プロフィール取得エラー
- ログイン後の白画面
- メニューリンクの動作不良
- 古いデータの表示

✅ **デプロイ後は、すべての問題が解決される見込みです**。
