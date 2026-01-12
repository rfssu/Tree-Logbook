// Dashboard Component (Placeholder)
function renderDashboard() {
  const html = `
    <div class="min-h-screen bg-slate-900 text-white font-sans selection:bg-green-500 selection:text-white">
      <!-- Navbar (Glassmorphism) -->
      <nav class="fixed w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                <span class="text-lg">🌳</span>
              </div>
              <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Tree-ID</h1>
            </div>
            <div class="flex items-center space-x-6">
              <span class="text-sm text-slate-400">Welcome, <strong id="user-name" class="text-white"></strong></span>
              <button onclick="Auth.logout()" class="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 border border-transparent hover:border-slate-600">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <div class="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <!-- Hero Section -->
        <div class="relative mb-12 p-8 rounded-3xl bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-white/10 overflow-hidden">
            <div class="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-green-500/20 rounded-full blur-3xl"></div>
            <div class="relative z-10 flex justify-between items-end">
                <div>
                    <h2 class="text-4xl font-bold text-white mb-2">Dashboard Overview</h2>
                    <p class="text-emerald-400">Real-time monitoring of your plantation assets.</p>
                </div>
                <a href="#/trees" class="group flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-green-50 transition-all duration-300 shadow-lg shadow-white/10 hover:shadow-green-400/20 hover:-translate-y-1">
                    Manage Inventory
                    <span class="transform group-hover:translate-x-1 transition-transform">→</span>
                </a>
            </div>
        </div>
        
        <!-- Stats Grid -->
        <h3 class="text-lg font-semibold text-slate-400 mb-6 uppercase tracking-wider text-xs">Plantation Status</h3>
        <div id="stats-cards" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <!-- Total Trees -->
          <div class="group relative p-6 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 hover:border-slate-600 transition-all duration-300 hover:bg-slate-800/80">
            <div class="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <p class="text-sm font-medium text-slate-400 mb-1">Total Trees</p>
            <div class="flex items-baseline gap-2">
                <span class="text-3xl font-bold text-white tracking-tight" id="stat-total">-</span>
                <span class="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">+12%</span>
            </div>
          </div>

          <!-- Healthy -->
          <div class="group relative p-6 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 hover:border-green-900/50 transition-all duration-300">
            <p class="text-sm font-medium text-slate-400 mb-1">Healthy</p>
             <div class="flex items-baseline gap-2">
                <span class="text-3xl font-bold text-emerald-400 tracking-tight" id="stat-healthy">-</span>
            </div>
            <div class="w-full bg-slate-700 mt-4 rounded-full h-1.5 overflow-hidden">
                <div class="bg-emerald-500 h-1.5 rounded-full" style="width: 80%"></div>
            </div>
          </div>

          <!-- Sick -->
          <div class="group relative p-6 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 hover:border-yellow-900/50 transition-all duration-300">
            <p class="text-sm font-medium text-slate-400 mb-1">Attention Needed</p>
             <div class="flex items-baseline gap-2">
                <span class="text-3xl font-bold text-amber-400 tracking-tight" id="stat-sick">-</span>
            </div>
             <div class="w-full bg-slate-700 mt-4 rounded-full h-1.5">
                <div class="bg-amber-500 h-1.5 rounded-full" style="width: 20%"></div>
            </div>
          </div>

          <!-- Dead -->
          <div class="group relative p-6 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 hover:border-red-900/50 transition-all duration-300">
            <p class="text-sm font-medium text-slate-400 mb-1">Critic/Dead</p>
             <div class="flex items-baseline gap-2">
                <span class="text-3xl font-bold text-rose-500 tracking-tight" id="stat-dead">-</span>
            </div>
             <div class="w-full bg-slate-700 mt-4 rounded-full h-1.5">
                <div class="bg-rose-500 h-1.5 rounded-full" style="width: 5%"></div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="p-6 bg-slate-800/40 rounded-3xl border border-slate-700/50">
                <h3 class="text-lg font-bold text-white mb-4">Activity Log</h3>
                <div class="space-y-4">
                    <div class="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                        <div class="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">🌱</div>
                        <div>
                            <p class="text-sm font-medium text-white">New tree planted</p>
                            <p class="text-xs text-slate-500">2 hours ago</p>
                        </div>
                    </div>
                     <div class="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                        <div class="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">💧</div>
                        <div>
                            <p class="text-sm font-medium text-white">Watering schedule completed</p>
                            <p class="text-xs text-slate-500">5 hours ago</p>
                        </div>
                    </div>
                </div>
            </div>
             <div class="p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-slate-700/50">
                <h3 class="text-lg font-bold text-white mb-4">System Status</h3>
                <div class="flex items-center gap-2 mb-2">
                    <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span class="text-sm text-slate-300">SawitDB Engine: <span class="text-green-400 font-mono">ONLINE</span></span>
                </div>
                 <div class="flex items-center gap-2 mb-2">
                    <span class="w-2 h-2 rounded-full bg-green-500"></span>
                    <span class="text-sm text-slate-300">Redis Cache: <span class="text-green-400 font-mono">ACTIVE</span></span>
                </div>
            </div>
        </div>
      </div>
    </div>
  `;

  render(html);

  // Load user info
  const user = Auth.getCurrentUser();
  if (user) {
    document.getElementById('user-name').textContent = user.username;
  }

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
