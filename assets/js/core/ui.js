/**
 * LinkUp UI ユーティリティ
 * Design System: "Code Editor Dark" — Frontend Design Skill準拠
 * セキュリティポリシー:
 * - organizer/admin ボタンはロール別に表示制御
 * - モーダルは DOM 操作で安全に生成
 */

const AppUI = {

  // ─── ナビゲーション更新 ──────────────────────────────
  updateNav() {
    const user = window.currentUser;
    const navAvatar   = document.getElementById('nav-avatar');
    const navAvatarImg = document.getElementById('nav-avatar-img');
    const navLoginBtn  = document.getElementById('nav-login-btn');
    const navRegBtn    = document.getElementById('nav-register-btn');
    const navUserArea  = document.getElementById('nav-user-area');
    const navOrgBtn    = document.getElementById('nav-organizer-btn');
    const navAdmBtn    = document.getElementById('nav-admin-btn');
    const navUserName  = document.getElementById('nav-user-name');

    if (user) {
      if (navLoginBtn)  navLoginBtn.classList.add('hidden');
      if (navRegBtn)    navRegBtn.classList.add('hidden');
      if (navUserArea)  navUserArea.classList.remove('hidden');

      const avatarUrl = user.avatar_url || user.icon_url
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.display_name || user.name || 'U')}&background=00D9FF&color=0A0F1E&bold=true`;

      if (navAvatarImg) navAvatarImg.src = avatarUrl;
      if (navAvatar)    navAvatar.src    = avatarUrl;
      if (navUserName)  navUserName.textContent = user.display_name || user.name || '';

      if (navOrgBtn) {
        navOrgBtn.classList.toggle('hidden', !['organizer', 'admin'].includes(user.role));
      }
      if (navAdmBtn) {
        navAdmBtn.classList.toggle('hidden', user.role !== 'admin');
      }
    } else {
      if (navLoginBtn)  navLoginBtn.classList.remove('hidden');
      if (navRegBtn)    navRegBtn.classList.remove('hidden');
      if (navUserArea)  navUserArea.classList.add('hidden');
      if (navOrgBtn)    navOrgBtn.classList.add('hidden');
      if (navAdmBtn)    navAdmBtn.classList.add('hidden');
    }
  },

  // ─── トースト通知（ダークテーマ版） ─────────────────

  toast(message, type = 'info') {
    document.querySelectorAll('.lu-toast').forEach(el => {
      el.classList.add('lu-toast-exit');
      setTimeout(() => el.remove(), 300);
    });

    const configs = {
      success: { border: 'rgba(57,255,20,0.4)',  icon: 'check_circle',  iconColor: '#39FF14' },
      error:   { border: 'rgba(255,51,102,0.5)', icon: 'error',         iconColor: '#FF3366' },
      warning: { border: 'rgba(255,170,0,0.4)',  icon: 'warning',       iconColor: '#FFAA00' },
      info:    { border: 'rgba(0,217,255,0.4)',   icon: 'info',          iconColor: '#00D9FF' },
    };
    const cfg = configs[type] || configs.info;

    const el = document.createElement('div');
    el.className = 'lu-toast fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 pl-3 pr-5 py-3 rounded-2xl';
    el.style.cssText = `
      background: var(--c-raised);
      border: 1px solid ${cfg.border};
      color: var(--c-text);
      box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
      min-width: 280px; max-width: min(90vw, 420px);
      animation: slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1);
    `;

    const iconWrap = document.createElement('div');
    iconWrap.style.cssText = `
      flex-shrink:0; width:32px; height:32px;
      background: ${cfg.border.replace('0.4','0.15').replace('0.5','0.15')};
      border-radius: 10px; display:flex; align-items:center; justify-content:center;
    `;
    const iconEl = document.createElement('span');
    iconEl.className = 'material-icons-outlined';
    iconEl.style.cssText = `font-size:18px; color:${cfg.iconColor};`;
    iconEl.textContent = cfg.icon;
    iconWrap.appendChild(iconEl);

    const msgEl = document.createElement('span');
    msgEl.style.cssText = 'font-size:14px; font-weight:600; line-height:1.4; flex:1; color:var(--c-text);';
    msgEl.textContent = message;

    const closeBtn = document.createElement('button');
    closeBtn.style.cssText = 'flex-shrink:0; opacity:0.5; transition:opacity 0.15s;';
    closeBtn.innerHTML = '<span class="material-icons-outlined" style="font-size:16px; color:var(--c-dim);">close</span>';
    closeBtn.onmouseenter = () => closeBtn.style.opacity = '1';
    closeBtn.onmouseleave = () => closeBtn.style.opacity = '0.5';
    closeBtn.onclick = () => {
      el.classList.add('lu-toast-exit');
      setTimeout(() => el.remove(), 300);
    };

    el.appendChild(iconWrap);
    el.appendChild(msgEl);
    el.appendChild(closeBtn);
    document.body.appendChild(el);

    const timer = setTimeout(() => {
      if (el.parentNode) {
        el.classList.add('lu-toast-exit');
        setTimeout(() => el.remove(), 300);
      }
    }, 4000);
    el.addEventListener('mouseenter', () => clearTimeout(timer));
  },

  // ─── モーダル ──────────────────────────────────────

  openModal(html) {
    const wrap  = document.getElementById('modal-container');
    const inner = document.getElementById('modal-content');
    if (!wrap || !inner) return;
    inner.innerHTML = html;
    inner.style.animation = 'none';
    inner.offsetHeight;
    inner.style.animation = '';
    wrap.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      const firstInput = inner.querySelector('input');
      if (firstInput) firstInput.focus();
    }, 100);
  },

  closeModal() {
    const wrap  = document.getElementById('modal-container');
    const inner = document.getElementById('modal-content');
    if (!wrap) return;
    if (inner) {
      inner.style.opacity = '0';
      inner.style.transform = 'scale(0.96) translateY(8px)';
      inner.style.transition = 'all 0.2s ease';
    }
    setTimeout(() => {
      wrap.classList.add('hidden');
      if (inner) {
        inner.style.opacity = '';
        inner.style.transform = '';
        inner.style.transition = '';
      }
      document.body.style.overflow = '';
    }, 200);
  },

  // ─── 共通モーダルシェル（ダークテーマ版） ───────────

  _modalShell(opts = {}) {
    const {
      title, subtitle, icon, iconBg = '', iconColor = 'text-white',
      accent = 'blue', borderTop = '', content, footer,
    } = opts;

    const accentColors = {
      blue:   { border: 'rgba(0,217,255,0.2)',  topGrad: 'linear-gradient(90deg,#00D9FF,#0099CC)',  iconBg: 'rgba(0,217,255,0.12)',  iconColor: '#00D9FF' },
      red:    { border: 'rgba(255,51,102,0.2)', topGrad: 'linear-gradient(90deg,#FF3366,#CC0044)',  iconBg: 'rgba(255,51,102,0.12)', iconColor: '#FF3366' },
      green:  { border: 'rgba(57,255,20,0.2)',  topGrad: 'linear-gradient(90deg,#39FF14,#22CC0A)',  iconBg: 'rgba(57,255,20,0.12)',  iconColor: '#39FF14' },
      purple: { border: 'rgba(155,89,255,0.2)', topGrad: 'linear-gradient(90deg,#9B59FF,#7733CC)',  iconBg: 'rgba(155,89,255,0.12)', iconColor: '#9B59FF' },
    };
    const ac = accentColors[accent] || accentColors.blue;

    return `
      <div style="
        background: var(--c-surface);
        border: 1px solid ${ac.border};
        border-radius: 20px;
        width: 100%; max-width: 440px; margin: 0 auto;
        overflow: hidden; max-height: 90vh; overflow-y: auto;
        box-shadow: 0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04);
      ">
        ${borderTop ? `<div style="height:3px; background:${ac.topGrad};"></div>` : ''}
        <div style="padding: 28px;">
          ${icon ? `
            <div style="display:flex; align-items:flex-start; gap:16px; margin-bottom:24px;">
              <div style="flex-shrink:0; width:48px; height:48px; border-radius:14px; background:${ac.iconBg}; border:1px solid ${ac.border}; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 16px rgba(0,0,0,0.3);">
                <span class="material-icons-outlined" style="font-size:20px; color:${ac.iconColor};">${icon}</span>
              </div>
              <div style="flex:1; min-width:0;">
                ${title    ? `<h2 style="font-size:22px; font-weight:800; color:var(--c-text); line-height:1.2;">${title}</h2>` : ''}
                ${subtitle ? `<p  style="font-size:13px; color:var(--c-dim); margin-top:4px;">${subtitle}</p>` : ''}
              </div>
              <button onclick="AppUI.closeModal()"
                style="flex-shrink:0; width:32px; height:32px; border-radius:10px; background:var(--c-raised); border:1px solid var(--c-border); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:background 0.15s;">
                <span class="material-icons-outlined" style="font-size:16px; color:var(--c-dim);">close</span>
              </button>
            </div>
          ` : `
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:24px;">
              <div>
                ${title    ? `<h2 style="font-size:22px; font-weight:800; color:var(--c-text);">${title}</h2>` : ''}
                ${subtitle ? `<p  style="font-size:13px; color:var(--c-dim); margin-top:4px;">${subtitle}</p>` : ''}
              </div>
              <button onclick="AppUI.closeModal()"
                style="width:32px; height:32px; border-radius:10px; background:var(--c-raised); border:1px solid var(--c-border); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:background 0.15s;">
                <span class="material-icons-outlined" style="font-size:16px; color:var(--c-dim);">close</span>
              </button>
            </div>
          `}
          ${content}
        </div>
        ${footer ? `<div style="padding:0 28px 24px; margin-top:-8px;">${footer}</div>` : ''}
      </div>
    `;
  },

  // ─── フォームスタイルヘルパー ─────────────────────

  _inputClass(accent = 'blue') {
    return `w-full rounded-xl px-4 py-3 text-sm transition-all outline-none`
      + ` style="background:var(--c-raised); border:1.5px solid var(--c-border); color:var(--c-text);"`;
  },

  _inputStyle() {
    return `background:var(--c-raised); border:1.5px solid var(--c-border); color:var(--c-text); border-radius:12px; padding:10px 16px; font-size:14px; width:100%; transition:border-color 0.15s, box-shadow 0.15s; outline:none;`;
  },

  _labelClass() {
    return 'block text-xs font-bold uppercase tracking-wide mb-1.5';
  },

  _labelStyle() {
    return 'display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:var(--c-dim); margin-bottom:6px;';
  },

  _submitBtnClass(accent = 'blue') {
    if (accent === 'red') {
      return `w-full font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-sm`;
    }
    return `btn-primary w-full font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 text-sm`;
  },

  _submitBtnStyle(accent = 'blue') {
    if (accent === 'red') {
      return `background:linear-gradient(135deg,#FF3366,#CC0044); color:#fff; border:none; cursor:pointer; font-weight:700; border-radius:12px; padding:14px; width:100%; display:flex; align-items:center; justify-content:center; gap:8px; font-size:14px; transition:all 0.15s;`;
    }
    return `background:linear-gradient(135deg,var(--accent),#00AACC); color:var(--c-bg); border:none; cursor:pointer; font-weight:800; border-radius:12px; padding:14px; width:100%; display:flex; align-items:center; justify-content:center; gap:8px; font-size:14px; transition:all 0.15s;`;
  },

  // ─── ログインモーダル ───────────────────────────────

  openLoginModal() {
    this.openModal(this._modalShell({
      title: 'おかえりなさい',
      subtitle: '参加者・主催者の方はこちら',
      icon: 'login',
      iconBg: '',
      accent: 'blue',
      content: `
        <form id="login-form" class="space-y-4">
          <div>
            <label style="${this._labelStyle()}">メールアドレス</label>
            <input type="email" name="email" required autocomplete="email"
              style="${this._inputStyle()}"
              placeholder="your@email.com"
              onfocus="this.style.borderColor='var(--accent)';this.style.boxShadow='0 0 0 3px var(--accent-dim)'"
              onblur="this.style.borderColor='var(--c-border)';this.style.boxShadow='none'">
          </div>
          <div>
            <label style="${this._labelStyle()}">パスワード</label>
            <div style="position:relative;">
              <input type="password" name="password" id="login-password" required autocomplete="current-password"
                style="${this._inputStyle()} padding-right:44px;"
                placeholder="••••••••"
                onfocus="this.style.borderColor='var(--accent)';this.style.boxShadow='0 0 0 3px var(--accent-dim)'"
                onblur="this.style.borderColor='var(--c-border)';this.style.boxShadow='none'">
              <button type="button" onclick="_togglePw('login-password','toggle-login-pw')"
                style="position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:var(--c-dim);">
                <span id="toggle-login-pw" class="material-icons-outlined" style="font-size:20px;">visibility</span>
              </button>
            </div>
          </div>
          <button type="submit" style="${this._submitBtnStyle('blue')} margin-top:8px;">
            <span class="material-icons-outlined" style="font-size:18px;">login</span>
            <span>ログイン</span>
          </button>
        </form>
      `,
      footer: `
        <div style="text-align:center;">
          <p style="font-size:14px; color:var(--c-dim);">
            アカウントをお持ちでない方は
            <button onclick="AppUI.openRegisterModal()" style="color:var(--accent); font-weight:700; background:none; border:none; cursor:pointer;">新規登録</button>
          </p>
          <div style="border-top:1px solid var(--c-border); margin-top:12px; padding-top:12px;">
            <button onclick="AppUI.openAdminLoginModal()"
              style="font-size:12px; color:var(--c-dim); background:none; border:none; cursor:pointer; display:flex; align-items:center; gap:4px; margin:0 auto;">
              <span class="material-icons-outlined" style="font-size:14px;">admin_panel_settings</span>
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
      btn.innerHTML = '<span class="material-icons-outlined" style="font-size:18px;animation:spin 1s linear infinite;">autorenew</span><span>ログイン中...</span>';
      const fd = new FormData(e.target);
      await AppAuth.login(fd.get('email'), fd.get('password'));
      btn.disabled = false;
      btn.innerHTML = '<span class="material-icons-outlined" style="font-size:18px;">login</span><span>ログイン</span>';
    });
  },

  // ─── 管理者ログインモーダル ─────────────────────────

  openAdminLoginModal() {
    this.openModal(this._modalShell({
      title: '管理者ログイン',
      subtitle: '⚠️ このページは管理者専用です',
      icon: 'admin_panel_settings',
      iconBg: '',
      accent: 'red',
      borderTop: 'bg-gradient-to-r from-red-600 to-red-400',
      content: `
        <div style="background:rgba(255,51,102,0.08); border:1px solid rgba(255,51,102,0.2); border-radius:12px; padding:12px 16px; margin-bottom:16px; display:flex; align-items:flex-start; gap:10px;">
          <span class="material-icons-outlined" style="color:var(--hot); font-size:16px; flex-shrink:0; margin-top:2px;">security</span>
          <p style="font-size:12px; color:var(--hot); line-height:1.6;">不正アクセスはすべて記録されます。権限のない方のアクセスは禁止されています。</p>
        </div>
        <form id="admin-login-form" class="space-y-4">
          <div>
            <label style="${this._labelStyle()}">管理者メールアドレス</label>
            <input type="email" name="email" required autocomplete="off"
              style="${this._inputStyle().replace('var(--c-border)', 'rgba(255,51,102,0.3)')}"
              placeholder="admin@example.com"
              onfocus="this.style.borderColor='var(--hot)';this.style.boxShadow='0 0 0 3px var(--hot-dim)'"
              onblur="this.style.borderColor='rgba(255,51,102,0.3)';this.style.boxShadow='none'">
          </div>
          <div>
            <label style="${this._labelStyle()}">管理者パスワード</label>
            <div style="position:relative;">
              <input type="password" name="password" id="admin-password" required autocomplete="off"
                style="${this._inputStyle().replace('var(--c-border)', 'rgba(255,51,102,0.3)')} padding-right:44px;"
                placeholder="••••••••"
                onfocus="this.style.borderColor='var(--hot)';this.style.boxShadow='0 0 0 3px var(--hot-dim)'"
                onblur="this.style.borderColor='rgba(255,51,102,0.3)';this.style.boxShadow='none'">
              <button type="button" onclick="_togglePw('admin-password','toggle-admin-pw')"
                style="position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:var(--c-dim);">
                <span id="toggle-admin-pw" class="material-icons-outlined" style="font-size:20px;">visibility</span>
              </button>
            </div>
          </div>
          <button type="submit" style="${this._submitBtnStyle('red')} margin-top:8px;">
            <span class="material-icons-outlined" style="font-size:18px;">admin_panel_settings</span>
            <span>管理者としてログイン</span>
          </button>
        </form>
      `,
      footer: `
        <div style="text-align:center;">
          <button onclick="AppUI.openLoginModal()"
            style="font-size:13px; color:var(--c-dim); background:none; border:none; cursor:pointer; display:flex; align-items:center; gap:4px; margin:0 auto; transition:color 0.15s;"
            onmouseenter="this.style.color='var(--accent)'" onmouseleave="this.style.color='var(--c-dim)'">
            <span class="material-icons-outlined" style="font-size:16px;">arrow_back</span>
            一般ログインに戻る
          </button>
        </div>
      `
    }));

    document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.innerHTML = '<span class="material-icons-outlined" style="font-size:18px;">autorenew</span><span>認証中...</span>';
      const fd = new FormData(e.target);
      await AppAuth.loginAsAdmin(fd.get('email'), fd.get('password'));
      btn.disabled = false;
      btn.innerHTML = '<span class="material-icons-outlined" style="font-size:18px;">admin_panel_settings</span><span>管理者としてログイン</span>';
    });
  },

  // ─── 新規登録モーダル ────────────────────────────────

  openRegisterModal() {
    this.openModal(this._modalShell({
      title: 'アカウント作成',
      subtitle: '無料で登録して、イベントに参加しよう',
      icon: 'person_add',
      iconBg: '',
      accent: 'blue',
      content: `
        <form id="register-form" class="space-y-4">
          <div>
            <label style="${this._labelStyle()}">お名前</label>
            <input type="text" name="name" required autocomplete="name"
              style="${this._inputStyle()}"
              placeholder="山田 太郎"
              onfocus="this.style.borderColor='var(--accent)';this.style.boxShadow='0 0 0 3px var(--accent-dim)'"
              onblur="this.style.borderColor='var(--c-border)';this.style.boxShadow='none'">
          </div>
          <div>
            <label style="${this._labelStyle()}">メールアドレス</label>
            <input type="email" name="email" required autocomplete="email"
              style="${this._inputStyle()}"
              placeholder="your@email.com"
              onfocus="this.style.borderColor='var(--accent)';this.style.boxShadow='0 0 0 3px var(--accent-dim)'"
              onblur="this.style.borderColor='var(--c-border)';this.style.boxShadow='none'">
          </div>
          <div>
            <label style="${this._labelStyle()}">パスワード（8文字以上）</label>
            <div style="position:relative;">
              <input type="password" name="password" id="register-password" required minlength="8" autocomplete="new-password"
                style="${this._inputStyle()} padding-right:44px;"
                placeholder="••••••••"
                onfocus="this.style.borderColor='var(--accent)';this.style.boxShadow='0 0 0 3px var(--accent-dim)'"
                onblur="this.style.borderColor='var(--c-border)';this.style.boxShadow='none'">
              <button type="button" onclick="_togglePw('register-password','toggle-reg-pw')"
                style="position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:var(--c-dim);">
                <span id="toggle-reg-pw" class="material-icons-outlined" style="font-size:20px;">visibility</span>
              </button>
            </div>
          </div>
          <div>
            <label style="${this._labelStyle()}">アカウント種別</label>
            <select name="role"
              style="${this._inputStyle()}"
              onfocus="this.style.borderColor='var(--accent)';this.style.boxShadow='0 0 0 3px var(--accent-dim)'"
              onblur="this.style.borderColor='var(--c-border)';this.style.boxShadow='none'">
              <option value="attendee" style="background:var(--c-raised);">🎫 参加者（イベントに参加する）</option>
              <option value="organizer" style="background:var(--c-raised);">🎪 主催者（イベントを開催する）</option>
            </select>
          </div>
          <button type="submit" style="${this._submitBtnStyle('blue')} margin-top:8px;">
            <span class="material-icons-outlined" style="font-size:18px;">how_to_reg</span>
            <span>無料で登録する</span>
          </button>
        </form>
      `,
      footer: `
        <div style="text-align:center;">
          <p style="font-size:14px; color:var(--c-dim); margin-bottom:8px;">
            すでにアカウントをお持ちの方は
            <button onclick="AppUI.openLoginModal()" style="color:var(--accent); font-weight:700; background:none; border:none; cursor:pointer;">ログイン</button>
          </p>
          <p style="font-size:11px; color:var(--c-muted); line-height:1.5;">
            登録することで<span style="text-decoration:underline;">利用規約</span>および<span style="text-decoration:underline;">プライバシーポリシー</span>に同意したものとみなします。
          </p>
        </div>
      `
    }));

    document.getElementById('register-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.innerHTML = '<span class="material-icons-outlined" style="font-size:18px;">autorenew</span><span>登録中...</span>';
      const fd = new FormData(e.target);
      await AppAuth.register(fd.get('email'), fd.get('password'), fd.get('name'), fd.get('role'));
      btn.disabled = false;
      btn.innerHTML = '<span class="material-icons-outlined" style="font-size:18px;">how_to_reg</span><span>無料で登録する</span>';
    });
  },

  // ─── ローディング ──────────────────────────────────

  showLoading(message = '読み込み中...') {
    const el = document.getElementById('app');
    if (!el) return;
    el.innerHTML = `
      <div style="min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:20px; background:var(--c-bg);">
        <div style="position:relative;">
          <div style="width:56px; height:56px; border-radius:16px; background:var(--accent-dim); display:flex; align-items:center; justify-content:center;">
            <div style="width:28px; height:28px; border:2.5px solid var(--c-border); border-top-color:var(--accent); border-radius:50%; animation:spin 0.9s linear infinite;"></div>
          </div>
        </div>
        <div style="text-align:center;">
          <p style="font-size:14px; font-weight:600; color:var(--c-text-1);">${_escapeHtml(message)}</p>
          <p style="font-size:12px; color:var(--c-dim); margin-top:4px;">しばらくお待ちください</p>
        </div>
      </div>
    `;
  },

  hideLoading() {},

  // ─── エラーページ ─────────────────────────────────

  showError(message, retryFn = null) {
    const el = document.getElementById('app');
    if (!el) return;
    el.innerHTML = `
      <div style="min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:24px; padding:24px; background:var(--c-bg);">
        <div style="text-align:center; max-width:440px;">
          <div style="width:80px; height:80px; background:var(--hot-dim); border:1px solid rgba(255,51,102,0.2); border-radius:24px; display:flex; align-items:center; justify-content:center; margin:0 auto 24px;">
            <span class="material-icons-outlined" style="font-size:40px; color:var(--hot);">error_outline</span>
          </div>
          <h2 style="font-size:24px; font-weight:800; color:var(--c-text); margin-bottom:8px;">エラーが発生しました</h2>
          <p style="color:var(--c-dim); font-size:14px; line-height:1.7; margin-bottom:28px;">${_escapeHtml(message || '不明なエラーが発生しました')}</p>
          <div style="display:flex; flex-direction:column; gap:12px; align-items:center;">
            ${retryFn ? `
              <button onclick="try { eval(${JSON.stringify(retryFn)}); } catch(e) {}"
                class="btn-primary" style="padding:12px 24px; border:none; cursor:pointer; border-radius:12px; font-weight:700; font-size:14px; display:flex; align-items:center; gap:8px; color:var(--c-bg);">
                <span class="material-icons-outlined" style="font-size:16px;">refresh</span>
                再試行
              </button>
            ` : ''}
            <button onclick="AppRouter.go('home')"
              style="padding:12px 24px; background:var(--c-raised); border:1px solid var(--c-border); color:var(--c-text-1); border-radius:12px; font-weight:700; font-size:14px; cursor:pointer; display:flex; align-items:center; gap:8px; transition:all 0.15s;">
              <span class="material-icons-outlined" style="font-size:16px;">home</span>
              ホームへ戻る
            </button>
          </div>
        </div>
      </div>
    `;
  },
};

// ─── パスワード表示トグル ─────────────────────────────
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
