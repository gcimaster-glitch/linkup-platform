/**
 * LinkUp Platform - Home Page Module
 * Handles landing page and hero section
 * 
 * Author: Professional Team
 * Date: 2026-02-21
 * Phase: 1 - Day 2 - Page Module Separation
 */

// Render Home Page
async function renderHomePage(container) {
    try {
        // Load featured events
        const events = await API.Event.list();
        const featuredEvents = events.slice(0, 6);
        
        container.innerHTML = `
            ${renderHeroSection()}
            ${renderFeaturesSection()}
            ${renderFeaturedEvents(featuredEvents)}
            ${renderCategoriesSection()}
            ${renderCTASection()}
        `;
    } catch (error) {
        console.error('❌ Failed to load home page:', error);
        container.innerHTML = renderHomeError(error);
    }
}

// Render Hero Section
function renderHeroSection() {
    return `
        <div class="hero-section bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
            <div class="container mx-auto px-4">
                <div class="flex flex-col lg:flex-row items-center gap-12">
                    <!-- Hero Text -->
                    <div class="flex-1 text-center lg:text-left">
                        <h1 class="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                            日本最大級の<br>
                            <span class="text-yellow-300">イベントプラットフォーム</span>
                        </h1>
                        <p class="text-xl text-blue-100 mb-8">
                            音楽、スポーツ、アートなど、あらゆるイベントを簡単に見つけて参加しよう
                        </p>
                        
                        <!-- Search Bar -->
                        <div class="flex bg-white rounded-lg shadow-2xl overflow-hidden max-w-xl">
                            <input 
                                type="text" 
                                placeholder="イベントを検索..." 
                                class="flex-1 px-6 py-4 text-slate-800 focus:outline-none"
                                id="hero-search-input"
                                onkeypress="if(event.key === 'Enter') performHeroSearch()"
                            >
                            <button onclick="performHeroSearch()" class="px-8 bg-blue-600 hover:bg-blue-700 transition">
                                <span class="material-icons-outlined">search</span>
                            </button>
                        </div>
                        
                        <!-- Stats -->
                        <div class="flex items-center justify-center lg:justify-start gap-8 mt-8 text-sm">
                            <div>
                                <div class="text-3xl font-bold">10,000+</div>
                                <div class="text-blue-200">イベント</div>
                            </div>
                            <div>
                                <div class="text-3xl font-bold">500,000+</div>
                                <div class="text-blue-200">ユーザー</div>
                            </div>
                            <div>
                                <div class="text-3xl font-bold">1,000+</div>
                                <div class="text-blue-200">主催者</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Hero Image/Illustration -->
                    <div class="flex-1 hidden lg:flex items-center justify-center">
                        <div class="relative w-full h-96">
                            <!-- Animated illustration placeholder -->
                            <div class="absolute inset-0 flex items-center justify-center">
                                <span class="material-icons-outlined text-white/20" style="font-size: 300px;">event</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Render Features Section
function renderFeaturesSection() {
    const features = [
        {
            icon: 'search',
            title: '簡単検索',
            description: 'カテゴリ、日付、場所から簡単にイベントを見つけられます'
        },
        {
            icon: 'confirmation_number',
            title: 'オンラインチケット',
            description: 'スマホで簡単にチケット購入。QRコードで入場もスムーズ'
        },
        {
            icon: 'payment',
            title: '安全な決済',
            description: 'クレジットカード、コンビニ払いなど多様な決済方法に対応'
        },
        {
            icon: 'notifications',
            title: 'リアルタイム通知',
            description: 'お気に入りイベントの更新や新着情報を即座にお知らせ'
        }
    ];
    
    return `
        <div class="py-20 bg-slate-50">
            <div class="container mx-auto px-4">
                <div class="text-center mb-12">
                    <h2 class="text-4xl font-bold text-slate-800 mb-4">LinkUpの特徴</h2>
                    <p class="text-lg text-slate-600">簡単、安全、便利なイベント体験を提供します</p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    ${features.map(feature => `
                        <div class="bg-white p-8 rounded-xl shadow-card hover:shadow-xl transition text-center">
                            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span class="material-icons-outlined text-blue-600 text-3xl">${feature.icon}</span>
                            </div>
                            <h3 class="text-xl font-bold text-slate-800 mb-3">${feature.title}</h3>
                            <p class="text-slate-600">${feature.description}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// Render Featured Events
function renderFeaturedEvents(events) {
    if (!events || events.length === 0) {
        return '';
    }
    
    return `
        <div class="py-20 bg-white">
            <div class="container mx-auto px-4">
                <div class="flex items-center justify-between mb-8">
                    <div>
                        <h2 class="text-4xl font-bold text-slate-800 mb-2">注目のイベント</h2>
                        <p class="text-lg text-slate-600">今すぐ参加できる人気イベント</p>
                    </div>
                    <button onclick="router('events')" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                        すべて見る
                        <span class="material-icons-outlined text-sm ml-2 align-middle">arrow_forward</span>
                    </button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${events.map(event => renderEventCard(event)).join('')}
                </div>
            </div>
        </div>
    `;
}

// Render Event Card (reuse from events.js)
function renderEventCard(event) {
    const date = new Date(event.date);
    
    return `
        <div class="bg-white rounded-xl shadow-card hover:shadow-xl transition cursor-pointer overflow-hidden" onclick="router('event', { id: '${event.id}' })">
            <div class="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
                ${event.image ? `
                    <img src="${event.image}" alt="${event.title}" class="w-full h-full object-cover">
                ` : `
                    <div class="flex items-center justify-center h-full">
                        <span class="material-icons-outlined text-white text-6xl">event</span>
                    </div>
                `}
                <div class="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow-lg">
                    <div class="text-2xl font-bold text-blue-600">${date.getDate()}</div>
                    <div class="text-xs text-slate-600">${date.toLocaleDateString('ja-JP', { month: 'short' })}</div>
                </div>
            </div>
            
            <div class="p-5">
                <h3 class="font-bold text-slate-800 text-lg mb-2 line-clamp-2">${event.title}</h3>
                <div class="flex items-center text-sm text-slate-600 mb-4">
                    <span class="material-icons-outlined text-sm mr-2">${event.is_online ? 'language' : 'place'}</span>
                    <span class="truncate">${event.venue}</span>
                </div>
                <div class="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span class="text-xl font-bold text-blue-600">¥${(event.price || 0).toLocaleString()}</span>
                    <span class="text-xs text-slate-500">${event.attendees || 0}人参加</span>
                </div>
            </div>
        </div>
    `;
}

// Render Categories Section
function renderCategoriesSection() {
    const categories = [
        { id: 'music', name: '音楽', icon: 'music_note', color: 'from-pink-500 to-rose-500' },
        { id: 'sports', name: 'スポーツ', icon: 'sports_soccer', color: 'from-green-500 to-emerald-500' },
        { id: 'art', name: 'アート', icon: 'palette', color: 'from-purple-500 to-violet-500' },
        { id: 'food', name: 'グルメ', icon: 'restaurant', color: 'from-orange-500 to-amber-500' },
        { id: 'tech', name: 'テクノロジー', icon: 'computer', color: 'from-blue-500 to-cyan-500' },
        { id: 'business', name: 'ビジネス', icon: 'business_center', color: 'from-slate-700 to-slate-500' },
        { id: 'education', name: '教育', icon: 'school', color: 'from-indigo-500 to-blue-500' },
        { id: 'community', name: 'コミュニティ', icon: 'groups', color: 'from-teal-500 to-green-500' }
    ];
    
    return `
        <div class="py-20 bg-slate-50">
            <div class="container mx-auto px-4">
                <div class="text-center mb-12">
                    <h2 class="text-4xl font-bold text-slate-800 mb-4">カテゴリから探す</h2>
                    <p class="text-lg text-slate-600">興味のあるジャンルからイベントを見つけよう</p>
                </div>
                
                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    ${categories.map(cat => `
                        <button 
                            onclick="router('events', { category: '${cat.id}' })"
                            class="bg-gradient-to-br ${cat.color} p-6 rounded-xl shadow-card hover:shadow-xl transition text-white text-center group"
                        >
                            <span class="material-icons-outlined text-5xl mb-3 group-hover:scale-110 transition">${cat.icon}</span>
                            <div class="font-bold">${cat.name}</div>
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// Render CTA Section
function renderCTASection() {
    const isLoggedIn = !!store.user;
    
    return `
        <div class="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div class="container mx-auto px-4 text-center">
                <h2 class="text-4xl md:text-5xl font-bold mb-6">今すぐ始めよう</h2>
                <p class="text-xl text-blue-100 mb-8">
                    ${isLoggedIn 
                        ? '素敵なイベントを見つけて、新しい体験を始めましょう' 
                        : '無料でアカウントを作成して、イベントを探し始めましょう'}
                </p>
                
                <div class="flex items-center justify-center gap-4">
                    ${isLoggedIn ? `
                        <button onclick="router('events')" class="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition font-bold text-lg">
                            イベントを探す
                        </button>
                        <button onclick="router('dashboard')" class="px-8 py-4 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition font-bold text-lg">
                            マイページへ
                        </button>
                    ` : `
                        <button onclick="openAuthModal('register')" class="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition font-bold text-lg">
                            無料で始める
                        </button>
                        <button onclick="openAuthModal('login')" class="px-8 py-4 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition font-bold text-lg border-2 border-white/30">
                            ログイン
                        </button>
                    `}
                </div>
            </div>
        </div>
    `;
}

// Render Home Error
function renderHomeError(error) {
    return `
        <div class="container mx-auto px-4 py-16 text-center">
            <span class="material-icons-outlined text-red-500 text-8xl mb-4">error</span>
            <p class="text-slate-700 font-bold text-xl mb-2">ページの読み込みに失敗しました</p>
            <p class="text-slate-500 mb-6">${error.message}</p>
            <button onclick="location.reload()" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                <span class="material-icons-outlined text-sm mr-2 align-middle">refresh</span>
                再読み込み
            </button>
        </div>
    `;
}

// Helper Functions
function performHeroSearch() {
    const input = document.getElementById('hero-search-input');
    const query = input?.value || '';
    
    if (query.trim()) {
        router('events', { search: query });
    } else {
        router('events');
    }
}

function openAuthModal(mode = 'login') {
    // TODO: Implement auth modal
    console.log('Open auth modal:', mode);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        renderHomePage,
        renderHeroSection,
        renderFeaturesSection,
        renderFeaturedEvents,
        renderCategoriesSection,
        renderCTASection
    };
}
