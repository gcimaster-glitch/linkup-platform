# 🚨 緊急修正: ログイン失敗の原因と解決方法

## 🔍 問題の詳細

### 症状
- トーストは表示される（「ログイン中...」）
- しかし実際にはログインできない
- 401 Unauthorized エラー

### 根本原因
**デモユーザーのパスワードハッシュが無効！**

```sql
-- ❌ 現在のハッシュ（無効）
$2a$10$X7.G.6.G.6.G.6.G.6.G.6.G.6.G.6.G.6.G.6.G.6

-- ✅ 正しいハッシュ
$2b$10$YAZ8V9HcAeL5elpvk6av5uspTwT85Kpyfm2b2WmrFL5Qi.vt.HY9i
```

---

## ✅ 即時解決策

### 方法1: SQLを実行してパスワードを修正（推奨）

**Cloudflare Dashboardから**:
1. Cloudflare Dashboard にログイン
2. D1 Database → `linkup-db` を選択
3. Console タブを開く
4. 以下のSQLをコピー&ペーストして実行:

```sql
-- organizer@demo.com のパスワードを修正
UPDATE users 
SET password_hash = '$2b$10$YAZ8V9HcAeL5elpvk6av5uspTwT85Kpyfm2b2WmrFL5Qi.vt.HY9i'
WHERE email = 'organizer@demo.com';

-- user@demo.com のパスワードを修正
UPDATE users 
SET password_hash = '$2b$10$YAZ8V9HcAeL5elpvk6av5uspTwT85Kpyfm2b2WmrFL5Qi.vt.HY9i'
WHERE email = 'user@demo.com';
```

5. 実行完了後、ログインを試す

**または wrangler CLIから**:
```bash
wrangler d1 execute linkup-db --file=database/fix_demo_users.sql
```

### 方法2: 新規アカウントを登録（即時）

1. https://link-up.live/ にアクセス
2. 「ログイン」→「新規登録」タブ
3. フォーム入力:
   - 名前: 任意
   - メール: あなたのメールアドレス
   - パスワード: 8文字以上
   - 種別: 主催者 or 参加者
4. 確認メールのリンクをクリック
5. ログイン

---

## 🔧 技術的詳細

### 検証コマンド

**現在のハッシュをテスト**:
```bash
node -e "
const bcrypt = require('bcryptjs');
bcrypt.compare('demo', '\$2a\$10\$X7.G.6.G.6.G.6.G.6.G.6.G.6.G.6.G.6.G.6.G.6').then(result => {
  console.log('Valid:', result); // false
});
"
```

**正しいハッシュをテスト**:
```bash
node -e "
const bcrypt = require('bcryptjs');
bcrypt.compare('demo', '\$2b\$10\$YAZ8V9HcAeL5elpvk6av5uspTwT85Kpyfm2b2WmrFL5Qi.vt.HY9i').then(result => {
  console.log('Valid:', result); // true
});
"
```

### ログイン動作の確認

**APIテスト**:
```bash
# ❌ 修正前（401エラー）
curl -X POST https://linkup-backend.gcimaster.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"organizer@demo.com","password":"demo"}'
# Response: {"error":"Invalid credentials"}

# ✅ 修正後（200 OK）
# Response: {"success":true,"token":"eyJ...","user":{...}}
```

---

## 📊 影響範囲

### 影響を受けるアカウント

| Email | Password | Status | Fix |
|-------|----------|--------|-----|
| organizer@demo.com | demo | ❌ 無効ハッシュ | ✅ SQL実行 |
| user@demo.com | demo | ❌ 無効ハッシュ | ✅ SQL実行 |
| user@example.com | password123 | ❓ 存在しない | ✅ SQL実行 |
| その他のユーザー | - | ✅ 正常 | - |

---

## 🎯 推奨アクション

### 即時（ユーザー向け）
1. **新規登録を使う**（最も簡単）
   - 数分で完了
   - 確実に動作
   
### 短期（管理者向け）
2. **SQLでデモユーザーを修正**
   - `database/fix_demo_users.sql` を実行
   - 既存のテストユーザーが使えるようになる

### 長期（開発チーム向け）
3. **シードデータを修正**
   - `database/seed.sql` のハッシュを更新
   - 次回デプロイで自動修正

---

## 📝 修正されたアカウント情報

**SQL実行後に使用可能**:

```
✅ 主催者アカウント
Email: organizer@demo.com
Password: demo

✅ 参加者アカウント
Email: user@demo.com
Password: demo

✅ テストアカウント
Email: user@example.com
Password: password123
```

---

## 🔍 デバッグ方法

### ログインできない場合のチェックリスト

1. **ブラウザのコンソールを確認**
   - F12 → Console タブ
   - "Login error:" で検索

2. **ネットワークタブを確認**
   - F12 → Network タブ
   - `/api/auth/login` のレスポンスを確認
   - Status: 401 = パスワード誤り
   - Status: 500 = サーバーエラー

3. **データベースでハッシュを確認**
```bash
wrangler d1 execute linkup-db --command="
SELECT email, SUBSTR(password_hash, 1, 20) || '...' as hash 
FROM users 
WHERE email='organizer@demo.com';
"
```

4. **バックエンドログを確認**
   - Cloudflare Dashboard → Workers → linkup-backend → Logs

---

## 📞 サポート

### ドキュメント
- **この修正ガイド**: `database/URGENT_LOGIN_FIX.md`
- **SQLスクリプト**: `database/fix_demo_users.sql`
- **詳細分析**: `LOGIN_RESOLUTION_REPORT.md`

### 連絡先
- GitHub Issues: https://github.com/gcimaster-glitch/linkup-platform/issues

---

## ✨ まとめ

### 問題
❌ デモユーザーのbcryptハッシュが無効
❌ `organizer@demo.com` / `demo` でログインできない

### 解決策
✅ SQLでパスワードハッシュを更新
✅ または新規アカウント登録

### 所要時間
- SQL実行: 1分
- 新規登録: 3分

---

**作成**: 2026-02-12  
**優先度**: 🔴 緊急  
**ステータス**: 修正準備完了
