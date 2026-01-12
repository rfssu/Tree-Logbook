// LocalStorage Helper Functions
const Storage = {
  // Get item from localStorage
  get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },

  // Set item to localStorage
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  },

  // Remove item from localStorage
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  },

  // Clear all localStorage
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  },

  // Auth specific helpers
  getToken() {
    return this.get('token');
  },

  setToken(token) {
    return this.set('token', token);
  },

  removeToken() {
    return this.remove('token');
  },

  getUser() {
    return this.get('user');
  },

  setUser(user) {
    return this.set('user', user);
  },

  removeUser() {
    return this.remove('user');
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  },

  // Get user role
  getUserRole() {
    const user = this.getUser();
    return user ? user.role : null;
  },

  // Check if user has role
  hasRole(role) {
    return this.getUserRole() === role;
  },

  // Check if user is admin
  isAdmin() {
    return this.hasRole('admin');
  },

  // Check if user can edit
  canEdit() {
    const role = this.getUserRole();
    return role === 'admin' || role === 'editor';
  },

  // Check if user can create (admin only)
  canCreate() {
    return this.isAdmin();
  },

  // Check if user can delete
  canDelete() {
    return this.isAdmin();
  }
};
