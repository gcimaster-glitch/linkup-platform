# 🚨 権限管理の重大な問題と解決策

## 📋 現状の問題点

### 1. **権限チェックの欠如**
```javascript
// 現状: オーガナイザー画面（1675行目）
else if (view === 'organizer') renderOrganizer(app);

// 問題: 権限チェックなし！誰でもアクセス可能
```

```javascript
// 現状: 管理者画面（1677行目）
else if (view === 'admin') renderAdmin(app);

// 問題: 権限チェックなし！誰でもアクセス可能
```

### 2. **ローカルストレージの過剰使用**
- 70箇所で `localStorage` / `sessionStorage` を使用
- データベースではなくブラウザに保存
- ユーザー間でデータが混在
- 別のブラウザ/デバイスでデータが同期されない

### 3. **デモデータのハードコーディング**
```javascript
// backend/src/routes/auth.ts の問題
if (email === 'admin@demo.com' && password === 'demo') {
    // ハードコードされた管理者
}
if (email === 'organizer@demo.com' && password === 'demo') {
    // ハードコードされたオーガナイザー
}
```

### 4. **混在したユーザー状態**
現在のログイン方式では：
- `iwama@inre.co.jp` でログイン
- → 一般ユーザーとして表示
- → しかし「イベント編集」ボタンをクリックするとオーガナイザー画面に
- → 「管理者」ボタンをクリックすると管理者画面に
- → **全ての権限が使える = セキュリティホール**

---

## ✅ 解決策

### Phase 1: データベースにユーザーを登録 ✅

#### 1.1 管理者ユーザー
```sql
INSERT INTO users (
    user_id, email, password_hash, display_name, 
    role, kyc_status, created_at
) VALUES (
    'u-admin-001',
    'admin@linkup.live',
    '$2a$10$...',  -- bcrypt hash for 'Admin@2026!'
    'LinkUp 管理者',
    'admin',
    'verified',
    datetime('now')
);
```

#### 1.2 オーガナイザーユーザー
```sql
INSERT INTO users (
    user_id, email, password_hash, display_name, 
    role, kyc_status, created_at
) VALUES (
    'u-organizer-001',
    'organizer@linkup.live',
    '$2a$10$...',  -- bcrypt hash for 'Organizer@2026!'
    'テストイベント主催者',
    'organizer',
    'verified',
    datetime('now')
);
```

#### 1.3 一般ユーザー
```sql
INSERT INTO users (
    user_id, email, password_hash, display_name, 
    role, kyc_status, created_at
) VALUES (
    'u-user-001',
    'user@linkup.live',
    '$2a$10$...',  -- bcrypt hash for 'User@2026!'
    '一般テストユーザー',
    'user',
    'verified',
    datetime('now')
);
```

既存ユーザー `iwama@inre.co.jp` を一般ユーザーに設定：
```sql
UPDATE users 
SET role = 'user', kyc_status = 'verified'
WHERE email = 'iwama@inre.co.jp';
```

---

### Phase 2: バックエンドの権限チェック強化 ✅

#### 2.1 adminMiddleware の強化
```typescript
// backend/src/middleware/auth.ts
export const adminMiddleware = async (c: Context, next: Next) => {
    const role = c.get('role');
    if (role !== 'admin') {
        return c.json({ 
            error: 'Forbidden: Admin access only',
            required_role: 'admin',
            your_role: role 
        }, 403);
    }
    await next();
};
```

#### 2.2 organizerMiddleware の強化
```typescript
export const organizerMiddleware = async (c: Context, next: Next) => {
    const role = c.get('role');
    if (role !== 'organizer' && role !== 'admin') {
        return c.json({ 
            error: 'Forbidden: Organizer or Admin access only',
            required_role: 'organizer or admin',
            your_role: role 
        }, 403);
    }
    await next();
};
```

---

### Phase 3: フロントエンドの権限チェック実装 ✅

#### 3.1 ルーティングでの権限チェック
```javascript
// Before
else if (view === 'organizer') renderOrganizer(app);
else if (view === 'admin') renderAdmin(app);

// After
else if (view === 'organizer') {
    if (!store.user) {
        openAuthModal();
        return;
    }
    if (store.user.role !== 'organizer' && store.user.role !== 'admin') {
        showToast('アクセス権限がありません', 'error');
        navigate('home');
        return;
    }
    renderOrganizer(app);
}
else if (view === 'admin') {
    if (!store.user) {
        openAuthModal();
        return;
    }
    if (store.user.role !== 'admin') {
        showToast('管理者権限が必要です', 'error');
        navigate('home');
        return;
    }
    renderAdmin(app);
}
```

#### 3.2 UI要素の権限別表示
```javascript
// ナビゲーションメニュー
function updateNav() {
    const user = store.user;
    
    // 管理者ボタンは admin のみ表示
    const adminButton = user?.role === 'admin' 
        ? '<button onclick="navigate(\'admin\')">管理者</button>' 
        : '';
    
    // オーガナイザーボタンは organizer または admin のみ表示
    const organizerButton = (user?.role === 'organizer' || user?.role === 'admin')
        ? '<button onclick="navigate(\'organizer\')">主催者</button>' 
        : '';
    
    // ...
}
```

---

### Phase 4: ローカルストレージ削減 ✅

#### 4.1 データベース中心のデータ管理
```javascript
// Before: ローカルストレージに保存
localStorage.setItem('events', JSON.stringify(events));

// After: データベースから取得
async function loadEvents() {
    const response = await API.Events.list();
    store.events = response.events;
}
```

#### 4.2 ローカルストレージは最小限に
- JWT トークンのみ保存
- 一時的なUI状態のみ（選択中のタブなど）
- すべてのビジネスデータはDB保存

---

### Phase 5: ログイン・ログアウトの完全実装 ✅

#### 5.1 ログイン処理
```javascript
async function login(email, password) {
    try {
        const response = await API.Auth.login(email, password);
        
        // JWTトークンをローカルストレージに保存
        localStorage.setItem('token', response.token);
        
        // ユーザー情報をstoreに保存
        store.user = response.user;
        
        // roleに応じてリダイレクト
        if (response.user.role === 'admin') {
            navigate('admin');
        } else if (response.user.role === 'organizer') {
            navigate('organizer');
        } else {
            navigate('dashboard');
        }
        
        showToast('ログインしました', 'success');
    } catch (error) {
        showToast('ログインに失敗しました', 'error');
    }
}
```

#### 5.2 ログアウト処理
```javascript
async function logout() {
    try {
        // バックエンドにログアウト通知（オプション）
        await API.Auth.logout();
    } catch (e) {
        // エラーは無視
    }
    
    // ローカルストレージをクリア
    localStorage.removeItem('token');
    
    // storeをクリア
    store.user = null;
    store.events = [];
    store.tickets = [];
    
    // ホームにリダイレクト
    navigate('home');
    showToast('ログアウトしました', 'success');
}
```

#### 5.3 起動時の認証チェック
```javascript
async function initAuth() {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
        // トークンでユーザー情報を取得
        const response = await API.Auth.me();
        store.user = response.user;
    } catch (error) {
        // トークンが無効な場合はクリア
        localStorage.removeItem('token');
        store.user = null;
    }
}

// アプリ起動時に実行
document.addEventListener('DOMContentLoaded', async () => {
    await initAuth();
    router();
});
```

---

## 📊 実装優先度

| Phase | タスク | 優先度 | 工数 |
|-------|-------|--------|------|
| 1 | データベースユーザー登録 | 🔥 最高 | 2h |
| 2 | バックエンド権限強化 | 🔥 最高 | 3h |
| 3 | フロントエンド権限チェック | 🔥 最高 | 4h |
| 4 | ローカルストレージ削減 | 🟡 高 | 6h |
| 5 | ログイン・ログアウト完全実装 | 🔥 最高 | 3h |
| **合計** | - | - | **18時間** |

---

## 🎯 テストユーザー情報（実装後）

### 管理者
- **Email**: `admin@linkup.live`
- **Password**: `Admin@2026!`
- **権限**: 全機能アクセス可能
- **できること**:
  - ユーザー管理
  - イベント承認・却下
  - 主催者管理
  - システム設定
  - バックアップ管理
  - 全ての統計・レポート閲覧

### イベントオーガナイザー
- **Email**: `organizer@linkup.live`
- **Password**: `Organizer@2026!`
- **権限**: イベント作成・管理
- **できること**:
  - イベント作成・編集・削除
  - チケット管理
  - 参加者管理
  - 売上確認
  - マーケティング機能

### 一般ユーザー
- **Email**: `user@linkup.live`
- **Password**: `User@2026!`
- **権限**: イベント参加のみ
- **できること**:
  - イベント検索・閲覧
  - チケット購入
  - マイページ
  - プロフィール編集

### 既存ユーザー（一般ユーザーに変更）
- **Email**: `iwama@inre.co.jp`
- **Password**: （既存のまま）
- **権限**: 一般ユーザーに変更
- **できること**: 一般ユーザーと同じ

---

## 🔐 セキュリティ強化

### 1. JWT トークンの検証強化
- トークンの有効期限チェック
- リフレッシュトークンの実装
- トークン盗難対策

### 2. パスワードポリシー
- 最小8文字
- 大文字・小文字・数字・記号を含む
- bcrypt でハッシュ化（cost=10）

### 3. API レート制限
- ログイン試行回数制限（5回/5分）
- API呼び出し制限（100回/分）

### 4. CORS 設定
```typescript
// backend/src/index.ts
app.use('*', cors({
    origin: 'https://link-up.live',
    credentials: true
}));
```

---

**作成日時**: 2026-02-13 15:30 JST  
**バージョン**: v3.9.0 → v4.0.0 (権限管理完全刷新)  
**優先度**: 🔥 最優先（セキュリティ問題）
