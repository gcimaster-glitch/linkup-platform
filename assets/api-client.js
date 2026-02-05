// API Client for LinkUp - Complete Backend Integration
const API_BASE = 'https://linkup-backend.gcimaster.workers.dev/api';

// Auth Token Management
const getToken = () => localStorage.getItem('auth_token');
const setToken = (token) => localStorage.setItem('auth_token', token);
const clearToken = () => localStorage.removeItem('auth_token');

// API Helper
async function apiCall(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
    };

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API call failed:', endpoint, error);
        throw error;
    }
}

// Event APIs
const EventAPI = {
    list: async (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/events${query ? '?' + query : ''}`);
    },
    
    get: async (id) => apiCall(`/events/${id}`),
    
    create: async (data) => apiCall('/events', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    
    update: async (id, data) => apiCall(`/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    
    delete: async (id) => apiCall(`/events/${id}`, {
        method: 'DELETE'
    })
};

// Ticket APIs
const TicketAPI = {
    list: async (eventId) => apiCall(`/tickets/${eventId}`),
    
    getByOrder: async (orderId) => apiCall(`/order-tickets/${orderId}`)
};

// Order APIs
const OrderAPI = {
    create: async (data) => apiCall('/orders', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    
    list: async (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/orders${query ? '?' + query : ''}`);
    },
    
    get: async (id) => apiCall(`/orders/${id}`)
};

// Check-in APIs
const CheckinAPI = {
    generate: async (ticketId) => apiCall('/checkin/generate', {
        method: 'POST',
        body: JSON.stringify({ ticket_id: ticketId })
    }),
    
    scan: async (qrData, eventId) => apiCall('/checkin/scan', {
        method: 'POST',
        body: JSON.stringify({ qr_data: qrData, event_id: eventId })
    }),
    
    manual: async (eventId, participantId) => apiCall('/checkin/tap', {
        method: 'POST',
        body: JSON.stringify({ event_id: eventId, participant_id: participantId })
    }),
    
    stats: async (eventId) => apiCall(`/checkin/stats/${eventId}`),
    
    list: async (eventId) => apiCall(`/checkin/list/${eventId}`)
};

// Auth APIs
const AuthAPI = {
    login: async (email, password) => {
        const result = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        if (result.token) setToken(result.token);
        return result;
    },
    
    register: async (data) => {
        const result = await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        if (result.token) setToken(result.token);
        return result;
    },
    
    logout: () => {
        clearToken();
    }
};

// Export API client
window.API = {
    Event: EventAPI,
    Ticket: TicketAPI,
    Order: OrderAPI,
    Checkin: CheckinAPI,
    Auth: AuthAPI
};
