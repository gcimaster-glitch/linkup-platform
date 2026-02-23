/**
 * 主催者ダッシュボード
 *
 * API:
 *   GET  /api/organizer/stats     – 売上・参加者統計
 *   GET  /api/organizer/events    – 主催イベント一覧
 *   POST /api/events              – イベント作成
 *   PUT  /api/events/:id          – イベント編集
 *   DELETE /api/events/:id        – イベント削除
 */

// ─── APIクライアント（主催者専用） ────────────────

const OrganizerAPI = {
  stats: () =>
    window.LinkUpAPI._request('GET', '/api/organizer/stats', null, true),

  events: () =>
    window.LinkUpAPI._request('GET', '/api/organizer/events', null, true),

  createEvent: (data) =>
    window.LinkUpAPI._request('POST', '/api/events', data, true),

  updateEvent: (id, data) =>
    window.LinkUpAPI._request('PUT', `/api/events/${id}`, data, true),

  deleteEvent: (id) =>
    window.LinkUpAPI._request('DELETE', `/api/events/${id}`, null, true),
};

// ─── メインレンダリング ─────────────────────────

async function renderOrganizer(params = {}) {
  // ロールガード: organizer または admin のみ許可
  if (!AppAuth.requireRole(['organizer', 'admin'])) return;

  const user = window.currentUser;

  const app = document.getElementById('app');
  const tab = params.tab || 'overview';

  app.innerHTML = `
    <div class="min-h-screen bg-slate-50">
      <div class="max-w-6xl mx-auto px-4 py-8">

        <!-- ヘッダー -->
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-2xl font-bold text-slate-800">主催者ダッシュボード</h1>
            <p class="text-slate-500 text-sm mt-1">${user?.display_name || user?.name || ''}さん、お疲れ様です</p>
          </div>
          <button onclick="_orgOpenCreateModal()"
            class="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-sm">
            <span class="material-icons-outlined text-base">add</span>
            新規イベント作成
          </button>
        </div>

        <!-- タブ -->
        <div class="flex gap-1 bg-white rounded-xl p-1 shadow-sm mb-6 overflow-x-auto">
          ${[
            { key: 'overview', label: '概要',          icon: 'dashboard' },
            { key: 'events',   label: 'イベント管理',   icon: 'event' },
            { key: 'settings', label: 'プロフィール設定', icon: 'settings' },
          ].map(t => `
            <button onclick="AppRouter.go('organizer', { tab: '${t.key}' })"
              class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap
                ${tab === t.key ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}">
              <span class="material-icons-outlined text-base">${t.icon}</span>${t.label}
            </button>
          `).join('')}
        </div>

        <!-- コンテンツ -->
        <div id="org-content">
          <div class="flex justify-center py-12">
            <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  // タブに応じてレンダリング
  switch (tab) {
    case 'overview':  await _orgOverview();  break;
    case 'events':    await _orgEvents();    break;
    case 'settings':  await _orgSettings();  break;
    default:          await _orgOverview();
  }
}

// ─── 概要タブ ────────────────────────────────────

async function _orgOverview() {
  const el = document.getElementById('org-content');

  try {
    const data = await OrganizerAPI.stats();
    const stats = data.stats || {};

    el.innerHTML = `
      <!-- 統計カード -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        ${[
          { label: '総売上',       value: '¥' + Number(stats.revenue || 0).toLocaleString(),       icon: 'payments',     color: 'text-blue-600' },
          { label: '注文数',       value: (stats.orders || 0) + '件',                              icon: 'receipt_long', color: 'text-green-600' },
          { label: 'イベント数',   value: (stats.events || 0) + '件',                              icon: 'event',        color: 'text-purple-600' },
          { label: 'フォロワー',   value: (stats.followers || 0) + '人',                           icon: 'people',       color: 'text-orange-600' },
        ].map(s => `
          <div class="bg-white rounded-2xl p-5 shadow-sm">
            <div class="flex items-center gap-2 mb-2">
              <span class="material-icons-outlined text-slate-400 text-base">${s.icon}</span>
              <p class="text-xs text-slate-500">${s.label}</p>
            </div>
            <p class="text-2xl font-bold ${s.color}">${s.value}</p>
          </div>
        `).join('')}
      </div>

      <!-- プラットフォーム手数料 -->
      <div class="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-600">プラットフォーム手数料</p>
            <p class="text-2xl font-bold text-slate-800 mt-1">${stats.fee_rate ?? 5}%</p>
            <p class="text-xs text-slate-400 mt-1">${
              stats.organizer_type === 'npo' ? 'NPO法人のため0%優遇' :
              stats.organizer_type === 'individual' ? '個人のため0%優遇' :
              '法人・企業の標準料率'
            }</p>
          </div>
          <span class="material-icons-outlined text-slate-200 text-6xl">percent</span>
        </div>
      </div>

      <!-- 近日のイベント（プレビュー） -->
      <div class="bg-white rounded-2xl shadow-sm" id="org-events-preview">
        <div class="p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 class="font-bold text-slate-800">主催イベント</h3>
          <button onclick="AppRouter.go('organizer', {tab:'events'})" class="text-sm text-blue-600 hover:underline">すべて見る</button>
        </div>
        <div class="flex justify-center py-8">
          <div class="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    `;

    // イベントプレビューを非同期で読み込む
    _orgLoadEventsPreview();

  } catch (err) {
    el.innerHTML = `
      <div class="bg-white rounded-2xl p-8 shadow-sm text-center">
        <span class="material-icons-outlined text-red-300 text-5xl mb-3 block">error_outline</span>
        <p class="text-red-500 font-medium mb-2">統計の読み込みに失敗しました</p>
        <p class="text-slate-400 text-sm">${err.message}</p>
        <button onclick="_orgOverview()" class="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">再読み込み</button>
      </div>
    `;
  }
}

async function _orgLoadEventsPreview() {
  const el = document.getElementById('org-events-preview');
  if (!el) return;

  try {
    const data = await OrganizerAPI.events();
    const events = data.events || [];

    if (events.length === 0) {
      el.innerHTML = `
        <div class="p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 class="font-bold text-slate-800">主催イベント</h3>
          <button onclick="AppRouter.go('organizer', {tab:'events'})" class="text-sm text-blue-600 hover:underline">すべて見る</button>
        </div>
        <div class="text-center py-10 text-slate-400">
          <span class="material-icons-outlined text-4xl mb-2 block">event_busy</span>
          <p class="text-sm">まだイベントがありません</p>
          <button onclick="_orgOpenCreateModal()" class="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">最初のイベントを作成</button>
        </div>
      `;
      return;
    }

    const preview = events.slice(0, 3);
    el.innerHTML = `
      <div class="p-5 border-b border-slate-100 flex justify-between items-center">
        <h3 class="font-bold text-slate-800">主催イベント（直近3件）</h3>
        <button onclick="AppRouter.go('organizer', {tab:'events'})" class="text-sm text-blue-600 hover:underline">すべて見る（${events.length}件）</button>
      </div>
      <div class="divide-y divide-slate-50">
        ${preview.map(ev => _renderOrgEventRow(ev)).join('')}
      </div>
    `;

  } catch (err) {
    if (el) {
      el.innerHTML = `<div class="p-5"><p class="text-red-400 text-sm">${err.message}</p></div>`;
    }
  }
}

// ─── イベント管理タブ ──────────────────────────────

async function _orgEvents() {
  const el = document.getElementById('org-content');
  el.innerHTML = `<div class="flex justify-center py-12"><div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>`;

  try {
    const data = await OrganizerAPI.events();
    const events = data.events || [];

    if (events.length === 0) {
      el.innerHTML = `
        <div class="bg-white rounded-2xl p-12 shadow-sm text-center">
          <span class="material-icons-outlined text-slate-300 text-6xl mb-4 block">event_busy</span>
          <p class="text-slate-500 font-medium mb-2">まだイベントがありません</p>
          <p class="text-slate-400 text-sm mb-6">最初のイベントを作成して参加者を集めましょう！</p>
          <button onclick="_orgOpenCreateModal()"
            class="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition">
            イベントを作成する
          </button>
        </div>
      `;
      return;
    }

    el.innerHTML = `
      <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div class="p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 class="font-bold text-slate-800">主催イベント一覧 (${events.length}件)</h3>
          <button onclick="_orgOpenCreateModal()"
            class="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700">
            <span class="material-icons-outlined text-base">add</span>新規作成
          </button>
        </div>
        <div class="divide-y divide-slate-100">
          ${events.map(ev => _renderOrgEventRow(ev, true)).join('')}
        </div>
      </div>
    `;

  } catch (err) {
    el.innerHTML = `<div class="bg-white rounded-2xl p-6 shadow-sm"><p class="text-red-500">${err.message}</p></div>`;
  }
}

// ─── 設定タブ ─────────────────────────────────────

async function _orgSettings() {
  const el = document.getElementById('org-content');
  const user = window.currentUser;

  el.innerHTML = `
    <div class="max-w-xl space-y-6">
      <!-- プロフィール編集 -->
      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <h3 class="font-bold text-slate-800 mb-5">プロフィール設定</h3>
        <form id="org-profile-form" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">表示名</label>
            <input type="text" name="name" value="${user?.display_name || user?.name || ''}"
              class="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">アバターURL</label>
            <input type="url" name="avatar_url" value="${user?.avatar_url || ''}"
              class="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://...">
          </div>
          <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition text-sm">
            保存する
          </button>
        </form>
      </div>

      <!-- アカウント情報 -->
      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <h3 class="font-bold text-slate-800 mb-4">アカウント情報</h3>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-slate-500">メールアドレス</span>
            <span class="font-medium text-slate-700">${user?.email || ''}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">アカウント種別</span>
            <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
              <span class="material-icons-outlined text-xs">verified</span>主催者
            </span>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('org-profile-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const fields = { name: fd.get('name'), avatar_url: fd.get('avatar_url') };
    try {
      const result = await window.LinkUpAPI.Auth.updateProfile(fields);
      window.currentUser = { ...window.currentUser, ...result.user, display_name: fields.name };
      AppUI.updateNav();
      AppUI.toast('プロフィールを保存しました', 'success');
    } catch (err) {
      AppUI.toast(err.message || '保存に失敗しました', 'error');
    }
  });
}

// ─── 共通: イベント行 ─────────────────────────────

function _renderOrgEventRow(ev, showActions = false) {
  const date = ev.start_datetime
    ? new Date(ev.start_datetime).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' })
    : '日時未定';
  const statusMap = {
    published: ['公開中', 'bg-green-100 text-green-700'],
    draft:     ['下書き', 'bg-slate-100 text-slate-600'],
    cancelled: ['キャンセル', 'bg-red-100 text-red-700'],
    ended:     ['終了', 'bg-orange-100 text-orange-700'],
  };
  const [statusLabel, statusCls] = statusMap[ev.status] || ['不明', 'bg-slate-100 text-slate-600'];
  const img = ev.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&q=60';

  return `
    <div class="flex items-center gap-4 p-4 hover:bg-slate-50">
      <img src="${img}" class="w-14 h-14 rounded-xl object-cover flex-shrink-0"
        onerror="this.src='https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&q=60'">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <p class="font-medium text-slate-800 text-sm truncate">${ev.title}</p>
          <span class="px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${statusCls}">${statusLabel}</span>
        </div>
        <p class="text-xs text-slate-400">${date} · ${ev.venue_name || 'オンライン'}</p>
        <p class="text-xs text-slate-400">参加: ${ev.current_attendees || 0} / ${ev.max_attendees || '∞'}人</p>
      </div>
      ${showActions ? `
        <div class="flex gap-2 flex-shrink-0">
          <button onclick="AppRouter.go('detail', {id:'${ev.event_id}'})"
            class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="詳細を見る">
            <span class="material-icons-outlined text-base">visibility</span>
          </button>
          <button onclick="_orgOpenEditModal('${ev.event_id}')"
            class="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition" title="編集">
            <span class="material-icons-outlined text-base">edit</span>
          </button>
          <button onclick="_orgDeleteEvent('${ev.event_id}', '${ev.title.replace(/'/g, "\\'")}')"
            class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="削除">
            <span class="material-icons-outlined text-base">delete</span>
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

// ─── イベント作成モーダル ─────────────────────────

window._orgOpenCreateModal = function() {
  AppUI.openModal(`
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-8 max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-slate-800">新規イベント作成</h2>
        <button onclick="AppUI.closeModal()" class="text-slate-400 hover:text-slate-600">
          <span class="material-icons-outlined">close</span>
        </button>
      </div>
      <form id="create-event-form" class="space-y-4">
        ${_eventFormFields({})}
        <div class="flex gap-3 pt-2">
          <button type="button" onclick="AppUI.closeModal()"
            class="flex-1 py-2.5 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-medium text-sm">キャンセル</button>
          <button type="submit"
            class="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-sm">作成する</button>
        </div>
      </form>
    </div>
  `);

  document.getElementById('create-event-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = _buildEventPayload(fd);

    const submitBtn = e.target.querySelector('[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = '作成中...'; }
    try {
      await OrganizerAPI.createEvent(payload);
      AppUI.closeModal();
      AppUI.toast('イベントを作成しました！', 'success');
      AppRouter.go('organizer', { tab: 'events' });
    } catch (err) {
      AppUI.toast(err.message || 'イベント作成に失敗しました', 'error');
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = '作成する'; }
    }
  });
};

// ─── イベント編集モーダル ─────────────────────────

window._orgOpenEditModal = async function(eventId) {
  try {
    const data = await window.LinkUpAPI.Events.get(eventId);
    const ev = data.event;

    AppUI.openModal(`
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-8 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-slate-800">イベント編集</h2>
          <button onclick="AppUI.closeModal()" class="text-slate-400 hover:text-slate-600">
            <span class="material-icons-outlined">close</span>
          </button>
        </div>
        <form id="edit-event-form" class="space-y-4">
          ${_eventFormFields(ev)}
          <div class="flex gap-3 pt-2">
            <button type="button" onclick="AppUI.closeModal()"
              class="flex-1 py-2.5 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-medium text-sm">キャンセル</button>
            <button type="submit"
              class="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-sm">保存する</button>
          </div>
        </form>
      </div>
    `);

    document.getElementById('edit-event-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const payload = _buildEventPayload(fd);

      const submitBtn = e.target.querySelector('[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = '更新中...'; }
      try {
        await OrganizerAPI.updateEvent(eventId, payload);
        AppUI.closeModal();
        AppUI.toast('イベントを更新しました！', 'success');
        AppRouter.go('organizer', { tab: 'events' });
      } catch (err) {
        AppUI.toast(err.message || 'イベント更新に失敗しました', 'error');
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = '保存する'; }
      }
    });

  } catch (err) {
    AppUI.toast(err.message || 'イベント情報の取得に失敗しました', 'error');
  }
};

// ─── イベント削除 ─────────────────────────────────

window._orgDeleteEvent = async function(eventId, title) {
  if (!confirm(`「${title}」を削除しますか？この操作は元に戻せません。`)) return;

  try {
    await OrganizerAPI.deleteEvent(eventId);
    AppUI.toast('イベントを削除しました', 'info');
    AppRouter.go('organizer', { tab: 'events' });
  } catch (err) {
    AppUI.toast(err.message || '削除に失敗しました', 'error');
  }
};

// ─── フォームフィールド ────────────────────────────

function _eventFormFields(ev) {
  const formatDate = (dt) => {
    if (!dt) return '';
    try { return new Date(dt).toISOString().slice(0, 16); } catch { return ''; }
  };

  return `
    <div class="grid md:grid-cols-2 gap-4">
      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-slate-700 mb-1">タイトル <span class="text-red-500">*</span></label>
        <input type="text" name="title" required value="${ev.title || ''}"
          class="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="イベントタイトル">
      </div>
      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-slate-700 mb-1">説明</label>
        <textarea name="description" rows="3"
          class="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="イベントの詳細説明">${ev.description || ''}</textarea>
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">カテゴリ <span class="text-red-500">*</span></label>
        <select name="category" required
          class="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          ${['tech','business','music','art','food','social','sports','festival'].map(c => `
            <option value="${c}" ${ev.category === c ? 'selected' : ''}>${c}</option>
          `).join('')}
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">開催形式 <span class="text-red-500">*</span></label>
        <select name="event_type" required
          class="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="offline" ${ev.event_type === 'offline' ? 'selected' : ''}>オフライン</option>
          <option value="online"  ${ev.event_type === 'online'  ? 'selected' : ''}>オンライン</option>
          <option value="hybrid"  ${ev.event_type === 'hybrid'  ? 'selected' : ''}>ハイブリッド</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">開始日時 <span class="text-red-500">*</span></label>
        <input type="datetime-local" name="start_datetime" required value="${formatDate(ev.start_datetime)}"
          class="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">終了日時</label>
        <input type="datetime-local" name="end_datetime" value="${formatDate(ev.end_datetime)}"
          class="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">会場名</label>
        <input type="text" name="venue_name" value="${ev.venue_name || ''}"
          class="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="例: 渋谷ストリームホール">
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">最大参加人数</label>
        <input type="number" name="max_attendees" min="1" value="${ev.max_attendees || ''}"
          class="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="100">
      </div>
      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-slate-700 mb-1">カバー画像URL</label>
        <input type="url" name="cover_image_url" value="${ev.cover_image_url || ''}"
          class="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://images.unsplash.com/...">
      </div>

      <!-- チケット設定 -->
      <div class="md:col-span-2 pt-2 border-t border-slate-100">
        <h4 class="font-bold text-slate-700 mb-3 text-sm">チケット設定</h4>
        <div class="grid md:grid-cols-3 gap-3">
          <div>
            <label class="block text-xs text-slate-600 mb-1">チケット名 <span class="text-red-500">*</span></label>
            <input type="text" name="ticket_name" value="${(ev.tickets?.[0]?.name || ev.tickets?.[0]?.ticket_name) || '一般'}"
              class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div>
            <label class="block text-xs text-slate-600 mb-1">価格（円）</label>
            <input type="number" name="ticket_price" min="0" value="${ev.tickets?.[0]?.price ?? 0}"
              class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0（無料）">
          </div>
          <div>
            <label class="block text-xs text-slate-600 mb-1">枚数</label>
            <input type="number" name="ticket_quantity" min="1" value="${ev.tickets?.[0]?.quantity_total || ev.max_attendees || 100}"
              class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
        </div>
      </div>

      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-slate-700 mb-1">ステータス</label>
        <select name="status"
          class="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="published" ${(ev.status || 'published') === 'published' ? 'selected' : ''}>公開</option>
          <option value="draft"     ${ev.status === 'draft' ? 'selected' : ''}>下書き</option>
        </select>
      </div>
    </div>
  `;
}

function _buildEventPayload(fd) {
  return {
    title:           fd.get('title'),
    description:     fd.get('description') || '',
    category:        fd.get('category'),
    event_type:      fd.get('event_type'),
    start_datetime:  fd.get('start_datetime'),
    end_datetime:    fd.get('end_datetime') || null,
    venue_name:      fd.get('venue_name') || '',
    max_attendees:   parseInt(fd.get('max_attendees')) || null,
    cover_image_url: fd.get('cover_image_url') || null,
    status:          fd.get('status') || 'published',
    tickets: [{
      ticket_name:     fd.get('ticket_name') || '一般',
      price:           parseFloat(fd.get('ticket_price')) || 0,
      quantity_total:  parseInt(fd.get('ticket_quantity')) || 100,
    }],
  };
}

// グローバル公開
window._orgOverview      = _orgOverview;
window._orgEvents        = _orgEvents;
window._orgSettings      = _orgSettings;
window._orgLoadEventsPreview = _orgLoadEventsPreview;
