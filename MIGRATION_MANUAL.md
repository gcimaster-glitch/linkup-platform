# 📋 マイグレーション手動実行ガイド

## 🎯 目的
テストユーザー（管理者・オーガナイザー・一般ユーザー）をCloudflare D1データベースに登録します。

---

## 📍 実行場所
**Cloudflare Dashboard Console**
https://dash.cloudflare.com/ → Workers & Pages → D1 SQL Database → linkup-db → Console

---

## 📝 実行手順

### ステップ1: 管理者ユーザー作成
```sql
INSERT INTO users (user_id, email, password_hash, display_name, role, kyc_status, icon_url, created_at) 
VALUES ('u-admin-main-001', 'admin@linkup.live', '$2b$10$Mb.KR4l9x9RT3A.g8j3BX.YsavWYa4a5/XcD9UbzQvL7jn9bXhswO', 'LinkUp 管理者', 'admin', 'verified', 'https://ui-avatars.com/api/?name=Admin&background=DC2626&color=fff', datetime('now'));
```

### ステップ2: オーガナイザーユーザー作成
```sql
INSERT INTO users (user_id, email, password_hash, display_name, role, kyc_status, icon_url, created_at) 
VALUES ('u-organizer-main-001', 'organizer@linkup.live', '$2b$10$6VauxbSlpDPKHHDthU6Qa.K1Y2glUdrlKxAQkxJANBOE88WPZOlYO', 'テストイベント主催者', 'organizer', 'verified', 'https://ui-avatars.com/api/?name=Organizer&background=2563EB&color=fff', datetime('now'));
```

### ステップ3: 一般ユーザー作成
```sql
INSERT INTO users (user_id, email, password_hash, display_name, role, kyc_status, icon_url, created_at) 
VALUES ('u-user-main-001', 'user@linkup.live', '$2b$10$gfNMVDIyPBgCpLgsHMcJVe63975OIwfnhJuoguK8NWSTq8fS.QuOu', '一般テストユーザー', 'user', 'verified', 'https://ui-avatars.com/api/?name=User&background=10B981&color=fff', datetime('now'));
```

### ステップ4: 既存ユーザー更新
```sql
UPDATE users SET role = 'user', kyc_status = 'verified' WHERE email = 'iwama@inre.co.jp';
```

### ステップ5: オーガナイザープロフィール作成
```sql
INSERT OR IGNORE INTO organizer_profiles (organizer_id, user_id, name, description, icon_url, created_at) 
VALUES ('org-main-001', 'u-organizer-main-001', 'テストイベント主催者', 'LinkUpプラットフォームのテスト用主催者アカウントです。', 'https://ui-avatars.com/api/?name=Organizer&background=2563EB&color=fff', datetime('now'));
```

### ステップ6: 確認クエリ
```sql
SELECT user_id, email, display_name, role, kyc_status FROM users 
WHERE email IN ('admin@linkup.live', 'organizer@linkup.live', 'user@linkup.live', 'iwama@inre.co.jp') 
ORDER BY role DESC;
```

**期待される結果**: 4行表示される

---

## 🔐 テストユーザーアカウント

| Role | Email | Password |
|------|-------|----------|
| 管理者 | admin@linkup.live | Admin@2026! |
| オーガナイザー | organizer@linkup.live | Organizer@2026! |
| 一般ユーザー | user@linkup.live | User@2026! |
| 既存ユーザー | iwama@inre.co.jp | (既存パスワード) |

---

## ✅ テスト手順

### 1. 管理者テスト
- https://link-up.live/ にアクセス
- `admin@linkup.live` / `Admin@2026!` でログイン
- ヘッダーに「管理者」「主催者」「イベント作成」ボタンが表示されることを確認

### 2. オーガナイザーテスト
- `organizer@linkup.live` / `Organizer@2026!` でログイン
- ヘッダーに「主催者」「イベント作成」ボタンのみ表示されることを確認
- 管理者ボタンは表示されない

### 3. 一般ユーザーテスト
- `user@linkup.live` / `User@2026!` でログイン
- ヘッダーに特別なボタンなし

---

**作成日**: 2026-02-14
**バージョン**: v4.0.0-RBAC-SECURITY
