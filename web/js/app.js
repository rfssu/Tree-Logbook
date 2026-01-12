// Main App
const App = {
    init() {
        console.log('🌳 Tree-ID App Initializing...');

        // Register routes
        this.registerRoutes();

        // Initialize router
        Router.init();

        // Check authentication on load
        this.checkAuth();
    },

    registerRoutes() {
        Router.register('/', () => {
            if (Auth.isAuthenticated()) {
                Router.navigate('/dashboard');
            } else {
                Router.navigate('/login');
            }
        });

        Router.register('/login', renderLogin);
        Router.register('/register', renderRegister);
        Router.register('/dashboard', this.requireAuth(renderDashboard));
        Router.register('/trees', this.requireAuth(renderTreeList));
        Router.register('/trees/new', this.requireAuth(renderTreeForm));
        Router.register('/users', this.requireAuth(renderUsersList));
    },

    // Middleware: require authentication
    requireAuth(handler) {
        return async () => {
            if (!Auth.isAuthenticated()) {
                Router.navigate('/login');
                return;
            }

            // Verify token is still valid
            const valid = await Auth.verifyToken();
            if (!valid) {
                showToast('Session expired. Please login again.', 'warning');
                Router.navigate('/login');
                return;
            }

            handler();
        };
    },

    async checkAuth() {
        if (Auth.isAuthenticated()) {
            await Auth.verifyToken();
        }
    }
};

// Global UI Helpers
function showLoading(show = true) {
    const loader = document.getElementById('loading');
    if (show) {
        loader.classList.remove('hidden');
    } else {
        loader.classList.add('hidden');
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');

    const bgColors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };

    toast.className = `toast ${bgColors[type]} text-white px-6 py-4 rounded-lg shadow-lg mb-4`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function render(html) {
    document.getElementById('main-content').innerHTML = html;
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
