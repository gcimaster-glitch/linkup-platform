/**
 * ホームページ - フルリデザイン版
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
      <section class="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white" style="min-height: 520px;">

        <!-- 背景装飾 -->
        <div class="absolute inset-0 pointer-events-none overflow-hidden">
          <!-- グロー -->
          <div class="absolute -top-20 left-1/3 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[80px]"></div>
          <div class="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/12 rounded-full blur-[70px]"></div>
          <div class="absolute top-1/2 -left-20 w-[300px] h-[300px] bg-cyan-500/8 rounded-full blur-[60px]"></div>
          <!-- グリッドパターン -->
          <div style="position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,0.04) 1px,transparent 1px);background-size:40px 40px;"></div>
          <!-- ヒーロー浮遊パーティクル -->
          <div class="hero-particle" style="top:20%;left:10%;width:6px;height:6px;background:rgba(147,197,253,0.6);"></div>
          <div class="hero-particle" style="top:60%;right:15%;width:4px;height:4px;background:rgba(196,181,253,0.7);animation-delay:-2s;"></div>
          <div class="hero-particle" style="top:40%;right:30%;width:8px;height:8px;background:rgba(103,232,249,0.4);animation-delay:-4s;"></div>
          <div class="hero-particle" style="bottom:25%;left:25%;width:5px;height:5px;background:rgba(134,239,172,0.5);animation-delay:-1s;"></div>
        </div>

        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-20 md:pt-18 md:pb-24">
          <div class="flex flex-col lg:flex-row items-center gap-12">

            <!-- テキストコンテンツ -->
            <div class="flex-1 text-center lg:text-left">

              <!-- バッジ -->
              <div class="inline-flex items-center gap-2.5 bg-blue-500/15 border border-blue-400/25 px-4 py-2 rounded-full text-xs mb-7 glass hover:bg-blue-500/20 transition-colors cursor-default">
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-400"></span>
                </span>
                <span class="text-blue-200 font-semibold tracking-wide">日本最大級のイベント・コミュニティプラットフォーム</span>
              </div>

              <!-- 見出し -->
              <h1 class="text-4xl md:text-5xl lg:text-[56px] font-black mb-5 leading-[1.08] tracking-tight">
                あらゆる体験と<br>
                <span class="relative inline-block">
                  <span class="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-300 bg-clip-text text-transparent">人をつなぐ</span>
                </span>
              </h1>

              <p class="text-base md:text-[17px] text-slate-300/90 mb-9 max-w-[480px] mx-auto lg:mx-0 leading-[1.8]">
                テック・ビジネス・音楽・アート・スポーツ…<br class="hidden sm:block">
                気になるイベントを見つけて、チケットをその場で購入。
              </p>

              <!-- 検索バー -->
              <div class="relative max-w-xl mx-auto lg:mx-0 mb-10">
                <div class="flex items-center bg-white rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/10 hover:ring-white/20 transition-all duration-300 group">
                  <span class="material-icons-outlined text-slate-400 pl-4 text-xl flex-shrink-0 group-focus-within:text-blue-600 transition-colors">search</span>
                  <input
                    type="text"
                    id="search-input"
                    placeholder="イベントタイトル・カテゴリで検索..."
                    value="${_escapeHtml(searchQuery)}"
                    class="flex-1 px-3 py-4 text-slate-800 focus:outline-none text-sm bg-transparent placeholder-slate-400"
                    onkeypress="if(event.key==='Enter') homeSearch()">
                  <button onclick="homeSearch()"
                    class="btn-primary m-1.5 px-5 py-2.5 rounded-xl flex items-center gap-1.5 text-sm font-bold flex-shrink-0 text-white">
                    <span class="hidden sm:inline">検索</span>
                    <span class="material-icons-outlined text-lg">arrow_forward</span>
                  </button>
                </div>
                <!-- 検索タグ -->
                <div class="flex flex-wrap gap-2 mt-3 justify-center lg:justify-start">
                  ${['テック', 'ビジネス', '音楽', 'アート'].map(tag => `
                    <button onclick="AppRouter.go('home',{search:'${tag}'})"
                      class="px-3 py-1 bg-white/8 hover:bg-white/16 border border-white/15 rounded-full text-xs text-slate-300 hover:text-white transition-all glass">
                      ${tag}
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- 統計 -->
              <div class="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                ${[
                  { num: '10,000+', label: 'イベント開催', icon: 'event', color: 'text-blue-300', iconBg: 'bg-blue-500/20' },
                  { num: '500,000+', label: '登録ユーザー', icon: 'people', color: 'text-purple-300', iconBg: 'bg-purple-500/20' },
                  { num: '1,000+', label: '主催者', icon: 'business_center', color: 'text-cyan-300', iconBg: 'bg-cyan-500/20' },
                ].map(s => `
                  <div class="stat-badge flex items-center gap-3 bg-white/6 glass border border-white/10 px-4 py-3 rounded-2xl">
                    <div class="w-9 h-9 ${s.iconBg} rounded-xl flex items-center justify-center flex-shrink-0">
                      <span class="material-icons-outlined ${s.color} text-lg">${s.icon}</span>
                    </div>
                    <div>
                      <div class="text-base font-extrabold text-white leading-none">${s.num}</div>
                      <div class="text-slate-400 text-xs mt-0.5">${s.label}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- ビジュアルカード（PC） -->
            <div class="flex-shrink-0 hidden lg:block">
              <div class="relative w-[280px]">
                <!-- メインカード -->
                <div class="bg-white/8 glass border border-white/15 rounded-3xl p-6 shadow-2xl">
                  <div class="flex items-center gap-3 mb-5">
                    <div class="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <span class="material-icons-outlined text-white text-base">event</span>
                    </div>
                    <div>
                      <p class="text-white font-bold text-sm">今週のイベント</p>
                      <p class="text-blue-300 text-xs mt-0.5">42件開催予定</p>
                    </div>
                    <div class="ml-auto">
                      <span class="w-2 h-2 rounded-full bg-green-400 block animate-pulse"></span>
                    </div>
                  </div>
                  <div class="grid grid-cols-3 gap-2 mb-5">
                    ${[
                      { icon: 'music_note',     name: '音楽',       color: 'from-pink-500 to-rose-600' },
                      { icon: 'computer',       name: 'テック',     color: 'from-blue-500 to-cyan-500' },
                      { icon: 'business_center',name: 'ビジネス',   color: 'from-violet-500 to-purple-600' },
                      { icon: 'palette',        name: 'アート',     color: 'from-orange-500 to-amber-500' },
                      { icon: 'restaurant',     name: 'グルメ',     color: 'from-green-500 to-emerald-600' },
                      { icon: 'sports_soccer',  name: 'スポーツ',   color: 'from-teal-500 to-cyan-600' },
                    ].map(c => `
                      <div class="bg-gradient-to-br ${c.color} rounded-2xl p-3 flex flex-col items-center gap-1.5 hover:scale-105 transition-transform cursor-pointer">
                        <span class="material-icons-outlined text-white text-xl">${c.icon}</span>
                        <span class="text-white text-[10px] font-bold">${c.name}</span>
                      </div>
                    `).join('')}
                  </div>
                  <!-- プログレス -->
                  <div class="bg-white/10 rounded-xl p-3">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-white/70 text-xs">今週の参加者</span>
                      <span class="text-white font-bold text-xs">2,847人</span>
                    </div>
                    <div class="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <div class="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full" style="width:72%;transition:width 1s ease;"></div>
                    </div>
                  </div>
                </div>

                <!-- フローティングバッジ -->
                <div class="absolute -top-4 -right-4 bg-gradient-to-br from-emerald-400 to-green-500 text-white text-xs font-bold px-3.5 py-2 rounded-2xl shadow-xl shadow-green-500/30">
                  <div class="flex items-center gap-1.5">
                    <span class="material-icons-outlined text-sm">confirmation_number</span>
                    QRチケット
                  </div>
                </div>
                <div class="absolute -bottom-4 -left-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-bold px-3.5 py-2 rounded-2xl shadow-xl shadow-blue-500/30">
                  <div class="flex items-center gap-1.5">
                    <span class="material-icons-outlined text-sm">star</span>
                    無料参加あり
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- 波形 -->
        <div class="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden" style="height:60px;">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style="width:100%;height:100%;">
            <path d="M0 60L1440 60L1440 20C1200 55 960 5 720 28C480 52 240 8 0 38L0 60Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      <!-- ═══ LinkUpの特徴 ═══ -->
      <section class="py-20 bg-slate-50 px-4">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-12">
            <span class="section-label text-blue-600 bg-blue-50 border border-blue-100 mb-4">
              <span class="material-icons-outlined text-sm">auto_awesome</span>
              Features
            </span>
            <h2 class="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">LinkUpでできること</h2>
            <p class="text-slate-500 text-base max-w-md mx-auto leading-relaxed">参加者・主催者どちらにも使いやすい機能を提供します</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            ${[
              {
                icon: 'search', title: '簡単検索',
                desc: 'カテゴリ・日付・場所から気になるイベントをすぐに見つけられます',
                iconBg: 'bg-blue-600', num: '01',
                accentColor: 'text-blue-600', accentBg: 'bg-blue-50',
                gradient: 'from-blue-500/8 to-transparent',
              },
              {
                icon: 'confirmation_number', title: 'QRチケット',
                desc: 'オンラインで購入したチケットはQRコードで発行。スマホで入場できます',
                iconBg: 'bg-emerald-500', num: '02',
                accentColor: 'text-emerald-600', accentBg: 'bg-emerald-50',
                gradient: 'from-emerald-500/8 to-transparent',
              },
              {
                icon: 'event_available', title: 'イベント主催',
                desc: 'フォームに入力するだけでイベントを作成・公開。参加者管理も簡単',
                iconBg: 'bg-purple-600', num: '03',
                accentColor: 'text-purple-600', accentBg: 'bg-purple-50',
                gradient: 'from-purple-500/8 to-transparent',
              },
              {
                icon: 'analytics', title: '売上・分析',
                desc: '主催者は注文履歴・売上・参加者データをリアルタイムで確認できます',
                iconBg: 'bg-orange-500', num: '04',
                accentColor: 'text-orange-500', accentBg: 'bg-orange-50',
                gradient: 'from-orange-500/8 to-transparent',
              },
            ].map(f => `
              <div class="reveal bg-white p-6 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-300 group overflow-hidden relative">
                <!-- 背景グラデーション -->
                <div class="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${f.gradient} pointer-events-none rounded-t-2xl"></div>
                <!-- 番号 -->
                <div class="absolute top-4 right-4 text-4xl font-black ${f.accentColor} opacity-10 select-none">${f.num}</div>
                <!-- アイコン -->
                <div class="relative w-13 h-13 ${f.iconBg} rounded-2xl flex items-center justify-center mb-5 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300" style="width:52px;height:52px;">
                  <span class="material-icons-outlined text-white text-xl">${f.icon}</span>
                </div>
                <h3 class="text-base font-extrabold text-slate-900 mb-2.5 leading-tight">${f.title}</h3>
                <p class="text-slate-500 text-sm leading-relaxed">${f.desc}</p>
                <!-- ホバー時ライン -->
                <div class="mt-4 h-0.5 w-0 ${f.accentBg.replace('bg-', 'bg-').replace('50', '200')} group-hover:w-full transition-all duration-500 rounded-full" style="background: currentColor; opacity: 0.4;"></div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- ═══ 注目のイベント ═══ -->
      <section class="py-20 bg-white px-4">
        <div class="max-w-7xl mx-auto">
          <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span class="section-label text-purple-600 bg-purple-50 border border-purple-100 mb-3">
                <span class="material-icons-outlined text-sm">${searchQuery ? 'search' : 'local_fire_department'}</span>
                ${searchQuery ? 'Search' : 'Trending'}
              </span>
              <h2 class="text-3xl md:text-4xl font-black text-slate-900 leading-tight tracking-tight">
                ${searchQuery
                  ? `「<span class="text-blue-600">${_escapeHtml(searchQuery)}</span>」の検索結果`
                  : '注目のイベント'
                }
              </h2>
              <p class="text-slate-500 text-sm mt-2">
                ${searchQuery ? '検索キーワードに一致するイベント' : '今すぐ参加できる人気イベント'}
              </p>
            </div>
            ${searchQuery ? `
              <button onclick="renderHome({})"
                class="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-bold flex-shrink-0 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-all">
                <span class="material-icons-outlined text-base">arrow_back</span>すべて表示
              </button>
            ` : ''}
          </div>

          <div id="events-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            ${[1,2,3,4,5,6,7,8].map(() => `
              <div class="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <div class="h-48 skeleton"></div>
                <div class="p-4 space-y-3">
                  <div class="flex gap-2">
                    <div class="h-5 w-16 skeleton rounded-full"></div>
                  </div>
                  <div class="h-4 skeleton rounded-lg w-5/6"></div>
                  <div class="h-3 skeleton rounded-lg w-3/4"></div>
                  <div class="h-3 skeleton rounded-lg w-2/3"></div>
                  <div class="h-px bg-slate-50"></div>
                  <div class="flex items-center gap-2">
                    <div class="w-5 h-5 skeleton rounded-full"></div>
                    <div class="h-3 skeleton rounded w-24"></div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- ═══ カテゴリから探す ═══ -->
      <section class="py-20 bg-slate-50 px-4">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-12">
            <span class="section-label text-green-600 bg-green-50 border border-green-100 mb-4">
              <span class="material-icons-outlined text-sm">category</span>
              Categories
            </span>
            <h2 class="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">カテゴリから探す</h2>
            <p class="text-slate-500 text-base">興味のあるジャンルからイベントを見つけよう</p>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            ${[
              { id: 'music',     name: '音楽',        icon: 'music_note',       gradient: 'from-pink-500 to-rose-600',      count: '1.2k+' },
              { id: 'tech',      name: 'テック',      icon: 'computer',         gradient: 'from-blue-500 to-blue-700',      count: '3.4k+' },
              { id: 'business',  name: 'ビジネス',    icon: 'business_center',  gradient: 'from-slate-600 to-slate-800',    count: '2.1k+' },
              { id: 'art',       name: 'アート',      icon: 'palette',          gradient: 'from-purple-500 to-violet-700',  count: '0.8k+' },
              { id: 'food',      name: 'グルメ',      icon: 'restaurant',       gradient: 'from-orange-500 to-amber-600',   count: '0.6k+' },
              { id: 'sports',    name: 'スポーツ',    icon: 'sports_soccer',    gradient: 'from-green-500 to-emerald-700',  count: '1.5k+' },
              { id: 'social',    name: 'コミュニティ',icon: 'groups',           gradient: 'from-teal-500 to-cyan-600',      count: '0.9k+' },
              { id: 'education', name: '教育',        icon: 'school',           gradient: 'from-indigo-500 to-blue-700',    count: '0.7k+' },
            ].map(cat => `
              <button onclick="AppRouter.go('home', { search: '${cat.id}' })"
                class="cat-card relative overflow-hidden bg-gradient-to-br ${cat.gradient} p-4 rounded-2xl text-white text-center group hover:shadow-xl transition-all duration-300">
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 rounded-2xl"></div>
                <!-- パーティクル装飾 -->
                <div class="absolute top-2 right-2 w-6 h-6 bg-white/10 rounded-full"></div>
                <div class="absolute -bottom-2 -left-2 w-10 h-10 bg-white/5 rounded-full"></div>
                <div class="relative">
                  <span class="material-icons-outlined text-3xl mb-2 block group-hover:scale-110 transition-transform duration-300">${cat.icon}</span>
                  <div class="text-[11px] font-extrabold leading-tight">${cat.name}</div>
                  <div class="text-[9px] text-white/70 mt-0.5 font-medium">${cat.count}</div>
                </div>
              </button>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- ═══ 主催者向けCTA ═══ -->
      <section class="py-20 bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950 text-white px-4 relative overflow-hidden">
        <div class="absolute inset-0 pointer-events-none">
          <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[80px]"></div>
          <div class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[70px]"></div>
          <div style="position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,0.03) 1px,transparent 1px);background-size:32px 32px;"></div>
        </div>
        <div class="relative max-w-5xl mx-auto">
          <div class="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div class="text-center lg:text-left max-w-xl">
              <span class="section-label text-purple-300 bg-purple-500/15 border border-purple-400/25 mb-5 glass">
                <span class="material-icons-outlined text-sm">rocket_launch</span>
                For Organizers
              </span>
              <h2 class="text-3xl md:text-4xl font-black mb-4 leading-tight tracking-tight">
                イベントを<br class="hidden sm:block">主催しませんか？
              </h2>
              <p class="text-slate-300 text-base leading-relaxed">
                LinkUpならかんたんにイベントを作成・公開できます。<br>
                チケット販売から参加者管理まで、すべてワンストップで。
              </p>
              <!-- メリットリスト -->
              <ul class="mt-5 space-y-2 text-sm text-slate-300">
                ${[
                  '無料でイベント作成・公開',
                  'QRチケット自動発行',
                  'リアルタイム売上管理',
                  '参加者CSVエクスポート',
                ].map(item => `
                  <li class="flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <span class="material-icons-outlined text-blue-400" style="font-size:12px;">check</span>
                    </span>
                    ${item}
                  </li>
                `).join('')}
              </ul>
            </div>
            <div class="flex flex-col sm:flex-row lg:flex-col gap-3 flex-shrink-0">
              <button onclick="${user ? "AppRouter.go('organizer')" : "AppUI.openRegisterModal()"}"
                class="btn-primary ripple px-8 py-4 rounded-2xl font-extrabold text-base shadow-xl whitespace-nowrap flex items-center gap-2.5 justify-center text-white">
                <span class="material-icons-outlined text-xl">add_circle</span>
                ${user ? 'イベントを作成する' : '主催者として登録'}
              </button>
              <button onclick="AppRouter.go('home')"
                class="btn-secondary ripple px-8 py-4 rounded-2xl font-bold text-base glass whitespace-nowrap flex items-center gap-2.5 justify-center">
                <span class="material-icons-outlined text-xl">search</span>
                イベントを探す
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══ ユーザー向けCTA（未ログイン時のみ） ═══ -->
      ${!user ? `
      <section class="py-20 bg-white px-4 relative overflow-hidden">
        <!-- 背景装飾 -->
        <div class="absolute inset-0 pointer-events-none">
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-100/40 rounded-full blur-3xl"></div>
        </div>
        <div class="relative max-w-2xl mx-auto text-center">
          <span class="section-label text-blue-600 bg-blue-50 border border-blue-100 mb-5">
            <span class="material-icons-outlined text-sm">celebration</span>
            Get Started
          </span>
          <h2 class="text-3xl md:text-4xl font-black text-slate-900 mb-4 leading-tight tracking-tight">今すぐ始めよう</h2>
          <p class="text-slate-500 text-base mb-10 leading-relaxed">
            無料でアカウントを作成して、好きなイベントに参加しましょう。<br>
            クレジットカード不要・いつでも退会可能。
          </p>
          <div class="flex items-center justify-center gap-3 flex-wrap">
            <button onclick="AppUI.openRegisterModal()"
              class="btn-primary ripple px-8 py-3.5 rounded-2xl font-extrabold text-base shadow-lg flex items-center gap-2 text-white">
              <span class="material-icons-outlined text-xl">person_add</span>
              無料で始める
            </button>
            <button onclick="AppUI.openLoginModal()"
              class="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-base transition-all flex items-center gap-2 hover:shadow-sm">
              <span class="material-icons-outlined text-xl">login</span>
              ログイン
            </button>
          </div>
          <!-- 信頼バッジ -->
          <div class="flex items-center justify-center gap-5 mt-8 flex-wrap">
            ${[
              { icon: 'lock', text: 'セキュア決済' },
              { icon: 'verified_user', text: 'なりすまし防止' },
              { icon: 'support_agent', text: '24時間サポート' },
            ].map(b => `
              <div class="flex items-center gap-1.5 text-xs text-slate-400">
                <span class="material-icons-outlined text-slate-300 text-sm">${b.icon}</span>
                ${b.text}
              </div>
            `).join('')}
          </div>
        </div>
      </section>
      ` : ''}

      <!-- ═══ フッター ═══ -->
      <footer class="bg-slate-900 text-slate-400 border-t border-slate-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div class="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
            <!-- ブランド -->
            <div class="md:col-span-5">
              <button onclick="AppRouter.go('home')" class="flex items-center gap-2.5 mb-4 group">
                <div class="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
                  <span class="material-icons-outlined text-white" style="font-size:18px;">link</span>
                </div>
                <span class="text-2xl font-extrabold text-white tracking-tight group-hover:text-blue-300 transition-colors">LinkUp</span>
              </button>
              <p class="text-sm leading-relaxed mb-5 max-w-xs text-slate-400/80">
                人と体験をつなぐイベント・コミュニティプラットフォーム。
                テック・ビジネス・音楽・アートなど多彩なイベントが見つかります。
              </p>
              <div class="flex gap-2 flex-wrap">
                ${['安全・安心', '簡単操作', '無料登録', 'QRチケット'].map(t => `
                  <span class="bg-slate-800/80 border border-slate-700 text-xs px-3 py-1 rounded-full text-slate-300">${t}</span>
                `).join('')}
              </div>
            </div>
            <!-- サービス -->
            <div class="md:col-span-3">
              <h4 class="text-white font-bold mb-5 text-sm tracking-wider uppercase">サービス</h4>
              <ul class="space-y-3 text-sm">
                <li><button onclick="AppRouter.go('home')" class="footer-link hover:text-white transition-all"><span class="material-icons-outlined text-slate-600 text-sm">event</span>イベントを探す</button></li>
                <li><button onclick="AppUI.openRegisterModal()" class="footer-link hover:text-white transition-all"><span class="material-icons-outlined text-slate-600 text-sm">person_add</span>主催者として登録</button></li>
                <li><button onclick="AppRouter.go('dashboard')" class="footer-link hover:text-white transition-all"><span class="material-icons-outlined text-slate-600 text-sm">dashboard</span>マイページ</button></li>
                <li><button onclick="AppUI.openLoginModal()" class="footer-link hover:text-white transition-all"><span class="material-icons-outlined text-slate-600 text-sm">login</span>ログイン</button></li>
              </ul>
            </div>
            <!-- サポート -->
            <div class="md:col-span-4">
              <h4 class="text-white font-bold mb-5 text-sm tracking-wider uppercase">サポート</h4>
              <ul class="space-y-3 text-sm">
                <li><a href="mailto:support@link-up.live" class="footer-link hover:text-white transition-all"><span class="material-icons-outlined text-slate-600 text-sm">mail</span>お問い合わせ</a></li>
                <li><span class="footer-link cursor-default"><span class="material-icons-outlined text-slate-600 text-sm">description</span>利用規約</span></li>
                <li><span class="footer-link cursor-default"><span class="material-icons-outlined text-slate-600 text-sm">privacy_tip</span>プライバシーポリシー</span></li>
                <li><span class="footer-link cursor-default"><span class="material-icons-outlined text-slate-600 text-sm">store</span>特定商取引法</span></li>
              </ul>
            </div>
          </div>
          <div class="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs">
            <p class="text-slate-500">&copy; 2026 LinkUp, Inc. All rights reserved.</p>
            <p class="text-slate-600 flex items-center gap-2">
              <span class="material-icons-outlined text-slate-700" style="font-size:14px;">cloud</span>
              Powered by Cloudflare Workers &amp; D1
            </p>
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
        <div class="col-span-full text-center py-24 text-slate-400">
          <div class="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <span class="material-icons-outlined text-5xl text-slate-300">event_busy</span>
          </div>
          <p class="font-extrabold text-slate-600 mb-2 text-xl">${searchQuery ? '検索結果が見つかりませんでした' : '現在開催中のイベントはありません'}</p>
          <p class="text-slate-400 text-sm mb-6 leading-relaxed">${searchQuery ? '別のキーワードで試してみてください' : 'しばらくしてから再度お試しください'}</p>
          ${searchQuery ? `
            <button onclick="renderHome({})"
              class="btn-primary px-6 py-3 rounded-xl text-sm font-bold text-white">
              すべてのイベントを見る
            </button>
          ` : ''}
        </div>
      `;
      return;
    }

    grid.innerHTML = events.map((ev, i) => _renderEventCard(ev, i)).join('');

  } catch (err) {
    console.error('Events fetch error:', err);
    const grid = document.getElementById('events-grid');
    if (grid) {
      grid.innerHTML = `
        <div class="col-span-full text-center py-24">
          <div class="w-24 h-24 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <span class="material-icons-outlined text-5xl text-red-300">wifi_off</span>
          </div>
          <p class="text-slate-700 font-extrabold mb-2 text-xl">イベントの読み込みに失敗しました</p>
          <p class="text-slate-400 text-sm mb-6">${_escapeHtml(err.message)}</p>
          <button onclick="AppRouter.go('home')"
            class="btn-primary px-6 py-3 rounded-xl text-sm font-bold text-white">再読み込み</button>
        </div>
      `;
    }
  }
}

// ─── イベントカード（フルリデザイン）──────────────────

function _renderEventCard(ev, idx = 0) {
  const date = ev.start_datetime
    ? new Date(ev.start_datetime).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', weekday: 'short' })
    : '日時未定';
  const price = ev.price != null ? (ev.price === 0 ? '無料' : `¥${Number(ev.price).toLocaleString()}〜`) : '';
  const img = ev.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80';

  const catMap = {
    tech:      { bg: 'bg-blue-100',    text: 'text-blue-700',    dot: 'bg-blue-500',    label: 'テック',       gradient: 'from-blue-500 to-blue-600' },
    business:  { bg: 'bg-purple-100',  text: 'text-purple-700',  dot: 'bg-purple-500',  label: 'ビジネス',     gradient: 'from-purple-500 to-violet-600' },
    music:     { bg: 'bg-pink-100',    text: 'text-pink-700',    dot: 'bg-pink-500',    label: '音楽',         gradient: 'from-pink-500 to-rose-600' },
    art:       { bg: 'bg-orange-100',  text: 'text-orange-700',  dot: 'bg-orange-500',  label: 'アート',       gradient: 'from-orange-500 to-amber-500' },
    food:      { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'グルメ',       gradient: 'from-emerald-500 to-green-600' },
    sports:    { bg: 'bg-lime-100',    text: 'text-lime-700',    dot: 'bg-lime-500',    label: 'スポーツ',     gradient: 'from-lime-500 to-green-500' },
    social:    { bg: 'bg-teal-100',    text: 'text-teal-700',    dot: 'bg-teal-500',    label: 'コミュニティ', gradient: 'from-teal-500 to-cyan-600' },
    education: { bg: 'bg-indigo-100',  text: 'text-indigo-700',  dot: 'bg-indigo-500',  label: '教育',         gradient: 'from-indigo-500 to-blue-600' },
  };
  const cat = catMap[ev.category] || { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-400', label: ev.category || '', gradient: 'from-slate-500 to-slate-600' };

  const isFree = price === '無料';

  return `
    <article class="event-card bg-white rounded-2xl border border-slate-100 overflow-hidden cursor-pointer group shadow-sm hover:shadow-xl"
         onclick="AppRouter.go('detail', { id: '${_escapeHtml(ev.event_id)}' })"
         style="animation: slideUp 0.4s ease-out ${idx * 0.06}s both;">

      <!-- サムネイル -->
      <div class="relative overflow-hidden bg-slate-100" style="height: 192px;">
        <img src="${_escapeHtml(img)}" alt="${_escapeHtml(ev.title)}"
          class="card-img w-full h-full object-cover"
          loading="lazy"
          onerror="this.src='https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80'">

        <!-- グラデーションオーバーレイ -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>

        <!-- バッジ群 -->
        <div class="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          ${cat.label ? `
            <span class="px-2.5 py-1 rounded-full text-[11px] font-bold ${cat.bg} ${cat.text} shadow-sm">
              ${cat.label}
            </span>
          ` : ''}
        </div>
        ${isFree ? `
          <span class="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500 text-white shadow-md">
            FREE
          </span>
        ` : (price ? `
          <span class="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-white/95 text-slate-800 shadow-md">
            ${price}
          </span>
        ` : '')}

        <!-- ホバー時の詳細ボタン -->
        <div class="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <div class="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2.5 flex items-center justify-center gap-1.5 text-xs font-bold text-blue-600 shadow-lg">
            <span class="material-icons-outlined text-sm">open_in_new</span>
            詳細を見る
          </div>
        </div>
      </div>

      <!-- コンテンツ -->
      <div class="p-4 flex flex-col gap-3">
        <!-- タイトル -->
        <h3 class="font-extrabold text-slate-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors duration-200 leading-snug" style="min-height: 2.5em;">
          ${_escapeHtml(ev.title)}
        </h3>

        <!-- メタ情報 -->
        <div class="space-y-1.5">
          <div class="flex items-center gap-2 text-xs text-slate-500">
            <span class="material-icons-outlined text-[15px] text-blue-400 flex-shrink-0">calendar_today</span>
            <span class="font-semibold text-slate-600">${date}</span>
          </div>
          <div class="flex items-center gap-2 text-xs text-slate-500">
            <span class="material-icons-outlined text-[15px] text-blue-400 flex-shrink-0">location_on</span>
            <span class="truncate">${_escapeHtml(ev.venue_name || (ev.is_online ? 'オンライン' : '会場未定'))}</span>
          </div>
        </div>

        <!-- フッター: 主催者 + アクション -->
        ${ev.organizer_name ? `
        <div class="flex items-center justify-between pt-3 border-t border-slate-50">
          <div class="flex items-center gap-2 min-w-0">
            <div class="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
              <span class="material-icons-outlined text-white" style="font-size:11px;">person</span>
            </div>
            <span class="text-xs text-slate-400 truncate">${_escapeHtml(ev.organizer_name)}</span>
          </div>
          <div class="flex items-center gap-1 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
            <span class="text-xs font-bold">詳細</span>
            <span class="material-icons-outlined text-sm">chevron_right</span>
          </div>
        </div>
        ` : ''}
      </div>
    </article>
  `;
}
