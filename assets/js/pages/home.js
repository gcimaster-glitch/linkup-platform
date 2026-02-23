/**
 * ホームページ
 * API: GET /api/events
 */

async function renderHome(params) {
  const app = document.getElementById('app');
  if (!app) return;

  const searchQuery = params?.search || '';
  const user = window.currentUser;

  app.innerHTML = `
    <div class="min-h-screen flex flex-col">

      <!-- ═══ ヒーロー ═══ -->
      <section class="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white py-10 px-4">
        <div class="max-w-6xl mx-auto">
          <div class="flex flex-col lg:flex-row items-center gap-6">

            <!-- テキスト -->
            <div class="flex-1 text-center lg:text-left">
              <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs mb-4 border border-white/20">
                <span class="material-icons-outlined text-yellow-300 text-sm">auto_awesome</span>
                <span class="text-white/90">日本最大級のイベント・コミュニティプラットフォーム</span>
              </div>
              <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight">
                あらゆる体験と<br>
                <span class="text-yellow-300">人をつなぐ場所</span>
              </h1>
              <p class="text-sm md:text-base text-blue-100 mb-5 max-w-xl mx-auto lg:mx-0">
                テック・ビジネス・音楽・アート・スポーツ・グルメ…<br class="hidden md:block">
                気になるイベントを見つけて、チケットをその場で購入。<br class="hidden md:block">
                主催者もかんたんにイベントを作成・管理できます。
              </p>

              <!-- 検索バー -->
              <div class="flex bg-white rounded-xl shadow-2xl overflow-hidden max-w-lg mx-auto lg:mx-0 mb-5">
                <input
                  type="text"
                  id="search-input"
                  placeholder="イベントタイトル・カテゴリで検索..."
                  value="${_escapeHtml(searchQuery)}"
                  class="flex-1 px-4 py-3 text-slate-800 focus:outline-none text-sm"
                  onkeypress="if(event.key==='Enter') homeSearch()">
                <button onclick="homeSearch()"
                  class="px-5 bg-blue-600 hover:bg-blue-700 transition flex items-center gap-1 text-sm font-medium">
                  <span class="material-icons-outlined text-white text-lg">search</span>
                </button>
              </div>

              <!-- 統計カード -->
              <div class="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs">
                ${[
                  { num: '10,000+', label: 'イベント開催', icon: 'event' },
                  { num: '500,000+', label: '登録ユーザー', icon: 'people' },
                  { num: '1,000+', label: '主催者', icon: 'business' },
                ].map(s => `
                  <div class="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/20">
                    <span class="material-icons-outlined text-yellow-300 text-sm">${s.icon}</span>
                    <div>
                      <div class="text-sm font-bold">${s.num}</div>
                      <div class="text-blue-200 text-xs">${s.label}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- ビジュアル（PC） -->
            <div class="flex-shrink-0 hidden lg:flex items-center justify-center">
              <div class="relative w-64 h-64">
                <div class="absolute inset-0 bg-white/10 rounded-3xl rotate-6"></div>
                <div class="absolute inset-0 bg-white/5 rounded-3xl -rotate-3"></div>
                <div class="relative bg-white/10 backdrop-blur-sm rounded-3xl p-6 flex flex-col items-center justify-center gap-3 border border-white/20">
                  <span class="material-icons-outlined text-white" style="font-size:64px;">event</span>
                  <div class="grid grid-cols-3 gap-2 w-full">
                    ${['music_note','computer','business_center','palette','restaurant','sports_soccer'].map(icon =>
                      `<div class="bg-white/10 rounded-lg p-2 flex items-center justify-center">
                        <span class="material-icons-outlined text-white text-base">${icon}</span>
                      </div>`
                    ).join('')}
                  </div>
                  <p class="text-white/80 text-xs text-center">多彩なジャンルのイベントが毎日更新</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- ═══ LinkUpの特徴 ═══ -->
      <section class="py-12 bg-white px-4">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-8">
            <h2 class="text-2xl md:text-3xl font-bold text-slate-800 mb-2">LinkUpでできること</h2>
            <p class="text-slate-500 text-sm">参加者・主催者どちらにも使いやすい機能を提供します</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            ${[
              { icon: 'search',              title: '簡単検索',         desc: 'カテゴリ・日付・場所から気になるイベントをすぐに見つけられます',        color: 'text-blue-600 bg-blue-50' },
              { icon: 'confirmation_number', title: 'QRチケット',       desc: 'オンラインで購入したチケットはQRコードで発行。スマホで入場できます',    color: 'text-green-600 bg-green-50' },
              { icon: 'event_available',     title: 'イベント主催',     desc: 'フォームに入力するだけでイベントを作成・公開。参加者管理も簡単です',    color: 'text-purple-600 bg-purple-50' },
              { icon: 'analytics',           title: '売上・分析',       desc: '主催者は注文履歴・売上・参加者データをリアルタイムで確認できます',       color: 'text-orange-600 bg-orange-50' },
            ].map(f => `
              <div class="bg-slate-50 p-6 rounded-2xl hover:shadow-md transition text-center">
                <div class="w-12 h-12 ${f.color} rounded-full flex items-center justify-center mx-auto mb-4">
                  <span class="material-icons-outlined text-2xl">${f.icon}</span>
                </div>
                <h3 class="text-base font-bold text-slate-800 mb-2">${f.title}</h3>
                <p class="text-slate-500 text-xs leading-relaxed">${f.desc}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- ═══ 注目のイベント ═══ -->
      <section class="py-12 bg-slate-50 px-4">
        <div class="max-w-6xl mx-auto">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-2xl md:text-3xl font-bold text-slate-800 mb-1">
                ${searchQuery ? `「${_escapeHtml(searchQuery)}」の検索結果` : '注目のイベント'}
              </h2>
              <p class="text-slate-500 text-sm">
                ${searchQuery ? '検索キーワードに一致するイベント' : '今すぐ参加できる人気イベント'}
              </p>
            </div>
            ${searchQuery ? `
              <button onclick="renderHome({})"
                class="text-sm text-blue-600 hover:underline flex items-center gap-1 flex-shrink-0">
                <span class="material-icons-outlined text-base">arrow_back</span>すべて表示
              </button>
            ` : ''}
          </div>

          <div id="events-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            ${[1,2,3,4,5,6].map(() => `
              <div class="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
                <div class="h-44 bg-slate-200"></div>
                <div class="p-4 space-y-2.5">
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
      <section class="py-12 bg-white px-4">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-8">
            <h2 class="text-2xl md:text-3xl font-bold text-slate-800 mb-2">カテゴリから探す</h2>
            <p class="text-slate-500 text-sm">興味のあるジャンルからイベントを見つけよう</p>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
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
                class="bg-gradient-to-br ${cat.color} p-4 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-white text-center group">
                <span class="material-icons-outlined text-3xl mb-1.5 block group-hover:scale-110 transition-transform">${cat.icon}</span>
                <div class="text-xs font-bold">${cat.name}</div>
              </button>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- ═══ 主催者向けCTA ═══ -->
      <section class="py-10 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4">
        <div class="max-w-4xl mx-auto">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 class="text-2xl md:text-3xl font-bold mb-2">イベントを主催しませんか？</h2>
              <p class="text-purple-100 text-sm">
                LinkUpならかんたんにイベントを作成・公開できます。<br>
                チケット販売から参加者管理まで、すべてワンストップで。
              </p>
            </div>
            <div class="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <button onclick="${user ? "AppRouter.go('organizer')" : "AppUI.openRegisterModal()"}"
                class="px-6 py-3 bg-white text-purple-700 rounded-xl hover:bg-purple-50 transition font-bold text-sm shadow-lg whitespace-nowrap">
                <span class="material-icons-outlined text-sm align-middle mr-1">add_circle</span>
                ${user ? 'イベントを作成する' : '主催者として登録'}
              </button>
              <button onclick="AppRouter.go('home')"
                class="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition font-bold text-sm border border-white/30 whitespace-nowrap">
                <span class="material-icons-outlined text-sm align-middle mr-1">search</span>
                イベントを探す
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══ ユーザー向けCTA（未ログイン時のみ） ═══ -->
      ${!user ? `
      <section class="py-12 bg-gradient-to-br from-blue-600 to-purple-700 text-white px-4">
        <div class="max-w-3xl mx-auto text-center">
          <h2 class="text-2xl md:text-4xl font-bold mb-4">今すぐ始めよう</h2>
          <p class="text-lg text-blue-100 mb-8">
            無料でアカウントを作成して、好きなイベントに参加しましょう
          </p>
          <div class="flex items-center justify-center gap-4 flex-wrap">
            <button onclick="AppUI.openRegisterModal()"
              class="px-8 py-3.5 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition font-bold text-base shadow-lg">
              無料で始める
            </button>
            <button onclick="AppUI.openLoginModal()"
              class="px-8 py-3.5 bg-blue-700/80 text-white rounded-xl hover:bg-blue-800 transition font-bold text-base border-2 border-white/30">
              ログイン
            </button>
          </div>
          <p class="text-blue-200 text-xs mt-4">クレジットカード不要・いつでも退会可能</p>
        </div>
      </section>
      ` : ''}

      <!-- ═══ フッター ═══ -->
      <footer class="bg-slate-900 text-slate-400">
        <div class="max-w-6xl mx-auto px-4 py-10">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div class="md:col-span-2">
              <div class="text-2xl font-bold text-white mb-2">LinkUp</div>
              <p class="text-sm leading-relaxed mb-3">
                人と体験をつなぐイベント・コミュニティプラットフォーム。<br>
                テック・ビジネス・音楽・アートなど多彩なイベントが見つかります。
              </p>
              <div class="flex gap-2">
                <span class="bg-slate-800 text-xs px-2.5 py-1 rounded-full">安全・安心</span>
                <span class="bg-slate-800 text-xs px-2.5 py-1 rounded-full">簡単操作</span>
                <span class="bg-slate-800 text-xs px-2.5 py-1 rounded-full">無料登録</span>
              </div>
            </div>
            <div>
              <h4 class="text-white font-semibold mb-3 text-sm">サービス</h4>
              <ul class="space-y-2 text-sm">
                <li><button onclick="AppRouter.go('home')" class="hover:text-white transition">イベントを探す</button></li>
                <li><button onclick="AppUI.openRegisterModal()" class="hover:text-white transition">主催者として登録</button></li>
                <li><button onclick="AppRouter.go('dashboard')" class="hover:text-white transition">マイページ</button></li>
                <li><button onclick="AppUI.openLoginModal()" class="hover:text-white transition">ログイン</button></li>
              </ul>
            </div>
            <div>
              <h4 class="text-white font-semibold mb-3 text-sm">サポート</h4>
              <ul class="space-y-2 text-sm">
                <li><a href="mailto:support@link-up.live" class="hover:text-white transition">お問い合わせ</a></li>
                <li><span class="cursor-default">利用規約</span></li>
                <li><span class="cursor-default">プライバシーポリシー</span></li>
                <li><span class="cursor-default">特定商取引法</span></li>
              </ul>
            </div>
          </div>
          <div class="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-2 text-xs">
            <p>&copy; 2026 LinkUp. All rights reserved.</p>
            <p class="text-slate-600">Powered by Cloudflare Workers &amp; D1</p>
          </div>
        </div>
      </footer>

    </div>
  `;

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
          <p class="font-medium mb-1">${searchQuery ? '検索結果が見つかりませんでした' : '現在開催中のイベントはありません'}</p>
          ${searchQuery ? `<button onclick="renderHome({})" class="mt-3 text-sm text-blue-600 hover:underline">すべてのイベントを見る</button>` : ''}
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

  const categoryColorMap = {
    tech:      { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'テック' },
    business:  { bg: 'bg-purple-100', text: 'text-purple-700', label: 'ビジネス' },
    music:     { bg: 'bg-pink-100',   text: 'text-pink-700',   label: '音楽' },
    art:       { bg: 'bg-orange-100', text: 'text-orange-700', label: 'アート' },
    food:      { bg: 'bg-green-100',  text: 'text-green-700',  label: 'グルメ' },
    sports:    { bg: 'bg-lime-100',   text: 'text-lime-700',   label: 'スポーツ' },
    social:    { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'コミュニティ' },
    education: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: '教育' },
  };
  const catInfo = categoryColorMap[ev.category] || { bg: 'bg-slate-100', text: 'text-slate-700', label: ev.category || '' };

  return `
    <div class="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer group"
         onclick="AppRouter.go('detail', { id: '${_escapeHtml(ev.event_id)}' })">
      <div class="relative h-44 overflow-hidden">
        <img src="${_escapeHtml(img)}" alt="${_escapeHtml(ev.title)}"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onerror="this.src='https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80'">
        ${catInfo.label ? `
          <span class="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-bold ${catInfo.bg} ${catInfo.text}">
            ${catInfo.label}
          </span>
        ` : ''}
        ${price === '無料' ? `
          <span class="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold bg-green-500 text-white">
            無料
          </span>
        ` : ''}
      </div>
      <div class="p-4">
        <h3 class="font-bold text-slate-800 text-sm mb-2.5 line-clamp-2 group-hover:text-blue-600 transition-colors">${_escapeHtml(ev.title)}</h3>
        <div class="space-y-1 text-xs text-slate-500">
          <p class="flex items-center gap-1.5">
            <span class="material-icons-outlined text-sm text-blue-400">calendar_today</span>
            ${date}
          </p>
          <p class="flex items-center gap-1.5">
            <span class="material-icons-outlined text-sm text-blue-400">location_on</span>
            <span class="truncate">${_escapeHtml(ev.venue_name || 'オンライン')}</span>
          </p>
          ${price && price !== '無料' ? `
            <p class="flex items-center gap-1.5 font-bold text-slate-700">
              <span class="material-icons-outlined text-sm text-blue-400">confirmation_number</span>
              ${price}
            </p>
          ` : ''}
        </div>
        <div class="mt-3 flex items-center justify-between">
          <span class="text-xs text-slate-400 truncate max-w-[60%]">
            ${ev.organizer_name ? `<span class="material-icons-outlined text-xs align-middle">person</span> ${_escapeHtml(ev.organizer_name)}` : ''}
          </span>
          <span class="text-blue-600 text-xs font-bold group-hover:underline flex-shrink-0">詳細を見る →</span>
        </div>
      </div>
    </div>
  `;
}
