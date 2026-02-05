# 本番デプロイ手順

## 現在の状況
- ✅ GitHubにプッシュ済み（コミット: 859507b）
- ✅ デプロイパッケージ作成済み（.cloudflare-deploy/）
- ✅ 全ファイル準備完了

## 方法1: 自動デプロイ（GitHub連携済みの場合）

Cloudflare PagesとGitHubが連携されている場合、自動的にデプロイされます。

### 確認方法:
1. Cloudflare Dashboard: https://dash.cloudflare.com/
2. Workers & Pages → linkup または linkup-platform
3. Deployments タブを確認
4. 最新のデプロイが実行中/完了を確認

### デプロイ完了時刻の目安:
- 通常: 2-5分
- 完了後のURL:
  - 本番: https://link-up.live
  - Cloudflare: https://linkup-3sr.pages.dev

---

## 方法2: 手動デプロイ（GitHub連携未設定の場合）

### Cloudflare Dashboardから手動アップロード:

1. **Cloudflare Dashboardにアクセス**
   - https://dash.cloudflare.com/
   - Workers & Pages → linkup（または linkup-platform）

2. **Deploymentsタブを開く**

3. **「Create deployment」ボタンをクリック**

4. **以下のファイルをアップロード**
   ```
   /home/user/webapp/.cloudflare-deploy/
   ├── index.html (440KB)
   ├── assets/ (フォルダ全体)
   ├── _redirects
   ├── robots.txt
   └── sitemap.xml
   ```

5. **Branch: Production (main)**を選択

6. **「Save and Deploy」をクリック**

---

## 方法3: Wrangler CLI（要: API Token）

```bash
cd /home/user/webapp/.cloudflare-deploy
npx wrangler pages deploy . --project-name=linkup --branch=main
```

※ 環境変数 `CLOUDFLARE_API_TOKEN` が必要

---

## デプロイ後の確認

### 1. URLにアクセス
- https://link-up.live
- https://linkup-3sr.pages.dev

### 2. チェックイン機能の確認

#### ユーザー側:
1. ログイン → マイページ
2. 「チケット一覧」タブ
3. 「QRコード」ボタンをクリック
4. QRコードが表示されることを確認

#### 主催者側:
1. 主催者ダッシュボード → イベント管理
2. 「受付」ボタンをクリック
3. チェックイン方式選択モーダルが表示されることを確認
4. 「QRスキャン受付」または「手動チェックイン」を選択
5. 統計表示を確認

---

## トラブルシューティング

### デプロイが反映されない場合:

1. **キャッシュクリア**
   - ブラウザのキャッシュをクリア（Ctrl+Shift+R または Cmd+Shift+R）

2. **Cloudflare Cacheクリア**
   - Cloudflare Dashboard → Caching → Purge Cache
   - "Purge Everything" を実行

3. **デプロイ履歴確認**
   - Deployments タブで最新のデプロイが成功しているか確認
   - エラーログを確認

4. **手動デプロイを実行**
   - 上記「方法2」を実行

---

## 現在のファイル状態

```
本番準備完了:
- index.html: 440KB（チェックインUI実装済み）
- QRコードライブラリ: 追加済み
- html5-qrcode: 追加済み
- チェックイン関数: 全て実装済み
```

## 実装済み機能

### バックエンド（API完備）:
- ✅ POST /api/checkin/generate - QRコード生成
- ✅ POST /api/checkin/scan - QRスキャン受付
- ✅ POST /api/email/send-checkin - メール通知
- ✅ GET /api/checkin/stats/:eventId - 統計取得
- ✅ GET /api/checkin/list/:eventId - 参加者リスト

### フロントエンド:
- ✅ ユーザー: QRコード表示・ダウンロード
- ✅ 主催者: QRスキャン受付
- ✅ 主催者: 手動チェックイン
- ✅ リアルタイム統計表示
- ✅ 参加者リスト管理
- ✅ 重複チェックイン防止

---

## 次回からの自動デプロイ設定

GitHub連携を設定すると、`git push` するだけで自動デプロイされます:

1. Cloudflare Dashboard → Workers & Pages → linkup
2. Settings → Builds & deployments
3. 「Connect to Git」または「Source」
4. GitHub: gcimaster-glitch/linkup-platform を選択
5. Branch: main
6. Build directory: . (root)
7. Save

これで今後は `git push origin main` だけでOKです！
