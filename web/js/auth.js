// Authentication Helper
const Auth = {
    // Login
    async login(username, password) {
        try {
            showLoading(true);
            const response = await API.auth.login(username, password);

            if (response.success) {
                Storage.setToken(response.data.token);
                Storage.setUser(response.data.user);
                showToast('Login successful!', 'success');
                Router.navigate('/dashboard');
                return true;
            }

            return false;
        } catch (error) {
            showToast(error.message || 'Login failed', 'error');
            return false;
        } finally {
            showLoading(false);
        }
    },

    // Register
    async register(userData) {
        try {
            showLoading(true);
            const response = await API.auth.register(userData);

            if (response.success) {
                showToast('Registration successful! Please login.', 'success');
                Router.navigate('/login');
                return true;
            }

            return false;
        } catch (error) {
            showToast(error.message || 'Registration failed', 'error');
            return false;
        } finally {
            showLoading(false);
        }
    },

    // Logout
    logout() {
        Storage.removeToken();
        Storage.removeUser();
        showToast('Logged out successfully', 'info');
        Router.navigate('/login');
    },

    // Check if authenticated
    isAuthenticated() {
        return Storage.isAuthenticated();
    },

    // Verify token
    async verifyToken() {
        try {
            const response = await API.auth.me();
            if (response.success) {
                Storage.setUser(response.data);
                return true;
            }
            return false;
        } catch (error) {
            // Token invalid, clear storage
            Storage.removeToken();
            Storage.removeUser();
            return false;
        }
    },

    // Get current user
    getCurrentUser() {
        return Storage.getUser();
    },

    // Check permissions
    canEdit() {
        return Storage.canEdit();
    },

    canDelete() {
        return Storage.canDelete();
    },

    isAdmin() {
        return Storage.isAdmin();
    }
};
