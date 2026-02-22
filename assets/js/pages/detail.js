/**
 * イベント詳細ページ
 * API: GET /api/events/:id
 *      POST /api/orders
 */

async function renderDetail({ id }) {
  const app = document.getElementById('app');
  if (!id) { AppRouter.go('home'); return; }

  // ローディング
  app.innerHTML = `
    <div class="min-h-screen flex items-center justify-center">
      <div class="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  `;

  try {
    const data = await window.LinkUpAPI.Events.get(id);
    const ev = data.event;
    const tickets = ev.tickets || [];

    const date = ev.start_datetime
      ? new Date(ev.start_datetime).toLocaleString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', hour: '2-digit', minute: '2-digit' })
      : '日時未定';
    const img = ev.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80';

    app.innerHTML = `
      <div class="max-w-4xl mx-auto px-4 py-8">
        <!-- 戻るボタン -->
        <button onclick="AppRouter.go('home')" class="flex items-center gap-1 text-slate-500 hover:text-slate-700 mb-6 text-sm">
          <span class="material-icons-outlined text-base">arrow_back</span>イベント一覧に戻る
        </button>

        <!-- カバー画像 -->
        <div class="rounded-2xl overflow-hidden mb-8 h-64 md:h-96">
          <img src="${img}" alt="${ev.title}" class="w-full h-full object-cover"
            onerror="this.src='https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80'">
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <!-- 左: 詳細情報 -->
          <div class="md:col-span-2 space-y-6">
            <div>
              ${ev.category ? `<span class="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full mb-3">${_escapeHtml(ev.category)}</span>` : ''}
              <h1 class="text-3xl font-bold text-slate-800 mb-3">${_escapeHtml(ev.title)}</h1>
              <p class="text-slate-500 text-sm">主催: ${_escapeHtml(ev.organizer_name || '主催者')}</p>
            </div>

            <div class="bg-slate-50 rounded-xl p-5 space-y-3 text-sm">
              <div class="flex items-start gap-3">
                <span class="material-icons-outlined text-blue-500">calendar_today</span>
                <span class="text-slate-700">${date}</span>
              </div>
              <div class="flex items-start gap-3">
                <span class="material-icons-outlined text-blue-500">location_on</span>
                <span class="text-slate-700">${_escapeHtml(ev.venue_name || 'オンライン')}${ev.venue_address ? '<br><span class="text-slate-400">' + _escapeHtml(ev.venue_address) + '</span>' : ''}</span>
              </div>
            </div>

            <div>
              <h2 class="text-lg font-bold text-slate-700 mb-3">イベント詳細</h2>
              <div class="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">${_escapeHtml(ev.description || '詳細情報は準備中です。')}</div>
            </div>
          </div>

          <!-- 右: チケット購入 -->
          <div class="space-y-4">
            <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm sticky top-4">
              <h2 class="text-lg font-bold text-slate-800 mb-4">チケット</h2>

              ${tickets.length === 0 ? `
                <p class="text-slate-400 text-sm text-center py-4">チケット情報なし</p>
              ` : tickets.map(t => {
                const ticketName = t.name || t.ticket_name || 'チケット';
                const stock = t.quantity_available != null ? t.quantity_available : (t.stock || 0);
                const soldOut = stock <= 0;
                return `
                <div class="border border-slate-200 rounded-xl p-4 mb-3">
                  <div class="flex justify-between items-start mb-2">
                    <span class="font-bold text-slate-800 text-sm">${_escapeHtml(ticketName)}</span>
                    <span class="font-bold text-blue-600">${t.price === 0 ? '無料' : '¥' + Number(t.price).toLocaleString()}</span>
                  </div>
                  ${t.description ? `<p class="text-xs text-slate-400 mb-3">${_escapeHtml(t.description)}</p>` : ''}
                  <div class="flex items-center gap-2 mb-3">
                    <span class="text-xs text-slate-500">残り ${stock} 枚</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <label class="text-xs text-slate-500">枚数</label>
                    <select id="qty-${_escapeHtml(t.ticket_id)}" class="border rounded-lg px-2 py-1 text-sm">
                      ${[1,2,3,4,5].map(n => `<option value="${n}">${n}</option>`).join('')}
                    </select>
                    <button onclick="purchaseTicket('${_escapeHtml(t.ticket_id)}', '${_escapeHtml(ev.event_id)}')"
                      class="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-3 rounded-lg transition
                        ${soldOut ? 'opacity-50 cursor-not-allowed' : ''}"
                      ${soldOut ? 'disabled' : ''}>
                      ${soldOut ? '売切れ' : '購入する'}
                    </button>
                  </div>
                </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- フッター -->
      <footer class="bg-slate-800 text-slate-400 mt-16">
        <div class="max-w-6xl mx-auto px-4 py-10">
          <div class="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <span class="text-xl font-bold text-white">LinkUp</span>
              <p class="text-sm mt-1">人と体験をつなぐイベントプラットフォーム</p>
            </div>
            <button onclick="AppRouter.go('home')" class="text-sm hover:text-white transition">← イベント一覧に戻る</button>
          </div>
          <div class="border-t border-slate-700 mt-6 pt-6 text-center text-sm">
            <p>&copy; 2026 LinkUp. All rights reserved.</p>
          </div>
        </div>
      </footer>
    `;

    // 購入処理
    window.purchaseTicket = async (ticketId, eventId) => {
      if (!AppAuth.requireLogin()) return;

      const qty = parseInt(document.getElementById(`qty-${ticketId}`)?.value || '1');
      const btn = document.querySelector(`button[onclick="purchaseTicket('${ticketId}', '${eventId}')"]`);

      if (btn) { btn.disabled = true; btn.textContent = '処理中...'; }

      try {
        const result = await window.LinkUpAPI.Orders.create(ticketId, qty, eventId);
        AppUI.toast(`購入完了！注文番号: ${result.order.order_number}`, 'success');
        // 在庫表示を更新するためページ再読み込み
        setTimeout(() => renderDetail({ id }), 1500);
      } catch (err) {
        AppUI.toast(err.message || '購入に失敗しました', 'error');
        if (btn) { btn.disabled = false; btn.textContent = '購入する'; }
      }
    };

  } catch (err) {
    AppUI.showError(err.message || 'イベント情報の取得に失敗しました', `renderDetail({id:'${id}'})`);
  }
}
