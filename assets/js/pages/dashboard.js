/**
 * LinkUp Platform - Dashboard Page Module
 * Handles dashboard layout and subpage routing
 * 
 * Author: Professional Team
 * Date: 2026-02-21
 * Phase: 1 - Day 2 - Page Module Separation
 */

// Dashboard Layout Renderer
function renderDashboardPage(container, subpage = 'overview') {
    const unreadCount = (store.userInbox || []).filter(m => !m.read).length;
    
    container.innerHTML = `
        <div class="dashboard-layout">
            <!-- Profile Cover Header (Only on overview) -->
            ${subpage === 'overview' ? `
                <div class="dashboard-header-cover" style="background-image: linear-gradient(135deg, rgba(37,99,235,0.9), rgba(124,58,237,0.9)), url('${store.user.coverImage || store.coverImages[0].url}'); background-size: cover; background-position: center;">
                    <button onclick="openCoverImageModal()" class="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-white transition">
                        <span class="material-icons-outlined text-sm">edit</span>
                    </button>
                    <div class="dashboard-profile-card">
                        <div class="relative group">
                            <img src="${store.user.icon}" alt="${store.user.name}">
                            <button onclick="openProfileIconModal()" class="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                                <span class="material-icons-outlined">edit</span>
                            </button>
                        </div>
                        <div>
                            <h2 class="text-xl font-bold text-slate-800">${store.user.name}</h2>
                            <p class="text-sm text-slate-500">${store.user.email}</p>
                        </div>
                    </div>
                </div>
            ` : ''}
            
            <div class="dashboard-body">
                <!-- Side Navigation -->
                <aside class="dashboard-sidenav">
                    <a href="/dashboard" onclick="event.preventDefault(); router('dashboard'); return false;" 
                       class="nav-item ${subpage === 'overview' ? 'active' : ''}">
                        <span class="material-icons-outlined">dashboard</span>
                        <span>ダッシュボード</span>
                    </a>
                    <a href="/dashboard/tickets" onclick="event.preventDefault(); router('dashboard_tickets'); return false;" 
                       class="nav-item ${subpage === 'tickets' ? 'active' : ''}">
                        <span class="material-icons-outlined">confirmation_number</span>
                        <span>チケット</span>
                    </a>
                    <a href="/dashboard/inbox" onclick="event.preventDefault(); router('dashboard_inbox'); return false;" 
                       class="nav-item ${subpage === 'inbox' ? 'active' : ''}">
                        <span class="material-icons-outlined">inbox</span>
                        <span>受信箱</span>
                        ${unreadCount > 0 ? `<span class="badge">${unreadCount}</span>` : ''}
                    </a>
                    <a href="/dashboard/profile" onclick="event.preventDefault(); router('dashboard_profile'); return false;" 
                       class="nav-item ${subpage === 'profile' ? 'active' : ''}">
                        <span class="material-icons-outlined">person</span>
                        <span>プロフィール</span>
                    </a>
                    <a href="/dashboard/interests" onclick="event.preventDefault(); router('dashboard_interests'); return false;" 
                       class="nav-item ${subpage === 'interests' ? 'active' : ''}">
                        <span class="material-icons-outlined">favorite</span>
                        <span>興味・関心</span>
                    </a>
                    <a href="/dashboard/events" onclick="event.preventDefault(); router('dashboard_events'); return false;" 
                       class="nav-item ${subpage === 'events' ? 'active' : ''}">
                        <span class="material-icons-outlined">event</span>
                        <span>イベント管理</span>
                    </a>
                    <a href="/dashboard/payments" onclick="event.preventDefault(); router('dashboard_payments'); return false;" 
                       class="nav-item ${subpage === 'payments' ? 'active' : ''}">
                        <span class="material-icons-outlined">receipt</span>
                        <span>決済履歴</span>
                    </a>
                    <a href="/dashboard/support" onclick="event.preventDefault(); router('dashboard_support'); return false;" 
                       class="nav-item ${subpage === 'support' ? 'active' : ''}">
                        <span class="material-icons-outlined">support_agent</span>
                        <span>サポート</span>
                    </a>
                </aside>
                
                <!-- Main Content -->
                <main class="dashboard-content">
                    <!-- Breadcrumb -->
                    ${renderBreadcrumb(subpage)}
                    
                    <!-- Page Content -->
                    <div id="dashboard-subpage-content"></div>
                </main>
            </div>
        </div>
    `;
    
    // Render subpage content
    const contentDiv = container.querySelector('#dashboard-subpage-content');
    renderDashboardSubpage(contentDiv, subpage);
}

// Breadcrumb Navigation
function renderBreadcrumb(subpage) {
    const breadcrumbs = {
        'overview': ['ホーム', 'ダッシュボード'],
        'tickets': ['ホーム', 'ダッシュボード', 'チケット'],
        'inbox': ['ホーム', 'ダッシュボード', '受信箱'],
        'profile': ['ホーム', 'ダッシュボード', 'プロフィール'],
        'interests': ['ホーム', 'ダッシュボード', '興味・関心'],
        'events': ['ホーム', 'ダッシュボード', 'イベント管理'],
        'payments': ['ホーム', 'ダッシュボード', '決済履歴'],
        'support': ['ホーム', 'ダッシュボード', 'サポート'],
        'kyc': ['ホーム', 'ダッシュボード', '本人確認']
    };
    
    const crumbs = breadcrumbs[subpage] || ['ホーム', 'ダッシュボード'];
    
    return `
        <nav class="breadcrumb">
            ${crumbs.map((crumb, i) => `
                <span class="${i === crumbs.length - 1 ? 'active' : ''}">
                    ${i === 0 ? '<span class="material-icons-outlined" style="font-size:16px;">home</span>' : ''}
                    ${crumb}
                </span>
                ${i < crumbs.length - 1 ? '<span class="separator">/</span>' : ''}
            `).join('')}
        </nav>
    `;
}

// Render Subpage Content (delegates to appropriate tab renderers)
async function renderDashboardSubpage(container, subpage) {
    try {
        container.innerHTML = '<div class="text-center py-12"><span class="loading-spinner"></span><p class="mt-4 text-slate-500">読み込み中...</p></div>';
        
        let content;
        
        switch(subpage) {
            case 'tickets':
                content = await renderTicketsTab();
                break;
            case 'events':
                content = await renderEventsTab();
                break;
            case 'interests':
                content = await renderInterestsTab();
                break;
            case 'payments':
                content = await renderPaymentsTab();
                break;
            case 'overview':
            default:
                content = renderDashboardOverview();
                break;
        }
        
        container.innerHTML = content;
    } catch (error) {
        console.error('❌ Dashboard subpage render error:', error);
        container.innerHTML = `
            <div class="text-center py-12">
                <span class="material-icons-outlined text-red-500 text-6xl mb-3">error</span>
                <p class="text-slate-700 font-bold mb-2">エラーが発生しました</p>
                <p class="text-slate-500 text-sm">${error.message}</p>
                <button onclick="router('dashboard')" class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    ダッシュボードに戻る
                </button>
            </div>
        `;
    }
}

// Dashboard Overview Tab
function renderDashboardOverview() {
    const user = store.user;
    const events = store.events || [];
    const upcomingEvents = events.filter(e => new Date(e.date) > new Date()).slice(0, 3);
    
    return `
        <div class="space-y-6">
            <!-- Welcome Card -->
            <div class="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-xl text-white shadow-card">
                <h3 class="text-2xl font-bold mb-2">こんにちは、${user.name}さん！</h3>
                <p class="text-blue-100">今日も素敵なイベントを見つけましょう</p>
            </div>
            
            <!-- Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-white p-6 rounded-xl shadow-card">
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-sm font-bold text-slate-700">購入済みチケット</span>
                        <span class="material-icons-outlined text-blue-500">confirmation_number</span>
                    </div>
                    <p class="text-3xl font-bold text-slate-800">${(store.tickets || []).length}</p>
                    <p class="text-xs text-slate-500 mt-1">イベント参加予定</p>
                </div>
                
                <div class="bg-white p-6 rounded-xl shadow-card">
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-sm font-bold text-slate-700">お気に入り</span>
                        <span class="material-icons-outlined text-pink-500">favorite</span>
                    </div>
                    <p class="text-3xl font-bold text-slate-800">${(store.favorites || []).length}</p>
                    <p class="text-xs text-slate-500 mt-1">イベントを保存中</p>
                </div>
                
                <div class="bg-white p-6 rounded-xl shadow-card">
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-sm font-bold text-slate-700">興味・関心</span>
                        <span class="material-icons-outlined text-purple-500">category</span>
                    </div>
                    <p class="text-3xl font-bold text-slate-800">${(user.interests || []).length}</p>
                    <p class="text-xs text-slate-500 mt-1">タグを設定済み</p>
                </div>
            </div>
            
            <!-- Upcoming Events -->
            <div class="bg-white p-6 rounded-xl shadow-card">
                <h4 class="font-bold text-slate-800 mb-4 flex items-center">
                    <span class="material-icons-outlined mr-2">event</span>
                    今後のイベント
                </h4>
                ${upcomingEvents.length === 0 ? `
                    <div class="text-center py-8 text-slate-500">
                        <span class="material-icons-outlined text-slate-300 text-5xl mb-2">event_busy</span>
                        <p>予定されているイベントはありません</p>
                        <button onclick="router('events')" class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            イベントを探す
                        </button>
                    </div>
                ` : `
                    <div class="space-y-3">
                        ${upcomingEvents.map(event => `
                            <div class="flex items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer" onclick="router('event', { id: '${event.id}' })">
                                <div class="flex-shrink-0 w-16 h-16 bg-blue-500 rounded-lg flex flex-col items-center justify-center text-white mr-4">
                                    <span class="text-2xl font-bold">${new Date(event.date).getDate()}</span>
                                    <span class="text-xs">${new Date(event.date).toLocaleDateString('ja-JP', { month: 'short' })}</span>
                                </div>
                                <div class="flex-1">
                                    <h5 class="font-bold text-slate-800">${event.title}</h5>
                                    <p class="text-sm text-slate-500">${event.venue}</p>
                                </div>
                                <span class="material-icons-outlined text-slate-400">chevron_right</span>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        </div>
    `;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        renderDashboardPage,
        renderBreadcrumb,
        renderDashboardSubpage,
        renderDashboardOverview
    };
}
