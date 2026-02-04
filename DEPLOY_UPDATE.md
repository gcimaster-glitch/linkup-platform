# 🚀 LinkUp Deployment Update (Business Model Implementation)

## 📌 現在のステータス
- **バージョン**: Platinum Edition v7.9.4
- **更新完了日時**: 2026-02-02
- **URL**: https://link-up.live

## 🔄 バックエンド更新内容 (Business Logic)
1.  **キャンペーン機能の実装**:
    -   `/api/campaigns`: キャンペーン作成・一覧APIを実装
    -   `campaigns` テーブル: 利用可能 (D1)
2.  **主催者タイプ管理**:
    -   `organizer_profiles` テーブルに `type` カラムを追加 (Corporate / NPO / Individual)
    -   `/api/organizer/settings`: プロフィール（タイプ含む）の更新機能実装
3.  **手数料計算ロジック**:
    -   `/api/organizer/stats`: 主催者タイプに基づき手数料率を動的に計算 (NPO/個人: 0%, 法人: 5%)

## 🛠 確認方法 (API)
- **キャンペーン作成**: `POST /api/campaigns`
- **プロフィール設定**: `PUT /api/organizer/settings`
- **手数料確認**: `GET /api/organizer/stats` (レスポンスの `fee_rate` を確認)

## 🔜 次のステップ (推奨)
フロントエンド (Organizer Dashboard) の「設定」ページで、実際に主催者タイプを変更し、売上画面で手数料率の変化を確認するUI実装を行うと、ビジネスモデルの完全なデモが可能になります。
