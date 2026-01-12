// Tree Form Component - Create/Edit Tree
function renderTreeForm(treeCode = null) {
  const isEdit = !!treeCode;
  const title = isEdit ? 'Edit Tree' : 'Create New Tree';
  const breadcrumbs = Navigation.getBreadcrumbs(isEdit ? 'trees/edit' : 'trees/new', { code: treeCode });

  const html = `
    <div class="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      ${Navigation.renderNavbar('trees', breadcrumbs)}

      <!-- Form Container -->
      <div class="pt-24 pb-12 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white dark:bg-slate-800 rounded-3xl shadow-sm dark:shadow-none border border-gray-200 dark:border-slate-700 p-8 transition-colors duration-300">
          
          <form id="tree-form" class="space-y-8">
            <!-- Header Section -->
            <div class="border-b border-gray-100 dark:border-slate-700 pb-6 mb-6">
                <p class="text-gray-500 dark:text-slate-400">Please fill in the details below to register a new tree in the inventory.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Species -->
                <div class="md:col-span-2">
                  <label class="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                    Species <span class="text-red-500">*</span>
                  </label>
                  <select id="species_id" name="species_id" class="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all cursor-pointer" required>
                    <option value="">Select species...</option>
                    <option value="SP001">Jati (Tectona grandis)</option>
                    <option value="SP002">Mahoni (Swietenia macrophylla)</option>
                    <option value="SP003">Angsana (Pterocarpus indicus)</option>
                    <option value="SP004">Akasia (Acacia mangium)</option>
                    <option value="SP005">Cendana (Santalum album)</option>
                  </select>
                </div>

                <!-- Location -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                    Location <span class="text-red-500">*</span>
                  </label>
                  <select id="location_id" name="location_id" class="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all cursor-pointer" required>
                    <option value="">Select location...</option>
                    <option value="LOC001">Taman Kota A</option>
                    <option value="LOC002">Hutan Lindung B</option>
                    <option value="LOC003">Area Konservasi C</option>
                  </select>
                </div>

                <!-- Planting Date -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                    Planting Date <span class="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="planting_date"
                    name="planting_date"
                    class="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    required
                  />
                </div>

                <!-- Height -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                    Height (meters) <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                      <input
                        type="number"
                        id="height_meters"
                        name="height_meters"
                        step="0.1"
                        min="0"
                        class="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all placeholder-gray-400 dark:placeholder-slate-500"
                        placeholder="e.g. 5.5"
                        required
                      />
                      <div class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <span class="text-gray-500 dark:text-slate-400">m</span>
                      </div>
                  </div>
                </div>

                <!-- Diameter -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                    Diameter (cm) <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                      <input
                        type="number"
                        id="diameter_cm"
                        name="diameter_cm"
                        step="0.1"
                        min="0"
                        class="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all placeholder-gray-400 dark:placeholder-slate-500"
                        placeholder="e.g. 25.5"
                        required
                      />
                      <div class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <span class="text-gray-500 dark:text-slate-400">cm</span>
                      </div>
                  </div>
                </div>
            </div>

            <!-- Notes -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows="4"
                class="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all placeholder-gray-400 dark:placeholder-slate-500"
                placeholder="Additional notes about this tree (optional)..."
              ></textarea>
            </div>

            <!-- Buttons -->
            <div class="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-slate-700">
              <button
                type="submit"
                class="px-8 py-3 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-green-500/20 flex items-center gap-2 transform active:scale-95"
              >
                <span>${isEdit ? '💾 Update Tree' : '✨ Create Tree'}</span>
              </button>
              <a
                href="#/trees"
                class="px-8 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-white font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"
              >
                Cancel
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  render(html);

  // Attach form handler
  const form = document.getElementById('tree-form');
  if (form) form.addEventListener('submit', (e) => handleTreeFormSubmit(e, isEdit, treeCode));

  // If edit mode, load tree data
  if (isEdit) {
    loadTreeData(treeCode);
  } else {
    // Set default planting date to today
    const today = new Date().toISOString().split('T')[0];
    const plantingDateInput = document.getElementById('planting_date');
    if (plantingDateInput) plantingDateInput.value = today;
  }
}

async function handleTreeFormSubmit(e, isEdit, treeCode) {
  e.preventDefault();

  const formData = {
    species_id: document.getElementById('species_id').value,
    location_id: document.getElementById('location_id').value,
    planting_date: document.getElementById('planting_date').value,
    height_meters: parseFloat(document.getElementById('height_meters').value),
    diameter_cm: parseFloat(document.getElementById('diameter_cm').value),
    notes: document.getElementById('notes').value || '',
    registered_by: Auth.getCurrentUser().id
  };

  // Calculate age from planting date
  const plantingDate = new Date(formData.planting_date);
  const today = new Date();
  const ageYears = Math.floor((today - plantingDate) / (365.25 * 24 * 60 * 60 * 1000));
  formData.age_years = Math.max(0, ageYears);

  try {
    showLoading(true);

    if (isEdit) {
      // Update tree (via status endpoint for now - full update not in API yet)
      showToast('Edit functionality coming soon!', 'info');
      Router.navigate('/trees');
    } else {
      // Create new tree
      const response = await API.trees.create(formData);

      if (response.success) {
        showToast('Tree created successfully!', 'success');
        Router.navigate('/trees');
      } else {
        showToast('Failed to create tree', 'error');
      }
    }
  } catch (error) {
    showToast(error.message || 'Operation failed', 'error');
  } finally {
    showLoading(false);
  }
}

async function loadTreeData(treeCode) {
  try {
    const response = await API.trees.get(treeCode);
    if (response.success && response.data) {
      const tree = response.data;

      document.getElementById('species_id').value = tree.species_id;
      document.getElementById('location_id').value = tree.location_id;
      document.getElementById('planting_date').value = tree.planting_date;
      document.getElementById('height_meters').value = tree.height_meters;
      document.getElementById('diameter_cm').value = tree.diameter_cm;
      document.getElementById('notes').value = tree.notes || '';
    }
  } catch (error) {
    showToast('Failed to load tree data', 'error');
    Router.navigate('/trees');
  }
}
