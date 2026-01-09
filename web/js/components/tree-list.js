// Tree List Component with Smart Health Input & History
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
      <div id="update-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div class="bg-white rounded-lg p-6 max-w-6xl w-full my-8">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-xl font-bold">Update Tree Status</h3>
            <button onclick="closeUpdateModal()" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Left: Current Info & Form -->
            <div>
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 class="font-semibold text-blue-900 mb-3">📋 Current Information</h4>
                <div class="grid grid-cols-2 gap-2 text-sm">
                  <div><span class="text-blue-700">Code:</span> <strong id="current-tree-code">-</strong></div>
                  <div><span class="text-blue-700">Status:</span> <span id="current-tree-status">-</span></div>
                  <div><span class="text-blue-700">Health:</span> <span id="current-tree-health">-</span></div>
                  <div><span class="text-blue-700">Height:</span> <span id="current-tree-height">-</span></div>
                </div>
                <div class="mt-3 pt-3 border-t border-blue-200 text-sm">
                  <div class="text-blue-800"><strong>Last Updated:</strong> <span id="last-updated-time">-</span></div>
                  <div class="text-blue-600 text-xs mt-1">By: <span id="last-updated-by">-</span></div>
                </div>
              </div>

              <form id="update-form">
                <input type="hidden" id="update-tree-code">
                <div class="mb-4">
                  <label class="block text-sm font-medium mb-2">Status/Kondisi Pohon *</label>
                  <select id="update-status" class="w-full px-4 py-2 border rounded-lg" required>
                    <option value="SEHAT">🌿 Sehat (Health: 90%)</option>
                    <option value="DIPUPUK">💊 Dipupuk (Health: 75%)</option>
                    <option value="DIPANTAU">👁️ Dipantau (Health: 85%)</option>
                    <option value="SAKIT">⚠️ Sakit (Health: 40%)</option>
                    <option value="MATI">💀 Mati (Health: 0%)</option>
                  </select>
                  <p class="text-xs text-gray-500 mt-1">Health score otomatis sesuai status</p>
                </div>
                <div class="mb-4">
                  <label class="block text-sm font-medium mb-2">Catatan</label>
                  <textarea id="update-notes" rows="3" class="w-full px-4 py-2 border rounded-lg" placeholder="Catatan monitoring (opsional)"></textarea>
                </div>
                <div class="flex space-x-3">
                  <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Update</button>
                  <button type="button" onclick="closeUpdateModal()" class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Batal</button>
                </div>
              </form>
            </div>

            <!-- Right: History -->
            <div>
              <div class="bg-gray-50 border rounded-lg p-4">
                <h4 class="font-semibold mb-3">📜 Update History</h4>
                <div id="update-history" class="space-y-3 max-h-96 overflow-y-auto">Loading...</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Modal -->
      <div id="delete-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 class="text-xl font-bold text-red-600 mb-4">⚠️ Confirm Delete</h3>
          <p class="mb-2">Delete tree <strong id="delete-tree-code">-</strong>?</p>
          <p class="text-sm text-red-600 mb-4">This cannot be undone!</p>
          <div class="flex space-x-3">
            <button onclick="executeDelete()" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Yes, Delete</button>
            <button onclick="closeDeleteModal()" class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `;

  render(html);
  loadTrees();
  setTimeout(() => {
    const form = document.getElementById('update-form');
    if (form) form.addEventListener('submit', handleUpdateSubmit);
  }, 100);
}

function handleStatusChange() {
  const status = document.getElementById('update-status').value;
  const healthContainer = document.getElementById('health-input-container');
  const healthInput = document.getElementById('health-score');

  if (status === 'MATI') {
    healthInput.value = 0;
    healthInput.disabled = true;
    healthContainer.classList.add('opacity-50');
  } else {
    healthInput.disabled = false;
    healthContainer.classList.remove('opacity-50');
    if (healthInput.value == 0) {
      healthInput.value = 50; // Default to 50% when enabling
    }
  }
}

async function loadTrees() {
  const canEdit = Auth.canEdit();
  const canDelete = Auth.canDelete();
  try {
    const response = await API.trees.list();
    if (response.success && response.data) {
      const trees = response.data;
      document.getElementById('total-count').textContent = `${trees.length} trees`;
      const html = `
        <table class="min-w-full divide-y">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Pohon</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Health</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Height</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diameter</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y">
            ${trees.map(tree => `
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 font-medium">${tree.code}</td>
                <td class="px-6 py-4 text-sm">${getSpeciesName(tree.species_id)}</td>
                <td class="px-6 py-4"><span class="px-2 py-1 rounded-full text-xs badge-${tree.status.toLowerCase()}">${tree.status}</span></td>
                <td class="px-6 py-4"><span class="font-medium text-${tree.health_score >= 80 ? 'green' : tree.health_score >= 60 ? 'yellow' : 'red'}-600">${tree.health_score}%</span></td>
                <td class="px-6 py-4">${tree.height_meters}m</td>
                <td class="px-6 py-4">${tree.diameter_cm}cm</td>
                <td class="px-6 py-4 text-sm max-w-xs truncate">${tree.notes || '-'}</td>
                <td class="px-6 py-4 text-sm space-x-2">
                  ${canEdit ? `<button onclick="openUpdateModal('${tree.code}')" class="text-green-600 hover:text-green-800 font-medium">Update</button>` : ''}
                  ${canDelete ? `<button onclick="confirmDeleteTree('${tree.code}')" class="text-red-600 hover:text-red-800 font-medium">Delete</button>` : ''}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
      document.getElementById('tree-list-content').innerHTML = html;
    }
  } catch (error) {
    document.getElementById('tree-list-content').innerHTML = '<p class="text-red-600">Failed to load trees</p>';
  }
}

async function openUpdateModal(code) {
  try {
    showLoading(true);
    const response = await API.trees.get(code);
    if (response.success && response.data) {
      const tree = response.data;
      document.getElementById('update-tree-code').value = code;
      document.getElementById('current-tree-code').textContent = tree.code;
      document.getElementById('current-tree-status').innerHTML = `<span class="px-2 py-1 rounded-full text-xs badge-${tree.status.toLowerCase()}">${tree.status}</span>`;
      document.getElementById('current-tree-health').innerHTML = `<span class="font-semibold text-${tree.health_score >= 80 ? 'green' : tree.health_score >= 60 ? 'yellow' : 'red'}-600">${tree.health_score}%</span>`;
      document.getElementById('current-tree-height').textContent = tree.height_meters + 'm';

      // Last updated
      const updated = new Date(tree.updated_at);
      const now = new Date();
      const diff = now - updated;
      const mins = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      let ago = mins < 1 ? 'Just now' : mins < 60 ? `${mins} mins ago` : hours < 24 ? `${hours} hours ago` : `${days} days ago`;
      document.getElementById('last-updated-time').textContent = ago;
      document.getElementById('last-updated-by').textContent = tree.registered_by || 'System';

      document.getElementById('update-status').value = tree.status;
      document.getElementById('health-score').value = tree.health_score;

      if (tree.status === 'MATI') {
        document.getElementById('health-score').disabled = true;
        document.getElementById('health-input-container').classList.add('opacity-50');
      }

      loadUpdateHistory(code);
      document.getElementById('update-modal').classList.remove('hidden');
    }
  } catch (e) {
    showToast('Failed to load tree', 'error');
  } finally {
    showLoading(false);
  }
}

async function loadUpdateHistory(code) {
  const container = document.getElementById('update-history');
  container.innerHTML = '<p class="text-sm text-gray-500">Loading...</p>';

  try {
    const response = await API.trees.history(code);

    if (response.success && response.data && response.data.length > 0) {
      const logs = response.data;

      const statusColors = {
        'SEHAT': 'green',
        'SAKIT': 'yellow',
        'MATI': 'red',
        'DIPUPUK': 'purple',
        'DIPANTAU': 'blue'
      };

      const statusIcons = {
        'SEHAT': '🌿',
        'SAKIT': '⚠️',
        'MATI': '💀',
        'DIPUPUK': '💊',
        'DIPANTAU': '👁️'
      };

      const html = logs.map(log => {
        const date = new Date(log.monitor_date || log.created_at);
        const now = new Date();
        const diff = now - date;
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        let ago;
        if (mins < 1) ago = 'Just now';
        else if (mins < 60) ago = `${mins} mins ago`;
        else if (hours < 24) ago = `${hours} hours ago`;
        else if (days < 30) ago = `${days} days ago`;
        else ago = date.toLocaleDateString('id-ID');

        const color = statusColors[log.status] || 'gray';
        const icon = statusIcons[log.status] || '📝';

        return `
          <div class="border-l-2 border-${color}-500 pl-3 py-2">
            <div class="font-medium text-${color}-700">${icon} ${log.status}</div>
            <div class="text-xs text-gray-600">Health: ${log.health_score}%${log.observations ? ' • "' + log.observations + '"' : ''}</div>
            <div class="text-xs text-gray-500 mt-1">${ago} • ${log.monitored_by}</div>
          </div>
        `;
      }).join('');

      container.innerHTML = `<div class="text-sm space-y-2">${html}</div>`;
    } else {
      container.innerHTML = '<p class="text-sm text-gray-500 text-center">No history yet</p>';
    }
  } catch (error) {
    container.innerHTML = '<p class="text-sm text-red-600">Failed to load history</p>';
    console.error('History error:', error);
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
  const health = status === 'MATI' ? 0 : parseInt(document.getElementById('health-score').value);
  const notes = document.getElementById('update-notes').value;

  // Validate health score
  if (health < 0 || health > 100) {
    showToast('Skor kesehatan harus 0-100%', 'error');
    return;
  }

  try {
    showLoading(true);
    const response = await API.trees.updateStatus(code, { status, health_score: health, notes });
    if (response.success) {
      showToast('Status berhasil diupdate!', 'success');
      closeUpdateModal();
      loadTrees();
    }
  } catch (e) {
    showToast(e.message || 'Update gagal', 'error');
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
      showToast('Deleted!', 'success');
      closeDeleteModal();
      loadTrees();
    }
  } catch (e) {
    showToast(e.message || 'Delete failed', 'error');
  } finally {
    showLoading(false);
  }
}
