# 📊 データベース移行ガイド

## 概要
現在、2つのデータベース移行が未適用の状態です：
- **移行0008**: usersテーブルのスキーマ修正
- **移行0009**: ticket_transfersテーブル追加（チケット譲渡機能）

## 重要な注意事項

⚠️ **現在のアプリケーションはフォールバック処理により正常動作しています**

```typescript
// backend/src/routes/auth.ts の登録処理
try {
    // 移行0008後のカラムで挿入を試行
    await db.prepare(
        `INSERT INTO users (
            user_id, email, password_hash, name, display_name, 
            user_type, role, avatar_url, 
            kyc_status, email_verified, 
            email_verification_token, email_verification_expires,
            created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    ).bind(...).run();
} catch (insertError) {
    // フォールバック: 基本カラムのみで挿入（移行前対応）
    await db.prepare(
        'INSERT INTO users (user_id, email, password_hash, name, user_type, avatar_url, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, datetime(\'now\'))'
    ).bind(...).run();
}
```

## 移行0008の詳細

### 追加されるカラム
```sql
ALTER TABLE users ADD COLUMN display_name TEXT;
ALTER TABLE users ADD COLUMN role TEXT;
ALTER TABLE users ADD COLUMN kyc_status TEXT DEFAULT 'unverified';
ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN email_verification_token TEXT;
ALTER TABLE users ADD COLUMN email_verification_expires TEXT;
```

### データ移行処理
```sql
-- 既存データの更新
UPDATE users SET display_name = name WHERE display_name IS NULL;
UPDATE users SET role = user_type WHERE role IS NULL;
UPDATE users SET kyc_status = CASE WHEN verified = 1 THEN 'verified' ELSE 'unverified' END;
UPDATE users SET email_verified = verified WHERE email_verified = 0;
```

### インデックス作成
```sql
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_kyc_status ON users(kyc_status);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON users(email_verification_token);
```

## 移行0009の詳細

### 新しいテーブル: ticket_transfers
```sql
CREATE TABLE IF NOT EXISTS ticket_transfers (
    transfer_id TEXT PRIMARY KEY,
    order_ticket_id TEXT NOT NULL,
    from_user_id TEXT NOT NULL,
    to_user_id TEXT,
    transfer_code TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL,
    accepted_at TEXT,
    FOREIGN KEY (from_user_id) REFERENCES users(user_id),
    FOREIGN KEY (to_user_id) REFERENCES users(user_id)
);
```

### order_ticketsテーブルへのカラム追加
```sql
ALTER TABLE order_tickets ADD COLUMN is_transferred INTEGER DEFAULT 0;
ALTER TABLE order_tickets ADD COLUMN transferred_from TEXT;
ALTER TABLE order_tickets ADD COLUMN transferred_to TEXT;
ALTER TABLE order_tickets ADD COLUMN transfer_date TEXT;
```

## 適用手順

### 前提条件
✅ Cloudflare API Tokenが必要
✅ wranglerがインストール済み
✅ D1データベースへのアクセス権限

### 手順1: 移行0008の適用

```bash
cd /home/user/webapp/backend

# 移行スクリプトを確認
cat ../database/migrations/0008_fix_users_table.sql

# 本番DBに適用
wrangler d1 execute linkup-db --remote --file=../database/migrations/0008_fix_users_table.sql

# 適用確認
wrangler d1 execute linkup-db --remote --command="PRAGMA table_info(users);"
```

**期待される出力:**
```
新しいカラムが追加されていることを確認:
- display_name
- role
- kyc_status
- email_verified
- email_verification_token
- email_verification_expires
```

### 手順2: 移行0009の適用

```bash
# 移行スクリプトを確認
cat ../database/migrations/0009_add_ticket_transfers.sql

# 本番DBに適用
wrangler d1 execute linkup-db --remote --file=../database/migrations/0009_add_ticket_transfers.sql

# 適用確認
wrangler d1 execute linkup-db --remote --command="SELECT name FROM sqlite_master WHERE type='table' AND name='ticket_transfers';"
```

**期待される出力:**
```
ticket_transfers テーブルが存在することを確認
```

### 手順3: データ整合性確認

```bash
# usersテーブルのデータ確認
wrangler d1 execute linkup-db --remote --command="SELECT user_id, email, display_name, role, kyc_status, email_verified FROM users LIMIT 5;"

# ticket_transfersテーブルが空であることを確認
wrangler d1 execute linkup-db --remote --command="SELECT COUNT(*) as count FROM ticket_transfers;"
```

## トラブルシューティング

### エラー: "duplicate column name"
**原因**: カラムが既に存在する  
**対応**: スキップして次の移行へ進む（問題なし）

### エラー: "table ticket_transfers already exists"
**原因**: テーブルが既に存在する  
**対応**: スキップ（問題なし）

### エラー: "CLOUDFLARE_API_TOKEN environment variable is required"
**対応**:
```bash
export CLOUDFLARE_API_TOKEN="your-actual-token-here"
```

### エラー: "no such table: order_tickets"
**原因**: order_ticketsテーブルが存在しない  
**対応**: 
```bash
# order_ticketsテーブルを作成するマイグレーションを先に実行
wrangler d1 execute linkup-db --remote --file=../database/migrations/0001_create_order_tickets.sql
```

## ロールバック手順

### 移行0008のロールバック
```sql
-- カラムを削除（SQLiteではALTER TABLE DROP COLUMNが制限されているため、テーブル再作成が必要）
-- 注意: 本番環境では慎重に実施

-- バックアップ
CREATE TABLE users_backup AS SELECT * FROM users;

-- 元のスキーマでテーブル再作成
DROP TABLE users;
CREATE TABLE users (
    user_id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    user_type TEXT DEFAULT 'attendee',
    avatar_url TEXT,
    verified INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

-- データを戻す
INSERT INTO users SELECT user_id, email, password_hash, name, user_type, avatar_url, verified, created_at FROM users_backup;

-- バックアップテーブルを削除
DROP TABLE users_backup;
```

### 移行0009のロールバック
```sql
-- ticket_transfersテーブルを削除
DROP TABLE IF EXISTS ticket_transfers;

-- order_ticketsから追加カラムを削除（テーブル再作成が必要）
-- バックアップ、再作成、データ復元の手順は移行0008と同様
```

## 移行後の確認事項

### ✅ チェックリスト

1. **usersテーブル**
   - [ ] 新しいカラムが追加されている
   - [ ] 既存データのdisplay_nameが設定されている
   - [ ] 既存データのroleが設定されている
   - [ ] 既存データのkyc_statusが設定されている
   - [ ] インデックスが作成されている

2. **ticket_transfersテーブル**
   - [ ] テーブルが作成されている
   - [ ] 外部キー制約が設定されている
   - [ ] インデックスが作成されている

3. **order_ticketsテーブル**
   - [ ] 新しいカラムが追加されている
   - [ ] デフォルト値が設定されている

4. **アプリケーション動作**
   - [ ] 新規ユーザー登録が正常に動作
   - [ ] ログインが正常に動作
   - [ ] プロフィール更新が正常に動作
   - [ ] チケット購入が正常に動作

## タイミング

### 推奨適用時期
- **移行0008**: バックエンドデプロイ後、できるだけ早く（24時間以内）
- **移行0009**: チケット譲渡機能のフロントエンドUI実装前（1週間以内）

### 影響
- **ダウンタイム**: なし（フォールバック処理により継続動作）
- **パフォーマンス**: 若干の改善（インデックス追加により）
- **機能追加**: チケット譲渡機能が使用可能に

---

**作成日時**: 2026-02-14 14:07 JST  
**優先度**: 中（フォールバックにより緊急性は低い）  
**推定所要時間**: 30分
