# 🚀 LAMP式多ページ化：実装計画

## 📅 **実装スケジュール（5日間）**

### **Day 1-2: 基盤構築**
- [x] PHPプロジェクト構造作成
- [ ] 共通モジュール（ヘッダー・フッター・認証）
- [ ] セッション管理システム
- [ ] ログイン・サインアップページ

### **Day 3: コアページ**
- [ ] ダッシュボード（メイン）
- [ ] チケット管理ページ
- [ ] 決済履歴ページ
- [ ] プロフィールページ

### **Day 4: 追加機能**
- [ ] イベント一覧・詳細ページ
- [ ] 主催者ダッシュボード
- [ ] イベント作成・編集

### **Day 5: テスト・デプロイ**
- [ ] 全ページ動作確認
- [ ] エラーハンドリング強化
- [ ] 本番デプロイ
- [ ] 最終検証

---

## 🏗️ **プロジェクト構造**

```
webapp/
├── index.html              # 既存SPA（削除しない、後方互換用）
├── php/                    # 新規：PHP多ページアプリ
│   ├── config/
│   │   ├── database.php   # DB接続設定
│   │   └── api.php        # バックエンドAPI設定
│   ├── includes/
│   │   ├── header.php     # 共通ヘッダー
│   │   ├── footer.php     # 共通フッター
│   │   ├── auth.php       # 認証関数
│   │   └── functions.php  # ユーティリティ関数
│   ├── pages/
│   │   ├── index.php      # トップページ
│   │   ├── login.php      # ログイン
│   │   ├── signup.php     # サインアップ
│   │   ├── dashboard/
│   │   │   ├── index.php       # ダッシュボード
│   │   │   ├── tickets.php     # チケット管理
│   │   │   ├── payments.php    # 決済履歴
│   │   │   └── profile.php     # プロフィール
│   │   ├── events/
│   │   │   ├── index.php       # イベント一覧
│   │   │   └── detail.php      # イベント詳細
│   │   └── organizer/
│   │       ├── index.php       # 主催者ダッシュボード
│   │       └── events.php      # イベント管理
│   └── assets/
│       ├── css/
│       │   └── style.css       # 共通CSS
│       └── js/
│           └── main.js         # 共通JavaScript
├── backend/                # 既存バックエンド（変更なし）
└── _redirects              # Cloudflare Pages用リダイレクト設定
```

---

## 🎯 **技術仕様**

### **フロントエンド**
- **言語**: PHP 8.x
- **CSS**: Tailwind CSS（CDN）
- **JavaScript**: Vanilla JS（最小限）

### **バックエンド**
- **既存API**: Cloudflare Workers（変更なし）
- **認証**: セッションベース（PHP session）
- **トークン管理**: セッション変数に保存

### **デプロイ**
- **プラットフォーム**: Cloudflare Pages
- **PHP実行**: Cloudflare Pages Functions（PHP対応）
- **URL構造**:
  - `/` → トップページ
  - `/login` → ログイン
  - `/dashboard` → ダッシュボード
  - `/dashboard/tickets` → チケット管理
  - `/events` → イベント一覧

---

## 🔐 **認証フロー（セッションベース）**

```php
// セッション開始
session_start();

// ログイン処理
if (login_success) {
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_role'] = $user['role'];
    $_SESSION['token'] = $backend_token;
}

// 認証チェック
function require_auth() {
    if (!isset($_SESSION['user_id'])) {
        header('Location: /login');
        exit;
    }
}

// API呼び出し
function api_call($endpoint, $method = 'GET', $data = null) {
    $token = $_SESSION['token'] ?? '';
    // curlでバックエンドAPI呼び出し
}
```

---

## 📊 **既存SPAとの比較**

| 項目 | 既存SPA | 新LAMP式 |
|------|---------|----------|
| **ファイル数** | 1ファイル（20,000行） | 約20ファイル（各100-300行） |
| **エラー影響** | 全体停止 | ページ単位で隔離 |
| **デバッグ** | 困難 | 容易 |
| **認証** | localStorage（問題あり） | セッション（安全） |
| **SEO** | 弱い | 強い |
| **初期読み込み** | 1.3MB | 各ページ50-100KB |

---

## 🚨 **移行戦略**

### **段階的移行（ゼロダウンタイム）**

1. **既存SPAを残す**
   - `index.html` はそのまま維持
   - 新PHPページを `/php/` 配下に作成

2. **リダイレクト設定**
   - `/login` → `/php/pages/login.php`
   - `/dashboard` → `/php/pages/dashboard/index.php`
   - その他ページも同様

3. **段階的切り替え**
   - Day 1-2: ログイン・認証
   - Day 3: ダッシュボード系
   - Day 4: イベント系
   - Day 5: 全体切り替え

4. **後方互換性**
   - 旧URLでアクセスしたユーザーも新ページへ自動リダイレクト

---

## ✅ **実装チェックリスト**

### **Day 1-2: 基盤（2日間）**
- [ ] PHPプロジェクト構造作成
- [ ] `config/database.php` - DB接続設定
- [ ] `config/api.php` - バックエンドAPI設定
- [ ] `includes/header.php` - 共通ヘッダー
- [ ] `includes/footer.php` - 共通フッター
- [ ] `includes/auth.php` - 認証関数
- [ ] `includes/functions.php` - ユーティリティ
- [ ] `pages/login.php` - ログインページ
- [ ] `pages/signup.php` - サインアップページ
- [ ] セッション管理テスト

### **Day 3: ダッシュボード（1日）**
- [ ] `pages/dashboard/index.php` - ダッシュボードメイン
- [ ] `pages/dashboard/tickets.php` - チケット管理
- [ ] `pages/dashboard/payments.php` - 決済履歴
- [ ] `pages/dashboard/profile.php` - プロフィール
- [ ] 空状態UI実装
- [ ] エラー状態UI実装

### **Day 4: イベント・主催者（1日）**
- [ ] `pages/index.php` - トップページ
- [ ] `pages/events/index.php` - イベント一覧
- [ ] `pages/events/detail.php` - イベント詳細
- [ ] `pages/organizer/index.php` - 主催者ダッシュボード
- [ ] `pages/organizer/events.php` - イベント管理

### **Day 5: テスト・デプロイ（1日）**
- [ ] 全ページ動作確認
- [ ] エラーハンドリング強化
- [ ] セキュリティチェック
- [ ] パフォーマンス最適化
- [ ] Cloudflare Pages デプロイ
- [ ] 本番環境テスト
- [ ] DNS切り替え（必要に応じて）

---

## 🎯 **成功の定義**

1. ✅ 全ページがエラーなく表示される
2. ✅ ログイン・ログアウトが正常動作
3. ✅ ダッシュボードが白画面にならない
4. ✅ チケット・決済履歴が表示される（空状態含む）
5. ✅ プロフィール編集が保存される
6. ✅ イベント一覧・詳細が表示される
7. ✅ 主催者機能が動作する
8. ✅ 既存ユーザーがログインできる

---

## 📝 **備考**

- Cloudflare Pages は PHP をネイティブサポートしていないため、Cloudflare Pages Functions を使用
- 必要に応じて、Cloudflare Workers で PHP を実行する構成も検討
- データベースは既存の Cloudflare D1 を使用（バックエンドAPI経由）

---

**作成日**: 2026-02-15  
**予定完了日**: 2026-02-20（5日後）  
**担当**: AI Assistant
