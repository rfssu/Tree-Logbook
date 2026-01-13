// Simple Router with Dynamic Route Support
const Router = {
    routes: [], // Changed to array for regex matching
    currentRoute: null,
    params: {},

    // Register a route
    register(path, handler) {
        // Convert path to regex (e.g., /trees/:code -> /^\/trees\/([^/]+)$/)
        const keys = [];
        const regexPath = path.replace(/:([^/]+)/g, (_, key) => {
            keys.push(key);
            return '([^/]+)';
        });

        this.routes.push({
            path: path,
            regex: new RegExp(`^${regexPath}$`),
            keys: keys,
            handler: handler
        });
    },

    // Navigate to a route
    navigate(path) {
        window.location.hash = path;
    },

    // Handle routing logic
    resolve() {
        const fragment = window.location.hash.slice(1) || '/';

        for (const route of this.routes) {
            const match = fragment.match(route.regex);
            if (match) {
                this.currentRoute = route.path;

                // Extract params
                this.params = {};
                match.slice(1).forEach((value, index) => {
                    this.params[route.keys[index]] = decodeURIComponent(value);
                });

                console.log(`[Router] Navigating to ${route.path}`, this.params);
                route.handler(this.params);
                return;
            }
        }

        console.error(`[Router] Route not found: ${fragment}`);
        // Optional: Render 404
        document.getElementById('main-content').innerHTML = `
            <div class="h-screen flex items-center justify-center text-center">
                <div>
                    <h1 class="text-4xl font-bold text-gray-800 dark:text-white">404</h1>
                    <p class="text-gray-500">Page not found</p>
                    <button onclick="Router.navigate('/')" class="mt-4 px-4 py-2 bg-green-500 text-white rounded">Go Home</button>
                </div>
            </div>
        `;
    },

    // Initialize router
    init() {
        window.addEventListener('hashchange', () => this.resolve());
        this.resolve(); // Initial load
    },

    // Get current route
    getCurrentRoute() {
        return this.currentRoute;
    }
};
