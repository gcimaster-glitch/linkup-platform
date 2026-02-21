/**
 * LinkUp Router Module
 * クライアントサイドルーティングを管理
 */

class Router {
    constructor() {
        this.routes = new Map();
        this.currentView = null;
        this.currentParams = {};
        
        // ブラウザの戻る/進むボタン対応
        window.addEventListener('popstate', (event) => {
            if (event.state) {
                this.navigate(event.state.view, event.state.params, false);
            } else {
                this.navigate('home', {}, false);
            }
        });
    }
    
    /**
     * ルートを登録
     */
    register(view, handler) {
        this.routes.set(view, handler);
    }
    
    /**
     * ルーティング実行
     */
    async navigate(view, params = {}, pushState = true) {
        const app = document.getElementById('app');
        window.scrollTo(0, 0);
        
        this.currentView = view;
        this.currentParams = params;
        
        // URL更新
        if (pushState && history.pushState) {
            const { url, title } = this.buildURL(view, params);
            history.pushState({ view, params }, title, url);
            document.title = title;
        }
        
        // ビューをレンダリング
        const handler = this.routes.get(view);
        if (handler) {
            try {
                await handler(app, params);
            } catch (error) {
                console.error(`❌ Router Error [${view}]:`, error);
                this.showError(app, error);
            }
        } else {
            console.warn(`⚠️ Route not found: ${view}`);
            this.navigate('home', {}, false);
        }
        
        // ナビゲーション更新
        this.updateNav();
    }
    
    /**
     * URL構築
     */
    buildURL(view, params) {
        let url = '/';
        let title = 'LinkUp';
        
        const routes = {
            'home': {
                url: '/',
                title: 'LinkUp - 日本最大級のイベントプラットフォーム'
            },
            'detail': {
                url: `/events/${params.id}`,
                title: params.eventTitle ? `${params.eventTitle} | LinkUp` : 'イベント詳細 | LinkUp'
            },
            'organizer_profile': {
                url: `/organizers/${encodeURIComponent(params.id)}`,
                title: `${params.id} | LinkUp`
            },
            'dashboard': {
                url: '/dashboard',
                title: 'ダッシュボード | LinkUp'
            },
            'dashboard_tickets': {
                url: '/dashboard/tickets',
                title: 'チケット管理 | LinkUp'
            },
            'dashboard_inbox': {
                url: '/dashboard/inbox',
                title: '受信箱 | LinkUp'
            },
            'dashboard_profile': {
                url: '/dashboard/profile',
                title: 'プロフィール | LinkUp'
            },
            'dashboard_interests': {
                url: '/dashboard/interests',
                title: '興味・関心 | LinkUp'
            },
            'dashboard_events': {
                url: '/dashboard/events',
                title: 'イベント管理 | LinkUp'
            },
            'dashboard_payments': {
                url: '/dashboard/payments',
                title: '決済履歴 | LinkUp'
            },
            'dashboard_support': {
                url: '/dashboard/support',
                title: 'サポート | LinkUp'
            },
            'dashboard_kyc': {
                url: '/dashboard/kyc',
                title: '本人確認 | LinkUp'
            },
            'organizer': {
                url: '/organizer/dashboard',
                title: '主催者ダッシュボード | LinkUp'
            },
            'organizer_event_edit': {
                url: `/organizer/events/${params.id || 'new'}`,
                title: params.id === 'new' ? '新規イベント作成 | LinkUp' : 'イベント編集 | LinkUp'
            },
            'admin': {
                url: '/admin',
                title: '管理者コンソール | LinkUp'
            },
            'static': {
                url: `/pages/${params.page}`,
                title: `${params.page} | LinkUp`
            },
            'category': {
                url: `/category/${params.category}`,
                title: `${params.category} イベント一覧 | LinkUp`
            },
            'verify_email': {
                url: `/verify-email?token=${params.token || ''}`,
                title: 'メール確認 | LinkUp'
            }
        };
        
        const route = routes[view];
        if (route) {
            url = route.url;
            title = route.title;
        }
        
        return { url, title };
    }
    
    /**
     * 現在のURLからビューを解析
     */
    parseURL() {
        const path = window.location.pathname;
        
        if (path === '/' || path === '/index.html') {
            return { view: 'home', params: {} };
        } else if (path.startsWith('/events/')) {
            const eventId = path.split('/events/')[1];
            return { view: 'detail', params: { id: eventId } };
        } else if (path.startsWith('/organizers/')) {
            const organizerId = decodeURIComponent(path.split('/organizers/')[1]);
            return { view: 'organizer_profile', params: { id: organizerId } };
        } else if (path === '/dashboard') {
            return { view: 'dashboard', params: {} };
        } else if (path.startsWith('/dashboard/')) {
            const subpage = path.split('/dashboard/')[1];
            const validSubpages = ['tickets', 'inbox', 'profile', 'interests', 'events', 'payments', 'support', 'kyc'];
            if (validSubpages.includes(subpage)) {
                return { view: `dashboard_${subpage}`, params: {} };
            }
            return { view: 'dashboard', params: {} };
        } else if (path.startsWith('/organizer')) {
            if (path.includes('/events/')) {
                const eventId = path.split('/events/')[1];
                return { view: 'organizer_event_edit', params: { id: eventId } };
            }
            return { view: 'organizer', params: {} };
        } else if (path === '/admin') {
            return { view: 'admin', params: {} };
        } else if (path.startsWith('/pages/')) {
            const page = path.split('/pages/')[1];
            return { view: 'static', params: { page } };
        } else if (path.startsWith('/category/')) {
            const category = path.split('/category/')[1];
            return { view: 'category', params: { category } };
        }
        
        return { view: 'home', params: {} };
    }
    
    /**
     * メタタグ更新（SEO対策）
     */
    updateMetaTags(title, description, image, url) {
        document.title = title + ' | LinkUp';
        
        // Update meta description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.content = description;
        
        // Update OGP tags
        let ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.content = title;
        
        let ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.content = description;
        
        let ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage) ogImage.content = image;
        
        let ogUrl = document.querySelector('meta[property="og:url"]');
        if (ogUrl) ogUrl.content = 'https://link-up.live' + url;
        
        // Update canonical
        let canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) canonical.href = 'https://link-up.live' + url;
    }
    
    /**
     * ナビゲーション状態更新
     */
    updateNav() {
        // 既存の updateNav 関数を呼び出し（後で分離）
        if (typeof window.updateNav === 'function') {
            window.updateNav();
        }
    }
    
    /**
     * エラー表示
     */
    showError(container, error) {
        container.innerHTML = `
            <div class="min-h-screen flex items-center justify-center bg-slate-50 px-4">
                <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <span class="material-icons text-red-500 text-6xl mb-4">error</span>
                    <h2 class="text-2xl font-bold text-slate-800 mb-2">エラーが発生しました</h2>
                    <p class="text-slate-600 mb-6">${error.message || '不明なエラー'}</p>
                    <button onclick="window.router.navigate('home')" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                        ホームに戻る
                    </button>
                </div>
            </div>
        `;
    }
}

// シングルトンインスタンス作成（app-legacy.js の function router() と衝突しないよう別名使用）
const moduleRouter = new Router();

// グローバルに公開（後方互換性）
window.moduleRouter = moduleRouter;
// ※ app-legacy.js が function router() を持つため、window.router は app-legacy.js 読み込み後に設定される
