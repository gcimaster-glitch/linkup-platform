/**
 * LinkUp Platform - Payments Page Module
 * Handles payment history and transaction records
 * 
 * Author: Professional Team
 * Date: 2026-02-21
 * Phase: 1 - Day 2 - Page Module Separation
 */

// Render Payments Tab
async function renderPaymentsTab() {
    try {
        // Get payment history from API
        const payments = await API.User.getPaymentHistory();
        
        return `
            ${renderPageGuide(
                '決済履歴',
                '過去の決済履歴を確認できます。',
                [
                    '各決済の詳細情報を確認できます',
                    '領収書のダウンロードが可能です',
                    '決済ステータスでフィルタリングできます'
                ]
            )}
            <div class="space-y-6">
                ${renderPaymentFilters()}
                
                <div>
                    <h4 class="font-bold text-slate-800 mb-3">決済履歴 (${payments.length}件)</h4>
                    ${payments.length === 0 ? renderEmptyPayments() : renderPaymentsList(payments)}
                </div>
                
                ${payments.length > 0 ? renderPaymentsSummary(payments) : ''}
            </div>
        `;
    } catch (error) {
        console.error('❌ Failed to load payments:', error);
        
        // Fallback to demo data
        return renderPaymentsWithDemoData();
    }
}

// Render with Demo Data (Fallback)
function renderPaymentsWithDemoData() {
    const demoPayments = [
        {
            id: 'PAY_001',
            order_number: 'ORD_20240115_001',
            event_title: '東京テックカンファレンス 2024',
            amount: 5000,
            status: 'completed',
            payment_method: 'credit_card',
            created_at: '2024-01-15T10:30:00Z',
            receipt_url: '#'
        },
        {
            id: 'PAY_002',
            order_number: 'ORD_20240120_002',
            event_title: '音楽フェスティバル Spring',
            amount: 8000,
            status: 'completed',
            payment_method: 'bank_transfer',
            created_at: '2024-01-20T14:20:00Z',
            receipt_url: '#'
        }
    ];
    
    return `
        ${renderPageGuide(
            '決済履歴',
            '過去の決済履歴を確認できます。',
            [
                '各決済の詳細情報を確認できます',
                '領収書のダウンロードが可能です',
                '決済ステータスでフィルタリングできます'
            ]
        )}
        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
            <div class="flex items-start">
                <span class="material-icons-outlined text-yellow-600 mr-3">warning</span>
                <div>
                    <p class="text-sm text-yellow-800">デモデータを表示しています。実際の決済履歴はAPIから取得されます。</p>
                </div>
            </div>
        </div>
        
        <div class="space-y-6">
            ${renderPaymentFilters()}
            
            <div>
                <h4 class="font-bold text-slate-800 mb-3">決済履歴 (${demoPayments.length}件)</h4>
                ${renderPaymentsList(demoPayments)}
            </div>
            
            ${renderPaymentsSummary(demoPayments)}
        </div>
    `;
}

// Render Empty State
function renderEmptyPayments() {
    return `
        <div class="text-center py-12 bg-slate-50 rounded-xl">
            <span class="material-icons-outlined text-slate-300 text-6xl mb-3">receipt_long</span>
            <p class="text-slate-700 font-bold mb-2">決済履歴がありません</p>
            <p class="text-slate-500 text-sm mb-4">チケットを購入すると、ここに決済履歴が表示されます。</p>
            <button onclick="router('events')" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                <span class="material-icons-outlined text-sm mr-2 align-middle">search</span>
                イベントを探す
            </button>
        </div>
    `;
}

// Render Payment Filters
function renderPaymentFilters() {
    return `
        <div class="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4 flex-wrap">
            <label class="text-sm font-bold text-slate-700">フィルター:</label>
            <select class="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" onchange="filterPayments(this.value)">
                <option value="all">すべて</option>
                <option value="completed">支払済</option>
                <option value="pending">保留中</option>
                <option value="refunded">返金済</option>
            </select>
            
            <select class="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" onchange="filterPaymentsByMethod(this.value)">
                <option value="all">すべての支払方法</option>
                <option value="credit_card">クレジットカード</option>
                <option value="bank_transfer">銀行振込</option>
                <option value="convenience_store">コンビニ払い</option>
            </select>
            
            <button onclick="exportPayments()" class="ml-auto px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition text-sm font-bold">
                <span class="material-icons-outlined text-sm mr-1 align-middle">download</span>
                エクスポート
            </button>
        </div>
    `;
}

// Render Payments List
function renderPaymentsList(payments) {
    return `
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm bg-white rounded-xl shadow-sm">
                <thead class="bg-slate-50 text-slate-600 text-xs uppercase">
                    <tr>
                        <th class="p-3">決済ID</th>
                        <th class="p-3">注文番号</th>
                        <th class="p-3">イベント名</th>
                        <th class="p-3">金額</th>
                        <th class="p-3">支払方法</th>
                        <th class="p-3">ステータス</th>
                        <th class="p-3">決済日時</th>
                        <th class="p-3">アクション</th>
                    </tr>
                </thead>
                <tbody>
                    ${payments.map((payment, index) => {
                        const date = new Date(payment.created_at);
                        const formattedDate = date.toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                        
                        return `
                            <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} border-b border-slate-100 hover:bg-blue-50 transition">
                                <td class="p-3 font-mono text-xs text-slate-600">${payment.id}</td>
                                <td class="p-3 font-mono text-xs text-slate-600">#${payment.order_number}</td>
                                <td class="p-3">
                                    <div class="font-bold text-slate-800">${payment.event_title}</div>
                                </td>
                                <td class="p-3 font-bold text-slate-800">¥${payment.amount.toLocaleString()}</td>
                                <td class="p-3">
                                    ${renderPaymentMethod(payment.payment_method)}
                                </td>
                                <td class="p-3">
                                    ${renderPaymentStatus(payment.status)}
                                </td>
                                <td class="p-3 text-xs text-slate-600">${formattedDate}</td>
                                <td class="p-3">
                                    <button onclick="downloadReceipt('${payment.id}')" class="text-blue-600 hover:text-blue-800 text-sm" title="領収書をダウンロード">
                                        <span class="material-icons-outlined text-sm">receipt</span>
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

// Render Payment Method Badge
function renderPaymentMethod(method) {
    const methodConfig = {
        'credit_card': { icon: 'credit_card', label: 'クレジットカード' },
        'bank_transfer': { icon: 'account_balance', label: '銀行振込' },
        'convenience_store': { icon: 'store', label: 'コンビニ払い' },
        'paypal': { icon: 'payments', label: 'PayPal' }
    };
    
    const config = methodConfig[method] || { icon: 'payment', label: '不明' };
    
    return `
        <div class="flex items-center text-slate-600">
            <span class="material-icons-outlined text-sm mr-1">${config.icon}</span>
            <span class="text-xs">${config.label}</span>
        </div>
    `;
}

// Render Payment Status Badge
function renderPaymentStatus(status) {
    const statusConfig = {
        'completed': { bg: 'bg-green-100', text: 'text-green-600', label: '支払済' },
        'pending': { bg: 'bg-yellow-100', text: 'text-yellow-600', label: '保留中' },
        'refunded': { bg: 'bg-gray-100', text: 'text-gray-600', label: '返金済' },
        'failed': { bg: 'bg-red-100', text: 'text-red-600', label: '失敗' }
    };
    
    const config = statusConfig[status] || statusConfig['pending'];
    
    return `
        <span class="px-2 py-1 rounded text-xs font-bold ${config.bg} ${config.text}">
            ${config.label}
        </span>
    `;
}

// Render Payments Summary
function renderPaymentsSummary(payments) {
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const completedPayments = payments.filter(p => p.status === 'completed').length;
    const avgAmount = payments.length > 0 ? Math.round(totalAmount / payments.length) : 0;
    
    return `
        <div>
            <h4 class="font-bold text-slate-800 mb-3">決済サマリー</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-white p-6 rounded-xl shadow-card">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-bold text-slate-700">総決済件数</span>
                        <span class="material-icons-outlined text-blue-500">receipt_long</span>
                    </div>
                    <p class="text-2xl font-bold text-slate-800">${payments.length}件</p>
                    <p class="text-xs text-slate-500 mt-1">これまでの決済回数</p>
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
                        <span class="text-sm font-bold text-slate-700">平均支払額</span>
                        <span class="material-icons-outlined text-purple-500">trending_up</span>
                    </div>
                    <p class="text-2xl font-bold text-slate-800">¥${avgAmount.toLocaleString()}</p>
                    <p class="text-xs text-slate-500 mt-1">1回あたりの平均</p>
                </div>
            </div>
        </div>
    `;
}

// Helper: Render Page Guide
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

// Helper Functions (placeholders for future implementation)
function filterPayments(status) {
    console.log('Filter by status:', status);
    // TODO: Implement filtering logic
}

function filterPaymentsByMethod(method) {
    console.log('Filter by method:', method);
    // TODO: Implement filtering logic
}

function exportPayments() {
    console.log('Export payments');
    // TODO: Implement export functionality
}

function downloadReceipt(paymentId) {
    console.log('Download receipt for:', paymentId);
    // TODO: Implement receipt download
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        renderPaymentsTab,
        renderEmptyPayments,
        renderPaymentsList,
        renderPaymentsSummary
    };
}
