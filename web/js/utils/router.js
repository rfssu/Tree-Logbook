// Simple Router
const Router = {
    routes: {},
    currentRoute: null,

    // Register a route
    register(path, handler) {
        this.routes[path] = handler;
    },

    // Navigate to a route
    navigate(path) {
        if (this.routes[path]) {
            this.currentRoute = path;
            window.location.hash = path;
            this.routes[path]();
        } else {
            console.error(`Route not found: ${path}`);
        }
    },

    // Initialize router
    init() {
        // Handle hash changes
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.slice(1) || '/';
            if (this.routes[hash]) {
                this.currentRoute = hash;
                this.routes[hash]();
            }
        });

        // Load initial route
        const initialHash = window.location.hash.slice(1) || '/';
        if (this.routes[initialHash]) {
            this.currentRoute = initialHash;
            this.routes[initialHash]();
        }
    },

    // Get current route
    getCurrentRoute() {
        return this.currentRoute;
    }
};
