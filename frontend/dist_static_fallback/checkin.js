// ============================================
// チェックイン管理機能
// ============================================

// QRコード生成
async function generateTicketQR(ticketId) {
    const qrData = `LINKUP:${ticketId}:${Date.now()}`;
    const canvas = document.createElement('canvas');
    
    try {
        await QRCode.toCanvas(canvas, qrData, {
            width: 300,
            margin: 2,
            errorCorrectionLevel: 'H'
        });
        
        return canvas.toDataURL();
    } catch (error) {
        console.error('QR generation error:', error);
        return null;
    }
}

// QRコード表示モーダル
async function showTicketQR(ticketId) {
    const ticket = store.tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    
    const event = store.events.find(e => e.event_id === ticket.eventId);
    if (!event) return;
    
    // QRコード生成
    const qrCodeUrl = await generateTicketQR(ticketId);
    if (!qrCodeUrl) {
        showToast('QRコードの生成に失敗しました', 'error');
        return;
    }
    
    const modal = document.getElementById('modal-content');
    document.getElementById('modal-container').classList.remove('hidden');
    
    modal.innerHTML = `
        <div class="p-8 text-center">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-2xl font-bold text-slate-800">入場用QRコード</h3>
                <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600">
                    <span class="material-icons-outlined">close</span>
                </button>
            </div>
            
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 mb-6">
                <img src="${qrCodeUrl}" class="mx-auto mb-4 rounded-xl shadow-lg bg-white p-4" style="width: 300px; height: 300px;">
                <p class="text-sm text-slate-600 mb-2">イベント会場でこのQRコードを提示してください</p>
                <p class="text-xs text-slate-500">チケットID: ${ticketId}</p>
            </div>
            
            <div class="bg-slate-50 rounded-xl p-4 text-left mb-6">
                <h4 class="font-bold text-slate-800 mb-3">イベント情報</h4>
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span class="text-slate-600">イベント名</span>
                        <span class="font-semibold">${event.title}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-600">開催日時</span>
                        <span class="font-semibold">${new Date(event.start_datetime).toLocaleString('ja-JP')}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-600">会場</span>
                        <span class="font-semibold">${event.venue_name}</span>
                    </div>
                </div>
            </div>
            
            <button onclick="downloadQR('${qrCodeUrl}', '${ticketId}')" class="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-blue-700 transition">
                <span class="material-icons-outlined text-sm align-middle mr-2">download</span>
                QRコードをダウンロード
            </button>
        </div>
    `;
}

// QRコードダウンロード
function downloadQR(dataUrl, ticketId) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `linkup-ticket-${ticketId}.png`;
    link.click();
    showToast('QRコードをダウンロードしました', 'success');
}

// チェックイン統計表示
function renderCheckinStats(eventId) {
    const event = store.events.find(e => e.event_id === eventId);
    if (!event) return '';
    
    // LocalStorageからチェックイン情報を取得
    const checkins = JSON.parse(localStorage.getItem('checkins')) || {};
    const eventCheckins = checkins[eventId] || [];
    
    // チケット総数を取得
    const eventOrders = (store.participants || []).filter(p => p.eventId === eventId);
    const totalTickets = eventOrders.length;
    const checkedIn = eventCheckins.length;
    const checkInRate = totalTickets > 0 ? ((checkedIn / totalTickets) * 100).toFixed(1) : 0;
    
    return `
        <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                <p class="text-3xl font-bold text-blue-600">${totalTickets}</p>
                <p class="text-sm text-slate-600 mt-1">販売チケット数</p>
            </div>
            <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
                <p class="text-3xl font-bold text-green-600">${checkedIn}</p>
                <p class="text-sm text-slate-600 mt-1">入場者数</p>
            </div>
            <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                <p class="text-3xl font-bold text-purple-600">${checkInRate}%</p>
                <p class="text-sm text-slate-600 mt-1">入場率</p>
            </div>
        </div>
    `;
}

// QRスキャナー画面表示
function showQRScanner(eventId) {
    const event = store.events.find(e => e.event_id === eventId);
    if (!event) return;
    
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="min-h-screen bg-slate-50 py-8">
            <div class="max-w-4xl mx-auto px-4">
                <div class="flex items-center justify-between mb-6">
                    <button onclick="renderOrganizer(document.getElementById('app'), 'events')" class="text-slate-600 hover:text-slate-900 flex items-center">
                        <span class="material-icons-outlined mr-2">arrow_back</span>
                        イベント管理に戻る
                    </button>
                    <h1 class="text-2xl font-bold text-slate-900">QRスキャン受付</h1>
                    <div class="w-32"></div>
                </div>
                
                ${renderCheckinStats(eventId)}
                
                <div class="bg-white rounded-2xl shadow-card p-6 mb-6">
                    <div id="qr-reader" class="w-full mx-auto" style="max-width: 500px;"></div>
                    <p class="text-center text-sm text-slate-500 mt-4">カメラでQRコードをスキャンしてください</p>
                </div>
                
                <div class="bg-white rounded-2xl shadow-card p-6">
                    <h3 class="font-bold text-lg mb-4">最近のチェックイン</h3>
                    <div id="recent-checkins" class="space-y-3">
                        <p class="text-center text-slate-500 py-8">チェックイン履歴はありません</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // QRスキャナー初期化
    initQRScanner(eventId);
}

// QRスキャナー初期化
function initQRScanner(eventId) {
    const html5QrCode = new Html5Qrcode("qr-reader");
    
    html5QrCode.start(
        { facingMode: "environment" },
        {
            fps: 10,
            qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
            // QRコードスキャン成功
            handleQRScan(decodedText, eventId, html5QrCode);
        },
        (errorMessage) => {
            // スキャンエラー（無視）
        }
    ).catch((err) => {
        console.error('QR Scanner error:', err);
        showToast('カメラの起動に失敗しました', 'error');
    });
}

// QRスキャン処理
async function handleQRScan(qrData, eventId, scanner) {
    // スキャナー一時停止
    scanner.pause();
    
    try {
        // QRコードフォーマット確認: LINKUP:ticketId:timestamp
        if (!qrData.startsWith('LINKUP:')) {
            showToast('無効なQRコードです', 'error');
            scanner.resume();
            return;
        }
        
        const parts = qrData.substring(7).split(':');
        if (parts.length < 2) {
            showToast('QRコードフォーマットが不正です', 'error');
            scanner.resume();
            return;
        }
        
        const ticketId = parts[0];
        
        // チケット確認
        const ticket = store.tickets.find(t => t.id === ticketId);
        if (!ticket) {
            showToast('チケットが見つかりません', 'error');
            scanner.resume();
            return;
        }
        
        if (ticket.eventId !== eventId) {
            showToast('このチケットは別のイベントのものです', 'error');
            scanner.resume();
            return;
        }
        
        // チェックイン実行
        const checkins = JSON.parse(localStorage.getItem('checkins')) || {};
        if (!checkins[eventId]) checkins[eventId] = [];
        
        // 重複チェック
        if (checkins[eventId].includes(ticketId)) {
            showToast('このチケットは既にチェックイン済みです', 'warning');
            scanner.resume();
            return;
        }
        
        // チェックイン登録
        checkins[eventId].push(ticketId);
        localStorage.setItem('checkins', JSON.stringify(checkins));
        
        // 成功通知
        showToast('チェックイン完了！', 'success');
        
        // 統計更新
        showQRScanner(eventId);
        
    } catch (error) {
        console.error('Check-in error:', error);
        showToast('チェックイン処理に失敗しました', 'error');
        scanner.resume();
    }
}

// 手動チェックイン画面
function showManualCheckin(eventId) {
    const event = store.events.find(e => e.event_id === eventId);
    if (!event) return;
    
    // イベントの参加者リストを取得
    const participants = (store.participants || []).filter(p => p.eventId === eventId);
    const checkins = JSON.parse(localStorage.getItem('checkins')) || {};
    const eventCheckins = checkins[eventId] || [];
    
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="min-h-screen bg-slate-50 py-8">
            <div class="max-w-6xl mx-auto px-4">
                <div class="flex items-center justify-between mb-6">
                    <button onclick="renderOrganizer(document.getElementById('app'), 'events')" class="text-slate-600 hover:text-slate-900 flex items-center">
                        <span class="material-icons-outlined mr-2">arrow_back</span>
                        イベント管理に戻る
                    </button>
                    <h1 class="text-2xl font-bold text-slate-900">手動チェックイン</h1>
                    <div class="w-32"></div>
                </div>
                
                ${renderCheckinStats(eventId)}
                
                <div class="bg-white rounded-2xl shadow-card p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="font-bold text-lg">参加者リスト</h3>
                        <input type="text" id="search-participant" placeholder="参加者名で検索..." class="px-4 py-2 border border-slate-300 rounded-lg" onkeyup="filterParticipants()">
                    </div>
                    
                    <div id="participant-list" class="space-y-3">
                        ${participants.map(p => {
                            const isCheckedIn = eventCheckins.includes(p.id);
                            return `
                                <div class="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition participant-item" data-name="${p.userName.toLowerCase()}">
                                    <div class="flex-1">
                                        <p class="font-semibold text-slate-800">${p.userName}</p>
                                        <p class="text-sm text-slate-500">${p.ticketName}</p>
                                    </div>
                                    ${isCheckedIn 
                                        ? `<div class="flex items-center text-green-600">
                                            <span class="material-icons-outlined mr-2">check_circle</span>
                                            <span class="font-semibold">入場済み</span>
                                          </div>`
                                        : `<button onclick="manualCheckin('${eventId}', '${p.id}')" class="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-blue-700 transition">
                                            チェックイン
                                          </button>`
                                    }
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 手動チェックイン実行
function manualCheckin(eventId, participantId) {
    const checkins = JSON.parse(localStorage.getItem('checkins')) || {};
    if (!checkins[eventId]) checkins[eventId] = [];
    
    if (checkins[eventId].includes(participantId)) {
        showToast('既にチェックイン済みです', 'warning');
        return;
    }
    
    checkins[eventId].push(participantId);
    localStorage.setItem('checkins', JSON.stringify(checkins));
    
    showToast('チェックイン完了！', 'success');
    showManualCheckin(eventId);
}

// 参加者フィルター
function filterParticipants() {
    const search = document.getElementById('search-participant').value.toLowerCase();
    const items = document.querySelectorAll('.participant-item');
    
    items.forEach(item => {
        const name = item.getAttribute('data-name');
        if (name.includes(search)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}
