/**
 * LinkUp API クライアント
 *
 * ルール：
 * 1. フォールバック・ダミーデータ・localStorageキャッシュ 禁止
 * 2. APIが失敗したら例外を投げる（呼び出し側でエラー表示）
 * 3. 認証トークンは localStorage の 'linkup_token' のみ
 */

const API_BASE = 'https://linkup-backend.gcimaster.workers.dev';

// ─────────────────────────────────────────
// 内部ヘルパー
// ─────────────────────────────────────────

function _getToken() {
  return localStorage.getItem('linkup_token');
}

function _headers(auth = false) {
  const h = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = _getToken();
    if (token) h['Authorization'] = `Bearer ${token}`;
  }
  return h;
}

async function _request(method, path, body = null, auth = false) {
  const options = {
    method,
    headers: _headers(auth),
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(API_BASE + path, options);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // サーバーからのエラーメッセージをそのまま投げる
    throw new Error(data.error || `サーバーエラー (${res.status})`);
  }
  return data;
}

// ─────────────────────────────────────────
// Auth API
// ─────────────────────────────────────────

const Auth = {
  // ログイン → { success, token, user }
  login: (email, password) =>
    _request('POST', '/api/auth/login', { email, password }),

  // 新規登録 → { success, token?, user, email_verification_required }
  register: (email, password, name, role = 'attendee') =>
    _request('POST', '/api/auth/register', { email, password, name, role }),

  // 現在のユーザー情報取得（要認証）→ { success, user }
  me: () =>
    _request('GET', '/api/auth/me', null, true),

  // プロフィール更新（要認証）→ { success, user }
  updateProfile: (fields) =>
    _request('PUT', '/api/auth/profile', fields, true),
};

// ─────────────────────────────────────────
// Events API
// ─────────────────────────────────────────

const Events = {
  // イベント一覧 → { success, events: [...] }
  list: (params = {}) => {
    const q = new URLSearchParams();
    if (params.search) q.set('search', params.search);
    if (params.limit)  q.set('limit',  params.limit);
    const qs = q.toString() ? '?' + q.toString() : '';
    return _request('GET', `/api/events${qs}`);
  },

  // イベント詳細 → { success, event: { ...event, tickets: [...] } }
  get: (id) =>
    _request('GET', `/api/events/${id}`),
};

// ─────────────────────────────────────────
// Orders API（チケット購入・履歴）
// ─────────────────────────────────────────

const Orders = {
  // 購入履歴一覧（要認証）→ { success, orders: [...] }
  list: () =>
    _request('GET', '/api/orders', null, true),

  // チケット購入（要認証）→ { success, order: {...} }
  create: (ticketId, quantity, eventId, promoCode = null) =>
    _request('POST', '/api/orders', {
      ticket_id: ticketId,
      quantity,
      event_id: eventId,
      ...(promoCode ? { promo_code: promoCode } : {}),
    }, true),
};

// ─────────────────────────────────────────
// Users API（興味・お気に入り）
// ─────────────────────────────────────────

const Users = {
  // 興味タグ一覧（要認証）→ { success, tags: [...] }
  getInterests: () =>
    _request('GET', '/api/users/interests', null, true),

  // 興味タグ追加（要認証）
  addInterest: (tag) =>
    _request('POST', '/api/users/interests', { tag }, true),

  // 興味タグ削除（要認証）
  removeInterest: (tag) =>
    _request('DELETE', `/api/users/interests/${encodeURIComponent(tag)}`, null, true),

  // お気に入りイベント一覧（要認証）→ { success, favorites: [...] }
  getFavorites: () =>
    _request('GET', '/api/users/favorites', null, true),

  // お気に入り追加（要認証）
  addFavorite: (eventId) =>
    _request('POST', `/api/users/favorites/${eventId}`, null, true),

  // お気に入り削除（要認証）
  removeFavorite: (eventId) =>
    _request('DELETE', `/api/users/favorites/${eventId}`, null, true),

  // お気に入り状態確認（要認証）→ { success, isFavorite }
  checkFavorite: (eventId) =>
    _request('GET', `/api/users/favorites/${eventId}/check`, null, true),
};

// ─────────────────────────────────────────
// グローバル公開
// ─────────────────────────────────────────

window.LinkUpAPI = { Auth, Events, Orders, Users, _request };
