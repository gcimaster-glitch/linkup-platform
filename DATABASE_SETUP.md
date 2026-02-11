# 🗄️ LinkUp Production Database Setup Guide

## 目的
本番環境のD1データベースにスキーマとシードデータを投入する手順書

---

## ⚠️ 重要事項

**Cloudflare API Tokenの権限不足のため、wranglerコマンドでの自動実行ができません。**  
**Cloudflare Dashboardから手動で実行する必要があります。**

---

## 📋 **手順**

### **Step 1: Cloudflare Dashboardにアクセス**

1. https://dash.cloudflare.com/ にログイン
2. 左サイドバーから **Workers & Pages** を選択
3. **D1** タブをクリック
4. データベース **linkup-db** をクリック

---

### **Step 2: スキーマの投入**

1. **Console** タブを開く
2. `/home/user/webapp/database/schema.sql` の内容を **全てコピー**
3. Consoleの **SQL Editor** に貼り付け
4. **Execute** ボタンをクリック

**期待される結果:**
```
✅ 34 commands executed successfully
```

**作成されるテーブル:**
- users (ユーザー)
- venues (会場)
- events (イベント)
- tickets (チケット)
- orders (注文)
- checkins (チェックイン)
- reservations (座席予約)
- category_images (カテゴリ画像)
- admin_settings (管理設定)
- audit_log (監査ログ)

---

### **Step 3: シードデータの投入**

1. 同じConsole画面で、`/home/user/webapp/database/seed.sql` の内容を **全てコピー**
2. SQL Editorに貼り付け
3. **Execute** ボタンをクリック

**期待される結果:**
```
✅ 30 commands executed successfully
```

**投入されるデータ:**
- Category Images: 8件
- Users: 5件
- Venues: 3件
- Events: 3件
- Tickets: 6件

---

### **Step 4: データ確認**

以下のSQLを実行して、データが正しく投入されたか確認：

```sql
SELECT 
  (SELECT COUNT(*) FROM events) as events,
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM venues) as venues,
  (SELECT COUNT(*) FROM tickets) as tickets,
  (SELECT COUNT(*) FROM category_images) as category_images;
```

**期待される結果:**
```
events: 3
users: 5
venues: 3
tickets: 6
category_images: 8
```

---

### **Step 5: API動作確認**

ブラウザまたはcurlで以下のURLにアクセス：

```bash
curl https://linkup-backend.gcimaster.workers.dev/api/events
```

**期待される結果:**
```json
{
  "success": true,
  "events": [
    {
      "event_id": "evt_demo_001",
      "title": "TECH Summit Vol.1: AI・機械学習の最前線",
      ...
    }
  ]
}
```

---

## 🎯 **トラブルシューティング**

### **エラー: "no such table: XXX"**
→ Step 2のスキーマ投入が完了していません。schema.sqlを再度実行してください。

### **エラー: "no such column: XXX"**
→ スキーマのバージョンが古い可能性があります。全テーブルを削除して再作成してください：

```sql
-- 全テーブル削除（注意：データも消えます）
DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS admin_settings;
DROP TABLE IF EXISTS category_images;
DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS checkins;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS venues;
DROP TABLE IF EXISTS users;
```

その後、Step 2から再実行。

### **データが0件**
→ Step 3のシードデータ投入が完了していません。seed.sqlを再度実行してください。

---

## 📊 **デモデータの管理**

### **本番公開前にデモデータを削除する方法**

```sql
-- デモデータのみ削除（IDパターンで識別）
DELETE FROM tickets WHERE ticket_id LIKE 'tkt_demo_%';
DELETE FROM events WHERE event_id LIKE 'evt_demo_%';
DELETE FROM users WHERE user_id LIKE 'usr_demo_%' OR user_id LIKE 'usr_organizer_%' OR user_id LIKE 'usr_admin_%';
DELETE FROM venues WHERE venue_id LIKE 'v-%';
DELETE FROM category_images;  -- 全削除してから本番画像を再投入
```

### **新しいシードデータの追加**

1. `/home/user/webapp/data/seed.json` を編集
2. `node /home/user/webapp/database/generate-seed-sql.js` を実行
3. 生成された `/home/user/webapp/database/seed.sql` をDashboardで実行

---

## ✅ **完了確認**

以下が全て ✅ になったら完了：

- [ ] schema.sql 実行完了（34 commands）
- [ ] seed.sql 実行完了（30 commands）
- [ ] データ件数確認（events: 3, users: 5, etc.）
- [ ] API動作確認（/api/events が正常にレスポンス）
- [ ] フロントエンドでイベント表示確認

---

## 🚀 **次のステップ**

データベースセットアップ完了後：

1. フロントエンド（https://link-up.live/）を開く
2. ページをリフレッシュ
3. 「最新のイベント情報を同期しました」というトーストが表示される
4. 3件のデモイベントが表示される

---

## 📞 **サポート**

問題が発生した場合：
- データベースファイル: `/home/user/webapp/database/`
- バックエンドログ: Cloudflare Workers Dashboard > linkup-backend > Logs
- フロントエンドログ: ブラウザのConsole (F12)

---

**作成日**: 2026-02-11  
**対象環境**: Production  
**データベース**: linkup-db (8f2745e9-0943-45ef-8a5e-4b15f494d023)
