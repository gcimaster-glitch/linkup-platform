/**
 * 主催者ダッシュボード — Frontend Design Skill準拠
 * Design: "Code Editor Dark" — ネオンシアン + IDE暗黒テーマ
 */

// ─── APIクライアント ─────────────────────────────────

const OrganizerAPI = {
  stats:       () => window.LinkUpAPI._request('GET', '/api/organizer/stats', null, true),
  events:      () => window.LinkUpAPI._request('GET', '/api/organizer/events', null, true),
  createEvent: (data) => window.LinkUpAPI._request('POST', '/api/events', data, true),
  updateEvent: (id, data) => window.LinkUpAPI._request('PUT', `/api/events/${id}`, data, true),
  deleteEvent: (id) => window.LinkUpAPI._request('DELETE', `/api/events/${id}`, null, true),
};

// ─── スタイルヘルパー ─────────────────────────────────
const _orgCardStyle = `background:var(--c-surface); border:1px solid var(--c-border); border-radius:16px; padding:20px;`;
const _orgInputStyle = `width:100%; background:var(--c-raised); border:1.5px solid var(--c-border); color:var(--c-text); border-radius:10px; padding:10px 14px; font-size:13px; outline:none; transition:border-color 0.15s; box-sizing:border-box;`;
const _orgSpinner = `<div style="display:flex;justify-content:center;padding:48px 0;"><div style="width:32px;height:32px;border:2.5px solid var(--c-border);border-top-color:var(--accent);border-radius:50%;animation:spin 0.9s linear infinite;"></div></div>`;

// ─── メインレンダリング ─────────────────────────────

async function renderOrganizer(params = {}) {
  if (!AppAuth.requireRole(['organizer', 'admin'])) return;

  const user = window.currentUser;
  const app  = document.getElementById('app');
  const tab  = params.tab || 'overview';

  const tabs = [
    { key: 'overview', label: '概要',            icon: 'dashboard' },
    { key: 'events',   label: 'イベント管理',     icon: 'event' },
    { key: 'checkin',  label: 'QRチェックイン',   icon: 'qr_code_scanner' },
    { key: 'settings', label: 'プロフィール設定', icon: 'settings' },
  ];

  app.innerHTML = `
    <div style="min-height:100vh; background:var(--c-bg);">
      <!-- ─── ヘッダー ─── -->
      <div style="background:var(--c-canvas); border-bottom:1px solid var(--c-border);">
        <div style="max-width:1200px; margin:0 auto; padding:20px 24px; display:flex; align-items:center; justify-content:space-between;">
          <div>
            <h1 style="font-family:'Outfit',sans-serif; font-size:22px; font-weight:900; color:var(--c-text);">主催者ダッシュボード</h1>
            <p style="font-size:13px; color:var(--c-dim); margin-top:2px;">${_escapeHtml(user?.display_name || user?.name || '')}さん、お疲れ様です</p>
          </div>
          <button onclick="_orgOpenCreateModal()"
            class="btn-primary"
            style="display:flex; align-items:center; gap:8px; padding:10px 20px; border:none; cursor:pointer; border-radius:12px; font-size:13px; font-weight:700; color:var(--c-bg);">
            <span class="material-icons-outlined" style="font-size:18px;">add</span>
            新規イベント作成
          </button>
        </div>
      </div>

      <div style="max-width:1200px; margin:0 auto; padding:24px;">

        <!-- ─── タブ ─── -->
        <div style="display:flex; gap:4px; background:var(--c-surface); border:1px solid var(--c-border); border-radius:14px; padding:4px; margin-bottom:24px; overflow-x:auto;">
          ${tabs.map(t => `
            <button onclick="AppRouter.go('organizer', { tab: '${t.key}' })"
              style="
                display:flex; align-items:center; gap:6px; padding:8px 16px; border-radius:10px; border:none; cursor:pointer;
                font-size:13px; font-weight:600; white-space:nowrap; transition:all 0.15s;
                ${tab === t.key
                  ? 'background:var(--accent-dim); color:var(--accent); border:1px solid rgba(0,217,255,0.25);'
                  : 'background:none; color:var(--c-dim); border:1px solid transparent;'}
              "
              onmouseenter="${tab !== t.key ? "this.style.color='var(--c-text-1)'" : ''}"
              onmouseleave="${tab !== t.key ? "this.style.color='var(--c-dim)'" : ''}">
              <span class="material-icons-outlined" style="font-size:16px;">${t.icon}</span>${t.label}
            </button>
          `).join('')}
        </div>

        <!-- ─── コンテンツ ─── -->
        <div id="org-content">
          ${_orgSpinner}
        </div>
      </div>
    </div>
  `;

  switch (tab) {
    case 'overview':  await _orgOverview();  break;
    case 'events':    await _orgEvents();    break;
    case 'checkin':   await _orgCheckin();   break;
    case 'settings':  await _orgSettings();  break;
    default:          await _orgOverview();
  }
}

// ─── 概要タブ ────────────────────────────────────────

async function _orgOverview() {
  const el = document.getElementById('org-content');

  try {
    const data  = await OrganizerAPI.stats();
    const stats = data.stats || {};

    const statCards = [
      { label: '総売上',     value: '¥' + Number(stats.revenue || 0).toLocaleString(), icon: 'payments',     color: 'var(--accent)' },
      { label: '注文数',     value: (stats.orders || 0) + '件',                        icon: 'receipt_long', color: 'var(--lime)'   },
      { label: 'イベント数', value: (stats.events || 0) + '件',                        icon: 'event',        color: 'var(--violet)' },
      { label: 'フォロワー', value: (stats.followers || 0) + '人',                     icon: 'people',       color: 'var(--amber)'  },
    ];

    el.innerHTML = `
      <!-- 統計グリッド -->
      <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px;">
        ${statCards.map(s => `
          <div style="${_orgCardStyle}">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
              <span class="material-icons-outlined" style="font-size:16px; color:var(--c-dim);">${s.icon}</span>
              <p style="font-size:11px; color:var(--c-dim);">${s.label}</p>
            </div>
            <p style="font-family:'Outfit',sans-serif; font-size:24px; font-weight:800; color:${s.color};">${s.value}</p>
          </div>
        `).join('')}
      </div>

      <!-- 手数料カード -->
      <div style="${_orgCardStyle} display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; overflow:hidden; position:relative;">
        <div style="position:absolute; right:-10px; top:50%; transform:translateY(-50%); opacity:0.04;">
          <span class="material-icons-outlined" style="font-size:120px; color:var(--accent);">percent</span>
        </div>
        <div>
          <p style="font-size:13px; color:var(--c-dim); margin-bottom:4px;">プラットフォーム手数料</p>
          <p style="font-family:'Outfit',sans-serif; font-size:32px; font-weight:900; color:var(--c-text);">${stats.fee_rate ?? 5}%</p>
          <p style="font-size:12px; color:var(--c-dim); margin-top:2px;">${
            stats.organizer_type === 'npo' ? 'NPO法人のため0%優遇' :
            stats.organizer_type === 'individual' ? '個人のため0%優遇' :
            '法人・企業の標準料率'
          }</p>
        </div>
      </div>

      <!-- イベントプレビュー -->
      <div style="background:var(--c-surface); border:1px solid var(--c-border); border-radius:16px; overflow:hidden;" id="org-events-preview">
        <div style="padding:16px 20px; border-bottom:1px solid var(--c-border); display:flex; align-items:center; justify-content:space-between;">
          <h3 style="font-size:14px; font-weight:700; color:var(--c-text);">主催イベント</h3>
          <button onclick="AppRouter.go('organizer',{tab:'events'})"
            style="font-size:12px; color:var(--accent); background:none; border:none; cursor:pointer; font-weight:600;">
            すべて見る
          </button>
        </div>
        ${_orgSpinner}
      </div>
    `;

    _orgLoadEventsPreview();

  } catch (err) {
    el.innerHTML = `
      <div style="${_orgCardStyle} text-align:center; padding:48px 24px;">
        <span class="material-icons-outlined" style="font-size:48px; color:var(--hot); display:block; margin-bottom:12px;">error_outline</span>
        <p style="font-size:14px; font-weight:600; color:var(--hot); margin-bottom:8px;">統計の読み込みに失敗しました</p>
        <p style="font-size:13px; color:var(--c-dim); margin-bottom:20px;">${_escapeHtml(err.message)}</p>
        <button onclick="_orgOverview()"
          style="padding:10px 20px; background:linear-gradient(135deg,var(--accent),#00AACC); color:var(--c-bg); border:none; cursor:pointer; border-radius:10px; font-weight:700; font-size:13px;">
          再読み込み
        </button>
      </div>
    `;
  }
}

async function _orgLoadEventsPreview() {
  const el = document.getElementById('org-events-preview');
  if (!el) return;

  try {
    const data   = await OrganizerAPI.events();
    const events = data.events || [];

    if (events.length === 0) {
      el.innerHTML = `
        <div style="padding:16px 20px; border-bottom:1px solid var(--c-border); display:flex; align-items:center; justify-content:space-between;">
          <h3 style="font-size:14px; font-weight:700; color:var(--c-text);">主催イベント</h3>
          <button onclick="AppRouter.go('organizer',{tab:'events'})"
            style="font-size:12px; color:var(--accent); background:none; border:none; cursor:pointer; font-weight:600;">
            すべて見る
          </button>
        </div>
        <div style="text-align:center; padding:48px 24px; color:var(--c-dim);">
          <span class="material-icons-outlined" style="font-size:40px; display:block; margin-bottom:8px; color:var(--c-muted);">event_busy</span>
          <p style="font-size:13px; margin-bottom:16px;">まだイベントがありません</p>
          <button onclick="_orgOpenCreateModal()"
            style="padding:10px 20px; background:linear-gradient(135deg,var(--accent),#00AACC); color:var(--c-bg); border:none; cursor:pointer; border-radius:10px; font-weight:700; font-size:13px;">
            最初のイベントを作成
          </button>
        </div>
      `;
      return;
    }

    const preview = events.slice(0, 3);
    el.innerHTML = `
      <div style="padding:16px 20px; border-bottom:1px solid var(--c-border); display:flex; align-items:center; justify-content:space-between;">
        <h3 style="font-size:14px; font-weight:700; color:var(--c-text);">主催イベント（直近3件）</h3>
        <button onclick="AppRouter.go('organizer',{tab:'events'})"
          style="font-size:12px; color:var(--accent); background:none; border:none; cursor:pointer; font-weight:600;">
          すべて見る（${events.length}件）
        </button>
      </div>
      ${preview.map(ev => _renderOrgEventRow(ev)).join('')}
    `;
  } catch (err) {
    if (el) el.innerHTML = `<div style="padding:16px;"><p style="color:var(--hot); font-size:13px;">${err.message}</p></div>`;
  }
}

// ─── イベント管理タブ ─────────────────────────────────

async function _orgEvents() {
  const el = document.getElementById('org-content');
  el.innerHTML = _orgSpinner;

  try {
    const data   = await OrganizerAPI.events();
    const events = data.events || [];

    if (events.length === 0) {
      el.innerHTML = `
        <div style="${_orgCardStyle} text-align:center; padding:64px 24px;">
          <span class="material-icons-outlined" style="font-size:56px; color:var(--c-muted); display:block; margin-bottom:12px;">event_busy</span>
          <p style="font-size:14px; font-weight:600; color:var(--c-text-1); margin-bottom:8px;">まだイベントがありません</p>
          <p style="font-size:13px; color:var(--c-dim); margin-bottom:20px;">最初のイベントを作成して参加者を集めましょう！</p>
          <button onclick="_orgOpenCreateModal()"
            style="padding:12px 28px; background:linear-gradient(135deg,var(--accent),#00AACC); color:var(--c-bg); border:none; cursor:pointer; border-radius:12px; font-weight:700; font-size:14px;">
            イベントを作成する
          </button>
        </div>
      `;
      return;
    }

    el.innerHTML = `
      <div style="background:var(--c-surface); border:1px solid var(--c-border); border-radius:16px; overflow:hidden;">
        <div style="padding:16px 20px; border-bottom:1px solid var(--c-border); display:flex; align-items:center; justify-content:space-between;">
          <h3 style="font-size:14px; font-weight:700; color:var(--c-text);">主催イベント一覧 (${events.length}件)</h3>
          <button onclick="_orgOpenCreateModal()"
            style="display:flex; align-items:center; gap:6px; padding:8px 16px; background:linear-gradient(135deg,var(--accent),#00AACC); color:var(--c-bg); border:none; cursor:pointer; border-radius:10px; font-size:12px; font-weight:700;">
            <span class="material-icons-outlined" style="font-size:16px;">add</span>新規作成
          </button>
        </div>
        ${events.map(ev => _renderOrgEventRow(ev, true)).join('')}
      </div>
    `;
  } catch (err) {
    el.innerHTML = `<div style="${_orgCardStyle}"><p style="color:var(--hot); font-size:13px;">${err.message}</p></div>`;
  }
}

// ─── 設定タブ ─────────────────────────────────────────

async function _orgSettings() {
  const el   = document.getElementById('org-content');
  const user = window.currentUser;

  el.innerHTML = `
    <div style="max-width:480px; display:flex; flex-direction:column; gap:20px;">
      <!-- プロフィール編集 -->
      <div style="${_orgCardStyle}">
        <h3 style="font-size:14px; font-weight:700; color:var(--c-text); margin-bottom:20px;">プロフィール設定</h3>
        <form id="org-profile-form" style="display:flex; flex-direction:column; gap:14px;">
          <div>
            <label style="display:block; font-size:11px; font-weight:700; color:var(--c-dim); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:6px;">表示名</label>
            <input type="text" name="name" value="${_escapeHtml(user?.display_name || user?.name || '')}"
              style="${_orgInputStyle}"
              onfocus="this.style.borderColor='var(--accent)';this.style.boxShadow='0 0 0 3px var(--accent-dim)'"
              onblur="this.style.borderColor='var(--c-border)';this.style.boxShadow='none'">
          </div>
          <div>
            <label style="display:block; font-size:11px; font-weight:700; color:var(--c-dim); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:6px;">アバターURL</label>
            <input type="url" name="avatar_url" value="${_escapeHtml(user?.avatar_url || '')}"
              placeholder="https://..."
              style="${_orgInputStyle}"
              onfocus="this.style.borderColor='var(--accent)';this.style.boxShadow='0 0 0 3px var(--accent-dim)'"
              onblur="this.style.borderColor='var(--c-border)';this.style.boxShadow='none'">
          </div>
          <button type="submit"
            style="width:100%; background:linear-gradient(135deg,var(--accent),#00AACC); color:var(--c-bg); border:none; cursor:pointer; border-radius:10px; padding:12px; font-size:14px; font-weight:800; transition:all 0.15s;">
            保存する
          </button>
        </form>
      </div>

      <!-- アカウント情報 -->
      <div style="${_orgCardStyle}">
        <h3 style="font-size:14px; font-weight:700; color:var(--c-text); margin-bottom:16px;">アカウント情報</h3>
        <div style="display:flex; flex-direction:column; gap:12px; font-size:13px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="color:var(--c-dim);">メールアドレス</span>
            <span style="font-weight:600; color:var(--c-text-1);">${_escapeHtml(user?.email || '')}</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="color:var(--c-dim);">アカウント種別</span>
            <span style="display:inline-flex; align-items:center; gap:4px; padding:3px 10px; background:rgba(155,89,255,0.1); border:1px solid rgba(155,89,255,0.3); border-radius:99px; font-size:11px; font-weight:700; color:var(--violet);">
              <span class="material-icons-outlined" style="font-size:12px;">verified</span>主催者
            </span>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('org-profile-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd     = new FormData(e.target);
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

// ─── 共通: イベント行 ─────────────────────────────────

function _renderOrgEventRow(ev, showActions = false) {
  const date = ev.start_datetime
    ? new Date(ev.start_datetime).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' })
    : '日時未定';

  const statusStyles = {
    published: { label: '公開中',    color: 'var(--lime)',    bg: 'rgba(57,255,20,0.1)',   border: 'rgba(57,255,20,0.3)' },
    draft:     { label: '下書き',    color: 'var(--c-dim)',   bg: 'var(--c-raised)',        border: 'var(--c-border)' },
    cancelled: { label: 'キャンセル', color: 'var(--hot)',    bg: 'var(--hot-dim)',         border: 'rgba(255,51,102,0.3)' },
    ended:     { label: '終了',      color: 'var(--amber)',   bg: 'rgba(255,170,0,0.1)',   border: 'rgba(255,170,0,0.3)' },
  };
  const s   = statusStyles[ev.status] || { label: '不明', color: 'var(--c-dim)', bg: 'var(--c-raised)', border: 'var(--c-border)' };
  const img = ev.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&q=60';

  return `
    <div style="display:flex; align-items:center; gap:16px; padding:14px 20px; border-bottom:1px solid var(--c-border); transition:background 0.15s; cursor:pointer;"
      onmouseenter="this.style.background='var(--c-raised)'" onmouseleave="this.style.background='none'">
      <img src="${_escapeHtml(img)}" style="width:52px; height:52px; border-radius:12px; object-fit:cover; flex-shrink:0;"
        onerror="this.src='https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&q=60'">
      <div style="flex:1; min-width:0;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
          <p style="font-size:13px; font-weight:600; color:var(--c-text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${_escapeHtml(ev.title)}</p>
          <span style="padding:2px 8px; border-radius:99px; font-size:10px; font-weight:700; color:${s.color}; background:${s.bg}; border:1px solid ${s.border}; flex-shrink:0;">${s.label}</span>
        </div>
        <p style="font-size:11px; color:var(--c-dim);">${date} · ${_escapeHtml(ev.venue_name || 'オンライン')}</p>
        <p style="font-size:11px; color:var(--c-dim);">参加: ${ev.current_attendees || 0} / ${ev.max_attendees || '∞'}人</p>
      </div>
      ${showActions ? `
        <div style="display:flex; gap:6px; flex-shrink:0;">
          <button onclick="AppRouter.go('detail', {id:'${_escapeHtml(ev.event_id)}'})"
            style="width:32px; height:32px; background:var(--c-raised); border:1px solid var(--c-border); border-radius:8px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--c-dim); transition:all 0.15s;"
            onmouseenter="this.style.borderColor='var(--accent)';this.style.color='var(--accent)'"
            onmouseleave="this.style.borderColor='var(--c-border)';this.style.color='var(--c-dim)'"
            title="詳細を見る">
            <span class="material-icons-outlined" style="font-size:16px;">visibility</span>
          </button>
          <button onclick="_orgOpenEditModal('${_escapeHtml(ev.event_id)}')"
            style="width:32px; height:32px; background:var(--c-raised); border:1px solid var(--c-border); border-radius:8px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--c-dim); transition:all 0.15s;"
            onmouseenter="this.style.borderColor='var(--lime)';this.style.color='var(--lime)'"
            onmouseleave="this.style.borderColor='var(--c-border)';this.style.color='var(--c-dim)'"
            title="編集">
            <span class="material-icons-outlined" style="font-size:16px;">edit</span>
          </button>
          <button onclick="_orgDeleteEvent('${_escapeHtml(ev.event_id)}', '${_escapeHtml(ev.title.replace(/'/g, "\\'"))}')"
            style="width:32px; height:32px; background:var(--c-raised); border:1px solid var(--c-border); border-radius:8px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--c-dim); transition:all 0.15s;"
            onmouseenter="this.style.borderColor='var(--hot)';this.style.color='var(--hot)'"
            onmouseleave="this.style.borderColor='var(--c-border)';this.style.color='var(--c-dim)'"
            title="削除">
            <span class="material-icons-outlined" style="font-size:16px;">delete</span>
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

// ─── イベント作成モーダル ─────────────────────────────

window._orgOpenCreateModal = function() {
  AppUI.openModal(`
    <div style="background:var(--c-surface); border:1px solid rgba(0,217,255,0.2); border-radius:20px; width:100%; max-width:640px; margin:0 16px; padding:28px; max-height:90vh; overflow-y:auto; box-shadow:0 32px 80px rgba(0,0,0,0.7);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
        <h2 style="font-family:'Outfit',sans-serif; font-size:20px; font-weight:800; color:var(--c-text);">新規イベント作成</h2>
        <button onclick="AppUI.closeModal()"
          style="width:32px; height:32px; background:var(--c-raised); border:1px solid var(--c-border); border-radius:8px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--c-dim);">
          <span class="material-icons-outlined" style="font-size:16px;">close</span>
        </button>
      </div>
      <form id="create-event-form">
        ${_eventFormFields({})}
        <div style="display:flex; gap:12px; margin-top:20px;">
          <button type="button" onclick="AppUI.closeModal()"
            style="flex:1; padding:12px; background:var(--c-raised); border:1px solid var(--c-border); color:var(--c-dim); border-radius:10px; font-weight:600; font-size:13px; cursor:pointer; transition:all 0.15s;">
            キャンセル
          </button>
          <button type="submit"
            style="flex:1; padding:12px; background:linear-gradient(135deg,var(--accent),#00AACC); color:var(--c-bg); border:none; border-radius:10px; font-weight:800; font-size:13px; cursor:pointer; transition:all 0.15s;">
            作成する
          </button>
        </div>
      </form>
    </div>
  `);

  document.getElementById('create-event-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd        = new FormData(e.target);
    const payload   = _buildEventPayload(fd);
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

// ─── イベント編集モーダル ─────────────────────────────

window._orgOpenEditModal = async function(eventId) {
  try {
    const data = await window.LinkUpAPI.Events.get(eventId);
    const ev   = data.event;

    AppUI.openModal(`
      <div style="background:var(--c-surface); border:1px solid rgba(0,217,255,0.2); border-radius:20px; width:100%; max-width:640px; margin:0 16px; padding:28px; max-height:90vh; overflow-y:auto; box-shadow:0 32px 80px rgba(0,0,0,0.7);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
          <h2 style="font-family:'Outfit',sans-serif; font-size:20px; font-weight:800; color:var(--c-text);">イベント編集</h2>
          <button onclick="AppUI.closeModal()"
            style="width:32px; height:32px; background:var(--c-raised); border:1px solid var(--c-border); border-radius:8px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--c-dim);">
            <span class="material-icons-outlined" style="font-size:16px;">close</span>
          </button>
        </div>
        <form id="edit-event-form">
          ${_eventFormFields(ev)}
          <div style="display:flex; gap:12px; margin-top:20px;">
            <button type="button" onclick="AppUI.closeModal()"
              style="flex:1; padding:12px; background:var(--c-raised); border:1px solid var(--c-border); color:var(--c-dim); border-radius:10px; font-weight:600; font-size:13px; cursor:pointer;">
              キャンセル
            </button>
            <button type="submit"
              style="flex:1; padding:12px; background:linear-gradient(135deg,var(--accent),#00AACC); color:var(--c-bg); border:none; border-radius:10px; font-weight:800; font-size:13px; cursor:pointer;">
              保存する
            </button>
          </div>
        </form>
      </div>
    `);

    document.getElementById('edit-event-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd        = new FormData(e.target);
      const payload   = _buildEventPayload(fd);
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

// ─── イベント削除 ─────────────────────────────────────

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

// ─── フォームフィールド（ダークテーマ版） ──────────────

function _eventFormFields(ev) {
  const formatDate = (dt) => {
    if (!dt) return '';
    try { return new Date(dt).toISOString().slice(0, 16); } catch { return ''; }
  };

  const lStyle = `display:block; font-size:11px; font-weight:700; color:var(--c-dim); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:6px;`;
  const iStyle = `${_orgInputStyle}`;
  const focusHandlers = `onfocus="this.style.borderColor='var(--accent)';this.style.boxShadow='0 0 0 3px var(--accent-dim)'" onblur="this.style.borderColor='var(--c-border)';this.style.boxShadow='none'"`;
  const selectStyle = `${_orgInputStyle} appearance:none;`;

  return `
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px;">
      <div style="grid-column:1/-1;">
        <label style="${lStyle}">タイトル <span style="color:var(--hot);">*</span></label>
        <input type="text" name="title" required value="${_escapeHtml(ev.title || '')}"
          style="${iStyle}" placeholder="イベントタイトル" ${focusHandlers}>
      </div>
      <div style="grid-column:1/-1;">
        <label style="${lStyle}">説明</label>
        <textarea name="description" rows="3"
          style="${iStyle} resize:vertical;" placeholder="イベントの詳細説明" ${focusHandlers}>${_escapeHtml(ev.description || '')}</textarea>
      </div>
      <div>
        <label style="${lStyle}">カテゴリ <span style="color:var(--hot);">*</span></label>
        <select name="category" required style="${selectStyle}" ${focusHandlers}>
          ${['tech','business','music','art','food','social','sports','festival'].map(c => `
            <option value="${c}" ${ev.category === c ? 'selected' : ''} style="background:var(--c-raised);">${c}</option>
          `).join('')}
        </select>
      </div>
      <div>
        <label style="${lStyle}">開催形式 <span style="color:var(--hot);">*</span></label>
        <select name="event_type" required style="${selectStyle}" ${focusHandlers}>
          <option value="offline" ${ev.event_type === 'offline' ? 'selected' : ''} style="background:var(--c-raised);">オフライン</option>
          <option value="online"  ${ev.event_type === 'online'  ? 'selected' : ''} style="background:var(--c-raised);">オンライン</option>
          <option value="hybrid"  ${ev.event_type === 'hybrid'  ? 'selected' : ''} style="background:var(--c-raised);">ハイブリッド</option>
        </select>
      </div>
      <div>
        <label style="${lStyle}">開始日時 <span style="color:var(--hot);">*</span></label>
        <input type="datetime-local" name="start_datetime" required value="${formatDate(ev.start_datetime)}"
          style="${iStyle}" ${focusHandlers}>
      </div>
      <div>
        <label style="${lStyle}">終了日時</label>
        <input type="datetime-local" name="end_datetime" value="${formatDate(ev.end_datetime)}"
          style="${iStyle}" ${focusHandlers}>
      </div>
      <div>
        <label style="${lStyle}">会場名</label>
        <input type="text" name="venue_name" value="${_escapeHtml(ev.venue_name || '')}"
          style="${iStyle}" placeholder="例: 渋谷ストリームホール" ${focusHandlers}>
      </div>
      <div>
        <label style="${lStyle}">最大参加人数</label>
        <input type="number" name="max_attendees" min="1" value="${ev.max_attendees || ''}"
          style="${iStyle}" placeholder="100" ${focusHandlers}>
      </div>
      <div style="grid-column:1/-1;">
        <label style="${lStyle}">カバー画像URL</label>
        <input type="url" name="cover_image_url" value="${_escapeHtml(ev.cover_image_url || '')}"
          style="${iStyle}" placeholder="https://images.unsplash.com/..." ${focusHandlers}>
      </div>

      <!-- チケット設定 -->
      <div style="grid-column:1/-1; padding-top:14px; border-top:1px solid var(--c-border);">
        <h4 style="font-size:12px; font-weight:700; color:var(--c-dim); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:12px;">チケット設定</h4>
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
          <div>
            <label style="${lStyle}">チケット名 <span style="color:var(--hot);">*</span></label>
            <input type="text" name="ticket_name" value="${_escapeHtml((ev.tickets?.[0]?.name || ev.tickets?.[0]?.ticket_name) || '一般')}"
              style="${iStyle}" ${focusHandlers}>
          </div>
          <div>
            <label style="${lStyle}">価格（円）</label>
            <input type="number" name="ticket_price" min="0" value="${ev.tickets?.[0]?.price ?? 0}"
              style="${iStyle}" placeholder="0（無料）" ${focusHandlers}>
          </div>
          <div>
            <label style="${lStyle}">枚数</label>
            <input type="number" name="ticket_quantity" min="1" value="${ev.tickets?.[0]?.quantity_total || ev.max_attendees || 100}"
              style="${iStyle}" ${focusHandlers}>
          </div>
        </div>
      </div>

      <div style="grid-column:1/-1;">
        <label style="${lStyle}">ステータス</label>
        <select name="status" style="${selectStyle}" ${focusHandlers}>
          <option value="published" ${(ev.status || 'published') === 'published' ? 'selected' : ''} style="background:var(--c-raised);">公開</option>
          <option value="draft"     ${ev.status === 'draft' ? 'selected' : ''} style="background:var(--c-raised);">下書き</option>
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
      ticket_name:    fd.get('ticket_name') || '一般',
      price:          parseFloat(fd.get('ticket_price')) || 0,
      quantity_total: parseInt(fd.get('ticket_quantity')) || 100,
    }],
  };
}

// ─── QRチェックインタブ ───────────────────────────────

async function _orgCheckin() {
  const el = document.getElementById('org-content');

  let events = [];
  try {
    const data = await window.LinkUpAPI._requestFlexible('/api/organizer/events', { method: 'GET', auth: true });
    events = data.events || [];
  } catch(e) {}

  el.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:20px;">

      <!-- ヘッダーカード -->
      <div style="${_orgCardStyle}">
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
          <div style="width:44px; height:44px; background:var(--accent-dim); border:1px solid rgba(0,217,255,0.3); border-radius:14px; display:flex; align-items:center; justify-content:center;">
            <span class="material-icons-outlined" style="font-size:22px; color:var(--accent);">qr_code_scanner</span>
          </div>
          <div>
            <h2 style="font-size:16px; font-weight:800; color:var(--c-text);">QRコード チェックイン</h2>
            <p style="font-size:12px; color:var(--c-dim);">参加者のQRコードを読み取って入場確認</p>
          </div>
        </div>

        <!-- イベント選択 -->
        <div>
          <label style="display:block; font-size:11px; font-weight:700; color:var(--c-dim); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:6px;">対象イベントを選択</label>
          <select id="checkin-event-select"
            style="${_orgInputStyle} appearance:none;"
            onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='var(--c-border)'"
            onchange="_onCheckinEventChange()">
            <option value="" style="background:var(--c-raised);">イベントを選択してください...</option>
            ${events.filter(e => e.status === 'published' || e.status === 'ongoing').map(e => `
              <option value="${_escapeHtml(e.event_id)}" style="background:var(--c-raised);">${_escapeHtml(e.title)}</option>
            `).join('')}
          </select>
        </div>
      </div>

      <!-- スキャンエリア（イベント選択後に表示） -->
      <div id="checkin-scan-area" style="display:none; flex-direction:column; gap:16px;">

        <!-- 統計グリッド -->
        <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:12px;" id="checkin-stats">
          <div style="${_orgCardStyle} text-align:center; padding:16px;">
            <p style="font-family:'Outfit',sans-serif; font-size:28px; font-weight:800; color:var(--accent);" id="stat-total">-</p>
            <p style="font-size:11px; color:var(--c-dim); margin-top:4px;">総チケット数</p>
          </div>
          <div style="${_orgCardStyle} text-align:center; padding:16px;">
            <p style="font-family:'Outfit',sans-serif; font-size:28px; font-weight:800; color:var(--lime);" id="stat-checkin">0</p>
            <p style="font-size:11px; color:var(--c-dim); margin-top:4px;">チェックイン済み</p>
          </div>
          <div style="${_orgCardStyle} text-align:center; padding:16px;">
            <p style="font-family:'Outfit',sans-serif; font-size:28px; font-weight:800; color:var(--amber);" id="stat-remain">-</p>
            <p style="font-size:11px; color:var(--c-dim); margin-top:4px;">未入場</p>
          </div>
        </div>

        <!-- QR入力エリア -->
        <div style="${_orgCardStyle}">
          <h3 style="font-size:14px; font-weight:700; color:var(--c-text); margin-bottom:16px; display:flex; align-items:center; gap:8px;">
            <span class="material-icons-outlined" style="font-size:18px; color:var(--accent);">qr_code</span>
            QRコード読み取り
          </h3>

          <!-- 案内 -->
          <div style="background:var(--accent-dim); border:1px solid rgba(0,217,255,0.2); border-radius:12px; padding:12px 16px; margin-bottom:16px; display:flex; align-items:flex-start; gap:10px;">
            <span class="material-icons-outlined" style="font-size:16px; color:var(--accent); flex-shrink:0; margin-top:1px;">info</span>
            <div>
              <p style="font-size:12px; font-weight:700; color:var(--accent); margin-bottom:2px;">スキャン方法</p>
              <p style="font-size:12px; color:var(--c-text-2); line-height:1.5;">QRコードリーダーアプリまたはスマートフォンのカメラでスキャンすると、下の入力欄にQRデータが自動入力されます。または直接貼り付けてください。</p>
            </div>
          </div>

          <div style="display:flex; gap:10px;">
            <input type="text" id="qr-input"
              placeholder="QRコードデータをここに貼り付け... (LINKUP:...)"
              style="${_orgInputStyle} flex:1; font-family:'JetBrains Mono',monospace;"
              onfocus="this.style.borderColor='var(--accent)';this.style.boxShadow='0 0 0 3px var(--accent-dim)'"
              onblur="this.style.borderColor='var(--c-border)';this.style.boxShadow='none'"
              onkeydown="if(event.key==='Enter') _doCheckin()">
            <button onclick="_doCheckin()"
              id="checkin-btn"
              style="padding:10px 20px; background:linear-gradient(135deg,var(--accent),#00AACC); color:var(--c-bg); border:none; cursor:pointer; border-radius:10px; font-size:13px; font-weight:700; display:flex; align-items:center; gap:6px; flex-shrink:0; transition:all 0.15s;">
              <span class="material-icons-outlined" style="font-size:18px;">check_circle</span>
              確認
            </button>
          </div>

          <!-- 結果表示 -->
          <div id="checkin-result" style="display:none; margin-top:16px;"></div>
        </div>

        <!-- チェックイン履歴 -->
        <div style="background:var(--c-surface); border:1px solid var(--c-border); border-radius:16px; overflow:hidden;">
          <div style="padding:14px 20px; border-bottom:1px solid var(--c-border); display:flex; align-items:center; justify-content:space-between;">
            <h3 style="font-size:13px; font-weight:700; color:var(--c-text);">本日のチェックイン履歴</h3>
            <button onclick="_loadCheckinHistory()"
              style="font-size:11px; color:var(--accent); background:none; border:none; cursor:pointer; font-weight:600;">
              更新
            </button>
          </div>
          <div id="checkin-history" style="padding:32px 20px; text-align:center; color:var(--c-dim);">
            <span class="material-icons-outlined" style="font-size:32px; display:block; margin-bottom:6px; color:var(--c-muted);">history</span>
            <p style="font-size:12px;">チェックインを実行すると履歴が表示されます</p>
          </div>
        </div>
      </div>
    </div>
  `;

  window._onCheckinEventChange = function() {
    const sel  = document.getElementById('checkin-event-select');
    const area = document.getElementById('checkin-scan-area');
    if (sel.value) {
      area.style.display = 'flex';
      _loadCheckinStats(sel.value);
      setTimeout(() => document.getElementById('qr-input')?.focus(), 100);
    } else {
      area.style.display = 'none';
    }
  };

  window._loadCheckinStats = async function(eventId) {
    try {
      const data = await window.LinkUpAPI._requestFlexible(`/api/organizer/events/${eventId}/checkin-stats`, { method: 'GET', auth: true });
      document.getElementById('stat-total').textContent   = data.total_tickets || '-';
      document.getElementById('stat-checkin').textContent = data.checked_in || 0;
      document.getElementById('stat-remain').textContent  = (data.total_tickets - data.checked_in) || '-';
    } catch(e) {}
  };

  window._doCheckin = async function() {
    const qrInput     = document.getElementById('qr-input');
    const eventSelect = document.getElementById('checkin-event-select');
    const resultEl    = document.getElementById('checkin-result');
    const btn         = document.getElementById('checkin-btn');

    const qrData  = qrInput?.value?.trim();
    const eventId = eventSelect?.value;

    const showWarn = (msg) => {
      resultEl.innerHTML = `
        <div style="padding:12px 16px; background:rgba(255,170,0,0.1); border:1px solid rgba(255,170,0,0.3); border-radius:12px; display:flex; align-items:center; gap:8px; font-size:13px; color:var(--amber);">
          <span class="material-icons-outlined" style="font-size:16px;">warning</span>
          ${msg}
        </div>
      `;
      resultEl.style.display = 'block';
    };

    if (!qrData)  { showWarn('QRコードデータを入力してください'); return; }
    if (!eventId) { showWarn('イベントを選択してください'); return; }

    btn.disabled = true;
    btn.innerHTML = '<div style="width:18px;height:18px;border:2px solid rgba(5,8,15,0.3);border-top-color:var(--c-bg);border-radius:50%;animation:spin 0.9s linear infinite;"></div>';
    resultEl.style.display = 'none';

    try {
      const res = await window.LinkUpAPI._requestFlexible('/api/checkin/verify', {
        method: 'POST',
        body: JSON.stringify({ qr_data: qrData, event_id: eventId }),
        auth: true,
      });

      resultEl.innerHTML = `
        <div style="padding:16px; background:rgba(57,255,20,0.08); border:1.5px solid rgba(57,255,20,0.35); border-radius:14px;">
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
            <div style="width:40px; height:40px; background:rgba(57,255,20,0.15); border:2px solid rgba(57,255,20,0.4); border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
              <span class="material-icons-outlined" style="font-size:22px; color:var(--lime);">check</span>
            </div>
            <div>
              <p style="font-size:16px; font-weight:800; color:var(--lime);">チェックイン完了！</p>
              <p style="font-size:11px; color:var(--c-dim);">${new Date().toLocaleTimeString('ja-JP')}</p>
            </div>
          </div>
          <div style="background:var(--c-raised); border-radius:10px; padding:10px 14px;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
              <span class="material-icons-outlined" style="font-size:14px; color:var(--c-dim);">person</span>
              <span style="font-size:13px; font-weight:700; color:var(--c-text);">${_escapeHtml(res.attendee_name || '参加者')}</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="material-icons-outlined" style="font-size:14px; color:var(--c-dim);">confirmation_number</span>
              <span style="font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--c-dim);">${_escapeHtml(res.order_number || '')}</span>
            </div>
          </div>
        </div>
      `;
      qrInput.value = '';
      qrInput.focus();
      _addCheckinHistoryItem(res);
      const cnt = document.getElementById('stat-checkin');
      if (cnt) cnt.textContent = parseInt(cnt.textContent || '0') + 1;

    } catch(err) {
      const isAlready = err.message && err.message.includes('チェックイン済み');
      resultEl.innerHTML = `
        <div style="padding:16px; background:var(--hot-dim); border:1.5px solid rgba(255,51,102,0.35); border-radius:14px; display:flex; align-items:center; gap:12px;">
          <div style="width:40px; height:40px; background:rgba(255,51,102,0.2); border:2px solid rgba(255,51,102,0.4); border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
            <span class="material-icons-outlined" style="font-size:22px; color:var(--hot);">${isAlready ? 'repeat' : 'error'}</span>
          </div>
          <div>
            <p style="font-size:14px; font-weight:800; color:var(--hot);">${isAlready ? 'すでにチェックイン済み' : 'チェックイン失敗'}</p>
            <p style="font-size:12px; color:var(--c-dim);">${_escapeHtml(err.message)}</p>
          </div>
        </div>
      `;
    }

    resultEl.style.display = 'block';
    btn.disabled = false;
    btn.innerHTML = '<span class="material-icons-outlined" style="font-size:18px;">check_circle</span>確認';
  };

  const checkinLog = [];
  window._addCheckinHistoryItem = function(res) {
    checkinLog.unshift(res);
    const historyEl = document.getElementById('checkin-history');
    if (!historyEl) return;
    historyEl.innerHTML = checkinLog.slice(0, 20).map(item => `
      <div style="display:flex; align-items:center; gap:12px; padding:12px 20px; border-bottom:1px solid var(--c-border); last-child:border-0; transition:background 0.15s;"
        onmouseenter="this.style.background='var(--c-raised)'" onmouseleave="this.style.background='none'">
        <div style="width:32px; height:32px; background:rgba(57,255,20,0.1); border:1px solid rgba(57,255,20,0.3); border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
          <span class="material-icons-outlined" style="font-size:16px; color:var(--lime);">check</span>
        </div>
        <div style="flex:1; min-width:0;">
          <p style="font-size:13px; font-weight:700; color:var(--c-text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${_escapeHtml(item.attendee_name || '参加者')}</p>
          <p style="font-family:'JetBrains Mono',monospace; font-size:10px; color:var(--c-dim);">${_escapeHtml(item.order_number || '')}</p>
        </div>
        <span style="font-size:11px; color:var(--c-dim); flex-shrink:0;">${new Date(item.checked_in_at || Date.now()).toLocaleTimeString('ja-JP')}</span>
      </div>
    `).join('');
  };

  window._loadCheckinHistory = function() {
    const eventId = document.getElementById('checkin-event-select')?.value;
    if (eventId) _loadCheckinStats(eventId);
  };
}

// グローバル公開
window._orgOverview          = _orgOverview;
window._orgEvents            = _orgEvents;
window._orgCheckin           = _orgCheckin;
window._orgSettings          = _orgSettings;
window._orgLoadEventsPreview = _orgLoadEventsPreview;
