# 🔧 外部サービス統合計画

## 📋 概要

LinkUp プラットフォームに以下の外部サービスを統合します：

1. ✅ **Stripe決済** - クレジットカード決済
2. ✅ **eKYC (Stripe Identity)** - 本人確認
3. ✅ **Google ログイン** - OAuth 2.0認証
4. ✅ **Google Maps API** - 地図表示・検索
5. ✅ **Gemini API** - AI機能

---

## 🎯 優先順位

### **Phase 1: 決済とセキュリティ（最優先）**
1. Stripe決済の本番実装
2. eKYC (Stripe Identity) の実装

### **Phase 2: 認証システム**
3. Google ログインの実装

### **Phase 3: 地図とAI**
4. Google Maps API の統合
5. Gemini API の統合

---

## 📊 現状分析

### 1. **Stripe決済**

#### ✅ 完了:
- Stripe ライブラリ (`stripe@14.25.0`) インストール済み
- `StripeService` クラス実装済み (`backend/src/services/stripe.ts`)
- Payment Intent エンドポイント (`/api/payment/create-intent`)
- モック実装で動作確認済み

#### ❌ 未完成:
- `STRIPE_SECRET_KEY` シークレット未設定
- `STRIPE_WEBHOOK_SECRET` 未設定
- Webhook エンドポイントの実装
- フロントエンドの Stripe Elements 統合
- 決済完了後のフロー

#### 📝 必要な作業:
1. Stripe アカウント作成
2. API キーの取得
3. Cloudflare Workers にシークレット設定
4. フロントエンド統合
5. Webhook 設定

---

### 2. **eKYC (Stripe Identity)**

#### ✅ 完了:
- エンドポイントスタブ (`/api/payment/verify-identity`)

#### ❌ 未完成:
- Stripe Identity API の本格実装
- ユーザーフローの設計
- UI/UX の実装
- 本人確認状態の管理

#### 📝 必要な作業:
1. Stripe Identity 機能を有効化
2. Verification Session の作成
3. フロントエンド UI 実装
4. 本人確認完了後のコールバック処理
5. DB に本人確認ステータスを保存

---

### 3. **Google ログイン**

#### ✅ 完了:
- UI ボタン実装済み（モーダル内）
- LINE ログインボタンも用意

#### ❌ 未完成:
- Google OAuth 2.0 クライアント ID 未取得
- Google Sign-In JavaScript SDK 未統合
- バックエンドのトークン検証
- ユーザー登録・ログインフロー

#### 📝 必要な作業:
1. Google Cloud Console でプロジェクト作成
2. OAuth 2.0 クライアント ID 取得
3. Google Sign-In SDK の統合
4. バックエンドでトークン検証
5. ユーザー登録・ログインフローの実装

---

### 4. **Google Maps API**

#### ✅ 完了:
- Leaflet (OpenStreetMap) で地図表示中
- 地図表示のUI/UX は実装済み

#### ❌ 未完成:
- Google Maps API 未統合
- 住所検索・ジオコーディング機能
- Places API 統合

#### 📝 必要な作業:
1. Google Maps API キー取得
2. Maps JavaScript API の統合
3. Places API の統合（会場検索）
4. Geocoding API の統合（住所→座標変換）
5. Leaflet から Google Maps への移行

---

### 5. **Gemini API**

#### ✅ 完了:
- 管理画面に API Key 入力欄あり
- `wrangler.toml` に `GEMINI_API_KEY` の記載

#### ❌ 未完成:
- Gemini API の実際の利用
- AI チャット機能
- イベント説明文の自動生成
- 画像認識機能

#### 📝 必要な作業:
1. Google AI Studio で API キー取得
2. Gemini API クライアントの実装
3. AI チャット機能の実装
4. イベント説明文の自動生成機能
5. 画像認識機能（イベント画像の自動タグ付け）

---

## 🚀 実装ステップ

### **Phase 1: Stripe決済とeKYC（1-2日）**

#### **Step 1.1: Stripe アカウントセットアップ**
1. Stripe アカウント作成
2. テストモード API キー取得
3. Cloudflare Workers にシークレット設定:
   ```bash
   cd backend
   wrangler secret put STRIPE_SECRET_KEY
   wrangler secret put STRIPE_WEBHOOK_SECRET
   ```

#### **Step 1.2: フロントエンド Stripe Elements 統合**
1. Stripe.js SDK をロード
2. Payment Elements コンポーネント実装
3. 決済フォームの UI 実装
4. 決済完了後のリダイレクト

#### **Step 1.3: Webhook 実装**
1. Webhook エンドポイント作成 (`/api/webhooks/stripe`)
2. 署名検証
3. 決済完了イベントの処理
4. チケット発行ロジック

#### **Step 1.4: eKYC 実装**
1. Stripe Identity Session 作成
2. フロントエンドで Identity Modal を開く
3. 本人確認完了後のコールバック処理
4. DB にステータス保存

---

### **Phase 2: Google ログイン（半日）**

#### **Step 2.1: Google Cloud Console セットアップ**
1. プロジェクト作成
2. OAuth 2.0 クライアント ID 取得
3. 承認済みリダイレクト URI 設定

#### **Step 2.2: フロントエンド統合**
1. Google Sign-In SDK ロード
2. ワンタップログインの実装
3. トークン取得

#### **Step 2.3: バックエンド統合**
1. `/api/auth/google` エンドポイント作成
2. Google トークンの検証
3. ユーザー登録・ログイン処理
4. JWT トークン発行

---

### **Phase 3: Google Maps & Gemini（1日）**

#### **Step 3.1: Google Maps API**
1. API キー取得
2. Maps JavaScript API の統合
3. Places Autocomplete の実装
4. Geocoding API の統合

#### **Step 3.2: Gemini API**
1. API キー取得
2. Gemini API クライアント実装
3. AI チャット機能実装
4. イベント説明文生成機能

---

## 📝 必要なAPI キー・シークレット一覧

| サービス | キー名 | 取得方法 | 設定場所 |
|---------|-------|---------|---------|
| Stripe | `STRIPE_SECRET_KEY` | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) | Cloudflare Workers Secret |
| Stripe | `STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard | フロントエンド環境変数 |
| Stripe | `STRIPE_WEBHOOK_SECRET` | Stripe Webhooks 設定 | Cloudflare Workers Secret |
| Google OAuth | `GOOGLE_CLIENT_ID` | [Google Cloud Console](https://console.cloud.google.com/) | フロントエンド環境変数 |
| Google OAuth | `GOOGLE_CLIENT_SECRET` | Google Cloud Console | Cloudflare Workers Secret |
| Google Maps | `GOOGLE_MAPS_API_KEY` | Google Cloud Console | フロントエンド環境変数 |
| Gemini | `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) | Cloudflare Workers Secret |

---

## 🔒 セキュリティ考慮事項

### **Stripe**
- ✅ Secret Key はバックエンドのみで使用
- ✅ Publishable Key のみフロントエンドに公開
- ✅ Webhook 署名検証を必須にする
- ✅ Payment Intent の amount を必ずバックエンドで計算

### **Google OAuth**
- ✅ Client Secret はバックエンドのみで使用
- ✅ トークン検証をバックエンドで実行
- ✅ CSRF 保護の実装
- ✅ State パラメータの利用

### **Google Maps**
- ✅ API キーの使用制限設定（ドメイン制限）
- ✅ 請求アラートの設定

### **Gemini API**
- ✅ API キーはバックエンドのみで使用
- ✅ レート制限の実装
- ✅ コスト管理

---

## 💰 コスト見積もり

### **Stripe**
- 決済手数料: 3.6% + ¥0
- 月額費用: ¥0（従量課金）

### **Google Cloud**
- OAuth: 無料
- Maps API: 月 $200 の無料枠
- Gemini API: 月 60 requests/minute まで無料

### **推定月額コスト**
- 初期: ~¥0（無料枠内）
- 成長期: ¥10,000 - ¥50,000/月（決済・Maps API）

---

## 📞 次のアクション

どのPhaseから始めますか？

### **推奨順序:**
1. ✅ **Phase 1: Stripe決済** - 最優先（収益化に必須）
2. ✅ **Phase 2: Google ログイン** - ユーザー体験向上
3. ✅ **Phase 3: Google Maps & Gemini** - 付加価値機能

### **各Phaseの所要時間:**
- Phase 1: 1-2日
- Phase 2: 0.5日
- Phase 3: 1日

**合計: 2.5-3.5日**

---

## 🎯 準備が必要なもの

### **すぐに必要:**
1. Stripe アカウント
2. Google Cloud Platform アカウント

### **後で必要:**
1. 法人情報（Stripe本番申請時）
2. ドメイン所有権の確認
3. ビジネス資料（必要に応じて）

---

どのPhaseから始めましょうか？🚀
