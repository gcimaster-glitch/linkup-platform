/**
 * LinkUp ホームページ v3
 * Design: "Code Editor meets Event Platform"
 * Frontend Design Skill準拠: 非対称レイアウト・ネオンアクセント・IDE暗黒テーマ
 */

async function renderHome(params) {
  const app = document.getElementById('app');
  if (!app) return;

  const searchQuery = params?.search || '';
  const user = window.currentUser;

  app.innerHTML = `
    <div style="min-height: 100vh; background: var(--c-bg);">

      <!-- ═══ ヒーロー: 非対称2カラム ═══ -->
      <section style="
        position: relative;
        overflow: hidden;
        background: var(--c-canvas);
        min-height: 580px;
        display: flex;
        align-items: center;
      ">
        <!-- スキャンライン効果 -->
        <div style="
          position: absolute; inset: 0; pointer-events: none; z-index: 1; overflow: hidden;
        ">
          <div style="
            position: absolute; left: 0; right: 0; height: 1px;
            background: linear-gradient(90deg, transparent, var(--accent), transparent);
            animation: scan 8s linear infinite; opacity: 0.15;
          "></div>
        </div>

        <!-- 背景装飾 -->
        <div style="position: absolute; inset: 0; pointer-events: none; overflow: hidden;">
          <!-- ドットグリッド -->
          <div style="
            position: absolute; inset: 0;
            background-image: radial-gradient(rgba(0, 217, 255, 0.06) 1px, transparent 1px);
            background-size: 32px 32px;
          "></div>
          <!-- グロー -->
          <div style="position: absolute; top: -100px; left: -100px; width: 600px; height: 600px; background: radial-gradient(circle, rgba(0,217,255,0.06) 0%, transparent 70%); border-radius: 50%;"></div>
          <div style="position: absolute; bottom: -150px; right: -50px; width: 500px; height: 500px; background: radial-gradient(circle, rgba(255,51,102,0.05) 0%, transparent 70%); border-radius: 50%;"></div>
          <!-- 斜線アクセント -->
          <div style="
            position: absolute; top: 0; right: 0;
            width: 45%; height: 100%;
            background: linear-gradient(135deg, transparent 40%, rgba(0,217,255,0.025) 100%);
          "></div>
          <!-- ターミナルライン -->
          <div style="
            position: absolute; top: 0; bottom: 0; left: 42%;
            width: 1px;
            background: linear-gradient(180deg, transparent, rgba(0,217,255,0.2) 30%, rgba(0,217,255,0.2) 70%, transparent);
            display: none;
          " class="hidden lg:block"></div>
        </div>

        <div style="
          position: relative; z-index: 2;
          width: 100%; max-width: 1200px;
          margin: 0 auto;
          padding: 80px 24px 80px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: center;
        " class="hero-grid">

          <!-- 左: テキストコンテンツ -->
          <div>
            <!-- ターミナルプロンプト風バッジ -->
            <div style="
              display: inline-flex; align-items: center; gap: 8px;
              padding: 6px 14px;
              background: var(--accent-dim);
              border: 1px solid rgba(0, 217, 255, 0.2);
              border-radius: 99px;
              margin-bottom: 28px;
            ">
              <span style="
                display: inline-block; width: 8px; height: 8px;
                background: var(--accent); border-radius: 50%;
                animation: pulseNeon 2s ease-in-out infinite;
                box-shadow: 0 0 8px var(--accent);
              "></span>
              <span style="
                font-family: 'JetBrains Mono', monospace;
                font-size: 11px;
                color: var(--accent);
                letter-spacing: 0.06em;
              ">v3.0.0 // 日本最大級イベントプラットフォーム</span>
            </div>

            <!-- 見出し -->
            <h1 style="
              font-family: 'Outfit', 'Noto Sans JP', sans-serif;
              font-size: clamp(40px, 5vw, 68px);
              font-weight: 900;
              line-height: 1.05;
              letter-spacing: -0.03em;
              color: var(--c-text);
              margin-bottom: 20px;
            ">
              あらゆる体験と<br>
              <span style="
                background: linear-gradient(135deg, var(--accent) 0%, #00AAFF 50%, #FFFFFF 100%);
                -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                background-clip: text;
              ">人をつなぐ。</span>
            </h1>

            <p style="
              font-family: 'DM Sans', 'Noto Sans JP', sans-serif;
              font-size: 16px;
              line-height: 1.85;
              color: var(--c-text-2);
              max-width: 440px;
              margin-bottom: 36px;
            ">
              テック・ビジネス・音楽・アート・スポーツ—<br>
              気になるイベントを見つけて、QRチケットをその場で購入。
            </p>

            <!-- 検索バー -->
            <div style="
              display: flex; gap: 8px; margin-bottom: 32px;
              max-width: 480px;
            ">
              <div style="position: relative; flex: 1;">
                <span class="material-icons-outlined" style="
                  position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
                  color: var(--c-dim); font-size: 20px; pointer-events: none;
                ">search</span>
                <input type="text" id="hero-search" placeholder="イベントを検索... (例: AI, 音楽)" value="${_escapeHtml(searchQuery)}"
                  style="
                    width: 100%; padding: 14px 16px 14px 46px;
                    font-size: 15px;
                  "
                  onkeypress="if(event.key==='Enter') homeSearch(this.value)">
              </div>
              <button onclick="homeSearch(document.getElementById('hero-search').value)"
                class="btn-primary ripple"
                style="padding: 14px 24px; font-size: 15px; white-space: nowrap;">
                検索
              </button>
            </div>

            <!-- クイックタグ -->
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${['テック', 'ビジネス', '音楽', 'アート', 'グルメ'].map((tag, i) => `
                <button onclick="homeSearch('${tag}')"
                  style="
                    padding: 6px 14px;
                    background: var(--c-surface);
                    border: 1px solid var(--c-border);
                    border-radius: 99px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 12px; font-weight: 600;
                    color: var(--c-text-2);
                    cursor: pointer;
                    transition: all 0.2s ease;
                  "
                  onmouseover="this.style.borderColor='var(--accent)'; this.style.color='var(--accent)'; this.style.background='var(--accent-dim)';"
                  onmouseout="this.style.borderColor='var(--c-border)'; this.style.color='var(--c-text-2)'; this.style.background='var(--c-surface)';">
                  #${tag}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- 右: コードエディタ風ウィジェット -->
          <div style="position: relative;" class="hero-widget">

            <!-- メインカード: エディタ風 -->
            <div style="
              background: var(--c-surface);
              border: 1px solid var(--c-border);
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,217,255,0.08);
              position: relative;
            ">
              <!-- ウィンドウバー -->
              <div style="
                padding: 10px 16px;
                background: var(--c-raised);
                border-bottom: 1px solid var(--c-border);
                display: flex; align-items: center; gap: 8px;
              ">
                <div style="width: 12px; height: 12px; border-radius: 50%; background: #FF5F56;"></div>
                <div style="width: 12px; height: 12px; border-radius: 50%; background: #FEBC2E;"></div>
                <div style="width: 12px; height: 12px; border-radius: 50%; background: #28C840;"></div>
                <span style="
                  margin-left: 8px;
                  font-family: 'JetBrains Mono', monospace;
                  font-size: 11px; color: var(--c-dim);
                ">linkup.event.js</span>
              </div>

              <!-- コードっぽいコンテンツ -->
              <div style="padding: 20px 20px 8px;">
                <div style="
                  font-family: 'JetBrains Mono', monospace;
                  font-size: 12px;
                  line-height: 2;
                  color: var(--c-dim);
                ">
                  <div><span style="color: #9B59FF;">const</span> <span style="color: var(--accent);">event</span> = {</div>
                  <div style="padding-left: 16px;"><span style="color: var(--c-text-2);">title:</span> <span style="color: #39FF14;">"AI × デザイン 最前線"</span>,</div>
                  <div style="padding-left: 16px;"><span style="color: var(--c-text-2);">date:</span>  <span style="color: #39FF14;">"2026.03.15 14:00"</span>,</div>
                  <div style="padding-left: 16px;"><span style="color: var(--c-text-2);">ticket:</span> <span style="color: var(--amber);">¥3,000</span>,</div>
                  <div style="padding-left: 16px;"><span style="color: var(--c-text-2);">qr:</span> <span style="color: var(--accent); font-size: 11px;">LINKUP:ord-xxx:sig</span></div>
                  <div>}</div>
                </div>
              </div>

              <!-- スタッツバー -->
              <div style="
                padding: 12px 20px 20px;
                display: grid; grid-template-columns: repeat(3, 1fr);
                gap: 12px;
              ">
                ${[
                  { val: '1,200+', label: 'events', color: 'var(--accent)' },
                  { val: '48k+',   label: 'users',  color: 'var(--violet)' },
                  { val: '99.9%',  label: 'uptime', color: 'var(--lime)' },
                ].map(s => `
                  <div style="
                    background: var(--c-raised);
                    border: 1px solid var(--c-border);
                    border-radius: 12px;
                    padding: 12px;
                    text-align: center;
                  ">
                    <div style="
                      font-family: 'Outfit', sans-serif;
                      font-size: 20px; font-weight: 800;
                      color: ${s.color};
                    ">${s.val}</div>
                    <div style="
                      font-family: 'JetBrains Mono', monospace;
                      font-size: 10px; color: var(--c-dim);
                      margin-top: 2px;
                    ">${s.label}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- フローティング: QRチケット -->
            <div style="
              position: absolute;
              bottom: -20px; right: -20px;
              background: var(--c-raised);
              border: 1px solid rgba(0,217,255,0.25);
              border-radius: 16px;
              padding: 12px 16px;
              display: flex; align-items: center; gap: 10px;
              box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(0,217,255,0.1);
              animation: bounceSoft 3s ease-in-out infinite;
            " class="hidden sm:flex">
              <div style="
                width: 36px; height: 36px;
                background: var(--accent-dim);
                border: 1px solid rgba(0,217,255,0.3);
                border-radius: 10px;
                display: flex; align-items: center; justify-content: center;
              ">
                <span class="material-icons-outlined" style="color: var(--accent); font-size: 20px;">qr_code_2</span>
              </div>
              <div>
                <div style="font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 700; color: var(--c-text);">QR チケット即時発行</div>
                <div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--c-dim);">HMAC-SHA256 署名</div>
              </div>
            </div>
          </div>

        </div>

        <!-- レスポンシブ用スタイル -->
        <style>
          @media (max-width: 768px) {
            .hero-grid { grid-template-columns: 1fr !important; }
            .hero-widget { display: none !important; }
          }
        </style>
      </section>

      <!-- ═══ イベント一覧 ═══ -->
      <section style="
        max-width: 1200px; margin: 0 auto;
        padding: 64px 24px;
      ">

        <!-- セクションヘッダー -->
        <div style="
          display: flex; align-items: flex-end; justify-content: space-between;
          margin-bottom: 36px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--c-border);
        ">
          <div>
            <div class="terminal-label" style="margin-bottom: 8px;">
              ${searchQuery ? `search_results("${_escapeHtml(searchQuery)}")` : 'events.latest()'}
            </div>
            <h2 style="
              font-family: 'Outfit', sans-serif;
              font-size: clamp(24px, 3vw, 32px);
              font-weight: 800;
              color: var(--c-text);
              letter-spacing: -0.02em;
            ">${searchQuery ? `"${_escapeHtml(searchQuery)}" の検索結果` : '注目のイベント'}</h2>
          </div>
          <button onclick="AppRouter.go('home')"
            style="
              display: flex; align-items: center; gap: 6px;
              padding: 8px 16px;
              font-size: 13px; font-weight: 600;
              color: var(--accent);
              background: var(--accent-dim);
              border: 1px solid rgba(0,217,255,0.2);
              border-radius: 99px;
              cursor: pointer;
              transition: all 0.2s;
            "
            onmouseover="this.style.background='rgba(0,217,255,0.15)'"
            onmouseout="this.style.background='var(--accent-dim)'">
            すべて表示
            <span class="material-icons-outlined" style="font-size: 16px;">arrow_forward</span>
          </button>
        </div>

        <!-- イベントグリッド -->
        <div id="events-grid" style="
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        ">
          ${[1,2,3,4,5,6].map(() => `
            <div class="skeleton" style="height: 320px; border-radius: 20px;"></div>
          `).join('')}
        </div>

      </section>

      <!-- ═══ フィーチャーセクション ═══ -->
      <section style="
        background: var(--c-surface);
        border-top: 1px solid var(--c-border);
        border-bottom: 1px solid var(--c-border);
        padding: 80px 24px;
      ">
        <div style="max-width: 1200px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 56px;">
            <div class="terminal-label" style="display: inline-block; margin-bottom: 12px;">features.all()</div>
            <h2 style="
              font-family: 'Outfit', sans-serif;
              font-size: clamp(28px, 3vw, 40px);
              font-weight: 800; color: var(--c-text);
              letter-spacing: -0.02em;
            ">なぜ LinkUp なのか</h2>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px;">
            ${[
              { icon: 'qr_code_2',       label: 'QRチケット',   desc: 'HMAC-SHA256署名で偽造防止。購入即時発行、スマホで入場。', color: 'var(--accent)' },
              { icon: 'bolt',            label: '即時購入',      desc: 'Stripe決済で数秒チェックアウト。クレカ・無料チケット対応。', color: 'var(--lime)' },
              { icon: 'show_chart',      label: '主催者分析',    desc: '売上・参加率・チェックイン状況をリアルタイムダッシュボードで管理。', color: 'var(--violet)' },
              { icon: 'verified_user',   label: '本人確認',      desc: 'StripeのeKYCによる安全な本人確認フロー。安心して参加登録。', color: 'var(--amber)' },
            ].map(f => `
              <div class="reveal" style="
                background: var(--c-raised);
                border: 1px solid var(--c-border);
                border-radius: 20px;
                padding: 28px;
                transition: border-color 0.2s, box-shadow 0.2s;
              "
              onmouseover="this.style.borderColor='${f.color}30'; this.style.boxShadow='0 0 30px ${f.color}10';"
              onmouseout="this.style.borderColor='var(--c-border)'; this.style.boxShadow='none';">
                <div style="
                  width: 48px; height: 48px;
                  background: ${f.color}18;
                  border: 1px solid ${f.color}30;
                  border-radius: 14px;
                  display: flex; align-items: center; justify-content: center;
                  margin-bottom: 16px;
                ">
                  <span class="material-icons-outlined" style="color: ${f.color}; font-size: 24px;">${f.icon}</span>
                </div>
                <h3 style="
                  font-family: 'Outfit', sans-serif;
                  font-size: 17px; font-weight: 700;
                  color: var(--c-text); margin-bottom: 8px;
                ">${f.label}</h3>
                <p style="
                  font-size: 13px; line-height: 1.7;
                  color: var(--c-text-2);
                ">${f.desc}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- ═══ CTA ═══ -->
      <section style="
        padding: 80px 24px;
        max-width: 1200px; margin: 0 auto;
        display: grid; grid-template-columns: 1fr 1fr; gap: 24px;
      " class="cta-grid">

        <!-- 参加者向け -->
        <div style="
          background: linear-gradient(135deg, var(--c-surface) 0%, rgba(0,217,255,0.04) 100%);
          border: 1px solid rgba(0,217,255,0.15);
          border-radius: 24px;
          padding: 40px;
          position: relative; overflow: hidden;
        ">
          <div style="
            position: absolute; top: -40px; right: -40px;
            width: 160px; height: 160px;
            background: radial-gradient(circle, rgba(0,217,255,0.1) 0%, transparent 70%);
            border-radius: 50%;
          "></div>
          <div class="terminal-label" style="margin-bottom: 16px;">for_attendees()</div>
          <h3 style="
            font-family: 'Outfit', sans-serif;
            font-size: 26px; font-weight: 800;
            color: var(--c-text); margin-bottom: 12px;
            letter-spacing: -0.02em;
          ">参加者として登録</h3>
          <p style="color: var(--c-text-2); font-size: 14px; line-height: 1.7; margin-bottom: 28px;">
            気になるイベントを即座に予約。QRチケットで快適入場。
          </p>
          <button onclick="AppUI.openRegisterModal()"
            class="btn-primary ripple"
            style="padding: 12px 28px; font-size: 14px; font-weight: 700;">
            無料で始める →
          </button>
        </div>

        <!-- 主催者向け -->
        <div style="
          background: linear-gradient(135deg, var(--c-surface) 0%, rgba(155,89,255,0.04) 100%);
          border: 1px solid rgba(155,89,255,0.2);
          border-radius: 24px;
          padding: 40px;
          position: relative; overflow: hidden;
        ">
          <div style="
            position: absolute; top: -40px; right: -40px;
            width: 160px; height: 160px;
            background: radial-gradient(circle, rgba(155,89,255,0.1) 0%, transparent 70%);
            border-radius: 50%;
          "></div>
          <div style="
            display: inline-block; padding: 4px 12px;
            background: rgba(155,89,255,0.1);
            border: 1px solid rgba(155,89,255,0.25);
            border-radius: 99px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 10px; color: var(--violet);
            letter-spacing: 0.08em; text-transform: uppercase;
            margin-bottom: 16px;
          ">// for_organizers()</div>
          <h3 style="
            font-family: 'Outfit', sans-serif;
            font-size: 26px; font-weight: 800;
            color: var(--c-text); margin-bottom: 12px;
            letter-spacing: -0.02em;
          ">主催者として出展</h3>
          <p style="color: var(--c-text-2); font-size: 14px; line-height: 1.7; margin-bottom: 28px;">
            イベントを作成し、チケット販売・QRチェックインを即日開始。
          </p>
          <button onclick="AppUI.openRegisterModal()"
            style="
              padding: 12px 28px; font-size: 14px; font-weight: 700;
              background: rgba(155,89,255,0.12);
              color: var(--violet);
              border: 1px solid rgba(155,89,255,0.3);
              border-radius: 12px; cursor: pointer;
              font-family: 'Outfit', sans-serif;
              transition: all 0.2s;
            "
            onmouseover="this.style.background='rgba(155,89,255,0.2)'; this.style.boxShadow='0 0 20px rgba(155,89,255,0.2)';"
            onmouseout="this.style.background='rgba(155,89,255,0.12)'; this.style.boxShadow='none';">
            主催者登録 →
          </button>
        </div>

        <style>
          @media (max-width: 640px) {
            .cta-grid { grid-template-columns: 1fr !important; }
          }
        </style>
      </section>

      <!-- ═══ フッター ═══ -->
      <footer style="
        background: var(--c-canvas);
        border-top: 1px solid var(--c-border);
        padding: 48px 24px 32px;
      ">
        <div style="max-width: 1200px; margin: 0 auto;">
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 24px; margin-bottom: 32px;">
            <button onclick="AppRouter.go('home')" style="display: flex; align-items: center; gap: 10px; cursor: pointer; background: none; border: none;">
              <div style="
                width: 36px; height: 36px;
                background: linear-gradient(135deg, var(--accent), #0077BB);
                border-radius: 10px;
                display: flex; align-items: center; justify-content: center;
                box-shadow: 0 0 12px rgba(0,217,255,0.3);
              ">
                <span class="material-icons-outlined" style="color: #05080F; font-size: 18px;">link</span>
              </div>
              <span style="
                font-family: 'Outfit', sans-serif;
                font-size: 20px; font-weight: 800;
                background: linear-gradient(135deg, var(--accent), #FFFFFF);
                -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                background-clip: text;
              ">LinkUp</span>
            </button>
            <p style="font-size: 13px; color: var(--c-dim);">人と体験をつなぐイベントプラットフォーム</p>
          </div>
          <div style="
            border-top: 1px solid var(--c-border);
            padding-top: 24px;
            display: flex; justify-content: space-between; align-items: center;
            flex-wrap: wrap; gap: 12px;
          ">
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--c-muted);">© 2026 LinkUp, Inc.</span>
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--c-muted);">build: v3.0.0 · CF Workers</span>
          </div>
        </div>
      </footer>

    </div>
  `;

  // イベントデータ取得・描画
  await _loadEvents(searchQuery);
}

// ─── イベント取得 ─────────────────────────────────────────────────
async function _loadEvents(query) {
  const grid = document.getElementById('events-grid');
  if (!grid) return;

  try {
    const params = { limit: 12 };
    if (query) params.search = query;
    const data = await window.LinkUpAPI.Events.list(params);
    const events = data.events || [];

    if (events.length === 0) {
      grid.innerHTML = `
        <div style="
          grid-column: 1 / -1; text-align: center; padding: 80px 20px;
          border: 1px dashed var(--c-border); border-radius: 20px;
        ">
          <span class="material-icons-outlined" style="font-size: 56px; color: var(--c-muted); display: block; margin-bottom: 16px;">search_off</span>
          <p style="font-family: 'Outfit', sans-serif; font-size: 18px; font-weight: 700; color: var(--c-text-2); margin-bottom: 8px;">
            ${query ? `"${_escapeHtml(query)}" に一致するイベントが見つかりません` : 'イベントが見つかりません'}
          </p>
          <p style="font-size: 14px; color: var(--c-dim);">検索ワードを変えてお試しください</p>
          ${query ? `<button onclick="AppRouter.go('home')" style="
            margin-top: 20px; padding: 10px 24px;
            background: var(--accent-dim); color: var(--accent);
            border: 1px solid rgba(0,217,255,0.2); border-radius: 12px;
            font-weight: 600; cursor: pointer;
          ">すべてのイベントを表示</button>` : ''}
        </div>
      `;
      return;
    }

    grid.innerHTML = events.map((ev, i) => _renderEventCard(ev, i)).join('');

  } catch (err) {
    grid.innerHTML = `
      <div style="
        grid-column: 1 / -1; text-align: center; padding: 60px 20px;
        border: 1px solid rgba(255,51,102,0.2); border-radius: 20px;
        background: rgba(255,51,102,0.04);
      ">
        <span class="material-icons-outlined" style="font-size: 48px; color: var(--hot); display: block; margin-bottom: 12px;">error_outline</span>
        <p style="color: var(--c-text-2); font-size: 14px;">${_escapeHtml(err.message || 'イベント情報の取得に失敗しました')}</p>
        <button onclick="_loadEvents('')" style="
          margin-top: 16px; padding: 10px 24px;
          background: var(--hot-dim); color: var(--hot);
          border: 1px solid rgba(255,51,102,0.2); border-radius: 12px;
          font-weight: 600; cursor: pointer;
        ">再試行</button>
      </div>
    `;
  }
}

// ─── イベントカード ───────────────────────────────────────────────
function _renderEventCard(ev, index) {
  const catConfig = {
    tech:      { label: 'TECH',      color: 'var(--accent)',  bg: 'rgba(0,217,255,0.1)',  border: 'rgba(0,217,255,0.2)' },
    business:  { label: 'BIZ',       color: 'var(--violet)', bg: 'rgba(155,89,255,0.1)', border: 'rgba(155,89,255,0.2)' },
    music:     { label: 'MUSIC',     color: 'var(--hot)',    bg: 'rgba(255,51,102,0.1)', border: 'rgba(255,51,102,0.2)' },
    art:       { label: 'ART',       color: 'var(--amber)',  bg: 'rgba(255,170,0,0.1)',  border: 'rgba(255,170,0,0.2)' },
    food:      { label: 'FOOD',      color: 'var(--lime)',   bg: 'rgba(57,255,20,0.08)', border: 'rgba(57,255,20,0.2)' },
    sports:    { label: 'SPORTS',    color: '#00EAAA',       bg: 'rgba(0,234,170,0.1)',  border: 'rgba(0,234,170,0.2)' },
    social:    { label: 'COMMUNITY', color: '#0AFFEF',       bg: 'rgba(10,255,239,0.08)',border: 'rgba(10,255,239,0.2)' },
    education: { label: 'EDU',       color: '#7EB8FF',       bg: 'rgba(126,184,255,0.1)',border: 'rgba(126,184,255,0.2)' },
  };
  const cat = catConfig[ev.category] || { label: (ev.category || 'EVENT').toUpperCase(), color: 'var(--c-dim)', bg: 'rgba(107,126,170,0.1)', border: 'rgba(107,126,170,0.2)' };

  const img = ev.cover_image_url || `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=70`;

  const startDate = ev.start_datetime
    ? new Date(ev.start_datetime)
    : null;
  const dateStr = startDate
    ? startDate.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', weekday: 'short' })
    : '日時未定';
  const timeStr = startDate
    ? startDate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
    : '';

  const minPrice = ev.tickets && ev.tickets.length > 0
    ? Math.min(...ev.tickets.map(t => t.price || 0))
    : null;
  const priceStr = minPrice === null ? '—' : minPrice === 0 ? '無料' : `¥${Number(minPrice).toLocaleString()}〜`;
  const isFree = minPrice === 0;

  const stock = ev.tickets && ev.tickets.length > 0
    ? ev.tickets.reduce((s, t) => s + (t.quantity_available || 0), 0)
    : null;
  const isSoldOut = stock !== null && stock <= 0;
  const isLowStock = !isSoldOut && stock !== null && stock <= 10;

  return `
    <div class="event-card reveal"
      style="animation-delay: ${index * 0.06}s; cursor: pointer;"
      onclick="AppRouter.go('detail', {id: '${_escapeHtml(ev.event_id)}'})"
    >
      <!-- 画像 -->
      <div style="position: relative; height: 180px; overflow: hidden; background: var(--c-raised);">
        <img src="${_escapeHtml(img)}" alt="${_escapeHtml(ev.title)}"
          class="card-img"
          style="width: 100%; height: 100%; object-fit: cover; opacity: 0.85;"
          loading="lazy"
          onerror="this.src='https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=70'; this.style.opacity='0.4';">

        <!-- カテゴリバッジ -->
        <div style="position: absolute; top: 12px; left: 12px;">
          <span style="
            padding: 4px 10px; border-radius: 6px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 10px; font-weight: 700;
            letter-spacing: 0.08em;
            color: ${cat.color};
            background: ${cat.bg};
            border: 1px solid ${cat.border};
          ">${cat.label}</span>
        </div>

        <!-- 売り切れ/残わずか -->
        ${isSoldOut ? `
          <div style="
            position: absolute; inset: 0;
            background: rgba(5,8,15,0.7);
            display: flex; align-items: center; justify-content: center;
          ">
            <span style="
              font-family: 'Outfit', sans-serif;
              font-size: 18px; font-weight: 900;
              color: var(--hot); letter-spacing: 0.08em;
              text-transform: uppercase;
            ">SOLD OUT</span>
          </div>
        ` : isLowStock ? `
          <div style="position: absolute; top: 12px; right: 12px;">
            <span style="
              padding: 4px 10px; border-radius: 6px;
              font-family: 'JetBrains Mono', monospace;
              font-size: 10px; font-weight: 700;
              color: var(--amber);
              background: rgba(255,170,0,0.12);
              border: 1px solid rgba(255,170,0,0.25);
              animation: pulseNeon 2s ease-in-out infinite;
            ">残り${stock}枚</span>
          </div>
        ` : ''}
      </div>

      <!-- カードコンテンツ -->
      <div style="padding: 16px 20px 20px;">
        <!-- タイトル -->
        <h3 class="line-clamp-2" style="
          font-family: 'Outfit', sans-serif;
          font-size: 16px; font-weight: 700;
          color: var(--c-text);
          line-height: 1.4; margin-bottom: 10px;
          letter-spacing: -0.01em;
        ">${_escapeHtml(ev.title)}</h3>

        <!-- 日時・場所 -->
        <div style="margin-bottom: 14px; display: flex; flex-direction: column; gap: 6px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="material-icons-outlined" style="font-size: 14px; color: var(--c-dim);">calendar_today</span>
            <span style="font-size: 12px; color: var(--c-text-2); font-weight: 500;">${dateStr}${timeStr ? ` ${timeStr}` : ''}</span>
          </div>
          ${ev.venue_name ? `
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="material-icons-outlined" style="font-size: 14px; color: var(--c-dim);">${ev.is_online ? 'videocam' : 'location_on'}</span>
            <span class="line-clamp-1" style="font-size: 12px; color: var(--c-text-2);">${_escapeHtml(ev.venue_name)}</span>
          </div>` : ''}
        </div>

        <!-- フッター: 価格 + 主催者 -->
        <div style="
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 12px;
          border-top: 1px solid var(--c-border);
        ">
          <span style="
            font-family: 'Outfit', sans-serif;
            font-size: ${isFree ? '16px' : '18px'}; font-weight: 800;
            color: ${isFree ? 'var(--lime)' : 'var(--accent)'};
          ">${priceStr}</span>
          ${ev.organizer_name ? `
            <div style="display: flex; align-items: center; gap: 6px;">
              <div style="
                width: 22px; height: 22px; border-radius: 50%;
                background: var(--c-raised);
                border: 1px solid var(--c-border);
                display: flex; align-items: center; justify-content: center;
                flex-shrink: 0;
              ">
                <span class="material-icons-outlined" style="font-size: 12px; color: var(--c-dim);">person</span>
              </div>
              <span class="line-clamp-1" style="font-size: 11px; color: var(--c-dim); max-width: 120px;">${_escapeHtml(ev.organizer_name)}</span>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

// ─── 検索 ───────────────────────────────────────────────────────
function homeSearch(query) {
  const q = (query || '').trim();
  if (q) AppRouter.go('home', { search: q });
  else AppRouter.go('home');
}
