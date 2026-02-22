/**
 * ホームページ
 * API: GET /api/events
 */

async function renderHome(params) {
  const app = document.getElementById('app');
  if (!app) return;

  const searchQuery = params?.search || '';

  // ローディング（フッター含む全体構造）
  app.innerHTML = `
    <div class="min-h-screen flex flex-col">
      <!-- Hero -->
      <section class="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20 px-4">
        <div class="max-w-4xl mx-auto text-center">
          <h1 class="text-4xl md:text-5xl font-bold mb-4">人と体験をつなぐ<br>イベントプラットフォーム</h1>
          <p class="text-blue-100 text-lg mb-8">テック・ビジネス・音楽・アートなど、あなたにぴったりのイベントが見つかります</p>
          <div class="flex max-w-xl mx-auto">
            <input id="search-input" type="text" placeholder="イベントを検索..."
              value="${_escapeHtml(searchQuery)}"
              class="flex-1 px-5 py-3 rounded-l-xl text-slate-800 text-base focus:outline-none">
            <button onclick="homeSearch()"
              class="bg-white text-blue-600 font-bold px-6 py-3 rounded-r-xl hover:bg-blue-50 transition">
              検索
            </button>
          </div>
        </div>
      </section>

      <!-- イベント一覧 -->
      <section class="max-w-6xl mx-auto px-4 py-12 flex-1 w-full">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-slate-800">
            ${searchQuery ? `「${_escapeHtml(searchQuery)}」の検索結果` : '開催中のイベント'}
          </h2>
          ${searchQuery ? `<button onclick="renderHome({})" class="text-sm text-blue-600 hover:underline">← 全てのイベント</button>` : ''}
        </div>
        <div id="events-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- ローディング skeleton -->
          ${[1,2,3,4,5,6].map(() => `
            <div class="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
              <div class="h-48 bg-slate-200"></div>
              <div class="p-5 space-y-3">
                <div class="h-4 bg-slate-200 rounded w-3/4"></div>
                <div class="h-3 bg-slate-200 rounded w-1/2"></div>
                <div class="h-3 bg-slate-200 rounded w-2/3"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- フッター -->
      <footer class="bg-slate-800 text-slate-400 mt-auto">
        <div class="max-w-6xl mx-auto px-4 py-12">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div class="md:col-span-2">
              <div class="text-2xl font-bold text-white mb-3">LinkUp</div>
              <p class="text-sm leading-relaxed">人と体験をつなぐイベント・コミュニティプラットフォーム。テック、ビジネス、音楽、アートなど多彩なイベントが見つかります。</p>
            </div>
            <div>
              <h4 class="text-white font-semibold mb-3">サービス</h4>
              <ul class="space-y-2 text-sm">
                <li><button onclick="AppRouter.go('home')" class="hover:text-white transition">イベントを探す</button></li>
                <li><button onclick="AppUI.openRegisterModal()" class="hover:text-white transition">主催者として登録</button></li>
                <li><button onclick="AppRouter.go('dashboard')" class="hover:text-white transition">マイページ</button></li>
              </ul>
            </div>
            <div>
              <h4 class="text-white font-semibold mb-3">サポート</h4>
              <ul class="space-y-2 text-sm">
                <li><a href="mailto:support@link-up.live" class="hover:text-white transition">お問い合わせ</a></li>
                <li><span class="text-slate-500 text-xs">利用規約</span></li>
                <li><span class="text-slate-500 text-xs">プライバシーポリシー</span></li>
              </ul>
            </div>
          </div>
          <div class="border-t border-slate-700 pt-6 text-center text-sm">
            <p>&copy; 2026 LinkUp. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  `;

  // 検索関数をグローバルに定義
  window.homeSearch = () => {
    const q = document.getElementById('search-input')?.value?.trim() || '';
    AppRouter.go('home', { search: q });
  };

  // Enterキー検索
  document.getElementById('search-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') window.homeSearch();
  });

  // イベント取得
  try {
    const queryParams = { limit: 50 };
    if (searchQuery) queryParams.search = searchQuery;

    const data = await window.LinkUpAPI.Events.list(queryParams);
    const events = data.events || [];

    const grid = document.getElementById('events-grid');
    if (!grid) return;

    if (events.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full text-center py-16 text-slate-400">
          <span class="material-icons-outlined text-5xl mb-3 block">event_busy</span>
          <p>${searchQuery ? '検索結果が見つかりませんでした' : '現在開催中のイベントはありません'}</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = events.map(ev => _renderEventCard(ev)).join('');

  } catch (err) {
    console.error('Events fetch error:', err);
    const grid = document.getElementById('events-grid');
    if (grid) {
      grid.innerHTML = `
        <div class="col-span-full text-center py-16">
          <span class="material-icons-outlined text-5xl mb-3 block text-red-300">wifi_off</span>
          <p class="text-slate-600 font-medium mb-1">イベントの読み込みに失敗しました</p>
          <p class="text-slate-400 text-sm mb-4">${_escapeHtml(err.message)}</p>
          <button onclick="AppRouter.go('home')"
            class="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">再読み込み</button>
        </div>
      `;
    }
  }
}

// ─── イベントカード ──────────────────────────

function _renderEventCard(ev) {
  const date = ev.start_datetime
    ? new Date(ev.start_datetime).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })
    : '日時未定';
  const price = ev.price != null ? (ev.price === 0 ? '無料' : `¥${Number(ev.price).toLocaleString()}〜`) : '';
  const img = ev.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80';
  const categoryColor = {
    tech: 'bg-blue-100 text-blue-700',
    business: 'bg-purple-100 text-purple-700',
    music: 'bg-pink-100 text-pink-700',
    art: 'bg-orange-100 text-orange-700',
    food: 'bg-green-100 text-green-700',
    social: 'bg-yellow-100 text-yellow-700',
  }[ev.category] || 'bg-slate-100 text-slate-700';

  return `
    <div class="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer group"
         onclick="AppRouter.go('detail', { id: '${_escapeHtml(ev.event_id)}' })">
      <div class="relative h-48 overflow-hidden">
        <img src="${_escapeHtml(img)}" alt="${_escapeHtml(ev.title)}"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onerror="this.src='https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80'">
        ${ev.category ? `<span class="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold ${categoryColor}">${_escapeHtml(ev.category)}</span>` : ''}
      </div>
      <div class="p-5">
        <h3 class="font-bold text-slate-800 text-base mb-2 line-clamp-2">${_escapeHtml(ev.title)}</h3>
        <div class="space-y-1.5 text-sm text-slate-500">
          <p class="flex items-center gap-1.5">
            <span class="material-icons-outlined text-base">calendar_today</span>${date}
          </p>
          <p class="flex items-center gap-1.5">
            <span class="material-icons-outlined text-base">location_on</span>
            <span class="truncate">${_escapeHtml(ev.venue_name || 'オンライン')}</span>
          </p>
          ${price ? `<p class="flex items-center gap-1.5 font-bold text-slate-700">
            <span class="material-icons-outlined text-base">confirmation_number</span>${price}
          </p>` : ''}
        </div>
        <div class="mt-4 flex items-center justify-between">
          <span class="text-xs text-slate-400">${_escapeHtml(ev.organizer_name || '')}</span>
          <span class="text-blue-600 text-sm font-medium group-hover:underline">詳細を見る →</span>
        </div>
      </div>
    </div>
  `;
}
