/**
 * LinkUp Store Module
 * グローバル状態管理
 */

class Store {
    constructor() {
        this._cachedEvents = [];
        this._cachedUser = null;
        this._cachedTickets = [];
        this._organizerProfile = null;
        
        // プロフィールアイコン（20種類）
        this.profileIcons = [
            { id: 'avatar1', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', name: 'アバター 1' },
            { id: 'avatar2', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka', name: 'アバター 2' },
            { id: 'avatar3', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna', name: 'アバター 3' },
            { id: 'avatar4', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Max', name: 'アバター 4' },
            { id: 'avatar5', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bella', name: 'アバター 5' },
            { id: 'avatar6', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Felix', name: 'ロボット 1' },
            { id: 'avatar7', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Aneka', name: 'ロボット 2' },
            { id: 'avatar8', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Luna', name: 'ロボット 3' },
            { id: 'avatar9', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Felix', name: 'ピクセル 1' },
            { id: 'avatar10', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Aneka', name: 'ピクセル 2' },
            { id: 'avatar11', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix', name: 'キャラ 1' },
            { id: 'avatar12', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka', name: 'キャラ 2' },
            { id: 'avatar13', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Luna', name: 'キャラ 3' },
            { id: 'avatar14', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Max', name: 'キャラ 4' },
            { id: 'avatar15', url: 'https://api.dicebear.com/7.x/big-smile/svg?seed=Felix', name: 'スマイル 1' },
            { id: 'avatar16', url: 'https://api.dicebear.com/7.x/big-smile/svg?seed=Aneka', name: 'スマイル 2' },
            { id: 'avatar17', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Felix', name: 'ガール 1' },
            { id: 'avatar18', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Aneka', name: 'ガール 2' },
            { id: 'avatar19', url: 'https://api.dicebear.com/7.x/micah/svg?seed=Felix', name: 'シンプル 1' },
            { id: 'avatar20', url: 'https://api.dicebear.com/7.x/micah/svg?seed=Aneka', name: 'シンプル 2' }
        ];
        
        // カバー画像（10種類）
        this.coverImages = [
            { id: 'cover1', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=300&fit=crop', name: 'ミュージック' },
            { id: 'cover2', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&h=300&fit=crop', name: 'コンサート' },
            { id: 'cover3', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=300&fit=crop', name: 'イベント' },
            { id: 'cover4', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&h=300&fit=crop', name: 'ライブ' },
            { id: 'cover5', url: 'https://images.unsplash.com/photo-1485872299829-c673f5194813?w=1200&h=300&fit=crop', name: 'カラフル' },
            { id: 'cover6', url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&h=300&fit=crop', name: 'ネイチャー' },
            { id: 'cover7', url: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1200&h=300&fit=crop', name: 'パーティー' },
            { id: 'cover8', url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&h=300&fit=crop', name: 'アブストラクト' },
            { id: 'cover9', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=300&fit=crop', name: 'クラシック' },
            { id: 'cover10', url: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=1200&h=300&fit=crop', name: 'シティ' }
        ];
    }
    
    /**
     * ユーザー情報（getter/setter）
     */
    get user() {
        if (!this._cachedUser) {
            const stored = localStorage.getItem('user');
            if (stored) {
                try {
                    this._cachedUser = JSON.parse(stored);
                } catch (e) {
                    console.error('Failed to parse stored user:', e);
                    this._cachedUser = null;
                }
            }
        }
        return this._cachedUser;
    }
    
    set user(value) {
        this._cachedUser = value;
        if (value) {
            localStorage.setItem('user', JSON.stringify(value));
        } else {
            localStorage.removeItem('user');
        }
    }
    
    /**
     * イベント情報の読み込み
     */
    async loadEvents() {
        console.log('📥 Loading events from API...');
        try {
            // APIモジュールがまだ読み込まれていない場合の対策
            if (!window.API || !window.API.Event) {
                console.warn('⚠️ API module not loaded yet');
                return [];
            }
            
            const response = await window.API.Event.list();
            this._cachedEvents = response.events || [];
            console.log('✅ Loaded events from API:', this._cachedEvents.length);
            return this._cachedEvents;
        } catch (error) {
            console.error('❌ Failed to load events from API:', error);
            // フォールバックとして空配列を返す
            return [];
        }
    }
    
    /**
     * イベント情報（getter/setter）
     */
    get events() {
        return this._cachedEvents;
    }
    
    set events(value) {
        this._cachedEvents = value;
    }
    
    /**
     * チケット情報（getter/setter）
     */
    get tickets() {
        if (this._cachedTickets.length === 0) {
            const stored = localStorage.getItem('tickets');
            if (stored) {
                try {
                    this._cachedTickets = JSON.parse(stored);
                } catch (e) {
                    console.error('Failed to parse stored tickets:', e);
                    this._cachedTickets = [];
                }
            }
        }
        return this._cachedTickets;
    }
    
    set tickets(value) {
        this._cachedTickets = value;
        if (value) {
            localStorage.setItem('tickets', JSON.stringify(value));
        } else {
            localStorage.removeItem('tickets');
        }
    }
    
    /**
     * 主催者プロフィール（getter/setter）
     */
    get organizerProfile() {
        return this._organizerProfile;
    }
    
    set organizerProfile(value) {
        this._organizerProfile = value;
    }
    
    /**
     * ストアのクリア
     */
    clear() {
        this._cachedUser = null;
        this._cachedEvents = [];
        this._cachedTickets = [];
        this._organizerProfile = null;
        
        localStorage.removeItem('user');
        localStorage.removeItem('linkup_token');
        localStorage.removeItem('tickets');
    }
}

// シングルトンインスタンス作成
const store = new Store();

// グローバルに公開（後方互換性）
window.store = store;
