// Main App
const App = {
    init() {
        console.log('🌳 Tree-ID App Initializing...');

        try {
            // Register routes
            this.registerRoutes();
            console.log('✅ Routes registered');

            // Initialize router
            Router.init();
            console.log('✅ Router initialized');

            // Check authentication on load
            this.checkAuth();
        } catch (error) {
            console.error('❌ App Init Error:', error);
            document.body.innerHTML = `<div style="color:red; padding:20px;">App Error: ${error.message}</div>`;
        }
    },

    registerRoutes() {
        // Public Routes
        Router.register('/', renderLandingPage); // Landing/Scanner Page
        Router.register('/login', renderLogin);
        Router.register('/register', renderRegister);

        // Protected Routes (IMPORTANT: Register specific routes BEFORE dynamic routes)
        Router.register('/dashboard', this.requireAuth(renderDashboard));
        Router.register('/trees', this.requireAuth(renderTreeList));
        Router.register('/trees/new', this.requireAuth(renderTreeForm)); // MUST be before /trees/:code
        Router.register('/trees/:code/edit', this.requireAuth(renderTreeForm)); // MUST be before /trees/:code
        Router.register('/users', this.requireAuth(renderUsersList));

        // Public Tree View (Dynamic route - MUST be registered LAST)
        Router.register('/trees/:code', renderTreeDetail);
    },

    // Middleware: require authentication
    requireAuth(handler) {
        return async (params) => {
            if (!Auth.isAuthenticated()) {
                // If trying to access protected route, save intended URL? 
                // For now just redirect to login
                Router.navigate('/login');
                return;
            }

            // Verify token is still valid (lightweight check if needed, or rely on API 401)
            // const valid = await Auth.verifyToken();
            // if (!valid) {
            //     showToast('Session expired.', 'warning');
            //     Router.navigate('/login');
            //     return;
            // }

            handler(params);
        };
    },

    async checkAuth() {
        // We don't force redirect on load anymore, unless on a protected route.
        // The Router will handle the check via requireAuth wrapper.
        if (Auth.isAuthenticated()) {
            await Auth.verifyToken(); // Refresh/verify silently
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
