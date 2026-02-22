/**
 * ユーザーダッシュボード
 * API: GET /api/auth/me
 *      GET /api/orders
 *      GET /api/users/interests
 *      PUT /api/auth/profile
 */

async function renderDashboard(params = {}) {
  if (!AppAuth.requireLogin()) return;

  const app = document.getElementById('app');
  const tab = params.tab || 'overview';

  app.innerHTML = `
    <div class="min-h-screen bg-slate-50">
      <div class="max-w-5xl mx-auto px-4 py-8">
        <!-- ヘッダー -->
        <div class="flex items-center gap-4 mb-8">
          <img id="dash-avatar" src="" alt="avatar"
            class="w-16 h-16 rounded-full object-cover border-4 border-white shadow">
          <div>
            <h1 id="dash-name" class="text-2xl font-bold text-slate-800">読み込み中...</h1>
            <p id="dash-email" class="text-slate-500 text-sm"></p>
          </div>
        </div>

        <!-- タブ -->
        <div class="flex gap-1 bg-white rounded-xl p-1 shadow-sm mb-6 overflow-x-auto">
          ${[
            { key: 'overview',  label: 'ホーム',    icon: 'home' },
            { key: 'tickets',   label: 'チケット',  icon: 'confirmation_number' },
            { key: 'payments',  label: '決済履歴',  icon: 'receipt_long' },
            { key: 'interests', label: '興味',      icon: 'favorite' },
            { key: 'profile',   label: 'プロフィール', icon: 'person' },
          ].map(t => `
            <button onclick="AppRouter.go('dashboard', { tab: '${t.key}' })"
              class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap
                ${tab === t.key ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}">
              <span class="material-icons-outlined text-base">${t.icon}</span>${t.label}
            </button>
          `).join('')}
        </div>

        <!-- コンテンツ -->
        <div id="dash-content">
          <div class="flex justify-center py-12">
            <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>

      <!-- フッター -->
      <footer class="bg-slate-800 text-slate-400 mt-12">
        <div class="max-w-6xl mx-auto px-4 py-10">
          <div class="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <span class="text-xl font-bold text-white">LinkUp</span>
              <p class="text-sm mt-1">人と体験をつなぐイベントプラットフォーム</p>
            </div>
            <button onclick="AppRouter.go('home')" class="text-sm hover:text-white transition">← イベント一覧に戻る</button>
          </div>
          <div class="border-t border-slate-700 mt-6 pt-6 text-center text-sm">
            <p>&copy; 2026 LinkUp. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  `;

  // ユーザー情報セット
  const user = window.currentUser;
  if (user) {
    document.getElementById('dash-name').textContent  = user.display_name || user.name || '';
    document.getElementById('dash-email').textContent = user.email || '';
    document.getElementById('dash-avatar').src = user.avatar_url || user.icon_url
      || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.display_name || 'U')}&background=2563EB&color=fff`;
  }

  // タブ描画
  switch (tab) {
    case 'overview':  await _dashOverview();  break;
    case 'tickets':   await _dashTickets();   break;
    case 'payments':  await _dashPayments();  break;
    case 'interests': await _dashInterests(); break;
    case 'profile':   await _dashProfile();   break;
    default: await _dashOverview();
  }
}

// ─── 概要タブ ────────────────────────────────

async function _dashOverview() {
  const el = document.getElementById('dash-content');
  const user = window.currentUser;

  el.innerHTML = `
    <div class="grid md:grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-2xl p-5 shadow-sm">
        <p class="text-sm text-slate-500 mb-1">チケット</p>
        <p id="stat-tickets" class="text-3xl font-bold text-blue-600">-</p>
      </div>
      <div class="bg-white rounded-2xl p-5 shadow-sm">
        <p class="text-sm text-slate-500 mb-1">決済総額</p>
        <p id="stat-amount" class="text-3xl font-bold text-blue-600">-</p>
      </div>
      <div class="bg-white rounded-2xl p-5 shadow-sm">
        <p class="text-sm text-slate-500 mb-1">アカウント種別</p>
        <p class="text-lg font-bold text-slate-700 capitalize">${user?.role === 'organizer' ? '主催者' : user?.role === 'admin' ? '管理者' : '参加者'}</p>
      </div>
    </div>
    <div id="overview-orders" class="bg-white rounded-2xl p-5 shadow-sm">
      <h3 class="font-bold text-slate-700 mb-4">最近のチケット</h3>
      <div class="text-center py-6 text-slate-400">
        <div class="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  `;

  try {
    const data = await window.LinkUpAPI.Orders.list();
    const orders = data.orders || [];

    document.getElementById('stat-tickets').textContent = orders.length + '枚';
    const total = orders.reduce((s, o) => s + (o.total_amount || 0), 0);
    document.getElementById('stat-amount').textContent = '¥' + total.toLocaleString();

    const ordersEl = document.getElementById('overview-orders');
    if (orders.length === 0) {
      ordersEl.innerHTML = `
        <h3 class="font-bold text-slate-700 mb-4">最近のチケット</h3>
        <div class="text-center py-8 text-slate-400">
          <span class="material-icons-outlined text-4xl mb-2 block">confirmation_number</span>
          <p class="text-sm">まだチケットがありません</p>
          <button onclick="AppRouter.go('home')" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            イベントを探す
          </button>
        </div>
      `;
    } else {
      ordersEl.innerHTML = `
        <h3 class="font-bold text-slate-700 mb-4">最近のチケット</h3>
        <div class="space-y-3">
          ${orders.slice(0, 3).map(o => _renderOrderRow(o)).join('')}
        </div>
        ${orders.length > 3 ? `<button onclick="AppRouter.go('dashboard',{tab:'tickets'})" class="mt-4 text-sm text-blue-600 hover:underline">すべて見る</button>` : ''}
      `;
    }
  } catch (err) {
    document.getElementById('stat-tickets').textContent = '-';
    document.getElementById('stat-amount').textContent  = '-';
    document.getElementById('overview-orders').innerHTML = `
      <h3 class="font-bold text-slate-700 mb-4">最近のチケット</h3>
      <p class="text-red-400 text-sm">${err.message}</p>
    `;
  }
}

// ─── チケットタブ ─────────────────────────────

async function _dashTickets() {
  const el = document.getElementById('dash-content');
  el.innerHTML = `<div class="flex justify-center py-12"><div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>`;

  try {
    const data = await window.LinkUpAPI.Orders.list();
    const orders = data.orders || [];

    if (orders.length === 0) {
      el.innerHTML = `
        <div class="bg-white rounded-2xl p-8 shadow-sm text-center">
          <span class="material-icons-outlined text-5xl text-slate-300 mb-3 block">confirmation_number</span>
          <p class="text-slate-500 mb-4">チケットをまだ購入していません</p>
          <button onclick="AppRouter.go('home')" class="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
            イベントを探す
          </button>
        </div>
      `;
      return;
    }

    el.innerHTML = `
      <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div class="p-5 border-b border-slate-100">
          <h3 class="font-bold text-slate-800">チケット一覧 (${orders.length}件)</h3>
        </div>
        <div class="divide-y divide-slate-100">
          ${orders.map(o => _renderOrderRow(o, true)).join('')}
        </div>
      </div>
    `;
  } catch (err) {
    el.innerHTML = `<div class="bg-white rounded-2xl p-6 shadow-sm"><p class="text-red-500">${err.message}</p></div>`;
  }
}

// ─── 決済履歴タブ ─────────────────────────────

async function _dashPayments() {
  const el = document.getElementById('dash-content');
  el.innerHTML = `<div class="flex justify-center py-12"><div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>`;

  try {
    const data = await window.LinkUpAPI.Orders.list();
    const orders = data.orders || [];

    const total = orders.reduce((s, o) => s + (o.total_amount || 0), 0);
    const done  = orders.filter(o => o.payment_status === 'completed').length;

    el.innerHTML = `
      <!-- 統計 -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-2xl p-5 shadow-sm text-center">
          <p class="text-xs text-slate-500 mb-1">合計件数</p>
          <p class="text-2xl font-bold text-blue-600">${orders.length}件</p>
        </div>
        <div class="bg-white rounded-2xl p-5 shadow-sm text-center">
          <p class="text-xs text-slate-500 mb-1">総額</p>
          <p class="text-2xl font-bold text-blue-600">¥${total.toLocaleString()}</p>
        </div>
        <div class="bg-white rounded-2xl p-5 shadow-sm text-center">
          <p class="text-xs text-slate-500 mb-1">完了済み</p>
          <p class="text-2xl font-bold text-green-600">${done}件</p>
        </div>
      </div>

      <!-- テーブル -->
      <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div class="p-5 border-b border-slate-100">
          <h3 class="font-bold text-slate-800">決済履歴</h3>
        </div>
        ${orders.length === 0 ? `
          <div class="text-center py-12 text-slate-400">
            <span class="material-icons-outlined text-4xl mb-2 block">receipt_long</span>
            <p class="text-sm">決済履歴がありません</p>
          </div>
        ` : `
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th class="p-4 text-left">注文番号</th>
                  <th class="p-4 text-left">イベント</th>
                  <th class="p-4 text-left">日付</th>
                  <th class="p-4 text-right">金額</th>
                  <th class="p-4 text-center">状態</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${orders.map(o => {
                  const date = o.created_at ? new Date(o.created_at).toLocaleDateString('ja-JP') : '-';
                  const statusMap = { completed: ['完了', 'text-green-600 bg-green-50'], pending: ['保留', 'text-yellow-600 bg-yellow-50'], cancelled: ['キャンセル', 'text-red-600 bg-red-50'] };
                  const [label, cls] = statusMap[o.payment_status] || ['不明', 'text-slate-600 bg-slate-100'];
                  return `
                    <tr class="hover:bg-slate-50">
                      <td class="p-4 font-mono text-xs">${o.order_number || o.order_id}</td>
                      <td class="p-4 font-medium text-slate-700 max-w-xs truncate">${o.event_title || '-'}</td>
                      <td class="p-4 text-slate-500">${date}</td>
                      <td class="p-4 text-right font-bold">¥${Number(o.total_amount || 0).toLocaleString()}</td>
                      <td class="p-4 text-center"><span class="px-2 py-1 rounded-full text-xs font-bold ${cls}">${label}</span></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  } catch (err) {
    el.innerHTML = `<div class="bg-white rounded-2xl p-6 shadow-sm"><p class="text-red-500">${err.message}</p></div>`;
  }
}

// ─── 興味タブ ─────────────────────────────────

async function _dashInterests() {
  const el = document.getElementById('dash-content');
  el.innerHTML = `<div class="flex justify-center py-12"><div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>`;

  const render = async () => {
    try {
      const data = await window.LinkUpAPI.Users.getInterests();
      const tags = data.tags || [];

      el.innerHTML = `
        <div class="bg-white rounded-2xl p-6 shadow-sm">
          <h3 class="font-bold text-slate-800 mb-4">興味・関心タグ</h3>
          <div class="flex flex-wrap gap-2 mb-6" id="tags-list">
            ${tags.length === 0
              ? '<p class="text-slate-400 text-sm">まだタグがありません</p>'
              : tags.map(tag => `
                <span class="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium">
                  ${tag}
                  <button onclick="_removeInterest('${tag}')" class="ml-1 text-blue-400 hover:text-red-500">×</button>
                </span>
              `).join('')}
          </div>
          <div class="flex gap-2">
            <input id="tag-input" type="text" placeholder="タグを追加（例: Python, AI, 音楽）"
              class="flex-1 border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <button onclick="_addInterest()" class="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 text-sm">追加</button>
          </div>
        </div>
      `;

      document.getElementById('tag-input')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') _addInterest();
      });

    } catch (err) {
      // user_interests テーブルが存在しない場合は空の状態で表示
      const isTableMissing = err.message && err.message.includes('no such table');
      if (isTableMissing) {
        el.innerHTML = `
          <div class="bg-white rounded-2xl p-6 shadow-sm">
            <h3 class="font-bold text-slate-800 mb-4">興味・関心タグ</h3>
            <div class="text-center py-8 text-slate-400">
              <span class="material-icons-outlined text-4xl mb-2 block">favorite_border</span>
              <p class="text-sm">興味・関心タグ機能は準備中です</p>
            </div>
          </div>
        `;
      } else {
        el.innerHTML = `<div class="bg-white rounded-2xl p-6 shadow-sm"><p class="text-red-500 text-sm">${err.message}</p></div>`;
      }
    }
  };

  window._addInterest = async () => {
    const input = document.getElementById('tag-input');
    const tag = input?.value?.trim();
    if (!tag) return;
    try {
      await window.LinkUpAPI.Users.addInterest(tag);
      AppUI.toast(`「${tag}」を追加しました`, 'success');
      await render();
    } catch (err) {
      AppUI.toast(err.message, 'error');
    }
  };

  window._removeInterest = async (tag) => {
    try {
      await window.LinkUpAPI.Users.removeInterest(tag);
      AppUI.toast(`「${tag}」を削除しました`, 'info');
      await render();
    } catch (err) {
      AppUI.toast(err.message, 'error');
    }
  };

  await render();
}

// ─── プロフィールタブ ──────────────────────────

async function _dashProfile() {
  const el = document.getElementById('dash-content');
  const user = window.currentUser;

  el.innerHTML = `
    <div class="bg-white rounded-2xl p-6 shadow-sm max-w-lg">
      <h3 class="font-bold text-slate-800 mb-6">プロフィール編集</h3>
      <form id="profile-form" class="space-y-4">
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
          <p class="text-xs text-slate-400 mt-1">画像URLを直接入力してください</p>
        </div>
        <div class="pt-2">
          <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition text-sm">
            保存する
          </button>
        </div>
      </form>

      <div class="mt-6 pt-6 border-t border-slate-100">
        <p class="text-sm text-slate-500 mb-1">メールアドレス</p>
        <p class="text-slate-700 font-medium">${user?.email || ''}</p>
      </div>
    </div>
  `;

  document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const fields = { name: fd.get('name'), avatar_url: fd.get('avatar_url') };

    try {
      const result = await window.LinkUpAPI.Auth.updateProfile(fields);
      // currentUserを更新
      window.currentUser = { ...window.currentUser, ...result.user, display_name: fields.name };
      AppUI.updateNav();
      AppUI.toast('プロフィールを保存しました', 'success');
    } catch (err) {
      AppUI.toast(err.message || '保存に失敗しました', 'error');
    }
  });
}

// ─── 共通: 注文行 ─────────────────────────────

function _renderOrderRow(o, detailed = false) {
  const date = o.created_at ? new Date(o.created_at).toLocaleDateString('ja-JP') : '-';
  const img  = o.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&q=60';
  const statusMap = { completed: ['完了', 'text-green-600 bg-green-50'], pending: ['保留', 'text-yellow-600 bg-yellow-50'], cancelled: ['キャンセル', 'text-red-600 bg-red-50'] };
  const [label, cls] = statusMap[o.payment_status] || ['不明', 'text-slate-600 bg-slate-100'];

  return `
    <div class="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-xl cursor-pointer"
         onclick="${o.event_id ? `AppRouter.go('detail', {id:'${o.event_id}'})` : ''}">
      <img src="${img}" class="w-12 h-12 rounded-lg object-cover flex-shrink-0"
        onerror="this.src='https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&q=60'">
      <div class="flex-1 min-w-0">
        <p class="font-medium text-slate-800 text-sm truncate">${o.event_title || 'イベント'}</p>
        <p class="text-xs text-slate-400">${date} · ¥${Number(o.total_amount || 0).toLocaleString()}</p>
      </div>
      <span class="px-2 py-1 rounded-full text-xs font-bold flex-shrink-0 ${cls}">${label}</span>
    </div>
  `;
}
