function renderDashboard() {
  const breadcrumbs = Navigation.getBreadcrumbs('dashboard');

  const html = `
    <div class="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white font-sans transition-colors duration-300">
      ${Navigation.renderNavbar('dashboard', breadcrumbs)}

      <!-- Main Content -->
      <div class="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <!-- Hero Section -->
        <div class="relative mb-12 p-8 rounded-3xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/50 dark:to-emerald-900/50 border border-green-100 dark:border-white/10 overflow-hidden shadow-sm dark:shadow-none transition-all duration-300">
            <div class="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-green-200/50 dark:bg-green-500/20 rounded-full blur-3xl"></div>
            <div class="relative z-10">
                <h2 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">Dashboard Overview</h2>
                <p class="text-green-700 dark:text-emerald-400">Real-time monitoring of your plantation assets.</p>
            </div>
        </div>
        
        <!-- Stats Grid -->
        <h3 class="text-lg font-semibold text-gray-500 dark:text-slate-400 mb-6 uppercase tracking-wider text-xs">Plantation Status</h3>
        <div id="stats-cards" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <!-- Total Trees -->
          <div class="group relative p-6 bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-slate-700 hover:border-green-500 dark:hover:border-slate-600 transition-all duration-300 shadow-sm dark:shadow-none">
            <p class="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Total Trees</p>
            <div class="flex items-baseline gap-2">
                <span class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight" id="stat-total">-</span>
                <span class="text-xs text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-400/10 px-2 py-0.5 rounded-full">+12%</span>
            </div>
          </div>

          <!-- Healthy -->
          <div class="group relative p-6 bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-slate-700 hover:border-green-500/50 dark:hover:border-green-900/50 transition-all duration-300 shadow-sm dark:shadow-none">
            <p class="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Healthy</p>
             <div class="flex items-baseline gap-2">
                <span class="text-3xl font-bold text-green-600 dark:text-emerald-400 tracking-tight" id="stat-healthy">-</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-slate-700 mt-4 rounded-full h-1.5 overflow-hidden">
                <div class="bg-green-500 dark:bg-emerald-500 h-1.5 rounded-full" style="width: 80%"></div>
            </div>
          </div>

          <!-- Sick -->
          <div class="group relative p-6 bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-slate-700 hover:border-yellow-500/50 dark:hover:border-yellow-900/50 transition-all duration-300 shadow-sm dark:shadow-none">
            <p class="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Attention Needed</p>
             <div class="flex items-baseline gap-2">
                <span class="text-3xl font-bold text-yellow-600 dark:text-amber-400 tracking-tight" id="stat-sick">-</span>
            </div>
             <div class="w-full bg-gray-200 dark:bg-slate-700 mt-4 rounded-full h-1.5">
                <div class="bg-yellow-500 dark:bg-amber-500 h-1.5 rounded-full" style="width: 20%"></div>
            </div>
          </div>

          <!-- Dead -->
          <div class="group relative p-6 bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-slate-700 hover:border-red-500/50 dark:hover:border-red-900/50 transition-all duration-300 shadow-sm dark:shadow-none">
            <p class="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Critic/Dead</p>
             <div class="flex items-baseline gap-2">
                <span class="text-3xl font-bold text-red-600 dark:text-rose-500 tracking-tight" id="stat-dead">-</span>
            </div>
             <div class="w-full bg-gray-200 dark:bg-slate-700 mt-4 rounded-full h-1.5">
                <div class="bg-red-500 dark:bg-rose-500 h-1.5 rounded-full" style="width: 5%"></div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="p-6 bg-white dark:bg-slate-800/40 rounded-3xl border border-gray-200 dark:border-slate-700/50 shadow-sm dark:shadow-none">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Activity Log</h3>
                <div class="space-y-4">
                    <div class="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <div class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400">🌱</div>
                        <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">New tree planted</p>
                            <p class="text-xs text-gray-500 dark:text-slate-500">2 hours ago</p>
                        </div>
                    </div>
                     <div class="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">💧</div>
                        <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">Watering schedule completed</p>
                            <p class="text-xs text-gray-500 dark:text-slate-500">5 hours ago</p>
                        </div>
                    </div>
                </div>
            </div>
             <div class="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 rounded-3xl border border-gray-200 dark:border-slate-700/50 shadow-sm dark:shadow-none">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">System Status</h3>
                <div class="flex items-center gap-2 mb-2">
                    <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span class="text-sm text-gray-600 dark:text-slate-300">SawitDB Engine: <span class="text-green-600 dark:text-green-400 font-mono">ONLINE</span></span>
                </div>
                 <div class="flex items-center gap-2 mb-2">
                    <span class="w-2 h-2 rounded-full bg-green-500"></span>
                    <span class="text-sm text-gray-600 dark:text-slate-300">Redis Cache: <span class="text-green-600 dark:text-green-400 font-mono">ACTIVE</span></span>
                </div>
            </div>
        </div>
      </div>
    </div>
  `;

  render(html);

  // Load stats
  loadStats();
}

async function loadStats() {
  try {
    const response = await API.stats.get();
    if (response.success) {
      const stats = response.data;
      document.getElementById('stat-total').textContent = stats.total || 0;
      document.getElementById('stat-healthy').textContent = stats.healthy || 0;
      document.getElementById('stat-sick').textContent = stats.sick || 0;
      document.getElementById('stat-dead').textContent = stats.dead || 0;
    }
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
}
