# Phase 2: マイページ全面改修計画書
**作成日**: 2026-02-11
**ステータス**: 計画中

## 🎯 目標

現在のモーダルベースのマイページを、独立したページに変換し、UXを大幅に改善する。

---

## 📋 現状の問題点

### 1. **モーダルの使いづらさ**
- ブラウザの戻るボタンが効かない
- URLが変わらないため、ブックマーク不可
- 直接リンク共有ができない
- 複数タブでの作業が困難

### 2. **ナビゲーションの不明確さ**
- 現在地が分かりにくい
- パンくずナビがない
- ページ間の関係性が不明

### 3. **モバイル対応の問題**
- モーダルがフルスクリーンになり、閉じ方が分かりにくい
- スクロールの挙動が不自然

---

## 🏗️ 新アーキテクチャ

### **URL構造**

```
現在:
- マイページ: すべてモーダル
- URL変化なし

新構造:
/dashboard                    # ダッシュボード（overview）
/dashboard/tickets            # チケット管理
/dashboard/inbox              # 受信箱
/dashboard/profile            # プロフィール編集
/dashboard/interests          # 興味・関心
/dashboard/events             # イベント管理
/dashboard/payments           # 決済履歴
/dashboard/support            # サポート
/dashboard/kyc                # 本人確認
```

### **ページレイアウト**

```
┌─────────────────────────────────────┐
│ Header (Fixed)                      │
├─────────────────────────────────────┤
│ Profile Cover (Only on /dashboard)  │
├────────┬────────────────────────────┤
│ Side   │ Main Content               │
│ Nav    │                            │
│ (Dash  │ ┌──────────────────────┐  │
│  board │ │ Breadcrumb           │  │
│  Over  │ ├──────────────────────┤  │
│  view  │ │                      │  │
│  Tick  │ │ Page Content         │  │
│  ets   │ │                      │  │
│  Inbox │ └──────────────────────┘  │
│  ...)  │                            │
├────────┴────────────────────────────┤
│ Footer                              │
└─────────────────────────────────────┘
```

---

## 🔧 実装計画

### **Phase 2.1: ルーティングシステム拡張** (2時間)

1. **router()関数の拡張**
   - サブルートのサポート
   - クエリパラメータの処理
   - ブラウザ履歴との連携

2. **履歴管理**
   ```javascript
   function router(view, params = {}, pushState = true) {
       // 現在の実装を拡張
       // pushState でブラウザ履歴を管理
       if (pushState) {
           const url = buildUrl(view, params);
           window.history.pushState({ view, params }, '', url);
       }
   }
   
   // ブラウザの戻る/進むボタン対応
   window.addEventListener('popstate', (event) => {
       if (event.state) {
           router(event.state.view, event.state.params, false);
       }
   });
   ```

### **Phase 2.2: ページ化** (3時間)

1. **ダッシュボードページの分離**
   - `renderDashboard()` → 独立ページ関数へ
   - サイドナビゲーションの追加
   - パンくずナビゲーションの実装

2. **各サブページの実装**
   ```javascript
   function renderDashboardPage(container, subpage = 'overview') {
       container.innerHTML = `
           <div class="dashboard-layout">
               <!-- Header -->
               ${renderDashboardHeader()}
               
               <div class="dashboard-body">
                   <!-- Side Navigation -->
                   ${renderDashboardSideNav(subpage)}
                   
                   <!-- Main Content -->
                   <div class="dashboard-content">
                       <!-- Breadcrumb -->
                       ${renderBreadcrumb(subpage)}
                       
                       <!-- Page Content -->
                       ${renderDashboardSubpage(subpage)}
                   </div>
               </div>
           </div>
       `;
   }
   ```

### **Phase 2.3: パンくずナビゲーション** (30分)

```javascript
function renderBreadcrumb(subpage) {
    const breadcrumbs = {
        'overview': ['ホーム', 'ダッシュボード'],
        'tickets': ['ホーム', 'ダッシュボード', 'チケット'],
        'inbox': ['ホーム', 'ダッシュボード', '受信箱'],
        // ...
    };
    
    const crumbs = breadcrumbs[subpage] || ['ホーム'];
    
    return `
        <nav class="breadcrumb">
            ${crumbs.map((crumb, i) => `
                <span class="${i === crumbs.length - 1 ? 'active' : ''}">
                    ${crumb}
                </span>
                ${i < crumbs.length - 1 ? '<span>/</span>' : ''}
            `).join('')}
        </nav>
    `;
}
```

### **Phase 2.4: サイドナビゲーション** (1時間)

```javascript
function renderDashboardSideNav(activeSubpage) {
    const navItems = [
        { id: 'overview', icon: 'dashboard', label: 'ダッシュボード' },
        { id: 'tickets', icon: 'confirmation_number', label: 'チケット' },
        { id: 'inbox', icon: 'inbox', label: '受信箱', badge: unreadCount },
        { id: 'profile', icon: 'person', label: 'プロフィール' },
        { id: 'interests', icon: 'favorite', label: '興味・関心' },
        { id: 'events', icon: 'event', label: 'イベント管理' },
        { id: 'payments', icon: 'receipt', label: '決済履歴' },
        { id: 'support', icon: 'support_agent', label: 'サポート' },
    ];
    
    return `
        <aside class="dashboard-sidenav">
            ${navItems.map(item => `
                <a href="/dashboard/${item.id}" 
                   onclick="event.preventDefault(); router('dashboard_${item.id}'); return false;"
                   class="nav-item ${activeSubpage === item.id ? 'active' : ''}">
                    <span class="material-icons-outlined">${item.icon}</span>
                    <span>${item.label}</span>
                    ${item.badge ? `<span class="badge">${item.badge}</span>` : ''}
                </a>
            `).join('')}
        </aside>
    `;
}
```

---

## 📱 レスポンシブ対応

### **デスクトップ (> 1024px)**
- サイドナビゲーション: 固定表示
- メインコンテンツ: 広々とした2カラム

### **タブレット (768px - 1024px)**
- サイドナビゲーション: 折りたたみ可能
- ハンバーガーメニューで展開

### **モバイル (< 768px)**
- サイドナビゲーション: 下部タブバー
- フルスクリーンコンテンツ

---

## 🎨 CSS設計

```css
.dashboard-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.dashboard-body {
    display: flex;
    flex: 1;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
}

.dashboard-sidenav {
    width: 260px;
    background: white;
    border-right: 1px solid #e2e8f0;
    position: sticky;
    top: 64px;
    height: calc(100vh - 64px);
    overflow-y: auto;
}

.dashboard-content {
    flex: 1;
    padding: 2rem;
    background: #f8fafc;
}

.breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #64748b;
    margin-bottom: 1.5rem;
}

.breadcrumb .active {
    color: #0f172a;
    font-weight: 600;
}

@media (max-width: 768px) {
    .dashboard-sidenav {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
        height: auto;
        top: auto;
        border-right: none;
        border-top: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-around;
        z-index: 40;
    }
    
    .dashboard-content {
        padding-bottom: 5rem;
    }
}
```

---

## ⚡ パフォーマンス最適化

1. **Code Splitting**
   - ダッシュボードのJSを分離
   - 遅延ロード

2. **キャッシング**
   - ページ遷移時にコンテンツをキャッシュ
   - 戻るボタンで高速表示

3. **プリロード**
   - 次に移動しそうなページをプリロード

---

## 🧪 テスト計画

### **テストケース**

1. **ルーティング**
   - [ ] 各URL直接アクセス
   - [ ] ブラウザの戻る/進むボタン
   - [ ] ページリロード時の状態保持

2. **ナビゲーション**
   - [ ] サイドナビのアクティブ状態
   - [ ] パンくずの正確性
   - [ ] モバイルメニューの開閉

3. **レスポンシブ**
   - [ ] デスクトップレイアウト
   - [ ] タブレットレイアウト
   - [ ] モバイルレイアウト

---

## 📅 実装スケジュール

| Phase | タスク | 所要時間 | ステータス |
|-------|--------|----------|-----------|
| 2.1 | ルーティング拡張 | 2時間 | ⏳ 未着手 |
| 2.2 | ページ化 | 3時間 | ⏳ 未着手 |
| 2.3 | パンくず | 30分 | ⏳ 未着手 |
| 2.4 | サイドナビ | 1時間 | ⏳ 未着手 |
| 2.5 | CSS + レスポンシブ | 1時間 | ⏳ 未着手 |
| 2.6 | テスト | 30分 | ⏳ 未着手 |

**合計**: 約8時間

---

## 🚀 実装開始条件

- [x] 現在のUI改善完了（9/11タスク）
- [ ] メール認証実装完了
- [ ] D1マイグレーション実行
- [ ] バックエンドデプロイ確認

---

**最終更新**: 2026-02-11 07:00
**次のアクション**: メール認証完了後、Phase 2.1から着手
