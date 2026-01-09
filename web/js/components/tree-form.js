// Tree Form Component - Create/Edit Tree
function renderTreeForm(treeCode = null) {
    const isEdit = !!treeCode;
    const title = isEdit ? 'Edit Tree' : 'Create New Tree';

    const html = `
    <div class="min-h-screen bg-gray-50">
      <!-- Navbar -->
      <nav class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center space-x-4">
              <a href="#/trees" class="text-gray-600 hover:text-gray-900">← Back to Trees</a>
              <h1 class="text-xl font-bold text-gray-900">${title}</h1>
            </div>
            <button onclick="Auth.logout()" class="px-4 py-2 text-red-600 hover:text-red-800">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <!-- Form Container -->
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-white rounded-lg shadow p-6">
          <form id="tree-form" class="space-y-6">
            <!-- Species -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Species *
              </label>
              <select id="species_id" name="species_id" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" required>
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
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <select id="location_id" name="location_id" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" required>
                <option value="">Select location...</option>
                <option value="LOC001">Taman Kota A</option>
                <option value="LOC002">Hutan Lindung B</option>
                <option value="LOC003">Area Konservasi C</option>
              </select>
            </div>

            <!-- Planting Date -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Planting Date *
              </label>
              <input
                type="date"
                id="planting_date"
                name="planting_date"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <!-- Height -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Height (meters) *
              </label>
              <input
                type="number"
                id="height_meters"
                name="height_meters"
                step="0.1"
                min="0"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g. 5.5"
                required
              />
            </div>

            <!-- Diameter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Diameter (cm) *
              </label>
              <input
                type="number"
                id="diameter_cm"
                name="diameter_cm"
                step="0.1"
                min="0"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g. 25.5"
                required
              />
            </div>

            <!-- Notes -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows="4"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Additional notes about this tree..."
              ></textarea>
            </div>

            <!-- Buttons -->
            <div class="flex space-x-4">
              <button
                type="submit"
                class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                ${isEdit ? 'Update Tree' : 'Create Tree'}
              </button>
              <a
                href="#/trees"
                class="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
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
    document.getElementById('tree-form').addEventListener('submit', (e) => handleTreeFormSubmit(e, isEdit, treeCode));

    // If edit mode, load tree data
    if (isEdit) {
        loadTreeData(treeCode);
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
