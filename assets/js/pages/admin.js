/**
 * 管理者ダッシュボード — Frontend Design Skill準拠
 * Design: "Code Editor Dark" — ネオンシアン + IDE暗黒テーマ
 */

// ─── 管理者専用API ────────────────────────────────────

const AdminAPI = {
  stats: () =>
    window.LinkUpAPI._request('GET', '/api/admin/stats', null, true),

  events: (params = {}) => {
    const q = new URLSearchParams();
    if (params.status) q.set('status', params.status);
    if (params.search) q.set('search', params.search);
    if (params.limit)  q.set('limit', params.limit);
    const qs = q.toString() ? '?' + q.toString() : '';
    return window.LinkUpAPI._request('GET', `/api/admin/events${qs}`, null, true);
  },

  approveEvent: (id) =>
    window.LinkUpAPI._request('PUT', `/api/admin/events/${id}/approve`, {}, true),

  rejectEvent: (id, reason) =>
    window.LinkUpAPI._request('PUT', `/api/admin/events/${id}/reject`, { reason }, true),

  deleteEvent: (id) =>
    window.LinkUpAPI._request('DELETE', `/api/admin/events/${id}`, null, true),

  users: (params = {}) => {
    const q = new URLSearchParams();
    if (params.search) q.set('search', params.search);
    if (params.role)   q.set('role', params.role);
    if (params.limit)  q.set('limit', params.limit);
    const qs = q.toString() ? '?' + q.toString() : '';
    return window.LinkUpAPI._request('GET', `/api/admin/users${qs}`, null, true);
  },

  updateUser: (id, data) =>
    window.LinkUpAPI._request('PUT', `/api/admin/users/${id}`, data, true),

  orders: (params = {}) => {
    const q = new URLSearchParams();
    if (params.limit) q.set('limit', params.limit || 100);
    const qs = q.toString() ? '?' + q.toString() : '';
    return window.LinkUpAPI._request('GET', `/api/admin/orders${qs}`, null, true);
  },
};

// ─── スタイルヘルパー ─────────────────────────────────
const _admCard = `background:var(--c-surface); border:1px solid var(--c-border); border-radius:16px; padding:20px;`;
const _admInput = `background:var(--c-raised); border:1.5px solid var(--c-border); color:var(--c-text); border-radius:10px; padding:8px 12px; font-size:13px; outline:none; transition:border-color 0.15s;`;
const _admSpinner = `<div style="display:flex;justify-content:center;padding:48px 0;"><div style="width:32px;height:32px;border:2.5px solid var(--c-border);border-top-color:var(--accent);border-radius:50%;animation:spin 0.9s linear infinite;"></div></div>`;

// ─── メインレンダリング ─────────────────────────────

async function renderAdmin(params = {}) {
  if (!AppAuth.requireRole(['admin'])) return;

  const user = window.currentUser;
  const tab  = params.tab || 'dashboard';
  const app  = document.getElementById('app');

  app.innerHTML = `
    <div style="min-height:100vh; background:var(--c-bg); display:flex; flex-direction:column;">
      <!-- 管理者ヘッダー -->
      <div style="background:var(--c-canvas); border-bottom:1px solid rgba(255,51,102,0.2); padding:12px 24px; display:flex; align-items:center; justify-content:space-between;">
        <div style="display:flex; align-items:center; gap:10px;">
          <span class="material-icons-outlined" style="color:var(--hot); font-size:20px;">admin_panel_settings</span>
          <span style="font-family:'Outfit',sans-serif; font-size:16px; font-weight:800; color:var(--c-text);">LinkUp 管理コンソール</span>
          <span style="padding:2px 8px; background:var(--hot-dim); border:1px solid rgba(255,51,102,0.3); border-radius:99px; font-size:10px; font-weight:700; color:var(--hot);">ADMIN</span>
        </div>
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="font-size:12px; color:var(--c-dim);">${_escapeHtml(user?.display_name || user?.email || 'Admin')}</span>
          <button onclick="AppRouter.go('home')"
            style="padding:6px 14px; background:var(--c-raised); border:1px solid var(--c-border); color:var(--c-dim); border-radius:8px; font-size:12px; cursor:pointer; transition:all 0.15s;"
            onmouseenter="this.style.borderColor='var(--accent)';this.style.color='var(--accent)'"
            onmouseleave="this.style.borderColor='var(--c-border)';this.style.color='var(--c-dim)'">
            サイトへ戻る
          </button>
        </div>
      </div>

      <div style="display:flex; flex:1;">
        <!-- サイドバー（PC） -->
        <aside style="width:220px; background:var(--c-canvas); border-right:1px solid var(--c-border); flex-shrink:0; padding:16px 12px;" class="hidden lg:block">
          <nav>
            ${_adminNavItem('dashboard', tab, 'dashboard', 'ダッシュボード')}
            <p style="font-size:10px; color:var(--c-muted); text-transform:uppercase; letter-spacing:0.1em; padding:16px 10px 6px;">コンテンツ</p>
            ${_adminNavItem('events', tab, 'event', 'イベント管理')}
            ${_adminNavItem('tickets', tab, 'confirmation_number', 'チケット・注文')}
            ${_adminNavItem('users', tab, 'people', 'ユーザー管理')}
            <p style="font-size:10px; color:var(--c-muted); text-transform:uppercase; letter-spacing:0.1em; padding:16px 10px 6px;">入場管理</p>
            ${_adminNavItem('checkin', tab, 'qr_code_scanner', 'QR入場受付')}
          </nav>
        </aside>

        <!-- モバイルタブ -->
        <div style="display:flex; overflow-x:auto; border-bottom:1px solid var(--c-border); background:var(--c-canvas);" class="lg:hidden">
          ${_adminMobileTab('dashboard', tab, 'dashboard', '概要')}
          ${_adminMobileTab('events', tab, 'event', 'イベント')}
          ${_adminMobileTab('tickets', tab, 'confirmation_number', '注文')}
          ${_adminMobileTab('users', tab, 'people', 'ユーザー')}
          ${_adminMobileTab('checkin', tab, 'qr_code_scanner', 'QR')}
        </div>

        <!-- メインコンテンツ -->
        <main style="flex:1; overflow:auto; padding:24px;" id="admin-content">
          ${_admSpinner}
        </main>
      </div>
    </div>
  `;

  switch (tab) {
    case 'dashboard': await _adminDashboard(); break;
    case 'events':    await _adminEvents();    break;
    case 'tickets':   await _adminTickets();   break;
    case 'users':     await _adminUsers();     break;
    case 'checkin':   await _adminCheckin();   break;
    default:          await _adminDashboard();
  }
}

function _adminNavItem(key, active, icon, label) {
  const isActive = key === active;
  return `
    <button onclick="AppRouter.go('admin', { tab: '${key}' })"
      style="
        width:100%; display:flex; align-items:center; gap:8px; padding:8px 12px; border-radius:10px; border:none; cursor:pointer;
        font-size:13px; font-weight:${isActive ? '700' : '500'}; margin-bottom:2px; transition:all 0.15s; text-align:left;
        ${isActive
          ? 'background:var(--accent-dim); color:var(--accent); border:1px solid rgba(0,217,255,0.25);'
          : 'background:none; color:var(--c-dim); border:1px solid transparent;'}
      "
      onmouseenter="${!isActive ? "this.style.color='var(--c-text-1)';this.style.background='var(--c-raised)'" : ''}"
      onmouseleave="${!isActive ? "this.style.color='var(--c-dim)';this.style.background='none'" : ''}">
      <span class="material-icons-outlined" style="font-size:16px;">${icon}</span>${label}
    </button>
  `;
}

function _adminMobileTab(key, active, icon, label) {
  const isActive = key === active;
  return `
    <button onclick="AppRouter.go('admin', { tab: '${key}' })"
      style="
        display:flex; flex-direction:column; align-items:center; gap:2px; padding:10px 16px; font-size:11px; white-space:nowrap; cursor:pointer; border:none; background:none; border-bottom:2px solid;
        transition:all 0.15s;
        ${isActive
          ? 'color:var(--accent); border-bottom-color:var(--accent); font-weight:700;'
          : 'color:var(--c-dim); border-bottom-color:transparent;'}
      ">
      <span class="material-icons-outlined" style="font-size:18px;">${icon}</span>${label}
    </button>
  `;
}

// ─── ダッシュボードタブ ───────────────────────────────

async function _adminDashboard() {
  const el = document.getElementById('admin-content');

  try {
    const data  = await AdminAPI.stats();
    const stats = data.stats || data || {};

    el.innerHTML = `
      <h2 style="font-family:'Outfit',sans-serif; font-size:20px; font-weight:800; color:var(--c-text); margin-bottom:20px;">ダッシュボード</h2>

      <!-- KPIカード -->
      <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px;">
        ${_adminStatCard('people',              'ユーザー数', stats.total_users  || stats.users  || '—', 'var(--accent)')}
        ${_adminStatCard('event',               'イベント数', stats.total_events || stats.events || '—', 'var(--lime)'  )}
        ${_adminStatCard('confirmation_number', '総注文数',   stats.total_orders || stats.orders || '—', 'var(--violet)')}
        ${_adminStatCard('payments', '総売上',
          stats.total_revenue != null ? '¥' + Number(stats.total_revenue).toLocaleString() : '—',
          'var(--amber)')}
      </div>

      <!-- 承認待ちイベント -->
      <div style="${_admCard} margin-bottom:24px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
          <h3 style="font-size:14px; font-weight:700; color:var(--c-text);">承認待ちイベント</h3>
          <button onclick="AppRouter.go('admin', { tab: 'events' })"
            style="font-size:12px; color:var(--accent); background:none; border:none; cursor:pointer; font-weight:600;">
            すべて見る →
          </button>
        </div>
        <div id="pending-events-list">${_admSpinner}</div>
      </div>

      <!-- クイックアクション -->
      <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:12px;">
        ${_adminQuickAction('event',               'events',   'イベント管理')}
        ${_adminQuickAction('people',              'users',    'ユーザー管理')}
        ${_adminQuickAction('confirmation_number', 'tickets',  'チケット・注文')}
        ${_adminQuickAction('qr_code_scanner',     'checkin',  'QR入場受付')}
      </div>
    `;

    _loadPendingEvents();

  } catch (err) {
    el.innerHTML = `<div style="${_admCard}"><p style="color:var(--hot);">${_escapeHtml(err.message)}</p></div>`;
  }
}

function _adminStatCard(icon, label, value, color) {
  return `
    <div style="${_admCard}">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
        <span class="material-icons-outlined" style="font-size:16px; color:${color};">${icon}</span>
        <p style="font-size:11px; color:var(--c-dim);">${label}</p>
      </div>
      <p style="font-family:'Outfit',sans-serif; font-size:24px; font-weight:800; color:${color};">${value}</p>
    </div>
  `;
}

function _adminQuickAction(icon, tab, label) {
  return `
    <button onclick="AppRouter.go('admin', { tab: '${tab}' })"
      style="${_admCard} cursor:pointer; text-align:center; transition:all 0.2s; padding:20px;"
      onmouseenter="this.style.borderColor='var(--accent)';this.style.background='rgba(0,217,255,0.04)'"
      onmouseleave="this.style.borderColor='var(--c-border)';this.style.background='var(--c-surface)'">
      <span class="material-icons-outlined" style="font-size:28px; color:var(--accent); display:block; margin-bottom:8px;">${icon}</span>
      <p style="font-size:12px; font-weight:600; color:var(--c-text-1);">${label}</p>
    </button>
  `;
}

async function _loadPendingEvents() {
  const el = document.getElementById('pending-events-list');
  if (!el) return;

  try {
    const data   = await AdminAPI.events({ status: 'pending', limit: 5 });
    const events = data.events || [];

    if (events.length === 0) {
      el.innerHTML = `<p style="color:var(--c-dim); font-size:13px; text-align:center; padding:16px;">承認待ちのイベントはありません</p>`;
      return;
    }

    el.innerHTML = events.map(e => `
      <div style="display:flex; align-items:center; gap:12px; padding:10px; background:var(--c-raised); border-radius:10px; margin-bottom:8px;">
        <img src="${_escapeHtml(e.cover_image_url || '')}" style="width:44px; height:44px; border-radius:10px; object-fit:cover; flex-shrink:0;"
          onerror="this.src='https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&q=60'">
        <div style="flex:1; min-width:0;">
          <p style="font-size:13px; font-weight:600; color:var(--c-text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${_escapeHtml(e.title || '')}</p>
          <p style="font-size:11px; color:var(--c-dim);">${_escapeHtml(e.organizer_name || '')} · ${e.start_datetime ? new Date(e.start_datetime).toLocaleDateString('ja-JP') : ''}</p>
        </div>
        <div style="display:flex; gap:6px; flex-shrink:0;">
          <button onclick="_adminApproveEvent('${_escapeHtml(e.event_id)}')"
            style="padding:5px 12px; background:rgba(57,255,20,0.15); border:1px solid rgba(57,255,20,0.4); color:var(--lime); border-radius:8px; font-size:11px; font-weight:700; cursor:pointer; transition:all 0.15s;">
            承認
          </button>
          <button onclick="_adminRejectEventPrompt('${_escapeHtml(e.event_id)}')"
            style="padding:5px 12px; background:var(--hot-dim); border:1px solid rgba(255,51,102,0.3); color:var(--hot); border-radius:8px; font-size:11px; font-weight:700; cursor:pointer; transition:all 0.15s;">
            却下
          </button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    el.innerHTML = `<p style="color:var(--hot); font-size:13px;">${_escapeHtml(err.message)}</p>`;
  }
}

// ─── イベント管理タブ ─────────────────────────────────

async function _adminEvents() {
  const el = document.getElementById('admin-content');
  el.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
      <h2 style="font-family:'Outfit',sans-serif; font-size:20px; font-weight:800; color:var(--c-text);">イベント管理</h2>
      <div style="display:flex; gap:8px;">
        <select id="event-status-filter" onchange="_adminEventsLoad()"
          style="${_admInput} appearance:none;"
          onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='var(--c-border)'">
          <option value="" style="background:var(--c-raised);">すべて</option>
          <option value="pending" style="background:var(--c-raised);">承認待ち</option>
          <option value="published" style="background:var(--c-raised);">公開中</option>
          <option value="draft" style="background:var(--c-raised);">下書き</option>
          <option value="cancelled" style="background:var(--c-raised);">キャンセル済</option>
        </select>
        <button onclick="_adminEventsCsvDownload()"
          style="display:flex; align-items:center; gap:6px; padding:8px 16px; background:var(--c-raised); border:1px solid var(--c-border); color:var(--c-text-1); border-radius:10px; font-size:12px; font-weight:600; cursor:pointer; transition:all 0.15s;"
          onmouseenter="this.style.borderColor='var(--accent)'" onmouseleave="this.style.borderColor='var(--c-border)'">
          <span class="material-icons-outlined" style="font-size:16px;">download</span>CSV
        </button>
      </div>
    </div>
    <div id="events-table">${_admSpinner}</div>
  `;

  await _adminEventsLoad();
}

async function _adminEventsLoad() {
  const el = document.getElementById('events-table');
  if (!el) return;

  const statusEl = document.getElementById('event-status-filter');
  const status   = statusEl ? statusEl.value : '';

  el.innerHTML = _admSpinner;

  try {
    const data   = await AdminAPI.events({ status, limit: 100 });
    const events = data.events || [];

    if (events.length === 0) {
      el.innerHTML = `<div style="${_admCard} text-align:center; padding:48px;"><p style="color:var(--c-dim);">イベントがありません</p></div>`;
      return;
    }

    window._adminEventsData = events;

    el.innerHTML = `
      <div style="background:var(--c-surface); border:1px solid var(--c-border); border-radius:16px; overflow:hidden;">
        <div style="overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse; font-size:13px;">
            <thead>
              <tr style="background:var(--c-raised);">
                <th style="text-align:left; padding:12px 16px; font-size:10px; font-weight:700; color:var(--c-dim); text-transform:uppercase; letter-spacing:0.08em;">イベント</th>
                <th style="text-align:left; padding:12px 16px; font-size:10px; font-weight:700; color:var(--c-dim); text-transform:uppercase; letter-spacing:0.08em;" class="hidden md:table-cell">主催者</th>
                <th style="text-align:left; padding:12px 16px; font-size:10px; font-weight:700; color:var(--c-dim); text-transform:uppercase; letter-spacing:0.08em;" class="hidden lg:table-cell">日時</th>
                <th style="text-align:left; padding:12px 16px; font-size:10px; font-weight:700; color:var(--c-dim); text-transform:uppercase; letter-spacing:0.08em;">ステータス</th>
                <th style="text-align:left; padding:12px 16px; font-size:10px; font-weight:700; color:var(--c-dim); text-transform:uppercase; letter-spacing:0.08em;">操作</th>
              </tr>
            </thead>
            <tbody>
              ${events.map((e, i) => _adminEventRow(e, i)).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    el.innerHTML = `<div style="${_admCard}"><p style="color:var(--hot);">${_escapeHtml(err.message)}</p></div>`;
  }
}

function _adminEventRow(e, i) {
  const statusStyles = {
    pending:   { label: '承認待ち', color: 'var(--amber)', bg: 'rgba(255,170,0,0.1)',  border: 'rgba(255,170,0,0.3)' },
    published: { label: '公開中',   color: 'var(--lime)',  bg: 'rgba(57,255,20,0.1)', border: 'rgba(57,255,20,0.3)' },
    draft:     { label: '下書き',   color: 'var(--c-dim)', bg: 'var(--c-raised)',       border: 'var(--c-border)' },
    cancelled: { label: 'キャンセル', color: 'var(--hot)', bg: 'var(--hot-dim)',        border: 'rgba(255,51,102,0.3)' },
  };
  const s    = statusStyles[e.status] || { label: '不明', color: 'var(--c-dim)', bg: 'var(--c-raised)', border: 'var(--c-border)' };
  const date = e.start_datetime ? new Date(e.start_datetime).toLocaleDateString('ja-JP') : '—';

  return `
    <tr style="border-top:1px solid var(--c-border); transition:background 0.15s;"
      onmouseenter="this.style.background='var(--c-raised)'" onmouseleave="this.style.background='none'">
      <td style="padding:12px 16px; cursor:pointer;" onclick="AppRouter.go('detail', { id: '${_escapeHtml(e.event_id)}' })">
        <div style="display:flex; align-items:center; gap:10px;">
          <img src="${_escapeHtml(e.cover_image_url || '')}" style="width:38px; height:38px; border-radius:8px; object-fit:cover; flex-shrink:0;"
            onerror="this.src='https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&q=60'">
          <div style="min-width:0;">
            <p style="font-size:13px; font-weight:600; color:var(--c-text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:200px;">${_escapeHtml(e.title || '')}</p>
            <p style="font-size:11px; color:var(--c-dim);">${_escapeHtml(e.category || '')} · ${e.event_type === 'online' ? 'オンライン' : 'オフライン'}</p>
          </div>
        </div>
      </td>
      <td style="padding:12px 16px; color:var(--c-text-2); font-size:12px;" class="hidden md:table-cell">${_escapeHtml(e.organizer_name || '—')}</td>
      <td style="padding:12px 16px; color:var(--c-dim); font-size:12px;" class="hidden lg:table-cell">${date}</td>
      <td style="padding:12px 16px;">
        <span style="padding:3px 10px; border-radius:99px; font-size:11px; font-weight:700; color:${s.color}; background:${s.bg}; border:1px solid ${s.border};">${s.label}</span>
      </td>
      <td style="padding:12px 16px;">
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          <button onclick="AppRouter.go('detail', { id: '${_escapeHtml(e.event_id)}' })"
            style="padding:4px 10px; background:var(--accent-dim); border:1px solid rgba(0,217,255,0.3); color:var(--accent); border-radius:6px; font-size:11px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:3px;">
            <span class="material-icons-outlined" style="font-size:12px;">open_in_new</span>詳細
          </button>
          ${e.status === 'pending' ? `
            <button onclick="_adminApproveEvent('${_escapeHtml(e.event_id)}')"
              style="padding:4px 10px; background:rgba(57,255,20,0.1); border:1px solid rgba(57,255,20,0.3); color:var(--lime); border-radius:6px; font-size:11px; font-weight:700; cursor:pointer;">承認</button>
            <button onclick="_adminRejectEventPrompt('${_escapeHtml(e.event_id)}')"
              style="padding:4px 10px; background:var(--hot-dim); border:1px solid rgba(255,51,102,0.3); color:var(--hot); border-radius:6px; font-size:11px; font-weight:700; cursor:pointer;">却下</button>
          ` : ''}
          <button onclick="_adminDeleteEventConfirm('${_escapeHtml(e.event_id)}', '${_escapeHtml(e.title || '')}')"
            style="padding:4px 10px; background:var(--c-raised); border:1px solid var(--c-border); color:var(--c-dim); border-radius:6px; font-size:11px; font-weight:600; cursor:pointer;">削除</button>
        </div>
      </td>
    </tr>
  `;
}

window._adminApproveEvent = async (eventId) => {
  try {
    await AdminAPI.approveEvent(eventId);
    AppUI.toast('イベントを承認しました', 'success');
    await _adminEventsLoad();
    await _loadPendingEvents();
  } catch (err) {
    AppUI.toast(err.message || '承認に失敗しました', 'error');
  }
};

window._adminRejectEventPrompt = (eventId) => {
  const reason = prompt('却下理由を入力してください（任意）:');
  if (reason === null) return;
  _adminRejectEventExec(eventId, reason || '');
};

async function _adminRejectEventExec(eventId, reason) {
  try {
    await AdminAPI.rejectEvent(eventId, reason);
    AppUI.toast('イベントを却下しました', 'info');
    await _adminEventsLoad();
  } catch (err) {
    AppUI.toast(err.message || '却下に失敗しました', 'error');
  }
}

window._adminDeleteEventConfirm = (eventId, title) => {
  if (!confirm(`「${title}」を削除してよろしいですか？\nこの操作は取り消せません。`)) return;
  _adminDeleteEventExec(eventId);
};

async function _adminDeleteEventExec(eventId) {
  try {
    await AdminAPI.deleteEvent(eventId);
    AppUI.toast('イベントを削除しました', 'success');
    await _adminEventsLoad();
  } catch (err) {
    AppUI.toast(err.message || '削除に失敗しました', 'error');
  }
}

function _adminEventsCsvDownload() {
  const events = window._adminEventsData || [];
  if (events.length === 0) { AppUI.toast('データがありません', 'warning'); return; }

  const headers = ['イベントID', 'タイトル', '主催者', 'カテゴリ', 'タイプ', '開始日時', '最大参加者', 'ステータス', '価格'];
  const rows = events.map(e => [
    e.event_id || '', e.title || '', e.organizer_name || '', e.category || '',
    e.type === 'online' ? 'オンライン' : 'オフライン',
    e.start_datetime ? new Date(e.start_datetime).toLocaleString('ja-JP') : '',
    e.max_attendees || '', e.status || '', e.price != null ? e.price : '',
  ]);

  const csv = '\uFEFF' + [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: `linkup_events_${new Date().toISOString().slice(0,10)}.csv` });
  a.click(); URL.revokeObjectURL(url);
  AppUI.toast('CSVをダウンロードしました', 'success');
}

// ─── チケット・注文タブ ───────────────────────────────

async function _adminTickets() {
  const el = document.getElementById('admin-content');
  el.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
      <h2 style="font-family:'Outfit',sans-serif; font-size:20px; font-weight:800; color:var(--c-text);">チケット・注文管理</h2>
      <button onclick="_adminOrdersCsvDownload()"
        style="display:flex; align-items:center; gap:6px; padding:8px 16px; background:var(--c-raised); border:1px solid var(--c-border); color:var(--c-text-1); border-radius:10px; font-size:12px; font-weight:600; cursor:pointer; transition:all 0.15s;"
        onmouseenter="this.style.borderColor='var(--accent)'" onmouseleave="this.style.borderColor='var(--c-border)'">
        <span class="material-icons-outlined" style="font-size:16px;">download</span>CSV
      </button>
    </div>
    <div id="orders-table">${_admSpinner}</div>
  `;

  await _adminOrdersLoad();
}

async function _adminOrdersLoad() {
  const el = document.getElementById('orders-table');
  if (!el) return;

  try {
    let data;
    try {
      data = await AdminAPI.orders({ limit: 100 });
    } catch (e) {
      data = await window.LinkUpAPI._request('GET', '/api/orders', null, true);
    }
    const orders = data.orders || [];

    window._adminOrdersData = orders;

    if (orders.length === 0) {
      el.innerHTML = `<div style="${_admCard} text-align:center; padding:48px;"><p style="color:var(--c-dim);">注文がありません</p></div>`;
      return;
    }

    const totalRevenue   = orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
    const completedCount = orders.filter(o => o.payment_status === 'completed').length;

    el.innerHTML = `
      <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:20px;">
        <div style="${_admCard} text-align:center;">
          <p style="font-family:'Outfit',sans-serif; font-size:28px; font-weight:800; color:var(--accent);">${orders.length}</p>
          <p style="font-size:11px; color:var(--c-dim); margin-top:4px;">総注文数</p>
        </div>
        <div style="${_admCard} text-align:center;">
          <p style="font-family:'Outfit',sans-serif; font-size:28px; font-weight:800; color:var(--lime);">${completedCount}</p>
          <p style="font-size:11px; color:var(--c-dim); margin-top:4px;">完了</p>
        </div>
        <div style="${_admCard} text-align:center;">
          <p style="font-family:'Outfit',sans-serif; font-size:24px; font-weight:800; color:var(--amber);">¥${totalRevenue.toLocaleString()}</p>
          <p style="font-size:11px; color:var(--c-dim); margin-top:4px;">総売上</p>
        </div>
      </div>

      <div style="background:var(--c-surface); border:1px solid var(--c-border); border-radius:16px; overflow:hidden;">
        <div style="overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse; font-size:13px;">
            <thead>
              <tr style="background:var(--c-raised);">
                <th style="text-align:left; padding:10px 16px; font-size:10px; font-weight:700; color:var(--c-dim); text-transform:uppercase; letter-spacing:0.08em;">注文番号</th>
                <th style="text-align:left; padding:10px 16px; font-size:10px; font-weight:700; color:var(--c-dim); text-transform:uppercase; letter-spacing:0.08em;" class="hidden md:table-cell">イベント</th>
                <th style="text-align:left; padding:10px 16px; font-size:10px; font-weight:700; color:var(--c-dim); text-transform:uppercase; letter-spacing:0.08em;" class="hidden lg:table-cell">日時</th>
                <th style="text-align:left; padding:10px 16px; font-size:10px; font-weight:700; color:var(--c-dim); text-transform:uppercase; letter-spacing:0.08em;">金額</th>
                <th style="text-align:left; padding:10px 16px; font-size:10px; font-weight:700; color:var(--c-dim); text-transform:uppercase; letter-spacing:0.08em;">状態</th>
              </tr>
            </thead>
            <tbody>
              ${orders.map((o, i) => _adminOrderRow(o, i)).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    el.innerHTML = `<div style="${_admCard}"><p style="color:var(--hot);">${_escapeHtml(err.message)}</p></div>`;
  }
}

function _adminOrderRow(o, i) {
  const date = o.created_at ? new Date(o.created_at).toLocaleDateString('ja-JP') : '—';
  const statusStyles = {
    completed: { label: '完了',    color: 'var(--lime)',  bg: 'rgba(57,255,20,0.1)' },
    pending:   { label: '保留中',  color: 'var(--amber)', bg: 'rgba(255,170,0,0.1)' },
    cancelled: { label: 'キャンセル', color: 'var(--hot)', bg: 'var(--hot-dim)' },
  };
  const s = statusStyles[o.payment_status] || { label: '不明', color: 'var(--c-dim)', bg: 'var(--c-raised)' };

  return `
    <tr style="border-top:1px solid var(--c-border); transition:background 0.15s;"
      onmouseenter="this.style.background='var(--c-raised)'" onmouseleave="this.style.background='none'">
      <td style="padding:10px 16px;"><span style="font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--c-dim);">${_escapeHtml(o.order_number || o.order_id || '—')}</span></td>
      <td style="padding:10px 16px; color:var(--c-text-1); max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" class="hidden md:table-cell">${_escapeHtml(o.event_title || '—')}</td>
      <td style="padding:10px 16px; color:var(--c-dim); font-size:12px;" class="hidden lg:table-cell">${date}</td>
      <td style="padding:10px 16px; font-weight:700; color:var(--c-text);">¥${Number(o.total_amount || 0).toLocaleString()}</td>
      <td style="padding:10px 16px;">
        <span style="padding:3px 10px; border-radius:99px; font-size:11px; font-weight:700; color:${s.color}; background:${s.bg};">${s.label}</span>
      </td>
    </tr>
  `;
}

function _adminOrdersCsvDownload() {
  const orders = window._adminOrdersData || [];
  if (orders.length === 0) { AppUI.toast('データがありません', 'warning'); return; }

  const headers = ['注文番号', 'イベント', '購入日', '金額', '状態'];
  const rows = orders.map(o => [
    o.order_number || o.order_id || '',
    o.event_title || '',
    o.created_at ? new Date(o.created_at).toLocaleString('ja-JP') : '',
    o.total_amount || 0,
    o.payment_status || '',
  ]);

  const csv = '\uFEFF' + [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: `linkup_orders_${new Date().toISOString().slice(0,10)}.csv` });
  a.click(); URL.revokeObjectURL(url);
  AppUI.toast('CSVをダウンロードしました', 'success');
}

// ─── ユーザー管理タブ ─────────────────────────────────

async function _adminUsers() {
  const el = document.getElementById('admin-content');
  el.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; flex-wrap:wrap; gap:10px;">
      <h2 style="font-family:'Outfit',sans-serif; font-size:20px; font-weight:800; color:var(--c-text);">ユーザー管理</h2>
      <div style="display:flex; gap:8px;">
        <input id="user-search" type="text" placeholder="メール・名前で検索..."
          style="${_admInput}"
          onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='var(--c-border)'">
        <select id="user-role-filter" onchange="_adminUsersLoad()"
          style="${_admInput} appearance:none;"
          onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='var(--c-border)'">
          <option value="" style="background:var(--c-raised);">すべてのロール</option>
          <option value="admin" style="background:var(--c-raised);">管理者</option>
          <option value="organizer" style="background:var(--c-raised);">主催者</option>
          <option value="attendee" style="background:var(--c-raised);">参加者</option>
        </select>
      </div>
    </div>
    <div id="users-table">${_admSpinner}</div>
  `;

  document.getElementById('user-search')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') _adminUsersLoad();
  });

  await _adminUsersLoad();
}

async function _adminUsersLoad() {
  const el = document.getElementById('users-table');
  if (!el) return;

  const search = document.getElementById('user-search')?.value?.trim() || '';
  const role   = document.getElementById('user-role-filter')?.value || '';

  el.innerHTML = _admSpinner;

  try {
    const data  = await AdminAPI.users({ search, role, limit: 100 });
    const users = data.users || [];

    if (users.length === 0) {
      el.innerHTML = `<div style="${_admCard} text-align:center; padding:48px;"><p style="color:var(--c-dim);">ユーザーが見つかりません</p></div>`;
      return;
    }

    el.innerHTML = `
      <div style="background:var(--c-surface); border:1px solid var(--c-border); border-radius:16px; overflow:hidden;">
        <div style="overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse; font-size:13px;">
            <thead>
              <tr style="background:var(--c-raised);">
                ${['#','ユーザー','メール','ロール','登録日','操作'].map(h => `
                  <th style="text-align:left; padding:10px 16px; font-size:10px; font-weight:700; color:var(--c-dim); text-transform:uppercase; letter-spacing:0.08em;">${h}</th>
                `).join('')}
              </tr>
            </thead>
            <tbody>
              ${users.map((u, i) => _adminUserRow(u, i)).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    el.innerHTML = `<div style="${_admCard}"><p style="color:var(--hot);">${_escapeHtml(err.message)}</p></div>`;
  }
}

function _adminUserRow(u, i) {
  const roleStyles = {
    admin:    { label: '管理者',  color: 'var(--hot)',    bg: 'var(--hot-dim)'               },
    organizer:{ label: '主催者',  color: 'var(--violet)', bg: 'rgba(155,89,255,0.1)'         },
    attendee: { label: '参加者',  color: 'var(--accent)', bg: 'var(--accent-dim)'            },
  };
  const r      = roleStyles[u.role] || { label: '不明', color: 'var(--c-dim)', bg: 'var(--c-raised)' };
  const date   = u.created_at ? new Date(u.created_at).toLocaleDateString('ja-JP') : '—';
  const avatar = u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.display_name || 'U')}&background=00D9FF&color=0A0F1E&bold=true&size=40`;

  return `
    <tr style="border-top:1px solid var(--c-border); transition:background 0.15s;"
      onmouseenter="this.style.background='var(--c-raised)'" onmouseleave="this.style.background='none'">
      <td style="padding:10px 16px; color:var(--c-muted); font-size:11px;">${i + 1}</td>
      <td style="padding:10px 16px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <img src="${avatar}" style="width:32px; height:32px; border-radius:50%; object-fit:cover; border:1px solid var(--c-border);"
            onerror="this.src='https://ui-avatars.com/api/?name=U&background=00D9FF&color=0A0F1E&bold=true&size=40'">
          <span style="font-size:13px; font-weight:600; color:var(--c-text);">${_escapeHtml(u.display_name || u.name || '—')}</span>
        </div>
      </td>
      <td style="padding:10px 16px; color:var(--c-dim); font-size:12px;">${_escapeHtml(u.email || '—')}</td>
      <td style="padding:10px 16px;">
        <span style="padding:3px 10px; border-radius:99px; font-size:11px; font-weight:700; color:${r.color}; background:${r.bg};">${r.label}</span>
      </td>
      <td style="padding:10px 16px; color:var(--c-dim); font-size:12px;">${date}</td>
      <td style="padding:10px 16px;">
        <button onclick="_adminEditUserModal('${_escapeHtml(u.user_id)}')"
          style="padding:5px 12px; background:var(--c-raised); border:1px solid var(--c-border); color:var(--c-dim); border-radius:8px; font-size:11px; font-weight:600; cursor:pointer; transition:all 0.15s;"
          onmouseenter="this.style.borderColor='var(--accent)';this.style.color='var(--accent)'"
          onmouseleave="this.style.borderColor='var(--c-border)';this.style.color='var(--c-dim)'">
          編集
        </button>
      </td>
    </tr>
  `;
}

window._adminEditUserModal = async (userId) => {
  try {
    const data = await window.LinkUpAPI._request('GET', `/api/admin/users/${userId}`, null, true);
    const u    = data.user || data;

    const modal     = document.getElementById('modal-content');
    const container = document.getElementById('modal-container');

    const iStyle = `width:100%; background:var(--c-raised); border:1.5px solid var(--c-border); color:var(--c-text); border-radius:10px; padding:10px 14px; font-size:13px; outline:none; transition:border-color 0.15s; box-sizing:border-box;`;

    modal.innerHTML = `
      <div style="background:var(--c-surface); border:1px solid rgba(0,217,255,0.2); border-radius:16px; padding:24px; width:100%; max-width:400px; margin:0 16px; box-shadow:0 32px 80px rgba(0,0,0,0.7);">
        <h3 style="font-size:16px; font-weight:800; color:var(--c-text); margin-bottom:20px;">ユーザー編集</h3>
        <form id="admin-user-form" style="display:flex; flex-direction:column; gap:14px;">
          <div>
            <label style="display:block; font-size:11px; font-weight:700; color:var(--c-dim); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:6px;">表示名</label>
            <input type="text" name="display_name" value="${_escapeHtml(u.display_name || u.name || '')}"
              style="${iStyle}"
              onfocus="this.style.borderColor='var(--accent)';this.style.boxShadow='0 0 0 3px var(--accent-dim)'"
              onblur="this.style.borderColor='var(--c-border)';this.style.boxShadow='none'">
          </div>
          <div>
            <label style="display:block; font-size:11px; font-weight:700; color:var(--c-dim); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:6px;">ロール</label>
            <select name="role" style="${iStyle} appearance:none;"
              onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='var(--c-border)'">
              <option value="attendee"  ${u.role === 'attendee'  ? 'selected' : ''} style="background:var(--c-raised);">参加者</option>
              <option value="organizer" ${u.role === 'organizer' ? 'selected' : ''} style="background:var(--c-raised);">主催者</option>
              <option value="admin"     ${u.role === 'admin'     ? 'selected' : ''} style="background:var(--c-raised);">管理者</option>
            </select>
          </div>
          <div style="display:flex; gap:10px; margin-top:4px;">
            <button type="submit"
              style="flex:1; background:linear-gradient(135deg,var(--accent),#00AACC); color:var(--c-bg); border:none; border-radius:10px; padding:12px; font-size:14px; font-weight:800; cursor:pointer;">
              保存する
            </button>
            <button type="button" onclick="AppUI.closeModal()"
              style="flex:1; background:var(--c-raised); border:1px solid var(--c-border); color:var(--c-dim); border-radius:10px; padding:12px; font-size:14px; font-weight:600; cursor:pointer;">
              キャンセル
            </button>
          </div>
        </form>
      </div>
    `;

    container.classList.remove('hidden');

    document.getElementById('admin-user-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        await AdminAPI.updateUser(userId, {
          display_name: fd.get('display_name'),
          role:         fd.get('role'),
        });
        AppUI.closeModal();
        AppUI.toast('ユーザーを更新しました', 'success');
        await _adminUsersLoad();
      } catch (err) {
        AppUI.toast(err.message || '更新に失敗しました', 'error');
      }
    });
  } catch (err) {
    AppUI.toast(err.message || 'ユーザー情報の取得に失敗しました', 'error');
  }
};

// ─── QR入場受付タブ ───────────────────────────────────

async function _adminCheckin() {
  const el = document.getElementById('admin-content');

  el.innerHTML = `
    <h2 style="font-family:'Outfit',sans-serif; font-size:20px; font-weight:800; color:var(--c-text); margin-bottom:20px;">QR入場受付</h2>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">

      <!-- 手動入力確認 -->
      <div style="${_admCard}">
        <h3 style="font-size:14px; font-weight:700; color:var(--c-text); margin-bottom:16px; display:flex; align-items:center; gap:8px;">
          <span class="material-icons-outlined" style="font-size:18px; color:var(--accent);">search</span>
          注文番号・チケットID検証
        </h3>
        <div style="display:flex; gap:8px; margin-bottom:16px;">
          <input id="checkin-input" type="text" placeholder="注文番号またはチケットIDを入力"
            style="${_admInput} flex:1; font-family:'JetBrains Mono',monospace;"
            onfocus="this.style.borderColor='var(--accent)';this.style.boxShadow='0 0 0 3px var(--accent-dim)'"
            onblur="this.style.borderColor='var(--c-border)';this.style.boxShadow='none'">
          <button onclick="_adminVerifyTicket()"
            style="padding:8px 16px; background:linear-gradient(135deg,var(--accent),#00AACC); color:var(--c-bg); border:none; border-radius:10px; font-size:13px; font-weight:700; cursor:pointer; flex-shrink:0;">
            確認
          </button>
        </div>
        <div id="checkin-result"></div>
      </div>

      <!-- QRスキャナー案内 -->
      <div style="${_admCard}">
        <h3 style="font-size:14px; font-weight:700; color:var(--c-text); margin-bottom:16px; display:flex; align-items:center; gap:8px;">
          <span class="material-icons-outlined" style="font-size:18px; color:var(--accent);">qr_code_scanner</span>
          QRコードスキャン
        </h3>
        <p style="font-size:13px; color:var(--c-dim); margin-bottom:16px; line-height:1.6;">
          参加者のチケットのQRコードをスキャンして入場確認を行います。
        </p>
        <button onclick="_adminStartQRScan()"
          style="width:100%; padding:12px; background:var(--accent-dim); border:1px solid rgba(0,217,255,0.3); color:var(--accent); border-radius:12px; font-size:13px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:all 0.15s;"
          onmouseenter="this.style.background='rgba(0,217,255,0.12)'" onmouseleave="this.style.background='var(--accent-dim)'">
          <span class="material-icons-outlined" style="font-size:20px;">qr_code_scanner</span>
          カメラでスキャン開始
        </button>
        <div id="qr-scanner-container" style="margin-top:12px;"></div>
      </div>
    </div>

    <!-- 入場ログ -->
    <div style="${_admCard}">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
        <h3 style="font-size:14px; font-weight:700; color:var(--c-text); display:flex; align-items:center; gap:8px;">
          <span class="material-icons-outlined" style="font-size:16px; color:var(--c-dim);">history</span>
          本日の入場ログ
        </h3>
        <button onclick="_adminClearCheckinLog()"
          style="font-size:12px; color:var(--c-dim); background:none; border:none; cursor:pointer; transition:color 0.15s;"
          onmouseenter="this.style.color='var(--hot)'" onmouseleave="this.style.color='var(--c-dim)'">
          ログをクリア
        </button>
      </div>
      <div id="checkin-log">
        <p style="color:var(--c-dim); font-size:13px; text-align:center; padding:24px;">まだ確認記録はありません</p>
      </div>
    </div>
  `;

  document.getElementById('checkin-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') _adminVerifyTicket();
  });

  _adminRenderCheckinLog();
}

window._adminVerifyTicket = async () => {
  const input  = document.getElementById('checkin-input');
  const result = document.getElementById('checkin-result');
  const code   = input?.value?.trim();

  if (!code) {
    result.innerHTML = `<div style="padding:10px 14px; background:rgba(255,170,0,0.1); border:1px solid rgba(255,170,0,0.3); border-radius:10px; font-size:13px; color:var(--amber);">チケットIDまたは注文番号を入力してください</div>`;
    return;
  }

  result.innerHTML = `<div style="text-align:center; padding:16px;"><div style="width:24px;height:24px;border:2.5px solid var(--c-border);border-top-color:var(--accent);border-radius:50%;animation:spin 0.9s linear infinite;margin:0 auto;"></div></div>`;

  try {
    let data;
    try {
      data = await window.LinkUpAPI._request('POST', '/api/checkin/verify', { code }, true);
    } catch (e) {
      data = { success: false, message: e.message };
    }

    const ok = data.success || data.valid;
    const entry = {
      code,
      status:  ok ? 'valid' : 'invalid',
      message: data.message || (ok ? '入場確認済み' : '無効なチケット'),
      event:   data.event_title || data.event || '',
      user:    data.user_name   || data.user  || '',
      time:    new Date().toLocaleTimeString('ja-JP'),
    };

    _adminAddCheckinLog(entry);
    _adminRenderCheckinLog();

    result.innerHTML = ok ? `
      <div style="padding:16px; background:rgba(57,255,20,0.08); border:1.5px solid rgba(57,255,20,0.35); border-radius:12px;">
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
          <span class="material-icons-outlined" style="font-size:28px; color:var(--lime);">check_circle</span>
          <span style="font-size:16px; font-weight:800; color:var(--lime);">入場OK</span>
        </div>
        ${entry.event ? `<p style="font-size:13px; color:var(--c-text-2); margin-bottom:4px;">イベント: ${_escapeHtml(entry.event)}</p>` : ''}
        ${entry.user  ? `<p style="font-size:13px; color:var(--c-text-2);">参加者: ${_escapeHtml(entry.user)}</p>` : ''}
      </div>
    ` : `
      <div style="padding:16px; background:var(--hot-dim); border:1.5px solid rgba(255,51,102,0.35); border-radius:12px; display:flex; align-items:center; gap:10px;">
        <span class="material-icons-outlined" style="font-size:28px; color:var(--hot);">cancel</span>
        <div>
          <p style="font-size:14px; font-weight:800; color:var(--hot);">無効なチケット</p>
          <p style="font-size:12px; color:var(--c-dim); margin-top:4px;">${_escapeHtml(entry.message)}</p>
        </div>
      </div>
    `;

    input.value = '';
  } catch (err) {
    result.innerHTML = `<div style="padding:10px 14px; background:var(--hot-dim); border:1px solid rgba(255,51,102,0.3); border-radius:10px; font-size:13px; color:var(--hot);">${_escapeHtml(err.message)}</div>`;
  }
};

function _adminAddCheckinLog(entry) {
  const logs = JSON.parse(localStorage.getItem('admin_checkin_log') || '[]');
  logs.unshift(entry);
  if (logs.length > 50) logs.pop();
  localStorage.setItem('admin_checkin_log', JSON.stringify(logs));
}

function _adminRenderCheckinLog() {
  const el = document.getElementById('checkin-log');
  if (!el) return;

  const logs = JSON.parse(localStorage.getItem('admin_checkin_log') || '[]');

  if (logs.length === 0) {
    el.innerHTML = `<p style="color:var(--c-dim); font-size:13px; text-align:center; padding:24px;">まだ確認記録はありません</p>`;
    return;
  }

  el.innerHTML = `
    <div style="max-height:280px; overflow-y:auto; display:flex; flex-direction:column; gap:6px;">
      ${logs.map(l => `
        <div style="display:flex; align-items:center; gap:10px; padding:10px 12px; background:${l.status === 'valid' ? 'rgba(57,255,20,0.06)' : 'var(--hot-dim)'}; border:1px solid ${l.status === 'valid' ? 'rgba(57,255,20,0.2)' : 'rgba(255,51,102,0.2)'}; border-radius:10px;">
          <span class="material-icons-outlined" style="font-size:16px; color:${l.status === 'valid' ? 'var(--lime)' : 'var(--hot)'};">
            ${l.status === 'valid' ? 'check_circle' : 'cancel'}
          </span>
          <div style="flex:1; min-width:0;">
            <p style="font-family:'JetBrains Mono',monospace; font-size:11px; font-weight:600; color:${l.status === 'valid' ? 'var(--lime)' : 'var(--hot)'}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${_escapeHtml(l.code)}</p>
            ${l.event ? `<p style="font-size:11px; color:var(--c-dim);">${_escapeHtml(l.event)}</p>` : ''}
          </div>
          <span style="font-size:11px; color:var(--c-dim); flex-shrink:0;">${l.time}</span>
        </div>
      `).join('')}
    </div>
  `;
}

window._adminClearCheckinLog = () => {
  localStorage.removeItem('admin_checkin_log');
  _adminRenderCheckinLog();
  AppUI.toast('ログをクリアしました', 'info');
};

window._adminStartQRScan = () => {
  const container = document.getElementById('qr-scanner-container');
  if (!container) return;
  container.innerHTML = `
    <div style="background:var(--c-raised); border:1px solid var(--c-border); border-radius:12px; padding:20px; text-align:center;">
      <span class="material-icons-outlined" style="font-size:36px; color:var(--c-muted); display:block; margin-bottom:8px;">photo_camera</span>
      <p style="font-size:12px; color:var(--c-dim); line-height:1.6;">QRコードスキャン機能はカメラAPIが必要なため、<br>スマートフォンや対応ブラウザでご利用ください。<br>現在は手動入力での確認が可能です。</p>
    </div>
  `;
};

// グローバルに公開
window._adminDashboard = _adminDashboard;
window._adminEvents    = _adminEvents;
window._adminTickets   = _adminTickets;
window._adminUsers     = _adminUsers;
window._adminCheckin   = _adminCheckin;
