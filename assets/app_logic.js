        function router(view, params = {}) {
            const app = document.getElementById('app');
            window.scrollTo(0, 0);

            if (view === 'home') renderHome(app);
            else if (view === 'detail') renderDetail(app, params.id);
            else if (view === 'dashboard') {
                if(!store.user) { openAuthModal(); return; }
                renderDashboard(app);
            }
            else if (view === 'checkout_session') renderStripeMock(app);
            else if (view === 'organizer_profile') renderOrganizerProfile(app, params.id);
            else if (view === 'organizer') renderOrganizer(app);
            else if (view === 'admin') renderAdmin(app);
            
            updateNav();
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
                        <div class="text-xs text-primary font-bold mb-1 flex items-center">
                            <span class="material-icons-outlined text-[14px] mr-1">schedule</span>
                            ${new Date(evt.start_datetime).toLocaleDateString()}
                        </div>
                        <h3 class="font-bold text-lg text-slate-800 mb-2 line-clamp-2 leading-snug group-hover:text-primary transition">${evt.title}</h3>
                        <div class="text-slate-500 text-sm mb-4 flex items-start line-clamp-1">
                            <span class="material-icons-outlined text-[16px] mr-1 mt-0.5">place</span>
                            ${evt.venue_name}
                        </div>
                        <div class="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                            <div class="flex items-center cursor-pointer hover:bg-slate-50 p-1 -ml-1 rounded transition" onclick="event.stopPropagation(); router('organizer_profile', {id: '${evt.organizer_name}'})">
                                <div class="w-6 h-6 rounded-full bg-slate-200 mr-2 overflow-hidden"><img src="https://i.pravatar.cc/150?u=${evt.organizer_name}" class="w-full h-full object-cover"></div>
                                <span class="text-xs text-slate-500 truncate max-w-[100px] hover:text-primary hover:underline">${evt.organizer_name}</span>
                            </div>
                            <span class="font-bold text-slate-800 text-sm">¥${evt.price.toLocaleString()}~</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        function renderDetail(container, id) {
            const event = store.events.find(e => e.event_id === id);
            if (!event) return renderHome(container); 
            
            const isFollowing = store.followedOrganizers.includes(event.organizer_name);
            const recommendations = store.events.filter(e => e.event_id !== id).sort(() => 0.5 - Math.random()).slice(0, 3);

            container.innerHTML = `
                <div class="bg-white border-b border-slate-200">
                    <div class="max-w-7xl mx-auto px-4 py-3 text-sm text-slate-500 flex items-center">
                        <span class="cursor-pointer hover:text-primary" onclick="router('home')">ホーム</span>
                        <span class="material-icons-outlined text-xs mx-2">chevron_right</span>
                        <span class="cursor-pointer hover:text-primary" onclick="router('home')">${event.category}</span>
                        <span class="material-icons-outlined text-xs mx-2">chevron_right</span>
                        <span class="truncate max-w-xs">${event.title}</span>
                    </div>
                </div>

                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div class="lg:col-span-2 space-y-8">
                            <div class="bg-white rounded-2xl shadow-card overflow-hidden">
                                <img src="${event.cover_image_url}" class="w-full h-64 md:h-96 object-cover">
                                <div class="p-6 md:p-8">
                                    <span class="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider text-primary bg-blue-50 rounded-full uppercase">${event.category}</span>
                                    <h1 class="text-3xl font-bold text-slate-900 mb-4 leading-tight">${event.title}</h1>
                                    
                                    <div class="flex items-center space-x-6 text-slate-600 mb-8 pb-8 border-b border-slate-100">
                                        <div class="flex items-center">
                                            <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mr-3">
                                                <span class="material-icons-outlined">calendar_today</span>
                                            </div>
                                            <div>
                                                <p class="text-xs text-slate-400">日時</p>
                                                <p class="font-bold text-sm">${new Date(event.start_datetime).toLocaleDateString()} ${new Date(event.start_datetime).getHours()}:00</p>
                                            </div>
                                        </div>
                                        <div class="flex items-center">
                                            <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mr-3">
                                                <span class="material-icons-outlined">place</span>
                                            </div>
                                            <div>
                                                <p class="text-xs text-slate-400">会場</p>
                                                <p class="font-bold text-sm">${event.venue_name}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <h2 class="text-xl font-bold mb-4 flex items-center"><span class="w-1 h-6 bg-primary mr-3 rounded-full"></span>イベント詳細</h2>
                                    <div class="text-slate-600 leading-relaxed space-y-4">
                                        ${event.description}
                                    </div>
                                </div>
                            </div>
                            
                            <div class="bg-white rounded-2xl shadow-card p-6 flex items-center justify-between border border-slate-100">
                                <div class="flex items-center cursor-pointer" onclick="router('organizer_profile', {id: '${event.organizer_name}'})">
                                    <img src="https://i.pravatar.cc/150?u=${event.organizer_name}" class="w-14 h-14 rounded-full mr-4 border-2 border-slate-100">
                                    <div>
                                        <p class="text-xs text-slate-400 mb-1">主催者</p>
                                        <h3 class="font-bold text-lg hover:text-primary transition">${event.organizer_name}</h3>
                                        <div class="flex items-center text-xs text-yellow-500">
                                            <span class="material-icons-outlined text-sm">star</span>
                                            <span class="ml-1 font-bold text-slate-700">${event.organizer_rating}</span>
                                        </div>
                                    </div>
                                </div>
                                <button onclick="toggleFollow('${event.organizer_name}')" class="px-6 py-2 rounded-full border transition font-bold flex items-center ${isFollowing ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-white text-primary border-primary hover:bg-blue-50'}">
                                    ${isFollowing ? '<span class="material-icons-outlined text-sm mr-1">check</span>フォロー中' : '<span class="material-icons-outlined text-sm mr-1">person_add</span>フォロー'}
                                </button>
                            </div>
                            
                            <div class="mt-12">
                                <h3 class="font-bold text-xl text-slate-800 mb-6">こちらもおすすめ</h3>
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    ${recommendations.map(rec => `
                                        <div class="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer" onclick="router('detail', {id:'${rec.event_id}'})">
                                            <img src="${rec.cover_image_url}" class="w-full h-32 object-cover">
                                            <div class="p-3">
                                                <h4 class="font-bold text-sm mb-1 truncate">${rec.title}</h4>
                                                <p class="text-xs text-slate-500">${new Date(rec.start_datetime).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>

                        <div class="lg:col-span-1">
                            <div class="bg-white rounded-2xl shadow-float p-6 sticky top-24 border border-blue-100">
                                <h3 class="font-bold text-lg mb-6 flex items-center">
                                    <span class="material-icons-outlined text-primary mr-2">confirmation_number</span>チケット選択
                                </h3>
                                
                                <div class="space-y-4 mb-6">
                                    ${event.tickets && event.tickets.length > 0 ? event.tickets.map(tkt => `
                                        <div class="border border-slate-200 rounded-xl p-4 hover:border-primary transition bg-slate-50 hover:bg-white cursor-pointer group" onclick="openCheckout('${event.event_id}', '${tkt.ticket_id || tkt.id}')">
                                            <div class="flex justify-between items-start mb-2">
                                                <span class="font-bold text-slate-800 group-hover:text-primary">${tkt.ticket_name || tkt.name}</span>
                                                <span class="font-bold text-lg text-slate-900">¥${(tkt.price || 0).toLocaleString()}</span>
                                            </div>
                                            <p class="text-xs text-slate-500 mb-3">${tkt.description || tkt.desc || ''}</p>
                                            <button class="w-full py-2 bg-white border border-primary text-primary rounded-lg text-sm font-bold group-hover:bg-primary group-hover:text-white transition">選択する</button>
                                        </div>
                                    `).join('') : '<p class="text-slate-500">チケット情報がありません</p>'}
                                </div>

                                <p class="text-xs text-slate-400 text-center flex items-center justify-center">
                                    <span class="material-icons-outlined text-sm mr-1">lock</span>
                                    安全な決済処理
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        function renderOrganizerProfile(container, organizerName) {
            const orgEvents = store.events.filter(e => e.organizer_name === organizerName);
            const isFollowing = store.followedOrganizers.includes(organizerName);
            
            container.innerHTML = `
                <div class="bg-white min-h-screen">
                    <div class="h-64 bg-gradient-to-r from-blue-600 to-indigo-700 relative overflow-hidden">
                        <div class="absolute inset-0 bg-black/20"></div>
                        <div class="absolute bottom-0 left-0 w-full p-8 md:p-12 flex items-end translate-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <img src="https://i.pravatar.cc/150?u=${organizerName}" class="w-32 h-32 rounded-full border-4 border-white shadow-xl mr-6">
                            <div class="mb-4">
                                <h1 class="text-3xl font-bold text-white mb-2 shadow-sm">${organizerName}</h1>
                                <div class="flex items-center space-x-4">
                                    <button onclick="toggleFollow('${organizerName}')" class="px-6 py-2 rounded-full font-bold shadow-lg transition flex items-center ${isFollowing ? 'bg-white text-slate-800' : 'bg-primary text-white hover:bg-blue-600'}">
                                        ${isFollowing ? 'フォロー中' : 'フォローする'}
                                    </button>
                                    <div class="text-white/90 text-sm font-bold flex items-center">
                                        <span class="material-icons-outlined mr-1">star</span> 4.8 (120 Reviews)
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            <div class="lg:col-span-2">
                                <h2 class="text-xl font-bold text-slate-800 mb-6 border-b pb-2">開催予定のイベント</h2>
                                ${orgEvents.length > 0 ? 
                                    orgEvents.map(evt => `
                                        <div class="flex bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition mb-4 cursor-pointer" onclick="router('detail', {id:'${evt.event_id}'})">
                                            <img src="${evt.cover_image_url}" class="w-48 object-cover hidden sm:block">
                                            <div class="p-6 flex-1">
                                                <div class="text-xs text-primary font-bold mb-1">${new Date(evt.start_datetime).toLocaleDateString()}</div>
                                                <h3 class="text-lg font-bold text-slate-800 mb-2">${evt.title}</h3>
                                                <p class="text-sm text-slate-500 line-clamp-2">${evt.venue_name}</p>
                                            </div>
                                        </div>
                                    `).join('') 
                                    : '<p class="text-slate-400">現在公開中のイベントはありません。</p>'
                                }
                            </div>
                            <div class="lg:col-span-1">
                                <div class="bg-slate-50 p-6 rounded-2xl">
                                    <h3 class="font-bold text-slate-800 mb-4">About</h3>
                                    <p class="text-sm text-slate-600 leading-relaxed mb-6">
                                        テクノロジーとクリエイティブの融合をテーマに、年間50以上のカンファレンスやミートアップを主催しています。
                                        参加者同士のつながりを重視したコミュニティづくりを目指しています。
                                    </p>
                                    
                                    <h3 class="font-bold text-slate-800 mb-4">Links</h3>
                                    <div class="flex space-x-4 text-slate-400">
                                        <span class="hover:text-primary cursor-pointer"><i class="fab fa-twitter"></i> Twitter</span>
                                        <span class="hover:text-primary cursor-pointer">Website</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // --- AUTH & USER ACTIONS ---
        function toggleFollow(organizerName) {
            if(!store.user) { openAuthModal(); return; }
            
            let currentList = store.followedOrganizers;
            if(!Array.isArray(currentList)) currentList = [];
            
            const idx = currentList.indexOf(organizerName);
            let newList = [...currentList];
            
            if(idx >= 0) {
                newList.splice(idx, 1);
                showToast('フォロー解除しました', 'check_circle');
            } else {
                newList.push(organizerName);
                showToast(`${organizerName}をフォローしました！`, 'favorite');
            }
            store.followedOrganizers = newList;
            
            // Re-render handled by updateUI or user action, simply refreshing current view logic
            const btn = document.querySelector(`button[onclick="toggleFollow('${organizerName}')"]`);
            if(btn) {
                const isFollowing = newList.includes(organizerName);
                if(isFollowing) {
                    btn.className = "px-6 py-2 rounded-full border transition font-bold flex items-center bg-slate-100 text-slate-600 border-slate-200";
                    btn.innerHTML = '<span class="material-icons-outlined text-sm mr-1">check</span>フォロー中';
                } else {
                    btn.className = "px-6 py-2 rounded-full border transition font-bold flex items-center bg-white text-primary border-primary hover:bg-blue-50";
                    btn.innerHTML = '<span class="material-icons-outlined text-sm mr-1">person_add</span>フォロー';
                }
            }
        }

        function openAuthModal() {
            const modal = document.getElementById('modal-content');
            document.getElementById('modal-container').classList.remove('hidden');
            
            modal.innerHTML = `
                <div class="flex flex-col md:flex-row h-[500px]">
                    <div class="hidden md:block w-1/2 bg-cover bg-center relative" style="background-image: url('${IMGS.music}')">
                        <div class="absolute inset-0 bg-primary/80 flex items-center justify-center p-8 text-white">
                            <div>
                                <h2 class="text-3xl font-bold mb-4">Welcome Back</h2>
                                <p>日本最大級のイベントコミュニティへようこそ。</p>
                            </div>
                        </div>
                    </div>
                    <div class="w-full md:w-1/2 p-8 flex flex-col justify-center relative">
                        <button onclick="closeModal()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                            <span class="material-icons-outlined">close</span>
                        </button>
                        <h3 class="text-2xl font-bold text-slate-800 mb-6">ログイン / 新規登録</h3>
                        <div class="space-y-3">
                            <button onclick="login('google')" class="w-full py-3 border border-slate-300 rounded-lg flex items-center justify-center hover:bg-slate-50 transition font-bold text-slate-600">
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" class="w-5 h-5 mr-3">
                                Googleで続ける
                            </button>
                            <button onclick="login('line')" class="w-full py-3 bg-[#06C755] text-white rounded-lg flex items-center justify-center hover:opacity-90 transition font-bold">
                                LINEで続ける
                            </button>
                            <button onclick="login('email')" class="w-full py-3 bg-slate-800 text-white rounded-lg flex items-center justify-center hover:bg-slate-900 transition font-bold">
                                メールアドレスで入力
                            </button>
                        </div>
                        <p class="text-xs text-slate-400 mt-6 text-center">
                            利用規約 と プライバシーポリシー に同意したことになります。
                        </p>
                    </div>
                </div>
            `;
        }

        async function login(provider) {
            if (provider === 'email') {
                // メールログインフォームを表示
                const modal = document.getElementById('modal-content');
                modal.innerHTML = `
                    <div class="p-8">
                        <h3 class="text-xl font-bold mb-4">メールアドレスでログイン</h3>
                        <input id="login-email" type="email" placeholder="Email" class="w-full p-3 border mb-3 rounded">
                        <input id="login-pass" type="password" placeholder="Password" class="w-full p-3 border mb-4 rounded">
                        <button onclick="performLogin()" class="w-full bg-primary text-white py-3 rounded font-bold">ログイン</button>
                    </div>
                `;
            } else if (provider === 'google' || provider === 'line') {
                // Google/LINE OAuth → バックエンドのOAuthルートにリダイレクト
                AppAuth.loginWithSocial(provider);
            }
        }

        async function performLogin() {
            const email = document.getElementById('login-email').value;
            const pass = document.getElementById('login-pass').value;
            const success = await store.login(email, pass);
            if (success) {
                closeModal();
                updateNav();
                showToast('ログインしました', 'login');
            } else {
                alert('ログインに失敗しました');
            }
        }

        async function debugLogin(role) {
            let email, password;
            if (role === 'admin') {
                email = 'admin@linkup.example.com';
                password = 'demo123';
            } else {
                email = 'organizer@linkup.example.com';
                password = 'demo123';
            }

            const success = await store.login(email, password);
            if (success) {
                if (role === 'admin') {
                    showToast('総管理者としてログインしました', 'admin_panel_settings');
                    setTimeout(() => router('admin'), 500);
                } else {
                    showToast('主催者としてログインしました', 'domain');
                    setTimeout(() => router('organizer'), 500);
                }
            } else {
                showToast('ログインに失敗しました。管理画面からリセットしてください。', 'error');
            }
            updateNav();
            closeModal();
        }

        function logout() {
            store.user = null;
            store.token = null;
            updateNav();
            router('home');
            showToast('ログアウトしました', 'logout');
        }

        function updateNav() {
            const nav = document.getElementById('nav-auth-section');
            if (store.user) {
                nav.innerHTML = `
                    <div class="flex items-center space-x-3 ml-4">
                        <span class="cursor-pointer" onclick="router('dashboard')">
                            <img src="${store.user.icon}" class="w-9 h-9 rounded-full border-2 border-slate-200 hover:border-primary transition">
                        </span>
                        <button onclick="logout()" class="text-slate-400 hover:text-red-500 transition" title="ログアウト">
                            <span class="material-icons-outlined">logout</span>
                        </button>
                    </div>
                `;
            } else {
                nav.innerHTML = `
                    <button onclick="openAuthModal()" class="text-sm font-bold text-slate-600 hover:text-primary transition px-4">ログイン</button>
                    <button onclick="openCreateModal()" class="text-sm font-bold bg-slate-900 text-white px-5 py-2 rounded-full hover:bg-slate-700 transition shadow-lg">イベント作成</button>
                `;
            }
        }

        // --- CHECKOUT FLOW ---
        function openCheckout(eventId, ticketId) {
            if (!store.user) { openAuthModal(); return; }
            
            const event = store.events.find(e => e.event_id === eventId);
            const ticket = (event.tickets || []).find(t => (t.ticket_id || t.id) === ticketId) || { name: 'Ticket', price: 0 };
            
            store.cart = { event, ticket: { id: ticketId, ...ticket }, count: 1 };
            // Redirect to Full Page Checkout Mock
            router('checkout_session');
        }

        // --- STRIPE MOCK PAGE ---
        function renderStripeMock(container) {
            const { event, ticket, count } = store.cart;
            const total = ticket.price * count;
            
            container.innerHTML = `
                <div class="min-h-screen bg-white flex flex-col md:flex-row">
                    <!-- Left: Summary -->
                    <div class="w-full md:w-1/2 bg-slate-50 p-8 md:p-12 border-r border-slate-200">
                        <div class="max-w-md mx-auto">
                            <div class="flex items-center mb-8 text-slate-500 cursor-pointer" onclick="router('detail', {id:'${event.event_id}'})">
                                <span class="material-icons-outlined mr-2">arrow_back</span> キャンセル
                            </div>
                            
                            <div class="mb-8">
                                <span class="text-slate-500 text-sm">支払い金額</span>
                                <div class="text-4xl font-bold text-slate-900 mt-2">¥${total.toLocaleString()}</div>
                            </div>

                            <div class="space-y-4">
                                <div class="flex items-start">
                                    <img src="${event.cover_image_url}" class="w-16 h-16 rounded bg-slate-200 object-cover mr-4">
                                    <div>
                                        <h3 class="font-bold text-slate-800">${event.title}</h3>
                                        <p class="text-sm text-slate-500">${ticket.name} x ${count}枚</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mt-12 pt-8 border-t border-slate-200 text-xs text-slate-400">
                                Powered by <strong class="text-slate-600">Stripe</strong>
                                <div class="flex space-x-2 mt-2">
                                    <span class="bg-slate-200 px-2 py-1 rounded">TEST MODE</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right: Payment Form -->
                    <div class="w-full md:w-1/2 p-8 md:p-12 bg-white flex items-center justify-center">
                        <div class="max-w-md w-full">
                            <h2 class="text-xl font-bold mb-6 text-slate-800">カード情報の入力</h2>
                            
                            <form onsubmit="event.preventDefault(); processStripePayment();" class="space-y-4">
                                <div>
                                    <label class="block text-xs font-bold text-slate-500 mb-1">メールアドレス</label>
                                    <input type="email" value="${store.user.email}" class="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition" required>
                                </div>

                                <div>
                                    <label class="block text-xs font-bold text-slate-500 mb-1">カード情報</label>
                                    <div class="border border-slate-300 rounded-lg overflow-hidden">
                                        <input type="text" placeholder="カード番号" class="w-full p-3 border-b border-slate-300 outline-none" value="4242 4242 4242 4242" readonly>
                                        <div class="flex">
                                            <input type="text" placeholder="MM / YY" class="w-1/2 p-3 border-r border-slate-300 outline-none" value="12 / 34" readonly>
                                            <input type="text" placeholder="CVC" class="w-1/2 p-3 outline-none" value="123" readonly>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label class="block text-xs font-bold text-slate-500 mb-1">カード名義</label>
                                    <input type="text" value="${store.user.name}" class="w-full p-3 border border-slate-300 rounded-lg outline-none" required>
                                </div>

                                <button type="submit" id="pay-btn" class="w-full py-4 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition flex justify-center items-center mt-6">
                                    <span class="material-icons-outlined mr-2">lock</span> 支払う
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            `;
        }

        function processStripePayment() {
            const btn = document.getElementById('pay-btn');
            btn.innerHTML = `<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> 処理中...`;
            btn.disabled = true;

            setTimeout(() => {
                confirmPurchase(); 
            }, 2000);
        }

        function updateCheckoutModal() {
            const { event, ticket, count } = store.cart;
            const total = ticket.price * count;
            
            const modal = document.getElementById('modal-content');
            document.getElementById('modal-container').classList.remove('hidden');
            
            modal.innerHTML = `
                <div class="p-8">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-xl font-bold text-slate-800">チケット購入</h3>
                        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600"><span class="material-icons-outlined">close</span></button>
                    </div>
                    
                    <div class="bg-slate-50 p-4 rounded-xl mb-6 flex items-start">
                        <img src="${event.cover_image_url}" class="w-16 h-16 rounded-lg object-cover mr-4">
                        <div>
                            <h4 class="font-bold text-sm text-slate-800 line-clamp-1">${event.title}</h4>
                            <p class="text-xs text-slate-500 mt-1">${new Date(event.start_datetime).toLocaleDateString()} @ ${event.venue_name}</p>
                            <p class="text-sm font-bold text-primary mt-1">${ticket.name}</p>
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
                        <span class="text-sm font-bold text-slate-600">枚数</span>
                        <div class="flex items-center space-x-4">
                            <button onclick="updateCart(-1)" class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center hover:bg-slate-300 font-bold">-</button>
                            <span class="text-lg font-bold w-4 text-center">${count}</span>
                            <button onclick="updateCart(1)" class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center hover:bg-slate-300 font-bold">+</button>
                        </div>
                    </div>
                    
                    <div class="flex justify-between items-end mb-8">
                        <span class="text-sm text-slate-500">合計金額</span>
                        <span class="text-3xl font-bold text-slate-900">¥${total.toLocaleString()}</span>
                    </div>
                    
                    <div class="bg-blue-50 p-3 rounded-lg flex items-center mb-6 text-xs text-blue-800">
                        <span class="material-icons-outlined text-sm mr-2">verified_user</span>
                        この取引は256-bit SSLで暗号化されています。
                    </div>

                    <button onclick="confirmPurchase()" class="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition transform flex justify-center items-center">
                        <span class="material-icons-outlined mr-2">payment</span> 決済して購入する
                    </button>
                </div>
            `;
        }

        function updateCart(delta) {
            if (!store.cart) return;
            const newCount = store.cart.count + delta;
            if (newCount > 0 && newCount <= 10) {
                store.cart.count = newCount;
                updateCheckoutModal();
            }
        }

        function confirmPurchase() {
            const { event, ticket, count } = store.cart;
            
            // Generate Ticket Data
            const newTicket = {
                id: `TKT-${Date.now()}`,
                eventId: event.event_id,
                ticketId: ticket.id,
                title: event.title,
                ticketName: ticket.name,
                count: count,
                price: ticket.price,
                total: ticket.price * count,
                purchaseDate: new Date().toISOString(),
                qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=LINKUP-TKT-${Date.now()}`
            };
            
            // Save
            const currentTickets = store.tickets;
            currentTickets.unshift(newTicket);
            store.tickets = currentTickets;
            
            store.cart = null;
            closeModal();
            
            // Success Animation
            showToast('チケットの発行が完了しました！', 'confirmation_number');
            setTimeout(() => {
                router('dashboard');
            }, 1000);
        }

        // --- DASHBOARDS ---
        function renderDashboard(container) {
            const myTickets = store.tickets;
            
            container.innerHTML = `
                <div class="max-w-4xl mx-auto px-4 py-8">
                    <h1 class="text-2xl font-bold text-slate-800 mb-2">マイページ</h1>
                    <p class="text-slate-500 text-sm mb-8">ようこそ、${store.user.name}さん</p>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div class="bg-white p-5 rounded-2xl shadow-card border border-slate-100 flex items-center">
                            <div class="w-12 h-12 rounded-full bg-blue-100 text-primary flex items-center justify-center mr-4">
                                <span class="material-icons-outlined">confirmation_number</span>
                            </div>
                            <div>
                                <p class="text-xs text-slate-400">所有チケット</p>
                                <p class="text-xl font-bold">${myTickets.length}枚</p>
                            </div>
                        </div>
                        <div class="bg-white p-5 rounded-2xl shadow-card border border-slate-100 flex items-center">
                            <div class="w-12 h-12 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center mr-4">
                                <span class="material-icons-outlined">favorite</span>
                            </div>
                            <div>
                                <p class="text-xs text-slate-400">フォロー中</p>
                                <p class="text-xl font-bold">${store.followedOrganizers.length}人</p>
                            </div>
                        </div>
                         <div class="bg-white p-5 rounded-2xl shadow-card border border-slate-100 flex items-center">
                            <div class="w-12 h-12 rounded-full bg-green-100 text-green-500 flex items-center justify-center mr-4">
                                <span class="material-icons-outlined">verified</span>
                            </div>
                            <div>
                                <p class="text-xs text-slate-400">本人確認</p>
                                <p class="text-xl font-bold text-slate-800 cursor-pointer hover:text-primary transition" onclick="openKYCModal()">
                                    ${store.user.kycStatus === 'verified' ? '完了' : (store.user.kycStatus === 'pending' ? '審査中' : '未完了')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <h2 class="text-xl font-bold text-slate-800 mb-4">チケット一覧</h2>
                    <div class="space-y-4">
                        ${myTickets.length === 0 ? '<p class="text-slate-400 text-center py-8">まだチケットを持っていません。</p>' : 
                          myTickets.map(t => `
                            <div class="bg-white rounded-2xl shadow-card overflow-hidden border border-slate-100 flex flex-col md:flex-row">
                                <div class="bg-slate-900 p-6 flex flex-col items-center justify-center text-white min-w-[140px]">
                                    <span class="text-xs opacity-70 mb-1">ADMIT ONE</span>
                                    <span class="text-2xl font-bold">${t.count}枚</span>
                                </div>
                                <div class="p-6 flex-1">
                                    <div class="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 class="font-bold text-lg text-slate-800">${t.title}</h3>
                                            <p class="text-sm text-primary font-bold">${t.ticketName}</p>
                                        </div>
                                        <button onclick="showQR('${t.qrCode}')" class="text-slate-400 hover:text-slate-600"><span class="material-icons-outlined text-3xl">qr_code_2</span></button>
                                    </div>
                                    <p class="text-xs text-slate-400">購入日: ${new Date(t.purchaseDate).toLocaleDateString()}</p>
                                    <div class="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                                        <button class="text-sm text-primary font-bold hover:underline">詳細を表示</button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // --- ORGANIZER DASHBOARD (FULL) ---
        function renderOrganizer(container) {
            window.location.href = '/organizer.html';
        }

        // --- ORGANIZER SUB-VIEWS (ENHANCED) ---

        function _renderOrganizerDashboard(container) {
            // Data Aggregation
            const myEvents = store.events.filter(e => e.organizer_name === store.organizerProfile.name);
            const totalSales = myEvents.reduce((sum, e) => sum + (e.tickets_sold || Math.floor(Math.random() * 50)) * e.price, 0);
            const totalTickets = myEvents.reduce((sum, e) => sum + (e.tickets_sold || Math.floor(Math.random() * 50)), 0);
            
            // Generate Activity Feed (Mock)
            const activities = [
                { time: '5分前', text: '「Tech Summit」のチケットが購入されました', type: 'sale', amount: '¥3,000' },
                { time: '20分前', text: '新規フォロワーが増えました', type: 'follow' },
                { time: '1時間前', text: '「Spring Meetup」のお気に入り登録がありました', type: 'like' },
                { time: '3時間前', text: '振込申請が承認されました', type: 'system' }
            ];

            container.innerHTML = `
                <!-- Dashboard Header -->
                <div class="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
                    <div>
                        <p class="text-slate-500 text-sm font-bold mb-1">Good Morning, ${store.organizerProfile.name}</p>
                        <h1 class="text-3xl font-bold text-slate-800">Overview</h1>
                    </div>
                    <div class="flex gap-3">
                        <button class="flex items-center px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition shadow-sm">
                            <span class="material-icons-outlined text-base mr-2">file_download</span> レポート
                        </button>
                        <button onclick="renderOrganizer(document.getElementById('app'), 'events')" class="flex items-center px-5 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold shadow-lg hover:bg-slate-700 transition transform hover:-translate-y-0.5">
                            <span class="material-icons-outlined text-base mr-2">add</span> イベント作成
                        </button>
                    </div>
                </div>
                
                <!-- KPI Cards with Trend -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <!-- Revenue Card -->
                    <div class="bg-white p-6 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden group">
                        <div class="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition group-hover:scale-110"></div>
                        <div class="relative z-10">
                            <div class="flex justify-between items-start mb-4">
                                <div class="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <span class="material-icons-outlined">payments</span>
                                </div>
                                <span class="flex items-center text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">
                                    <span class="material-icons-outlined text-sm mr-1">trending_up</span> +12.5%
                                </span>
                            </div>
                            <p class="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Revenue</p>
                            <h3 class="text-3xl font-extrabold text-slate-800">¥${totalSales.toLocaleString()}</h3>
                        </div>
                    </div>

                    <!-- Tickets Card -->
                    <div class="bg-white p-6 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden group">
                        <div class="absolute right-0 top-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 transition group-hover:scale-110"></div>
                        <div class="relative z-10">
                            <div class="flex justify-between items-start mb-4">
                                <div class="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                    <span class="material-icons-outlined">confirmation_number</span>
                                </div>
                                <span class="flex items-center text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">
                                    <span class="material-icons-outlined text-sm mr-1">trending_up</span> +8.2%
                                </span>
                            </div>
                            <p class="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Tickets Sold</p>
                            <h3 class="text-3xl font-extrabold text-slate-800">${totalTickets}<span class="text-lg text-slate-400 font-medium ml-1">枚</span></h3>
                        </div>
                    </div>

                    <!-- Followers Card -->
                    <div class="bg-white p-6 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden group">
                        <div class="absolute right-0 top-0 w-24 h-24 bg-orange-50 rounded-bl-full -mr-4 -mt-4 transition group-hover:scale-110"></div>
                        <div class="relative z-10">
                            <div class="flex justify-between items-start mb-4">
                                <div class="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                    <span class="material-icons-outlined">groups</span>
                                </div>
                                <span class="flex items-center text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                                    <span class="material-icons-outlined text-sm mr-1">remove</span> 0.0%
                                </span>
                            </div>
                            <p class="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Followers</p>
                            <h3 class="text-3xl font-extrabold text-slate-800">1,204<span class="text-lg text-slate-400 font-medium ml-1">人</span></h3>
                        </div>
                    </div>
                </div>
                
                <!-- Main Analytics Section -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <!-- Sales Chart -->
                    <div class="lg:col-span-2 bg-white p-6 rounded-2xl shadow-card border border-slate-100">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="font-bold text-slate-800 flex items-center">
                                <span class="w-1 h-5 bg-blue-500 rounded-full mr-3"></span> 売上推移
                            </h3>
                            <select class="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none text-slate-600">
                                <option>過去30日</option>
                                <option>過去6ヶ月</option>
                                <option>今年</option>
                            </select>
                        </div>
                        <div class="h-64">
                            <canvas id="salesChart"></canvas>
                        </div>
                    </div>

                    <!-- Ticket Breakdown & Activity -->
                    <div class="space-y-6">
                        <!-- Activity Feed -->
                        <div class="bg-white p-6 rounded-2xl shadow-card border border-slate-100 h-full">
                            <h3 class="font-bold text-slate-800 mb-4 flex items-center">
                                <span class="w-1 h-5 bg-orange-500 rounded-full mr-3"></span> 最新のアクティビティ
                            </h3>
                            <div class="space-y-6">
                                ${activities.map((act, i) => `
                                    <div class="flex items-start relative pl-4">
                                        ${i !== activities.length - 1 ? '<div class="absolute left-[23px] top-8 bottom-[-24px] w-0.5 bg-slate-100"></div>' : ''}
                                        <div class="relative z-10 w-8 h-8 rounded-full flex items-center justify-center mr-3 border-2 border-white shadow-sm flex-shrink-0
                                            ${act.type === 'sale' ? 'bg-blue-100 text-blue-600' : act.type === 'like' ? 'bg-pink-100 text-pink-500' : 'bg-slate-100 text-slate-500'}">
                                            <span class="material-icons-outlined text-xs">
                                                ${act.type === 'sale' ? 'confirmation_number' : act.type === 'follow' ? 'person_add' : act.type === 'like' ? 'favorite' : 'info'}
                                            </span>
                                        </div>
                                        <div>
                                            <p class="text-xs text-slate-400 font-mono mb-0.5">${act.time}</p>
                                            <p class="text-sm font-bold text-slate-700 leading-tight">${act.text}</p>
                                            ${act.amount ? `<p class="text-xs font-bold text-blue-600 mt-1">+${act.amount}</p>` : ''}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Initialize Charts with better visuals
            setTimeout(() => {
                const ctx = document.getElementById('salesChart');
                if (ctx) {
                    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, 'rgba(37, 99, 235, 0.2)');
                    gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');

                    new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: ['1日', '5日', '10日', '15日', '20日', '25日', '今日'],
                            datasets: [{
                                label: '売上 (JPY)',
                                data: [12000, 19000, 3000, 5000, 2000, 30000, 45000],
                                borderColor: '#2563EB',
                                backgroundColor: gradient,
                                borderWidth: 3,
                                pointBackgroundColor: '#FFFFFF',
                                pointBorderColor: '#2563EB',
                                pointBorderWidth: 2,
                                pointRadius: 4,
                                pointHoverRadius: 6,
                                tension: 0.4,
                                fill: true
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { 
                                legend: { display: false },
                                tooltip: {
                                    backgroundColor: '#1E293B',
                                    padding: 12,
                                    titleFont: { size: 13 },
                                    bodyFont: { size: 14, weight: 'bold' },
                                    cornerRadius: 8,
                                    displayColors: false
                                }
                            },
                            scales: { 
                                y: { 
                                    beginAtZero: true,
                                    grid: { borderDash: [4, 4], color: '#F1F5F9' },
                                    ticks: { font: { size: 10 }, color: '#94A3B8' }
                                },
                                x: {
                                    grid: { display: false },
                                    ticks: { font: { size: 10 }, color: '#94A3B8' }
                                }
                            }
                        }
                    });
                }
            }, 100);
        }

        function _renderOrganizerEvents(container) {
            const myEvents = store.events.filter(e => e.organizer_name === store.organizerProfile.name);
            
            container.innerHTML = `
                <div class="flex justify-between items-center mb-6">
                    <h1 class="text-2xl font-bold text-slate-800">イベント管理</h1>
                    <button onclick="openCreateEventModal()" class="flex items-center px-6 py-2 bg-primary text-white rounded-full font-bold shadow hover:bg-blue-600 transition">
                        <span class="material-icons-outlined text-sm mr-2">add</span> 新規作成
                    </button>
                </div>

                <div class="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead class="bg-slate-50 text-slate-500 text-xs uppercase">
                                <tr>
                                    <th class="p-4 whitespace-nowrap">イベント名</th>
                                    <th class="p-4 whitespace-nowrap">開催日</th>
                                    <th class="p-4 whitespace-nowrap">会場</th>
                                    <th class="p-4 whitespace-nowrap">価格</th>
                                    <th class="p-4 whitespace-nowrap">ステータス</th>
                                    <th class="p-4 whitespace-nowrap">操作</th>
                                </tr>
                            </thead>
                            <tbody class="text-sm text-slate-700">
                                ${myEvents.length === 0 ? 
                                    '<tr><td colspan="6" class="p-8 text-center text-slate-400">イベントがありません。「新規作成」から作成してください。</td></tr>' : 
                                    myEvents.map(evt => `
                                    <tr class="border-b border-slate-50 hover:bg-slate-50 transition">
                                        <td class="p-4">
                                            <div class="font-bold line-clamp-1 max-w-xs">${evt.title}</div>
                                            <div class="text-xs text-slate-400">${evt.event_id}</div>
                                        </td>
                                        <td class="p-4 whitespace-nowrap">${new Date(evt.start_datetime).toLocaleDateString()}</td>
                                        <td class="p-4 line-clamp-1 max-w-[150px]">${evt.venue_name}</td>
                                        <td class="p-4">¥${evt.price.toLocaleString()}</td>
                                        <td class="p-4">
                                            <span class="px-2 py-1 rounded text-xs font-bold ${evt.status === 'completed' ? 'bg-slate-100 text-slate-500' : 'bg-green-100 text-green-600'}">
                                                ${evt.status === 'completed' ? '終了' : '公開中'}
                                            </span>
                                        </td>
                                        <td class="p-4 whitespace-nowrap">
                                            <button onclick="openCreateEventModal('${evt.event_id}')" class="text-blue-500 hover:text-blue-700 mr-3" title="編集"><span class="material-icons-outlined">edit</span></button>
                                            <button onclick="store.deleteEvent('${evt.event_id}'); renderOrganizer(document.getElementById('app'), 'events')" class="text-red-400 hover:text-red-600" title="削除"><span class="material-icons-outlined">delete</span></button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        function _renderOrganizerParticipants(container) {
            container.innerHTML = `
                <h1 class="text-2xl font-bold text-slate-800 mb-6">参加者リスト</h1>
                <div class="bg-white p-12 rounded-2xl shadow-card text-center">
                    <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span class="material-icons-outlined text-3xl text-slate-400">people_outline</span>
                    </div>
                    <h3 class="text-lg font-bold text-slate-700 mb-2">参加者データ</h3>
                    <p class="text-slate-500 mb-6">イベントごとの購入者一覧をCSVでダウンロードできます。</p>
                    <button class="px-6 py-2 bg-white border border-slate-300 rounded-full text-slate-600 font-bold hover:bg-slate-50 disabled:opacity-50" disabled>
                        CSVダウンロード (準備中)
                    </button>
                </div>
            `;
        }

        function _renderOrganizerFinance(container) {
            container.innerHTML = `
                <h1 class="text-2xl font-bold text-slate-800 mb-6">売上・振込管理</h1>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div class="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                        <div class="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
                        <p class="text-blue-100 font-bold mb-1">振込可能残高</p>
                        <p class="text-4xl font-bold mb-6">¥125,000</p>
                        <button onclick="store.requestPayout(125000, false)" class="bg-white text-blue-700 px-6 py-2 rounded-full font-bold shadow hover:bg-blue-50 transition text-sm">
                            振込申請する
                        </button>
                    </div>
                    <div class="bg-white p-6 rounded-2xl shadow-card border border-slate-100 flex flex-col justify-center">
                        <div class="flex items-center justify-between mb-4">
                            <div>
                                <p class="text-sm font-bold text-slate-500">早期振込オプション</p>
                                <p class="text-xs text-slate-400">最短翌営業日に入金 (手数料 5%)</p>
                            </div>
                            <span class="material-icons-outlined text-amber-500 text-3xl">bolt</span>
                        </div>
                        <button onclick="store.requestEarlyPayout(125000)" class="w-full py-3 bg-amber-50 text-amber-600 border border-amber-200 rounded-xl font-bold hover:bg-amber-100 transition flex items-center justify-center">
                            早期振込を申請
                        </button>
                    </div>
                </div>

                <h3 class="font-bold text-slate-800 mb-4">振込履歴</h3>
                <div class="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
                    <table class="w-full text-left">
                        <thead class="bg-slate-50 text-slate-500 text-xs">
                            <tr>
                                <th class="p-4">申請日</th>
                                <th class="p-4">金額</th>
                                <th class="p-4">タイプ</th>
                                <th class="p-4">ステータス</th>
                            </tr>
                        </thead>
                        <tbody class="text-sm text-slate-700">
                            <tr class="border-b">
                                <td class="p-4">2026/01/15</td>
                                <td class="p-4">¥45,000</td>
                                <td class="p-4">通常</td>
                                <td class="p-4"><span class="px-2 py-1 bg-green-100 text-green-600 rounded text-xs font-bold">振込完了</span></td>
                            </tr>
                            <tr class="border-b">
                                <td class="p-4">2025/12/31</td>
                                <td class="p-4">¥120,000</td>
                                <td class="p-4">通常</td>
                                <td class="p-4"><span class="px-2 py-1 bg-green-100 text-green-600 rounded text-xs font-bold">振込完了</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;
        }

        function _renderOrganizerMarketing(container) {
            const campaigns = store.campaigns;
            container.innerHTML = `
                <div class="flex justify-between items-center mb-6">
                    <h1 class="text-2xl font-bold text-slate-800">マーケティング</h1>
                    <button class="px-4 py-2 bg-primary text-white rounded-full font-bold shadow text-sm">キャンペーン作成</button>
                </div>
                
                <div class="bg-white p-8 rounded-2xl shadow-card border border-slate-100 text-center">
                    <p class="text-slate-500 mb-4">割引クーポンを発行して、SNSでの集客を加速させましょう。</p>
                    <div class="inline-block p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <p class="font-bold text-slate-700">クーポン機能: <span class="text-green-500">有効</span></p>
                        <p class="text-xs text-slate-400 mt-1">現在の発行済みコード: ${campaigns.length}件</p>
                    </div>
                </div>
            `;
        }

        function _renderOrganizerSettings(container) {
            const p = store.organizerProfile;
            container.innerHTML = `
                <h1 class="text-2xl font-bold text-slate-800 mb-6">設定</h1>
                
                <div class="bg-white p-8 rounded-2xl shadow-card border border-slate-100 max-w-2xl">
                    <h3 class="font-bold text-lg mb-6 border-b pb-2">主催者プロフィール設定</h3>
                    
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-bold text-slate-600 mb-1">主催者名</label>
                            <input type="text" id="org-name" value="${p.name}" class="w-full p-3 border border-slate-200 rounded-lg">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-bold text-slate-600 mb-1">プロフィール画像URL</label>
                            <input type="text" id="org-img" value="${p.img}" class="w-full p-3 border border-slate-200 rounded-lg text-sm text-slate-500">
                        </div>

                        <div>
                            <label class="block text-sm font-bold text-slate-600 mb-1">自己紹介</label>
                            <textarea id="org-bio" class="w-full p-3 border border-slate-200 rounded-lg h-32">${p.bio}</textarea>
                        </div>
                        
                        <div class="pt-4">
                            <button onclick="saveOrganizerSettings()" class="w-full py-3 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 transition">変更を保存</button>
                        </div>
                    </div>
                </div>
            `;
        }

        function saveOrganizerSettings() {
            const name = document.getElementById('org-name').value;
            const img = document.getElementById('org-img').value;
            const bio = document.getElementById('org-bio').value;
            
            const p = store.organizerProfile;
            p.name = name;
            p.img = img;
            p.bio = bio;
            
            store.updateOrganizerProfile(p);
        }

        // --- EVENT CREATE/EDIT MODAL ---
        function openCreateEventModal(editId = null) {
            const modal = document.getElementById('modal-content');
            document.getElementById('modal-container').classList.remove('hidden');
            
            const isEdit = !!editId;
            let evt = {
                title: '',
                category: 'tech',
                start_datetime: new Date().toISOString().slice(0, 16),
                venue_name: 'オンライン',
                price: 1000,
                cover_image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                description: ''
            };

            if (isEdit) {
                const found = store.events.find(e => e.event_id === editId);
                if (found) evt = found;
            }

            modal.innerHTML = `
                <div class="p-6 md:p-8 max-h-[90vh] overflow-y-auto">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-2xl font-bold text-slate-800">${isEdit ? 'イベント編集' : 'イベント新規作成'}</h3>
                        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600"><span class="material-icons-outlined">close</span></button>
                    </div>
                    
                    <div class="space-y-5">
                        <div>
                            <label class="block text-sm font-bold text-slate-600 mb-1">イベント名 <span class="text-red-500">*</span></label>
                            <input type="text" id="evt-title" value="${evt.title}" class="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="例: Web開発勉強会 Vol.1">
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-bold text-slate-600 mb-1">カテゴリー</label>
                                <select id="evt-category" class="w-full p-3 border border-slate-300 rounded-lg">
                                    <option value="tech" ${evt.category === 'tech' ? 'selected' : ''}>Tech / IT</option>
                                    <option value="business" ${evt.category === 'business' ? 'selected' : ''}>Business</option>
                                    <option value="music" ${evt.category === 'music' ? 'selected' : ''}>Music</option>
                                    <option value="art" ${evt.category === 'art' ? 'selected' : ''}>Art / Design</option>
                                    <option value="social" ${evt.category === 'social' ? 'selected' : ''}>Social</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-bold text-slate-600 mb-1">開催日時</label>
                                <input type="datetime-local" id="evt-date" value="${evt.start_datetime.substring(0, 16)}" class="w-full p-3 border border-slate-300 rounded-lg">
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-bold text-slate-600 mb-1">会場名</label>
                            <input type="text" id="evt-venue" value="${evt.venue_name}" class="w-full p-3 border border-slate-300 rounded-lg" list="venue-list">
                            <datalist id="venue-list">
                                <option value="オンライン">
                                <option value="渋谷ストリームホール">
                                <option value="東京国際フォーラム">
                            </datalist>
                        </div>

                        <div>
                            <label class="block text-sm font-bold text-slate-600 mb-1">チケット価格 (円)</label>
                            <input type="number" id="evt-price" value="${evt.price}" class="w-full p-3 border border-slate-300 rounded-lg" min="0" step="100">
                        </div>

                        <div>
                            <label class="block text-sm font-bold text-slate-600 mb-1">カバー画像URL</label>
                            <input type="text" id="evt-img" value="${evt.cover_image_url}" class="w-full p-3 border border-slate-300 rounded-lg text-sm text-slate-500">
                        </div>

                        <div>
                            <label class="block text-sm font-bold text-slate-600 mb-1">詳細説明</label>
                            <textarea id="evt-desc" class="w-full p-3 border border-slate-300 rounded-lg h-32" placeholder="イベントの魅力を伝えましょう...">${evt.description.replace(/<[^>]*>/g, '')}</textarea>
                        </div>

                        <div class="pt-4 flex space-x-3">
                            <button onclick="closeModal()" class="flex-1 py-3 border border-slate-300 text-slate-600 font-bold rounded-lg hover:bg-slate-50">キャンセル</button>
                            <button onclick="saveEvent('${editId || ''}')" class="flex-1 py-3 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition">
                                ${isEdit ? '更新する' : '公開する'}
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        function saveEvent(editId) {
            const title = document.getElementById('evt-title').value;
            const category = document.getElementById('evt-category').value;
            const start_datetime = document.getElementById('evt-date').value + ':00.000Z'; // naive formatting
            const venue_name = document.getElementById('evt-venue').value;
            const price = parseInt(document.getElementById('evt-price').value) || 0;
            const cover_image_url = document.getElementById('evt-img').value;
            const descRaw = document.getElementById('evt-desc').value;
            
            if (!title) { alert('タイトルは必須です'); return; }

            const eventData = {
                title,
                category,
                start_datetime,
                end_datetime: start_datetime, // Mock end time same as start for now
                venue_name,
                venue_address: venue_name === 'オンライン' ? 'Zoom' : '東京都内',
                price,
                cover_image_url,
                description: `<p>${descRaw.replace(/\n/g, '<br>')}</p>`,
                organizer_name: store.organizerProfile.name,
                organizer_rating: '5.0',
                status: 'published',
                tickets: [{ id: `tkt-${Date.now()}`, name: '一般', price, desc: '一般参加チケット' }]
            };

            if (editId) {
                store.updateEvent(editId, eventData);
            } else {
                // event_id generated by backend
                store.addEvent(eventData);
            }
            
            closeModal();
            // renderOrganizer(document.getElementById('app'), 'events'); // Wait for store.addEvent to finish and refresh?
            // store.addEvent refreshes via init().
        }

        function renderAdmin(container, tab = 'users') {
            const menuItems = [
                { id: 'users', icon: 'people', label: 'ユーザー管理' },
                { id: 'events', icon: 'event', label: 'イベント監査' },
                { id: 'finance', icon: 'payments', label: '財務・振込管理' },
                { id: 'settings', icon: 'settings', label: 'システム設定' }
            ];

            const renderSidebarNav = () => menuItems.map(item => `
                <button onclick="renderAdmin(document.getElementById('app'), '${item.id}')" 
                    class="w-full flex items-center px-4 py-3 mb-1 rounded-lg transition text-left ${tab === item.id ? 'bg-slate-700 text-white font-bold border-l-4 border-red-400' : 'text-slate-400 hover:text-white hover:bg-slate-700'}">
                    <span class="material-icons-outlined mr-3 text-xl">${item.icon}</span>
                    ${item.label}
                </button>
            `).join('');

            container.innerHTML = `
                <div class="min-h-screen bg-slate-100 flex flex-col lg:flex-row relative">
                    <!-- Mobile Header -->
                    <div class="lg:hidden bg-slate-800 text-white p-4 flex justify-between items-center shadow-md z-30 sticky top-0">
                        <div class="flex items-center">
                            <span class="material-icons-outlined text-2xl text-red-400 mr-2">admin_panel_settings</span>
                            <span class="text-lg font-bold">Admin</span>
                        </div>
                        <button onclick="document.getElementById('admin-mobile-sidebar').classList.toggle('-translate-x-full')" class="p-2 hover:bg-slate-700 rounded">
                            <span class="material-icons-outlined">menu</span>
                        </button>
                    </div>

                    <!-- Mobile Sidebar -->
                    <div id="admin-mobile-sidebar" class="fixed inset-y-0 left-0 w-64 bg-slate-800 text-white p-6 transform -translate-x-full transition-transform duration-300 ease-in-out z-40 lg:hidden shadow-2xl">
                        <div class="flex justify-between items-center mb-8">
                            <div class="flex items-center">
                                <span class="material-icons-outlined text-2xl text-red-400 mr-2">admin_panel_settings</span>
                                <span class="font-bold">Admin Menu</span>
                            </div>
                            <button onclick="document.getElementById('admin-mobile-sidebar').classList.add('-translate-x-full')" class="text-slate-400 hover:text-white">
                                <span class="material-icons-outlined">close</span>
                            </button>
                        </div>
                        <nav class="space-y-1">
                             ${renderSidebarNav()}
                             <div class="pt-4 mt-4 border-t border-slate-700">
                                <button onclick="router('home')" class="w-full flex items-center px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition">
                                    <span class="material-icons-outlined mr-3">logout</span> サイトへ戻る
                                </button>
                            </div>
                        </nav>
                    </div>

                    <!-- Desktop Sidebar -->
                    <div class="w-64 bg-slate-800 text-white p-6 hidden lg:flex flex-col flex-shrink-0 h-screen sticky top-0">
                         <div class="flex items-center mb-8 cursor-pointer" onclick="router('home')">
                            <span class="material-icons-outlined text-3xl text-red-400 mr-2">admin_panel_settings</span>
                            <span class="text-xl font-bold">Admin</span>
                        </div>
                        <nav class="flex-1 space-y-1">
                             ${renderSidebarNav()}
                        </nav>
                        <div class="pt-4 mt-auto border-t border-slate-700">
                            <button onclick="router('home')" class="w-full flex items-center px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition text-sm">
                                <span class="material-icons-outlined mr-2">logout</span> サイトへ戻る
                            </button>
                        </div>
                    </div>

                    <!-- Content -->
                    <div class="flex-1 p-4 md:p-8 overflow-y-auto w-full h-full min-h-screen" id="admin-content">
                        <!-- Injected Here -->
                    </div>
                </div>
            `;

            const contentArea = document.getElementById('admin-content');
            if (tab === 'users') _renderAdminUsers(contentArea);
            else if (tab === 'events') _renderAdminEvents(contentArea);
            else if (tab === 'finance') _renderAdminFinance(contentArea);
            else if (tab === 'settings') _renderAdminSettings(contentArea);
        }

        // --- ADMIN SUB-VIEWS ---

        function _renderAdminUsers(container) {
            // Mock Users + Current User
            const users = [
                store.user || { id: 'u-guest', name: 'Guest', email: '-', kycStatus: 'unverified' },
                { id: 'u-101', name: 'Taro Yamada', email: 'taro@example.com', kycStatus: 'verified', role: 'user' },
                { id: 'u-102', name: 'Hanako Suzuki', email: 'hanako@example.com', kycStatus: 'pending', role: 'organizer' },
                { id: 'u-103', name: 'John Smith', email: 'john@example.com', kycStatus: 'unverified', role: 'user' }
            ];

            container.innerHTML = `
                <h1 class="text-2xl font-bold text-slate-800 mb-6">ユーザー管理</h1>
                <div class="bg-white rounded-2xl shadow-card p-6 overflow-x-auto">
                    <table class="w-full text-left min-w-[600px]">
                        <thead>
                            <tr class="text-slate-500 text-sm border-b">
                                <th class="pb-2 p-2">ID</th>
                                <th class="pb-2 p-2">Name</th>
                                <th class="pb-2 p-2">Email</th>
                                <th class="pb-2 p-2">Role</th>
                                <th class="pb-2 p-2">KYC Status</th>
                                <th class="pb-2 p-2">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${users.map(u => `
                                <tr class="border-b text-sm hover:bg-slate-50">
                                    <td class="py-3 p-2 font-mono text-xs text-slate-500">${u.id}</td>
                                    <td class="p-2 font-bold text-slate-700">${u.name}</td>
                                    <td class="p-2 text-slate-600">${u.email}</td>
                                    <td class="p-2"><span class="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs">${u.role || 'user'}</span></td>
                                    <td class="p-2">
                                        <span class="px-2 py-1 rounded text-xs font-bold 
                                            ${u.kycStatus === 'verified' ? 'bg-green-100 text-green-600' : 
                                              (u.kycStatus === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-slate-100 text-slate-500')}">
                                            ${u.kycStatus}
                                        </span>
                                    </td>
                                    <td class="p-2">
                                        ${u.kycStatus === 'pending' ? `<button class="text-blue-500 hover:underline font-bold" onclick="approveKYCAdmin('${u.id}')">Approve</button>` : 
                                          u.kycStatus === 'verified' ? '<span class="text-slate-300 text-xs">Approved</span>' : 
                                          '<span class="text-slate-300 text-xs">-</span>'}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        function approveKYCAdmin(userId) {
            if (store.user && (store.user.id === userId || userId === 'u-guest')) {
                const u = store.user;
                u.kycStatus = 'verified';
                store.user = u;
            }
            showToast(`ユーザー ${userId} の本人確認を承認しました`, 'verified');
            renderAdmin(document.getElementById('app'), 'users');
        }

        function _renderAdminEvents(container) {
            const events = store.events;
            container.innerHTML = `
                <h1 class="text-2xl font-bold text-slate-800 mb-6">イベント監査</h1>
                <div class="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-slate-50 text-slate-500 text-xs uppercase">
                            <tr>
                                <th class="p-4">イベント名</th>
                                <th class="p-4">主催者</th>
                                <th class="p-4">価格</th>
                                <th class="p-4">ステータス</th>
                                <th class="p-4">操作</th>
                            </tr>
                        </thead>
                        <tbody class="text-sm text-slate-700">
                            ${events.map(evt => `
                                <tr class="border-b border-slate-50 hover:bg-slate-50 transition">
                                    <td class="p-4 font-bold max-w-xs truncate">${evt.title}</td>
                                    <td class="p-4">${evt.organizer_name}</td>
                                    <td class="p-4">¥${evt.price.toLocaleString()}</td>
                                    <td class="p-4"><span class="px-2 py-1 bg-green-100 text-green-600 rounded text-xs font-bold">${evt.status}</span></td>
                                    <td class="p-4">
                                        <button onclick="store.deleteEvent('${evt.event_id}'); renderAdmin(document.getElementById('app'), 'events')" class="text-red-500 hover:text-red-700 font-bold text-xs border border-red-200 px-2 py-1 rounded bg-red-50">強制削除</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        function _renderAdminFinance(container) {
            const payouts = [
                { id: 'py-001', organizer: 'LinkUp Official', amount: 45000, date: '2026-02-01', status: 'pending' },
                { id: 'py-002', organizer: 'NextGen Creators', amount: 120000, date: '2026-01-28', status: 'completed' }
            ];

            container.innerHTML = `
                <h1 class="text-2xl font-bold text-slate-800 mb-6">財務・振込管理</h1>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <p class="text-slate-500 text-xs font-bold">今月の流通総額 (GMV)</p>
                        <p class="text-2xl font-bold text-slate-800">¥4,250,000</p>
                    </div>
                    <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <p class="text-slate-500 text-xs font-bold">プラットフォーム収益</p>
                        <p class="text-2xl font-bold text-blue-600">¥212,500</p>
                    </div>
                    <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <p class="text-slate-500 text-xs font-bold">振込待ち金額</p>
                        <p class="text-2xl font-bold text-orange-500">¥45,000</p>
                    </div>
                </div>

                <h3 class="font-bold text-slate-800 mb-4">振込申請一覧</h3>
                <div class="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
                    <table class="w-full text-left">
                        <thead class="bg-slate-50 text-slate-500 text-xs">
                            <tr>
                                <th class="p-4">申請ID</th>
                                <th class="p-4">主催者</th>
                                <th class="p-4">申請額</th>
                                <th class="p-4">申請日</th>
                                <th class="p-4">ステータス</th>
                                <th class="p-4">操作</th>
                            </tr>
                        </thead>
                        <tbody class="text-sm text-slate-700">
                            ${payouts.map(p => `
                                <tr class="border-b hover:bg-slate-50">
                                    <td class="p-4 font-mono text-xs">${p.id}</td>
                                    <td class="p-4 font-bold">${p.organizer}</td>
                                    <td class="p-4">¥${p.amount.toLocaleString()}</td>
                                    <td class="p-4">${p.date}</td>
                                    <td class="p-4">
                                        <span class="px-2 py-1 rounded text-xs font-bold 
                                            ${p.status === 'completed' ? 'bg-slate-100 text-slate-500' : 'bg-orange-100 text-orange-600'}">
                                            ${p.status === 'completed' ? '完了済' : '承認待ち'}
                                        </span>
                                    </td>
                                    <td class="p-4">
                                        ${p.status === 'pending' ? 
                                            `<button onclick="alert('振込処理を実行しました'); renderAdmin(document.getElementById('app'), 'finance')" class="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-700 shadow">承認・実行</button>` : 
                                            '<span class="text-slate-300 text-xs">-</span>'}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        function _renderAdminSettings(container) {
            const settings = store.systemSettings;
            container.innerHTML = `
                <h1 class="text-2xl font-bold text-slate-800 mb-6">システム設定</h1>
                
                <div class="space-y-6 max-w-3xl">
                    <div class="bg-white p-6 rounded-2xl shadow-card border border-slate-100">
                        <h3 class="font-bold text-lg mb-4 text-slate-700">収益モデル設定</h3>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="font-bold text-sm">プラットフォーム手数料 (%)</p>
                                    <p class="text-xs text-slate-500">チケット販売ごとに徴収する手数料率</p>
                                </div>
                                <input type="number" value="${settings.revenueModel.platformFee.rate}" class="w-20 p-2 border rounded text-right" id="sys-fee-rate">
                            </div>
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="font-bold text-sm">早期振込手数料 (%)</p>
                                    <p class="text-xs text-slate-500">早期振込利用時の追加手数料</p>
                                </div>
                                <input type="number" value="${settings.revenueModel.earlyPayout.rate}" class="w-20 p-2 border rounded text-right" id="sys-early-rate">
                            </div>
                        </div>
                        <div class="mt-6 text-right">
                            <button onclick="saveSystemSettings()" class="bg-slate-800 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-900">設定を保存</button>
                        </div>
                    </div>

                    <div class="bg-white p-6 rounded-2xl shadow-card border border-red-100">
                        <h3 class="font-bold text-lg mb-4 text-red-600 flex items-center"><span class="material-icons-outlined mr-2">dangerous</span>デモデータ管理</h3>
                        <p class="text-sm text-slate-600 mb-4">
                            データベース上の全てのイベント、チケット、ユーザーデータを削除し、デモアカウントを初期化します。<br>
                            リセット後は <code>admin@linkup.example.com</code> / <code>demo123</code> でログインできます。
                        </p>
                        <button onclick="if(confirm('本当にリセットしますか？')) { resetDatabase(); }" class="bg-red-50 text-red-600 border border-red-200 px-6 py-2 rounded-lg font-bold hover:bg-red-100 transition">
                            全データを削除 (Reset DB)
                        </button>
                    </div>
                </div>
            `;
        }

        function saveSystemSettings() {
            const feeRate = parseFloat(document.getElementById('sys-fee-rate').value);
            const earlyRate = parseFloat(document.getElementById('sys-early-rate').value);
            
            const s = store.systemSettings;
            s.revenueModel.platformFee.rate = feeRate;
            s.revenueModel.earlyPayout.rate = earlyRate;
            store.systemSettings = s;
            
            showToast('システム設定を保存しました', 'settings');
        }

        async function resetDatabase() {
            try {
                const res = await fetch(`${API_URL}/api/admin/reset`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${store.token}` }
                });
                const data = await res.json();
                if (data.success) {
                    showToast('データをリセットしました', 'delete');
                    // Reload events
                    await store.init();
                    renderAdmin(document.getElementById('app'), 'settings');
                } else {
                    showToast('リセット失敗: ' + data.error, 'error');
                }
            } catch(e) { 
                console.error(e);
                showToast('通信エラー', 'error'); 
            }
        }
        
        function approveKYC() {
            if(store.user) {
                const u = store.user;
                u.kycStatus = 'verified';
                store.user = u;
                renderAdmin(document.getElementById('app'));
                showToast('ユーザーのKYCを承認しました', 'verified');
            }
        }
