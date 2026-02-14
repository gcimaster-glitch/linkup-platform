# データベース移行0008 適用マニュアル

**対象データベース**: Cloudflare D1 `linkup-db`  
**移行バージョン**: 0008_fix_users_table.sql  
**作成日**: 2026-02-14  
**優先度**: 高（リリース後24時間以内）

---

## 📋 概要

この移行スクリプトは、`users`テーブルにバックエンドAPIとの整合性を保つための新しいカラムを追加します。メール認証機能とユーザープロフィール管理に必要な変更です。

---

## 🎯 追加されるカラム

| カラム名 | 型 | 説明 | デフォルト値 |
|---------|---|------|------------|
| `display_name` | TEXT | ユーザー表示名 | nameカラムの値をコピー |
| `role` | TEXT | ユーザーロール | user_typeカラムの値をコピー |
| `kyc_status` | TEXT | KYC認証ステータス | 'unverified' |
| `email_verified` | INTEGER | メール確認済みフラグ | 0 (未確認) |
| `email_verification_token` | TEXT | メール確認トークン | NULL |
| `email_verification_expires` | TEXT | トークン有効期限 | NULL |

---

## ⚠️ 前提条件

### 1. Cloudflare アカウントアクセス

本番データベースに接続するには、Cloudflareアカウントの認証情報が必要です。

### 2. 必要なツール

- **Wrangler CLI**: バージョン 3.x 以上
- **Cloudflare API Token**: D1データベースへの書き込み権限

---

## 🔐 Cloudflare API Token の取得手順

### ステップ1: Cloudflareダッシュボードにログイン

1. ブラウザで https://dash.cloudflare.com/ にアクセス
2. アカウントにログイン

### ステップ2: API Tokenを作成

1. 右上のプロフィールアイコンをクリック
2. **「My Profile」** を選択
3. 左サイドバーの **「API Tokens」** をクリック
4. **「Create Token」** ボタンをクリック

### ステップ3: トークンテンプレートを選択

1. **「Edit Cloudflare Workers」** テンプレートを選択
2. または **「Create Custom Token」** で以下の権限を設定:
   - **Account Resources**: D1 - Edit
   - **Account Resources**: Workers Scripts - Edit
   - **Zone Resources**: Workers Routes - Edit

### ステップ4: トークンをコピー

1. **「Create Token」** をクリック
2. 表示されたトークンを**必ずコピー**して安全な場所に保存
3. ⚠️ このトークンは再表示できません

---

## 🚀 移行実行手順

### 方法1: 環境変数を使用（推奨）

#### ステップ1: 環境変数を設定

**Linux/Mac:**
```bash
export CLOUDFLARE_API_TOKEN="your_api_token_here"
export CLOUDFLARE_ACCOUNT_ID="your_account_id_here"
```

**Windows (PowerShell):**
```powershell
$env:CLOUDFLARE_API_TOKEN="your_api_token_here"
$env:CLOUDFLARE_ACCOUNT_ID="your_account_id_here"
```

#### ステップ2: 移行を実行

```bash
cd /home/user/webapp/backend
wrangler d1 execute linkup-db --remote --file=../database/migrations/0008_fix_users_table.sql
```

---

### 方法2: Wranglerログインを使用

#### ステップ1: Wranglerにログイン

```bash
cd /home/user/webapp/backend
wrangler login
```

ブラウザが開き、Cloudflareアカウントでの認証が求められます。

#### ステップ2: 移行を実行

```bash
wrangler d1 execute linkup-db --remote --file=../database/migrations/0008_fix_users_table.sql
```

---

### 方法3: Cloudflareダッシュボードから手動実行

API Tokenがない場合、ダッシュボードから直接SQLを実行できます。

#### ステップ1: D1ダッシュボードにアクセス

1. https://dash.cloudflare.com/ にログイン
2. **「Workers & Pages」** → **「D1」** をクリック
3. **「linkup-db」** データベースを選択

#### ステップ2: SQLコンソールを開く

1. **「Console」** タブをクリック
2. SQLエディタが表示されます

#### ステップ3: 移行SQLを貼り付けて実行

ファイル `database/migrations/0008_fix_users_table.sql` の内容を全てコピーして、SQLエディタに貼り付けます:

```sql
-- Migration 0008: Fix users table schema inconsistencies
-- Created: 2026-02-14
-- Purpose: Add missing columns and fix naming inconsistencies

-- Add display_name column (same as name for compatibility)
ALTER TABLE users ADD COLUMN display_name TEXT;
UPDATE users SET display_name = name WHERE display_name IS NULL;

-- Add role column (same as user_type for compatibility)
ALTER TABLE users ADD COLUMN role TEXT;
UPDATE users SET role = user_type WHERE role IS NULL;

-- Add kyc_status column (for KYC verification status)
ALTER TABLE users ADD COLUMN kyc_status TEXT DEFAULT 'unverified' CHECK(kyc_status IN ('unverified', 'pending', 'verified', 'rejected'));
UPDATE users SET kyc_status = 'verified' WHERE verified = 1 AND kyc_status IS NULL;

-- Add email_verified column (boolean for email verification)
ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0;
UPDATE users SET email_verified = verified WHERE email_verified IS NULL;

-- Add email_verification_token column (for email verification)
ALTER TABLE users ADD COLUMN email_verification_token TEXT;

-- Add email_verification_expires column (expiration timestamp)
ALTER TABLE users ADD COLUMN email_verification_expires TEXT;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_kyc_status ON users(kyc_status);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(email_verification_token);

-- Update existing users to have consistent data
UPDATE users SET 
    display_name = COALESCE(display_name, name),
    role = COALESCE(role, user_type),
    kyc_status = COALESCE(kyc_status, CASE WHEN verified = 1 THEN 'verified' ELSE 'unverified' END),
    email_verified = COALESCE(email_verified, verified)
WHERE display_name IS NULL OR role IS NULL OR kyc_status IS NULL OR email_verified IS NULL;
```

#### ステップ4: 実行

**「Execute」** ボタンをクリックして実行します。

---

## ✅ 移行成功の確認

### 方法1: Wrangler CLIで確認

```bash
cd /home/user/webapp/backend

# テーブル構造を確認
wrangler d1 execute linkup-db --remote --command "PRAGMA table_info(users);"

# 新しいカラムが存在することを確認
wrangler d1 execute linkup-db --remote --command "SELECT display_name, role, kyc_status, email_verified FROM users LIMIT 5;"
```

**期待される出力**:
```
display_name | role      | kyc_status  | email_verified
-------------|-----------|-------------|---------------
Admin User   | admin     | verified    | 1
Test Org     | organizer | unverified  | 1
Test User    | attendee  | unverified  | 1
```

### 方法2: Cloudflareダッシュボードで確認

1. D1ダッシュボードの **「Console」** タブで以下を実行:
   ```sql
   PRAGMA table_info(users);
   ```

2. 以下のカラムが存在することを確認:
   - `display_name`
   - `role`
   - `kyc_status`
   - `email_verified`
   - `email_verification_token`
   - `email_verification_expires`

### 方法3: バックエンドAPIで確認

```bash
# /me エンドポイントをテスト（ログイン後）
curl -X GET https://linkup-backend.gcimaster.workers.dev/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**期待される出力**:
```json
{
  "success": true,
  "user": {
    "user_id": "u-1234567890",
    "display_name": "Test User",
    "email": "test@example.com",
    "role": "attendee",
    "avatar_url": "https://...",
    "kycStatus": "unverified",
    "emailVerified": 1
  }
}
```

---

## 🔄 ロールバック手順（緊急時）

万が一、移行に問題が発生した場合のロールバック手順です。

### ⚠️ 警告

ロールバックは既存データに影響を与えます。実行前に必ずバックアップを確認してください。

### ロールバックSQL

```sql
-- 追加したカラムを削除
ALTER TABLE users DROP COLUMN display_name;
ALTER TABLE users DROP COLUMN role;
ALTER TABLE users DROP COLUMN kyc_status;
ALTER TABLE users DROP COLUMN email_verified;
ALTER TABLE users DROP COLUMN email_verification_token;
ALTER TABLE users DROP COLUMN email_verification_expires;

-- 追加したインデックスを削除
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_users_kyc_status;
DROP INDEX IF EXISTS idx_users_email_verified;
DROP INDEX IF EXISTS idx_users_verification_token;
```

### 実行方法

```bash
cd /home/user/webapp/backend

# ロールバックSQLを実行
wrangler d1 execute linkup-db --remote --command "ALTER TABLE users DROP COLUMN display_name; ALTER TABLE users DROP COLUMN role; ALTER TABLE users DROP COLUMN kyc_status; ALTER TABLE users DROP COLUMN email_verified; ALTER TABLE users DROP COLUMN email_verification_token; ALTER TABLE users DROP COLUMN email_verification_expires;"
```

---

## 📊 移行による影響

### 既存ユーザーへの影響

- ✅ **既存データは保持**: すべての既存ユーザーデータは維持されます
- ✅ **自動データ移行**: `display_name`と`role`は既存のカラムから自動コピー
- ✅ **後方互換性**: 既存のAPIエンドポイントは引き続き動作
- ⚠️ **ログイン再要求**: 一部のユーザーは再ログインが必要な場合があります

### 新機能の有効化

移行完了後、以下の機能が完全に有効化されます:

1. **メール確認フロー**: 新規登録時のメール確認（Resend統合）
2. **ユーザープロフィール**: display_nameによる表示名管理
3. **RBAC強化**: roleカラムによる権限管理
4. **KYC認証**: kyc_statusによる本人確認ステータス管理

---

## 🛡️ セキュリティ考慮事項

### API Token の管理

- ✅ **API Tokenは機密情報**: 絶対に公開リポジトリにコミットしない
- ✅ **環境変数で管理**: `.env`ファイルや環境変数に保存
- ✅ **定期的なローテーション**: 3ヶ月ごとにトークンを再発行
- ✅ **最小権限の原則**: 必要最小限の権限のみ付与

### バックアップ推奨

移行前に以下のバックアップを推奨します:

```bash
# ユーザーデータのエクスポート
wrangler d1 execute linkup-db --remote --command "SELECT * FROM users;" > users_backup_$(date +%Y%m%d).sql
```

---

## 📞 サポート・トラブルシューティング

### よくあるエラー

#### エラー1: "In a non-interactive environment, it's necessary to set a CLOUDFLARE_API_TOKEN"

**原因**: API Tokenが設定されていない  
**解決策**: 
```bash
export CLOUDFLARE_API_TOKEN="your_token_here"
export CLOUDFLARE_ACCOUNT_ID="your_account_id"
```

#### エラー2: "Database not found: linkup-db"

**原因**: データベース名が間違っているか、アカウントが異なる  
**解決策**:
1. Cloudflareダッシュボードでデータベース名を確認
2. `wrangler.toml`のdatabase_nameを確認

#### エラー3: "Duplicate column name"

**原因**: 既にカラムが存在している（移行済み）  
**解決策**: 移行は既に完了しています。確認手順で検証してください。

#### エラー4: "Permission denied"

**原因**: API Tokenに必要な権限がない  
**解決策**: D1への書き込み権限を持つAPI Tokenを再作成

---

## 📝 チェックリスト

移行実行前に以下を確認してください:

- [ ] Cloudflare API Tokenを取得済み
- [ ] Wrangler CLIがインストール済み（バージョン3.x以上）
- [ ] 移行SQLファイルが存在する (`database/migrations/0008_fix_users_table.sql`)
- [ ] データベース名が正しい (`linkup-db`)
- [ ] 本番環境への影響を理解している
- [ ] バックアップが取得済み（推奨）

移行実行後:

- [ ] 移行成功を確認（PRAGMA table_info確認）
- [ ] 新しいカラムにデータが存在することを確認
- [ ] バックエンドAPIが正常動作することを確認（/me エンドポイント）
- [ ] フロントエンドからのログインが正常に動作することを確認
- [ ] メール確認フローが動作することを確認（新規登録テスト）

---

## 🎯 次のステップ

移行完了後、以下の機能を有効化・テストしてください:

1. **新規ユーザー登録**: メール確認フローのテスト
2. **プロフィール更新**: display_nameの更新テスト
3. **RBAC確認**: 管理者・主催者・一般ユーザーの権限テスト
4. **KYC認証**: （将来実装）KYCステータス更新フローの準備

---

## 📚 関連ドキュメント

- [PRE_RELEASE_COMPREHENSIVE_AUDIT_REPORT.md](./PRE_RELEASE_COMPREHENSIVE_AUDIT_REPORT.md) - 総合監査報告書
- [AUTH_SECURITY_PLAN.md](./AUTH_SECURITY_PLAN.md) - 認証セキュリティ計画
- [TEST_USERS.md](./TEST_USERS.md) - テストユーザー情報
- [database/migrations/0008_fix_users_table.sql](./database/migrations/0008_fix_users_table.sql) - 移行SQLスクリプト

---

**作成日**: 2026-02-14  
**最終更新**: 2026-02-14  
**バージョン**: 1.0.0  
**作成者**: LinkUp開発チーム
