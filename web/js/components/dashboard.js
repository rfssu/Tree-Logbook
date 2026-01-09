// Dashboard Component (Placeholder)
function renderDashboard() {
    const html = `
    <div class="min-h-screen bg-gray-50">
      <!-- Navbar -->
      <nav class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <h1 class="text-xl font-bold text-gray-900">🌳 Tree-ID</h1>
            </div>
            <div class="flex items-center space-x-4">
              <span class="text-gray-700">Welcome, <strong id="user-name"></strong></span>
              <button onclick="Auth.logout()" class="px-4 py-2 text-red-600 hover:text-red-800">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
        
        <!-- Stats Cards -->
        <div id="stats-cards" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow p-6">
            <div class="text-sm text-gray-600">Total Trees</div>
            <div class="text-3xl font-bold text-gray-900" id="stat-total">-</div>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <div class="text-sm text-gray-600">Healthy</div>
            <div class="text-3xl font-bold text-green-600" id="stat-healthy">-</div>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <div class="text-sm text-gray-600">Sick</div>
            <div class="text-3xl font-bold text-yellow-600" id="stat-sick">-</div>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <div class="text-sm text-gray-600">Dead</div>
            <div class="text-3xl font-bold text-red-600" id="stat-dead">-</div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="mb-6">
          <a href="#/trees" class="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
            View All Trees
          </a>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold mb-4">Quick Stats</h3>
          <p class="text-gray-600">Dashboard loaded successfully! ✅</p>
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
