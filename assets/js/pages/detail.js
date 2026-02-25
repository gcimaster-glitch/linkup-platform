/**
 * イベント詳細ページ — Frontend Design Skill準拠
 * Design: "Code Editor Dark" — ネオンシアン + ホットピンク + IDE暗黒テーマ
 */

async function renderDetail({ id }) {
  const app = document.getElementById('app');
  if (!id) { AppRouter.go('home'); return; }

  // ─── ローディング ──────────────────────────────────
  app.innerHTML = `
    <div style="min-height:100vh; display:flex; align-items:center; justify-content:center; background:var(--c-bg);">
      <div style="text-align:center;">
        <div style="width:56px; height:56px; background:var(--accent-dim); border-radius:16px; display:flex; align-items:center; justify-content:center; margin:0 auto 16px;">
          <div style="width:28px; height:28px; border:2.5px solid var(--c-border); border-top-color:var(--accent); border-radius:50%; animation:spin 0.9s linear infinite;"></div>
        </div>
        <p style="font-size:13px; color:var(--c-dim); font-weight:500;">イベント情報を読み込み中...</p>
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

    // カテゴリマッピング — ネオンアクセント
    const catMap = {
      tech:      { label: 'テック',       color: 'var(--accent)',  bg: 'var(--accent-dim)'  },
      business:  { label: 'ビジネス',     color: 'var(--violet)',  bg: 'rgba(155,89,255,0.12)' },
      music:     { label: '音楽',         color: 'var(--hot)',     bg: 'var(--hot-dim)'     },
      art:       { label: 'アート',       color: 'var(--amber)',   bg: 'rgba(255,170,0,0.12)' },
      food:      { label: 'グルメ',       color: 'var(--lime)',    bg: 'rgba(57,255,20,0.1)'  },
      sports:    { label: 'スポーツ',     color: 'var(--lime)',    bg: 'rgba(57,255,20,0.1)'  },
      social:    { label: 'コミュニティ', color: 'var(--accent)',  bg: 'var(--accent-dim)'  },
      education: { label: '教育',         color: 'var(--violet)',  bg: 'rgba(155,89,255,0.12)' },
    };
    const cat = catMap[ev.category] || { label: ev.category || '', color: 'var(--c-dim)', bg: 'var(--c-raised)' };

    const totalCapacity     = ev.max_attendees || 0;
    const currentAttendees  = ev.current_attendees || 0;
    const capacityPct       = totalCapacity > 0 ? Math.min(Math.round(currentAttendees / totalCapacity * 100), 100) : 0;
    const isAlmostFull      = capacityPct >= 80;

    app.innerHTML = `
      <div style="min-height:100vh; background:var(--c-bg);">

        <!-- ─── ヒーローエリア ─── -->
        <div style="position:relative; overflow:hidden; height:420px; max-height:50vh; background:var(--c-canvas);">
          <img src="${_escapeHtml(img)}" alt="${_escapeHtml(ev.title)}"
            style="width:100%; height:100%; object-fit:cover; opacity:0.5;"
            onerror="this.src='https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80'">
          <!-- グラデーションオーバーレイ -->
          <div style="position:absolute; inset:0; background:linear-gradient(to top, var(--c-canvas) 0%, rgba(10,15,30,0.6) 50%, transparent 100%);"></div>
          <div style="position:absolute; inset:0; background:linear-gradient(to right, rgba(10,15,30,0.7) 0%, transparent 60%);"></div>
          <!-- ドットグリッドオーバーレイ -->
          <div style="position:absolute; inset:0; background-image:radial-gradient(rgba(0,217,255,0.04) 1px, transparent 1px); background-size:28px 28px; pointer-events:none;"></div>

          <!-- 戻るボタン -->
          <div style="position:absolute; top:0; left:0; right:0; padding:20px 24px;">
            <button onclick="history.length>1?history.back():AppRouter.go('home')"
              style="display:inline-flex; align-items:center; gap:6px; padding:8px 14px; background:rgba(15,22,41,0.7); border:1px solid var(--c-border); border-radius:10px; color:var(--c-text-1); font-size:13px; font-weight:500; cursor:pointer; transition:all 0.15s; backdrop-filter:blur(12px);"
              onmouseenter="this.style.borderColor='var(--accent)';this.style.color='var(--accent)'"
              onmouseleave="this.style.borderColor='var(--c-border)';this.style.color='var(--c-text-1)'">
              <span class="material-icons-outlined" style="font-size:16px;">arrow_back</span>
              戻る
            </button>
          </div>

          <!-- イベント情報オーバーレイ -->
          <div style="position:absolute; bottom:0; left:0; right:0; padding:24px 32px;">
            <div style="max-width:840px; margin:0 auto;">
              ${cat.label ? `
                <span style="display:inline-flex; align-items:center; padding:4px 12px; border-radius:99px; font-size:11px; font-weight:700; color:${cat.color}; background:${cat.bg}; border:1px solid ${cat.color.replace(')', ',0.3)').replace('var(--','rgba(')}; margin-bottom:10px; text-transform:uppercase; letter-spacing:0.06em;">
                  ${cat.label}
                </span>
              ` : ''}
              <h1 style="font-family:'Outfit',sans-serif; font-size:clamp(22px,4vw,36px); font-weight:900; color:var(--c-text); line-height:1.2; margin-bottom:8px; text-shadow:0 2px 12px rgba(0,0,0,0.5);">
                ${_escapeHtml(ev.title)}
              </h1>
              ${ev.organizer_name ? `
                <p style="font-size:13px; color:var(--c-text-2); display:flex; align-items:center; gap:6px;">
                  <span class="material-icons-outlined" style="font-size:16px; color:var(--accent);">person</span>
                  主催: <span style="font-weight:600; color:var(--c-text-1);">${_escapeHtml(ev.organizer_name)}</span>
                </p>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- ─── メインコンテンツ ─── -->
        <div style="max-width:840px; margin:0 auto; padding:32px 20px;">
          <div style="display:grid; grid-template-columns:1fr; gap:24px;">

            <!-- レスポンシブグリッド: md以上で2/3 + 1/3 -->
            <div id="detail-grid" style="display:grid; gap:24px; grid-template-columns:1fr;">

              <!-- 左カラム -->
              <div style="display:flex; flex-direction:column; gap:20px;" id="detail-left">

                <!-- 基本情報カード -->
                <div class="glass-neon" style="border-radius:16px; overflow:hidden; padding:24px;">
                  <h2 style="font-size:11px; font-weight:700; color:var(--c-dim); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:20px; display:flex; align-items:center; gap:8px;">
                    <span class="material-icons-outlined" style="font-size:14px; color:var(--accent);">info</span>
                    基本情報
                  </h2>
                  <div style="display:flex; flex-direction:column; gap:20px;">

                    <!-- 日時 -->
                    <div style="display:flex; align-items:flex-start; gap:16px;">
                      <div style="width:40px; height:40px; background:var(--accent-dim); border:1px solid rgba(0,217,255,0.2); border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                        <span class="material-icons-outlined" style="font-size:18px; color:var(--accent);">calendar_month</span>
                      </div>
                      <div>
                        <p style="font-size:10px; font-weight:700; color:var(--c-dim); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:4px;">日時</p>
                        <p style="font-size:14px; font-weight:600; color:var(--c-text);">${startDate}</p>
                        ${endDate ? `<p style="font-size:12px; color:var(--c-dim); margin-top:2px;">〜 ${endDate} 終了予定</p>` : ''}
                      </div>
                    </div>

                    <!-- 会場 -->
                    <div style="display:flex; align-items:flex-start; gap:16px;">
                      <div style="width:40px; height:40px; background:var(--accent-dim); border:1px solid rgba(0,217,255,0.2); border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                        <span class="material-icons-outlined" style="font-size:18px; color:var(--accent);">${ev.is_online ? 'videocam' : 'location_on'}</span>
                      </div>
                      <div>
                        <p style="font-size:10px; font-weight:700; color:var(--c-dim); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:4px;">${ev.is_online ? 'オンライン開催' : '会場'}</p>
                        <p style="font-size:14px; font-weight:600; color:var(--c-text);">${_escapeHtml(ev.venue_name || (ev.is_online ? 'オンライン' : '会場未定'))}</p>
                        ${ev.venue_address ? `<p style="font-size:12px; color:var(--c-dim); margin-top:2px;">${_escapeHtml(ev.venue_address)}</p>` : ''}
                      </div>
                    </div>

                    ${totalCapacity > 0 ? `
                    <!-- 定員 -->
                    <div style="display:flex; align-items:flex-start; gap:16px;">
                      <div style="width:40px; height:40px; background:var(--accent-dim); border:1px solid rgba(0,217,255,0.2); border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                        <span class="material-icons-outlined" style="font-size:18px; color:var(--accent);">people</span>
                      </div>
                      <div style="flex:1;">
                        <p style="font-size:10px; font-weight:700; color:var(--c-dim); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:4px;">定員・参加状況</p>
                        <div style="display:flex; align-items:baseline; gap:8px; margin-bottom:8px;">
                          <span style="font-size:14px; font-weight:700; color:var(--c-text);">${currentAttendees.toLocaleString()}</span>
                          <span style="font-size:12px; color:var(--c-dim);">/ ${totalCapacity.toLocaleString()}人</span>
                          ${isAlmostFull ? `<span style="font-size:11px; font-weight:700; color:var(--amber); background:rgba(255,170,0,0.1); padding:2px 8px; border-radius:99px;">残りわずか</span>` : ''}
                        </div>
                        <div style="width:100%; background:var(--c-border); border-radius:99px; height:4px; overflow:hidden;">
                          <div style="height:100%; border-radius:99px; width:${capacityPct}%; background:${isAlmostFull ? 'var(--amber)' : 'var(--accent)'}; transition:width 1s ease; box-shadow:0 0 8px ${isAlmostFull ? 'rgba(255,170,0,0.4)' : 'rgba(0,217,255,0.4)'};"></div>
                        </div>
                      </div>
                    </div>
                    ` : ''}
                  </div>
                </div>

                <!-- イベント説明カード -->
                <div style="background:var(--c-surface); border:1px solid var(--c-border); border-radius:16px; padding:24px;">
                  <h2 style="font-size:11px; font-weight:700; color:var(--c-dim); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:16px; display:flex; align-items:center; gap:8px;">
                    <span class="material-icons-outlined" style="font-size:14px; color:var(--accent);">description</span>
                    イベント詳細
                  </h2>
                  <div style="color:var(--c-text-2); font-size:14px; line-height:1.9; white-space:pre-wrap;">
                    ${_escapeHtml(ev.description || '詳細情報は準備中です。イベント主催者にお問い合わせください。')}
                  </div>
                </div>

                ${ev.tags && ev.tags.length > 0 ? `
                <div style="display:flex; flex-wrap:wrap; gap:8px;">
                  ${(Array.isArray(ev.tags) ? ev.tags : JSON.parse(ev.tags || '[]')).map(tag => `
                    <span style="padding:6px 14px; background:var(--c-raised); border:1px solid var(--c-border); color:var(--c-dim); font-size:12px; font-weight:600; border-radius:99px; cursor:pointer; transition:all 0.15s;"
                      onmouseenter="this.style.borderColor='var(--accent)';this.style.color='var(--accent)';this.style.background='var(--accent-dim)'"
                      onmouseleave="this.style.borderColor='var(--c-border)';this.style.color='var(--c-dim)';this.style.background='var(--c-raised)'">
                      #${_escapeHtml(tag)}
                    </span>
                  `).join('')}
                </div>
                ` : ''}

              </div>

              <!-- 右カラム: チケット購入 -->
              <div style="display:flex; flex-direction:column; gap:16px;" id="detail-right">

                <!-- チケットパネル -->
                <div style="background:var(--c-surface); border:1px solid var(--c-border); border-radius:16px; overflow:hidden; position:sticky; top:80px;">

                  <!-- チケットヘッダー -->
                  <div style="background:linear-gradient(135deg,var(--c-raised),var(--c-canvas)); padding:20px; border-bottom:1px solid var(--c-border);">
                    <div style="display:flex; align-items:center; gap:10px;">
                      <span class="material-icons-outlined" style="font-size:22px; color:var(--accent);">confirmation_number</span>
                      <div>
                        <h2 style="font-size:15px; font-weight:800; color:var(--c-text);">チケット</h2>
                        ${tickets.length > 0 ? `<p style="font-size:12px; color:var(--c-dim); margin-top:2px;">${tickets.length}種類</p>` : ''}
                      </div>
                    </div>
                  </div>

                  <div style="padding:16px;">
                    ${tickets.length === 0 ? `
                      <div style="text-align:center; padding:32px 16px;">
                        <div style="width:48px; height:48px; background:var(--c-raised); border-radius:14px; display:flex; align-items:center; justify-content:center; margin:0 auto 12px;">
                          <span class="material-icons-outlined" style="font-size:24px; color:var(--c-muted);">confirmation_number</span>
                        </div>
                        <p style="color:var(--c-dim); font-size:13px; font-weight:500;">チケット情報なし</p>
                        <p style="color:var(--c-muted); font-size:11px; margin-top:4px;">主催者にお問い合わせください</p>
                      </div>
                    ` : tickets.map(t => {
                      const ticketName   = t.name || t.ticket_name || 'チケット';
                      const stock        = t.quantity_available != null ? t.quantity_available : (t.stock || 0);
                      const soldOut      = stock <= 0;
                      const isFreeTicket = t.price === 0 || t.price === '0';
                      const lowStock     = !soldOut && stock <= 5;

                      return `
                      <div style="
                        border:2px solid ${soldOut ? 'var(--c-border)' : 'rgba(0,217,255,0.2)'};
                        background:${soldOut ? 'var(--c-raised)' : 'rgba(0,217,255,0.04)'};
                        border-radius:14px; padding:16px; margin-bottom:12px;
                        opacity:${soldOut ? '0.6' : '1'};
                        transition:all 0.2s;
                      "
                        onmouseenter="if(!${soldOut})this.style.borderColor='rgba(0,217,255,0.4)'"
                        onmouseleave="if(!${soldOut})this.style.borderColor='rgba(0,217,255,0.2)'">

                        <!-- チケット名・価格 -->
                        <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:12px;">
                          <div style="flex:1; min-width:0;">
                            <span style="font-size:14px; font-weight:700; color:var(--c-text); display:block; line-height:1.3;">${_escapeHtml(ticketName)}</span>
                            ${t.description ? `<p style="font-size:12px; color:var(--c-dim); margin-top:4px; line-height:1.5;">${_escapeHtml(t.description)}</p>` : ''}
                          </div>
                          <div style="flex-shrink:0; text-align:right; background:var(--c-raised); border:1px solid var(--c-border); border-radius:10px; padding:8px 12px;">
                            <div style="font-size:${isFreeTicket ? '15px' : '18px'}; font-weight:800; color:${isFreeTicket ? 'var(--lime)' : 'var(--accent)'};">
                              ${isFreeTicket ? '無料' : '¥' + Number(t.price).toLocaleString()}
                            </div>
                            ${!isFreeTicket ? `<div style="font-size:10px; color:var(--c-dim);">税込</div>` : ''}
                          </div>
                        </div>

                        <!-- 残席インジケーター -->
                        <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
                          <div style="width:8px; height:8px; border-radius:50%; background:${soldOut ? 'var(--c-muted)' : (lowStock ? 'var(--amber)' : 'var(--lime)')}; flex-shrink:0; ${!soldOut && lowStock ? 'animation:pulse-neon 2s infinite;' : ''}"></div>
                          <span style="font-size:12px; font-weight:600; color:${soldOut ? 'var(--c-dim)' : (lowStock ? 'var(--amber)' : 'var(--lime)')}">
                            ${soldOut ? '売り切れ' : (lowStock ? `残り${stock}枚！お早めに` : `残り${stock}枚`)}
                          </span>
                        </div>

                        <!-- 数量セレクター + 購入ボタン -->
                        ${!soldOut ? `
                        <div style="display:flex; align-items:center; gap:8px;">
                          <!-- 数量 -->
                          <div style="display:flex; align-items:center; background:var(--c-raised); border:1.5px solid var(--c-border); border-radius:10px; overflow:hidden;">
                            <button type="button"
                              onclick="(function(){ const s=document.getElementById('qty-${_escapeHtml(t.ticket_id)}'); const v=parseInt(s.value); if(v>1){s.value=v-1; _updateSubtotal('${_escapeHtml(t.ticket_id)}', ${t.price});} })()"
                              style="width:36px; height:36px; background:none; border:none; cursor:pointer; color:var(--c-text-1); font-size:18px; font-weight:700; display:flex; align-items:center; justify-content:center; transition:background 0.15s;"
                              onmouseenter="this.style.background='var(--c-border)'" onmouseleave="this.style.background='none'">−</button>
                            <input type="text" id="qty-${_escapeHtml(t.ticket_id)}" value="1" readonly
                              style="width:36px; height:36px; text-align:center; font-size:13px; font-weight:800; color:var(--c-text); background:none; border:none; outline:none;">
                            <button type="button"
                              onclick="(function(){ const s=document.getElementById('qty-${_escapeHtml(t.ticket_id)}'); const v=parseInt(s.value); if(v<5){s.value=v+1; _updateSubtotal('${_escapeHtml(t.ticket_id)}', ${t.price});} })()"
                              style="width:36px; height:36px; background:none; border:none; cursor:pointer; color:var(--c-text-1); font-size:18px; font-weight:700; display:flex; align-items:center; justify-content:center; transition:background 0.15s;"
                              onmouseenter="this.style.background='var(--c-border)'" onmouseleave="this.style.background='none'">＋</button>
                          </div>
                          <button onclick="openPurchaseFlow('${_escapeHtml(t.ticket_id)}', '${_escapeHtml(ev.event_id)}', '${_escapeHtml(ticketName)}', ${t.price})"
                            id="buy-btn-${_escapeHtml(t.ticket_id)}"
                            class="btn-primary"
                            style="flex:1; padding:10px 16px; border:none; cursor:pointer; border-radius:10px; font-size:13px; font-weight:700; display:flex; align-items:center; justify-content:center; gap:6px; color:var(--c-bg);">
                            <span class="material-icons-outlined" style="font-size:16px;">shopping_cart</span>
                            購入する
                          </button>
                        </div>
                        <!-- 小計 -->
                        <div id="subtotal-${_escapeHtml(t.ticket_id)}" style="display:none; margin-top:8px; text-align:right; font-size:12px; color:var(--c-dim);">
                          小計: <span style="font-weight:700; color:var(--accent);">¥${Number(t.price).toLocaleString()}</span>
                        </div>
                        ` : `
                        <button disabled
                          style="width:100%; background:var(--c-raised); border:1px solid var(--c-border); color:var(--c-muted); font-size:13px; font-weight:600; padding:10px 16px; border-radius:10px; cursor:not-allowed; display:flex; align-items:center; justify-content:center; gap:6px;">
                          <span class="material-icons-outlined" style="font-size:16px;">block</span>
                          売り切れ
                        </button>
                        `}
                      </div>
                      `;
                    }).join('')}

                    <!-- セキュリティバッジ -->
                    <div style="margin-top:12px; padding-top:12px; border-top:1px solid var(--c-border); display:flex; align-items:center; justify-content:center; gap:20px; font-size:11px; color:var(--c-muted);">
                      <div style="display:flex; align-items:center; gap:4px;">
                        <span class="material-icons-outlined" style="font-size:13px; color:var(--accent);">lock</span>
                        Stripe セキュア決済
                      </div>
                      <div style="display:flex; align-items:center; gap:4px;">
                        <span class="material-icons-outlined" style="font-size:13px; color:var(--accent);">qr_code</span>
                        QRチケット即時発行
                      </div>
                    </div>
                  </div>
                </div>

                <!-- シェアボタン -->
                <div style="background:var(--c-surface); border:1px solid var(--c-border); border-radius:16px; padding:16px;">
                  <p style="font-size:11px; font-weight:700; color:var(--c-dim); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:12px; display:flex; align-items:center; gap:6px;">
                    <span class="material-icons-outlined" style="font-size:14px; color:var(--accent);">share</span>
                    シェア
                  </p>
                  <div style="display:flex; gap:8px;">
                    <button onclick="navigator.share ? navigator.share({title:'${_escapeHtml(ev.title)}',url:location.href}) : (navigator.clipboard.writeText(location.href).then(()=>AppUI.toast('URLをコピーしました','success')))"
                      style="flex:1; display:flex; align-items:center; justify-content:center; gap:6px; padding:10px; background:var(--c-raised); border:1px solid var(--c-border); border-radius:10px; color:var(--c-text-2); font-size:12px; font-weight:600; cursor:pointer; transition:all 0.15s;"
                      onmouseenter="this.style.borderColor='var(--accent)';this.style.color='var(--accent)'"
                      onmouseleave="this.style.borderColor='var(--c-border)';this.style.color='var(--c-text-2)'">
                      <span class="material-icons-outlined" style="font-size:16px;">link</span>
                      URLをコピー
                    </button>
                    <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(ev.title + ' #LinkUp')}&url=${encodeURIComponent(location.href)}"
                      target="_blank" rel="noopener noreferrer"
                      style="flex:1; display:flex; align-items:center; justify-content:center; gap:6px; padding:10px; background:rgba(0,217,255,0.06); border:1px solid rgba(0,217,255,0.2); border-radius:10px; color:var(--accent); font-size:12px; font-weight:600; cursor:pointer; text-decoration:none; transition:all 0.15s;"
                      onmouseenter="this.style.background='rgba(0,217,255,0.12)'"
                      onmouseleave="this.style.background='rgba(0,217,255,0.06)'">
                      <span class="material-icons-outlined" style="font-size:16px;">alternate_email</span>
                      X でシェア
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ─── フッター ─── -->
        <footer style="background:var(--c-canvas); border-top:1px solid var(--c-border); margin-top:48px;">
          <div style="max-width:840px; margin:0 auto; padding:40px 20px;">
            <div style="display:flex; flex-direction:column; align-items:center; gap:16px; text-align:center;">
              <button onclick="AppRouter.go('home')" style="display:flex; align-items:center; gap:8px; background:none; border:none; cursor:pointer;">
                <div style="width:32px; height:32px; background:linear-gradient(135deg,var(--accent),#0099CC); border-radius:10px; display:flex; align-items:center; justify-content:center;">
                  <span class="material-icons-outlined" style="font-size:16px; color:var(--c-bg);">link</span>
                </div>
                <span style="font-family:'Outfit',sans-serif; font-size:20px; font-weight:800; color:var(--c-text);">LinkUp</span>
              </button>
              <p style="font-size:13px; color:var(--c-dim);">人と体験をつなぐイベントプラットフォーム</p>
              <button onclick="AppRouter.go('home')"
                style="display:flex; align-items:center; gap:6px; font-size:13px; color:var(--c-dim); background:none; border:none; cursor:pointer; transition:color 0.15s;"
                onmouseenter="this.style.color='var(--c-text)'" onmouseleave="this.style.color='var(--c-dim)'">
                <span class="material-icons-outlined" style="font-size:16px;">arrow_back</span>
                イベント一覧に戻る
              </button>
            </div>
            <div style="border-top:1px solid var(--c-border); margin-top:24px; padding-top:24px; text-align:center;">
              <p style="font-size:12px; color:var(--c-muted);">&copy; 2026 LinkUp, Inc. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    `;

    // レスポンシブグリッド適用
    const applyGrid = () => {
      const grid = document.getElementById('detail-grid');
      if (!grid) return;
      if (window.innerWidth >= 768) {
        grid.style.gridTemplateColumns = '1fr 320px';
      } else {
        grid.style.gridTemplateColumns = '1fr';
      }
    };
    applyGrid();
    window.addEventListener('resize', applyGrid);

    // ─── 小計更新 ─────────────────────────────────────────
    window._updateSubtotal = function(ticketId, price) {
      const qtyEl      = document.getElementById(`qty-${ticketId}`);
      const subtotalEl = document.getElementById(`subtotal-${ticketId}`);
      if (!qtyEl || !subtotalEl) return;
      const qty   = parseInt(qtyEl.value) || 1;
      const total = price * qty;
      subtotalEl.querySelector('span').textContent = '¥' + total.toLocaleString();
      subtotalEl.style.display = qty <= 1 ? 'none' : 'block';
    };

    // ─── 購入フロー開始 ───────────────────────────────────
    window.openPurchaseFlow = function(ticketId, eventId, ticketName, price) {
      if (!AppAuth.isLoggedIn()) {
        sessionStorage.setItem('pending_purchase', JSON.stringify({ ticketId, eventId, ticketName, price }));
        _showPurchaseLoginModal(ticketName, price);
        return;
      }
      const qty = parseInt(document.getElementById(`qty-${ticketId}`)?.value || '1');
      _showPaymentModal(ticketId, eventId, ticketName, price, qty);
    };

    // ─── 購入専用ログインモーダル ─────────────────────────
    window._showPurchaseLoginModal = function(ticketName, price) {
      const existing = document.getElementById('purchase-login-modal');
      if (existing) existing.remove();

      const modal = document.createElement('div');
      modal.id = 'purchase-login-modal';
      modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center p-4';
      modal.innerHTML = `
        <div style="position:absolute; inset:0; background:rgba(5,8,15,0.85); backdrop-filter:blur(8px);" onclick="document.getElementById('purchase-login-modal').remove()"></div>
        <div style="position:relative; background:var(--c-surface); border:1px solid rgba(0,217,255,0.2); border-radius:20px; width:100%; max-width:420px; overflow:hidden; box-shadow:0 32px 80px rgba(0,0,0,0.7); animation:modalEnter 0.38s cubic-bezier(0.34,1.56,0.64,1);">
          <!-- ヘッダー -->
          <div style="background:linear-gradient(135deg,var(--accent-dim),rgba(0,217,255,0.06)); padding:24px; border-bottom:1px solid rgba(0,217,255,0.15);">
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
              <div style="width:40px; height:40px; background:var(--accent-dim); border:1px solid rgba(0,217,255,0.3); border-radius:12px; display:flex; align-items:center; justify-content:center;">
                <span class="material-icons-outlined" style="color:var(--accent); font-size:20px;">confirmation_number</span>
              </div>
              <div>
                <h3 style="font-size:16px; font-weight:800; color:var(--c-text);">チケット購入</h3>
                <p style="font-size:12px; color:var(--c-dim);">ログインして購入を続ける</p>
              </div>
            </div>
            <!-- 購入予定チケット -->
            <div style="background:rgba(0,217,255,0.08); border:1px solid rgba(0,217,255,0.2); border-radius:10px; padding:10px 14px; display:flex; align-items:center; justify-content:space-between;">
              <span style="font-size:13px; font-weight:600; color:var(--c-text-1);">${_escapeHtml(ticketName)}</span>
              <span style="font-size:15px; font-weight:800; color:var(--accent);">${price === 0 ? '無料' : '¥' + Number(price).toLocaleString()}</span>
            </div>
          </div>

          <div style="padding:24px;">
            <div id="purchase-login-error" style="display:none; margin-bottom:16px; padding:10px 14px; background:var(--hot-dim); border:1px solid rgba(255,51,102,0.3); border-radius:10px; font-size:13px; color:var(--hot);"></div>

            <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:16px;">
              <div>
                <label style="display:block; font-size:11px; font-weight:700; color:var(--c-dim); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:6px;">メールアドレス</label>
                <input type="email" id="pl-email" placeholder="example@email.com"
                  style="background:var(--c-raised); border:1.5px solid var(--c-border); color:var(--c-text); border-radius:10px; padding:10px 14px; font-size:13px; width:100%; outline:none; transition:border-color 0.15s, box-shadow 0.15s; box-sizing:border-box;"
                  onfocus="this.style.borderColor='var(--accent)';this.style.boxShadow='0 0 0 3px var(--accent-dim)'"
                  onblur="this.style.borderColor='var(--c-border)';this.style.boxShadow='none'"
                  autocomplete="email">
              </div>
              <div>
                <label style="display:block; font-size:11px; font-weight:700; color:var(--c-dim); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:6px;">パスワード</label>
                <div style="position:relative;">
                  <input type="password" id="pl-password" placeholder="パスワード"
                    style="background:var(--c-raised); border:1.5px solid var(--c-border); color:var(--c-text); border-radius:10px; padding:10px 44px 10px 14px; font-size:13px; width:100%; outline:none; transition:border-color 0.15s; box-sizing:border-box;"
                    onfocus="this.style.borderColor='var(--accent)';this.style.boxShadow='0 0 0 3px var(--accent-dim)'"
                    onblur="this.style.borderColor='var(--c-border)';this.style.boxShadow='none'"
                    autocomplete="current-password">
                  <button type="button" onclick="_togglePurchaseLoginPw()"
                    style="position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:var(--c-dim);">
                    <span class="material-icons-outlined" id="pl-pw-icon" style="font-size:18px;">visibility</span>
                  </button>
                </div>
              </div>
            </div>

            <button onclick="_doPurchaseLogin()" id="pl-submit-btn"
              style="width:100%; background:linear-gradient(135deg,var(--accent),#00AACC); color:var(--c-bg); border:none; cursor:pointer; border-radius:10px; padding:12px; font-size:14px; font-weight:800; display:flex; align-items:center; justify-content:center; gap:8px; transition:all 0.15s;">
              <span class="material-icons-outlined" style="font-size:18px;">login</span>
              ログインして購入へ進む
            </button>

            <div style="margin-top:16px; display:grid; grid-template-columns:1fr 1fr; gap:8px; text-align:center;">
              <button onclick="_switchToPurchaseRegister()"
                style="background:none; border:none; cursor:pointer; font-size:12px; color:var(--accent); font-weight:600; padding:8px; border-radius:8px; transition:background 0.15s;"
                onmouseenter="this.style.background='var(--accent-dim)'" onmouseleave="this.style.background='none'">
                新規登録はこちら
              </button>
              <button onclick="document.getElementById('purchase-login-modal').remove()"
                style="background:none; border:none; cursor:pointer; font-size:12px; color:var(--c-dim); font-weight:500; padding:8px; border-radius:8px; transition:background 0.15s;"
                onmouseenter="this.style.background='var(--c-raised)'" onmouseleave="this.style.background='none'">
                キャンセル
              </button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      setTimeout(() => document.getElementById('pl-email')?.focus(), 100);
    };

    window._togglePurchaseLoginPw = function() {
      const input = document.getElementById('pl-password');
      const icon  = document.getElementById('pl-pw-icon');
      if (input.type === 'password') { input.type = 'text'; icon.textContent = 'visibility_off'; }
      else { input.type = 'password'; icon.textContent = 'visibility'; }
    };

    window._doPurchaseLogin = async function() {
      const email    = document.getElementById('pl-email')?.value?.trim();
      const password = document.getElementById('pl-password')?.value;
      const errEl    = document.getElementById('purchase-login-error');
      const btn      = document.getElementById('pl-submit-btn');

      if (!email || !password) {
        errEl.textContent = 'メールアドレスとパスワードを入力してください';
        errEl.style.display = 'block';
        return;
      }
      btn.disabled = true;
      btn.innerHTML = '<div style="width:16px;height:16px;border:2px solid rgba(5,8,15,0.3);border-top-color:var(--c-bg);border-radius:50%;animation:spin 0.9s linear infinite;"></div><span>ログイン中...</span>';

      try {
        await AppAuth.login(email, password);
        document.getElementById('purchase-login-modal')?.remove();
        AppUI.toast('ログインしました！', 'success');
        const pending = sessionStorage.getItem('pending_purchase');
        if (pending) {
          const { ticketId, eventId: pEvId, ticketName: pName, price: pPrice } = JSON.parse(pending);
          if (pEvId === id) {
            sessionStorage.removeItem('pending_purchase');
            const qty = parseInt(document.getElementById(`qty-${ticketId}`)?.value || '1');
            setTimeout(() => _showPaymentModal(ticketId, pEvId, pName, pPrice, qty), 400);
          }
        }
      } catch (err) {
        errEl.textContent = err.message || 'ログインに失敗しました';
        errEl.style.display = 'block';
        btn.disabled = false;
        btn.innerHTML = '<span class="material-icons-outlined" style="font-size:18px;">login</span>ログインして購入へ進む';
      }
    };

    window._switchToPurchaseRegister = function() {
      document.getElementById('purchase-login-modal')?.remove();
      AppUI.openRegisterModal();
    };

    // ─── Stripe 決済モーダル ──────────────────────────────
    window._showPaymentModal = function(ticketId, eventId, ticketName, price, qty) {
      const total    = price * qty;
      const existing = document.getElementById('payment-modal');
      if (existing) existing.remove();

      const inputStyle = `background:var(--c-raised); border:1.5px solid var(--c-border); color:var(--c-text); border-radius:10px; padding:10px 14px; font-size:13px; width:100%; outline:none; transition:border-color 0.15s; box-sizing:border-box; font-family:'JetBrains Mono',monospace;`;

      const modal = document.createElement('div');
      modal.id = 'payment-modal';
      modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center p-4';
      modal.innerHTML = `
        <div style="position:absolute; inset:0; background:rgba(5,8,15,0.85); backdrop-filter:blur(8px);" onclick="_closePaymentModal()"></div>
        <div style="position:relative; background:var(--c-surface); border:1px solid rgba(0,217,255,0.15); border-radius:20px; width:100%; max-width:420px; overflow:hidden; box-shadow:0 32px 80px rgba(0,0,0,0.7); animation:modalEnter 0.38s cubic-bezier(0.34,1.56,0.64,1); max-height:90vh; overflow-y:auto;">

          <!-- ヘッダー -->
          <div style="background:linear-gradient(135deg,var(--c-raised),var(--c-canvas)); padding:20px; border-bottom:1px solid var(--c-border); display:flex; align-items:center; justify-content:space-between;">
            <div style="display:flex; align-items:center; gap:12px;">
              <div style="width:36px; height:36px; background:var(--accent-dim); border:1px solid rgba(0,217,255,0.3); border-radius:10px; display:flex; align-items:center; justify-content:center;">
                <span class="material-icons-outlined" style="font-size:18px; color:var(--accent);">credit_card</span>
              </div>
              <div>
                <h3 style="font-size:15px; font-weight:800; color:var(--c-text);">お支払い</h3>
                <p style="font-size:11px; color:var(--c-dim);">Stripe セキュア決済</p>
              </div>
            </div>
            <button onclick="_closePaymentModal()"
              style="width:32px; height:32px; background:var(--c-raised); border:1px solid var(--c-border); border-radius:10px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--c-dim); transition:all 0.15s;"
              onmouseenter="this.style.borderColor='var(--hot)';this.style.color='var(--hot)'" onmouseleave="this.style.borderColor='var(--c-border)';this.style.color='var(--c-dim)'">
              <span class="material-icons-outlined" style="font-size:16px;">close</span>
            </button>
          </div>

          <!-- 購入サマリー -->
          <div style="background:var(--accent-dim); padding:16px 20px; border-bottom:1px solid rgba(0,217,255,0.15);">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">
              <div>
                <p style="font-size:11px; color:var(--c-dim); font-weight:500;">購入チケット</p>
                <p style="font-size:14px; font-weight:700; color:var(--c-text);">${_escapeHtml(ticketName)}</p>
              </div>
              <div style="text-align:right;">
                <p style="font-size:11px; color:var(--c-dim);">${qty}枚 × ¥${Number(price).toLocaleString()}</p>
                <p style="font-size:20px; font-weight:800; color:var(--accent);">¥${Number(total).toLocaleString()}</p>
              </div>
            </div>
            ${qty > 1 ? `<p style="font-size:11px; color:var(--c-dim); text-align:right;">${qty}枚のQRチケットが発行されます</p>` : ''}
          </div>

          <!-- 支払い内容 -->
          <div style="padding:20px;">
            <!-- 支払い方法選択 -->
            <div id="payment-step-select">
              <p style="font-size:13px; font-weight:700; color:var(--c-text); margin-bottom:12px;">お支払い方法を選択</p>

              <!-- クレジットカード -->
              <button id="pay-method-card" onclick="_selectPayMethod('card')"
                style="width:100%; display:flex; align-items:center; gap:12px; padding:14px; background:var(--c-raised); border:1.5px solid var(--c-border); border-radius:12px; margin-bottom:8px; cursor:pointer; transition:all 0.2s; text-align:left;"
                onmouseenter="this.style.borderColor='var(--accent)';this.style.background='rgba(0,217,255,0.04)'"
                onmouseleave="this.style.borderColor='var(--c-border)';this.style.background='var(--c-raised)'">
                <div style="width:40px; height:40px; background:var(--accent-dim); border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                  <span class="material-icons-outlined" style="font-size:20px; color:var(--accent);">credit_card</span>
                </div>
                <div>
                  <p style="font-size:13px; font-weight:700; color:var(--c-text);">クレジットカード</p>
                  <p style="font-size:11px; color:var(--c-dim);">Visa / Mastercard / JCB / Amex</p>
                </div>
                <span class="material-icons-outlined" style="font-size:20px; color:var(--c-muted); margin-left:auto;">chevron_right</span>
              </button>

              ${total === 0 ? `
              <button onclick="_confirmFreePurchase('${_escapeHtml(ticketId)}', '${_escapeHtml(eventId)}', ${qty})"
                style="width:100%; display:flex; align-items:center; gap:12px; padding:14px; background:rgba(57,255,20,0.06); border:1.5px solid rgba(57,255,20,0.25); border-radius:12px; cursor:pointer; transition:all 0.2s; text-align:left; margin-top:8px;"
                onmouseenter="this.style.borderColor='var(--lime)';this.style.background='rgba(57,255,20,0.1)'"
                onmouseleave="this.style.borderColor='rgba(57,255,20,0.25)';this.style.background='rgba(57,255,20,0.06)'">
                <div style="width:40px; height:40px; background:rgba(57,255,20,0.1); border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                  <span class="material-icons-outlined" style="font-size:20px; color:var(--lime);">card_giftcard</span>
                </div>
                <div>
                  <p style="font-size:13px; font-weight:700; color:var(--lime);">無料で参加登録</p>
                  <p style="font-size:11px; color:var(--c-dim);">クレジットカード不要</p>
                </div>
              </button>
              ` : ''}

              <p style="text-align:center; font-size:11px; color:var(--c-muted); margin-top:12px; display:flex; align-items:center; justify-content:center; gap:4px;">
                <span class="material-icons-outlined" style="font-size:13px; color:var(--accent);">lock</span>
                256bit SSL暗号化通信
              </p>
            </div>

            <!-- カード情報入力 -->
            <div id="payment-step-card" style="display:none;">
              <button onclick="_backToPayMethodSelect()"
                style="display:flex; align-items:center; gap:4px; font-size:12px; color:var(--c-dim); background:none; border:none; cursor:pointer; margin-bottom:16px; transition:color 0.15s;"
                onmouseenter="this.style.color='var(--c-text)'" onmouseleave="this.style.color='var(--c-dim)'">
                <span class="material-icons-outlined" style="font-size:14px;">arrow_back</span>
                支払い方法選択に戻る
              </button>

              <div id="payment-error" style="display:none; margin-bottom:12px; padding:10px 14px; background:var(--hot-dim); border:1px solid rgba(255,51,102,0.3); border-radius:10px; font-size:13px; color:var(--hot);"></div>

              <div style="display:flex; flex-direction:column; gap:12px;">
                <div>
                  <label style="display:block; font-size:11px; font-weight:700; color:var(--c-dim); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:6px;">カード番号</label>
                  <input type="text" id="card-number" placeholder="1234 5678 9012 3456" maxlength="19"
                    oninput="this.value=this.value.replace(/[^0-9]/g,'').replace(/(.{4})/g,'$1 ').trim()"
                    style="${inputStyle} letter-spacing:0.15em;"
                    onfocus="this.style.borderColor='var(--accent)';this.style.boxShadow='0 0 0 3px var(--accent-dim)'"
                    onblur="this.style.borderColor='var(--c-border)';this.style.boxShadow='none'">
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                  <div>
                    <label style="display:block; font-size:11px; font-weight:700; color:var(--c-dim); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:6px;">有効期限</label>
                    <input type="text" id="card-expiry" placeholder="MM/YY" maxlength="5"
                      oninput="this.value=this.value.replace(/[^0-9]/g,'').replace(/^(.{2})(.+)/,'$1/$2')"
                      style="${inputStyle}"
                      onfocus="this.style.borderColor='var(--accent)';this.style.boxShadow='0 0 0 3px var(--accent-dim)'"
                      onblur="this.style.borderColor='var(--c-border)';this.style.boxShadow='none'">
                  </div>
                  <div>
                    <label style="display:block; font-size:11px; font-weight:700; color:var(--c-dim); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:6px;">セキュリティコード</label>
                    <input type="text" id="card-cvc" placeholder="123" maxlength="4"
                      oninput="this.value=this.value.replace(/[^0-9]/g,'')"
                      style="${inputStyle}"
                      onfocus="this.style.borderColor='var(--accent)';this.style.boxShadow='0 0 0 3px var(--accent-dim)'"
                      onblur="this.style.borderColor='var(--c-border)';this.style.boxShadow='none'">
                  </div>
                </div>
                <div>
                  <label style="display:block; font-size:11px; font-weight:700; color:var(--c-dim); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:6px;">カード名義人（ローマ字）</label>
                  <input type="text" id="card-name" placeholder="TARO YAMADA"
                    oninput="this.value=this.value.toUpperCase()"
                    style="${inputStyle} text-transform:uppercase;"
                    onfocus="this.style.borderColor='var(--accent)';this.style.boxShadow='0 0 0 3px var(--accent-dim)'"
                    onblur="this.style.borderColor='var(--c-border)';this.style.boxShadow='none'">
                </div>
              </div>

              <!-- プロモコード -->
              <div style="margin-top:12px;">
                <button type="button" id="promo-toggle" onclick="_togglePromoInput()"
                  style="font-size:12px; color:var(--accent); background:none; border:none; cursor:pointer; display:flex; align-items:center; gap:4px; font-weight:600;">
                  <span class="material-icons-outlined" style="font-size:14px;">local_offer</span>
                  プロモコードをお持ちの方
                </button>
                <div id="promo-input-area" style="display:none; margin-top:8px; display:flex; gap:8px;">
                  <input type="text" id="promo-code-input" placeholder="コードを入力"
                    style="flex:1; background:var(--c-raised); border:1.5px solid var(--c-border); color:var(--c-text); border-radius:8px; padding:8px 12px; font-size:12px; outline:none;"
                    onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='var(--c-border)'">
                  <button onclick="_applyPromo()"
                    style="padding:8px 12px; background:var(--accent-dim); border:1px solid rgba(0,217,255,0.3); border-radius:8px; color:var(--accent); font-size:11px; font-weight:700; cursor:pointer;">適用</button>
                </div>
                <div id="promo-result" style="display:none; margin-top:8px; padding:8px 12px; background:rgba(57,255,20,0.08); border:1px solid rgba(57,255,20,0.2); border-radius:8px; font-size:12px; color:var(--lime); font-weight:600;"></div>
              </div>

              <!-- 合計確認 -->
              <div style="margin-top:16px; background:var(--c-raised); border:1px solid var(--c-border); border-radius:12px; padding:16px;">
                <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:6px;">
                  <span style="color:var(--c-dim);">小計</span>
                  <span style="font-weight:600; color:var(--c-text-1);">¥${Number(total).toLocaleString()}</span>
                </div>
                <div id="discount-row" style="display:none; justify-content:space-between; font-size:13px; margin-bottom:6px;">
                  <span style="color:var(--lime);">割引</span>
                  <span style="font-weight:600; color:var(--lime);" id="discount-amount">-¥0</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:15px; font-weight:800; border-top:1px solid var(--c-border); padding-top:10px; margin-top:4px;">
                  <span style="color:var(--c-text);">合計</span>
                  <span style="color:var(--accent);" id="final-total">¥${Number(total).toLocaleString()}</span>
                </div>
              </div>

              <button id="pay-submit-btn"
                onclick="_submitPayment('${_escapeHtml(ticketId)}', '${_escapeHtml(eventId)}', ${qty}, ${total})"
                style="margin-top:16px; width:100%; background:linear-gradient(135deg,var(--accent),#00AACC); color:var(--c-bg); border:none; cursor:pointer; border-radius:12px; padding:16px; font-size:15px; font-weight:800; display:flex; align-items:center; justify-content:center; gap:8px; transition:all 0.15s; box-shadow:0 4px 20px rgba(0,217,255,0.25);"
                onmouseenter="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 28px rgba(0,217,255,0.4)'"
                onmouseleave="this.style.transform='none';this.style.boxShadow='0 4px 20px rgba(0,217,255,0.25)'">
                <span class="material-icons-outlined" style="font-size:20px;">payment</span>
                ¥${Number(total).toLocaleString()} を支払う
              </button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    };

    window._closePaymentModal = function() {
      document.getElementById('payment-modal')?.remove();
    };

    window._selectPayMethod = function(method) {
      if (method === 'card') {
        document.getElementById('payment-step-select').style.display = 'none';
        document.getElementById('payment-step-card').style.display = 'block';
        setTimeout(() => document.getElementById('card-number')?.focus(), 100);
      }
    };

    window._backToPayMethodSelect = function() {
      document.getElementById('payment-step-card').style.display = 'none';
      document.getElementById('payment-step-select').style.display = 'block';
    };

    window._togglePromoInput = function() {
      const area = document.getElementById('promo-input-area');
      if (area.style.display === 'none' || !area.style.display) {
        area.style.display = 'flex';
        document.getElementById('promo-code-input')?.focus();
      } else {
        area.style.display = 'none';
      }
    };

    window._applyPromo = function() {
      const code   = document.getElementById('promo-code-input')?.value?.trim();
      if (!code) return;
      const result = document.getElementById('promo-result');
      result.textContent = `プロモコード「${code}」は決済時に適用されます`;
      result.style.display = 'block';
    };

    // 無料チケット処理
    window._confirmFreePurchase = async function(ticketId, eventId, qty) {
      _closePaymentModal();
      try {
        const result = await window.LinkUpAPI.Orders.create(ticketId, qty, eventId);
        _showPurchaseSuccessModal(result.order);
        setTimeout(() => renderDetail({ id: eventId }), 3000);
      } catch (err) {
        AppUI.toast(err.message || '登録に失敗しました', 'error');
      }
    };

    // ─── 決済実行 ──────────────────────────────────────────
    window._submitPayment = async function(ticketId, eventId, qty, amount) {
      const cardNumber = document.getElementById('card-number')?.value?.replace(/\s/g, '');
      const expiry     = document.getElementById('card-expiry')?.value;
      const cvc        = document.getElementById('card-cvc')?.value;
      const cardName   = document.getElementById('card-name')?.value?.trim();
      const errEl      = document.getElementById('payment-error');
      const btn        = document.getElementById('pay-submit-btn');
      const promoCode  = document.getElementById('promo-code-input')?.value?.trim() || '';

      errEl.style.display = 'none';
      if (!cardNumber || cardNumber.length < 13) {
        errEl.textContent = 'カード番号を正しく入力してください';
        errEl.style.display = 'block'; return;
      }
      if (!expiry || !/^\d{2}\/\d{2}$/.test(expiry)) {
        errEl.textContent = '有効期限を MM/YY 形式で入力してください';
        errEl.style.display = 'block'; return;
      }
      if (!cvc || cvc.length < 3) {
        errEl.textContent = 'セキュリティコードを入力してください';
        errEl.style.display = 'block'; return;
      }
      if (!cardName) {
        errEl.textContent = 'カード名義人を入力してください';
        errEl.style.display = 'block'; return;
      }

      btn.disabled = true;
      btn.innerHTML = '<div style="width:20px;height:20px;border:2px solid rgba(5,8,15,0.3);border-top-color:var(--c-bg);border-radius:50%;animation:spin 0.9s linear infinite;"></div><span>決済処理中...</span>';

      try {
        const intentRes = await window.LinkUpAPI._requestFlexible('/api/payment/create-intent', {
          method: 'POST',
          body: JSON.stringify({ amount, ticket_id: ticketId, event_id: eventId, quantity: qty }),
          auth: true,
        });
        const paymentIntentId = intentRes.payment_intent_id || 'mock_' + Date.now();
        const confirmRes = await window.LinkUpAPI._requestFlexible('/api/payment/confirm', {
          method: 'POST',
          body: JSON.stringify({
            payment_intent_id: paymentIntentId,
            ticket_id: ticketId,
            event_id: eventId,
            quantity: qty,
            promo_code: promoCode || undefined,
          }),
          auth: true,
        });
        _closePaymentModal();
        _showPurchaseSuccessModal(confirmRes.order);
        sessionStorage.removeItem('pending_purchase');
        setTimeout(() => renderDetail({ id: eventId }), 4000);
      } catch (err) {
        errEl.textContent = err.message || '決済に失敗しました。カード情報をご確認ください。';
        errEl.style.display = 'block';
        btn.disabled = false;
        btn.innerHTML = `<span class="material-icons-outlined" style="font-size:20px;">payment</span>¥${Number(amount).toLocaleString()} を支払う`;
      }
    };

    // ─── 購入完了モーダル ─────────────────────────────────
    window._showPurchaseSuccessModal = function(order) {
      const existing = document.getElementById('success-modal');
      if (existing) existing.remove();

      const orderId     = order.order_id || '';
      const orderNumber = order.order_number || 'ORD-??????';
      const total       = order.total || order.subtotal || 0;

      const qrData = encodeURIComponent(`LINKUP:${orderId}:${Date.now()}`);
      const qrUrl  = `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${qrData}&choe=UTF-8`;

      const modal = document.createElement('div');
      modal.id = 'success-modal';
      modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center p-4';
      modal.innerHTML = `
        <div style="position:absolute; inset:0; background:rgba(5,8,15,0.85); backdrop-filter:blur(8px);"></div>
        <div style="position:relative; background:var(--c-surface); border:1px solid rgba(57,255,20,0.3); border-radius:20px; width:100%; max-width:360px; overflow:hidden; box-shadow:0 32px 80px rgba(0,0,0,0.7), 0 0 40px rgba(57,255,20,0.08); animation:modalEnter 0.38s cubic-bezier(0.34,1.56,0.64,1);">

          <!-- 成功アニメーション -->
          <div style="background:linear-gradient(135deg,rgba(57,255,20,0.15),rgba(57,255,20,0.06)); padding:32px 24px; text-align:center; border-bottom:1px solid rgba(57,255,20,0.15);">
            <div style="width:64px; height:64px; background:rgba(57,255,20,0.15); border:2px solid rgba(57,255,20,0.4); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 12px; animation:bounce-soft 2s ease-in-out infinite;">
              <span class="material-icons-outlined" style="font-size:32px; color:var(--lime);">check_circle</span>
            </div>
            <h2 style="font-family:'Outfit',sans-serif; font-size:26px; font-weight:900; color:var(--c-text); margin-bottom:4px;">購入完了！</h2>
            <p style="font-size:13px; color:var(--lime);">チケットを取得しました</p>
          </div>

          <div style="padding:24px; text-align:center;">
            <!-- 注文番号 -->
            <div style="background:var(--c-raised); border:1px solid var(--c-border); border-radius:12px; padding:12px 16px; margin-bottom:16px;">
              <p style="font-size:11px; color:var(--c-dim); margin-bottom:4px;">注文番号</p>
              <p style="font-family:'JetBrains Mono',monospace; font-size:17px; font-weight:700; color:var(--c-text); letter-spacing:0.1em;">${_escapeHtml(orderNumber)}</p>
              ${total > 0 ? `<p style="font-size:12px; color:var(--c-dim); margin-top:4px;">合計: <span style="font-weight:700; color:var(--accent);">¥${Number(total).toLocaleString()}</span></p>` : ''}
            </div>

            <!-- QRコード -->
            <div style="margin-bottom:16px;">
              <p style="font-size:12px; color:var(--c-dim); margin-bottom:8px; font-weight:500;">入場用QRコード</p>
              <div style="width:128px; height:128px; margin:0 auto; background:var(--c-raised); border:2px solid var(--c-border); border-radius:16px; padding:8px; display:flex; align-items:center; justify-content:center;">
                <img src="${qrUrl}" alt="QR Code" style="width:100%; height:100%;"
                  onerror="this.parentElement.innerHTML='<span style=\\'font-size:11px;color:var(--c-dim);\\'>QR生成中</span>'">
              </div>
              <p style="font-size:11px; color:var(--c-muted); margin-top:8px;">ダッシュボードから確認・ダウンロードできます</p>
            </div>

            <div style="display:flex; gap:8px;">
              <button onclick="AppRouter.go('dashboard',{tab:'tickets'}); document.getElementById('success-modal').remove();"
                style="flex:1; background:linear-gradient(135deg,var(--accent),#00AACC); color:var(--c-bg); border:none; cursor:pointer; border-radius:10px; padding:12px; font-size:13px; font-weight:800; display:flex; align-items:center; justify-content:center; gap:6px; transition:all 0.15s;">
                <span class="material-icons-outlined" style="font-size:16px;">confirmation_number</span>
                チケットを見る
              </button>
              <button onclick="document.getElementById('success-modal').remove()"
                style="padding:12px 16px; background:var(--c-raised); border:1px solid var(--c-border); color:var(--c-dim); border-radius:10px; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.15s;"
                onmouseenter="this.style.color='var(--c-text)'" onmouseleave="this.style.color='var(--c-dim)'">
                閉じる
              </button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    };

    // ─── ペンディング購入の自動再開 ──────────────────────
    const pending = sessionStorage.getItem('pending_purchase');
    if (pending && AppAuth.isLoggedIn()) {
      try {
        const { ticketId, eventId: pendingEventId, ticketName: pName, price: pPrice } = JSON.parse(pending);
        if (pendingEventId === id) {
          sessionStorage.removeItem('pending_purchase');
          setTimeout(() => {
            AppUI.toast('ログインしました。チケット購入を続けます...', 'info');
            const qty = parseInt(document.getElementById(`qty-${ticketId}`)?.value || '1');
            setTimeout(() => _showPaymentModal(ticketId, pendingEventId, pName || 'チケット', pPrice || 0, qty), 800);
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
