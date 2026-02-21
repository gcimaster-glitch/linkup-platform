/**
 * LinkUp Application Entry Point
 * すべてのモジュールを統合し、アプリケーションを初期化
 */

// コアモジュールをインポート
import { router } from './core/router.js';
import { Auth } from './core/auth.js';
import { store } from './core/store.js';
import { API } from './core/api.js';

/**
 * アプリケーションの初期化
 */
async function initializeApp() {
    console.log('%c🚀 LinkUp Platform', 'color: #2563EB; font-size: 24px; font-weight: bold;');
    console.log('%cバージョン: 4.2.0-PHASE1-MODULAR', 'color: #10B981; font-size: 14px;');
    console.log('%c構築日時: 2026-02-21', 'color: #6B7280; font-size: 12px;');
    
    try {
        // 1. 認証状態の復元
        await restoreAuthState();
        
        // 2. イベントデータの読み込み
        await loadInitialData();
        
        // 3. ルーティングの初期化
        initializeRouting();
        
        // 4. UIイベントリスナーの設定
        setupEventListeners();
        
        // 5. パフォーマンス測定
        measurePerformance();
        
        console.log('✅ アプリケーションの初期化が完了しました');
    } catch (error) {
        console.error('❌ アプリケーションの初期化に失敗しました:', error);
        showInitializationError(error);
    }
}

/**
 * 認証状態の復元
 */
async function restoreAuthState() {
    const token = Auth.getToken();
    
    if (token && !store.user) {
        console.log('🔐 認証トークンが見つかりました。ユーザー情報を取得中...');
        try {
            const response = await API.Auth.me();
            if (response.success && response.user) {
                store.user = {
                    id: response.user.user_id || response.user.id,
                    name: response.user.display_name || response.user.name,
                    email: response.user.email,
                    icon: response.user.icon_url || response.user.icon,
                    kycStatus: response.user.kyc_status || response.user.kycStatus,
                    role: response.user.role
                };
                console.log('👤 ユーザー情報を復元しました:', store.user.name);
            }
        } catch (error) {
            console.warn('⚠️ ユーザー情報の取得に失敗しました。ローカルトークンをクリアします。');
            localStorage.removeItem('linkup_token');
            store.user = null;
        }
    }
}

/**
 * 初期データの読み込み
 */
async function loadInitialData() {
    console.log('📥 イベントデータを読み込み中...');
    try {
        await store.loadEvents();
        console.log(`✅ ${store.events.length}件のイベントを読み込みました`);
    } catch (error) {
        console.error('❌ イベントデータの読み込みに失敗しました:', error);
        // フォールバック: 空配列を設定
        store.events = [];
    }
}

/**
 * ルーティングの初期化
 */
function initializeRouting() {
    // URLから現在のビューを解析
    const { view, params } = router.parseURL();
    
    // ルートハンドラーを登録（既存の関数を使用）
    registerRouteHandlers();
    
    // 初期ビューをレンダリング
    router.navigate(view, params, false);
}

/**
 * ルートハンドラーの登録
 */
function registerRouteHandlers() {
    // 既存のレンダリング関数を使用（後で分離）
    router.register('home', window.renderHome || (() => console.warn('renderHome not found')));
    router.register('detail', window.renderDetail || (() => console.warn('renderDetail not found')));
    router.register('dashboard', window.renderDashboardPage || (() => console.warn('renderDashboardPage not found')));
    router.register('dashboard_tickets', (app) => window.renderDashboardPage(app, 'tickets'));
    router.register('dashboard_payments', (app) => window.renderDashboardPage(app, 'payments'));
    router.register('dashboard_profile', (app) => window.renderDashboardPage(app, 'profile'));
    router.register('dashboard_interests', (app) => window.renderDashboardPage(app, 'interests'));
    router.register('organizer', window.renderOrganizer || (() => console.warn('renderOrganizer not found')));
    router.register('organizer_event_edit', window.renderOrganizerEventEdit || (() => console.warn('renderOrganizerEventEdit not found')));
    router.register('organizer_profile', window.renderOrganizerProfile || (() => console.warn('renderOrganizerProfile not found')));
    router.register('admin', window.renderAdmin || (() => console.warn('renderAdmin not found')));
    router.register('category', window.renderCategoryPage || (() => console.warn('renderCategoryPage not found')));
    router.register('static', window.renderStaticPage || (() => console.warn('renderStaticPage not found')));
    router.register('verify_email', window.renderEmailVerification || (() => console.warn('renderEmailVerification not found')));
}

/**
 * イベントリスナーの設定
 */
function setupEventListeners() {
    // グローバルエラーハンドラー
    window.addEventListener('error', (event) => {
        console.error('🚨 グローバルエラー:', event.error);
        // エラーログを収集（デバッグ用）
        if (!window.linkupErrors) {
            window.linkupErrors = [];
        }
        window.linkupErrors.push({
            timestamp: new Date().toISOString(),
            message: event.error?.message || 'Unknown error',
            stack: event.error?.stack,
            filename: event.filename,
            lineno: event.lineno
        });
        // 最新50件のみ保持
        if (window.linkupErrors.length > 50) {
            window.linkupErrors = window.linkupErrors.slice(-50);
        }
    });
    
    // Promise rejection ハンドラー
    window.addEventListener('unhandledrejection', (event) => {
        console.error('🚨 未処理のPromise拒否:', event.reason);
        if (!window.linkupErrors) {
            window.linkupErrors = [];
        }
        window.linkupErrors.push({
            timestamp: new Date().toISOString(),
            type: 'unhandledRejection',
            message: event.reason?.message || String(event.reason),
            stack: event.reason?.stack
        });
        if (window.linkupErrors.length > 50) {
            window.linkupErrors = window.linkupErrors.slice(-50);
        }
    });
}

/**
 * パフォーマンス測定
 */
function measurePerformance() {
    if (window.performance && window.performance.timing) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = window.performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
                
                console.log('%c📊 パフォーマンス測定', 'color: #8B5CF6; font-weight: bold;');
                console.log(`  DOM準備完了: ${domReadyTime}ms`);
                console.log(`  ページ読み込み: ${pageLoadTime}ms`);
                
                // パフォーマンス判定
                if (pageLoadTime < 3000) {
                    console.log('%c  ⚡ 高速！', 'color: #10B981;');
                } else if (pageLoadTime < 5000) {
                    console.log('%c  ✅ 良好', 'color: #3B82F6;');
                } else {
                    console.log('%c  ⚠️ 改善の余地あり', 'color: #F59E0B;');
                }
            }, 0);
        });
    }
}

/**
 * 初期化エラー表示
 */
function showInitializationError(error) {
    const app = document.getElementById('app');
    if (app) {
        app.innerHTML = `
            <div class="min-h-screen flex items-center justify-center bg-slate-50 px-4">
                <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <span class="material-icons text-red-500 text-6xl mb-4">error</span>
                    <h2 class="text-2xl font-bold text-slate-800 mb-2">初期化エラー</h2>
                    <p class="text-slate-600 mb-6">アプリケーションの初期化中にエラーが発生しました。</p>
                    <p class="text-sm text-slate-500 mb-6">${error.message || '不明なエラー'}</p>
                    <button onclick="location.reload()" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                        再読み込み
                    </button>
                </div>
            </div>
        `;
    }
}

/**
 * デバッグモード切り替え
 */
window.toggleDebugMode = function() {
    window.linkupDebug = !window.linkupDebug;
    localStorage.setItem('linkupDebug', window.linkupDebug ? 'true' : 'false');
    console.log(`🐛 デバッグモード: ${window.linkupDebug ? 'ON' : 'OFF'}`);
    if (window.linkupDebug) {
        console.log('📊 最近のエラー:', window.linkupErrors || []);
        console.log('👤 現在のユーザー:', store.user);
        console.log('🎫 イベント数:', store.events.length);
    }
};

// デバッグモードの初期化
window.linkupDebug = localStorage.getItem('linkupDebug') === 'true';
if (!window.linkupErrors) {
    window.linkupErrors = [];
}

// DOMContentLoaded イベントでアプリケーションを初期化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // すでにDOMが読み込まれている場合は即座に実行
    initializeApp();
}

// エクスポート（他のモジュールから使用可能に）
export { initializeApp };
