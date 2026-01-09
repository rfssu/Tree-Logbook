// Tree List Component (Placeholder)
function renderTreeList() {
    const html = `
    <div class="min-h-screen bg-gray-50">
      <nav class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center space-x-4">
              <a href="#/dashboard" class="text-gray-600 hover:text-gray-900">← Back</a>
              <h1 class="text-xl font-bold text-gray-900">Tree List</h1>
            </div>
            <button onclick="Auth.logout()" class="px-4 py-2 text-red-600 hover:text-red-800">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">All Trees</h2>
          <div id="tree-list-content">
            <p class="text-gray-500">Loading trees...</p>
          </div>
        </div>
      </div>
    </div>
  `;

    render(html);
    loadTrees();
}

async function loadTrees() {
    try {
        const response = await API.trees.list();
        if (response.success && response.data) {
            const trees = response.data;
            const html = `
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Health</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Height</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${trees.map(tree => `
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap font-medium">${tree.code}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-3 py-1 rounded-full text-sm badge-${tree.status.toLowerCase()}">${tree.status}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">${tree.health_score}%</td>
                  <td class="px-6 py-4 whitespace-nowrap">${tree.height_meters}m</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <p class="mt-4 text-gray-600">Total: ${trees.length} trees</p>
      `;
            document.getElementById('tree-list-content').innerHTML = html;
        }
    } catch (error) {
        document.getElementById('tree-list-content').innerHTML =
            '<p class="text-red-600">Failed to load trees</p>';
    }
}
