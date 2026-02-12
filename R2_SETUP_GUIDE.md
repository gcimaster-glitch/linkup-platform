# 📦 Cloudflare R2 セットアップガイド

## 🎯 概要

LinkUpプラットフォームの画像アップロード機能を永続化するため、Cloudflare R2バケットを設定します。

---

## ✅ 前提条件

- Cloudflareアカウント（既に作成済み）
- linkup-backendワーカーがデプロイ済み
- wrangler.tomlにR2設定が記載済み ✅

---

## 📋 セットアップ手順

### Step 1: R2バケットの作成

#### オプションA: Cloudflare Dashboard（推奨）

1. **Cloudflare Dashboardにログイン**
   - URL: https://dash.cloudflare.com/

2. **R2セクションに移動**
   - 左メニューから「R2」を選択

3. **バケットを作成**
   - 「Create bucket」をクリック
   - バケット名: `linkup-storage`
   - リージョン: `Automatic`（推奨）
   - 「Create bucket」をクリック

#### オプションB: Wrangler CLI（API Token必要）

```bash
# Cloudflare API Tokenを設定
export CLOUDFLARE_API_TOKEN="your-api-token-here"

# R2バケット作成
cd /home/user/webapp/backend
npx wrangler r2 bucket create linkup-storage
```

---

### Step 2: R2バケットを公開設定

#### 公開アクセスの有効化

**Cloudflare Dashboard:**

1. R2セクションで `linkup-storage` バケットを開く
2. 「Settings」タブを選択
3. 「Public Access」セクションで以下を設定：

   **オプション1: R2.dev サブドメイン（簡単・無料）**
   - 「Allow Access」をクリック
   - 自動生成されたURLをコピー
   - 例: `https://pub-xxx.r2.dev`

   **オプション2: カスタムドメイン（推奨）**
   - 「Connect Domain」をクリック
   - ドメイン: `images.link-up.live`（または任意）
   - DNSレコードが自動作成されます

---

### Step 3: 環境変数の更新

#### wrangler.toml を更新

公開URLを取得したら、`backend/wrangler.toml` を更新：

```toml
[vars]
# オプション1: R2.dev サブドメインの場合
R2_PUBLIC_DOMAIN = "pub-xxx.r2.dev"

# オプション2: カスタムドメインの場合
R2_PUBLIC_DOMAIN = "images.link-up.live"
```

#### 現在の設定

```toml
[vars]
R2_PUBLIC_DOMAIN = "linkup-storage.r2.cloudflarestorage.com"
```

⚠️ **注意**: `.r2.cloudflarestorage.com` はプライベートアクセス用のため、公開URLには使用できません。

---

### Step 4: バックエンドの再デプロイ

#### Cloudflare Dashboard経由（推奨）

1. **Workers & Pages** セクションに移動
2. `linkup-backend` ワーカーを選択
3. 「Settings」→「Variables」
4. `R2_PUBLIC_DOMAIN` を編集
   - 新しい公開URLを入力
5. 「Save and Deploy」をクリック

#### Wrangler CLI経由（API Token必要）

```bash
cd /home/user/webapp/backend
export CLOUDFLARE_API_TOKEN="your-api-token-here"
npx wrangler deploy
```

---

### Step 5: CORS設定（必要な場合）

フロントエンドからR2の画像を直接読み込む場合、CORS設定が必要です。

**Cloudflare Dashboard:**

1. R2セクションで `linkup-storage` バケットを開く
2. 「Settings」→「CORS Policy」
3. 以下のJSON設定を追加：

```json
[
  {
    "AllowedOrigins": [
      "https://link-up.live",
      "http://localhost:3000"
    ],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

---

## 🧪 テスト手順

### 1. R2バケット作成確認

```bash
# R2バケット一覧を確認（API Token必要）
npx wrangler r2 bucket list

# 期待される出力:
# Name: linkup-storage
# Created: YYYY-MM-DD
```

### 2. 画像アップロードテスト

1. LinkUpサイトにアクセス: https://link-up.live/
2. 主催者ログイン（user@example.com / password123）
3. 「イベント作成」ページへ移動
4. カバー画像をアップロード

**期待される動作:**
- ✅ プログレスバーが0%→100%
- ✅ 「アップロード完了！」メッセージ
- ✅ 画像プレビュー表示
- ✅ URLが `https://[R2_PUBLIC_DOMAIN]/events/...` 形式

**エラー時の動作:**
- ⚠️ 「R2ストレージが設定されていません」→ R2設定が未完了
- ⚠️ 「ローカルプレビューモードで表示しています」→ R2アップロード失敗、フォールバック動作

### 3. ブラウザ開発者ツールで確認

1. F12キーで開発者ツールを開く
2. 「Network」タブを選択
3. 画像アップロード実行
4. POST リクエストを確認:
   - URL: `https://linkup-backend.gcimaster.workers.dev/api/upload/image`
   - Status: `200 OK`
   - Response: `{ "success": true, "url": "https://...", ... }`

---

## 📊 R2 料金情報

Cloudflare R2は以下の料金体系です：

| 項目 | 無料枠 | 料金（超過分） |
|------|--------|--------------|
| ストレージ | 10 GB | $0.015/GB/月 |
| Class A操作（書き込み） | 100万回/月 | $4.50/100万操作 |
| Class B操作（読み取り） | 1000万回/月 | $0.36/100万操作 |
| 送信データ | 無制限 | **完全無料** ⭐ |

**LinkUpの想定使用量（月間）:**
- イベント数: 100件
- 画像数: 400枚（カバー1枚 + サブ3枚）
- 平均サイズ: 500KB/枚
- 総ストレージ: 200MB
- 書き込み操作: 400回
- 読み取り操作: 10,000回

**想定月額: $0（完全無料枠内）** 🎉

---

## 🔧 トラブルシューティング

### 問題1: 「R2 storage not configured」エラー

**原因**: R2バケットがワーカーにバインドされていない

**解決策**:
1. wrangler.toml に R2設定があるか確認
2. バックエンドを再デプロイ
3. Cloudflare Dashboard で R2 バインディングを確認

### 問題2: 「403 Forbidden」エラー

**原因**: R2バケットが公開設定されていない

**解決策**:
1. Cloudflare Dashboard で R2バケットを開く
2. 「Public Access」を有効化
3. R2.dev URLまたはカスタムドメインを設定

### 問題3: 画像が表示されない

**原因**: CORSポリシーの設定不足

**解決策**:
1. R2バケットのCORS設定を確認
2. `AllowedOrigins` に `https://link-up.live` を追加
3. ブラウザのキャッシュをクリア

### 問題4: アップロードが遅い

**原因**: ファイルサイズが大きい

**解決策**:
1. 画像を圧縮（推奨: 1200x630px、80%品質）
2. WebP形式を使用（現在未実装）
3. プレビュー時にサムネイル生成（将来の改善）

---

## 📝 現在の実装状況

### ✅ 完了
- [x] R2バケット設定（wrangler.toml）
- [x] Upload APIエンドポイント実装
- [x] ファイルタイプ・サイズチェック
- [x] エラーハンドリング強化
- [x] フォールバックモード（ローカルプレビュー）
- [x] プログレスバー表示
- [x] サブ画像アップロード対応

### ⏳ 保留中
- [ ] R2バケット作成（手動実行が必要）
- [ ] R2公開URL設定（手動実行が必要）
- [ ] CORS設定（必要な場合）

### 🔮 将来の改善
- [ ] 画像の自動リサイズ
- [ ] WebP変換
- [ ] サムネイル生成
- [ ] 画像の遅延読み込み
- [ ] CDN統合

---

## 🚀 次のステップ

### 今すぐ実行
1. ✅ Cloudflare Dashboardにログイン
2. ✅ R2バケット `linkup-storage` を作成
3. ✅ R2.dev 公開URLを有効化
4. ✅ wrangler.toml の `R2_PUBLIC_DOMAIN` を更新
5. ✅ バックエンドを再デプロイ
6. ✅ 画像アップロードをテスト

### オプション（推奨）
- カスタムドメイン設定（images.link-up.live）
- CORS設定
- モニタリング設定

---

## 📞 サポート情報

**Cloudflare R2 ドキュメント:**
- 公式ドキュメント: https://developers.cloudflare.com/r2/
- R2バケット作成: https://developers.cloudflare.com/r2/buckets/create-buckets/
- 公開アクセス: https://developers.cloudflare.com/r2/buckets/public-buckets/
- CORS設定: https://developers.cloudflare.com/r2/buckets/cors/

**LinkUp 固有設定:**
- バックエンド: `/home/user/webapp/backend/`
- 設定ファイル: `backend/wrangler.toml`
- Upload API: `backend/src/routes/upload.ts`

---

## ✅ チェックリスト

完了したら以下にチェックを入れてください：

- [ ] R2バケット `linkup-storage` が作成されている
- [ ] R2バケットが公開設定されている
- [ ] R2_PUBLIC_DOMAIN が正しく設定されている
- [ ] バックエンドが再デプロイされている
- [ ] 画像アップロードが正常に動作している
- [ ] 画像がブラウザで表示できる
- [ ] CORS設定が完了している（必要な場合）

---

**作成日**: 2026-02-12  
**最終更新**: 2026-02-12  
**バージョン**: 1.0
