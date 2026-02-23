/**
 * 管理者ダッシュボード
 *
 * API:
 *   GET  /api/admin/stats        – 統計情報
 *   GET  /api/admin/events       – イベント一覧（承認管理）
 *   PUT  /api/admin/events/:id/approve – イベント承認
 *   PUT  /api/admin/events/:id/reject  – イベント却下
 *   DELETE /api/admin/events/:id – イベント削除
 *   GET  /api/admin/users        – ユーザー一覧
 *   PUT  /api/admin/users/:id    – ユーザー更新
 *   GET  /api/orders             – 全注文（管理者向け）
 */

// ─── 管理者専用API ────────────────────────────

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

// ─── メインレンダリング ──────────────────────────

async function renderAdmin(params = {}) {
  // ロールガード
  if (!AppAuth.requireRole(['admin'])) return;

  const user = window.currentUser;
  const tab = params.tab || 'dashboard';

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="min-h-screen bg-slate-50 flex flex-col">
      <!-- 管理者ヘッダー -->
      <div class="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="material-icons-outlined text-red-400">admin_panel_settings</span>
          <span class="font-bold text-lg">LinkUp 管理コンソール</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-sm text-slate-300">${_escapeHtml(user?.display_name || user?.email || 'Admin')}</span>
          <button onclick="AppRouter.go('home')"
            class="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 rounded-lg transition">
            サイトへ戻る
          </button>
        </div>
      </div>

      <div class="flex flex-1">
        <!-- サイドバー（PC） -->
        <aside class="w-56 bg-slate-800 text-white flex-shrink-0 hidden lg:block">
          <nav class="p-4 space-y-1">
            ${_adminNavItem('dashboard', tab, 'dashboard', 'ダッシュボード')}
            <p class="text-[10px] text-slate-500 uppercase tracking-wider px-2 pt-4 pb-1">コンテンツ</p>
            ${_adminNavItem('events', tab, 'event', 'イベント管理')}
            ${_adminNavItem('tickets', tab, 'confirmation_number', 'チケット・注文')}
            ${_adminNavItem('users', tab, 'people', 'ユーザー管理')}
            <p class="text-[10px] text-slate-500 uppercase tracking-wider px-2 pt-4 pb-1">入場管理</p>
            ${_adminNavItem('checkin', tab, 'qr_code_scanner', 'QR入場受付')}
          </nav>
        </aside>

        <!-- モバイルタブ -->
        <div class="lg:hidden w-full border-b border-slate-200 bg-white flex overflow-x-auto">
          ${_adminMobileTab('dashboard', tab, 'dashboard', '概要')}
          ${_adminMobileTab('events', tab, 'event', 'イベント')}
          ${_adminMobileTab('tickets', tab, 'confirmation_number', '注文')}
          ${_adminMobileTab('users', tab, 'people', 'ユーザー')}
          ${_adminMobileTab('checkin', tab, 'qr_code_scanner', 'QR')}
        </div>

        <!-- メインコンテンツ -->
        <main class="flex-1 overflow-auto">
          <div class="p-6" id="admin-content">
            <div class="flex justify-center py-16">
              <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          </div>
        </main>
      </div>
    </div>
  `;

  // タブ描画
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
      class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition
        ${isActive ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}">
      <span class="material-icons-outlined text-sm">${icon}</span>${label}
    </button>
  `;
}

function _adminMobileTab(key, active, icon, label) {
  const isActive = key === active;
  return `
    <button onclick="AppRouter.go('admin', { tab: '${key}' })"
      class="flex flex-col items-center gap-0.5 px-4 py-2.5 text-xs transition whitespace-nowrap
        ${isActive ? 'text-blue-600 border-b-2 border-blue-600 font-bold' : 'text-slate-500'}">
      <span class="material-icons-outlined text-base">${icon}</span>${label}
    </button>
  `;
}

// ─── ダッシュボードタブ ──────────────────────────

async function _adminDashboard() {
  const el = document.getElementById('admin-content');

  try {
    const data = await AdminAPI.stats();
    const stats = data.stats || data || {};

    el.innerHTML = `
      <h2 class="text-xl font-bold text-slate-800 mb-6">ダッシュボード</h2>

      <!-- KPIカード -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        ${_adminStatCard('people', 'ユーザー数', stats.total_users || stats.users || '—', 'text-blue-600 bg-blue-50')}
        ${_adminStatCard('event', 'イベント数', stats.total_events || stats.events || '—', 'text-green-600 bg-green-50')}
        ${_adminStatCard('confirmation_number', '総注文数', stats.total_orders || stats.orders || '—', 'text-purple-600 bg-purple-50')}
        ${_adminStatCard('payments', '総売上', stats.total_revenue != null ? '¥' + Number(stats.total_revenue).toLocaleString() : '—', 'text-orange-600 bg-orange-50')}
      </div>

      <!-- 承認待ちイベント -->
      <div class="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-slate-800">承認待ちイベント</h3>
          <button onclick="AppRouter.go('admin', { tab: 'events' })"
            class="text-xs text-blue-600 hover:underline">すべて見る →</button>
        </div>
        <div id="pending-events-list">
          <div class="text-center text-slate-400 py-4 text-sm">読み込み中...</div>
        </div>
      </div>

      <!-- クイックアクション -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        ${_adminQuickAction('event', 'events', 'イベント管理')}
        ${_adminQuickAction('people', 'users', 'ユーザー管理')}
        ${_adminQuickAction('confirmation_number', 'tickets', 'チケット・注文')}
        ${_adminQuickAction('qr_code_scanner', 'checkin', 'QR入場受付')}
      </div>
    `;

    // 承認待ちイベントを読み込む
    _loadPendingEvents();

  } catch (err) {
    el.innerHTML = `<div class="bg-red-50 text-red-700 rounded-xl p-5">${_escapeHtml(err.message)}</div>`;
  }
}

function _adminStatCard(icon, label, value, colorCls) {
  return `
    <div class="bg-white rounded-2xl p-5 shadow-sm">
      <div class="flex items-center gap-3 mb-2">
        <span class="material-icons-outlined ${colorCls} p-2 rounded-lg text-lg">${icon}</span>
      </div>
      <p class="text-2xl font-bold text-slate-800">${value}</p>
      <p class="text-xs text-slate-500 mt-1">${label}</p>
    </div>
  `;
}

function _adminQuickAction(icon, tab, label) {
  return `
    <button onclick="AppRouter.go('admin', { tab: '${tab}' })"
      class="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition text-center">
      <span class="material-icons-outlined text-blue-600 text-2xl block mb-2">${icon}</span>
      <p class="text-xs font-medium text-slate-700">${label}</p>
    </button>
  `;
}

async function _loadPendingEvents() {
  const el = document.getElementById('pending-events-list');
  if (!el) return;

  try {
    const data = await AdminAPI.events({ status: 'pending', limit: 5 });
    const events = data.events || [];

    if (events.length === 0) {
      el.innerHTML = `<p class="text-slate-400 text-sm text-center py-4">承認待ちのイベントはありません</p>`;
      return;
    }

    el.innerHTML = events.map(e => `
      <div class="flex items-center gap-3 p-3 border border-slate-100 rounded-lg mb-2">
        <img src="${_escapeHtml(e.cover_image_url || '')}" class="w-12 h-12 rounded-lg object-cover flex-shrink-0"
          onerror="this.src='https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&q=60'">
        <div class="flex-1 min-w-0">
          <p class="font-medium text-sm text-slate-800 truncate">${_escapeHtml(e.title || '')}</p>
          <p class="text-xs text-slate-400">${_escapeHtml(e.organizer_name || '')} · ${e.start_datetime ? new Date(e.start_datetime).toLocaleDateString('ja-JP') : ''}</p>
        </div>
        <div class="flex gap-2 flex-shrink-0">
          <button onclick="_adminApproveEvent('${_escapeHtml(e.event_id)}')"
            class="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 font-medium">承認</button>
          <button onclick="_adminRejectEventPrompt('${_escapeHtml(e.event_id)}')"
            class="px-3 py-1.5 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-200 font-medium">却下</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    el.innerHTML = `<p class="text-red-500 text-sm">${_escapeHtml(err.message)}</p>`;
  }
}

// ─── イベント管理タブ ────────────────────────────

async function _adminEvents() {
  const el = document.getElementById('admin-content');
  el.innerHTML = `
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-slate-800">イベント管理</h2>
      <div class="flex gap-2">
        <select id="event-status-filter" onchange="_adminEventsLoad()"
          class="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">すべて</option>
          <option value="pending">承認待ち</option>
          <option value="published">公開中</option>
          <option value="draft">下書き</option>
          <option value="cancelled">キャンセル済</option>
        </select>
        <button onclick="_adminEventsCsvDownload()"
          class="flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700">
          <span class="material-icons-outlined text-sm">download</span>CSV
        </button>
      </div>
    </div>
    <div id="events-table">
      <div class="flex justify-center py-12">
        <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    </div>
  `;

  await _adminEventsLoad();
}

async function _adminEventsLoad() {
  const el = document.getElementById('events-table');
  if (!el) return;

  const statusEl = document.getElementById('event-status-filter');
  const status = statusEl ? statusEl.value : '';

  el.innerHTML = `<div class="flex justify-center py-8"><div class="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>`;

  try {
    const data = await AdminAPI.events({ status, limit: 100 });
    const events = data.events || [];

    if (events.length === 0) {
      el.innerHTML = `<div class="bg-white rounded-xl p-8 text-center text-slate-400">イベントがありません</div>`;
      return;
    }

    // CSVデータを保存
    window._adminEventsData = events;

    el.innerHTML = `
      <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 border-b border-slate-200">
              <tr>
                <th class="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">イベント</th>
                <th class="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">主催者</th>
                <th class="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">日時</th>
                <th class="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">ステータス</th>
                <th class="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${events.map((e, i) => _adminEventRow(e, i)).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    el.innerHTML = `<div class="bg-red-50 text-red-700 rounded-xl p-5">${_escapeHtml(err.message)}</div>`;
  }
}

function _adminEventRow(e, i) {
  const statusMap = {
    pending:   ['承認待ち', 'bg-yellow-100 text-yellow-700'],
    published: ['公開中',   'bg-green-100 text-green-700'],
    draft:     ['下書き',   'bg-slate-100 text-slate-600'],
    cancelled: ['キャンセル', 'bg-red-100 text-red-700'],
  };
  const [statusLabel, statusCls] = statusMap[e.status] || ['不明', 'bg-slate-100 text-slate-600'];
  const date = e.start_datetime ? new Date(e.start_datetime).toLocaleDateString('ja-JP') : '—';

  return `
    <tr class="${i % 2 === 0 ? '' : 'bg-slate-50/50'}">
      <td class="px-4 py-3">
        <div class="flex items-center gap-3">
          <img src="${_escapeHtml(e.cover_image_url || '')}" class="w-10 h-10 rounded-lg object-cover flex-shrink-0"
            onerror="this.src='https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&q=60'">
          <div class="min-w-0">
            <p class="font-medium text-slate-800 truncate max-w-xs">${_escapeHtml(e.title || '')}</p>
            <p class="text-xs text-slate-400">${_escapeHtml(e.category || '')} · ${e.type === 'online' ? 'オンライン' : 'オフライン'}</p>
          </div>
        </div>
      </td>
      <td class="px-4 py-3 text-slate-600 hidden md:table-cell">${_escapeHtml(e.organizer_name || '—')}</td>
      <td class="px-4 py-3 text-slate-600 hidden lg:table-cell">${date}</td>
      <td class="px-4 py-3">
        <span class="px-2 py-1 rounded-full text-xs font-bold ${statusCls}">${statusLabel}</span>
      </td>
      <td class="px-4 py-3">
        <div class="flex gap-1.5">
          ${e.status === 'pending' ? `
            <button onclick="_adminApproveEvent('${_escapeHtml(e.event_id)}')"
              class="px-2.5 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700">承認</button>
            <button onclick="_adminRejectEventPrompt('${_escapeHtml(e.event_id)}')"
              class="px-2.5 py-1 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-200">却下</button>
          ` : ''}
          <button onclick="_adminDeleteEventConfirm('${_escapeHtml(e.event_id)}', '${_escapeHtml(e.title || '')}')"
            class="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg hover:bg-slate-200">削除</button>
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
  if (reason === null) return; // キャンセル
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
  if (events.length === 0) {
    AppUI.toast('データがありません', 'warning');
    return;
  }

  const headers = ['イベントID', 'タイトル', '主催者', 'カテゴリ', 'タイプ', '開始日時', '最大参加者', 'ステータス', '価格'];
  const rows = events.map(e => [
    e.event_id || '',
    e.title || '',
    e.organizer_name || '',
    e.category || '',
    e.type === 'online' ? 'オンライン' : 'オフライン',
    e.start_datetime ? new Date(e.start_datetime).toLocaleString('ja-JP') : '',
    e.max_attendees || '',
    e.status || '',
    e.price != null ? e.price : '',
  ]);

  const csv = '\uFEFF' + [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `linkup_events_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  AppUI.toast('CSVをダウンロードしました', 'success');
}

// ─── チケット・注文タブ ──────────────────────────

async function _adminTickets() {
  const el = document.getElementById('admin-content');
  el.innerHTML = `
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-slate-800">チケット・注文管理</h2>
      <button onclick="_adminOrdersCsvDownload()"
        class="flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700">
        <span class="material-icons-outlined text-sm">download</span>CSV
      </button>
    </div>
    <div id="orders-table">
      <div class="flex justify-center py-12">
        <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    </div>
  `;

  await _adminOrdersLoad();
}

async function _adminOrdersLoad() {
  const el = document.getElementById('orders-table');
  if (!el) return;

  try {
    // admin専用エンドポイントがない場合は通常のordersを使用
    let data;
    try {
      data = await AdminAPI.orders({ limit: 100 });
    } catch (e) {
      // fallback to regular orders endpoint
      data = await window.LinkUpAPI._request('GET', '/api/orders', null, true);
    }
    const orders = data.orders || [];

    window._adminOrdersData = orders;

    if (orders.length === 0) {
      el.innerHTML = `<div class="bg-white rounded-xl p-8 text-center text-slate-400">注文がありません</div>`;
      return;
    }

    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
    const completedCount = orders.filter(o => o.payment_status === 'completed').length;

    el.innerHTML = `
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-xl p-4 shadow-sm text-center">
          <p class="text-2xl font-bold text-slate-800">${orders.length}</p>
          <p class="text-xs text-slate-500 mt-1">総注文数</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm text-center">
          <p class="text-2xl font-bold text-green-600">${completedCount}</p>
          <p class="text-xs text-slate-500 mt-1">完了</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm text-center">
          <p class="text-xl font-bold text-blue-600">¥${totalRevenue.toLocaleString()}</p>
          <p class="text-xs text-slate-500 mt-1">総売上</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 border-b border-slate-200">
              <tr>
                <th class="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">注文番号</th>
                <th class="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">イベント</th>
                <th class="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase hidden lg:table-cell">日時</th>
                <th class="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">金額</th>
                <th class="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">状態</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${orders.map((o, i) => _adminOrderRow(o, i)).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    el.innerHTML = `<div class="bg-red-50 text-red-700 rounded-xl p-5">${_escapeHtml(err.message)}</div>`;
  }
}

function _adminOrderRow(o, i) {
  const date = o.created_at ? new Date(o.created_at).toLocaleDateString('ja-JP') : '—';
  const statusMap = {
    completed: ['完了', 'bg-green-100 text-green-700'],
    pending:   ['保留中', 'bg-yellow-100 text-yellow-700'],
    cancelled: ['キャンセル', 'bg-red-100 text-red-700'],
  };
  const [statusLabel, statusCls] = statusMap[o.payment_status] || ['不明', 'bg-slate-100 text-slate-600'];

  return `
    <tr class="${i % 2 === 0 ? '' : 'bg-slate-50/50'}">
      <td class="px-4 py-3 font-mono text-xs text-slate-600">${_escapeHtml(o.order_number || o.order_id || '—')}</td>
      <td class="px-4 py-3 text-slate-700 hidden md:table-cell max-w-xs truncate">${_escapeHtml(o.event_title || '—')}</td>
      <td class="px-4 py-3 text-slate-500 hidden lg:table-cell">${date}</td>
      <td class="px-4 py-3 font-medium">¥${Number(o.total_amount || 0).toLocaleString()}</td>
      <td class="px-4 py-3">
        <span class="px-2 py-1 rounded-full text-xs font-bold ${statusCls}">${statusLabel}</span>
      </td>
    </tr>
  `;
}

function _adminOrdersCsvDownload() {
  const orders = window._adminOrdersData || [];
  if (orders.length === 0) {
    AppUI.toast('データがありません', 'warning');
    return;
  }

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
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `linkup_orders_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  AppUI.toast('CSVをダウンロードしました', 'success');
}

// ─── ユーザー管理タブ ────────────────────────────

async function _adminUsers() {
  const el = document.getElementById('admin-content');
  el.innerHTML = `
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-slate-800">ユーザー管理</h2>
      <div class="flex gap-2">
        <input id="user-search" type="text" placeholder="メール・名前で検索..."
          class="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48">
        <select id="user-role-filter" onchange="_adminUsersLoad()"
          class="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">すべてのロール</option>
          <option value="admin">管理者</option>
          <option value="organizer">主催者</option>
          <option value="attendee">参加者</option>
        </select>
      </div>
    </div>
    <div id="users-table">
      <div class="flex justify-center py-12">
        <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    </div>
  `;

  document.getElementById('user-search')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') _adminUsersLoad();
  });

  await _adminUsersLoad();
}

async function _adminUsersLoad() {
  const el = document.getElementById('users-table');
  if (!el) return;

  const searchEl = document.getElementById('user-search');
  const roleEl   = document.getElementById('user-role-filter');
  const search   = searchEl ? searchEl.value.trim() : '';
  const role     = roleEl   ? roleEl.value : '';

  el.innerHTML = `<div class="flex justify-center py-8"><div class="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>`;

  try {
    const data  = await AdminAPI.users({ search, role, limit: 100 });
    const users = data.users || [];

    if (users.length === 0) {
      el.innerHTML = `<div class="bg-white rounded-xl p-8 text-center text-slate-400">ユーザーが見つかりません</div>`;
      return;
    }

    el.innerHTML = `
      <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 border-b border-slate-200">
              <tr>
                <th class="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">#</th>
                <th class="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">ユーザー</th>
                <th class="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">メール</th>
                <th class="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">ロール</th>
                <th class="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase hidden lg:table-cell">登録日</th>
                <th class="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${users.map((u, i) => _adminUserRow(u, i)).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    el.innerHTML = `<div class="bg-red-50 text-red-700 rounded-xl p-5">${_escapeHtml(err.message)}</div>`;
  }
}

function _adminUserRow(u, i) {
  const roleMap = {
    admin:    ['管理者', 'bg-red-100 text-red-700'],
    organizer: ['主催者', 'bg-purple-100 text-purple-700'],
    attendee:  ['参加者', 'bg-blue-100 text-blue-700'],
  };
  const [roleLabel, roleCls] = roleMap[u.role] || ['不明', 'bg-slate-100 text-slate-600'];
  const date = u.created_at ? new Date(u.created_at).toLocaleDateString('ja-JP') : '—';
  const avatar = u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.display_name || 'U')}&background=2563EB&color=fff&size=40`;

  return `
    <tr class="${i % 2 === 0 ? '' : 'bg-slate-50/50'}">
      <td class="px-4 py-3 text-slate-400 text-xs">${i + 1}</td>
      <td class="px-4 py-3">
        <div class="flex items-center gap-2.5">
          <img src="${avatar}" class="w-8 h-8 rounded-full object-cover"
            onerror="this.src='https://ui-avatars.com/api/?name=U&background=2563EB&color=fff&size=40'">
          <span class="font-medium text-slate-800">${_escapeHtml(u.display_name || u.name || '—')}</span>
        </div>
      </td>
      <td class="px-4 py-3 text-slate-500 hidden md:table-cell">${_escapeHtml(u.email || '—')}</td>
      <td class="px-4 py-3">
        <span class="px-2 py-1 rounded-full text-xs font-bold ${roleCls}">${roleLabel}</span>
      </td>
      <td class="px-4 py-3 text-slate-500 hidden lg:table-cell">${date}</td>
      <td class="px-4 py-3">
        <button onclick="_adminEditUserModal('${_escapeHtml(u.user_id)}')"
          class="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs rounded-lg hover:bg-slate-200">編集</button>
      </td>
    </tr>
  `;
}

window._adminEditUserModal = async (userId) => {
  try {
    const data = await window.LinkUpAPI._request('GET', `/api/admin/users/${userId}`, null, true);
    const u = data.user || data;

    const modal = document.getElementById('modal-content');
    const container = document.getElementById('modal-container');

    modal.innerHTML = `
      <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-bold text-slate-800 mb-4">ユーザー編集</h3>
        <form id="admin-user-form" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">表示名</label>
            <input type="text" name="display_name" value="${_escapeHtml(u.display_name || u.name || '')}"
              class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">ロール</label>
            <select name="role"
              class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="attendee" ${u.role === 'attendee' ? 'selected' : ''}>参加者</option>
              <option value="organizer" ${u.role === 'organizer' ? 'selected' : ''}>主催者</option>
              <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>管理者</option>
            </select>
          </div>
          <div class="flex gap-3 pt-2">
            <button type="submit"
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition text-sm">
              保存する
            </button>
            <button type="button" onclick="AppUI.closeModal()"
              class="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-lg hover:bg-slate-200 text-sm">
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
          role: fd.get('role'),
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

// ─── QR入場受付タブ ──────────────────────────────

async function _adminCheckin() {
  const el = document.getElementById('admin-content');

  el.innerHTML = `
    <h2 class="text-xl font-bold text-slate-800 mb-6">QR入場受付</h2>

    <div class="grid lg:grid-cols-2 gap-6">

      <!-- 手動入力確認 -->
      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span class="material-icons-outlined text-blue-600">search</span>
          注文番号・チケットID検証
        </h3>
        <div class="flex gap-2 mb-4">
          <input id="checkin-input" type="text" placeholder="注文番号またはチケットIDを入力"
            class="flex-1 border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <button onclick="_adminVerifyTicket()"
            class="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 text-sm">
            確認
          </button>
        </div>
        <div id="checkin-result"></div>
      </div>

      <!-- QR スキャナー -->
      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span class="material-icons-outlined text-blue-600">qr_code_scanner</span>
          QRコードスキャン
        </h3>
        <p class="text-sm text-slate-500 mb-4">
          参加者のチケットのQRコードをスキャンして入場確認を行います。
        </p>
        <button onclick="_adminStartQRScan()"
          class="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2">
          <span class="material-icons-outlined">qr_code_scanner</span>
          カメラでスキャン開始
        </button>
        <div id="qr-scanner-container" class="mt-4"></div>
      </div>

    </div>

    <!-- 入場ログ（最近の確認履歴） -->
    <div class="bg-white rounded-2xl p-6 shadow-sm mt-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-bold text-slate-800 flex items-center gap-2">
          <span class="material-icons-outlined text-slate-500">history</span>
          本日の入場ログ
        </h3>
        <button onclick="_adminClearCheckinLog()"
          class="text-xs text-slate-400 hover:text-slate-600">ログをクリア</button>
      </div>
      <div id="checkin-log">
        <p class="text-slate-400 text-sm text-center py-4">まだ確認記録はありません</p>
      </div>
    </div>
  `;

  // Enter キーで確認
  document.getElementById('checkin-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') _adminVerifyTicket();
  });

  // ローカルストレージからログを復元
  _adminRenderCheckinLog();
}

window._adminVerifyTicket = async () => {
  const input  = document.getElementById('checkin-input');
  const result = document.getElementById('checkin-result');
  const code   = input?.value?.trim();

  if (!code) {
    result.innerHTML = `<div class="bg-yellow-50 text-yellow-700 rounded-lg p-3 text-sm">チケットIDまたは注文番号を入力してください</div>`;
    return;
  }

  result.innerHTML = `<div class="text-center py-4"><div class="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div></div>`;

  try {
    // バックエンドのcheckin APIを呼ぶ（なければorders APIで確認）
    let data;
    try {
      data = await window.LinkUpAPI._request('POST', '/api/checkin/verify', { code }, true);
    } catch (e) {
      // fallback: ordersで検索
      data = { success: false, message: e.message };
    }

    const ok = data.success || data.valid;
    const entry = {
      code,
      status: ok ? 'valid' : 'invalid',
      message: data.message || (ok ? '入場確認済み' : '無効なチケット'),
      event: data.event_title || data.event || '',
      user: data.user_name || data.user || '',
      time: new Date().toLocaleTimeString('ja-JP'),
    };

    _adminAddCheckinLog(entry);
    _adminRenderCheckinLog();

    result.innerHTML = ok ? `
      <div class="bg-green-50 border border-green-200 rounded-xl p-4">
        <div class="flex items-center gap-2 mb-2">
          <span class="material-icons-outlined text-green-600 text-2xl">check_circle</span>
          <span class="font-bold text-green-800">入場OK</span>
        </div>
        ${entry.event ? `<p class="text-sm text-slate-600 mb-1">イベント: ${_escapeHtml(entry.event)}</p>` : ''}
        ${entry.user  ? `<p class="text-sm text-slate-600">参加者: ${_escapeHtml(entry.user)}</p>`  : ''}
      </div>
    ` : `
      <div class="bg-red-50 border border-red-200 rounded-xl p-4">
        <div class="flex items-center gap-2">
          <span class="material-icons-outlined text-red-600">cancel</span>
          <span class="font-bold text-red-700">無効なチケット</span>
        </div>
        <p class="text-sm text-red-600 mt-1">${_escapeHtml(entry.message)}</p>
      </div>
    `;

    input.value = '';
  } catch (err) {
    result.innerHTML = `<div class="bg-red-50 text-red-700 rounded-xl p-4">${_escapeHtml(err.message)}</div>`;
  }
};

function _adminAddCheckinLog(entry) {
  const logs = JSON.parse(localStorage.getItem('admin_checkin_log') || '[]');
  logs.unshift(entry);
  if (logs.length > 50) logs.pop(); // 最大50件
  localStorage.setItem('admin_checkin_log', JSON.stringify(logs));
}

function _adminRenderCheckinLog() {
  const el = document.getElementById('checkin-log');
  if (!el) return;

  const today = new Date().toLocaleDateString('ja-JP');
  const logs = JSON.parse(localStorage.getItem('admin_checkin_log') || '[]')
    .filter(l => l.date === today || !l.date); // 本日のみ

  if (logs.length === 0) {
    el.innerHTML = `<p class="text-slate-400 text-sm text-center py-4">まだ確認記録はありません</p>`;
    return;
  }

  el.innerHTML = `
    <div class="space-y-2 max-h-64 overflow-y-auto">
      ${logs.map(l => `
        <div class="flex items-center gap-3 p-3 rounded-lg ${l.status === 'valid' ? 'bg-green-50' : 'bg-red-50'}">
          <span class="material-icons-outlined text-sm ${l.status === 'valid' ? 'text-green-600' : 'text-red-500'}">
            ${l.status === 'valid' ? 'check_circle' : 'cancel'}
          </span>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium ${l.status === 'valid' ? 'text-green-800' : 'text-red-700'} truncate">${_escapeHtml(l.code)}</p>
            ${l.event ? `<p class="text-xs text-slate-500 truncate">${_escapeHtml(l.event)}</p>` : ''}
          </div>
          <span class="text-xs text-slate-400 flex-shrink-0">${l.time}</span>
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
    <div class="bg-slate-50 rounded-xl p-4 text-center">
      <span class="material-icons-outlined text-4xl text-slate-400 block mb-2">photo_camera</span>
      <p class="text-sm text-slate-600 mb-3">カメラのアクセスが必要です</p>
      <p class="text-xs text-slate-400">
        QRコードスキャン機能はカメラAPIが必要なため、<br>
        スマートフォンや対応ブラウザでご利用ください。<br>
        現在は手動入力での確認が可能です。
      </p>
    </div>
  `;
};

// グローバルに公開
window.renderAdmin = renderAdmin;
