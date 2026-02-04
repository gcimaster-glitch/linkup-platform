        function renderHome(container) {
            try {
                const heroSlides = [
                    { img: IMGS.festival, title: "SUMMER SONIC 2026", sub: "今年も熱い夏がやってくる。先行チケット発売中！", tag: "FESTIVAL", cta: "チケットを探す" },
                    { img: IMGS.tech, title: "AI Developers Summit", sub: "生成AIの最前線を体感せよ。", tag: "CONFERENCE", cta: "セッション一覧" },
                    { img: IMGS.startups, title: "Startup Weekend Tokyo", sub: "54時間で起業体験。", tag: "BUSINESS", cta: "参加登録" },
                    { img: IMGS.food, title: "Gourmet Fes 2026", sub: "全国の美食が集結。", tag: "FOOD", cta: "クーポンGET" },
                    { img: IMGS.art, title: "Design Week", sub: "クリエイティビティの祭典。", tag: "ART", cta: "ギャラリーを見る" }
                ];
                
                const quickNav = [
                    { icon: 'today', label: '今日行く', color: 'bg-pink-100 text-pink-600', query: 'today' },
                    { icon: 'calendar_month', label: '週末', color: 'bg-purple-100 text-purple-600', query: 'weekend' },
                    { icon: 'local_fire_department', label: '人気', color: 'bg-orange-100 text-orange-600', query: 'popular' },
                    { icon: 'group', label: '交流会', color: 'bg-blue-100 text-blue-600', query: 'social' },
                    { icon: 'music_note', label: '音楽', color: 'bg-teal-100 text-teal-600', query: 'music' },
                    { icon: 'restaurant', label: 'グルメ', color: 'bg-yellow-100 text-yellow-600', query: 'food' },
                    { icon: 'school', label: '学び', color: 'bg-indigo-100 text-indigo-600', query: 'tech' },
                    { icon: 'sports_esports', label: 'ゲーム', color: 'bg-red-100 text-red-600', query: 'game' },
                ];

                // Build Events HTML safely
                let eventsSectionHtml = '';
                if (store.events && store.events.length > 0) {
                    const featured = store.events[0];
                    const others = store.events.slice(1, 5);
                    
                    eventsSectionHtml = `
                        <section>
                            <div class="flex items-center justify-between mb-6">
                                <h2 class="text-2xl font-bold text-slate-800 flex items-center">
                                    <span class="w-1.5 h-8 bg-primary rounded-full mr-3"></span>
                                    今週末の注目イベント
                                </h2>
                                <a href="#" class="text-primary text-sm font-bold hover:underline flex items-center">
                                    全て見る <span class="material-icons-outlined text-sm ml-1">arrow_forward</span>
                                </a>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[300px]">
                                <!-- Large Featured Item -->
                                <div class="lg:col-span-2 lg:row-span-2 relative rounded-2xl overflow-hidden group cursor-pointer shadow-card hover:shadow-2xl transition" onclick="router('detail', {id: '${featured.event_id}'})">
                                    <img src="${featured.cover_image_url}" class="w-full h-full object-cover group-hover:scale-105 transition duration-700">
                                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                    <div class="absolute bottom-0 left-0 p-8 text-white">
                                        <span class="bg-primary px-3 py-1 rounded-full text-xs font-bold mb-3 inline-block">FEATURED</span>
                                        <h3 class="text-3xl font-bold mb-2 leading-tight">${featured.title}</h3>
                                        <p class="text-slate-300 line-clamp-2 mb-4 text-sm">${featured.venue_name} • ${new Date(featured.start_datetime).toLocaleDateString()}</p>
                                        <div class="flex items-center space-x-4">
                                            <span class="font-bold text-xl">¥${featured.price.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Regular Items -->
                                ${others.map(evt => `
                                    <div class="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-xl transition group cursor-pointer flex flex-col" onclick="router('detail', {id: '${evt.event_id}'})">
                                        <div class="h-40 relative overflow-hidden">
                                            <img src="${evt.cover_image_url}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                                            <div class="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-[10px] font-bold shadow-sm">${evt.category}</div>
                                        </div>
                                        <div class="p-4 flex-1 flex flex-col">
                                            <div class="text-[10px] text-primary font-bold mb-1">${new Date(evt.start_datetime).toLocaleDateString()}</div>
                                            <h4 class="font-bold text-slate-800 leading-snug line-clamp-2 mb-2 group-hover:text-primary transition">${evt.title}</h4>
                                            <div class="mt-auto flex items-center justify-between">
                                                <span class="text-sm font-bold text-slate-700">¥${evt.price.toLocaleString()}</span>
                                                <div class="flex items-center text-xs text-slate-400">
                                                    <span class="material-icons-outlined text-[12px] mr-1">place</span>${evt.venue_name.split(' ')[0]}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </section>
                    `;
                } else {
                    eventsSectionHtml = `
                        <div class="py-24 text-center">
                            <div class="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span class="material-icons-outlined text-5xl text-slate-300">event_busy</span>
                            </div>
                            <h2 class="text-2xl font-bold text-slate-800 mb-2">現在開催予定のイベントはありません</h2>
                            <p class="text-slate-500 mb-8">新しいイベントの公開をお待ちください。</p>
                            <button onclick="openCreateModal()" class="px-8 py-3 bg-primary text-white font-bold rounded-full shadow-lg hover:bg-blue-600 transition">
                                最初のイベントを作成する
                            </button>
                        </div>
                    `;
                }

                let html = `
                    <!-- Hero Section with Improved CTA -->
                    <div class="relative bg-dark h-[400px] md:h-[550px] overflow-hidden group">
                        <img src="${heroSlides[0].img}" class="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition duration-1000" id="hero-img">
                        <div class="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/40 to-transparent"></div>
                        <div class="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10 flex flex-col items-start justify-end h-full">
                            <div class="max-w-7xl mx-auto w-full">
                                <span class="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider text-white bg-accent rounded-full animate-fade-in-up" id="hero-tag">${heroSlides[0].tag}</span>
                                <h1 class="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight leading-tight animate-fade-in-up delay-100" id="hero-title">${heroSlides[0].title}</h1>
                                <p class="text-slate-200 text-lg md:text-xl mb-8 max-w-2xl font-medium animate-fade-in-up delay-200" id="hero-sub">${heroSlides[0].sub}</p>
                                <button id="hero-cta" class="bg-primary hover:bg-blue-600 text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-blue-900/30 transition transform hover:-translate-y-1 hover:shadow-xl flex items-center animate-fade-in-up delay-300">
                                    <span>${heroSlides[0].cta}</span>
                                    <span class="material-icons-outlined ml-2">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                        
                        <!-- Slide Indicators -->
                        <div class="absolute bottom-8 right-8 flex space-x-3 z-20">
                            ${heroSlides.map((_, i) => `
                                <div class="w-2.5 h-2.5 rounded-full ${i===0 ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'} cursor-pointer transition-all duration-300" onclick="changeSlide(${i})"></div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Smart Filter Bar (Sticky) -->
                    <div class="sticky top-16 z-[60] bg-white border-b border-slate-200 shadow-sm py-3 transition-all backdrop-blur-md bg-white/95">
                        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                            <!-- Left: Fixed Actions -->
                            <div class="flex items-center space-x-4 flex-shrink-0">
                                <!-- Date Picker Trigger -->
                                <div class="relative group">
                                    <button onclick="toggleDatePanel()" class="flex items-center space-x-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full hover:bg-white hover:border-primary hover:text-primary hover:shadow-md transition text-sm font-bold text-slate-700 min-w-max">
                                        <span class="material-icons-outlined text-sm">calendar_today</span>
                                        <span>日付を選択</span>
                                    </button>
                                    <!-- Date Popover (Hidden by default) -->
                                    <div id="date-panel" class="absolute top-12 left-0 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 p-4 hidden z-[70] animate-fade-in-down">
                                        <div class="flex justify-between items-center mb-4">
                                            <h4 class="font-bold text-slate-800">日付で絞り込む</h4>
                                            <button onclick="toggleDatePanel()" class="text-slate-400 hover:text-slate-600"><span class="material-icons-outlined text-sm">close</span></button>
                                        </div>
                                        <div class="grid grid-cols-2 gap-2 mb-4">
                                            <button onclick="renderEventListOnly('today'); toggleDatePanel()" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-600 text-center">今日</button>
                                            <button onclick="renderEventListOnly('tomorrow'); toggleDatePanel()" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-600 text-center">明日</button>
                                            <button onclick="renderEventListOnly('weekend'); toggleDatePanel()" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-600 text-center">今週末</button>
                                            <button onclick="renderEventListOnly('next_week'); toggleDatePanel()" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-600 text-center">来週</button>
                                        </div>
                                        <div class="border-t border-slate-100 pt-4">
                                            <p class="text-xs text-slate-400 mb-2">カレンダーから選択</p>
                                            <div class="grid grid-cols-7 gap-1 text-center text-xs">
                                                <span class="text-red-400 font-bold">日</span><span>月</span><span>火</span><span>水</span><span>木</span><span>金</span><span class="text-blue-400 font-bold">土</span>
                                                ${Array.from({length: 31}, (_, i) => `<div class="p-1.5 hover:bg-primary hover:text-white rounded-full cursor-pointer transition">${i+1}</div>`).join('')}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="h-6 w-px bg-slate-200"></div>

                                <!-- Map Toggle -->
                                <button onclick="toggleMapView()" id="map-toggle-btn" class="flex items-center space-x-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full hover:bg-white hover:border-primary hover:text-primary hover:shadow-md transition text-sm font-bold text-slate-700 min-w-max">
                                    <span class="material-icons-outlined text-sm">map</span>
                                    <span>地図から探す</span>
                                </button>
                                
                                <div class="h-6 w-px bg-slate-200 hidden md:block"></div>
                            </div>

                            <!-- Right: Scrollable Categories -->
                            <div class="flex-1 overflow-x-auto scrollbar-hide ml-4 mask-fade-right">
                                <div class="flex space-x-2">
                                    ${quickNav.map(nav => `
                                        <button onclick="renderEventListOnly('${nav.query}')" class="px-4 py-2 bg-white border border-slate-100 rounded-full hover:border-slate-300 hover:shadow-sm transition text-xs font-bold text-slate-600 flex items-center min-w-max whitespace-nowrap group">
                                            <span class="material-icons-outlined text-sm mr-1 ${nav.color.split(' ')[1]} group-hover:scale-110 transition-transform">${nav.icon}</span>
                                            ${nav.label}
                                        </button>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Map View Overlay (Initially Hidden) -->
                    <div id="full-map-view" class="hidden fixed inset-0 z-[100] bg-slate-50 flex flex-col">
                        <!-- Map Header -->
                        <div class="bg-white shadow-md z-[110] px-4 py-3 flex justify-between items-center relative">
                            <div class="flex items-center">
                                <button onclick="toggleMapView()" class="mr-4 p-2 rounded-full hover:bg-slate-100 text-slate-500">
                                    <span class="material-icons-outlined">arrow_back</span>
                                </button>
                                
                                <!-- Map Search Bar -->
                                <div class="bg-slate-100 rounded-full px-4 py-2 flex items-center w-64 md:w-80">
                                    <span class="material-icons-outlined text-slate-400 mr-2">search</span>
                                    <input type="text" placeholder="エリアやランドマークで検索" class="bg-transparent border-none outline-none text-sm w-full font-bold text-slate-700">
                                </div>
                            </div>
                            
                            <div class="flex items-center space-x-2">
                                <button class="hidden md:flex px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-sm">
                                    <span class="material-icons-outlined text-sm mr-1">filter_list</span> フィルター
                                </button>
                                <button class="px-4 py-2 bg-primary text-white rounded-full text-sm font-bold shadow-md hover:bg-blue-600 transition flex items-center" onclick="toggleMapView()">
                                    <span class="material-icons-outlined text-sm mr-1">list</span> リスト表示
                                </button>
                            </div>
                        </div>

                        <!-- Map Container -->
                        <div class="flex-1 relative">
                            <div id="large-real-map" class="w-full h-full z-0"></div>
                            
                            <!-- Floating "Search in this area" button (Airbnb style) -->
                            <div class="absolute top-4 left-1/2 transform -translate-x-1/2 z-[400]">
                                <button class="px-4 py-2 bg-white text-slate-800 rounded-full shadow-lg font-bold text-xs flex items-center hover:scale-105 transition transform animate-fade-in-up">
                                    <span class="material-icons-outlined text-sm mr-1">refresh</span> このエリアで検索
                                </button>
                            </div>

                            <!-- Bottom Carousel for Map Items -->
                            <div class="absolute bottom-8 left-0 w-full z-[400] px-4 overflow-x-auto scrollbar-hide pb-4">
                                <div class="flex space-x-4 w-max px-2" id="map-carousel">
                                    <!-- Cards injected dynamically based on map bounds -->
                                    ${store.events.slice(0,5).map(evt => `
                                        <div class="bg-white w-72 rounded-xl shadow-xl overflow-hidden flex-shrink-0 cursor-pointer hover:-translate-y-1 transition transform" onclick="router('detail', {id:'${evt.event_id}'})">
                                            <div class="h-32 relative">
                                                <img src="${evt.cover_image_url}" class="w-full h-full object-cover">
                                                <div class="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-[10px] font-bold shadow-sm">${evt.category}</div>
                                            </div>
                                            <div class="p-3">
                                                <h4 class="font-bold text-slate-800 text-sm line-clamp-1 mb-1">${evt.title}</h4>
                                                <p class="text-xs text-slate-500 mb-2">${evt.venue_name}</p>
                                                <div class="flex justify-between items-center">
                                                    <span class="font-bold text-slate-900">¥${evt.price.toLocaleString()}</span>
                                                    <div class="flex items-center text-[10px] text-yellow-500 font-bold">
                                                        <span class="material-icons-outlined text-[12px] mr-0.5">star</span> ${evt.organizer_rating}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Main Content Layout (Magazine Style) -->
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
                        
                        ${eventsSectionHtml}

                        <!-- Section 2: PR / Ad Banner (In-feed style) -->
                        <section class="max-w-5xl mx-auto">
                            <div class="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden shadow-2xl group cursor-pointer">
                                <div class="absolute top-0 right-0 p-4 opacity-10">
                                    <span class="material-icons-outlined text-9xl">campaign</span>
                                </div>
                                <span class="bg-white/20 text-xs font-bold px-2 py-1 rounded mb-4 inline-block">PR</span>
                                <h3 class="text-2xl md:text-3xl font-bold mb-4">イベント主催者になりませんか？</h3>
                                <p class="text-slate-300 mb-8 max-w-2xl mx-auto">LinkUpなら、手数料0円であなたのコミュニティを収益化できます。<br>分析ツールから集客サポートまで、全てが揃っています。</p>
                                <button class="bg-white text-slate-900 px-8 py-3 rounded-full font-bold hover:bg-slate-100 transition shadow-lg transform group-hover:-translate-y-1">
                                    今すぐ無料で始める
                                </button>
                            </div>
                            <!-- New Ad Slots -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                <div class="bg-white border border-slate-200 rounded-xl p-4 flex items-center shadow-sm cursor-pointer hover:shadow-md transition">
                                    <div class="bg-slate-100 w-16 h-16 rounded-lg flex items-center justify-center mr-4 text-slate-400">
                                        <span class="material-icons-outlined">ad_units</span>
                                    </div>
                                    <div>
                                        <p class="text-[10px] text-slate-400 font-bold border border-slate-200 inline-block px-1 rounded mb-1">広告</p>
                                        <h4 class="font-bold text-slate-800 text-sm">イベント保険なら「EventSafe」</h4>
                                        <p class="text-xs text-slate-500">予期せぬ中止に備える、主催者のための保険。</p>
                                    </div>
                                </div>
                                <div class="bg-white border border-slate-200 rounded-xl p-4 flex items-center shadow-sm cursor-pointer hover:shadow-md transition">
                                    <div class="bg-slate-100 w-16 h-16 rounded-lg flex items-center justify-center mr-4 text-slate-400">
                                        <span class="material-icons-outlined">print</span>
                                    </div>
                                    <div>
                                        <p class="text-[10px] text-slate-400 font-bold border border-slate-200 inline-block px-1 rounded mb-1">広告</p>
                                        <h4 class="font-bold text-slate-800 text-sm">フライヤー印刷が最大50%OFF</h4>
                                        <p class="text-xs text-slate-500">LinkUp会員限定の特別クーポン配布中。</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <!-- Section 3: New Arrivals (Horizontal Scroll) -->
                        <section>
                            <div class="flex items-center justify-between mb-6">
                                <h2 class="text-2xl font-bold text-slate-800">新着イベント</h2>
                                <div class="flex space-x-2">
                                    <button class="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition"><span class="material-icons-outlined text-sm">chevron_left</span></button>
                                    <button class="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition"><span class="material-icons-outlined text-sm">chevron_right</span></button>
                                </div>
                            </div>
                            
                            <div class="flex space-x-6 overflow-x-auto scrollbar-hide pb-8 -mx-4 px-4 snap-x">
                                ${store.events.slice(5, 12).sort((a,b) => new Date(b.start_datetime) - new Date(a.start_datetime)).map(evt => `
                                    <div class="min-w-[280px] md:min-w-[320px] snap-start bg-white rounded-2xl shadow-card hover:shadow-xl transition cursor-pointer group flex flex-col" onclick="router('detail', {id: '${evt.event_id}'})">
                                        <div class="h-44 relative overflow-hidden rounded-t-2xl">
                                            <img src="${evt.cover_image_url}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                                            <div class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-4">
                                                <span class="text-white text-xs font-bold flex items-center">
                                                    <span class="material-icons-outlined text-sm mr-1">schedule</span> ${new Date(evt.start_datetime).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div class="p-5 flex-1 flex flex-col">
                                            <div class="flex space-x-2 mb-2">
                                                <span class="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold uppercase">${evt.category}</span>
                                            </div>
                                            <h4 class="font-bold text-slate-800 text-lg leading-snug mb-2 line-clamp-2 group-hover:text-primary transition">${evt.title}</h4>
                                            <p class="text-xs text-slate-500 mb-4 line-clamp-1">${evt.venue_name}</p>
                                            <div class="mt-auto border-t border-slate-100 pt-3 flex justify-between items-center">
                                                <div class="flex items-center space-x-2">
                                                    <img src="https://i.pravatar.cc/150?u=${evt.organizer_name}" class="w-6 h-6 rounded-full">
                                                    <span class="text-xs text-slate-600 truncate max-w-[100px]">${evt.organizer_name}</span>
                                                </div>
                                                <span class="font-bold text-slate-800">¥${evt.price.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </section>

                        <!-- Section 4: Ranking / Recommendations -->
                        <section class="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div class="md:col-span-2">
                                <h2 class="text-2xl font-bold text-slate-800 mb-6">あなたへのおすすめ</h2>
                                <div id="event-list-container" class="space-y-4">
                                    <!-- List style items injected here -->
                                    ${store.events.slice(12, 16).map(evt => `
                                        <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex hover:shadow-md transition cursor-pointer group" onclick="router('detail', {id: '${evt.event_id}'})">
                                            <div class="w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden relative">
                                                <img src="${evt.cover_image_url}" class="w-full h-full object-cover group-hover:scale-105 transition">
                                            </div>
                                            <div class="ml-4 flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div class="flex justify-between items-start">
                                                        <h4 class="font-bold text-slate-800 line-clamp-1 group-hover:text-primary transition">${evt.title}</h4>
                                                        <button class="text-slate-300 hover:text-pink-500"><span class="material-icons-outlined text-lg">favorite_border</span></button>
                                                    </div>
                                                    <p class="text-xs text-slate-500 mt-1">${new Date(evt.start_datetime).toLocaleDateString()} • ${evt.venue_name}</p>
                                                </div>
                                                <div class="flex justify-between items-end">
                                                    <span class="inline-block bg-slate-100 text-[10px] px-2 py-0.5 rounded text-slate-500 font-bold">${evt.category}</span>
                                                    <span class="font-bold text-slate-800">¥${evt.price.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                                <button class="w-full mt-6 py-3 border border-slate-300 rounded-full font-bold text-slate-600 hover:bg-slate-50 transition">もっと見る</button>
                            </div>
                            
                            <div class="md:col-span-1">
                                <div class="bg-white rounded-2xl shadow-card p-6 border border-slate-100 sticky top-24">
                                    <h3 class="font-bold text-lg mb-4 flex items-center">
                                        <span class="material-icons-outlined text-yellow-500 mr-2">emoji_events</span> 人気ランキング
                                    </h3>
                                    <div class="space-y-5">
                                        ${store.events.slice(0, 5).sort((a,b) => b.organizer_rating - a.organizer_rating).map((evt, idx) => `
                                            <div class="flex items-center cursor-pointer group" onclick="router('detail', {id: '${evt.event_id}'})">
                                                <span class="text-2xl font-bold text-slate-300 w-8 italic mr-2 group-hover:text-primary transition">${idx + 1}</span>
                                                <div class="flex-1">
                                                    <h4 class="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-primary transition">${evt.title}</h4>
                                                    <p class="text-[10px] text-slate-500">${evt.category} • ${evt.venue_name}</p>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                `;
                
                container.innerHTML = html;
                
                // Note: renderEventListOnly is partially redundant now as we hardcoded sections for "Discovery" feel,
                // but we keep it for Filter Bar interactions which might replace specific grid areas.
                // For this Platinum v7, we assume Filter Bar actions might reset the main view to a list.
                
                // Carousel Logic
                let slideIdx = 0;
                const heroTitle = document.getElementById('hero-title');
                const heroSub = document.getElementById('hero-sub');
                const heroTag = document.getElementById('hero-tag');
                const heroImg = document.getElementById('hero-img');
                const heroCtaBtn = document.getElementById('hero-cta');
                
                // Simple slide change function attached to window for indicators
                window.changeSlide = (idx) => {
                    slideIdx = idx;
                    updateSlide();
                };

                const updateSlide = () => {
                    const slide = heroSlides[slideIdx];
                    if(heroImg) {
                        heroImg.style.opacity = '0.4';
                        setTimeout(() => { 
                            heroImg.src = slide.img; 
                            heroImg.style.opacity = '0.6';
                        }, 200);
                    }
                    if(heroTitle) heroTitle.innerText = slide.title;
                    if(heroSub) heroSub.innerText = slide.sub;
                    if(heroTag) heroTag.innerText = slide.tag;
                    if(heroCtaBtn) heroCtaBtn.querySelector('span').innerText = slide.cta;
                };
                
                setInterval(() => {
                    slideIdx = (slideIdx + 1) % heroSlides.length;
                    updateSlide();
                }, 6000); // Slower for readability
            } catch (e) {
                console.error("renderHome error:", e);
                container.innerHTML = `<div class="p-12 text-center text-red-500">エラーが発生しました: ${e.message}</div>`;
            }
        }

        // New Logic for Smart Filters
        function toggleDatePanel() {
            const panel = document.getElementById('date-panel');
            if (panel.classList.contains('hidden')) {
                panel.classList.remove('hidden');
            } else {
                panel.classList.add('hidden');
            }
        }

        function toggleMapView() {
            const view = document.getElementById('full-map-view');
            const btn = document.getElementById('map-toggle-btn');
            
            if (view.classList.contains('hidden')) {
                view.classList.remove('hidden');
                document.body.style.overflow = 'hidden'; // Prevent body scroll
                
                // Init Map if not already
                if (!window.fullMapInitialized) {
                    setTimeout(() => {
                        const map = L.map('large-real-map').setView([35.6895, 139.6917], 13);
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '&copy; OpenStreetMap contributors'
                        }).addTo(map);

                        store.events.forEach((evt) => {
                            const lat = evt.lat || (35.6895 + (Math.random() - 0.5) * 0.05);
                            const lng = evt.lng || (139.6917 + (Math.random() - 0.5) * 0.05);
                            
                            // Custom Icon with Price
                            const priceText = evt.price === 0 ? '無料' : `¥${evt.price.toLocaleString()}`;
                            const icon = L.divIcon({
                                className: 'custom-price-marker',
                                html: `
                                    <div class="relative group">
                                        <div class="bg-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-slate-200 hover:bg-primary hover:text-white hover:scale-110 transition flex items-center justify-center whitespace-nowrap">
                                            ${priceText}
                                        </div>
                                        <div class="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white shadow-sm"></div>
                                    </div>
                                `,
                                iconSize: [60, 30],
                                iconAnchor: [30, 36]
                            });

                            const marker = L.marker([lat, lng], {icon: icon}).addTo(map);
                            marker.bindPopup(`
                                <div class="p-0 w-48">
                                    <img src="${evt.cover_image_url}" class="w-full h-24 object-cover rounded-t-lg">
                                    <div class="p-3">
                                        <h4 class="font-bold text-sm mb-1 line-clamp-1">${evt.title}</h4>
                                        <p class="text-xs text-slate-500 mb-2">${new Date(evt.start_datetime).toLocaleDateString()}</p>
                                        <div class="flex justify-between items-center">
                                            <span class="font-bold text-slate-800 text-xs">¥${evt.price.toLocaleString()}</span>
                                            <button onclick="toggleMapView(); router('detail', {id:'${evt.event_id}'})" class="bg-primary text-white text-xs px-2 py-1 rounded">詳細</button>
                                        </div>
                                    </div>
                                </div>
                            `);
                        });
                        window.fullMapInitialized = true;
                    }, 100);
                }
                
                btn.classList.add('bg-primary', 'text-white', 'border-transparent');
                btn.classList.remove('bg-white', 'text-slate-700', 'border-slate-300');
            } else {
                view.classList.add('hidden');
                document.body.style.overflow = ''; // Restore scroll
                btn.classList.remove('bg-primary', 'text-white', 'border-transparent');
                btn.classList.add('bg-white', 'text-slate-700', 'border-slate-300');
            }
        }

        function renderEventListOnly(filter = '', sort = 'recommend') {
            const container = document.getElementById('event-list-container');
            if(!container) return;
            
            let events = store.events;
            const kw = filter.toLowerCase();
            
            if (kw) {
                events = events.filter(evt => 
                    evt.title.toLowerCase().includes(kw) || 
                    evt.venue_name.toLowerCase().includes(kw) || 
                    evt.category.toLowerCase().includes(kw) ||
                    (kw === 'today' && new Date(evt.start_datetime).getDate() === new Date().getDate()) ||
                    (kw === 'popular' && parseFloat(evt.organizer_rating) > 4.5)
                );
            }
            
            if (sort === 'newest') {
                events.sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime));
            } else {
                events.sort((a, b) => 0.5 - Math.random());
            }
            
            if (events.length === 0) {
                container.innerHTML = `<div class="col-span-3 text-center py-12 text-slate-400">該当するイベントが見つかりませんでした。</div>`;
                return;
            }

            container.innerHTML = events.map(evt => `
                <div class="bg-white rounded-xl shadow-card overflow-hidden hover:shadow-xl transition duration-300 group cursor-pointer border border-slate-100 flex flex-col h-full" onclick="router('detail', {id: '${evt.event_id}'})">
                    <div class="relative h-48 overflow-hidden">
                        <img src="${evt.cover_image_url}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                        <div class="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold text-slate-700 shadow-sm uppercase tracking-wide">
                            ${evt.category}
                        </div>
                        ${evt.price === 0 ? '<div class="absolute bottom-3 left-3 bg-accent text-white px-2 py-1 rounded text-xs font-bold shadow-sm">無料</div>' : ''}
                    </div>
                    <div class="p-5 flex-1 flex flex-col">
                        <!-- Date & Time Row -->
                        <div class="flex items-center text-xs text-slate-500 font-bold mb-2">
                            <span class="material-icons-outlined text-sm mr-1 text-primary">calendar_today</span>
                            ${new Date(evt.start_datetime).toLocaleDateString()}
                            <span class="mx-2 text-slate-300">|</span>
                            <span class="material-icons-outlined text-sm mr-1 text-primary">schedule</span>
                            ${new Date(evt.start_datetime).getHours()}:00
                        </div>

                        <!-- Title -->
                        <h3 class="font-bold text-lg text-slate-800 mb-3 line-clamp-2 leading-snug group-hover:text-primary transition">${evt.title}</h3>

                        <!-- Venue & Tags -->
                        <div class="mb-4 space-y-2">
                            <div class="flex items-center text-xs text-slate-600">
                                <span class="material-icons-outlined text-sm mr-1.5 text-slate-400">
                                    ${evt.venue_name.includes('オンライン') ? 'laptop' : 'location_on'}
                                </span>
                                <span class="truncate">${evt.venue_name}</span>
                            </div>
                            <div class="flex flex-wrap gap-2">
                                <span class="px-2 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">
                                    ${evt.category}
                                </span>
                                <span class="px-2 py-1 rounded-md text-[10px] font-bold ${evt.price === 0 ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}">
                                    ${evt.price === 0 ? '無料' : '有料'}
                                </span>
                            </div>
                        </div>

                        <div class="mt-auto pt-4 border-t border-slate-100">
                            <!-- Organizer & Price Area -->
                            <div class="flex items-center justify-between mb-3">
                                <span class="font-bold text-slate-800 text-lg">¥${evt.price.toLocaleString()}~</span>
                                <div class="flex text-yellow-500 text-xs font-bold items-center bg-yellow-50 px-2 py-1 rounded">
                                    <span class="material-icons-outlined text-[14px] mr-1">star</span>
                                    ${evt.organizer_rating}
                                </div>
                            </div>
                            
                            <!-- Organizer Card (Clickable Area) -->
                            <div class="flex items-center bg-slate-50 hover:bg-slate-100 p-3 rounded-lg cursor-pointer transition group-org" onclick="event.stopPropagation(); router('organizer_profile', {id: '${evt.organizer_name}'})">
                                <div class="relative">
                                    <img src="https://i.pravatar.cc/150?u=${evt.organizer_name}" class="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover">
                                    <div class="absolute -bottom-1 -right-1 bg-blue-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border border-white">
                                        <span class="material-icons-outlined text-[8px]">check</span>
                                    </div>
                                </div>
                                <div class="ml-3 flex-1 min-w-0">
                                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Organizer</p>
                                    <p class="text-sm font-bold text-slate-700 truncate group-org-hover:text-primary transition">${evt.organizer_name}</p>
                                </div>
                                <span class="material-icons-outlined text-slate-300 text-sm group-org-hover:text-primary group-org-hover:translate-x-1 transition">chevron_right</span>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }
