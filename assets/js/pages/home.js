/**
 * ホームページ
 * API: GET /api/events
 */

async function renderHome(params) {
  const app = document.getElementById('app');
  if (!app) return;

  const searchQuery = params?.search || '';

  app.innerHTML = `
    <div class="min-h-screen flex flex-col">

      <!-- ═══ ヒーロー ═══ -->
      <section class="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white py-20 px-4">
        <div class="max-w-6xl mx-auto">
          <div class="flex flex-col lg:flex-row items-center gap-12">

            <!-- テキスト -->
            <div class="flex-1 text-center lg:text-left">
              <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                日本最大級の<br>
                <span class="text-yellow-300">イベントプラットフォーム</span>
              </h1>
              <p class="text-xl text-blue-100 mb-8">
                音楽、テック、ビジネス、アートなど、あらゆるイベントを簡単に見つけて参加しよう
              </p>

              <!-- 検索バー -->
              <div class="flex bg-white rounded-xl shadow-2xl overflow-hidden max-w-xl mx-auto lg:mx-0">
                <input
                  type="text"
                  id="search-input"
                  placeholder="イベントを検索..."
                  value="${_escapeHtml(searchQuery)}"
                  class="flex-1 px-6 py-4 text-slate-800 focus:outline-none text-base"
                  onkeypress="if(event.key==='Enter') homeSearch()">
                <button onclick="homeSearch()"
                  class="px-7 bg-blue-600 hover:bg-blue-700 transition flex items-center">
                  <span class="material-icons-outlined text-white">search</span>
                </button>
              </div>

              <!-- 統計 -->
              <div class="flex items-center justify-center lg:justify-start gap-10 mt-10 text-sm">
                <div class="text-center">
                  <div class="text-3xl font-bold">10,000+</div>
                  <div class="text-blue-200 mt-1">イベント</div>
                </div>
                <div class="text-center">
                  <div class="text-3xl font-bold">500,000+</div>
                  <div class="text-blue-200 mt-1">ユーザー</div>
                </div>
                <div class="text-center">
                  <div class="text-3xl font-bold">1,000+</div>
                  <div class="text-blue-200 mt-1">主催者</div>
                </div>
              </div>
            </div>

            <!-- イラスト（大画面のみ） -->
            <div class="flex-1 hidden lg:flex items-center justify-center">
              <div class="relative">
                <span class="material-icons-outlined text-white/10" style="font-size:280px;">event</span>
                <div class="absolute inset-0 flex items-center justify-center">
                  <span class="material-icons-outlined text-white/30" style="font-size:180px;">celebration</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- ═══ LinkUpの特徴 ═══ -->
      <section class="py-20 bg-slate-50 px-4">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold text-slate-800 mb-4">LinkUpの特徴</h2>
            <p class="text-lg text-slate-600">簡単、安全、便利なイベント体験を提供します</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            ${[
              { icon: 'search',              title: '簡単検索',         desc: 'カテゴリ、日付、場所から簡単にイベントを見つけられます' },
              { icon: 'confirmation_number', title: 'オンラインチケット', desc: 'スマホで簡単にチケット購入。QRコードで入場もスムーズ' },
              { icon: 'payment',             title: '安全な決済',        desc: 'クレジットカードなど多様な決済方法に対応' },
              { icon: 'notifications',       title: 'リアルタイム通知',  desc: 'お気に入りイベントの更新や新着情報を即座にお知らせ' },
            ].map(f => `
              <div class="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition text-center">
                <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <span class="material-icons-outlined text-blue-600 text-3xl">${f.icon}</span>
                </div>
                <h3 class="text-lg font-bold text-slate-800 mb-3">${f.title}</h3>
                <p class="text-slate-500 text-sm leading-relaxed">${f.desc}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- ═══ 注目のイベント ═══ -->
      <section class="py-20 bg-white px-4">
        <div class="max-w-6xl mx-auto">
          <div class="flex items-center justify-between mb-8">
            <div>
              <h2 class="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
                ${searchQuery ? `「${_escapeHtml(searchQuery)}」の検索結果` : '注目のイベント'}
              </h2>
              <p class="text-slate-500">今すぐ参加できる人気イベント</p>
            </div>
            ${searchQuery ? `<button onclick="renderHome({})" class="text-sm text-blue-600 hover:underline flex items-center gap-1"><span class="material-icons-outlined text-base">arrow_back</span>すべて表示</button>` : ''}
          </div>

          <div id="events-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </div>
      </section>

      <!-- ═══ カテゴリから探す ═══ -->
      <section class="py-20 bg-slate-50 px-4">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold text-slate-800 mb-4">カテゴリから探す</h2>
            <p class="text-lg text-slate-600">興味のあるジャンルからイベントを見つけよう</p>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            ${[
              { id: 'music',     name: '音楽',        icon: 'music_note',       color: 'from-pink-500 to-rose-500' },
              { id: 'tech',      name: 'テック',       icon: 'computer',         color: 'from-blue-500 to-cyan-500' },
              { id: 'business',  name: 'ビジネス',     icon: 'business_center',  color: 'from-slate-700 to-slate-500' },
              { id: 'art',       name: 'アート',       icon: 'palette',          color: 'from-purple-500 to-violet-500' },
              { id: 'food',      name: 'グルメ',       icon: 'restaurant',       color: 'from-orange-500 to-amber-500' },
              { id: 'sports',    name: 'スポーツ',     icon: 'sports_soccer',    color: 'from-green-500 to-emerald-500' },
              { id: 'social',    name: 'コミュニティ', icon: 'groups',           color: 'from-teal-500 to-green-500' },
              { id: 'education', name: '教育',         icon: 'school',           color: 'from-indigo-500 to-blue-500' },
            ].map(cat => `
              <button onclick="AppRouter.go('home', { search: '${cat.id}' })"
                class="bg-gradient-to-br ${cat.color} p-5 rounded-2xl shadow-sm hover:shadow-md transition text-white text-center group">
                <span class="material-icons-outlined text-4xl mb-2 block group-hover:scale-110 transition-transform">${cat.icon}</span>
                <div class="text-xs font-bold">${cat.name}</div>
              </button>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- ═══ CTA ═══ -->
      <section class="py-20 bg-gradient-to-br from-blue-600 to-purple-700 text-white px-4">
        <div class="max-w-3xl mx-auto text-center">
          <h2 class="text-3xl md:text-5xl font-bold mb-6">今すぐ始めよう</h2>
          <p class="text-xl text-blue-100 mb-10" id="cta-message">
            無料でアカウントを作成して、イベントを探し始めましょう
          </p>
          <div class="flex items-center justify-center gap-4 flex-wrap" id="cta-buttons">
            <button onclick="AppUI.openRegisterModal()"
              class="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition font-bold text-lg shadow-lg">
              無料で始める
            </button>
            <button onclick="AppUI.openLoginModal()"
              class="px-8 py-4 bg-blue-700/80 text-white rounded-xl hover:bg-blue-800 transition font-bold text-lg border-2 border-white/30">
              ログイン
            </button>
          </div>
        </div>
      </section>

      <!-- ═══ フッター ═══ -->
      <footer class="bg-slate-800 text-slate-400">
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

  // ログイン済みならCTAを書き換え
  if (window.currentUser) {
    const msg = document.getElementById('cta-message');
    const btns = document.getElementById('cta-buttons');
    if (msg) msg.textContent = '素敵なイベントを見つけて、新しい体験を始めましょう';
    if (btns) btns.innerHTML = `
      <button onclick="AppRouter.go('home')"
        class="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition font-bold text-lg shadow-lg">
        イベントを探す
      </button>
      <button onclick="AppRouter.go('dashboard')"
        class="px-8 py-4 bg-blue-700/80 text-white rounded-xl hover:bg-blue-800 transition font-bold text-lg border-2 border-white/30">
        マイページへ
      </button>
    `;
  }

  // 検索関数
  window.homeSearch = () => {
    const q = document.getElementById('search-input')?.value?.trim() || '';
    AppRouter.go('home', { search: q });
  };

  // APIからイベント取得
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

// ─── イベントカード ──────────────────────────────────

function _renderEventCard(ev) {
  const date = ev.start_datetime
    ? new Date(ev.start_datetime).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })
    : '日時未定';
  const price = ev.price != null ? (ev.price === 0 ? '無料' : `¥${Number(ev.price).toLocaleString()}〜`) : '';
  const img = ev.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80';
  const categoryColor = {
    tech:     'bg-blue-100 text-blue-700',
    business: 'bg-purple-100 text-purple-700',
    music:    'bg-pink-100 text-pink-700',
    art:      'bg-orange-100 text-orange-700',
    food:     'bg-green-100 text-green-700',
    social:   'bg-yellow-100 text-yellow-700',
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
