/**
 * LinkUp Platform - Events Page Module
 * Handles event listing, search, and detail views
 * 
 * Author: Professional Team
 * Date: 2026-02-21
 * Phase: 1 - Day 2 - Page Module Separation
 */

// Render Events List Page
async function renderEventsPage(container, params = {}) {
    try {
        const events = await API.Event.list();
        const category = params.category || 'all';
        
        const filteredEvents = category === 'all' 
            ? events 
            : events.filter(e => e.category === category);
        
        container.innerHTML = `
            <div class="events-page">
                <!-- Hero Section -->
                ${renderEventsHero()}
                
                <!-- Category Filter -->
                ${renderCategoryFilter(category)}
                
                <!-- Events Grid -->
                <div class="container mx-auto px-4 py-8">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-2xl font-bold text-slate-800">
                            ${category === 'all' ? 'すべてのイベント' : getCategoryName(category)}
                            <span class="text-slate-500 text-lg ml-2">(${filteredEvents.length}件)</span>
                        </h2>
                        
                        <div class="flex items-center gap-3">
                            <select class="px-4 py-2 border border-slate-300 rounded-lg text-sm" onchange="sortEvents(this.value)">
                                <option value="date_asc">開催日順（近い順）</option>
                                <option value="date_desc">開催日順（遠い順）</option>
                                <option value="popular">人気順</option>
                                <option value="price_asc">価格順（安い順）</option>
                                <option value="price_desc">価格順（高い順）</option>
                            </select>
                        </div>
                    </div>
                    
                    ${filteredEvents.length === 0 ? renderNoEvents() : renderEventsGrid(filteredEvents)}
                </div>
            </div>
        `;
    } catch (error) {
        console.error('❌ Failed to load events:', error);
        container.innerHTML = renderEventsError(error);
    }
}

// Render Events Hero
function renderEventsHero() {
    return `
        <div class="events-hero bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
            <div class="container mx-auto px-4 text-center">
                <h1 class="text-4xl md:text-5xl font-bold mb-4">イベントを探す</h1>
                <p class="text-lg text-blue-100 mb-8">日本最大級のイベントプラットフォーム</p>
                
                <!-- Search Bar -->
                <div class="max-w-2xl mx-auto">
                    <div class="flex bg-white rounded-lg shadow-xl overflow-hidden">
                        <input 
                            type="text" 
                            placeholder="イベント名、キーワードで検索..." 
                            class="flex-1 px-6 py-4 text-slate-800 focus:outline-none"
                            onkeypress="if(event.key === 'Enter') searchEvents(this.value)"
                        >
                        <button onclick="searchEvents(document.querySelector('input').value)" class="px-8 bg-blue-600 hover:bg-blue-700 transition">
                            <span class="material-icons-outlined">search</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Render Category Filter
function renderCategoryFilter(activeCategory) {
    const categories = [
        { id: 'all', name: 'すべて', icon: 'apps' },
        { id: 'music', name: '音楽', icon: 'music_note' },
        { id: 'sports', name: 'スポーツ', icon: 'sports_soccer' },
        { id: 'art', name: 'アート', icon: 'palette' },
        { id: 'food', name: 'グルメ', icon: 'restaurant' },
        { id: 'tech', name: 'テクノロジー', icon: 'computer' },
        { id: 'business', name: 'ビジネス', icon: 'business_center' },
        { id: 'education', name: '教育', icon: 'school' },
        { id: 'community', name: 'コミュニティ', icon: 'groups' }
    ];
    
    return `
        <div class="bg-white border-b border-slate-200">
            <div class="container mx-auto px-4">
                <div class="flex items-center gap-2 py-4 overflow-x-auto">
                    ${categories.map(cat => `
                        <button 
                            onclick="router('events', { category: '${cat.id}' })"
                            class="flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                                activeCategory === cat.id 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }"
                        >
                            <span class="material-icons-outlined text-sm">${cat.icon}</span>
                            <span class="font-bold text-sm whitespace-nowrap">${cat.name}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// Render Events Grid
function renderEventsGrid(events) {
    return `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${events.map(event => renderEventCard(event)).join('')}
        </div>
    `;
}

// Render Event Card
function renderEventCard(event) {
    const date = new Date(event.date);
    const formattedDate = date.toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric'
    });
    
    return `
        <div class="bg-white rounded-xl shadow-card hover:shadow-xl transition cursor-pointer overflow-hidden" onclick="router('event', { id: '${event.id}' })">
            <!-- Event Image -->
            <div class="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
                ${event.image ? `
                    <img src="${event.image}" alt="${event.title}" class="w-full h-full object-cover">
                ` : `
                    <div class="flex items-center justify-center h-full">
                        <span class="material-icons-outlined text-white text-6xl">${getCategoryIcon(event.category)}</span>
                    </div>
                `}
                
                <!-- Date Badge -->
                <div class="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow-lg">
                    <div class="text-2xl font-bold text-blue-600">${date.getDate()}</div>
                    <div class="text-xs text-slate-600">${date.toLocaleDateString('ja-JP', { month: 'short' })}</div>
                </div>
                
                <!-- Favorite Button -->
                <button class="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition" onclick="event.stopPropagation(); toggleFavorite('${event.id}')">
                    <span class="material-icons-outlined text-pink-500">favorite_border</span>
                </button>
            </div>
            
            <!-- Event Info -->
            <div class="p-5">
                <!-- Category Badge -->
                <div class="flex items-center gap-2 mb-2">
                    <span class="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs font-bold">${getCategoryName(event.category)}</span>
                    ${event.is_online ? '<span class="px-2 py-1 bg-green-100 text-green-600 rounded text-xs font-bold">オンライン</span>' : ''}
                </div>
                
                <!-- Title -->
                <h3 class="font-bold text-slate-800 text-lg mb-2 line-clamp-2">${event.title}</h3>
                
                <!-- Date & Location -->
                <div class="space-y-2 text-sm text-slate-600 mb-4">
                    <div class="flex items-center">
                        <span class="material-icons-outlined text-sm mr-2">event</span>
                        <span>${date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div class="flex items-center">
                        <span class="material-icons-outlined text-sm mr-2">${event.is_online ? 'language' : 'place'}</span>
                        <span class="truncate">${event.venue}</span>
                    </div>
                </div>
                
                <!-- Price & Capacity -->
                <div class="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div>
                        <span class="text-xs text-slate-500">から</span>
                        <span class="text-xl font-bold text-blue-600">¥${(event.price || 0).toLocaleString()}</span>
                    </div>
                    <div class="text-xs text-slate-500">
                        <span class="material-icons-outlined text-sm align-middle">people</span>
                        ${event.attendees || 0}/${event.capacity || '∞'}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Render No Events
function renderNoEvents() {
    return `
        <div class="text-center py-16">
            <span class="material-icons-outlined text-slate-300 text-8xl mb-4">event_busy</span>
            <p class="text-slate-700 font-bold text-xl mb-2">イベントが見つかりませんでした</p>
            <p class="text-slate-500 mb-6">別のカテゴリや検索条件をお試しください</p>
            <button onclick="router('events', { category: 'all' })" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                すべてのイベントを表示
            </button>
        </div>
    `;
}

// Render Events Error
function renderEventsError(error) {
    return `
        <div class="container mx-auto px-4 py-16 text-center">
            <span class="material-icons-outlined text-red-500 text-8xl mb-4">error</span>
            <p class="text-slate-700 font-bold text-xl mb-2">イベントの読み込みに失敗しました</p>
            <p class="text-slate-500 mb-6">${error.message}</p>
            <button onclick="location.reload()" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                <span class="material-icons-outlined text-sm mr-2 align-middle">refresh</span>
                再読み込み
            </button>
        </div>
    `;
}

// Helper Functions
function getCategoryName(categoryId) {
    const categories = {
        'all': 'すべて',
        'music': '音楽',
        'sports': 'スポーツ',
        'art': 'アート',
        'food': 'グルメ',
        'tech': 'テクノロジー',
        'business': 'ビジネス',
        'education': '教育',
        'community': 'コミュニティ'
    };
    return categories[categoryId] || 'その他';
}

function getCategoryIcon(categoryId) {
    const icons = {
        'music': 'music_note',
        'sports': 'sports_soccer',
        'art': 'palette',
        'food': 'restaurant',
        'tech': 'computer',
        'business': 'business_center',
        'education': 'school',
        'community': 'groups'
    };
    return icons[categoryId] || 'event';
}

function searchEvents(query) {
    console.log('Search events:', query);
    // TODO: Implement search functionality
}

function sortEvents(sortBy) {
    console.log('Sort events by:', sortBy);
    // TODO: Implement sort functionality
}

function toggleFavorite(eventId) {
    console.log('Toggle favorite:', eventId);
    // TODO: Implement favorite functionality
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        renderEventsPage,
        renderEventsHero,
        renderCategoryFilter,
        renderEventsGrid,
        renderEventCard
    };
}
