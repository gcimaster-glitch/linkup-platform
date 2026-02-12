# 🎫 チケット管理・QR入場管理 - 現状と必要な対応

**Date**: 2026-02-12  
**Status**: ⚠️ **部分実装（本番利用不可）**

---

## 📊 現状分析

### ✅ 実装済み機能

| 機能 | 実装状況 | 連携状況 | 本番利用 |
|-----|---------|---------|---------|
| **画像アップロード** | ✅ 完全実装 | ✅ Cloudflare R2 | ✅ 可能 |
| **イベント作成** | ✅ 完全実装 | ✅ バックエンドDB | ✅ 可能 |
| **チケット購入UI** | ✅ 実装済み | ❌ LocalStorageのみ | ❌ **不可** |
| **QRコード生成** | ✅ 実装済み | ⚠️ 外部API依存 | ⚠️ 制限あり |
| **入場受付UI** | ✅ 実装済み | ❌ LocalStorageのみ | ❌ **不可** |
| **購入者管理** | ❌ 未実装 | ❌ 未実装 | ❌ **不可** |

---

## 🚨 重大な問題点

### 1️⃣ チケット購入がLocalStorageに保存

**現在のコード（`index.html` line 3763-3765）：**
```javascript
function confirmPurchase() {
    // ...
    const currentTickets = store.tickets;
    currentTickets.unshift(newTicket);
    store.tickets = currentTickets; // ❌ LocalStorageに保存
}
```

**問題点：**
- ❌ **ブラウザキャッシュクリアでチケット消失**
- ❌ **主催者が購入者情報を確認できない**
- ❌ **複数デバイスで閲覧不可**（スマホで購入→PCで見えない）
- ❌ **Stripe決済と連動していない**
- ❌ **偽造チケット防止不可**

**影響：**
> **本番環境では使用不可。ユーザーがチケットを購入しても、主催者は誰が購入したか分からず、入場管理ができない。**

---

### 2️⃣ QRコードが外部APIに依存

**現在のコード（`index.html` line 3737）：**
```javascript
qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=LINKUP-TKT-${Date.now()}`
```

**問題点：**
- ❌ **外部サービス（qrserver.com）に依存**
- ❌ **チケットデータとバックエンドが紐付いていない**
- ❌ **検証機能がない**（偽造チケット作り放題）
- ❌ **セキュリティリスク**（QRデータが予測可能）

**影響：**
> **QRコードを読み取っても、そのチケットが本物かどうか確認できない。不正入場を防げない。**

---

### 3️⃣ 入場受付がLocalStorageに記録

**現在のコード（`index.html` line 6008-6009）：**
```javascript
const checkins = JSON.parse(localStorage.getItem('checkins')) || {};
const isCheckedIn = checkins[p.eventId]?.some(c => c.includes(p.id));
```

**問題点：**
- ❌ **受付記録がブラウザ内のみ**
- ❌ **他のスタッフと共有不可**
- ❌ **リアルタイム管理不可**
- ❌ **重複入場を防げない**（ブラウザ変えれば何度でも入場可能）

**影響：**
> **複数の受付担当者がいる場合、誰がチェックインしたか分からない。不正入場も防げない。**

---

### 4️⃣ 購入者管理機能が未実装

**現状：**
- ❌ 主催者が「誰がチケットを購入したか」を確認できない
- ❌ 購入者への連絡機能がない
- ❌ 売上管理ができない

**影響：**
> **イベント当日、誰が来るか分からない。定員管理ができない。**

---

## 🔧 必要な対応（優先度順）

### 🔴 **最優先：チケット購入API連携**

#### 必要なAPI

**1. チケット購入API**
```http
POST /api/tickets/purchase
Authorization: Bearer {token}

Request:
{
  "event_id": "evt-xxx",
  "ticket_id": "ticket-xxx",
  "quantity": 2,
  "payment_method": "stripe",
  "stripe_payment_intent_id": "pi_xxxx"
}

Response:
{
  "success": true,
  "ticket_ids": ["TKT-001", "TKT-002"],
  "qr_codes": [
    {
      "ticket_id": "TKT-001",
      "qr_data": "LINKUP-TKT-001-SECURE-HASH",
      "qr_url": "https://linkup-backend.../qr/TKT-001"
    }
  ]
}
```

**2. チケット一覧取得API**
```http
GET /api/tickets/my-tickets
Authorization: Bearer {token}

Response:
{
  "success": true,
  "tickets": [
    {
      "ticket_id": "TKT-001",
      "event_id": "evt-xxx",
      "ticket_name": "一般参加",
      "quantity": 2,
      "qr_code_url": "...",
      "checked_in": false
    }
  ]
}
```

**3. QRコード検証API（主催者用）**
```http
POST /api/checkin/verify
Authorization: Bearer {organizer_token}

Request:
{
  "qr_data": "LINKUP-TKT-001-SECURE-HASH",
  "event_id": "evt-xxx"
}

Response:
{
  "success": true,
  "valid": true,
  "ticket": {
    "ticket_id": "TKT-001",
    "user_name": "山田太郎",
    "ticket_name": "一般参加",
    "already_checked_in": false
  }
}
```

**4. チェックイン記録API**
```http
POST /api/checkin/record
Authorization: Bearer {organizer_token}

Request:
{
  "ticket_id": "TKT-001",
  "event_id": "evt-xxx",
  "checked_in_at": "2026-02-12T14:30:00Z"
}
```

**5. 購入者一覧取得API（主催者用）**
```http
GET /api/events/{event_id}/attendees
Authorization: Bearer {organizer_token}

Response:
{
  "success": true,
  "attendees": [
    {
      "user_id": "user-001",
      "user_name": "山田太郎",
      "user_email": "yamada@example.com",
      "ticket_name": "一般参加",
      "quantity": 2,
      "purchase_date": "2026-02-12T14:00:00Z",
      "checked_in": true,
      "checked_in_at": "2026-02-12T14:30:00Z"
    }
  ]
}
```

---

### 🟡 **必須：フロントエンド修正**

#### 1. チケット購入処理の修正

**現在（LocalStorage）：**
```javascript
function confirmPurchase() {
    const newTicket = { ... };
    store.tickets = [...store.tickets, newTicket]; // ❌
}
```

**修正後（API連携）：**
```javascript
async function confirmPurchase() {
    const response = await API.Ticket.purchase({
        event_id: event.event_id,
        ticket_id: ticket.id,
        quantity: count,
        payment_method: 'stripe'
    });
    
    if (response.success) {
        showToast('✅ チケットを購入しました！', 'success');
        await store.loadMyTickets(); // APIから再取得
        showPurchaseSuccessModal(response);
    }
}
```

#### 2. QRコード表示の修正

**現在（外部API）：**
```javascript
qrCode: `https://api.qrserver.com/v1/create-qr-code/?...`
```

**修正後（バックエンドAPI）：**
```javascript
async function showTicketQR(ticketId) {
    const response = await API.Ticket.getQRCode(ticketId);
    // response.qr_url をそのまま表示
}
```

#### 3. 入場受付の修正

**現在（LocalStorage）：**
```javascript
localStorage.setItem('checkins', ...);
```

**修正後（API連携）：**
```javascript
async function checkinTicket(qrData) {
    const verifyResponse = await API.Checkin.verify(qrData, eventId);
    
    if (verifyResponse.valid && !verifyResponse.ticket.already_checked_in) {
        await API.Checkin.record(verifyResponse.ticket.ticket_id, eventId);
        showToast('✅ チェックイン完了', 'success');
    }
}
```

---

### 🟢 **推奨：購入者管理画面の追加**

主催者ダッシュボードに「購入者一覧」タブを追加：

**実装内容：**
- イベントごとの購入者一覧表示
- 購入者の連絡先（メール）表示
- チェックイン状況のリアルタイム確認
- CSVエクスポート機能

---

## 📈 実装の優先度

| タスク | 優先度 | 理由 | 所要時間 |
|-------|-------|------|---------|
| チケット購入API連携 | 🔴 最優先 | 本番利用不可 | 4時間 |
| QRコード検証API | 🔴 最優先 | セキュリティリスク | 2時間 |
| チェックインAPI | 🔴 最優先 | 不正入場防止 | 2時間 |
| 購入者管理画面 | 🟡 必須 | 主催者の運営に必須 | 3時間 |
| Stripe決済連携 | 🟢 推奨 | 実際の決済に必要 | 6時間 |

**合計見積もり時間：約17時間**

---

## 🎯 本番リリース前の必須チェックリスト

- [ ] チケット購入がバックエンドAPIに保存される
- [ ] QRコードがバックエンドで生成され、検証可能
- [ ] チェックイン記録がデータベースに保存される
- [ ] 主催者が購入者一覧を確認できる
- [ ] 重複チェックイン防止機能が動作する
- [ ] 偽造チケット検証機能が動作する
- [ ] Stripe決済が正常に動作する（推奨）

---

## 💡 短期的な回避策（デモ環境のみ）

**本番リリースまでの暫定対応：**

1. **注意書きを追加**
   ```
   ⚠️ 現在はデモ環境です。実際のチケット購入・入場管理はできません。
   ```

2. **テストモードを明示**
   - チケット購入後に「これはテストです」と表示
   - QRコードに「DEMO」ウォーターマーク

3. **本番リリース前に必ず実装**
   - 上記のAPI連携をすべて完了

---

## ✅ 結論

### 現状

| 項目 | 実装状況 |
|-----|---------|
| 画像アップロード | ✅ **本番利用可能** |
| イベント作成・下書き・承認 | ✅ **本番利用可能** |
| チケット購入 | ❌ **本番利用不可**（LocalStorageのみ） |
| QR入場管理 | ❌ **本番利用不可**（検証機能なし） |
| 購入者管理 | ❌ **未実装** |

### 次のステップ

**本番リリース前に必須：**
1. ✅ チケット購入API実装（バックエンド）
2. ✅ QRコード生成・検証API実装（バックエンド）
3. ✅ チェックインAPI実装（バックエンド）
4. ✅ フロントエンド修正（API連携）
5. ✅ 購入者管理画面実装

**推定所要時間：約17時間**

---

**Production URL**: https://link-up.live/  
**GitHub**: https://github.com/gcimaster-glitch/linkup-platform

**Report Generated**: 2026-02-12 14:45 UTC  
**Status**: ⚠️ **部分実装（本番リリース前に対応必須）**
