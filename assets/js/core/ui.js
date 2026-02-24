/**
 * LinkUp 共通UIモジュール - リデザイン版
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
    const ddName    = document.getElementById('nav-dropdown-name');

    if (!navAuth || !navUser) return;

    if (user) {
      navAuth.classList.add('hidden');
      navUser.classList.remove('hidden');

      const avatarUrl = user.avatar_url || user.icon_url
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.display_name || user.name || 'U')}&background=2563EB&color=fff&bold=true&size=64`;

      if (navAvatar) navAvatar.src = avatarUrl;
      if (navName)   navName.textContent = user.display_name || user.name || '';
      if (ddName)    ddName.textContent  = user.display_name || user.name || 'ユーザー';

      // ロールに応じてボタンを表示/非表示
      if (navOrgBtn) {
        if (user.role === 'organizer' || user.role === 'admin') {
          navOrgBtn.classList.remove('hidden');
          navOrgBtn.style.display = 'flex';
        } else {
          navOrgBtn.classList.add('hidden');
          navOrgBtn.style.display = '';
        }
      }
      if (navAdmBtn) {
        if (user.role === 'admin') {
          navAdmBtn.classList.remove('hidden');
          navAdmBtn.style.display = 'flex';
        } else {
          navAdmBtn.classList.add('hidden');
          navAdmBtn.style.display = '';
        }
      }

    } else {
      navAuth.classList.remove('hidden');
      navUser.classList.add('hidden');
      if (navOrgBtn) navOrgBtn.classList.add('hidden');
      if (navAdmBtn) navAdmBtn.classList.add('hidden');
    }
  },

  // ─── トースト通知（リッチバージョン） ─────────────

  toast(message, type = 'info') {
    // 既存のトーストを削除
    document.querySelectorAll('.lu-toast').forEach(el => {
      el.classList.add('lu-toast-exit');
      setTimeout(() => el.remove(), 300);
    });

    const configs = {
      success: {
        bg: 'bg-emerald-500',
        ring: 'ring-emerald-400/50',
        icon: 'check_circle',
        iconBg: 'bg-white/20',
      },
      error: {
        bg: 'bg-red-500',
        ring: 'ring-red-400/50',
        icon: 'error',
        iconBg: 'bg-white/20',
      },
      warning: {
        bg: 'bg-amber-500',
        ring: 'ring-amber-400/50',
        icon: 'warning',
        iconBg: 'bg-white/20',
      },
      info: {
        bg: 'bg-blue-600',
        ring: 'ring-blue-400/50',
        icon: 'info',
        iconBg: 'bg-white/20',
      },
    };

    const cfg = configs[type] || configs.info;

    const el = document.createElement('div');
    el.className = `lu-toast fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 pl-3 pr-5 py-3 rounded-2xl text-white ring-1 ${cfg.ring} ${cfg.bg}`;
    el.style.cssText = 'box-shadow: 0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.1); min-width: 280px; max-width: min(90vw, 420px);';

    // アイコン
    const iconWrap = document.createElement('div');
    iconWrap.className = `flex-shrink-0 w-8 h-8 ${cfg.iconBg} rounded-xl flex items-center justify-center`;
    const iconEl = document.createElement('span');
    iconEl.className = 'material-icons-outlined text-white text-base';
    iconEl.textContent = cfg.icon;
    iconWrap.appendChild(iconEl);

    // メッセージ
    const msgEl = document.createElement('span');
    msgEl.className = 'text-sm font-semibold leading-snug flex-1';
    msgEl.textContent = message;

    // 閉じるボタン
    const closeBtn = document.createElement('button');
    closeBtn.className = 'flex-shrink-0 ml-1 opacity-70 hover:opacity-100 transition-opacity';
    closeBtn.innerHTML = '<span class="material-icons-outlined text-white" style="font-size:16px;">close</span>';
    closeBtn.onclick = () => {
      el.classList.add('lu-toast-exit');
      setTimeout(() => el.remove(), 300);
    };

    el.appendChild(iconWrap);
    el.appendChild(msgEl);
    el.appendChild(closeBtn);
    document.body.appendChild(el);

    // 自動削除
    const timer = setTimeout(() => {
      if (el.parentNode) {
        el.classList.add('lu-toast-exit');
        setTimeout(() => el.remove(), 300);
      }
    }, 4000);

    // ホバーで一時停止
    el.addEventListener('mouseenter', () => clearTimeout(timer));
  },

  // ─── モーダル ──────────────────────────────────────

  openModal(html) {
    const wrap  = document.getElementById('modal-container');
    const inner = document.getElementById('modal-content');
    if (!wrap || !inner) return;
    inner.innerHTML = html;
    // アニメーションのリセット
    inner.style.animation = 'none';
    inner.offsetHeight; // reflow
    inner.style.animation = '';
    wrap.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    // フォーカスを最初のインプットに移動
    setTimeout(() => {
      const firstInput = inner.querySelector('input');
      if (firstInput) firstInput.focus();
    }, 100);
  },

  closeModal() {
    const wrap  = document.getElementById('modal-container');
    const inner = document.getElementById('modal-content');
    if (!wrap) return;
    // フェードアウトアニメーション
    if (inner) {
      inner.style.animation = 'modalClose 0.2s ease forwards';
      inner.style.opacity = '0';
      inner.style.transform = 'scale(0.96) translateY(8px)';
      inner.style.transition = 'all 0.2s ease';
    }
    setTimeout(() => {
      wrap.classList.add('hidden');
      if (inner) {
        inner.style.animation = '';
        inner.style.opacity = '';
        inner.style.transform = '';
        inner.style.transition = '';
      }
      document.body.style.overflow = '';
    }, 200);
  },

  // ─── 共通モーダルシェル ─────────────────────────────

  _modalShell(opts = {}) {
    const {
      title, subtitle, icon, iconBg = 'bg-blue-600', iconColor = 'text-white',
      accent = 'blue', borderTop = '', content, footer,
    } = opts;

    const accentRing = {
      blue:   'ring-blue-100',
      red:    'ring-red-100',
      green:  'ring-green-100',
      purple: 'ring-purple-100',
    }[accent] || 'ring-slate-100';

    return `
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-auto overflow-hidden ring-1 ${accentRing}" style="max-height: 90vh; overflow-y: auto;">
        ${borderTop ? `<div class="h-1 w-full ${borderTop}"></div>` : ''}
        <div class="p-8">
          ${icon ? `
            <div class="flex items-start gap-4 mb-6">
              <div class="flex-shrink-0 w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center shadow-md">
                <span class="material-icons-outlined ${iconColor} text-xl">${icon}</span>
              </div>
              <div class="flex-1 min-w-0">
                ${title ? `<h2 class="text-2xl font-extrabold text-slate-900 leading-tight">${title}</h2>` : ''}
                ${subtitle ? `<p class="text-sm text-slate-400 mt-1">${subtitle}</p>` : ''}
              </div>
              <button onclick="AppUI.closeModal()" class="flex-shrink-0 w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                <span class="material-icons-outlined text-slate-400 text-base">close</span>
              </button>
            </div>
          ` : `
            <div class="flex items-center justify-between mb-6">
              <div>
                ${title ? `<h2 class="text-2xl font-extrabold text-slate-900">${title}</h2>` : ''}
                ${subtitle ? `<p class="text-sm text-slate-400 mt-1">${subtitle}</p>` : ''}
              </div>
              <button onclick="AppUI.closeModal()" class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                <span class="material-icons-outlined text-slate-400 text-base">close</span>
              </button>
            </div>
          `}
          ${content}
        </div>
        ${footer ? `<div class="px-8 pb-6 -mt-2">${footer}</div>` : ''}
      </div>
    `;
  },

  // ─── フォームインプットのスタイル ───────────────────

  _inputClass(accent = 'blue') {
    return 'form-input w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 bg-slate-50/50 hover:bg-white transition-all';
  },

  _labelClass() {
    return 'block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5';
  },

  _submitBtnClass(accent = 'blue') {
    const bgMap = {
      blue: 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600',
      red:  'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600',
    };
    return `w-full ${bgMap[accent] || bgMap.blue} text-white font-bold py-3.5 px-6 rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2`;
  },

  // ─── 一般ユーザー・主催者ログインモーダル ──────────

  openLoginModal() {
    this.openModal(this._modalShell({
      title: 'おかえりなさい',
      subtitle: '参加者・主催者の方はこちら',
      icon: 'login',
      iconBg: 'bg-blue-600',
      accent: 'blue',
      content: `
        <form id="login-form" class="space-y-4">
          <div>
            <label class="${this._labelClass()}">メールアドレス</label>
            <input type="email" name="email" required autocomplete="email"
              class="${this._inputClass()}"
              placeholder="your@email.com">
          </div>
          <div>
            <label class="${this._labelClass()}">パスワード</label>
            <div class="relative">
              <input type="password" name="password" id="login-password" required autocomplete="current-password"
                class="${this._inputClass()} pr-12"
                placeholder="••••••••">
              <button type="button" onclick="_togglePw('login-password', 'toggle-login-pw')"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                <span id="toggle-login-pw" class="material-icons-outlined text-xl">visibility</span>
              </button>
            </div>
          </div>
          <button type="submit" class="${this._submitBtnClass('blue')} mt-2">
            <span class="material-icons-outlined text-lg">login</span>
            <span>ログイン</span>
          </button>
        </form>
      `,
      footer: `
        <div class="text-center space-y-3">
          <p class="text-sm text-slate-500">
            アカウントをお持ちでない方は
            <button onclick="AppUI.openRegisterModal()" class="text-blue-600 font-bold hover:underline">新規登録</button>
          </p>
          <div class="border-t border-slate-100 pt-3">
            <button onclick="AppUI.openAdminLoginModal()"
              class="text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 mx-auto">
              <span class="material-icons-outlined text-sm">admin_panel_settings</span>
              管理者ログインはこちら
            </button>
          </div>
        </div>
      `
    }));

    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.innerHTML = '<span class="material-icons-outlined text-lg animate-spin">autorenew</span><span>ログイン中...</span>';
      const fd = new FormData(e.target);
      await AppAuth.login(fd.get('email'), fd.get('password'));
      btn.disabled = false;
      btn.innerHTML = '<span class="material-icons-outlined text-lg">login</span><span>ログイン</span>';
    });
  },

  // ─── 管理者専用ログインモーダル ────────────────────

  openAdminLoginModal() {
    this.openModal(this._modalShell({
      title: '管理者ログイン',
      subtitle: '⚠️ このページは管理者専用です',
      icon: 'admin_panel_settings',
      iconBg: 'bg-red-600',
      accent: 'red',
      borderTop: 'bg-gradient-to-r from-red-600 to-red-400',
      content: `
        <div class="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4 flex items-start gap-2.5">
          <span class="material-icons-outlined text-red-500 text-base flex-shrink-0 mt-0.5">security</span>
          <p class="text-xs text-red-600 font-medium leading-relaxed">不正アクセスはすべて記録されます。権限のない方のアクセスは禁止されています。</p>
        </div>
        <form id="admin-login-form" class="space-y-4">
          <div>
            <label class="${this._labelClass()}">管理者メールアドレス</label>
            <input type="email" name="email" required autocomplete="off"
              class="form-input w-full border border-red-200 rounded-xl px-4 py-3 text-sm bg-red-50/30 focus:bg-white transition-all"
              placeholder="admin@example.com">
          </div>
          <div>
            <label class="${this._labelClass()}">管理者パスワード</label>
            <div class="relative">
              <input type="password" name="password" id="admin-password" required autocomplete="off"
                class="form-input w-full border border-red-200 rounded-xl px-4 py-3 text-sm bg-red-50/30 focus:bg-white transition-all pr-12"
                placeholder="••••••••">
              <button type="button" onclick="_togglePw('admin-password', 'toggle-admin-pw')"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                <span id="toggle-admin-pw" class="material-icons-outlined text-xl">visibility</span>
              </button>
            </div>
          </div>
          <button type="submit" class="${this._submitBtnClass('red')} mt-2">
            <span class="material-icons-outlined text-lg">admin_panel_settings</span>
            <span>管理者としてログイン</span>
          </button>
        </form>
      `,
      footer: `
        <div class="text-center">
          <button onclick="AppUI.openLoginModal()"
            class="text-sm text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1 mx-auto">
            <span class="material-icons-outlined text-base">arrow_back</span>
            一般ログインに戻る
          </button>
        </div>
      `
    }));

    document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.innerHTML = '<span class="material-icons-outlined text-lg animate-spin">autorenew</span><span>認証中...</span>';
      const fd = new FormData(e.target);
      await AppAuth.loginAsAdmin(fd.get('email'), fd.get('password'));
      btn.disabled = false;
      btn.innerHTML = '<span class="material-icons-outlined text-lg">admin_panel_settings</span><span>管理者としてログイン</span>';
    });
  },

  // ─── 新規登録モーダル（admin ロール不可） ───────────

  openRegisterModal() {
    this.openModal(this._modalShell({
      title: 'アカウント作成',
      subtitle: '無料で登録して、イベントに参加しよう',
      icon: 'person_add',
      iconBg: 'bg-gradient-to-br from-blue-600 to-blue-500',
      accent: 'blue',
      content: `
        <form id="register-form" class="space-y-4">
          <div>
            <label class="${this._labelClass()}">お名前</label>
            <input type="text" name="name" required autocomplete="name"
              class="${this._inputClass()}"
              placeholder="山田 太郎">
          </div>
          <div>
            <label class="${this._labelClass()}">メールアドレス</label>
            <input type="email" name="email" required autocomplete="email"
              class="${this._inputClass()}"
              placeholder="your@email.com">
          </div>
          <div>
            <label class="${this._labelClass()}">パスワード（8文字以上）</label>
            <div class="relative">
              <input type="password" name="password" id="register-password" required minlength="8" autocomplete="new-password"
                class="${this._inputClass()} pr-12"
                placeholder="••••••••">
              <button type="button" onclick="_togglePw('register-password', 'toggle-reg-pw')"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                <span id="toggle-reg-pw" class="material-icons-outlined text-xl">visibility</span>
              </button>
            </div>
          </div>
          <div>
            <label class="${this._labelClass()}">アカウント種別</label>
            <select name="role" class="${this._inputClass()}">
              <option value="attendee">🎫 参加者（イベントに参加する）</option>
              <option value="organizer">🎪 主催者（イベントを開催する）</option>
            </select>
          </div>
          <button type="submit" class="${this._submitBtnClass('blue')} mt-2">
            <span class="material-icons-outlined text-lg">how_to_reg</span>
            <span>無料で登録する</span>
          </button>
        </form>
      `,
      footer: `
        <div class="text-center space-y-2">
          <p class="text-sm text-slate-500">
            すでにアカウントをお持ちの方は
            <button onclick="AppUI.openLoginModal()" class="text-blue-600 font-bold hover:underline">ログイン</button>
          </p>
          <p class="text-xs text-slate-400 leading-relaxed">
            登録することで<span class="underline cursor-default">利用規約</span>および<span class="underline cursor-default">プライバシーポリシー</span>に同意したものとみなします。
          </p>
        </div>
      `
    }));

    document.getElementById('register-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.innerHTML = '<span class="material-icons-outlined text-lg animate-spin">autorenew</span><span>登録中...</span>';
      const fd = new FormData(e.target);
      await AppAuth.register(fd.get('email'), fd.get('password'), fd.get('name'), fd.get('role'));
      btn.disabled = false;
      btn.innerHTML = '<span class="material-icons-outlined text-lg">how_to_reg</span><span>無料で登録する</span>';
    });
  },

  // ─── ローディング ──────────────────────────────────

  showLoading(message = '読み込み中...') {
    const el = document.getElementById('app');
    if (!el) return;
    el.innerHTML = `
      <div class="min-h-screen flex flex-col items-center justify-center gap-5 text-slate-500">
        <div class="relative">
          <div class="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
            <div class="w-8 h-8 border-[3px] border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        </div>
        <div class="text-center">
          <p class="text-sm font-medium text-slate-600">${_escapeHtml(message)}</p>
          <p class="text-xs text-slate-400 mt-1">しばらくお待ちください</p>
        </div>
      </div>
    `;
  },

  hideLoading() {
    // ページコンテンツが上書きするので何もしない
  },

  // ─── エラーページ ─────────────────────────────────

  showError(message, retryFn = null) {
    const el = document.getElementById('app');
    if (!el) return;
    el.innerHTML = `
      <div class="min-h-screen flex flex-col items-center justify-center gap-6 px-4 bg-slate-50">
        <div class="text-center max-w-md">
          <div class="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <span class="material-icons-outlined text-red-400" style="font-size: 40px;">error_outline</span>
          </div>
          <h2 class="text-2xl font-extrabold text-slate-800 mb-2">エラーが発生しました</h2>
          <p class="text-slate-500 text-sm leading-relaxed mb-8">${_escapeHtml(message || '不明なエラーが発生しました')}</p>
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            ${retryFn ? `
              <button onclick="try { eval(${JSON.stringify(retryFn)}); } catch(e) {}"
                class="btn-primary px-6 py-3 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2">
                <span class="material-icons-outlined text-base">refresh</span>
                再試行
              </button>
            ` : ''}
            <button onclick="AppRouter.go('home')"
              class="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50 transition flex items-center justify-center gap-2">
              <span class="material-icons-outlined text-base">home</span>
              ホームへ戻る
            </button>
          </div>
        </div>
      </div>
    `;
  },
};

// ─── パスワード表示トグル（グローバル） ──────────────
window._togglePw = function(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon  = document.getElementById(iconId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (icon) icon.textContent = 'visibility_off';
  } else {
    input.type = 'password';
    if (icon) icon.textContent = 'visibility';
  }
};

window.AppUI = AppUI;
