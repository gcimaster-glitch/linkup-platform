# 🎯 imgbb統合 - クイックセットアップガイド

## 📋 概要

imgbbは無料の画像ホスティングサービスで、LinkUpプラットフォームの画像アップロード機能を即座に永続化できます。

**特徴:**
- ✅ 完全無料
- ✅ 無制限ストレージ
- ✅ CDN配信
- ✅ 32MB/画像まで対応
- ✅ セットアップ30秒

---

## 🚀 クイックセットアップ（3ステップ・1分）

### Step 1: imgbb APIキー取得（30秒）

1. **imgbb APIページを開く**
   - URL: https://api.imgbb.com/

2. **「Get API Key」をクリック**

3. **フォームを入力**
   - Email: あなたのメールアドレス
   - Username: 任意のユーザー名
   - Password: 任意のパスワード

4. **「Sign up」をクリック**

5. **APIキーをコピー**
   - 例: `1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p`

### Step 2: Cloudflare Dashboard で環境変数設定（20秒）

1. **Cloudflare Dashboard を開く**
   - URL: https://dash.cloudflare.com/

2. **Workers & Pages に移動**
   - 左メニューから「Workers & Pages」を選択

3. **linkup-backend ワーカーを選択**

4. **Settings → Variables に移動**

5. **環境変数を追加**
   - Variable name: `IMGBB_API_KEY`
   - Value: `（Step 1でコピーしたAPIキー）`
   - 「Encrypt」にチェック（推奨）

6. **「Save and Deploy」をクリック**

### Step 3: 完了！（自動デプロイ）

- ✅ 自動的にバックエンドが再デプロイされます
- ✅ 約30秒でデプロイ完了
- ✅ 画像アップロード機能が即座に使用可能

---

## 🧪 テスト手順

### 1. LinkUpサイトにアクセス

URL: https://link-up.live/

### 2. 主催者ログイン

- Email: user@example.com
- Password: password123

### 3. イベント作成ページへ移動

1. ダッシュボード → 「イベント作成」
2. 基本情報を入力

### 4. 画像アップロードをテスト

1. 「カバー画像」セクションで「ファイルを選択」をクリック
2. 画像ファイルを選択（32MB以下）
3. アップロード開始

**期待される動作:**
- ✅ プログレスバーが0%→100%
- ✅ 「アップロード完了！」メッセージ
- ✅ 画像プレビュー表示
- ✅ URLが `https://i.ibb.co/...` 形式

### 5. ブラウザ開発者ツールで確認

1. F12キーで開発者ツールを開く
2. 「Console」タブを確認

**期待されるログ:**
```
Using imgbb for image upload
✅ 画像をアップロードしました
```

3. 「Network」タブを確認

**期待されるリクエスト:**
- URL: `https://linkup-backend.gcimaster.workers.dev/api/upload/image`
- Status: `200 OK`
- Response:
  ```json
  {
    "success": true,
    "url": "https://i.ibb.co/...",
    "fileName": "...",
    "storage": "imgbb",
    "message": "Image uploaded successfully to imgbb"
  }
  ```

---

## 🔧 実装詳細

### バックエンド変更

**ファイル:** `backend/src/routes/upload.ts`

**優先順位:**
1. imgbb（IMGBB_API_KEY が設定されている場合）
2. R2（R2 バケットが設定されている場合）
3. エラー（どちらも設定されていない場合）

**アップロードフロー:**
```
1. ファイル受信
2. バリデーション（タイプ・サイズ）
3. Base64エンコード
4. imgbb APIへPOST
5. レスポンス検証
6. 公開URLを返す
```

**エラーハンドリング:**
- imgbb失敗時は自動的にR2にフォールバック
- R2も無い場合は503エラーを返す

### 環境変数

**必須:**
- `IMGBB_API_KEY`: imgbb APIキー（Secretとして設定推奨）

**オプション:**
- `R2`: R2バケット（フォールバック用）
- `R2_PUBLIC_DOMAIN`: R2公開ドメイン

---

## 📊 imgbb vs R2 比較

| 項目 | imgbb | Cloudflare R2 |
|------|-------|---------------|
| セットアップ | ⭐⭐⭐ 30秒 | ⭐⭐ 5分 |
| 料金 | 完全無料 | 10GB無料 → $0.015/GB |
| ストレージ | 無制限 | 10GB（無料枠） |
| ファイルサイズ | 32MB/画像 | 5GB/ファイル |
| CDN | ✅ グローバル | ✅ グローバル |
| 帯域制限 | なし | なし（完全無料） |
| 削除機能 | 自動削除可能 | 手動削除 |
| カスタムドメイン | ❌ | ✅ |
| API制限 | なし | なし |
| **推奨用途** | 開発・小規模 | 本番・大規模 |

---

## 💡 使い分け

### imgbbを使う場合（推奨: 現在）
- ✅ 即座に使いたい
- ✅ セットアップを簡単にしたい
- ✅ 小〜中規模サイト（月間数千枚程度）
- ✅ 開発・テスト環境

### R2を使う場合（推奨: 将来）
- ✅ カスタムドメインが必要
- ✅ 大規模サイト（月間数万枚以上）
- ✅ 完全なコントロールが必要
- ✅ 本番環境

### 両方使う場合（現在の実装）
- ✅ imgbbをメイン、R2をバックアップ
- ✅ 高可用性を実現
- ✅ 自動フォールバック

---

## 🔒 セキュリティ

### APIキーの保護

**推奨:**
1. Cloudflare Dashboard で「Encrypt」にチェック
2. wrangler.toml には記載しない（コメントのみ）
3. Gitにコミットしない

**設定方法:**
```bash
# ローカル開発環境
echo 'IMGBB_API_KEY="your-api-key"' > backend/.dev.vars

# 本番環境
# Cloudflare Dashboard → Variables で設定
```

### CORS設定

imgbbは自動的にCORSを許可するため、追加設定は不要です。

---

## 🐛 トラブルシューティング

### 問題1: 「Upload failed」エラー

**原因1:** APIキーが正しく設定されていない

**解決策:**
1. Cloudflare Dashboard → Variables を確認
2. `IMGBB_API_KEY` が存在するか確認
3. 値が正しいか確認（32文字の英数字）

**原因2:** ファイルサイズが32MBを超えている

**解決策:**
- 画像を圧縮（推奨: 1200x630px、80%品質）
- ファイルサイズを確認

### 問題2: 「imgbb API error」エラー

**原因:** imgbb側のエラー

**解決策:**
1. ブラウザコンソールでエラー詳細を確認
2. imgbb APIキーの有効性を確認
3. 一時的なサービス障害の可能性あり → 数分待って再試行

### 問題3: 画像がアップロードできるが表示されない

**原因:** ブラウザのセキュリティポリシー

**解決策:**
1. HTTPSページからHTTP画像を読み込んでいないか確認
2. imgbbの画像URLはHTTPSなので、通常は問題なし
3. ブラウザのコンソールでエラーを確認

---

## 📈 モニタリング

### アップロード状況の確認

**Cloudflare Dashboard:**
1. Workers & Pages → linkup-backend
2. Logs タブを開く
3. リアルタイムログを確認

**期待されるログ:**
```
Using imgbb for image upload
Image uploaded successfully to imgbb
```

### 使用量の確認

**imgbb:**
- 使用量制限なし
- ダッシュボードなし
- APIキー単位で管理

---

## 🔄 R2への移行（将来）

imgbbからR2への移行手順：

### Step 1: R2セットアップ完了

`R2_SETUP_GUIDE.md` を参照

### Step 2: 既存画像の移行（オプション）

```bash
# imgbbからR2へ画像を移行するスクリプト（要実装）
npm run migrate-images-to-r2
```

### Step 3: IMGBB_API_KEYを削除

Cloudflare Dashboard → Variables から削除

### Step 4: 完了

R2のみでの運用開始

---

## ✅ チェックリスト

- [ ] imgbb APIキー取得完了
- [ ] Cloudflare Dashboard で IMGBB_API_KEY 設定完了
- [ ] バックエンド自動デプロイ完了
- [ ] 画像アップロードテスト成功
- [ ] 画像がブラウザで正常に表示される
- [ ] エラーハンドリングを確認（大きいファイルでテスト）

---

## 📞 サポート

**imgbb公式:**
- API ドキュメント: https://api.imgbb.com/
- サポート: support@imgbb.com

**LinkUp固有:**
- バックエンド: `/home/user/webapp/backend/`
- Upload API: `backend/src/routes/upload.ts`
- 設定: `backend/wrangler.toml`

---

**作成日**: 2026-02-12  
**最終更新**: 2026-02-12  
**バージョン**: 1.0  
**ステータス**: ✅ 実装完了・テスト準備完了
