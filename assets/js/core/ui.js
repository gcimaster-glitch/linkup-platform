/**
 * LinkUp 共通UIモジュール
 *
 * セキュリティポリシー:
 * - ナビの「主催者ダッシュボード」「管理コンソール」はロールに応じてのみ表示
 * - 登録フォームで選択できるロールは attendee/organizer のみ（admin 不可）
 * - 管理者ログインは専用モーダル（通常ログインとは分離）
 */

const AppUI = {

  // ─── ナビゲーション更新（ロールベース） ────────────

  updateNav() {
    const user = window.currentUser;
    const navAuth   = document.getElementById('nav-auth');
    const navUser   = document.getElementById('nav-user');
    const navAvatar = document.getElementById('nav-avatar');
    const navName   = document.getElementById('nav-name');
    const navOrgBtn = document.getElementById('nav-organizer-btn');
    const navAdmBtn = document.getElementById('nav-admin-btn');

    if (!navAuth || !navUser) return;

    if (user) {
      navAuth.classList.add('hidden');
      navUser.classList.remove('hidden');

      if (navAvatar) navAvatar.src = user.avatar_url || user.icon_url
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.display_name || user.name || 'U')}&background=2563EB&color=fff`;
      if (navName) navName.textContent = user.display_name || user.name || '';

      // ロールに応じてボタンを表示/非表示
      if (navOrgBtn) {
        if (user.role === 'organizer' || user.role === 'admin') {
          navOrgBtn.classList.remove('hidden');
        } else {
          navOrgBtn.classList.add('hidden');
        }
      }
      if (navAdmBtn) {
        if (user.role === 'admin') {
          navAdmBtn.classList.remove('hidden');
        } else {
          navAdmBtn.classList.add('hidden');
        }
      }

    } else {
      navAuth.classList.remove('hidden');
      navUser.classList.add('hidden');
      if (navOrgBtn) navOrgBtn.classList.add('hidden');
      if (navAdmBtn) navAdmBtn.classList.add('hidden');
    }
  },

  // ─── トースト通知 ──────────────────────────────────

  toast(message, type = 'info') {
    document.querySelectorAll('.lu-toast').forEach(el => el.remove());

    const colors = {
      success: 'bg-green-500',
      error:   'bg-red-500',
      warning: 'bg-yellow-500',
      info:    'bg-blue-500',
    };
    const icons = {
      success: 'check_circle',
      error:   'error',
      warning: 'warning',
      info:    'info',
    };

    const el = document.createElement('div');
    el.className = `lu-toast fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3 rounded-xl text-white shadow-xl text-sm font-medium ${colors[type] || colors.info}`;
    // XSS対策: textContent で安全に挿入
    const iconEl = document.createElement('span');
    iconEl.className = 'material-icons-outlined text-base';
    iconEl.textContent = icons[type] || 'info';
    const msgEl = document.createElement('span');
    msgEl.textContent = message;
    el.appendChild(iconEl);
    el.appendChild(msgEl);
    document.body.appendChild(el);

    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.4s';
      setTimeout(() => el.remove(), 400);
    }, 3500);
  },

  // ─── モーダル ──────────────────────────────────────

  openModal(html) {
    const wrap  = document.getElementById('modal-container');
    const inner = document.getElementById('modal-content');
    if (!wrap || !inner) return;
    inner.innerHTML = html;
    wrap.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },

  closeModal() {
    const wrap = document.getElementById('modal-container');
    if (!wrap) return;
    wrap.classList.add('hidden');
    document.body.style.overflow = '';
  },

  // ─── 一般ユーザー・主催者ログインモーダル ──────────

  openLoginModal() {
    this.openModal(`
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8">
        <h2 class="text-2xl font-bold text-slate-800 mb-1">ログイン</h2>
        <p class="text-xs text-slate-400 mb-6">参加者・主催者の方はこちら</p>
        <form id="login-form" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">メールアドレス</label>
            <input type="email" name="email" required autocomplete="email"
              class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">パスワード</label>
            <input type="password" name="password" required autocomplete="current-password"
              class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••">
          </div>
          <button type="submit"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition">
            ログイン
          </button>
        </form>
        <p class="text-center text-sm text-slate-500 mt-4">
          アカウントをお持ちでない方は
          <button onclick="AppUI.openRegisterModal()" class="text-blue-600 font-bold hover:underline">新規登録</button>
        </p>
        <div class="mt-4 pt-4 border-t border-slate-100 text-center">
          <button onclick="AppUI.openAdminLoginModal()"
            class="text-xs text-slate-400 hover:text-slate-600 transition">
            管理者ログインはこちら
          </button>
        </div>
      </div>
    `);

    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      await AppAuth.login(fd.get('email'), fd.get('password'));
    });
  },

  // ─── 管理者専用ログインモーダル ────────────────────

  openAdminLoginModal() {
    this.openModal(`
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 border-t-4 border-red-500">
        <div class="flex items-center gap-2 mb-1">
          <span class="material-icons-outlined text-red-500">admin_panel_settings</span>
          <h2 class="text-2xl font-bold text-slate-800">管理者ログイン</h2>
        </div>
        <p class="text-xs text-red-500 mb-6 font-medium">⚠️ このページは管理者専用です。不正アクセスは記録されます。</p>
        <form id="admin-login-form" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">管理者メールアドレス</label>
            <input type="email" name="email" required autocomplete="off"
              class="w-full border border-red-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-400"
              placeholder="admin@example.com">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">管理者パスワード</label>
            <input type="password" name="password" required autocomplete="off"
              class="w-full border border-red-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-400"
              placeholder="••••••••">
          </div>
          <button type="submit"
            class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition">
            管理者としてログイン
          </button>
        </form>
        <p class="text-center text-sm text-slate-500 mt-4">
          <button onclick="AppUI.openLoginModal()" class="text-blue-600 hover:underline">← 一般ログインに戻る</button>
        </p>
      </div>
    `);

    document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      await AppAuth.loginAsAdmin(fd.get('email'), fd.get('password'));
    });
  },

  // ─── 新規登録モーダル（admin ロール不可） ───────────

  openRegisterModal() {
    this.openModal(`
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">新規登録</h2>
        <form id="register-form" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">お名前</label>
            <input type="text" name="name" required autocomplete="name"
              class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="山田 太郎">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">メールアドレス</label>
            <input type="email" name="email" required autocomplete="email"
              class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">パスワード（8文字以上）</label>
            <input type="password" name="password" required minlength="8" autocomplete="new-password"
              class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">アカウント種別</label>
            <select name="role"
              class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="attendee">参加者（イベントに参加する）</option>
              <option value="organizer">主催者（イベントを開催する）</option>
            </select>
          </div>
          <button type="submit"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition">
            登録する
          </button>
        </form>
        <p class="text-center text-sm text-slate-500 mt-4">
          すでにアカウントをお持ちの方は
          <button onclick="AppUI.openLoginModal()" class="text-blue-600 font-bold hover:underline">ログイン</button>
        </p>
      </div>
    `);

    document.getElementById('register-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      await AppAuth.register(fd.get('email'), fd.get('password'), fd.get('name'), fd.get('role'));
    });
  },

  // ─── ローディング ──────────────────────────────────

  showLoading(message = '読み込み中...') {
    const el = document.getElementById('app');
    if (!el) return;
    const msgEl = document.createElement('p');
    msgEl.className = 'text-sm';
    msgEl.textContent = message;
    el.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'min-h-screen flex flex-col items-center justify-center gap-4 text-slate-500';
    const spinner = document.createElement('div');
    spinner.className = 'w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin';
    wrap.appendChild(spinner);
    wrap.appendChild(msgEl);
    el.appendChild(wrap);
  },

  hideLoading() {
    // ページコンテンツが上書きするので何もしない
  },

  // ─── エラーページ ─────────────────────────────────

  showError(message, retryFn = null) {
    const el = document.getElementById('app');
    if (!el) return;
    el.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'min-h-screen flex flex-col items-center justify-center gap-6 px-4';

    const icon = document.createElement('span');
    icon.className = 'material-icons-outlined text-red-400 text-6xl';
    icon.textContent = 'error_outline';

    const textWrap = document.createElement('div');
    textWrap.className = 'text-center';
    const title = document.createElement('p');
    title.className = 'text-xl font-bold text-slate-700 mb-2';
    title.textContent = 'エラーが発生しました';
    const msg = document.createElement('p');
    msg.className = 'text-slate-500 text-sm';
    msg.textContent = message;
    textWrap.appendChild(title);
    textWrap.appendChild(msg);

    const btnWrap = document.createElement('div');
    btnWrap.className = 'flex gap-3';

    if (retryFn) {
      const retryBtn = document.createElement('button');
      retryBtn.className = 'px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium';
      retryBtn.textContent = '再試行';
      retryBtn.onclick = () => { try { eval(retryFn); } catch(e) {} };
      btnWrap.appendChild(retryBtn);
    }

    const homeBtn = document.createElement('button');
    homeBtn.className = 'px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium';
    homeBtn.textContent = 'ホームへ';
    homeBtn.onclick = () => AppRouter.go('home');
    btnWrap.appendChild(homeBtn);

    wrap.appendChild(icon);
    wrap.appendChild(textWrap);
    wrap.appendChild(btnWrap);
    el.appendChild(wrap);
  },
};

window.AppUI = AppUI;
