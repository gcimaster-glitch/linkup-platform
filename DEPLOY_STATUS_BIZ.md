# 🚀 LinkUp Deployment Status (Business Logic Integrated)

## 📌 現在のステータス
- **バージョン**: Platinum Edition v7.9.5
- **URL**: https://link-up.live

## 🔄 更新内容
1.  **主催者タイプ変更の実装**:
    -   主催者管理画面の「Settings」タブで、自身のタイプ（法人/個人/NPO）を変更可能になりました。
    -   変更内容はバックエンドAPI (`/api/organizer/settings`) を通じてデータベース (`linkup-db`) に保存されます。

2.  **手数料表示の動的化**:
    -   主催者管理画面の「Finance」タブで、現在のタイプに基づいた手数料率 (`fee_rate`) が表示されます。
    -   NPO/個人の場合は「0% (無料適用中)」と表示され、法人の場合は「5%」と表示されます。

3.  **データ連携の強化**:
    -   フロントエンドの `renderOrganizerSales` (売上画面) と `renderOrganizerProfileSettings` (設定画面) を、バックエンドAPIと完全に連携させました。

## ⚠️ デプロイ状況
- **Backend**: デプロイ完了 (v7.9.4ベース)
- **Frontend**: デプロイ試行中 (Cloudflare API エラー発生中)
  - コードは修正済みですが、一時的なネットワークエラーでアップロードが失敗しています。
  - 時間を置いて再試行するか、CLIから手動デプロイを行ってください。

## 🛠 手動デプロイ手順
```bash
export CLOUDFLARE_API_TOKEN=R-vgqvwf0iLYKSBoyvWQPL-shTKSUC1hNMjqwA-k
cd frontend/dist_static_fallback
npx wrangler pages deploy . --project-name linkup --branch main --commit-dirty=true
```
