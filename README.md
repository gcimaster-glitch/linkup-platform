# 🎫 Event Ticket Platform

次世代イベントチケット予約システム - Peatix互換プラットフォーム

## 🏗️ アーキテクチャ

- **フロントエンド**: Gemini AI Studio (React/Next.js)
- **バックエンド**: Cloudflare Workers (Hono Framework)
- **データベース**: Cloudflare D1 (SQLite)
- **ストレージ**: Cloudflare R2
- **決済**: Stripe
- **認証**: Stripe Identity (eKYC) + NTT二段階認証
- **AI**: Google Gemini API

## 📂 ディレクトリ構造

```
event-ticket-platform/
├── frontend/              # フロントエンドアプリケーション
│   ├── src/
│   │   ├── components/   # Reactコンポーネント
│   │   ├── pages/        # ページコンポーネント
│   │   ├── hooks/        # カスタムフック
│   │   ├── utils/        # ユーティリティ関数
│   │   └── styles/       # スタイルシート
│   ├── public/           # 静的ファイル
│   └── package.json
│
├── backend/              # バックエンドAPI (Cloudflare Workers)
│   ├── src/
│   │   ├── routes/       # APIルート
│   │   ├── controllers/  # コントローラー
│   │   ├── middleware/   # ミドルウェア
│   │   ├── services/     # ビジネスロジック
│   │   └── utils/        # ユーティリティ
│   ├── wrangler.toml     # Cloudflare Workers設定
│   └── package.json
│
├── database/             # データベース定義
│   ├── schema.sql        # テーブル定義
│   ├── migrations/       # マイグレーションスクリプト
│   └── seeds/            # 初期データ
│
├── docs/                 # ドキュメント
│   ├── api-spec.md       # API仕様書
│   ├── database-design.md # DB設計書
│   └── deployment.md     # デプロイ手順
│
└── .github/
    └── workflows/        # GitHub Actions (CI/CD)
        ├── frontend-deploy.yml
        └── backend-deploy.yml
```

## 🚀 クイックスタート

### 前提条件

- Node.js 18以上
- Cloudflare アカウント
- Stripe アカウント
- Google Cloud (Gemini API)

### セットアップ

```bash
# リポジトリクローン
git clone https://github.com/yourusername/event-ticket-platform.git
cd event-ticket-platform

# フロントエンドセットアップ
cd frontend
npm install
npm run dev

# バックエンドセットアップ
cd ../backend
npm install
npm run dev
```

### 環境変数設定

`.env.example`を`.env`にコピーして、必要な値を設定:

```env
# Cloudflare
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
DATABASE_ID=your_d1_database_id
R2_BUCKET_NAME=event-images

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# NTT認証
NTT_API_KEY=your_ntt_api_key
NTT_API_SECRET=your_ntt_secret
```

## 📦 デプロイ

### フロントエンド (Cloudflare Pages)

```bash
cd frontend
npm run build
npx wrangler pages deploy dist
```

### バックエンド (Cloudflare Workers)

```bash
cd backend
npm run deploy
```

### データベース (Cloudflare D1)

```bash
# データベース作成
npx wrangler d1 create event-ticket-db

# マイグレーション実行
npx wrangler d1 execute event-ticket-db --file=../database/schema.sql
```

## 🔗 GitHub連携自動デプロイ

1. GitHubリポジトリをCloudflare Pagesに接続
2. ビルド設定:
   - **ビルドコマンド**: `npm run build`
   - **ビルド出力ディレクトリ**: `dist`
   - **ルートディレクトリ**: `frontend`
3. 環境変数を設定
4. プッシュで自動デプロイ

## 📚 ドキュメント

- [API仕様書](./docs/api-spec.md)
- [データベース設計](./docs/database-design.md)
- [デプロイ手順](./docs/deployment.md)

## 🤝 コントリビューション

プルリクエスト歓迎! 詳細は [CONTRIBUTING.md](./CONTRIBUTING.md) を参照。

## 📄 ライセンス　　

MIT License
