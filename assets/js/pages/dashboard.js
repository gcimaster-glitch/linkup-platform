/**
 * ユーザーダッシュボード — LinkUp Design System v3
 *
 * 設計方針:
 * - タブ切り替えはコンテンツ部分のみ差し替え（ヘッダー・ナビは維持）
 * - 初回ロード時にユーザー情報を1回だけ取得してキャッシュ
 * - チケット = 購入済みの証明書として「使いやすさ」を最優先
 * - モバイルファースト（タブはスクロール可能、カードは縦積み）
 */

// ─── グローバルキャッシュ ─────────────────────────────
let _dashOrdersCache = null;

// ─── スタイル定数 ───────────────────────────────────
const _sp = `<div style="display:flex;justify-content:center;padding:56px 0">
  <div style="width:28px;height:28px;border:2px solid var(--c-border);border-top-color:var(--accent);border-radius:50%;animation:spin 0.8s linear infinite"></div>
</div>`;

const _card   = `background:var(--c-surface);border:1px solid var(--c-border);border-radius:16px;`;
const _cardP  = _card + `padding:20px 24px;`;

// ─── タブ定義 ───────────────────────────────────────
const DASH_TABS = [
  { key: 'overview',  label: 'ホーム',       icon: 'home' },
  { key: 'tickets',   label: 'チケット',     icon: 'confirmation_number' },
  { key: 'payments',  label: '決済履歴',     icon: 'receipt_long' },
  { key: 'interests', label: '興味',         icon: 'favorite' },
  { key: 'profile',   label: 'プロフィール', icon: 'manage_accounts' },
];

// ─── メインレンダリング ───────────────────────────────

async function renderDashboard(params = {}) {
  if (!AppAuth.requireLogin()) return;

  const app = document.getElementById('app');
  const tab = DASH_TABS.find(t => t.key === params.tab) ? params.tab : 'overview';

  // キャッシュリセット（新規ロード時）
  _dashOrdersCache = null;

  app.innerHTML = `
    <div style="min-height:100vh;background:var(--c-bg);display:flex;flex-direction:column;">

      <!-- ══ ヘッダー ══ -->
      <div style="background:var(--c-canvas);border-bottom:1px solid var(--c-border);position:sticky;top:64px;z-index:40;">
        <div style="max-width:1100px;margin:0 auto;padding:0 20px;">

          <!-- ユーザー情報バー -->
          <div style="display:flex;align-items:center;gap:14px;padding:16px 0 0;">
            <div style="position:relative;flex-shrink:0;">
              <img id="dash-avatar"
                src="https://ui-avatars.com/api/?name=U&background=00D9FF&color=0A0F1E&bold=true"
                style="width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid var(--c-border);">
              <span style="position:absolute;bottom:1px;right:1px;width:10px;height:10px;background:var(--lime);border-radius:50%;border:2px solid var(--c-canvas);"></span>
            </div>
            <div style="flex:1;min-width:0;">
              <p id="dash-name" style="font-family:'Outfit',sans-serif;font-size:15px;font-weight:700;color:var(--c-text);line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">読み込み中...</p>
              <p id="dash-role-badge" style="font-size:11px;color:var(--c-dim);margin-top:2px;"></p>
            </div>
            <button onclick="AppRouter.go('home')"
              style="display:flex;align-items:center;gap:4px;padding:7px 14px;background:var(--c-surface);border:1px solid var(--c-border);border-radius:99px;color:var(--c-dim);font-size:12px;font-weight:600;cursor:pointer;transition:all 0.15s;flex-shrink:0;"
              onmouseenter="this.style.borderColor='var(--accent)';this.style.color='var(--accent)'"
              onmouseleave="this.style.borderColor='var(--c-border)';this.style.color='var(--c-dim)'">
              <span class="material-icons-outlined" style="font-size:14px;">arrow_back</span>
              <span class="hide-xs">イベントへ</span>
            </button>
          </div>

          <!-- タブバー -->
          <div style="display:flex;gap:0;margin-top:4px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;" id="dash-tabs">
            ${DASH_TABS.map(t => `
              <button id="tab-btn-${t.key}" onclick="_switchDashTab('${t.key}')"
                style="
                  display:flex;align-items:center;gap:6px;padding:12px 18px;border:none;cursor:pointer;
                  font-size:13px;font-weight:600;white-space:nowrap;transition:all 0.15s;
                  background:none;border-bottom:2px solid transparent;
                  ${tab === t.key
                    ? 'color:var(--accent);border-bottom-color:var(--accent);'
                    : 'color:var(--c-dim);'}
                "
                onmouseenter="if(this.dataset.active!=='1')this.style.color='var(--c-text-1)'"
                onmouseleave="if(this.dataset.active!=='1')this.style.color='var(--c-dim)'"
                data-active="${tab === t.key ? '1' : '0'}">
                <span class="material-icons-outlined" style="font-size:16px;">${t.icon}</span>${t.label}
              </button>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- ══ コンテンツ ══ -->
      <main id="dash-content" style="flex:1;max-width:1100px;width:100%;margin:0 auto;padding:28px 20px 60px;">
        ${_sp}
      </main>

    </div>
  `;

  // ユーザー情報セット
  _dashSetUserInfo();

  // タブスイッチ関数をグローバルに登録
  window._switchDashTab = function(key) {
    // アクティブタブ表示更新
    DASH_TABS.forEach(t => {
      const btn = document.getElementById(`tab-btn-${t.key}`);
      if (!btn) return;
      if (t.key === key) {
        btn.style.color = 'var(--accent)';
        btn.style.borderBottomColor = 'var(--accent)';
        btn.dataset.active = '1';
      } else {
        btn.style.color = 'var(--c-dim)';
        btn.style.borderBottomColor = 'transparent';
        btn.dataset.active = '0';
      }
    });
    // URLだけ更新（ページ全体を再レンダリングしない）
    const url = key === 'overview' ? '/dashboard' : `/dashboard/${key}`;
    history.pushState({ view: 'dashboard', params: { tab: key } }, '', url);
    // コンテンツだけ切り替え
    _renderDashContent(key);
  };

  // 初期タブ描画
  await _renderDashContent(tab);
}

// ─── ユーザー情報セット ─────────────────────────────

function _dashSetUserInfo() {
  const user = window.currentUser;
  if (!user) return;
  const el = document.getElementById('dash-avatar');
  const nameEl = document.getElementById('dash-name');
  const roleEl = document.getElementById('dash-role-badge');
  if (el) el.src = user.avatar_url || user.icon_url
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.display_name || user.name || 'U')}&background=00D9FF&color=0A0F1E&bold=true`;
  if (nameEl) nameEl.textContent = user.display_name || user.name || '';
  if (roleEl) {
    const roleMap = { attendee: '参加者', organizer: '主催者', admin: '管理者' };
    roleEl.textContent = roleMap[user.role] || user.role || '';
  }
}

// ─── コンテンツ切り替えディスパッチ ──────────────────

async function _renderDashContent(tab) {
  const el = document.getElementById('dash-content');
  if (!el) return;
  el.innerHTML = _sp;
  el.style.opacity = '0';
  el.style.transform = 'translateY(8px)';

  try {
    switch (tab) {
      case 'overview':  await _dashOverview();  break;
      case 'tickets':   await _dashTickets();   break;
      case 'payments':  await _dashPayments();  break;
      case 'interests': await _dashInterests(); break;
      case 'profile':   await _dashProfile();   break;
      default:          await _dashOverview();
    }
  } catch(err) {
    el.innerHTML = _dashErrorState(err.message);
  }

  // フェードイン
  requestAnimationFrame(() => {
    el.style.transition = 'opacity 0.22s ease, transform 0.22s ease';
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  });
}

// ─── 注文データ取得（キャッシュ付き） ─────────────────

async function _fetchOrders() {
  if (_dashOrdersCache) return _dashOrdersCache;
  const data = await window.LinkUpAPI.Orders.list();
  _dashOrdersCache = data.orders || [];
  return _dashOrdersCache;
}

// ─── エラー表示 ───────────────────────────────────────

function _dashErrorState(msg) {
  return `
    <div style="${_cardP}display:flex;align-items:flex-start;gap:12px;">
      <span class="material-icons-outlined" style="color:var(--hot);font-size:20px;flex-shrink:0;margin-top:2px;">error_outline</span>
      <div>
        <p style="font-size:14px;font-weight:700;color:var(--c-text);margin-bottom:4px;">読み込みに失敗しました</p>
        <p style="font-size:13px;color:var(--c-dim);">${msg || '不明なエラーが発生しました'}</p>
        <button onclick="_renderDashContent(AppRouter.currentParams?.tab||'overview')"
          style="margin-top:12px;display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:var(--c-raised);border:1px solid var(--c-border);border-radius:8px;color:var(--c-text-1);font-size:12px;font-weight:600;cursor:pointer;">
          <span class="material-icons-outlined" style="font-size:14px;">refresh</span>再読み込み
        </button>
      </div>
    </div>
  `;
}

// ════════════════════════════════════════════════════
// ─── 概要タブ ─────────────────────────────────────
// ════════════════════════════════════════════════════

async function _dashOverview() {
  const el   = document.getElementById('dash-content');
  const user = window.currentUser;

  // スケルトン表示
  el.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:28px;">
      ${[1,2,3].map(() => `<div style="${_card}padding:20px 24px;"><div style="width:60%;height:11px;background:var(--c-raised);border-radius:6px;margin-bottom:12px;"></div><div style="width:40%;height:28px;background:var(--c-raised);border-radius:6px;"></div></div>`).join('')}
    </div>
    <div style="${_card}padding:0;overflow:hidden;">
      <div style="padding:18px 24px;border-bottom:1px solid var(--c-border);"><div style="width:120px;height:13px;background:var(--c-raised);border-radius:6px;"></div></div>
      ${[1,2,3].map(() => `<div style="padding:14px 24px;border-bottom:1px solid var(--c-border);display:flex;gap:12px;align-items:center;"><div style="width:44px;height:44px;border-radius:10px;background:var(--c-raised);flex-shrink:0;"></div><div style="flex:1;"><div style="height:13px;background:var(--c-raised);border-radius:6px;margin-bottom:6px;width:70%;"></div><div style="height:11px;background:var(--c-raised);border-radius:6px;width:40%;"></div></div></div>`).join('')}
    </div>
  `;

  try {
    const orders = await _fetchOrders();
    const paid   = orders.filter(o => o.payment_status === 'completed');
    const total  = paid.reduce((s, o) => s + (o.total_amount || 0), 0);
    const upcoming = paid.filter(o => o.start_datetime && new Date(o.start_datetime) > new Date()).length;

    const roleMap  = { attendee: '参加者', organizer: '主催者', admin: '管理者' };
    const roleLabel = roleMap[user?.role] || '参加者';

    el.innerHTML = `
      <!-- ─── スタッツグリッド ─── -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:28px;">

        <div style="${_cardP}">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
            <p style="font-size:12px;font-weight:600;color:var(--c-dim);text-transform:uppercase;letter-spacing:0.06em;">チケット枚数</p>
            <span class="material-icons-outlined" style="font-size:18px;color:var(--accent);opacity:0.7;">confirmation_number</span>
          </div>
          <p style="font-family:'Outfit',sans-serif;font-size:32px;font-weight:800;color:var(--c-text);line-height:1;">${paid.length}</p>
          <p style="font-size:11px;color:var(--c-dim);margin-top:6px;">購入済み</p>
        </div>

        <div style="${_cardP}">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
            <p style="font-size:12px;font-weight:600;color:var(--c-dim);text-transform:uppercase;letter-spacing:0.06em;">合計金額</p>
            <span class="material-icons-outlined" style="font-size:18px;color:var(--violet);opacity:0.7;">payments</span>
          </div>
          <p style="font-family:'Outfit',sans-serif;font-size:32px;font-weight:800;color:var(--c-text);line-height:1;">¥${total.toLocaleString()}</p>
          <p style="font-size:11px;color:var(--c-dim);margin-top:6px;">累計支払い</p>
        </div>

        <div style="${_cardP}">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
            <p style="font-size:12px;font-weight:600;color:var(--c-dim);text-transform:uppercase;letter-spacing:0.06em;">今後のイベント</p>
            <span class="material-icons-outlined" style="font-size:18px;color:var(--lime);opacity:0.7;">event</span>
          </div>
          <p style="font-family:'Outfit',sans-serif;font-size:32px;font-weight:800;color:var(--c-text);line-height:1;">${upcoming}</p>
          <p style="font-size:11px;color:var(--c-dim);margin-top:6px;">予定参加</p>
        </div>
      </div>

      <!-- ─── 最近のチケット ─── -->
      <div style="${_card}overflow:hidden;">
        <div style="padding:18px 24px;border-bottom:1px solid var(--c-border);display:flex;align-items:center;justify-content:space-between;">
          <h3 style="font-size:14px;font-weight:700;color:var(--c-text);">最近のチケット</h3>
          ${paid.length > 3 ? `
            <button onclick="_switchDashTab('tickets')"
              style="font-size:12px;color:var(--accent);background:none;border:none;cursor:pointer;font-weight:600;display:flex;align-items:center;gap:4px;"
              onmouseenter="this.style.textDecoration='underline'" onmouseleave="this.style.textDecoration='none'">
              すべて見る
              <span class="material-icons-outlined" style="font-size:14px;">chevron_right</span>
            </button>
          ` : ''}
        </div>
        ${paid.length === 0 ? `
          <div style="padding:48px 24px;text-align:center;">
            <span class="material-icons-outlined" style="font-size:40px;color:var(--c-muted);display:block;margin-bottom:12px;">confirmation_number</span>
            <p style="font-size:14px;font-weight:600;color:var(--c-text-1);margin-bottom:6px;">チケットはまだありません</p>
            <p style="font-size:13px;color:var(--c-dim);margin-bottom:20px;">気になるイベントを探してみましょう</p>
            <button onclick="AppRouter.go('home')"
              style="padding:10px 24px;background:linear-gradient(135deg,var(--accent),#00AACC);color:var(--c-bg);border:none;cursor:pointer;border-radius:10px;font-weight:700;font-size:13px;">
              イベントを探す
            </button>
          </div>
        ` : paid.slice(0, 5).map((o, i) => _overviewTicketRow(o, i === Math.min(4, paid.length-1))).join('')}
      </div>

      <!-- ─── アカウント情報 ─── -->
      <div style="margin-top:16px;${_cardP}display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
        <div>
          <p style="font-size:11px;color:var(--c-dim);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;">アカウント種別</p>
          <span style="display:inline-flex;align-items:center;gap:6px;padding:5px 12px;background:var(--accent-dim);border:1px solid rgba(0,217,255,0.2);border-radius:99px;font-size:12px;font-weight:700;color:var(--accent);">
            <span class="material-icons-outlined" style="font-size:14px;">verified_user</span>${roleLabel}
          </span>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          ${user?.role === 'organizer' ? `
            <button onclick="AppRouter.go('organizer')"
              style="display:flex;align-items:center;gap:6px;padding:8px 16px;background:var(--c-raised);border:1px solid var(--c-border);border-radius:10px;color:var(--c-text-1);font-size:12px;font-weight:700;cursor:pointer;transition:all 0.15s;"
              onmouseenter="this.style.borderColor='var(--accent)'" onmouseleave="this.style.borderColor='var(--c-border)'">
              <span class="material-icons-outlined" style="font-size:15px;">dashboard</span>主催者ダッシュボード
            </button>
          ` : ''}
          <button onclick="_switchDashTab('profile')"
            style="display:flex;align-items:center;gap:6px;padding:8px 16px;background:var(--c-raised);border:1px solid var(--c-border);border-radius:10px;color:var(--c-text-1);font-size:12px;font-weight:700;cursor:pointer;transition:all 0.15s;"
            onmouseenter="this.style.borderColor='var(--c-muted)'" onmouseleave="this.style.borderColor='var(--c-border)'">
            <span class="material-icons-outlined" style="font-size:15px;">manage_accounts</span>プロフィール編集
          </button>
        </div>
      </div>
    `;
  } catch(err) {
    el.innerHTML = _dashErrorState(err.message);
  }
}

function _overviewTicketRow(o, isLast) {
  const img    = o.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=80&q=60';
  const date   = o.created_at ? new Date(o.created_at).toLocaleDateString('ja-JP') : '-';
  const eDate  = o.start_datetime ? new Date(o.start_datetime).toLocaleDateString('ja-JP',{month:'short',day:'numeric'}) : null;
  const orderId = o.order_id || '';
  const titleSafe = o.event_title ? o.event_title.replace(/'/g, "\\'") : '';
  return `
    <div style="padding:14px 24px;${isLast?'':'border-bottom:1px solid var(--c-border);'}display:flex;align-items:center;gap:14px;transition:background 0.15s;"
      onmouseenter="this.style.background='var(--c-raised)'" onmouseleave="this.style.background='none'">
      <div style="position:relative;flex-shrink:0;">
        <img src="${_escapeHtml(img)}" style="width:46px;height:46px;border-radius:10px;object-fit:cover;"
          onerror="this.src='https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=80&q=60'">
        ${o.checkin_status === 'checked_in' ? `
          <span style="position:absolute;bottom:-3px;right:-3px;width:16px;height:16px;background:var(--lime);border-radius:50%;border:2px solid var(--c-canvas);display:flex;align-items:center;justify-content:center;">
            <span class="material-icons-outlined" style="font-size:9px;color:var(--c-bg);">check</span>
          </span>` : ''}
      </div>
      <div style="flex:1;min-width:0;">
        <p style="font-size:13px;font-weight:700;color:var(--c-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${_escapeHtml(o.event_title || 'イベント')}</p>
        <p style="font-size:11px;color:var(--c-dim);margin-top:2px;">
          ${eDate ? `<span>${eDate}</span> · ` : ''}<span>¥${Number(o.total_amount||0).toLocaleString()}</span>
        </p>
      </div>
      <button onclick="_showTicketQR('${_escapeHtml(orderId)}','${_escapeHtml(titleSafe)}','${date}')"
        style="flex-shrink:0;display:flex;align-items:center;gap:4px;padding:6px 12px;background:var(--c-raised);border:1px solid var(--c-border);border-radius:8px;color:var(--c-dim);font-size:11px;font-weight:600;cursor:pointer;transition:all 0.15s;"
        onmouseenter="this.style.borderColor='var(--accent)';this.style.color='var(--accent)'"
        onmouseleave="this.style.borderColor='var(--c-border)';this.style.color='var(--c-dim)'">
        <span class="material-icons-outlined" style="font-size:14px;">qr_code</span>QR
      </button>
    </div>
  `;
}

// ════════════════════════════════════════════════════
// ─── チケットタブ ─────────────────────────────────
// ════════════════════════════════════════════════════

async function _dashTickets() {
  const el = document.getElementById('dash-content');
  try {
    const orders = await _fetchOrders();
    const paid   = orders.filter(o => o.payment_status === 'completed');

    if (paid.length === 0) {
      el.innerHTML = `
        <div style="${_cardP}text-align:center;padding:64px 24px;">
          <span class="material-icons-outlined" style="font-size:52px;color:var(--c-muted);display:block;margin-bottom:16px;">confirmation_number</span>
          <p style="font-size:16px;font-weight:700;color:var(--c-text-1);margin-bottom:8px;">チケットはまだありません</p>
          <p style="font-size:13px;color:var(--c-dim);line-height:1.7;margin-bottom:24px;">
            イベントに参加するとここにQRチケットが表示されます。<br>チケットをスタッフに提示して入場できます。
          </p>
          <button onclick="AppRouter.go('home')"
            style="display:inline-flex;align-items:center;gap:8px;padding:12px 28px;background:linear-gradient(135deg,var(--accent),#00AACC);color:var(--c-bg);border:none;cursor:pointer;border-radius:12px;font-weight:700;font-size:14px;">
            <span class="material-icons-outlined" style="font-size:18px;">search</span>イベントを探す
          </button>
        </div>
      `;
      return;
    }

    el.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:8px;">
        <div>
          <h2 style="font-family:'Outfit',sans-serif;font-size:20px;font-weight:800;color:var(--c-text);">マイチケット</h2>
          <p style="font-size:13px;color:var(--c-dim);margin-top:2px;">${paid.length}枚の有効チケット</p>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;" id="tickets-list">
        ${paid.map(o => _ticketCard(o)).join('')}
      </div>
    `;
  } catch(err) {
    el.innerHTML = _dashErrorState(err.message);
  }
}

function _ticketCard(o) {
  const img       = o.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=70';
  const date      = o.created_at ? new Date(o.created_at).toLocaleDateString('ja-JP') : '-';
  const eDate     = o.start_datetime
    ? new Date(o.start_datetime).toLocaleDateString('ja-JP',{year:'numeric',month:'long',day:'numeric',weekday:'short'})
    : null;
  const orderId   = o.order_id || '';
  const orderNum  = o.order_number || orderId;
  const checkedIn = o.checkin_status === 'checked_in';
  const qty       = o.quantity || 1;
  const titleSafe = o.event_title ? o.event_title.replace(/'/g, "\\'") : '';

  return `
    <div style="background:var(--c-surface);border:1px solid var(--c-border);border-radius:18px;overflow:hidden;transition:border-color 0.2s,box-shadow 0.2s;"
      onmouseenter="this.style.borderColor='rgba(0,217,255,0.2)';this.style.boxShadow='0 4px 24px rgba(0,0,0,0.3)'"
      onmouseleave="this.style.borderColor='var(--c-border)';this.style.boxShadow='none'">

      <!-- カバー画像ストリップ -->
      <div style="position:relative;height:96px;overflow:hidden;">
        <img src="${_escapeHtml(img)}" alt="" style="width:100%;height:100%;object-fit:cover;opacity:0.35;"
          onerror="this.style.opacity='0'">
        <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(10,15,30,0.95) 0%,rgba(10,15,30,0.7) 100%);padding:16px 20px;display:flex;align-items:center;justify-content:space-between;">
          <div style="flex:1;min-width:0;">
            <p style="font-family:'Outfit',sans-serif;font-size:16px;font-weight:800;color:var(--c-text);line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${_escapeHtml(o.event_title || 'イベント')}</p>
            ${eDate ? `<p style="font-size:12px;color:var(--c-dim);margin-top:4px;">${eDate}</p>` : ''}
          </div>
          <div style="margin-left:12px;flex-shrink:0;">
            ${checkedIn
              ? `<span style="display:inline-flex;align-items:center;gap:5px;padding:5px 12px;background:rgba(57,255,20,0.15);border:1px solid rgba(57,255,20,0.4);border-radius:99px;font-size:11px;font-weight:700;color:var(--lime);">
                  <span class="material-icons-outlined" style="font-size:12px;">check_circle</span>入場済み
                </span>`
              : `<span style="display:inline-flex;align-items:center;gap:5px;padding:5px 12px;background:var(--accent-dim);border:1px solid rgba(0,217,255,0.3);border-radius:99px;font-size:11px;font-weight:700;color:var(--accent);">
                  <span class="material-icons-outlined" style="font-size:12px;">confirmation_number</span>有効
                </span>`
            }
          </div>
        </div>
      </div>

      <!-- チケット情報 -->
      <div style="padding:16px 20px;">
        <!-- メタ情報行 -->
        <div style="display:flex;gap:20px;margin-bottom:14px;flex-wrap:wrap;">
          <div>
            <p style="font-size:10px;color:var(--c-muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:3px;">注文番号</p>
            <p style="font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:600;color:var(--c-text-2);">${_escapeHtml(orderNum.slice(0,16))}</p>
          </div>
          <div>
            <p style="font-size:10px;color:var(--c-muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:3px;">購入日</p>
            <p style="font-size:12px;font-weight:600;color:var(--c-text-2);">${date}</p>
          </div>
          <div>
            <p style="font-size:10px;color:var(--c-muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:3px;">金額</p>
            <p style="font-size:14px;font-weight:800;color:var(--accent);">¥${Number(o.total_amount||0).toLocaleString()}</p>
          </div>
          ${qty > 1 ? `
          <div>
            <p style="font-size:10px;color:var(--c-muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:3px;">枚数</p>
            <p style="font-size:12px;font-weight:600;color:var(--c-text-2);">${qty}枚</p>
          </div>` : ''}
        </div>

        <!-- アクションボタン -->
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button onclick="_showTicketQR('${_escapeHtml(orderId)}','${_escapeHtml(titleSafe)}','${date}')"
            style="flex:1;min-width:120px;display:flex;align-items:center;justify-content:center;gap:7px;padding:11px 16px;background:linear-gradient(135deg,var(--accent),#00AACC);color:var(--c-bg);border:none;cursor:pointer;border-radius:10px;font-size:13px;font-weight:700;transition:all 0.15s;"
            onmouseenter="this.style.transform='translateY(-1px)';this.style.boxShadow='0 4px 16px rgba(0,217,255,0.3)'"
            onmouseleave="this.style.transform='translateY(0)';this.style.boxShadow='none'">
            <span class="material-icons-outlined" style="font-size:17px;">qr_code_2</span>QRコードを表示
          </button>

          ${qty > 1 ? `
          <button onclick="_showDistributeModal('${_escapeHtml(orderId)}','${_escapeHtml(titleSafe)}',${qty})"
            style="display:flex;align-items:center;justify-content:center;gap:6px;padding:11px 16px;background:rgba(155,89,255,0.1);border:1px solid rgba(155,89,255,0.3);border-radius:10px;color:var(--violet);font-size:13px;font-weight:700;cursor:pointer;transition:all 0.15s;"
            onmouseenter="this.style.background='rgba(155,89,255,0.2)'" onmouseleave="this.style.background='rgba(155,89,255,0.1)'">
            <span class="material-icons-outlined" style="font-size:16px;">group_add</span>分配 (${qty}枚)
          </button>` : ''}

          ${o.event_id ? `
          <button onclick="AppRouter.go('detail',{id:'${_escapeHtml(o.event_id)}'})"
            style="display:flex;align-items:center;justify-content:center;gap:6px;padding:11px 14px;background:var(--c-raised);border:1px solid var(--c-border);border-radius:10px;color:var(--c-dim);font-size:13px;cursor:pointer;transition:all 0.15s;"
            onmouseenter="this.style.color='var(--c-text-1)';this.style.borderColor='var(--c-muted)'"
            onmouseleave="this.style.color='var(--c-dim)';this.style.borderColor='var(--c-border)'">
            <span class="material-icons-outlined" style="font-size:16px;">info_outline</span>
          </button>` : ''}
        </div>
      </div>
    </div>
  `;
}

// ════════════════════════════════════════════════════
// ─── 決済履歴タブ ─────────────────────────────────
// ════════════════════════════════════════════════════

async function _dashPayments() {
  const el = document.getElementById('dash-content');
  try {
    const orders = await _fetchOrders();
    const total  = orders.reduce((s, o) => s + (o.total_amount || 0), 0);
    const paid   = orders.filter(o => o.payment_status === 'completed');
    const pending = orders.filter(o => o.payment_status === 'pending');

    el.innerHTML = `
      <!-- サマリーカード -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:24px;">
        ${[
          { label:'合計件数', val: orders.length+'件', color:'var(--c-text)', icon:'receipt_long' },
          { label:'累計金額', val:'¥'+total.toLocaleString(), color:'var(--accent)', icon:'payments' },
          { label:'完了済み', val: paid.length+'件', color:'var(--lime)', icon:'check_circle' },
          ...(pending.length > 0 ? [{ label:'保留中', val: pending.length+'件', color:'var(--amber)', icon:'schedule' }] : []),
        ].map(s => `
          <div style="${_cardP}display:flex;align-items:center;gap:14px;">
            <span class="material-icons-outlined" style="font-size:22px;color:${s.color};opacity:0.8;flex-shrink:0;">${s.icon}</span>
            <div>
              <p style="font-size:11px;color:var(--c-dim);margin-bottom:3px;">${s.label}</p>
              <p style="font-family:'Outfit',sans-serif;font-size:20px;font-weight:800;color:${s.color};line-height:1.1;">${s.val}</p>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- 履歴テーブル -->
      <div style="${_card}overflow:hidden;">
        <div style="padding:16px 24px;border-bottom:1px solid var(--c-border);">
          <h3 style="font-size:14px;font-weight:700;color:var(--c-text);">決済履歴</h3>
        </div>

        ${orders.length === 0 ? `
          <div style="padding:56px 24px;text-align:center;">
            <span class="material-icons-outlined" style="font-size:40px;color:var(--c-muted);display:block;margin-bottom:12px;">receipt_long</span>
            <p style="font-size:14px;color:var(--c-dim);">決済履歴がありません</p>
          </div>
        ` : `
          <!-- モバイル: カードリスト -->
          <div class="show-mobile" style="display:none;">
            ${orders.map(o => _paymentRowMobile(o)).join('')}
          </div>
          <!-- デスクトップ: テーブル -->
          <div class="hide-mobile" style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;font-size:13px;">
              <thead>
                <tr style="background:var(--c-raised);">
                  ${['注文番号','イベント','購入日','金額','状態'].map(h =>
                    `<th style="padding:11px 16px;text-align:left;font-size:10px;font-weight:700;color:var(--c-dim);text-transform:uppercase;letter-spacing:0.07em;white-space:nowrap;">${h}</th>`
                  ).join('')}
                </tr>
              </thead>
              <tbody>
                ${orders.map((o, i) => _paymentRowDesktop(o, i)).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;

    // レスポンシブ制御
    _applyPaymentResponsive();
  } catch(err) {
    el.innerHTML = _dashErrorState(err.message);
  }
}

function _paymentStatusStyle(status) {
  return {
    completed: { color:'var(--lime)',   bg:'rgba(57,255,20,0.1)',  border:'rgba(57,255,20,0.3)',  label:'完了' },
    pending:   { color:'var(--amber)',  bg:'rgba(255,170,0,0.1)', border:'rgba(255,170,0,0.3)',  label:'保留中' },
    cancelled: { color:'var(--hot)',    bg:'rgba(255,51,102,0.1)',border:'rgba(255,51,102,0.3)', label:'キャンセル' },
  }[status] || { color:'var(--c-dim)', bg:'var(--c-raised)', border:'var(--c-border)', label:'不明' };
}

function _paymentRowDesktop(o, i) {
  const date = o.created_at ? new Date(o.created_at).toLocaleDateString('ja-JP') : '-';
  const s    = _paymentStatusStyle(o.payment_status);
  const orderId = o.order_id || '';
  const titleSafe = o.event_title ? o.event_title.replace(/'/g, "\\'") : '';
  return `
    <tr style="border-top:1px solid var(--c-border);transition:background 0.12s;cursor:pointer;"
      onmouseenter="this.style.background='var(--c-raised)'" onmouseleave="this.style.background='none'"
      onclick="${o.event_id ? `AppRouter.go('detail',{id:'${_escapeHtml(o.event_id)}'})` : ''}">
      <td style="padding:13px 16px;">
        <span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--c-text-2);">${_escapeHtml((o.order_number||orderId).slice(0,16))}</span>
      </td>
      <td style="padding:13px 16px;color:var(--c-text-1);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_escapeHtml(o.event_title||'-')}</td>
      <td style="padding:13px 16px;color:var(--c-dim);white-space:nowrap;">${date}</td>
      <td style="padding:13px 16px;font-weight:700;color:var(--c-text);white-space:nowrap;">¥${Number(o.total_amount||0).toLocaleString()}</td>
      <td style="padding:13px 16px;">
        <span style="padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;color:${s.color};background:${s.bg};border:1px solid ${s.border};">${s.label}</span>
      </td>
    </tr>
  `;
}

function _paymentRowMobile(o) {
  const date = o.created_at ? new Date(o.created_at).toLocaleDateString('ja-JP') : '-';
  const s    = _paymentStatusStyle(o.payment_status);
  return `
    <div style="padding:14px 20px;border-bottom:1px solid var(--c-border);display:flex;align-items:center;gap:12px;"
      onclick="${o.event_id ? `AppRouter.go('detail',{id:'${_escapeHtml(o.event_id)}'})` : ''}">
      <div style="flex:1;min-width:0;">
        <p style="font-size:13px;font-weight:600;color:var(--c-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${_escapeHtml(o.event_title||'イベント')}</p>
        <p style="font-size:11px;color:var(--c-dim);margin-top:2px;">${date}</p>
      </div>
      <div style="text-align:right;flex-shrink:0;">
        <p style="font-size:13px;font-weight:700;color:var(--c-text);">¥${Number(o.total_amount||0).toLocaleString()}</p>
        <span style="display:inline-block;margin-top:4px;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:700;color:${s.color};background:${s.bg};">${s.label}</span>
      </div>
    </div>
  `;
}

function _applyPaymentResponsive() {
  const isMobile = window.innerWidth < 640;
  const mob = document.querySelector('.show-mobile');
  const desk = document.querySelector('.hide-mobile');
  if (mob)  mob.style.display  = isMobile ? 'block' : 'none';
  if (desk) desk.style.display = isMobile ? 'none'  : 'block';
}

window.addEventListener('resize', () => {
  if (document.querySelector('.show-mobile')) _applyPaymentResponsive();
});

// ════════════════════════════════════════════════════
// ─── 興味タブ ─────────────────────────────────────
// ════════════════════════════════════════════════════

async function _dashInterests() {
  const el = document.getElementById('dash-content');
  const renderTags = async () => {
    try {
      const data = await window.LinkUpAPI.Users.getInterests();
      const tags = data.tags || [];

      el.innerHTML = `
        <div style="${_cardP}max-width:600px;">
          <div style="margin-bottom:20px;">
            <h2 style="font-family:'Outfit',sans-serif;font-size:18px;font-weight:800;color:var(--c-text);margin-bottom:4px;">興味・関心タグ</h2>
            <p style="font-size:13px;color:var(--c-dim);">タグを設定すると関連イベントをおすすめしやすくなります</p>
          </div>

          <!-- 現在のタグ -->
          <div id="tags-list" style="display:flex;flex-wrap:wrap;gap:8px;min-height:40px;margin-bottom:20px;">
            ${tags.length === 0
              ? `<p style="font-size:13px;color:var(--c-muted);padding:8px 0;">まだタグがありません。下のフォームから追加してみましょう。</p>`
              : tags.map(tag => `
                <span style="display:inline-flex;align-items:center;gap:7px;background:var(--accent-dim);border:1px solid rgba(0,217,255,0.25);color:var(--accent);padding:6px 14px;border-radius:99px;font-size:13px;font-weight:600;">
                  #${_escapeHtml(tag)}
                  <button onclick="_removeInterest('${_escapeHtml(tag)}')"
                    style="background:none;border:none;cursor:pointer;color:var(--c-dim);font-size:15px;line-height:1;padding:0;display:flex;align-items:center;transition:color 0.15s;"
                    onmouseenter="this.style.color='var(--hot)'" onmouseleave="this.style.color='var(--c-dim)'" title="削除">
                    <span class="material-icons-outlined" style="font-size:14px;">close</span>
                  </button>
                </span>
              `).join('')}
          </div>

          <!-- 追加フォーム -->
          <div style="display:flex;gap:8px;">
            <input id="tag-input" type="text" placeholder="タグを入力 (例: Python, 音楽, スポーツ)" maxlength="30"
              style="flex:1;background:var(--c-raised);border:1.5px solid var(--c-border);color:var(--c-text);border-radius:10px;padding:11px 16px;font-size:13px;outline:none;transition:all 0.15s;"
              onfocus="this.style.borderColor='var(--accent)';this.style.boxShadow='0 0 0 3px var(--accent-dim)'"
              onblur="this.style.borderColor='var(--c-border)';this.style.boxShadow='none'">
            <button onclick="_addInterest()"
              style="padding:11px 20px;background:linear-gradient(135deg,var(--accent),#00AACC);color:var(--c-bg);border:none;cursor:pointer;border-radius:10px;font-weight:700;font-size:13px;white-space:nowrap;transition:all 0.15s;"
              onmouseenter="this.style.transform='translateY(-1px)'" onmouseleave="this.style.transform='translateY(0)'">
              追加
            </button>
          </div>
          <p style="font-size:11px;color:var(--c-muted);margin-top:8px;">Enterキーでも追加できます</p>
        </div>
      `;
      document.getElementById('tag-input')?.addEventListener('keydown', e => { if(e.key==='Enter') _addInterest(); });
    } catch(err) {
      // テーブルが未作成の場合もあるので graceful degradation
      el.innerHTML = `
        <div style="${_cardP}max-width:600px;text-align:center;padding:48px 24px;">
          <span class="material-icons-outlined" style="font-size:40px;color:var(--c-muted);display:block;margin-bottom:12px;">favorite_border</span>
          <p style="font-size:14px;font-weight:600;color:var(--c-text-1);margin-bottom:6px;">興味タグ機能は準備中です</p>
          <p style="font-size:13px;color:var(--c-dim);">近日公開予定です</p>
        </div>
      `;
    }
  };

  await renderTags();

  window._addInterest = async function() {
    const input = document.getElementById('tag-input');
    const tag   = input?.value?.trim();
    if (!tag) return;
    try {
      await window.LinkUpAPI.Users.addInterest(tag);
      input.value = '';
      await renderTags();
    } catch(e) { AppUI.toast(e.message || 'タグの追加に失敗しました', 'error'); }
  };

  window._removeInterest = async function(tag) {
    try {
      await window.LinkUpAPI.Users.removeInterest(tag);
      await renderTags();
    } catch(e) { AppUI.toast(e.message || '削除に失敗しました', 'error'); }
  };
}

// ════════════════════════════════════════════════════
// ─── プロフィールタブ ──────────────────────────────
// ════════════════════════════════════════════════════

async function _dashProfile() {
  const el   = document.getElementById('dash-content');
  const user = window.currentUser;

  const inp = `background:var(--c-raised);border:1.5px solid var(--c-border);color:var(--c-text);border-radius:10px;padding:11px 16px;font-size:13px;outline:none;transition:all 0.15s;width:100%;box-sizing:border-box;`;
  const lbl = `display:block;font-size:11px;font-weight:700;color:var(--c-dim);text-transform:uppercase;letter-spacing:0.07em;margin-bottom:6px;`;

  el.innerHTML = `
    <div style="max-width:520px;">

      <!-- アバタープレビュー -->
      <div style="${_cardP}margin-bottom:16px;display:flex;align-items:center;gap:16px;">
        <img id="prof-avatar-preview"
          src="${user?.avatar_url || user?.icon_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.display_name||'U')}&background=00D9FF&color=0A0F1E&bold=true`}"
          style="width:64px;height:64px;border-radius:50%;object-fit:cover;border:2px solid var(--c-border);">
        <div>
          <p style="font-size:15px;font-weight:700;color:var(--c-text);">${_escapeHtml(user?.display_name || user?.name || '')}</p>
          <p style="font-size:12px;color:var(--c-dim);margin-top:2px;">${_escapeHtml(user?.email || '')}</p>
          <p style="font-size:11px;color:var(--c-muted);margin-top:4px;">メールアドレスは変更できません</p>
        </div>
      </div>

      <!-- 編集フォーム -->
      <div style="${_cardP}">
        <h3 style="font-size:14px;font-weight:700;color:var(--c-text);margin-bottom:20px;">プロフィール編集</h3>
        <form id="profile-form" style="display:flex;flex-direction:column;gap:18px;">

          <div>
            <label style="${lbl}">表示名</label>
            <input type="text" name="name" value="${_escapeHtml(user?.display_name || user?.name || '')}"
              placeholder="LinkUp ユーザー"
              style="${inp}"
              onfocus="this.style.borderColor='var(--accent)';this.style.boxShadow='0 0 0 3px var(--accent-dim)'"
              onblur="this.style.borderColor='var(--c-border)';this.style.boxShadow='none'">
          </div>

          <div>
            <label style="${lbl}">アバター画像URL</label>
            <input type="url" name="avatar_url" value="${_escapeHtml(user?.avatar_url || '')}"
              placeholder="https://example.com/avatar.jpg"
              style="${inp}"
              onfocus="this.style.borderColor='var(--accent)';this.style.boxShadow='0 0 0 3px var(--accent-dim)'"
              onblur="this.style.borderColor='var(--c-border)';this.style.boxShadow='none'"
              oninput="const p=document.getElementById('prof-avatar-preview');if(this.value)p.src=this.value;">
            <p style="font-size:11px;color:var(--c-muted);margin-top:5px;">画像のURLを直接入力してください（.jpg / .png / .webp）</p>
          </div>

          <button type="submit" id="prof-submit"
            style="display:flex;align-items:center;justify-content:center;gap:8px;padding:13px;background:linear-gradient(135deg,var(--accent),#00AACC);color:var(--c-bg);border:none;cursor:pointer;border-radius:10px;font-size:14px;font-weight:800;transition:all 0.15s;"
            onmouseenter="this.style.transform='translateY(-1px)';this.style.boxShadow='0 4px 16px rgba(0,217,255,0.3)'"
            onmouseleave="this.style.transform='translateY(0)';this.style.boxShadow='none'">
            <span class="material-icons-outlined" style="font-size:18px;">save</span>変更を保存
          </button>
        </form>
      </div>

      <!-- ログアウト -->
      <div style="margin-top:12px;${_cardP}display:flex;align-items:center;justify-content:space-between;">
        <div>
          <p style="font-size:13px;font-weight:600;color:var(--c-text-1);">ログアウト</p>
          <p style="font-size:12px;color:var(--c-dim);margin-top:2px;">このデバイスからログアウトします</p>
        </div>
        <button id="logout-btn"
          style="display:flex;align-items:center;gap:6px;padding:9px 18px;background:var(--hot-dim);border:1px solid rgba(255,51,102,0.25);border-radius:10px;color:var(--hot);font-size:13px;font-weight:700;cursor:pointer;transition:all 0.15s;white-space:nowrap;"
          onmouseenter="this.style.background='rgba(255,51,102,0.2)'" onmouseleave="this.style.background='var(--hot-dim)'">
          <span class="material-icons-outlined" style="font-size:16px;">logout</span>ログアウト
        </button>
      </div>

    </div>
  `;

  document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('prof-submit');
    btn.disabled = true;
    btn.innerHTML = `<div style="width:16px;height:16px;border:2px solid rgba(10,15,30,0.3);border-top-color:var(--c-bg);border-radius:50%;animation:spin 0.8s linear infinite"></div> 保存中...`;
    try {
      const fd = new FormData(e.target);
      const fields = { name: fd.get('name'), avatar_url: fd.get('avatar_url') || null };
      const result = await window.LinkUpAPI.Auth.updateProfile(fields);
      window.currentUser = { ...window.currentUser, ...result.user, display_name: fields.name };
      AppUI.updateNav();
      _dashSetUserInfo();
      AppUI.toast('プロフィールを保存しました', 'success');
    } catch(err) {
      AppUI.toast(err.message || '保存に失敗しました', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<span class="material-icons-outlined" style="font-size:18px;">save</span>変更を保存`;
    }
  });

  document.getElementById('logout-btn').addEventListener('click', () => {
    if (!confirm('ログアウトしますか？')) return;
    localStorage.removeItem('linkup_token');
    window.currentUser = null;
    AppUI.updateNav();
    AppUI.toast('ログアウトしました', 'info');
    AppRouter.go('home');
  });
}

// ════════════════════════════════════════════════════
// ─── QRコードモーダル ─────────────────────────────
// ════════════════════════════════════════════════════

window._showTicketQR = async function(orderId, eventTitle, date) {
  document.getElementById('qr-modal-container')?.remove();

  const modal = document.createElement('div');
  modal.id = 'qr-modal-container';
  modal.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
  modal.innerHTML = `
    <div style="position:absolute;inset:0;background:rgba(5,8,15,0.88);backdrop-filter:blur(10px);" onclick="document.getElementById('qr-modal-container').remove()"></div>
    <div style="position:relative;background:var(--c-surface);border:1px solid rgba(0,217,255,0.15);border-radius:22px;width:100%;max-width:340px;overflow:hidden;box-shadow:0 40px 100px rgba(0,0,0,0.8);animation:modalEnter 0.35s cubic-bezier(0.34,1.56,0.64,1);">

      <!-- ヘッダー -->
      <div style="background:var(--c-canvas);padding:18px 20px;border-bottom:1px solid var(--c-border);display:flex;align-items:center;justify-content:space-between;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:34px;height:34px;background:var(--accent-dim);border:1px solid rgba(0,217,255,0.3);border-radius:10px;display:flex;align-items:center;justify-content:center;">
            <span class="material-icons-outlined" style="font-size:18px;color:var(--accent);">qr_code_2</span>
          </div>
          <div>
            <p style="font-size:14px;font-weight:800;color:var(--c-text);">入場QRコード</p>
            <p style="font-size:11px;color:var(--c-dim);">スタッフにこの画面を提示</p>
          </div>
        </div>
        <button onclick="document.getElementById('qr-modal-container').remove()"
          style="width:28px;height:28px;background:var(--c-raised);border:1px solid var(--c-border);border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--c-dim);"
          onmouseenter="this.style.borderColor='var(--hot)';this.style.color='var(--hot)'"
          onmouseleave="this.style.borderColor='var(--c-border)';this.style.color='var(--c-dim)'">
          <span class="material-icons-outlined" style="font-size:15px;">close</span>
        </button>
      </div>

      <!-- ボディ -->
      <div id="qr-modal-body" style="padding:24px;text-align:center;">
        <div style="display:flex;justify-content:center;padding:40px 0;">
          <div style="width:28px;height:28px;border:2px solid var(--c-border);border-top-color:var(--accent);border-radius:50%;animation:spin 0.8s linear infinite;"></div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  try {
    let qrContent = `LINKUP:${orderId}:${Date.now()}`;
    let qrLabel   = orderId;
    let eTitle    = eventTitle;
    let eDateStr  = date;

    try {
      const res = await window.LinkUpAPI._requestFlexible('/api/checkin/generate-qr', {
        method: 'POST', body: JSON.stringify({ order_id: orderId }), auth: true,
      });
      if (res.qr_data)       qrContent = res.qr_data;
      if (res.order_number)  qrLabel   = res.order_number;
      if (res.event_title)   eTitle    = res.event_title;
      if (res.start_datetime) eDateStr = new Date(res.start_datetime).toLocaleDateString('ja-JP',{year:'numeric',month:'long',day:'numeric',weekday:'short'});
    } catch(_) {}

    const qrUrl = `https://chart.googleapis.com/chart?chs=220x220&cht=qr&chl=${encodeURIComponent(qrContent)}&choe=UTF-8&chld=M|2`;

    document.getElementById('qr-modal-body').innerHTML = `
      <!-- QR画像 -->
      <div style="background:#FFFFFF;border-radius:14px;padding:14px;display:inline-block;margin-bottom:16px;box-shadow:0 0 0 1px rgba(255,255,255,0.08);">
        <img id="qr-img" src="${qrUrl}" alt="QR Code" style="width:192px;height:192px;display:block;"
          onerror="this.parentElement.innerHTML='<div style=\\'width:192px;height:192px;display:flex;align-items:center;justify-content:center;font-size:12px;color:#666;\\'>QR生成失敗</div>'">
      </div>

      <!-- イベント情報 -->
      <div style="background:var(--c-raised);border:1px solid var(--c-border);border-radius:12px;padding:12px 16px;margin-bottom:16px;text-align:left;">
        <p style="font-size:13px;font-weight:700;color:var(--c-text);margin-bottom:3px;">${_escapeHtml(eTitle || 'イベント')}</p>
        <p style="font-size:12px;color:var(--c-dim);">${_escapeHtml(eDateStr || '')}</p>
        <p style="font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--accent);margin-top:4px;">${_escapeHtml(qrLabel)}</p>
      </div>

      <!-- ボタン -->
      <div style="display:flex;gap:8px;">
        <button onclick="_downloadQR('${qrUrl}','${_escapeHtml(qrLabel)}')"
          style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:11px;background:linear-gradient(135deg,var(--accent),#00AACC);color:var(--c-bg);border:none;cursor:pointer;border-radius:10px;font-size:13px;font-weight:700;">
          <span class="material-icons-outlined" style="font-size:16px;">download</span>保存
        </button>
        <button onclick="window.print()"
          style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:11px;background:var(--c-raised);border:1px solid var(--c-border);color:var(--c-text-1);border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;"
          onmouseenter="this.style.borderColor='var(--c-muted)'" onmouseleave="this.style.borderColor='var(--c-border)'">
          <span class="material-icons-outlined" style="font-size:16px;">print</span>印刷
        </button>
      </div>
    `;
  } catch(err) {
    document.getElementById('qr-modal-body').innerHTML = `
      <p style="color:var(--hot);font-size:13px;padding:32px 0;">${err.message || 'QRコードの取得に失敗しました'}</p>
    `;
  }
};

// ─── QRダウンロード ─────────────────────────────────
window._downloadQR = async function(qrUrl, label) {
  try {
    const res  = await fetch(qrUrl);
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: `linkup-ticket-${label||'qr'}.png` });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    AppUI.toast('QRコードを保存しました', 'success');
  } catch(_) {
    window.open(qrUrl, '_blank');
  }
};

// ════════════════════════════════════════════════════
// ─── チケット分配モーダル ──────────────────────────
// ════════════════════════════════════════════════════

window._showDistributeModal = function(orderId, eventTitle, qty) {
  document.getElementById('distribute-modal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'distribute-modal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
  modal.innerHTML = `
    <div style="position:absolute;inset:0;background:rgba(5,8,15,0.88);backdrop-filter:blur(10px);" onclick="document.getElementById('distribute-modal').remove()"></div>
    <div style="position:relative;background:var(--c-surface);border:1px solid rgba(155,89,255,0.2);border-radius:22px;width:100%;max-width:420px;overflow:hidden;box-shadow:0 40px 100px rgba(0,0,0,0.8);animation:modalEnter 0.35s cubic-bezier(0.34,1.56,0.64,1);">

      <div style="background:linear-gradient(135deg,rgba(155,89,255,0.12),rgba(155,89,255,0.04));padding:18px 20px;border-bottom:1px solid rgba(155,89,255,0.12);display:flex;align-items:center;justify-content:space-between;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:34px;height:34px;background:rgba(155,89,255,0.12);border:1px solid rgba(155,89,255,0.3);border-radius:10px;display:flex;align-items:center;justify-content:center;">
            <span class="material-icons-outlined" style="font-size:18px;color:var(--violet);">group_add</span>
          </div>
          <div>
            <p style="font-size:14px;font-weight:800;color:var(--c-text);">チケット分配</p>
            <p style="font-size:11px;color:var(--c-dim);">${_escapeHtml(eventTitle)} · ${qty}枚</p>
          </div>
        </div>
        <button onclick="document.getElementById('distribute-modal').remove()"
          style="width:28px;height:28px;background:var(--c-raised);border:1px solid var(--c-border);border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--c-dim);">
          <span class="material-icons-outlined" style="font-size:15px;">close</span>
        </button>
      </div>

      <div style="padding:20px;">
        <p style="font-size:13px;color:var(--c-text-2);margin-bottom:18px;line-height:1.7;">
          同行者のメールアドレスを入力すると、チケット情報をお送りします。
        </p>

        <!-- 1枚目: 自分 -->
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
          <div style="width:28px;height:28px;background:var(--c-raised);border:1px solid var(--c-border);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <span style="font-size:11px;font-weight:700;color:var(--c-dim);">1</span>
          </div>
          <div style="flex:1;padding:10px 14px;background:var(--c-raised);border-radius:10px;font-size:13px;color:var(--c-dim);">あなた（${_escapeHtml(window.currentUser?.email || 'ご自身')}）</div>
        </div>

        <!-- 2枚目以降 -->
        ${Array.from({length: qty-1}, (_,i) => `
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
            <div style="width:28px;height:28px;background:rgba(155,89,255,0.1);border:1px solid rgba(155,89,255,0.3);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <span style="font-size:11px;font-weight:700;color:var(--violet);">${i+2}</span>
            </div>
            <input type="email" id="share-email-${i}" placeholder="メールアドレス"
              style="flex:1;background:var(--c-raised);border:1.5px solid var(--c-border);color:var(--c-text);border-radius:10px;padding:10px 14px;font-size:13px;outline:none;transition:all 0.15s;"
              onfocus="this.style.borderColor='var(--violet)';this.style.boxShadow='0 0 0 3px rgba(155,89,255,0.1)'"
              onblur="this.style.borderColor='var(--c-border)';this.style.boxShadow='none'">
          </div>
        `).join('')}

        <div id="dist-msg" style="display:none;margin-bottom:12px;"></div>

        <div style="display:flex;gap:8px;margin-top:16px;">
          <button id="dist-send-btn" onclick="_sendDistributeEmails('${_escapeHtml(orderId)}','${_escapeHtml(eventTitle)}',${qty})"
            style="flex:1;display:flex;align-items:center;justify-content:center;gap:7px;padding:12px;background:linear-gradient(135deg,var(--violet),#6622BB);color:#fff;border:none;cursor:pointer;border-radius:10px;font-size:13px;font-weight:700;">
            <span class="material-icons-outlined" style="font-size:16px;">send</span>メールで送信
          </button>
          <button onclick="document.getElementById('distribute-modal').remove()"
            style="padding:12px 16px;background:var(--c-raised);border:1px solid var(--c-border);color:var(--c-dim);border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;">
            閉じる
          </button>
        </div>
        <p style="margin-top:12px;font-size:11px;color:var(--c-muted);text-align:center;">※ 分配後も元の注文番号で入場できます</p>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
};

window._sendDistributeEmails = async function(orderId, eventTitle, qty) {
  const emails = [];
  for (let i = 0; i < qty-1; i++) {
    const v = document.getElementById(`share-email-${i}`)?.value?.trim();
    if (v) emails.push(v);
  }
  const msgEl = document.getElementById('dist-msg');
  if (emails.length === 0) {
    msgEl.style.cssText = 'display:block;padding:10px 14px;background:var(--hot-dim);border:1px solid rgba(255,51,102,0.3);border-radius:10px;font-size:13px;color:var(--hot);';
    msgEl.textContent = '送信先のメールアドレスを1件以上入力してください';
    return;
  }
  const btn = document.getElementById('dist-send-btn');
  btn.disabled = true;
  btn.innerHTML = '<div style="width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.8s linear infinite"></div> 送信中...';

  let qrData = `LINKUP:${orderId}:${Date.now()}`;
  try {
    const r = await window.LinkUpAPI._requestFlexible('/api/checkin/generate-qr', {
      method: 'POST', body: JSON.stringify({ order_id: orderId }), auth: true,
    });
    if (r.qr_data) qrData = r.qr_data;
  } catch(_) {}

  try {
    for (const email of emails) {
      await window.LinkUpAPI._requestFlexible('/api/email/send-ticket-share', {
        method: 'POST',
        body: JSON.stringify({ to_email: email, event_title: eventTitle, order_id: orderId, qr_data: qrData }),
        auth: true,
      });
    }
    msgEl.style.cssText = 'display:block;padding:10px 14px;background:rgba(57,255,20,0.08);border:1px solid rgba(57,255,20,0.25);border-radius:10px;font-size:13px;color:var(--lime);';
    msgEl.textContent = `${emails.length}件送信しました！`;
  } catch(_) {
    const shareText = `【LinkUp チケット共有】\nイベント: ${eventTitle}\n注文ID: ${orderId}\nQR: ${qrData}`;
    navigator.clipboard?.writeText(shareText).then(() => {
      msgEl.style.cssText = 'display:block;padding:10px 14px;background:rgba(57,255,20,0.08);border:1px solid rgba(57,255,20,0.25);border-radius:10px;font-size:13px;color:var(--lime);';
      msgEl.textContent = 'チケット情報をクリップボードにコピーしました';
    });
  }
  btn.disabled = false;
  btn.innerHTML = '<span class="material-icons-outlined" style="font-size:16px;">send</span>メールで送信';
};
