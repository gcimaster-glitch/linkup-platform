/**
 * LinkUp Authentication Module
 * 認証・ログイン・ログアウト管理
 */

import { store } from './store.js';
import { API } from './api.js';

export class Auth {
    /**
     * トークン取得
     */
    static getToken() {
        return localStorage.getItem('linkup_token');
    }
    
    /**
     * ログイン状態チェック
     */
    static isAuthenticated() {
        const token = this.getToken();
        return !!token && !!store.user;
    }
    
    /**
     * ログイン処理
     */
    static async handleLogin(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const email = formData.get('email');
        const password = formData.get('password');
        
        // フォームボタンを無効化（二重送信防止）
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="inline-block animate-spin mr-2">⏳</span> ログイン中...';
        
        try {
            console.log('🔐 Login attempt:', email);
            
            // タイムアウト付きログインAPI呼び出し
            const loginPromise = API.Auth.login(email, password);
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('ログインがタイムアウトしました。もう一度お試しください。')), 10000)
            );
            
            const result = await Promise.race([loginPromise, timeoutPromise]);
            
            console.log('🔐 Login result:', result);
            
            // ログイン成功チェック
            if (result && result.success && result.token) {
                console.log('✅ Login successful');
                
                // トークン保存
                localStorage.setItem('linkup_token', result.token);
                
                // ストア更新
                store.user = {
                    id: result.user.user_id || result.user.id,
                    name: result.user.display_name || result.user.name,
                    email: result.user.email,
                    icon: result.user.icon_url || result.user.icon || `https://ui-avatars.com/api/?name=${encodeURIComponent(result.user.display_name || result.user.name)}`,
                    kycStatus: result.user.kyc_status || result.user.kycStatus || 'none',
                    role: result.user.role || 'user'
                };
                
                console.log('👤 User stored:', store.user);
                
                // ボタンを成功表示に
                submitBtn.innerHTML = '<span class="inline-block">✅</span> 成功！';
                
                // ナビゲーション更新
                if (typeof window.updateNav === 'function') {
                    window.updateNav();
                }
                
                // モーダルを閉じて成功メッセージ表示
                setTimeout(() => {
                    if (typeof window.closeModal === 'function') {
                        window.closeModal();
                    }
                    if (typeof window.showToast === 'function') {
                        window.showToast(`ようこそ、${store.user.name}さん！`, 'check_circle');
                    }
                    
                    // ロールに応じてリダイレクト
                    setTimeout(() => {
                        if (store.user.role === 'admin') {
                            console.log('📊 Routing to admin dashboard');
                            window.router.navigate('admin');
                        } else if (store.user.role === 'organizer') {
                            console.log('📊 Routing to organizer dashboard');
                            window.router.navigate('organizer');
                        } else {
                            console.log('📊 Routing to user dashboard');
                            window.router.navigate('dashboard');
                        }
                    }, 300);
                }, 500);
            } else {
                // ログイン失敗
                console.error('❌ Login failed:', result);
                const errorMsg = result?.error || 'ログインに失敗しました。メールアドレスとパスワードをご確認ください。';
                if (typeof window.showToast === 'function') {
                    window.showToast(errorMsg, 'error');
                }
                
                // ボタンを再有効化
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            const errorMessage = error.message || 'ログインに失敗しました。ネットワーク接続をご確認ください。';
            if (typeof window.showToast === 'function') {
                window.showToast(errorMessage, 'error');
            }
            
            // ボタンを再有効化
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
    
    /**
     * 新規登録処理
     */
    static async handleRegister(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');
        const role = formData.get('role');
        
        try {
            if (typeof window.showToast === 'function') {
                window.showToast('登録中...', 'info');
            }
            
            const result = await API.Auth.register(name, email, password, role);
            
            if (result.success) {
                // メール確認が必要かチェック
                if (result.email_verification_required) {
                    if (typeof window.closeModal === 'function') {
                        window.closeModal();
                    }
                    this.showEmailVerificationModal(result.user.email);
                    if (typeof window.showToast === 'function') {
                        window.showToast('確認メールを送信しました。メールを確認してください。', 'mail');
                    }
                } else {
                    // 旧フロー：即座にログイン
                    localStorage.setItem('linkup_token', result.token);
                    store.user = {
                        id: result.user.id,
                        name: result.user.name,
                        email: result.user.email,
                        icon: result.user.icon || `https://ui-avatars.com/api/?name=${encodeURIComponent(result.user.name)}`,
                        kycStatus: result.user.kycStatus || 'none',
                        role: result.user.role || role
                    };
                    
                    if (typeof window.closeModal === 'function') {
                        window.closeModal();
                    }
                    if (typeof window.updateNav === 'function') {
                        window.updateNav();
                    }
                    if (typeof window.showToast === 'function') {
                        window.showToast('登録が完了しました', 'check_circle');
                    }
                }
            } else {
                if (typeof window.showToast === 'function') {
                    window.showToast(result.error || '登録に失敗しました', 'error');
                }
            }
        } catch (error) {
            console.error('Register error:', error);
            if (typeof window.showToast === 'function') {
                window.showToast('登録に失敗しました', 'error');
            }
        }
    }
    
    /**
     * メール確認モーダル表示
     */
    static showEmailVerificationModal(email) {
        const modal = document.getElementById('modal-content');
        const container = document.getElementById('modal-container');
        
        if (!modal || !container) {
            console.error('Modal elements not found');
            return;
        }
        
        container.classList.remove('hidden');
        
        modal.innerHTML = `
            <div class="p-8 text-center max-w-md">
                <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span class="material-icons-outlined text-blue-600 text-5xl">mail</span>
                </div>
                <h3 class="text-2xl font-bold text-slate-800 mb-4">メールを確認してください</h3>
                <p class="text-slate-600 mb-2">
                    <strong>${email}</strong> に確認メールを送信しました。
                </p>
                <p class="text-sm text-slate-500 mb-6">
                    メール内のリンクをクリックして、アカウントを有効化してください。<br>
                    メールが届かない場合は、迷惑メールフォルダをご確認ください。
                </p>
                
                <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-left">
                    <div class="flex items-start">
                        <span class="material-icons-outlined text-blue-500 mr-2 mt-0.5">info</span>
                        <div class="text-sm text-blue-700">
                            <p class="font-bold mb-1">確認リンクの有効期限</p>
                            <p>メール内のリンクは24時間有効です。</p>
                        </div>
                    </div>
                </div>
                
                <button onclick="closeModal(); showToast('メールを再送信しました（デモ）', 'mail')" class="w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition mb-3">
                    <span class="material-icons-outlined text-sm align-middle mr-1">refresh</span>
                    確認メールを再送信
                </button>
                
                <button onclick="closeModal()" class="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-blue-700 transition">
                    閉じる
                </button>
            </div>
        `;
    }
    
    /**
     * ソーシャルログイン（モック）
     */
    static socialLogin(provider) {
        // Mock Login (デモ用)
        store.user = { 
            id: 'u-demo-001', 
            name: 'LinkUp User', 
            email: 'user@example.com',
            icon: `https://ui-avatars.com/api/?name=LinkUp+User&background=2563EB&color=fff`,
            kycStatus: 'unverified'
        };
        
        if (typeof window.closeModal === 'function') {
            window.closeModal();
        }
        if (typeof window.updateNav === 'function') {
            window.updateNav();
        }
        if (typeof window.showToast === 'function') {
            window.showToast('ログインしました', 'login');
        }
    }
    
    /**
     * ログアウト処理
     */
    static async logout() {
        try {
            // バックエンドにログアウト通知（オプション）
            const token = this.getToken();
            if (token) {
                try {
                    await fetch(`${window.API_URL}/api/auth/logout`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                } catch (e) {
                    // エラーは無視
                    console.log('Logout API call failed (non-critical):', e);
                }
            }
        } catch (e) {
            console.error('Logout error:', e);
        }
        
        // ローカルストレージをクリア
        localStorage.removeItem('linkup_token');
        localStorage.removeItem('refreshToken');
        
        // ストアをクリア
        store.user = null;
        store.events = [];
        store.tickets = [];
        store.organizerProfile = null;
        
        // UIを更新
        if (typeof window.updateNav === 'function') {
            window.updateNav();
        }
        
        // ホームにリダイレクト
        if (window.router) {
            window.router.navigate('home');
        }
        
        if (typeof window.showToast === 'function') {
            window.showToast('ログアウトしました', 'success');
        }
    }
    
    /**
     * 認証必須チェック（ミドルウェア）
     */
    static requireAuth() {
        if (!this.isAuthenticated()) {
            if (typeof window.openAuthModal === 'function') {
                window.openAuthModal();
            }
            if (typeof window.showToast === 'function') {
                window.showToast('ログインが必要です', 'warning');
            }
            return false;
        }
        return true;
    }
    
    /**
     * ロールチェック
     */
    static hasRole(role) {
        if (!this.isAuthenticated()) return false;
        return store.user.role === role;
    }
    
    /**
     * 管理者チェック
     */
    static isAdmin() {
        return this.hasRole('admin');
    }
    
    /**
     * 主催者チェック
     */
    static isOrganizer() {
        return this.hasRole('organizer') || this.isAdmin();
    }
}

// グローバルに公開（後方互換性）
window.Auth = Auth;

// 既存の関数名でもアクセス可能に
window.handleLogin = Auth.handleLogin.bind(Auth);
window.handleRegister = Auth.handleRegister.bind(Auth);
window.login = Auth.socialLogin.bind(Auth);
window.logout = Auth.logout.bind(Auth);
