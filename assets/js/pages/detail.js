/**
 * イベント詳細ページ - リデザイン版
 * API: GET /api/events/:id
 *      POST /api/orders
 */

async function renderDetail({ id }) {
  const app = document.getElementById('app');
  if (!id) { AppRouter.go('home'); return; }

  // ローディング
  app.innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-slate-50">
      <div class="text-center">
        <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <div class="w-9 h-9 border-[3px] border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        <p class="text-sm text-slate-400 font-medium">イベント情報を読み込み中...</p>
      </div>
    </div>
  `;

  try {
    const data = await window.LinkUpAPI.Events.get(id);
    const ev = data.event;
    const tickets = ev.tickets || [];

    const startDate = ev.start_datetime
      ? new Date(ev.start_datetime).toLocaleString('ja-JP', {
          year: 'numeric', month: 'long', day: 'numeric',
          weekday: 'long', hour: '2-digit', minute: '2-digit'
        })
      : '日時未定';
    const endDate = ev.end_datetime
      ? new Date(ev.end_datetime).toLocaleString('ja-JP', { hour: '2-digit', minute: '2-digit' })
      : null;

    const img = ev.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80';

    const catMap = {
      tech:      { label: 'テック',       bg: 'bg-blue-100',    text: 'text-blue-700',    gradient: 'from-blue-600 to-blue-700' },
      business:  { label: 'ビジネス',     bg: 'bg-purple-100',  text: 'text-purple-700',  gradient: 'from-purple-600 to-violet-700' },
      music:     { label: '音楽',         bg: 'bg-pink-100',    text: 'text-pink-700',    gradient: 'from-pink-600 to-rose-600' },
      art:       { label: 'アート',       bg: 'bg-orange-100',  text: 'text-orange-700',  gradient: 'from-orange-500 to-amber-600' },
      food:      { label: 'グルメ',       bg: 'bg-emerald-100', text: 'text-emerald-700', gradient: 'from-emerald-600 to-green-600' },
      sports:    { label: 'スポーツ',     bg: 'bg-lime-100',    text: 'text-lime-700',    gradient: 'from-lime-600 to-green-600' },
      social:    { label: 'コミュニティ', bg: 'bg-teal-100',    text: 'text-teal-700',    gradient: 'from-teal-600 to-cyan-600' },
      education: { label: '教育',         bg: 'bg-indigo-100',  text: 'text-indigo-700',  gradient: 'from-indigo-600 to-blue-700' },
    };
    const cat = catMap[ev.category] || { label: ev.category || '', bg: 'bg-slate-100', text: 'text-slate-700', gradient: 'from-slate-600 to-slate-700' };

    const totalCapacity = ev.max_attendees || 0;
    const currentAttendees = ev.current_attendees || 0;
    const capacityPct = totalCapacity > 0 ? Math.min(Math.round(currentAttendees / totalCapacity * 100), 100) : 0;
    const isAlmostFull = capacityPct >= 80;

    app.innerHTML = `
      <div class="min-h-screen bg-slate-50">

        <!-- ─── ヒーローエリア ─── -->
        <div class="relative bg-slate-900 overflow-hidden" style="height: 420px; max-height: 50vh;">
          <!-- 背景画像 -->
          <img src="${_escapeHtml(img)}" alt="${_escapeHtml(ev.title)}"
            class="w-full h-full object-cover opacity-60"
            onerror="this.src='https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80'">
          <!-- グラデーションオーバーレイ -->
          <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-slate-900/60 to-transparent"></div>

          <!-- ナビオーバーレイ -->
          <div class="absolute top-0 left-0 right-0 p-4 sm:p-6">
            <button onclick="history.length > 1 ? history.back() : AppRouter.go('home')"
              class="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 glass rounded-xl text-white text-sm font-medium transition-all">
              <span class="material-icons-outlined text-base">arrow_back</span>
              戻る
            </button>
          </div>

          <!-- ヒーロー下部テキスト -->
          <div class="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <div class="max-w-4xl mx-auto">
              ${cat.label ? `
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cat.bg} ${cat.text} mb-3 shadow-sm">
                  ${cat.label}
                </span>
              ` : ''}
              <h1 class="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight mb-2" style="text-shadow: 0 2px 8px rgba(0,0,0,0.5);">
                ${_escapeHtml(ev.title)}
              </h1>
              ${ev.organizer_name ? `
                <p class="text-slate-300 text-sm flex items-center gap-1.5">
                  <span class="material-icons-outlined text-base text-blue-400">person</span>
                  主催: <span class="font-semibold text-white">${_escapeHtml(ev.organizer_name)}</span>
                </p>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- ─── メインコンテンツ ─── -->
        <div class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div class="grid md:grid-cols-3 gap-6">

            <!-- 左: 詳細情報 -->
            <div class="md:col-span-2 space-y-6">

              <!-- 基本情報カード -->
              <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div class="p-6">
                  <h2 class="text-sm font-extrabold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span class="material-icons-outlined text-base">info</span>
                    基本情報
                  </h2>
                  <div class="space-y-4">
                    <!-- 日時 -->
                    <div class="flex items-start gap-4">
                      <div class="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span class="material-icons-outlined text-blue-600 text-lg">calendar_month</span>
                      </div>
                      <div>
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-wide mb-0.5">日時</p>
                        <p class="text-slate-800 font-semibold text-sm">${startDate}</p>
                        ${endDate ? `<p class="text-slate-400 text-xs mt-0.5">〜 ${endDate} 終了予定</p>` : ''}
                      </div>
                    </div>
                    <!-- 会場 -->
                    <div class="flex items-start gap-4">
                      <div class="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span class="material-icons-outlined text-blue-600 text-lg">${ev.is_online ? 'videocam' : 'location_on'}</span>
                      </div>
                      <div>
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-wide mb-0.5">${ev.is_online ? 'オンライン開催' : '会場'}</p>
                        <p class="text-slate-800 font-semibold text-sm">${_escapeHtml(ev.venue_name || (ev.is_online ? 'オンライン' : '会場未定'))}</p>
                        ${ev.venue_address ? `<p class="text-slate-400 text-xs mt-0.5">${_escapeHtml(ev.venue_address)}</p>` : ''}
                        ${ev.is_online && ev.online_url ? `
                          <a href="${_escapeHtml(ev.online_url)}" target="_blank" rel="noopener noreferrer"
                            class="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold mt-1 hover:underline">
                            <span class="material-icons-outlined text-sm">open_in_new</span>
                            参加URLを確認
                          </a>
                        ` : ''}
                      </div>
                    </div>
                    <!-- 定員 -->
                    ${totalCapacity > 0 ? `
                    <div class="flex items-start gap-4">
                      <div class="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span class="material-icons-outlined text-blue-600 text-lg">people</span>
                      </div>
                      <div class="flex-1">
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">定員・参加状況</p>
                        <div class="flex items-baseline gap-2 mb-1.5">
                          <span class="text-slate-800 font-bold text-sm">${currentAttendees.toLocaleString()}</span>
                          <span class="text-slate-400 text-xs">/ ${totalCapacity.toLocaleString()}人</span>
                          ${isAlmostFull ? `<span class="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">残りわずか</span>` : ''}
                        </div>
                        <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div class="h-full rounded-full transition-all duration-1000 ${isAlmostFull ? 'bg-orange-500' : 'bg-blue-500'}" style="width:${capacityPct}%"></div>
                        </div>
                      </div>
                    </div>
                    ` : ''}
                  </div>
                </div>
              </div>

              <!-- イベント説明カード -->
              <div class="bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div class="p-6">
                  <h2 class="text-sm font-extrabold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span class="material-icons-outlined text-base">description</span>
                    イベント詳細
                  </h2>
                  <div class="text-slate-600 text-sm leading-[1.9] whitespace-pre-wrap">
                    ${_escapeHtml(ev.description || '詳細情報は準備中です。イベント主催者にお問い合わせください。')}
                  </div>
                </div>
              </div>

              <!-- タグ -->
              ${ev.tags && ev.tags.length > 0 ? `
              <div class="flex flex-wrap gap-2">
                ${(Array.isArray(ev.tags) ? ev.tags : JSON.parse(ev.tags || '[]')).map(tag => `
                  <span class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl cursor-pointer transition-colors">
                    #${_escapeHtml(tag)}
                  </span>
                `).join('')}
              </div>
              ` : ''}

            </div>

            <!-- 右: チケット購入 -->
            <div class="space-y-4">
              <div class="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden sticky" style="top: 80px;">

                <!-- チケットヘッダー -->
                <div class="bg-gradient-to-r from-slate-800 to-slate-900 p-5">
                  <h2 class="text-white font-extrabold text-base flex items-center gap-2">
                    <span class="material-icons-outlined text-blue-400 text-xl">confirmation_number</span>
                    チケット
                  </h2>
                  ${tickets.length > 0 ? `
                    <p class="text-slate-400 text-xs mt-1">${tickets.length}種類のチケット</p>
                  ` : ''}
                </div>

                <div class="p-4">
                  ${tickets.length === 0 ? `
                    <div class="text-center py-8">
                      <div class="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <span class="material-icons-outlined text-slate-300 text-2xl">confirmation_number</span>
                      </div>
                      <p class="text-slate-400 text-sm font-medium">チケット情報なし</p>
                      <p class="text-slate-300 text-xs mt-1">主催者にお問い合わせください</p>
                    </div>
                  ` : tickets.map(t => {
                    const ticketName = t.name || t.ticket_name || 'チケット';
                    const stock = t.quantity_available != null ? t.quantity_available : (t.stock || 0);
                    const soldOut = stock <= 0;
                    const isFreeTicket = t.price === 0 || t.price === '0';
                    const lowStock = !soldOut && stock <= 5;

                    return `
                    <div class="ticket-card border-2 ${soldOut ? 'border-slate-100 bg-slate-50/50' : 'border-slate-200 hover:border-blue-300'} rounded-2xl p-4 mb-3 last:mb-0 transition-all">
                      <div class="flex items-start justify-between gap-2 mb-2">
                        <div class="flex-1 min-w-0">
                          <span class="font-extrabold text-slate-800 text-sm block leading-tight">${_escapeHtml(ticketName)}</span>
                          ${t.description ? `<p class="text-xs text-slate-400 mt-1 leading-relaxed">${_escapeHtml(t.description)}</p>` : ''}
                        </div>
                        <div class="flex-shrink-0 text-right">
                          <div class="font-extrabold ${isFreeTicket ? 'text-emerald-600 text-base' : 'text-blue-600 text-lg'}">
                            ${isFreeTicket ? '無料' : '¥' + Number(t.price).toLocaleString()}
                          </div>
                          ${!isFreeTicket ? `<div class="text-xs text-slate-400">税込</div>` : ''}
                        </div>
                      </div>

                      <!-- 残席 -->
                      <div class="flex items-center gap-2 mb-3">
                        <div class="w-2 h-2 rounded-full ${soldOut ? 'bg-slate-300' : (lowStock ? 'bg-orange-400' : 'bg-green-500')} flex-shrink-0"></div>
                        <span class="text-xs ${soldOut ? 'text-slate-400' : (lowStock ? 'text-orange-600 font-semibold' : 'text-slate-500')}">
                          ${soldOut ? '売り切れ' : (lowStock ? `残り${stock}枚！` : `残り${stock}枚`)}
                        </span>
                      </div>

                      <!-- 購入フォーム -->
                      ${!soldOut ? `
                      <div class="flex items-center gap-2">
                        <div class="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1">
                          <button type="button"
                            onclick="(function(){ const s=document.getElementById('qty-${_escapeHtml(t.ticket_id)}'); if(parseInt(s.value)>1) s.value=parseInt(s.value)-1; })()"
                            class="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors">
                            <span class="material-icons-outlined text-slate-600 text-sm">remove</span>
                          </button>
                          <select id="qty-${_escapeHtml(t.ticket_id)}"
                            class="w-8 text-center text-sm font-bold text-slate-800 bg-transparent border-none outline-none">
                            ${[1,2,3,4,5].map(n => `<option value="${n}">${n}</option>`).join('')}
                          </select>
                          <button type="button"
                            onclick="(function(){ const s=document.getElementById('qty-${_escapeHtml(t.ticket_id)}'); if(parseInt(s.value)<5) s.value=parseInt(s.value)+1; })()"
                            class="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors">
                            <span class="material-icons-outlined text-slate-600 text-sm">add</span>
                          </button>
                        </div>
                        <button onclick="purchaseTicket('${_escapeHtml(t.ticket_id)}', '${_escapeHtml(ev.event_id)}')"
                          id="buy-btn-${_escapeHtml(t.ticket_id)}"
                          class="btn-primary flex-1 text-white text-sm font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5">
                          <span class="material-icons-outlined text-base">shopping_cart</span>
                          購入する
                        </button>
                      </div>
                      ` : `
                      <button disabled
                        class="w-full bg-slate-100 text-slate-400 text-sm font-bold py-2.5 px-4 rounded-xl cursor-not-allowed flex items-center justify-center gap-1.5">
                        <span class="material-icons-outlined text-base">block</span>
                        売り切れ
                      </button>
                      `}
                    </div>
                    `;
                  }).join('')}

                  <!-- セキュリティバッジ -->
                  <div class="mt-4 pt-4 border-t border-slate-50 flex items-center justify-center gap-4 text-xs text-slate-400">
                    <div class="flex items-center gap-1">
                      <span class="material-icons-outlined text-slate-300 text-sm">lock</span>
                      セキュア決済
                    </div>
                    <div class="flex items-center gap-1">
                      <span class="material-icons-outlined text-slate-300 text-sm">qr_code</span>
                      QRチケット発行
                    </div>
                  </div>
                </div>
              </div>

              <!-- シェアボタン -->
              <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <span class="material-icons-outlined text-sm">share</span>
                  シェア
                </p>
                <div class="flex gap-2">
                  <button onclick="navigator.share ? navigator.share({title:'${_escapeHtml(ev.title)}',url:location.href}) : (navigator.clipboard.writeText(location.href).then(()=>AppUI.toast('URLをコピーしました','success')))"
                    class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-colors">
                    <span class="material-icons-outlined text-base">link</span>
                    URLをコピー
                  </button>
                  <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(ev.title + ' #LinkUp')}&url=${encodeURIComponent(location.href)}"
                    target="_blank" rel="noopener noreferrer"
                    class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-600 rounded-xl text-xs font-semibold transition-colors">
                    <span class="material-icons-outlined text-base">alternate_email</span>
                    X でシェア
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ─── フッター ─── -->
        <footer class="bg-slate-900 text-slate-400 mt-12">
          <div class="max-w-4xl mx-auto px-4 sm:px-6 py-10">
            <div class="flex flex-col md:flex-row justify-between items-center gap-4">
              <button onclick="AppRouter.go('home')" class="flex items-center gap-2 group">
                <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                  <span class="material-icons-outlined text-white" style="font-size:16px;">link</span>
                </div>
                <span class="text-xl font-extrabold text-white group-hover:text-blue-300 transition-colors">LinkUp</span>
              </button>
              <p class="text-sm text-slate-500">人と体験をつなぐイベントプラットフォーム</p>
              <button onclick="AppRouter.go('home')"
                class="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
                <span class="material-icons-outlined text-base">arrow_back</span>
                イベント一覧に戻る
              </button>
            </div>
            <div class="border-t border-slate-800 mt-6 pt-6 text-center text-xs text-slate-600">
              <p>&copy; 2026 LinkUp, Inc. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    `;

    // ─── 購入処理 ───────────────────────────────────────
    window.purchaseTicket = async (ticketId, eventId) => {
      // 未ログイン時
      if (!AppAuth.isLoggedIn()) {
        sessionStorage.setItem('pending_purchase', JSON.stringify({ ticketId, eventId }));
        AppUI.toast('チケットを購入するにはログインが必要です', 'warning');
        AppUI.openLoginModal();
        return;
      }

      const qty = parseInt(document.getElementById(`qty-${ticketId}`)?.value || '1');
      const btn = document.getElementById(`buy-btn-${ticketId}`);

      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="material-icons-outlined text-base animate-spin">autorenew</span><span>処理中...</span>';
      }

      try {
        const result = await window.LinkUpAPI.Orders.create(ticketId, qty, eventId);
        AppUI.toast(`購入完了！注文番号: ${result.order.order_number}`, 'success');
        sessionStorage.removeItem('pending_purchase');
        setTimeout(() => renderDetail({ id: eventId }), 1500);
      } catch (err) {
        AppUI.toast(err.message || '購入に失敗しました', 'error');
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = '<span class="material-icons-outlined text-base">shopping_cart</span><span>購入する</span>';
        }
      }
    };

    // ログイン後に購入を継続
    const pending = sessionStorage.getItem('pending_purchase');
    if (pending && AppAuth.isLoggedIn()) {
      try {
        const { ticketId, eventId: pendingEventId } = JSON.parse(pending);
        if (pendingEventId === id) {
          sessionStorage.removeItem('pending_purchase');
          setTimeout(() => {
            AppUI.toast('ログインしました。チケット購入を続けます...', 'info');
            setTimeout(() => window.purchaseTicket(ticketId, pendingEventId), 800);
          }, 300);
        }
      } catch(e) {
        sessionStorage.removeItem('pending_purchase');
      }
    }

  } catch (err) {
    AppUI.showError(err.message || 'イベント情報の取得に失敗しました', `renderDetail({id:'${id}'})`);
  }
}
