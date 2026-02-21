/**
 * LinkUp Platform - Tickets Page Module
 * Handles ticket listing and management
 * 
 * Author: Professional Team
 * Date: 2026-02-21
 * Phase: 1 - Day 2 - Page Module Separation
 */

// Render Tickets Tab
async function renderTicketsTab() {
    try {
        const orders = await API.User.getOrders();
        
        return `
            ${renderPageGuide(
                'チケット管理',
                'ここでは購入したすべてのチケットを確認・管理できます。',
                [
                    'チケットをクリックすると詳細とQRコードが表示されます',
                    'イベント名をクリックするとイベント詳細ページへ移動します',
                    '過去のチケットも履歴として確認できます'
                ]
            )}
            <div class="space-y-6">
                <div>
                    <h4 class="font-bold text-slate-800 mb-3">チケット購入履歴 (${orders.length}件)</h4>
                    ${orders.length === 0 ? renderEmptyTickets() : renderTicketsList(orders)}
                </div>
                
                ${orders.length > 0 ? renderTicketsSummary(orders) : ''}
            </div>
        `;
    } catch (error) {
        console.error('❌ Failed to load tickets:', error);
        return renderTicketsError(error);
    }
}

// Render Empty State
function renderEmptyTickets() {
    return `
        <div class="text-center py-12 bg-slate-50 rounded-xl">
            <span class="material-icons-outlined text-slate-300 text-6xl mb-3">confirmation_number</span>
            <p class="text-slate-700 font-bold mb-2">まだチケットを購入していません</p>
            <p class="text-slate-500 text-sm mb-4">素敵なイベントを見つけて、チケットを購入しましょう！</p>
            <button onclick="router('events')" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                <span class="material-icons-outlined text-sm mr-2 align-middle">search</span>
                イベントを探す
            </button>
        </div>
    `;
}

// Render Tickets List
function renderTicketsList(orders) {
    return `
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm bg-white rounded-xl shadow-sm">
                <thead class="bg-slate-50 text-slate-600 text-xs uppercase">
                    <tr>
                        <th class="p-3">注文番号</th>
                        <th class="p-3">イベント名</th>
                        <th class="p-3">購入日</th>
                        <th class="p-3">金額</th>
                        <th class="p-3">ステータス</th>
                        <th class="p-3">会場</th>
                        <th class="p-3">アクション</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map((order, index) => {
                        const date = new Date(order.created_at);
                        const formattedDate = date.toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        });
                        
                        return `
                            <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} border-b border-slate-100 hover:bg-blue-50 transition">
                                <td class="p-3 font-mono text-xs text-slate-600">#${order.order_number}</td>
                                <td class="p-3">
                                    <div class="font-bold text-slate-800">${order.event_title || '未設定'}</div>
                                    <div class="text-xs text-slate-500">${order.venue_name || ''}</div>
                                </td>
                                <td class="p-3 text-slate-600">${formattedDate}</td>
                                <td class="p-3 font-bold text-slate-800">¥${order.total_amount.toLocaleString()}</td>
                                <td class="p-3">
                                    ${renderPaymentStatus(order.payment_status)}
                                </td>
                                <td class="p-3 text-xs text-slate-600">${order.venue_name || '未設定'}</td>
                                <td class="p-3">
                                    <button onclick="router('event', { id: '${order.event_id}' })" class="text-blue-600 hover:text-blue-800 text-sm">
                                        <span class="material-icons-outlined text-sm">visibility</span>
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Render Payment Status Badge
function renderPaymentStatus(status) {
    const statusConfig = {
        'completed': { bg: 'bg-green-100', text: 'text-green-600', label: '支払済' },
        'pending': { bg: 'bg-yellow-100', text: 'text-yellow-600', label: '保留中' },
        'cancelled': { bg: 'bg-red-100', text: 'text-red-600', label: 'キャンセル' },
        'refunded': { bg: 'bg-gray-100', text: 'text-gray-600', label: '返金済' }
    };
    
    const config = statusConfig[status] || statusConfig['pending'];
    
    return `
        <span class="px-2 py-1 rounded text-xs font-bold ${config.bg} ${config.text}">
            ${config.label}
        </span>
    `;
}

// Render Tickets Summary
function renderTicketsSummary(orders) {
    const totalAmount = orders.reduce((sum, o) => sum + o.total_amount, 0);
    const completedOrders = orders.filter(o => o.payment_status === 'completed').length;
    const upcomingEvents = orders.filter(o => {
        const eventDate = new Date(o.event_date);
        return eventDate > new Date();
    }).length;
    
    return `
        <div>
            <h4 class="font-bold text-slate-800 mb-3">決済サマリー</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-white p-6 rounded-xl shadow-card">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-bold text-slate-700">総購入件数</span>
                        <span class="material-icons-outlined text-blue-500">confirmation_number</span>
                    </div>
                    <p class="text-2xl font-bold text-slate-800">${orders.length}件</p>
                    <p class="text-xs text-slate-500 mt-1">これまでの購入チケット</p>
                </div>
                <div class="bg-white p-6 rounded-xl shadow-card">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-bold text-slate-700">総支払額</span>
                        <span class="material-icons-outlined text-green-500">payments</span>
                    </div>
                    <p class="text-2xl font-bold text-slate-800">¥${totalAmount.toLocaleString()}</p>
                    <p class="text-xs text-slate-500 mt-1">合計金額</p>
                </div>
                <div class="bg-white p-6 rounded-xl shadow-card">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-bold text-slate-700">今後のイベント</span>
                        <span class="material-icons-outlined text-purple-500">event</span>
                    </div>
                    <p class="text-2xl font-bold text-slate-800">${upcomingEvents}件</p>
                    <p class="text-xs text-slate-500 mt-1">参加予定のイベント</p>
                </div>
            </div>
        </div>
    `;
}

// Render Error State
function renderTicketsError(error) {
    return `
        <div class="text-center py-12 bg-white rounded-xl shadow-card">
            <span class="material-icons-outlined text-red-500 text-6xl mb-3">error</span>
            <p class="text-slate-700 font-bold mb-2">チケットの読み込みに失敗しました</p>
            <p class="text-slate-500 text-sm mb-4">${error.message}</p>
            <button onclick="router('dashboard_tickets')" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                <span class="material-icons-outlined text-sm mr-2 align-middle">refresh</span>
                再試行
            </button>
        </div>
    `;
}

// Render Page Guide (Helper)
function renderPageGuide(title, description, tips) {
    return `
        <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
            <div class="flex items-start">
                <span class="material-icons-outlined text-blue-500 mr-3">info</span>
                <div>
                    <h4 class="font-bold text-blue-900 mb-1">${title}</h4>
                    <p class="text-sm text-blue-800 mb-2">${description}</p>
                    <ul class="text-xs text-blue-700 space-y-1">
                        ${tips.map(tip => `<li class="flex items-start"><span class="mr-2">•</span><span>${tip}</span></li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        renderTicketsTab,
        renderEmptyTickets,
        renderTicketsList,
        renderTicketsSummary,
        renderTicketsError
    };
}
