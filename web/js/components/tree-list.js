// Tree List Component with Smart Health Input & History
// Global state for search and filter
let currentSearch = '';
let currentFilter = 'ALL';
let currentSort = { column: 'code', direction: 'asc' };

function renderTreeList() {
  const canEdit = Auth.canEdit();
  const canDelete = Auth.canDelete();
  const canCreate = Storage.canCreate(); // Admin only
  const breadcrumbs = Navigation.getBreadcrumbs('trees');

  const html = `
    <div class="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      ${Navigation.renderNavbar('trees', breadcrumbs)}

      <div class="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-sm dark:shadow-none border border-gray-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
          <div class="p-6">
            <!-- Header with New Tree Button -->
            <div class="flex justify-between items-center mb-6">
              <div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Tree Inventory</h2>
                <p class="text-sm text-gray-500 dark:text-slate-400 mt-1">Manage and monitor your tree collection</p>
              </div>
              ${canCreate ? `
                <a href="#/trees/new" class="flex items-center gap-2 px-6 py-3 bg-green-600 dark:bg-green-500 text-white rounded-xl hover:bg-green-700 dark:hover:bg-green-400 transition-all shadow-lg shadow-green-500/20 font-medium">
                  <span>+</span> New Tree
                </a>
              ` : ''}
            </div>

            <!-- Search & Filter Controls -->
            <!-- Search & Filter Controls -->
            <div class="flex flex-col md:flex-row gap-4 mb-8">
              <div class="flex-1 relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span class="text-gray-400 dark:text-slate-500">🔍</span>
                </div>
                <input 
                  type="text" 
                  id="tree-search" 
                  placeholder="Search by tree code, species..." 
                  class="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder-gray-400 dark:placeholder-slate-600 transition-all"
                  onkeyup="handleSearch(this.value)"
                >
              </div>
              <div class="w-full md:w-56">
                <div class="relative">
                     <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span class="text-gray-400 dark:text-slate-500">🏷️</span>
                    </div>
                    <select 
                      id="status-filter" 
                      class="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none transition-all cursor-pointer"
                      onchange="handleFilter(this.value)"
                    >
                      <option value="ALL">All Status</option>
                      <option value="SEHAT">🌿 Sehat</option>
                      <option value="DIPUPUK">💊 Dipupuk</option>
                      <option value="DIPANTAU">👁️ Dipantau</option>
                      <option value="SAKIT">⚠️ Sakit</option>
                      <option value="MATI">💀 Mati</option>
                    </select>
                     <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                        ▼
                    </div>
                </div>
              </div>
            </div>

            <div class="flex justify-between items-center mb-6">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Active Inventory</h2>
              <span class="px-3 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 rounded-full text-sm font-medium" id="total-count">Loading...</span>
            </div>
            
            <div id="tree-list-content" class="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
              <div class="p-8 text-center text-gray-500 dark:text-slate-400">Loading trees...</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Update Modal -->
      <div id="update-modal" class="hidden fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true" onclick="handleBackdropClick(event)">
         <!-- Backdrop -->
         <div class="fixed inset-0 bg-gray-900/75 dark:bg-black/80 backdrop-blur-sm transition-opacity"></div>
         
         <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <div class="relative transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-5xl border border-gray-200 dark:border-slate-700" onclick="event.stopPropagation()">
                <!-- Header -->
                <div class="bg-gray-50 dark:bg-slate-900/50 px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white" id="modal-title">Update Tree Status</h3>
                    <button onclick="closeUpdateModal()" class="text-gray-400 hover:text-gray-500 dark:hover:text-white transition-colors text-2xl leading-none">&times;</button>
                </div>
                
                <div class="px-6 py-6">
                     <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <!-- Left: Form -->
                        <div>
                             <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5 mb-6">
                                <h4 class="font-semibold text-blue-900 dark:text-blue-300 mb-4 flex items-center gap-2">
                                    <span class="text-xl">📋</span> Current Information
                                </h4>
                                <div class="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                                  <div><span class="text-blue-700 dark:text-blue-400">Code:</span> <strong id="current-tree-code" class="text-gray-900 dark:text-white ml-1">-</strong></div>
                                  <div><span class="text-blue-700 dark:text-blue-400">Status:</span> <span id="current-tree-status" class="ml-1">-</span></div>
                                  <div><span class="text-blue-700 dark:text-blue-400">Health:</span> <span id="current-tree-health" class="ml-1">-</span></div>
                                  <div><span class="text-blue-700 dark:text-blue-400">Height:</span> <span id="current-tree-height" class="text-gray-900 dark:text-white ml-1">-</span></div>
                                </div>
                                <div class="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300">
                                  <div class="flex justify-between">
                                      <span><strong>Last Updated:</strong> <span id="last-updated-time" class="opacity-75">-</span></span>
                                      <span>By: <span id="last-updated-by" class="font-medium">-</span></span>
                                  </div>
                                </div>
                              </div>

                              <form id="update-form">
                                <input type="hidden" id="update-tree-code">
                                <div class="mb-5">
                                  <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Status / Condition</label>
                                  <select id="update-status" class="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" required onchange="updateHealthScoreDefault()">
                                    <option value="SEHAT">🌿 Sehat</option>
                                    <option value="DIPUPUK">💊 Dipupuk</option>
                                    <option value="DIPANTAU">👁️ Dipantau</option>
                                    <option value="SAKIT">⚠️ Sakit</option>
                                    <option value="MATI">💀 Mati</option>
                                  </select>
                                </div>
                                <div class="mb-5">
                                  <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Health Score (0-100%)</label>
                                  <input 
                                    type="number" 
                                    id="update-health-score"
                                    min="0" 
                                    max="100" 
                                    class="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    required
                                  >
                                  <p class="text-xs text-gray-500 dark:text-slate-400 mt-1">Auto-adjusted based on status selection.</p>
                                </div>
                                <div class="mb-6">
                                  <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Notes</label>
                                  <textarea id="update-notes" rows="3" class="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" placeholder="Optional observations..."></textarea>
                                </div>
                                <div class="flex items-center gap-3 pt-2">
                                  <button type="submit" id="update-submit-btn" class="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-green-500/20">Update Tree</button>
                                  <button type="button" id="update-cancel-btn" onclick="closeUpdateModal()" class="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-white font-medium rounded-lg transition-colors">Cancel</button>
                                </div>
                              </form>
                        </div>

                        <!-- Right: History -->
                        <div class="h-full">
                             <div class="bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl p-5 h-full flex flex-col">
                                <h4 class="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <span class="text-xl">📜</span> Update History
                                </h4>
                                <div id="update-history" class="space-y-4 overflow-y-auto pr-2 flex-1 max-h-[400px]">
                                    <!-- History items will be injected here -->
                                </div>
                              </div>
                        </div>
                     </div>
                </div>
            </div>
         </div>
      </div>

      <!-- Delete Modal -->
      <div id="delete-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4">
         <div class="fixed inset-0 bg-gray-900/75 dark:bg-black/80 backdrop-blur-sm transition-opacity"></div>
         <div class="relative bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-xl border border-gray-200 dark:border-slate-700 transform transition-all">
            <div class="text-center">
                <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                    <span class="text-3xl">⚠️</span>
                </div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Confirm Deletion</h3>
                <p class="text-sm text-gray-500 dark:text-slate-400 mb-6">Are you sure you want to delete tree <strong id="delete-tree-code" class="text-gray-900 dark:text-white"></strong>? This action cannot be undone.</p>
                <div class="flex justify-center gap-3">
                    <button onclick="executeDelete()" class="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-red-500/20">Yes, Delete</button>
                    <button onclick="closeDeleteModal()" class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-white font-medium rounded-lg transition-colors">Cancel</button>
                </div>
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


// Helper: Map species ID to common name
function getSpeciesName(speciesId) {
  const speciesMap = {
    'SP001': 'Jati',
    'SP002': 'Mahoni',
    'SP003': 'Angsana',
    'SP004': 'Akasia',
    'SP005': 'Cendana'
  };
  return speciesMap[speciesId] || speciesId;
}

async function loadTrees() {
  const canEdit = Auth.canEdit();
  const canDelete = Auth.canDelete();
  try {
    const response = await API.trees.list();
    if (response.success && response.data) {
      let trees = response.data;

      // Apply search filter
      if (currentSearch) {
        const searchLower = currentSearch.toLowerCase();
        trees = trees.filter(tree =>
          tree.code.toLowerCase().includes(searchLower) ||
          getSpeciesName(tree.species_id).toLowerCase().includes(searchLower)
        );
      }

      // Apply status filter
      if (currentFilter !== 'ALL') {
        trees = trees.filter(tree => tree.status === currentFilter);
      }

      // Apply sorting
      trees.sort((a, b) => {
        let aVal = a[currentSort.column];
        let bVal = b[currentSort.column];

        // Special handling for species name
        if (currentSort.column === 'species') {
          aVal = getSpeciesName(a.species_id);
          bVal = getSpeciesName(b.species_id);
        }

        // Special handling for updated_at
        if (currentSort.column === 'updated_at') {
          aVal = new Date(a.updated_at);
          bVal = new Date(b.updated_at);
        }

        if (currentSort.direction === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });

      document.getElementById('total-count').textContent = `${trees.length} tree${trees.length !== 1 ? 's' : ''}`;

      const getSortIcon = (column) => {
        if (currentSort.column !== column) return '<span class="opacity-30">⇅</span>';
        return currentSort.direction === 'asc' ? '<span class="text-green-500">↑</span>' : '<span class="text-green-500">↓</span>';
      };

      const html = `
        <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead class="bg-gray-50 dark:bg-slate-900/50">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors" onclick="handleSort('code')">
                Code ${getSortIcon('code')}
              </th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors" onclick="handleSort('species')">
                Nama Pohon ${getSortIcon('species')}
              </th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors" onclick="handleSort('status')">
                Status ${getSortIcon('status')}
              </th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors" onclick="handleSort('height_meters')">
                Height ${getSortIcon('height_meters')}
              </th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors" onclick="handleSort('diameter_cm')">
                Diameter ${getSortIcon('diameter_cm')}
              </th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors" onclick="handleSort('updated_at')">
                Last Updated ${getSortIcon('updated_at')}
              </th>
              <th class="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
            ${trees.map(tree => {
        const isDead = tree.status === 'MATI';
        const rowClass = isDead
          ? 'bg-gray-50 dark:bg-slate-900/40 opacity-75'
          : 'hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors';

        // Format last updated timestamp - ALWAYS show date + time
        const updated = new Date(tree.updated_at);
        const day = String(updated.getDate()).padStart(2, '0');
        const month = String(updated.getMonth() + 1).padStart(2, '0');
        const year = updated.getFullYear();
        const hour = String(updated.getHours()).padStart(2, '0');
        const minute = String(updated.getMinutes()).padStart(2, '0');
        const second = String(updated.getSeconds()).padStart(2, '0');

        const lastUpdated = `${day}/${month}/${year} ${hour}:${minute}:${second}`;

        return `
              <tr class="${rowClass}">
                <td class="px-6 py-4 whitespace-nowrap font-mono font-medium text-sm text-gray-900 dark:text-white ${isDead ? 'text-gray-500 dark:text-slate-500' : ''}">${tree.code}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200 ${isDead ? 'text-gray-500 dark:text-slate-500' : ''}">${getSpeciesName(tree.species_id)}</td>
                <td class="px-6 py-4 whitespace-nowrap"><span class="px-3 py-1 rounded-full text-xs font-medium badge-${tree.status.toLowerCase()} border border-current shadow-sm">${tree.status}</span></td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-slate-300 ${isDead ? 'text-gray-500' : ''}">${tree.height_meters}m</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-slate-300 ${isDead ? 'text-gray-500' : ''}">${tree.diameter_cm}cm</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">${lastUpdated}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  ${isDead
            ? `<button onclick="openViewModal('${tree.code}')" class="text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors">View</button>`
            : canEdit ? `<button onclick="openUpdateModal('${tree.code}')" class="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors bg-green-50 dark:bg-green-400/10 px-3 py-1 rounded-md">Update</button>` : ''}
                  ${canDelete ? `<button onclick="confirmDeleteTree('${tree.code}')" class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors bg-red-50 dark:bg-red-400/10 px-3 py-1 rounded-md">Delete</button>` : ''}
                </td>
              </tr>
            `}).join('')}
          </tbody>
        </table>
        </div>
      `;
      document.getElementById('tree-list-content').innerHTML = html;
    }
  } catch (error) {
    document.getElementById('tree-list-content').innerHTML = '<div class="p-8 text-center text-red-500 dark:text-red-400">Failed to load trees. Please try again.</div>';
    console.error(error);
  }
}

// Search handler
function handleSearch(value) {
  currentSearch = value;
  loadTrees();
}

// Filter handler
function handleFilter(value) {
  currentFilter = value;
  loadTrees();
}

// Sort handler
function handleSort(column) {
  if (currentSort.column === column) {
    currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
  } else {
    currentSort.column = column;
    currentSort.direction = 'asc';
  }
  loadTrees();
}

// Backdrop click handler
function handleBackdropClick(event) {
  if (event.target.id === 'update-modal') {
    closeUpdateModal();
  }
}

// Update health score default based on status
function updateHealthScoreDefault() {
  const status = document.getElementById('update-status').value;
  const healthMap = {
    'SEHAT': 90,
    'DIPUPUK': 75,
    'DIPANTAU': 85,
    'SAKIT': 40,
    'MATI': 0
  };
  document.getElementById('update-health-score').value = healthMap[status] || 50;
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

      // Last updated - format as absolute time with full date
      const updated = new Date(tree.updated_at);
      const day = String(updated.getDate()).padStart(2, '0');
      const month = String(updated.getMonth() + 1).padStart(2, '0');
      const year = updated.getFullYear();
      const hour = String(updated.getHours()).padStart(2, '0');
      const minute = String(updated.getMinutes()).padStart(2, '0');
      const second = String(updated.getSeconds()).padStart(2, '0');

      const timeDisplay = `${day}/${month}/${year} ${hour}:${minute}:${second}`;

      document.getElementById('last-updated-time').textContent = timeDisplay;
      // Use username if available, otherwise fallback to user ID
      document.getElementById('last-updated-by').textContent = tree.registered_by_username || tree.registered_by || 'System';

      document.getElementById('update-status').value = tree.status;
      document.getElementById('update-health-score').value = tree.health_score || 90;

      // ✅ OPTIMIZATION: Show modal immediately (non-blocking)
      document.getElementById('update-modal').classList.remove('hidden');
      showLoading(false);

      // Load history asynchronously in background (doesn't block modal)
      loadUpdateHistory(code);
    }
  } catch (e) {
    showToast('Failed to load tree', 'error');
    showLoading(false);
  }
}

// View-only modal for dead trees (read-only mode)
async function openViewModal(code) {
  showLoading(true);
  try {
    const response = await API.trees.get(code);
    if (response.success && response.data) {
      const tree = response.data;
      document.getElementById('update-tree-code').value = code;
      document.getElementById('current-tree-code').textContent = tree.code;
      document.getElementById('current-tree-status').innerHTML = `<span class="px-2 py-1 rounded-full text-xs badge-${tree.status.toLowerCase()}">${tree.status}</span>`;
      document.getElementById('current-tree-health').innerHTML = `<span class="font-semibold text-gray-500 dark:text-slate-400">${tree.health_score}%</span>`;
      document.getElementById('current-tree-height').textContent = tree.height_meters + 'm';

      const updated = new Date(tree.updated_at);
      const now = new Date();
      const isToday = updated.toDateString() === now.toDateString();

      let timeDisplay;
      if (isToday) {
        timeDisplay = updated.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
      } else {
        timeDisplay = updated.toLocaleString('id-ID', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      }

      document.getElementById('last-updated-time').textContent = timeDisplay;
      // Use username if available, otherwise fallback to user ID
      document.getElementById('last-updated-by').textContent = tree.registered_by_username || tree.registered_by || 'System';

      const modalTitle = document.querySelector('#update-modal h3');
      if (modalTitle) modalTitle.textContent = `View Tree - ${code} (Read Only)`;

      document.getElementById('update-status').value = tree.status;
      document.getElementById('update-notes').value = tree.notes || '';

      // Disable inputs and hide buttons for dead trees
      document.getElementById('update-status').disabled = true;
      document.getElementById('update-notes').disabled = true;
      const submitBtn = document.getElementById('update-submit-btn');
      const cancelBtn = document.getElementById('update-cancel-btn');
      if (submitBtn) submitBtn.style.display = 'none';
      if (cancelBtn) cancelBtn.style.display = 'none'; // Hide Batal - only X button needed

      loadUpdateHistory(code);
      document.getElementById('update-modal').classList.remove('hidden');
    }
  } catch (e) {
    showToast('Failed to load tree', 'error');
  } finally {
    showLoading(false);
  }
}

// Global timer for auto-refreshing timestamps
let timestampRefreshTimer = null;

async function loadUpdateHistory(code) {
  const container = document.getElementById('update-history');
  container.innerHTML = '<p class="text-sm text-gray-500 dark:text-slate-400">Loading...</p>';

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

      // Function to render history with current timestamps
      const renderHistory = () => {
        const html = logs.map((log, index) => {
          // Use monitor_date (the actual monitoring date) not created_at
          const date = new Date(log.monitor_date);

          // Format as DD/MM/YYYY HH:MM:SS (consistent with Current Information)
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          const hour = String(date.getHours()).padStart(2, '0');
          const minute = String(date.getMinutes()).padStart(2, '0');
          const second = String(date.getSeconds()).padStart(2, '0');

          const timeDisplay = `${day}/${month}/${year} ${hour}:${minute}:${second}`;

          const color = statusColors[log.status] || 'gray';
          const icon = statusIcons[log.status] || '📝';

          return `
            <div class="border-l-2 border-${color}-500 pl-3 py-2">
              <div class="font-medium text-${color}-700 dark:text-${color}-400">${icon} ${log.status}</div>
              <div class="text-xs text-gray-600 dark:text-slate-300">Health: ${log.health_score}%${log.observations ? ' • "' + log.observations + '"' : ''}</div>
              <div class="text-xs text-gray-500 dark:text-slate-500 mt-1" data-timestamp="${log.monitor_date}">${timeDisplay} • ${log.monitored_by_username || log.monitored_by}</div>
            </div>
          `;
        }).join('');

        container.innerHTML = `<div class="text-sm space-y-2">${html}</div>`;
      };

      // Initial render
      renderHistory();

    } else {
      container.innerHTML = '<p class="text-sm text-gray-500 dark:text-slate-500 text-center">No history yet</p>';
    }
  } catch (error) {
    container.innerHTML = '<p class="text-sm text-red-600 dark:text-red-400">Failed to load history</p>';
    console.error('History error:', error);
  }
}

function closeUpdateModal() {
  document.getElementById('update-modal').classList.add('hidden');

  // Reset to editable state for next open
  const modalTitle = document.querySelector('#update-modal h3');
  if (modalTitle) modalTitle.textContent = 'Update Tree Status';

  // Re-enable all inputs
  document.getElementById('update-status').disabled = false;
  document.getElementById('update-notes').disabled = false;
  document.getElementById('update-notes').value = '';

  // Show all buttons again
  const submitBtn = document.getElementById('update-submit-btn');
  const cancelBtn = document.getElementById('update-cancel-btn');
  if (submitBtn) submitBtn.style.display = 'inline-block';
  if (cancelBtn) cancelBtn.style.display = 'inline-block';
}

async function handleUpdateSubmit(e) {
  e.preventDefault();
  const code = document.getElementById('update-tree-code').value;
  const status = document.getElementById('update-status').value;
  const healthScore = parseInt(document.getElementById('update-health-score').value);
  const notes = document.getElementById('update-notes').value;

  try {
    showLoading(true);
    const response = await API.trees.updateStatus(code, { status, health_score: healthScore, notes });
    if (response.success) {
      showToast('Status berhasil diupdate!', 'success');

      // ✅ FIX: Reload tree list to show updated status
      loadTrees();

      // ✅ FIX: Reload history to show NEW entry immediately (realtime update)
      await loadUpdateHistory(code);

      // ✅ FIX: Refresh current information with latest data
      const treeResponse = await API.trees.get(code);
      if (treeResponse.success && treeResponse.data) {
        const tree = treeResponse.data;
        document.getElementById('current-tree-status').innerHTML = `<span class="px-2 py-1 rounded-full text-xs badge-${tree.status.toLowerCase()}">${tree.status}</span>`;
        document.getElementById('current-tree-health').innerHTML = `<span class="font-semibold text-${tree.health_score >= 80 ? 'green' : tree.health_score >= 60 ? 'yellow' : 'red'}-600">${tree.health_score}%</span>`;

        // Update last updated time
        const updated = new Date(tree.updated_at);
        const day = String(updated.getDate()).padStart(2, '0');
        const month = String(updated.getMonth() + 1).padStart(2, '0');
        const year = updated.getFullYear();
        const hour = String(updated.getHours()).padStart(2, '0');
        const minute = String(updated.getMinutes()).padStart(2, '0');
        const second = String(updated.getSeconds()).padStart(2, '0');
        const timeDisplay = `${day}/${month}/${year} ${hour}:${minute}:${second}`;
        document.getElementById('last-updated-time').textContent = timeDisplay;
        document.getElementById('last-updated-by').textContent = tree.registered_by_username || tree.registered_by || 'System';
      }

      // ✅ FIX: Close modal after short delay (let user see the update)
      setTimeout(() => {
        closeUpdateModal();
      }, 800);
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
