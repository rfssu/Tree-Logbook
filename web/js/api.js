// API Client
const API = {
    baseURL: 'http://127.0.0.1:7000/api',

    // Get headers with auth token
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        };

        if (includeAuth) {
            const token = Storage.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    },

    // Generic request handler
    async request(endpoint, options = {}) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            const response = await fetch(url, {
                ...options,
                headers: this.getHeaders(options.auth !== false)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Auth endpoints
    auth: {
        login: (username, password) =>
            API.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ username, password }),
                auth: false
            }),

        register: (userData) =>
            API.request('/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData),
                auth: false
            }),

        me: () => API.request('/auth/me')
    },

    // Tree endpoints
    trees: {
        list: (params = {}) => {
            const queryString = new URLSearchParams(params).toString();
            return API.request(`/trees${queryString ? '?' + queryString : ''}`);
        },

        get: (code) => API.request(`/trees/${code}`),

        create: (treeData) =>
            API.request('/trees', {
                method: 'POST',
                body: JSON.stringify(treeData)
            }),

        updateStatus: (code, statusData) =>
            API.request(`/trees/${code}/status`, {
                method: 'PUT',
                body: JSON.stringify(statusData)
            }),

        delete: (code) =>
            API.request(`/trees/${code}`, {
                method: 'DELETE'
            }),

        history: (code) => API.request(`/trees/${code}/history`)
    },

    // Stats endpoint
    stats: {
        get: () => API.request('/stats')
    },

    // User endpoints
    users: {
        list: () => API.request('/users'),
        create: (data) => API.request('/users', { method: 'POST', body: JSON.stringify(data) }),
        delete: (id) => API.request(`/users/${id}`, { method: 'DELETE' }),
        updateRole: (id, role) => API.request(`/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) })
    }
};
