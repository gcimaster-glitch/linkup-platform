# 🚀 LinkUp ログイン有効化 - 簡単3ステップ

## 現在の状況

✅ **フロントエンド修正完了**  
⏳ **データベース更新が必要**（5分で完了）

---

## 📋 3ステップで完了

### ステップ1️⃣: Cloudflare Dashboard にログイン

1. https://dash.cloudflare.com/ にアクセス
2. Cloudflareアカウントでログイン

### ステップ2️⃣: D1 Database を開く

1. 左メニューから **Workers & Pages** をクリック
2. **D1 SQL Database** をクリック
3. データベース一覧から **`linkup-db`** を選択
4. **Console** タブをクリック

### ステップ3️⃣: SQLを実行

以下のSQLをコピーして、コンソールに貼り付けて **Execute** をクリック：

```sql
-- デモユーザーのパスワードを 'demo' に設定
UPDATE users 
SET password_hash = '$2b$10$YAZ8V9HcAeL5elpvk6av5uspTwT85Kpyfm2b2WmrFL5Qi.vt.HY9i'
WHERE email = 'organizer@demo.com';

UPDATE users 
SET password_hash = '$2b$10$YAZ8V9HcAeL5elpvk6av5uspTwT85Kpyfm2b2WmrFL5Qi.vt.HY9i'
WHERE email = 'user@demo.com';

-- 確認
SELECT email, name, role FROM users WHERE email IN ('organizer@demo.com', 'user@demo.com');
```

✅ **成功メッセージ**: `2 rows affected` と表示されれば完了！

---

## 🎉 完了後のログイン方法

### 主催者アカウント
```
URL: https://link-up.live/
Email: organizer@demo.com
Password: demo
```

### 参加者アカウント
```
URL: https://link-up.live/
Email: user@demo.com
Password: demo
```

---

## 📱 ログイン後の動作

### デスクトップ
1. ログインボタンをクリック
2. メールアドレスとパスワードを入力
3. 「ログイン」をクリック
4. ✅ 成功メッセージ表示
5. 主催者ダッシュボードに自動遷移（主催者の場合）

### モバイル
1. 画面右上の「ログイン」をタップ
2. メールアドレスとパスワードを入力
3. 「ログイン」をタップ
4. ✅ 成功メッセージ表示
5. ボトムナビゲーション正常表示

---

## 🔍 トラブルシューティング

### ❓ SQL実行がエラーになる

**エラー**: `no such table: users`  
**解決**: スキーマが未作成です。`database/schema.sql` を先に実行してください。

**エラー**: `no such column: password_hash`  
**解決**: カラム名が異なります。以下を実行：
```sql
PRAGMA table_info(users);
```

### ❓ ログインしてもエラーが出る

**F12キーを押して Console を確認**：

```javascript
// 成功時のログ
🔐 Login attempt: organizer@demo.com
🔐 Login result: {success: true, token: "eyJ...", user: {...}}
👤 User stored: {id: "...", name: "LinkUp Official", ...}

// エラー時のログ
🔐 Login result: {success: false, error: "Invalid credentials"}
```

**エラーが出る場合**: SQLが正しく実行されていません。もう一度実行してください。

### ❓ モバイルでメニューがズレる

**解決**: ブラウザキャッシュをクリア
- Chrome: 設定 → プライバシーとセキュリティ → 閲覧履歴データの削除
- Safari: 設定 → Safari → 履歴とWebサイトデータを消去

---

## ✨ 追加アカウントの作成（オプション）

独自のアカウントを作成したい場合：

### user@example.com を追加

```sql
INSERT OR REPLACE INTO users (
    user_id, 
    email, 
    password_hash, 
    name, 
    role, 
    avatar_url, 
    kyc_status, 
    verified,
    created_at,
    updated_at
) VALUES (
    'u-test-example-001',
    'user@example.com',
    '$2b$10$e94sMsf11HWQFYDZxma1buVUc0jG6kwy.wK./V6WmUHEtEiHa2CPC',
    'Test User',
    'organizer',
    'https://ui-avatars.com/api/?name=Test+User&background=2563EB&color=fff',
    'unverified',
    1,
    datetime('now'),
    datetime('now')
);
```

ログイン情報:
```
Email: user@example.com
Password: password123
```

---

## 📞 サポート

### ドキュメント
- **このガイド**: `QUICK_START_LOGIN.md`
- **詳細技術分析**: `LOGIN_COMPLETE_FIX_REPORT.md`
- **緊急修正ガイド**: `database/URGENT_LOGIN_FIX.md`

### 問題が解決しない場合
- GitHub Issues: https://github.com/gcimaster-glitch/linkup-platform/issues
- SQLファイル: `database/fix_demo_users.sql`

---

## 🎯 チェックリスト

- [ ] Cloudflare Dashboard にログイン
- [ ] D1 Database → linkup-db → Console を開く
- [ ] SQLをコピー&ペースト
- [ ] Execute をクリック
- [ ] `2 rows affected` を確認
- [ ] https://link-up.live/ にアクセス
- [ ] `organizer@demo.com` / `demo` でログイン
- [ ] ✅ ログイン成功！

---

**所要時間**: 5分  
**難易度**: ⭐☆☆☆☆（簡単）  
**最終更新**: 2026-02-12

---

## 🎊 完了後

### ログイン成功後にできること

#### 主催者（organizer@demo.com）
- ✅ イベント作成・編集・削除
- ✅ チケット販売管理
- ✅ 座席管理
- ✅ 参加者管理
- ✅ 入場受付
- ✅ 売上分析ダッシュボード
- ✅ 入出金管理

#### 参加者（user@demo.com）
- ✅ イベント検索・閲覧
- ✅ チケット購入
- ✅ 座席選択
- ✅ マイページ
- ✅ 購入履歴

---

**🚀 さあ、LinkUpを始めましょう！**
