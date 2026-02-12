# Cloudflare Pages デプロイ手順（APIトークン使用）

## 1. APIトークンの作成

1. Cloudflare Dashboard にアクセス
   https://dash.cloudflare.com/profile/api-tokens

2. 「Create Token」→「Edit Cloudflare Workers」テンプレートを選択

3. 権限を設定:
   - Account: Cloudflare Pages:Edit
   - Zone: (不要)

4. 「Continue to summary」→「Create Token」

5. トークンをコピー（一度しか表示されません）

---

## 2. デプロイコマンド実行

```bash
cd /home/user/webapp

# トークンを環境変数に設定
export CLOUDFLARE_API_TOKEN="your_token_here"

# デプロイ実行
npx wrangler pages deploy . --project-name=linkup
```

---

## 3. 確認

デプロイ完了後、以下のURLにアクセス:
- https://link-up.live/

変更が反映されているか確認してください。

---

## トラブルシューティング

### エラー: "Project not found"
→ プロジェクト名を確認: `--project-name=linkup`

### エラー: "Invalid token"
→ トークンの権限を確認（Cloudflare Pages:Edit が必要）

### デプロイが遅い
→ GitHub連携デプロイの方が高速な場合があります
