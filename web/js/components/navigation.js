// Navigation Component - Persistent Top Nav with Breadcrumb
const Navigation = {
    // Render persistent navigation bar with active state
    renderNavbar(currentRoute = '', breadcrumbs = []) {
        const user = Storage.getUser();
        const isAdmin = Storage.isAdmin();
        const canCreate = Storage.isAdmin(); // Only admin can create

        return `
      <nav class="fixed w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 transition-colors duration-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <!-- Left: Logo + Navigation Links -->
            <div class="flex items-center gap-8">
              <!-- Logo -->
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                  <span class="text-lg">🌳</span>
                </div>
                <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-800 dark:from-white dark:to-slate-400">Tree-ID</h1>
              </div>

              <!-- Desktop Navigation Links -->
              <div class="hidden md:flex items-center space-x-6">
                ${this.renderNavLink('dashboard', 'Dashboard', currentRoute)}
                ${this.renderNavLink('trees', 'Trees', currentRoute)}
                ${isAdmin ? this.renderNavLink('users', 'Users', currentRoute) : ''}
              </div>
            </div>

            <!-- Right: Theme + User + Logout + Mobile Menu -->
            <div class="flex items-center space-x-2 sm:space-x-4">
              <!-- Theme Toggle -->
              <button onclick="ThemeManager.toggle()" class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all" title="Toggle theme">
                <span class="block dark:hidden">🌙</span>
                <span class="hidden dark:block">☀️</span>
              </button>
              
              <div class="hidden sm:block h-6 w-px bg-gray-200 dark:bg-slate-700"></div>

              <!-- User Info (hidden on mobile) -->
              <span class="hidden sm:block text-sm text-gray-600 dark:text-slate-400">
                Welcome, <strong class="text-gray-900 dark:text-white">${user?.username || 'User'}</strong>
              </span>
              
              <!-- Logout (hidden on mobile) -->
              <button onclick="Auth.logout()" class="hidden sm:block px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/5 rounded-lg transition-all duration-200">
                Logout
              </button>

              <!-- Mobile Menu Button -->
              <button onclick="Navigation.toggleMobileMenu()" class="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all" aria-label="Toggle menu">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile Menu Overlay -->
        <div id="mobile-menu" class="hidden md:hidden fixed inset-0 top-16 bg-black/50 backdrop-blur-sm z-40" onclick="Navigation.toggleMobileMenu()">
          <div class="bg-white dark:bg-slate-900 p-6 shadow-lg" onclick="event.stopPropagation()">
            <div class="flex flex-col space-y-4">
              ${this.renderMobileNavLink('dashboard', 'Dashboard', currentRoute)}
              ${this.renderMobileNavLink('trees', 'Trees', currentRoute)}
              ${isAdmin ? this.renderMobileNavLink('users', 'Users', currentRoute) : ''}
              
              <div class="border-t border-gray-200 dark:border-slate-700 pt-4 mt-4">
                <div class="text-sm text-gray-600 dark:text-slate-400 mb-4">
                  Logged in as <strong class="text-gray-900 dark:text-white">${user?.username || 'User'}</strong>
                </div>
                <button onclick="Auth.logout()" class="w-full px-4 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Breadcrumb (if provided) -->
        ${breadcrumbs.length > 0 ? this.renderBreadcrumb(breadcrumbs) : ''}
      </nav>
    `;
    },

    // Render individual nav link with active state
    renderNavLink(route, label, currentRoute) {
        const isActive = currentRoute === route;
        const baseClasses = 'px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200';
        const activeClasses = isActive
            ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-b-2 border-green-600 dark:border-green-400'
            : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800';

        return `
      <a href="#/${route}" class="${baseClasses} ${activeClasses}">
        ${label}
      </a>
    `;
    },

    // Render mobile nav link
    renderMobileNavLink(route, label, currentRoute) {
        const isActive = currentRoute === route;
        return `
      <a href="#/${route}" onclick="Navigation.toggleMobileMenu()" class="block px-4 py-3 rounded-lg text-base font-medium ${isActive ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'} transition-colors">
        ${label}
      </a>
    `;
    },

    // Toggle mobile menu visibility
    toggleMobileMenu() {
        const menu = document.getElementById('mobile-menu');
        if (menu) {
            menu.classList.toggle('hidden');
        }
    },

    // Render breadcrumb trail
    renderBreadcrumb(breadcrumbs) {
        return `
      <div class="border-t border-gray-100 dark:border-slate-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div class="flex items-center space-x-2 text-sm">
            ${breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return `
                ${crumb.url && !isLast
                    ? `<a href="${crumb.url}" class="text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors">${crumb.label}</a>`
                    : `<span class="${isLast ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-600 dark:text-slate-400'}">${crumb.label}</span>`
                }
                ${!isLast ? '<span class="text-gray-400 dark:text-slate-600">›</span>' : ''}
              `;
        }).join('')}
          </div>
        </div>
      </div>
    `;
    },

    // Preset breadcrumbs for common routes
    getBreadcrumbs(route, params = {}) {
        const breadcrumbMap = {
            'dashboard': [
                { label: 'Dashboard', url: null }
            ],
            'trees': [
                { label: 'Dashboard', url: '#/dashboard' },
                { label: 'Trees', url: null }
            ],
            'trees/new': [
                { label: 'Dashboard', url: '#/dashboard' },
                { label: 'Trees', url: '#/trees' },
                { label: 'New Tree', url: null }
            ],
            'trees/edit': [
                { label: 'Dashboard', url: '#/dashboard' },
                { label: 'Trees', url: '#/trees' },
                { label: `Edit ${params.code || 'Tree'}`, url: null }
            ],
            'users': [
                { label: 'Dashboard', url: '#/dashboard' },
                { label: 'Users', url: null }
            ]
        };

        return breadcrumbMap[route] || [];
    }
};
