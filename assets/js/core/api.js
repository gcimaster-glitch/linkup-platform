/**
 * LinkUp Platform - API Client Module
 * Handles all backend API communications
 * 
 * Author: Professional Team
 * Date: 2026-02-21
 * Phase: 1 - Core Module Separation
 */

const API_URL = "https://linkup-backend.gcimaster.workers.dev";

// Helper function to get auth headers
function getAuthHeaders() {
    const token = localStorage.getItem('linkup_token'); // 統一されたトークンキー
    console.log('🔑 Getting auth token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

const API = {
    Event: {
        async list() {
            const response = await fetch(`${API_URL}/api/events`);
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            return await response.json();
        },
        async get(id) {
            const response = await fetch(`${API_URL}/api/events/${id}`);
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            return await response.json();
        },
        async create(event) {
            const token = localStorage.getItem('linkup_token');
            console.log('🔐 Token check:', token ? `Present (${token.substring(0, 20)}...)` : 'MISSING');
            
            if (!token) {
                console.error('❌ No auth token found. Please login first.');
                throw new Error('ログインが必要です。ログインしてからもう一度お試しください。');
            }
            
            const response = await fetch(`${API_URL}/api/events`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(event)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                console.error('❌ API Error:', data);
                console.error('❌ Response status:', response.status);
                console.error('❌ Response headers:', [...response.headers.entries()]);
                
                // 401エラーの場合は特別なメッセージ
                if (response.status === 401) {
                    throw new Error('認証エラー: ログインセッションが切れています。再度ログインしてください。');
                }
                
                throw new Error(data.error || 'イベント作成に失敗しました');
            }
            
            return data;
        },
        async update(id, updates) {
            const response = await fetch(`${API_URL}/api/events/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(updates)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                console.error('❌ API Error:', data);
                throw new Error(data.error || 'イベント更新に失敗しました');
            }
            
            return data;
        },
        async delete(id) {
            const response = await fetch(`${API_URL}/api/events/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                console.error('❌ API Error:', data);
                throw new Error(data.error || 'イベント削除に失敗しました');
            }
            
            return data;
        }
    },
    Auth: {
        async login(email, password) {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            
            // Handle error responses
            if (!response.ok) {
                return {
                    success: false,
                    error: data.error || 'ログインに失敗しました'
                };
            }
            
            return data;
        },
        async register(name, email, password, role = 'attendee') {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role })
            });
            return await response.json();
        },
        async me() {
            const response = await fetch(`${API_URL}/api/auth/me`, {
                headers: getAuthHeaders()
            });
            if (!response.ok) {
                throw new Error(`Auth check failed: ${response.status}`);
            }
            return await response.json();
        },
        async logout() {
            try {
                const response = await fetch(`${API_URL}/api/auth/logout`, {
                    method: 'POST',
                    headers: getAuthHeaders()
                });
                return await response.json();
            } catch (e) {
                // ログアウトAPIエラーは無視
                return { success: true };
            }
        }
    },
    Organizer: {
        async getProfile() {
            const response = await fetch(`${API_URL}/api/organizer/settings`, {
                headers: getAuthHeaders()
            });
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            return await response.json();
        },
        async updateProfile(profileData) {
            const response = await fetch(`${API_URL}/api/organizer/settings`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(profileData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                console.error('❌ API Error:', data);
                throw new Error(data.error || 'プロフィール更新に失敗しました');
            }
            
            return data;
        },
        async uploadImage(file) {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch(`${API_URL}/api/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('linkup_token')}`
                },
                body: formData
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                console.error('❌ Upload Error:', data);
                throw new Error(data.error || '画像アップロードに失敗しました');
            }
            
            return data;
        }
    },
    Admin: {
        // イベント管理
        async getEvents(filters = {}) {
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            
            const response = await fetch(`${API_URL}/api/admin/events?${params}`, {
                headers: getAuthHeaders()
            });
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            return await response.json();
        },
        async approveEvent(eventId) {
            const response = await fetch(`${API_URL}/api/admin/events/${eventId}/approve`, {
                method: 'PUT',
                headers: getAuthHeaders()
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                console.error('❌ Approve Error:', data);
                throw new Error(data.error || 'イベント承認に失敗しました');
            }
            
            return data;
        },
        async rejectEvent(eventId, reason) {
            const response = await fetch(`${API_URL}/api/admin/events/${eventId}/reject`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ reason })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                console.error('❌ Reject Error:', data);
                throw new Error(data.error || 'イベント却下に失敗しました');
            }
            
            return data;
        },
        async deleteEvent(eventId) {
            const response = await fetch(`${API_URL}/api/admin/events/${eventId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                console.error('❌ Delete Error:', data);
                throw new Error(data.error || 'イベント削除に失敗しました');
            }
            
            return data;
        },
        
        // ユーザー管理
        async getUsers(filters = {}) {
            const params = new URLSearchParams();
            if (filters.role) params.append('role', filters.role);
            if (filters.kyc) params.append('kyc', filters.kyc);
            
            const response = await fetch(`${API_URL}/api/admin/users?${params}`, {
                headers: getAuthHeaders()
            });
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            return await response.json();
        },
        async getUser(userId) {
            const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
                headers: getAuthHeaders()
            });
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            return await response.json();
        },
        async updateUser(userId, userData) {
            const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                console.error('❌ Update Error:', data);
                throw new Error(data.error || 'ユーザー更新に失敗しました');
            }
            
            return data;
        },
        async verifyKYC(userId, status) {
            const response = await fetch(`${API_URL}/api/admin/users/${userId}/kyc`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ status })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                console.error('❌ KYC Error:', data);
                throw new Error(data.error || 'KYC更新に失敗しました');
            }
            
            return data;
        },
        
        // 統計情報
        async getStats() {
            const response = await fetch(`${API_URL}/api/admin/stats`, {
                headers: getAuthHeaders()
            });
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            return await response.json();
        }
    },
    User: {
        async getInterests() {
            const response = await fetch(`${API_URL}/api/users/interests`, {
                headers: getAuthHeaders()
            });
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            return await response.json();
        },
        async addInterest(tag) {
            const response = await fetch(`${API_URL}/api/users/interests`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ tag })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                console.error('❌ Add interest error:', data);
                throw new Error(data.error || 'タグの追加に失敗しました');
            }
            
            return data;
        },
        async removeInterest(tag) {
            const response = await fetch(`${API_URL}/api/users/interests/${encodeURIComponent(tag)}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                console.error('❌ Remove interest error:', data);
                throw new Error(data.error || 'タグの削除に失敗しました');
            }
            
            return data;
        },
        async getOrders() {
            const response = await fetch(`${API_URL}/api/orders`, {
                headers: getAuthHeaders()
            });
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            const data = await response.json();
            return data.orders || [];
        },
        async getFavorites() {
            const response = await fetch(`${API_URL}/api/users/favorites`, {
                headers: getAuthHeaders()
            });
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            const data = await response.json();
            return data.favorites || [];
        },
        async addFavorite(eventId) {
            const response = await fetch(`${API_URL}/api/users/favorites/${eventId}`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                console.error('❌ Add favorite error:', data);
                throw new Error(data.error || 'お気に入り追加に失敗しました');
            }
            
            return data;
        },
        async removeFavorite(eventId) {
            const response = await fetch(`${API_URL}/api/users/favorites/${eventId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                console.error('❌ Remove favorite error:', data);
                throw new Error(data.error || 'お気に入り削除に失敗しました');
            }
            
            return data;
        },
        async checkFavorite(eventId) {
            const response = await fetch(`${API_URL}/api/users/favorites/${eventId}/check`, {
                headers: getAuthHeaders()
            });
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            const data = await response.json();
            return data.isFavorite || false;
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API, API_URL, getAuthHeaders };
}
