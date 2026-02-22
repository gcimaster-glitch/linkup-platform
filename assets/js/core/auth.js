/**
 * LinkUp 認証モジュール
 *
 * セキュリティポリシー:
 * 1. localStorage に保存するのは 'linkup_token' のみ
 * 2. ユーザー情報はログイン時に window.currentUser にセット
 *    （ページリロード時は /api/auth/me で再取得）
 * 3. ダミーユーザー・フォールバックログイン 禁止
 * 4. 管理者ログインは専用メソッド loginAsAdmin() を使用
 * 5. admin ロールは通常登録では取得不可（サーバーサイドで付与のみ）
 */

window.currentUser = null;

const AppAuth = {

  // ─── トークン管理 ────────────────────────────────

  getToken() {
    return localStorage.getItem('linkup_token');
  },

  saveToken(token) {
    localStorage.setItem('linkup_token', token);
  },

  clearToken() {
    localStorage.removeItem('linkup_token');
  },

  isLoggedIn() {
    return !!this.getToken() && !!window.currentUser;
  },

  // ─── 初期化（ページ読み込み時に呼ぶ） ──────────────

  async init() {
    const token = this.getToken();
    if (!token) return;

    try {
      const data = await window.LinkUpAPI.Auth.me();
      window.currentUser = data.user;
      AppUI.updateNav();
    } catch (err) {
      console.warn('セッション切れ:', err.message);
      this.clearToken();
      window.currentUser = null;
    }
  },

  // ─── 一般ログイン（参加者・主催者） ────────────────

  async login(email, password) {
    AppUI.showLoading('ログイン中...');

    try {
      const data = await window.LinkUpAPI.Auth.login(email, password);

      // admin が一般ログインフォームを使った場合は管理者専用モーダルへ誘導
      if (data.user.role === 'admin') {
        AppUI.hideLoading();
        AppUI.toast('管理者アカウントは管理者ログインをご利用ください', 'warning');
        AppUI.openAdminLoginModal();
        return;
      }

      this.saveToken(data.token);
      window.currentUser = data.user;

      AppUI.hideLoading();
      AppUI.closeModal();
      AppUI.updateNav();
      AppUI.toast(`ようこそ、${data.user.display_name || data.user.name}さん！`, 'success');

      // ロール別リダイレクト
      if (data.user.role === 'organizer') {
        AppRouter.go('organizer');
      } else {
        AppRouter.go('dashboard');
      }

    } catch (err) {
      AppUI.hideLoading();
      AppUI.toast(err.message || 'ログインに失敗しました', 'error');
    }
  },

  // ─── 管理者専用ログイン ─────────────────────────

  async loginAsAdmin(email, password) {
    AppUI.showLoading('管理者認証中...');

    try {
      const data = await window.LinkUpAPI.Auth.login(email, password);

      // admin ロールでない場合は拒否
      if (data.user.role !== 'admin') {
        AppUI.hideLoading();
        AppUI.toast('管理者権限がありません', 'error');
        return;
      }

      this.saveToken(data.token);
      window.currentUser = data.user;

      AppUI.hideLoading();
      AppUI.closeModal();
      AppUI.updateNav();
      AppUI.toast('管理者としてログインしました', 'success');
      AppRouter.go('admin');

    } catch (err) {
      AppUI.hideLoading();
      AppUI.toast(err.message || '管理者ログインに失敗しました', 'error');
    }
  },

  // ─── 新規登録 ──────────────────────────────────

  async register(email, password, name, role) {
    // クライアント側でもadminロールへの登録を禁止
    if (role === 'admin') {
      AppUI.toast('このロールでは登録できません', 'error');
      return;
    }

    AppUI.showLoading('登録中...');

    try {
      const data = await window.LinkUpAPI.Auth.register(email, password, name, role);

      if (data.email_verification_required) {
        AppUI.hideLoading();
        AppUI.closeModal();
        AppUI.toast('確認メールを送りました。メールをご確認ください。', 'info');
        return;
      }

      this.saveToken(data.token);
      window.currentUser = data.user;

      AppUI.hideLoading();
      AppUI.closeModal();
      AppUI.updateNav();
      AppUI.toast('登録完了しました！', 'success');

      // 主催者は主催者ダッシュボードへ
      if (data.user.role === 'organizer') {
        AppRouter.go('organizer');
      } else {
        AppRouter.go('dashboard');
      }

    } catch (err) {
      AppUI.hideLoading();
      AppUI.toast(err.message || '登録に失敗しました', 'error');
    }
  },

  // ─── ログアウト ────────────────────────────────

  logout() {
    this.clearToken();
    window.currentUser = null;
    AppUI.updateNav();
    AppRouter.go('home');
    AppUI.toast('ログアウトしました', 'info');
  },

  // ─── 認証ガード（ページ遷移前に呼ぶ） ──────────────

  requireLogin() {
    if (!this.isLoggedIn()) {
      AppUI.toast('ログインが必要です', 'warning');
      AppUI.openLoginModal();
      return false;
    }
    return true;
  },

  // ─── ロールガード（ページ内で呼ぶ） ────────────────

  requireRole(allowedRoles) {
    if (!this.requireLogin()) return false;
    const role = window.currentUser?.role;
    if (!allowedRoles.includes(role)) {
      const roleNames = { admin: '管理者', organizer: '主催者' };
      const needed = allowedRoles.map(r => roleNames[r] || r).join(' または ');
      AppUI.toast(`このページは ${needed} のみアクセス可能です`, 'error');
      AppRouter.go('dashboard');
      return false;
    }
    return true;
  },
};

window.AppAuth = AppAuth;
