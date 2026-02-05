# Cloudflare Pages デプロイ設定

## 自動デプロイの設定手順

### 1. Cloudflare API Tokenの取得

1. Cloudflare Dashboardにアクセス: https://dash.cloudflare.com/profile/api-tokens
2. 「Create Token」をクリック
3. 「Edit Cloudflare Workers」テンプレートを選択
4. 以下の権限を設定：
   - Account → Cloudflare Pages → Edit
5. 「Continue to summary」→「Create Token」
6. 生成されたトークンをコピー

### 2. Cloudflare Account IDの取得

1. Cloudflare Dashboard: https://dash.cloudflare.com/
2. Workers & Pages → linkup をクリック
3. URLから Account ID をコピー
   - 例: `https://dash.cloudflare.com/{ACCOUNT_ID}/pages/...`
   - または右側の「Account Details」セクションで確認

### 3. GitHubにシークレットを追加

1. GitHubリポジトリにアクセス: https://github.com/gcimaster-glitch/linkup-platform
2. 「Settings」→「Secrets and variables」→「Actions」
3. 以下のシークレットを追加：

#### CLOUDFLARE_API_TOKEN
- 手順1で取得したAPI Token

#### CLOUDFLARE_ACCOUNT_ID  
- 手順2で取得したAccount ID

### 4. 動作確認

1. `git push origin main` を実行
2. GitHubの「Actions」タブで実行状況を確認
3. デプロイ完了後、Cloudflare Pagesで確認

---

## 手動デプロイ（一時的な方法）

Cloudflare Dashboardから手動でデプロイする場合：

1. https://dash.cloudflare.com/ にアクセス
2. Workers & Pages → linkup
3. 「Create deployment」をクリック
4. 以下のファイルをアップロード：
   - `index.html`
   - `assets/` フォルダ
   - `_redirects`
   - `robots.txt`
   - `sitemap.xml`
5. 「Deploy」をクリック

---

## トラブルシューティング

### デプロイが実行されない場合

1. **GitHub Actionsの権限確認**
   - リポジトリの Settings → Actions → General
   - "Workflow permissions" で "Read and write permissions" が有効か確認

2. **Cloudflare Pages設定確認**
   - Cloudflare Dashboard → Workers & Pages → linkup
   - Settings → Builds & deployments
   - Production branch が `main` になっているか確認

3. **手動デプロイ**
   - Cloudflare Dashboardから手動アップロードを試す

---

## 現在の状況

- ✅ GitHubリポジトリ: https://github.com/gcimaster-glitch/linkup-platform
- ✅ Cloudflare Pages プロジェクト: linkup
- ⚠️ 自動デプロイ: 未設定（上記手順で設定が必要）
- 📝 本番URL: https://link-up.live
- 📝 Cloudflare URL: https://linkup-3sr.pages.dev

## 次のステップ

1. 上記の手順1-3を実行して、GitHubシークレットを設定
2. `.github/workflows/deploy.yml` をコミット&プッシュ
3. 自動デプロイが開始されることを確認
4. 今後は `git push` するだけで自動的にデプロイされます
