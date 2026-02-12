        // --- DATA & STORE ---
        // Version 8.1.0 - Real API Persistence
        const MASTER_VENUES = [
            { id: 'v-1', name: '渋谷ストリームホール', address: '東京都渋谷区渋谷3-21-3', layout: { rows: 10, cols: 12 } }, 
            { id: 'v-2', name: '東京国際フォーラム', address: '東京都千代田区丸の内3-5-1', layout: { rows: 20, cols: 20 } },
            { id: 'v-3', name: 'オンライン', address: 'Zoom Link', layout: null }
        ];

        const IMGS = {
            tech: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            business: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            art: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            music: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            social: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            festival: "https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            food: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            startups: "https://images.unsplash.com/photo-1559136555-930d72f1d300?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
        };

        // Demo Data Generator
        const MASTER_EVENTS = Array.from({ length: 30 }, (_, i) => {
            const categories = ['tech', 'business', 'art', 'music', 'social'];
            const cat = categories[i % categories.length];
            const startDate = new Date();
            startDate.setDate(startDate.getDate() + i + 1);
            startDate.setHours(10 + (i % 8), 0, 0);
            
            const endDate = new Date(startDate);
            endDate.setHours(startDate.getHours() + 3);

            return {
                event_id: `evt-${i}`,
                title: `${cat.toUpperCase()} Summit Vol.${i}: 未来のイノベーションと創造性`,
                category: cat,
                start_datetime: startDate.toISOString(),
                end_datetime: endDate.toISOString(),
                venue_name: i % 3 === 0 ? 'オンライン' : (i % 3 === 1 ? '東京国際フォーラム' : '渋谷ストリームホール'),
                venue_address: i % 3 === 0 ? 'Zoom Link' : '東京都千代田区丸の内3-5-1',
                cover_image_url: IMGS[cat],
                organizer_name: i % 2 === 0 ? 'LinkUp Official' : 'NextGen Creators',
                organizer_rating: (4 + Math.random()).toFixed(1),
                price: i % 5 === 0 ? 0 : (i + 1) * 1000,
                description: `
                    <div class="prose max-w-none text-slate-600">
                        <p>このイベントは、${cat}業界の最前線で活躍する専門家を招き、最新のトレンドや事例について深く掘り下げるセッションです。</p>
                        <h3 class="text-lg font-bold text-slate-800 mt-4 mb-2">ハイライト</h3>
                        <ul class="list-disc pl-5 mb-4">
                            <li>業界トップリーダーによる基調講演</li>
                            <li>実践的なワークショップとQ&Aセッション</li>
                            <li>参加者同士のネットワーキングパーティー</li>
                        </ul>
                        <p>初心者から上級者まで、どなたでもご参加いただけます。新たな知見と繋がりを得られるこの機会をお見逃しなく。</p>
                    </div>
                `,
                tickets: [
                    { id: `tkt-gen-${i}`, name: '一般参加チケット', price: i % 5 === 0 ? 0 : (i + 1) * 1000, desc: '全セッションへの参加権' },
                    { id: `tkt-vip-${i}`, name: 'VIPチケット', price: (i % 5 === 0 ? 0 : (i + 1) * 1000) + 5000, desc: '優先席 + 懇親会参加 + アーカイブ動画' }
                ],
                reviews: [
                    { user: 'Taro Y.', rating: 5, comment: '非常に有意義な時間でした！' },
                    { user: 'Hanako S.', rating: 4, comment: 'コンテンツは素晴らしかったですが、少し会場が寒かったです。' }
                ],
                status: 'published'
            };
        });

        const API_URL = "https://linkup-backend.gcimaster.workers.dev";

        const store = {
            get token() { return localStorage.getItem('token'); },
            set token(v) { 
                if(v) localStorage.setItem('token', v); 
                else localStorage.removeItem('token');
            },

            get user() { return JSON.parse(localStorage.getItem('user')); },
            set user(v) { 
                if(v) localStorage.setItem('user', JSON.stringify(v));
                else localStorage.removeItem('user');
            },

            get tickets() { return JSON.parse(localStorage.getItem('tickets')) || []; },
            set tickets(v) { localStorage.setItem('tickets', JSON.stringify(v)); },
            
            _events: [],
            get events() { 
                return this._events; 
            },
            set events(v) { 
                this._events = v;
                localStorage.setItem('events', JSON.stringify(v)); 
            },
            
            get followedOrganizers() { return JSON.parse(localStorage.getItem('followedOrganizers')) || []; },
            set followedOrganizers(v) { localStorage.setItem('followedOrganizers', JSON.stringify(v)); },
            
            cart: null, 
            
            get venues() {
                return JSON.parse(localStorage.getItem('venues')) || MASTER_VENUES;
            },
            set venues(v) { localStorage.setItem('venues', JSON.stringify(v)); },

            // API Login Logic
            async login(email, password) {
                try {
                    const res = await fetch(`${API_URL}/api/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password })
                    });
                    const data = await res.json();
                    if (data.success) {
                        this.user = data.user;
                        this.token = data.token;
                        return true;
                    } else {
                        console.error('Login error:', data.error);
                        return false;
                    }
                } catch (e) {
                    console.error('Login network error:', e);
                    return false;
                }
            },

            // Event CRUD (Real API)
            async addEvent(newEvent) {
                try {
                    const res = await fetch(`${API_URL}/api/events`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${this.token}`
                        },
                        body: JSON.stringify(newEvent)
                    });
                    const data = await res.json();
                    if (data.success) {
                        await this.init(); // Sync
                        showToast('イベントを作成しました', 'add_circle');
                    } else {
                        showToast('作成エラー: ' + (data.error || '不明なエラー'), 'error');
                    }
                } catch (e) {
                    console.error(e);
                    showToast('通信エラーが発生しました', 'error');
                }
            },
            
            async updateEvent(id, updatedFields) {
                try {
                    const res = await fetch(`${API_URL}/api/events/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${this.token}`
                        },
                        body: JSON.stringify(updatedFields)
                    });
                    const data = await res.json();
                    if (data.success) {
                        await this.init();
                        showToast('イベントを更新しました', 'save');
                    } else {
                        showToast('更新エラー: ' + data.error, 'error');
                    }
                } catch (e) {
                    showToast('通信エラー', 'error');
                }
            },
            
            async deleteEvent(id) {
                if(!confirm('本当にこのイベントを削除しますか？')) return;
                try {
                    const res = await fetch(`${API_URL}/api/events/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${this.token}`
                        }
                    });
                    const data = await res.json();
                    if (data.success) {
                        this.events = this.events.filter(e => e.event_id !== id);
                        showToast('イベントを削除しました', 'delete');
                    } else {
                        showToast('削除エラー: ' + data.error, 'error');
                    }
                } catch (e) {
                    showToast('通信エラー', 'error');
                }
            },
            
            get campaigns() { return JSON.parse(localStorage.getItem('campaigns')) || []; },
            set campaigns(v) { localStorage.setItem('campaigns', JSON.stringify(v)); },

            get organizerProfile() {
                return JSON.parse(localStorage.getItem('organizerProfile')) || {
                    name: 'LinkUp Official',
                    type: 'corporate', 
                    bio: 'イベントを通じて新しい価値を創造します。',
                    img: 'https://ui-avatars.com/api/?name=LinkUp+Official&background=2563EB&color=fff',
                    cover: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3',
                    links: { twitter: '', web: '', note: '' }
                };
            },
            updateOrganizerProfile(profile) {
                localStorage.setItem('organizerProfile', JSON.stringify(profile));
                showToast('プロフィールを保存しました', 'face');
            },
            
            get participants() { return JSON.parse(localStorage.getItem('participants')) || []; },

            get systemSettings() {
                return JSON.parse(localStorage.getItem('systemSettings')) || {
                    revenueModel: {
                        platformFee: { enabled: false, rate: 5 },
                        transactionFee: { enabled: false, amount: 100 },
                        subscription: { enabled: false, plans: [] },
                        ads: { enabled: false },
                        earlyPayout: { enabled: false, rate: 5 }
                    }
                };
            },
            set systemSettings(v) { localStorage.setItem('systemSettings', JSON.stringify(v)); },

            get adminSettings() {
                return JSON.parse(localStorage.getItem('adminSettings')) || {
                    aiEnabled: true,
                    aiFeatures: { eventGen: true, profileGen: true, supportChat: true },
                    apiKeys: { openai: '', gemini: '' }
                };
            },
            set adminSettings(v) { localStorage.setItem('adminSettings', JSON.stringify(v)); },

            completeEvent(id) {
                const updated = this.events.map(e => e.event_id === id ? { ...e, status: 'completed' } : e);
                this.events = updated;
                showToast('イベント完了報告を行いました。売上が確定しました。', 'verified');
            },

            async requestPayout(amount, isEarly) {
                if(!store.user) return;
                
                try {
                    const res = await fetch(`${API_URL}/api/organizer/payouts`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${this.token}`
                        },
                        body: JSON.stringify({ amount, is_early: isEarly })
                    });
                    
                    const data = await res.json();
                    
                    if (data.success) {
                        const feeRate = isEarly ? 5 : 0;
                        const feeAmount = Math.floor(amount * (feeRate / 100));
                        const finalAmount = amount - feeAmount;
                        
                        alert(`【振込申請を受け付けました】\n申請ID: ${data.payout_id}\n申請額: ¥${amount.toLocaleString()}\n手数料: ¥${feeAmount.toLocaleString()}\n振込予定額: ¥${finalAmount.toLocaleString()}\n\n入金までしばらくお待ちください。`);
                        
                        showToast('振込申請が完了しました', 'payments');
                        
                        const app = document.getElementById('app');
                        if (app && app.innerHTML.includes('売上・振込管理')) {
                            renderOrganizer(app, 'finance');
                        }
                    } else {
                        showToast('申請に失敗しました: ' + (data.error || '不明なエラー'), 'error');
                    }
                } catch (e) {
                    console.error(e);
                    showToast('通信エラーが発生しました', 'error');
                }
            },

            requestEarlyPayout(amount) {
                const fee = Math.floor(amount * 0.05);
                const final = amount - fee;
                if(confirm(`手数料5% (¥${fee.toLocaleString()}) を差し引いて早期振込申請を行いますか？\n\n振込予定額: ¥${final.toLocaleString()}\n入金予定: 3営業日以内`)) {
                    this.requestPayout(amount, true);
                }
            },

            async init() {
                // 1. Load from LocalStorage (Cache)
                let localData = [];
                const cached = localStorage.getItem('events');
                if (cached) {
                    localData = JSON.parse(cached);
                    this._events = localData;
                }

                // 2. Try Fetching from Real API
                try {
                    console.log('Fetching from Backend:', API_URL);
                    const res = await fetch(`${API_URL}/api/events`);
                    if (res.ok) {
                        const data = await res.json();
                        if (Array.isArray(data) && data.length > 0) {
                            this.events = data; 
                            // showToast('最新のイベント情報を同期しました', 'cloud_sync'); // Too noisy on reload
                        } else {
                            console.warn('API returned empty. Loading Demo Data...');
                            if (this._events.length === 0) {
                                this.events = MASTER_EVENTS;
                            }
                        }
                    } else {
                        console.warn('Backend unavailable, using Demo Data');
                        if (this._events.length === 0) {
                            this.events = MASTER_EVENTS;
                        }
                    }
                } catch (e) {
                    console.error('API Fetch Error:', e);
                    if (this._events.length === 0) {
                        this.events = MASTER_EVENTS;
                    }
                }
                
                const app = document.getElementById('app');
                if (app && app.querySelector('#event-list-container')) {
                    if (typeof renderHome === 'function') {
                        renderHome(app);
                    }
                }
            }
        };

        store.init();
