// Public Tree Detail Component (View Only - Strict Login Template Style)
async function renderTreeDetail(params) {
    const code = (typeof params === 'object' && params !== null) ? params.code : params;

    if (!code || typeof code === 'object') {
        Router.navigate('/');
        return;
    }

    // Loading State
    render(`
        <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-12">
            <div class="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-lime-600"></div>
        </div>
    `);

    try {
        const response = await API.trees.get(code);

        if (!response.success) {
            throw new Error(response.error || 'Tree not found');
        }

        const tree = response.data;
        const isAuthenticated = Auth.isAuthenticated();

        // Template Structure from User Request
        render(`
            <div class="min-h-screen bg-gradient-to-br from-lime-600 via-green-600 to-emerald-600 flex items-center justify-center px-4 py-12 font-sans transition-colors duration-300">
              <div class="max-w-md w-full">
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-white/20">
                  
                  <!-- Header Section (Matches Icon + Title style) -->
                  <div class="text-center mb-8">
                    <div class="inline-flex items-center justify-center w-12 h-12 bg-lime-100 dark:bg-lime-900/40 rounded-xl mb-4 relative">
                        ${tree.status === 'SEHAT'
                ? `<svg class="w-6 h-6 text-lime-600 dark:text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`
                : tree.status === 'SAKIT'
                    ? `<svg class="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`
                    : `<svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
            }
                    </div>
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white capitalize">${tree.species_id || 'Unknown Species'}</h2>
                    <p class="text-gray-600 dark:text-gray-400 mt-2 flex items-center justify-center gap-2">
                        <span class="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs font-bold">#${tree.code}</span>
                        <span>at ${tree.location_id || '-'}</span>
                    </p>
                  </div>

                  <!-- Main Content (Replaces Form) -->
                  <div class="space-y-6">
                    
                    <!-- Stats Grid (Mimics Input Fields) -->
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tinggi (m)
                          </label>
                          <div class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-bold text-lg flex items-center justify-between">
                            ${tree.height_meters}
                            <span class="text-gray-400 text-sm font-normal">meters</span>
                          </div>
                        </div>

                        <div>
                          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Diameter (cm)
                          </label>
                          <div class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-bold text-lg flex items-center justify-between">
                            ${tree.diameter_cm}
                            <span class="text-gray-400 text-sm font-normal">cm</span>
                          </div>
                        </div>
                    </div>

                    <!-- Health Section (Mimics Field Format) -->
                    <div>
                      <div class="flex items-center justify-between mb-2">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Health Condition
                        </label>
                        <span class="text-sm font-medium ${tree.health_score >= 80 ? 'text-lime-600' : tree.health_score >= 50 ? 'text-yellow-600' : 'text-red-600'}">
                          ${tree.health_score}% Score
                        </span>
                      </div>
                      
                      <!-- Health Box -->
                      <div class="w-full px-4 py-4 border rounded-lg flex items-center gap-4 ${tree.health_score >= 80 ? 'bg-lime-50 dark:bg-lime-900/20 border-lime-200 dark:border-lime-700' :
                tree.health_score >= 50 ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700' :
                    'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
            }">
                        <div class="relative w-12 h-12 flex-shrink-0">
                             <svg class="w-full h-full transform -rotate-90">
                                <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="4" fill="transparent" class="${tree.health_score >= 80 ? 'text-lime-200 dark:text-lime-800' :
                tree.health_score >= 50 ? 'text-yellow-200 dark:text-yellow-800' :
                    'text-red-200 dark:text-red-800'
            }" />
                                <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="4" fill="transparent" stroke-dasharray="125.6" stroke-dashoffset="${125.6 - ((tree.health_score / 100) * 125.6)}" class="${tree.health_score >= 80 ? 'text-lime-500' :
                tree.health_score >= 50 ? 'text-yellow-500' :
                    'text-red-500'
            }" stroke-linecap="round" />
                            </svg>
                        </div>
                        <div class="flex-1">
                            <div class="flex justify-between items-start">
                                <p class="text-sm font-bold mb-0.5 ${tree.health_score >= 80 ? 'text-lime-700 dark:text-lime-300' :
                tree.health_score >= 50 ? 'text-yellow-700 dark:text-yellow-300' :
                    'text-red-700 dark:text-red-300'
            }">
                                    ${tree.health_score >= 80 ? 'Sangat Sehat' : tree.health_score >= 50 ? 'Cukup Sehat' : 'Perlu Perhatian'}
                                </p>
                                <span class="px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${tree.health_score >= 80 ? 'bg-lime-100/50 border-lime-300 text-lime-800 dark:text-lime-200' :
                tree.health_score >= 50 ? 'bg-yellow-100/50 border-yellow-300 text-yellow-800 dark:text-yellow-200' :
                    'bg-red-100/50 border-red-300 text-red-800 dark:text-red-200'
            }">
                                    ${tree.status}
                                </span>
                            </div>
                            <p class="text-xs opacity-80 leading-tight ${tree.health_score >= 80 ? 'text-lime-600 dark:text-lime-400' :
                tree.health_score >= 50 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
            }">
                                Updated: ${tree.updated_at ? new Date(tree.updated_at).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Notes (Textarea Style) -->
                    ${tree.notes ? `
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Notes
                        </label>
                        <div class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 italic">
                            "${tree.notes}"
                        </div>
                    </div>
                    ` : ''}

                  <!-- Footer Links (Modified from Template) -->
                  <div class="mt-6">
                    <div class="relative">
                      <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-gray-300 dark:border-gray-700"></div>
                      </div>
                      <div class="relative flex justify-center text-sm">
                        <span class="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                          Planting Year
                        </span>
                      </div>
                    </div>

                    <div class="mt-6">
                      <div class="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <span class="mr-2">📅</span> ${tree.planting_date ? new Date(tree.planting_date).getFullYear() : '-'}
                      </div>
                    </div>
                  </div>

                  <p class="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                    Need help?
                    <a href="#" class="font-medium text-lime-600 dark:text-lime-400 hover:text-lime-500 dark:hover:text-lime-300">
                      Contact Admin
                    </a>
                  </p>
                </div>
              </div>
            </div>
        `);

    } catch (error) {
        console.error('Error loading tree detail:', error);
        // Error Template
        render(`
            <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-12">
              <div class="max-w-md w-full text-center">
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                     <div class="inline-flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-xl mb-4">
                        <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Tree Not Found</h2>
                    <p class="text-gray-600 dark:text-gray-400 mb-6">Could not find data for this QR code.</p>
                    <button onclick="Router.navigate('/')" class="w-full bg-lime-600 text-white py-3 rounded-lg font-medium hover:bg-lime-700">Scan Again</button>
                </div>
              </div>
            </div>
        `);
    }
}
