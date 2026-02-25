/**
 * LinkUp ルーター
 *
 * セキュリティポリシー:
 * 1. requireLogin: true  → 未ログインはログインモーダルへ
 * 2. requireRole: 'admin'|'organizer' → ロール不一致は dashboard へリダイレクト
 * 3. admin ルートは通常ナビから非表示（URLから直打ち不可ではないがロールチェックで弾く）
 *
 * URL対応:
 * /dashboard            → dashboard (overview)
 * /dashboard/tickets    → dashboard { tab: 'tickets' }
 * /dashboard/payments   → dashboard { tab: 'payments' }
 * /dashboard/interests  → dashboard { tab: 'interests' }
 * /dashboard/profile    → dashboard { tab: 'profile' }
 * /organizer            → organizer (overview)
 * /organizer/events     → organizer { tab: 'events' }
 * /organizer/checkin    → organizer { tab: 'checkin' }
 * /organizer/settings   → organizer { tab: 'settings' }
 * /admin                → admin (overview)
 * /admin/events         → admin { tab: 'events' }
 * /admin/users          → admin { tab: 'users' }
 * /admin/tickets        → admin { tab: 'tickets' }
 * /admin/checkin        → admin { tab: 'checkin' }
 */

const AppRouter = {

  routes: {
    home:      { render: 'renderHome',      title: 'LinkUp - イベント・コミュニティプラットフォーム' },
    detail:    { render: 'renderDetail',    title: 'イベント詳細 | LinkUp', requireLogin: false },
    dashboard: { render: 'renderDashboard', title: 'ダッシュボード | LinkUp',         requireLogin: true },
    organizer: { render: 'renderOrganizer', title: '主催者ダッシュボード | LinkUp',    requireLogin: true, requireRole: ['organizer', 'admin'] },
    admin:     { render: 'renderAdmin',     title: '管理コンソール | LinkUp',          requireLogin: true, requireRole: ['admin'] },
  },

  // 各viewで有効なタブ一覧
  _validTabs: {
    dashboard: ['overview', 'tickets', 'payments', 'interests', 'profile'],
    organizer: ['overview', 'events', 'checkin', 'settings'],
    admin:     ['overview', 'events', 'users', 'tickets', 'checkin'],
  },

  currentView: null,
  currentParams: {},

  // ─── ページ遷移 ────────────────────────────────────

  async go(view, params = {}) {
    const route = this.routes[view];

    // 未定義ルートはホームへ
    if (!route) {
      console.warn(`Unknown route: ${view}`);
      return this.go('home');
    }

    // ① 認証ガード
    if (route.requireLogin && !AppAuth.isLoggedIn()) {
      AppUI.toast('ログインが必要です', 'warning');
      AppUI.openLoginModal();
      return;
    }

    // ② ロールガード（クライアント側。バックエンドでも必ず検証）
    if (route.requireRole && AppAuth.isLoggedIn()) {
      const userRole = window.currentUser?.role;
      if (!route.requireRole.includes(userRole)) {
        const roleNames = { admin: '管理者', organizer: '主催者' };
        const needed = route.requireRole.map(r => roleNames[r] || r).join(' または ');
        AppUI.toast(`このページは ${needed} のみアクセス可能です`, 'error');
        // ダッシュボードへリダイレクト（ループ防止）
        if (view !== 'dashboard') {
          return this.go('dashboard');
        }
        return;
      }
    }

    this.currentView = view;
    this.currentParams = params;

    this._updateURL(view, params);
    document.title = route.title;

    const renderFn = window[route.render];
    if (typeof renderFn !== 'function') {
      AppUI.showError(`ページ "${view}" が見つかりません`);
      return;
    }

    try {
      window.scrollTo(0, 0);
      await renderFn(params);
    } catch (err) {
      console.error(`Route error [${view}]:`, err);
      AppUI.showError(err.message || '予期しないエラーが発生しました', `AppRouter.go('${view}')`);
    }
  },

  // ─── URL管理 ───────────────────────────────────────

  _updateURL(view, params) {
    let url;
    if (view === 'detail') {
      url = `/events/${params.id || ''}`;
    } else if (view === 'dashboard') {
      url = params.tab && params.tab !== 'overview' ? `/dashboard/${params.tab}` : '/dashboard';
    } else if (view === 'organizer') {
      url = params.tab && params.tab !== 'overview' ? `/organizer/${params.tab}` : '/organizer';
    } else if (view === 'admin') {
      url = params.tab && params.tab !== 'overview' ? `/admin/${params.tab}` : '/admin';
    } else if (view === 'home') {
      url = '/';
    } else {
      url = '/';
    }
    if (history.pushState) history.pushState({ view, params }, '', url);
  },

  // ─── 初期化（ページ読み込み時） ─────────────────────

  init() {
    window.addEventListener('popstate', (e) => {
      if (e.state?.view) {
        this.go(e.state.view, e.state.params || {});
      } else {
        const { view, params } = this._parseURL();
        this.go(view, params);
      }
    });

    const { view, params } = this._parseURL();
    this.go(view, params);
  },

  _parseURL() {
    const path = location.pathname;

    // イベント詳細: /events/:id
    if (path.startsWith('/events/') && path.length > 8) {
      return { view: 'detail', params: { id: path.split('/events/')[1] } };
    }

    // ダッシュボード: /dashboard または /dashboard/:tab
    if (path === '/dashboard' || path === '/dashboard/') {
      return { view: 'dashboard', params: {} };
    }
    if (path.startsWith('/dashboard/')) {
      const tab = path.split('/dashboard/')[1].split('/')[0];
      const validTabs = this._validTabs.dashboard;
      return { view: 'dashboard', params: { tab: validTabs.includes(tab) ? tab : 'overview' } };
    }

    // 主催者: /organizer または /organizer/:tab
    if (path === '/organizer' || path === '/organizer/') {
      return { view: 'organizer', params: {} };
    }
    if (path.startsWith('/organizer/')) {
      const tab = path.split('/organizer/')[1].split('/')[0];
      const validTabs = this._validTabs.organizer;
      return { view: 'organizer', params: { tab: validTabs.includes(tab) ? tab : 'overview' } };
    }

    // 管理者: /admin または /admin/:tab
    if (path === '/admin' || path === '/admin/') {
      return { view: 'admin', params: {} };
    }
    if (path.startsWith('/admin/')) {
      const tab = path.split('/admin/')[1].split('/')[0];
      const validTabs = this._validTabs.admin;
      return { view: 'admin', params: { tab: validTabs.includes(tab) ? tab : 'overview' } };
    }

    return { view: 'home', params: {} };
  },
};

window.AppRouter = AppRouter;
