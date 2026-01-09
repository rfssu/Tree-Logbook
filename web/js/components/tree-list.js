// Tree List Component with Smart Health Input
function renderTreeList() {
  const canEdit = Auth.canEdit();
  const canDelete = Auth.canDelete();

  const html = `
    <div class="min-h-screen bg-gray-50">
      <nav class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center space-x-4">
              <a href="#/dashboard" class="text-gray-600 hover:text-gray-900">← Dashboard</a>
              <h1 class="text-xl font-bold text-gray-900">🌳 All Trees</h1>
            </div>
            <div class="flex items-center space-x-4">
              ${canEdit ? '<a href="#/trees/new" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">+ New Tree</a>' : ''}
              <button onclick="Auth.logout()" class="px-4 py-2 text-red-600 hover:text-red-800">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-white rounded-lg shadow">
          <div class="p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-semibold">Tree Inventory</h2>
              <span class="text-sm text-gray-500" id="total-count">Loading...</span>
            </div>
            <div id="tree-list-content">
              <p class="text-gray-500">Loading trees...</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Update Modal -->
      <div id="update-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <h3 class="text-xl font-bold mb-4">Update Tree Status</h3>
          
          <!-- Current Tree Info -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 class="font-semibold text-blue-900 mb-2">📋 Current Information</h4>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span class="text-blue-700 font-medium">Code:</span>
                <span class="ml-2 text-blue-900" id="current-tree-code">-</span>
              </div>
              <div>
                <span class="text-blue-700 font-medium">Status:</span>
                <span class="ml-2" id="current-tree-status">-</span>
              </div>
              <div>
                <span class="text-blue-700 font-medium">Health:</span>
                <span class="ml-2 font-semibold" id="current-tree-health">-</span>
              </div>
              <div>
                <span class="text-blue-700 font-medium">Height:</span>
                <span class="ml-2" id="current-tree-height">-</span>
              </div>
              <div class="col-span-2">
                <span class="text-blue-700 font-medium">Notes:</span>
                <span class="ml-2 text-blue-900" id="current-tree-notes">-</span>
              </div>
            </div>
          </div>

          <form id="update-form">
            <input type="hidden" id="update-tree-code">
            
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">New Status *</label>
              <select id="update-status" class="w-full px-4 py-2 border rounded-lg" required onchange="handleStatusChange()">
                <option value="SEHAT">🌿 SEHAT (Healthy)</option>
                <option value="DIPUPUK">💊 DIPUPUK (Fertilized)</option>
                <option value="DIPANTAU">👁️ DIPANTAU (Monitored)</option>
                <option value="SAKIT">⚠️ SAKIT (Sick)</option>
                <option value="MATI">💀 MATI (Dead)</option>
              </select>
            </div>

            <div class="mb-4" id="health-input-container">
              <label class="block text-sm font-medium mb-2">New Health Condition *</label>
              <select id="health-condition" class="w-full px-4 py-2 border rounded-lg" required onchange="updateHealthScore()">
                <option value="100">⭐ Sangat Sehat (95-100%)</option>
                <option value="85">👍 Sehat (80-90%)</option>
                <option value="70">😐 Cukup Sehat (60-75%)</option>
                <option value="50">😟 Kurang Sehat (40-55%)</option>
                <option value="25">😢 Sakit (20-30%)</option>
                <option value="10">💀 Sangat Sakit (5-15%)</option>
              </select>
              <p class="text-sm text-gray-500 mt-1">Health Score: <strong id="health-display">100%</strong></p>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">Additional Notes (Optional)</label>
              <textarea id="update-notes" rows="3" class="w-full px-4 py-2 border rounded-lg" placeholder="Tambahkan catatan perubahan..."></textarea>
            </div>

            <div class="flex space-x-3">
              <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Update Tree
              </button>
              <button type="button" onclick="closeUpdateModal()" class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div id="delete-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 class="text-xl font-bold text-red-600 mb-4">⚠️ Confirm Delete</h3>
          <p class="text-gray-700 mb-2">Are you sure you want to delete this tree?</p>
          <div class="bg-red-50 border border-red-200 rounded p-3 mb-4">
            <p class="text-sm text-red-800"><strong>Code:</strong> <span id="delete-tree-code">-</span></p>
            <p class="text-sm text-red-600 mt-2">⚠️ This action cannot be undone!</p>
          </div>
          <div class="flex space-x-3">
            <button onclick="executeDelete()" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              Yes, Delete
            </button>
            <button onclick="closeDeleteModal()" class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  render(html);
  loadTrees();

  // Setup update form handler
  setTimeout(() => {
    const form = document.getElementById('update-form');
    if (form) {
      form.addEventListener('submit', handleUpdateSubmit);
    }
  }, 100);
}

function handleStatusChange() {
  const status = document.getElementById('update-status').value;
  const healthContainer = document.getElementById('health-input-container');
  const healthCondition = document.getElementById('health-condition');

  if (status === 'MATI') {
    // Auto-set to 0 for dead trees
    healthContainer.classList.add('hidden');
    document.getElementById('health-display').textContent = '0%';
  } else {
    healthContainer.classList.remove('hidden');
    updateHealthScore();
  }
}

function updateHealthScore() {
  const condition = document.getElementById('health-condition').value;
  document.getElementById('health-display').textContent = condition + '%';
}

async function loadTrees() {
  const canEdit = Auth.canEdit();
  const canDelete = Auth.canDelete();

  try {
    const response = await API.trees.list();
    if (response.success && response.data) {
      const trees = response.data;

      document.getElementById('total-count').textContent = `${trees.length} trees found`;

      const html = `
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Health</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Height</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diameter</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${trees.map(tree => `
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">${tree.code}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-3 py-1 rounded-full text-sm font-medium badge-${tree.status.toLowerCase()}">${tree.status}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-${tree.health_score >= 80 ? 'green' : tree.health_score >= 60 ? 'yellow' : 'red'}-600 font-medium">
                      ${tree.health_score}%
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-gray-600">${tree.height_meters}m</td>
                  <td class="px-6 py-4 whitespace-nowrap text-gray-600">${tree.diameter_cm}cm</td>
                  <td class="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">${tree.notes || '-'}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    ${canEdit ? `<button onclick="openUpdateModal('${tree.code}')" class="text-green-600 hover:text-green-800 font-medium">Update</button>` : ''}
                    ${canDelete ? `<button onclick="confirmDeleteTree('${tree.code}')" class="text-red-600 hover:text-red-800 font-medium">Delete</button>` : ''}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      document.getElementById('tree-list-content').innerHTML = html;
    }
  } catch (error) {
    document.getElementById('tree-list-content').innerHTML =
      '<p class="text-red-600">Failed to load trees. Please try again.</p>';
  }
}

async function openUpdateModal(code) {
  try {
    // Load tree data
    showLoading(true);
    const response = await API.trees.get(code);

    if (response.success && response.data) {
      const tree = response.data;

      // Set hidden code
      document.getElementById('update-tree-code').value = code;

      // Display current tree info
      document.getElementById('current-tree-code').textContent = tree.code;
      document.getElementById('current-tree-status').innerHTML =
        `<span class="px-2 py-1 rounded-full text-xs badge-${tree.status.toLowerCase()}">${tree.status}</span>`;
      document.getElementById('current-tree-health').textContent = tree.health_score + '%';
      document.getElementById('current-tree-health').className =
        `ml-2 font-semibold text-${tree.health_score >= 80 ? 'green' : tree.health_score >= 60 ? 'yellow' : 'red'}-600`;
      document.getElementById('current-tree-height').textContent = tree.height_meters + 'm';
      document.getElementById('current-tree-notes').textContent = tree.notes || 'No notes';

      // Pre-fill form with current values
      document.getElementById('update-status').value = tree.status;

      // Set health condition based on current health score
      let healthCondition = '100';
      if (tree.health_score >= 95) healthCondition = '100';
      else if (tree.health_score >= 80) healthCondition = '85';
      else if (tree.health_score >= 60) healthCondition = '70';
      else if (tree.health_score >= 40) healthCondition = '50';
      else if (tree.health_score >= 20) healthCondition = '25';
      else healthCondition = '10';

      document.getElementById('health-condition').value = healthCondition;
      updateHealthScore();

      // Handle MATI status
      if (tree.status === 'MATI') {
        document.getElementById('health-input-container').classList.add('hidden');
        document.getElementById('health-display').textContent = '0%';
      }

      // Show modal
      document.getElementById('update-modal').classList.remove('hidden');
    }
  } catch (error) {
    showToast('Failed to load tree data', 'error');
  } finally {
    showLoading(false);
  }
}

function closeUpdateModal() {
  document.getElementById('update-modal').classList.add('hidden');
  document.getElementById('update-form').reset();
}

async function handleUpdateSubmit(e) {
  e.preventDefault();

  const code = document.getElementById('update-tree-code').value;
  const status = document.getElementById('update-status').value;
  const notes = document.getElementById('update-notes').value;

  // Get health score based on status
  let healthScore;
  if (status === 'MATI') {
    healthScore = 0;
  } else {
    healthScore = parseInt(document.getElementById('health-condition').value);
  }

  try {
    showLoading(true);
    const response = await API.trees.updateStatus(code, {
      status: status,
      health_score: healthScore,
      notes: notes
    });

    if (response.success) {
      showToast('Tree status updated!', 'success');
      closeUpdateModal();
      loadTrees(); // Reload list
    }
  } catch (error) {
    showToast(error.message || 'Update failed', 'error');
  } finally {
    showLoading(false);
  }
}

function confirmDeleteTree(code) {
  document.getElementById('delete-tree-code').textContent = code;
  document.getElementById('delete-modal').classList.remove('hidden');
}

function closeDeleteModal() {
  document.getElementById('delete-modal').classList.add('hidden');
}

async function executeDelete() {
  const code = document.getElementById('delete-tree-code').textContent;

  try {
    showLoading(true);
    const response = await API.trees.delete(code);

    if (response.success) {
      showToast('Tree deleted successfully', 'success');
      closeDeleteModal();
      loadTrees(); // Reload list
    }
  } catch (error) {
    showToast(error.message || 'Delete failed', 'error');
  } finally {
    showLoading(false);
  }
}
