const usersList = {
    users: [],

    async init() {
        console.log('Initializing Users List...');
        this.renderSkeleton();
        await this.loadUsers();
    },

    renderSkeleton() {
        const breadcrumbs = Navigation.getBreadcrumbs('users');
        const html = `
      <div class="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
        ${Navigation.renderNavbar('users', breadcrumbs)}

        <div class="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div class="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-sm dark:shadow-none border border-gray-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
            <div class="p-6">
              <!-- Header -->
              <div class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div>
                  <h2 class="text-2xl font-bold text-gray-900 dark:text-white">User Management</h2>
                  <p class="text-sm text-gray-600 dark:text-slate-400 mt-1">Manage system access and roles</p>
                </div>
                <button onclick="usersList.openCreateModal()" class="flex items-center gap-2 px-6 py-3 bg-green-600 dark:bg-green-500 text-white rounded-xl hover:bg-green-700 dark:hover:bg-green-400 transition-all shadow-lg shadow-green-500/20 font-medium cursor-pointer">
                  <span>+</span> New User
                </button>
              </div>

              <!-- Table -->
              <div class="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead class="bg-gray-50 dark:bg-slate-800/80">
                      <tr>
                        <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                        <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                        <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                        <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Registered</th>
                        <th scope="col" class="relative px-6 py-4">
                          <span class="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody id="users-table-body" class="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                      <tr>
                        <td colspan="5" class="px-6 py-12 text-center text-gray-500 dark:text-slate-400">
                          <div class="flex justify-center items-center gap-2">
                            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
                            Loading users...
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create User Modal -->
      <div id="create-user-modal" class="hidden fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true" onclick="usersList.closeCreateModal()">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-gray-900/75 dark:bg-black/80 backdrop-blur-sm transition-opacity"></div>

        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <div class="relative transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 text-left shadow-xl transition-all sm:w-full sm:max-w-lg border border-gray-200 dark:border-slate-700" onclick="event.stopPropagation()">
            <!-- Header -->
            <div class="bg-gray-50 dark:bg-slate-900/50 px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
               <h3 class="text-lg font-semibold text-gray-900 dark:text-white" id="modal-title">Create New User</h3>
               <button onclick="usersList.closeCreateModal()" class="text-gray-400 hover:text-gray-500 dark:hover:text-white transition-colors text-2xl leading-none">&times;</button>
            </div>
            
            <div class="px-6 py-6">
               <form id="create-user-form" onsubmit="usersList.handleCreateUser(event)">
                  <div class="space-y-4">
                      <div>
                          <label class="block text-sm font-medium text-gray-700 dark:text-slate-300">Username</label>
                          <input type="text" name="username" required class="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm">
                      </div>
                      <div>
                          <label class="block text-sm font-medium text-gray-700 dark:text-slate-300">Full Name</label>
                          <input type="text" name="full_name" required class="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm">
                      </div>
                      <div>
                          <label class="block text-sm font-medium text-gray-700 dark:text-slate-300">Email</label>
                          <input type="email" name="email" required class="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm">
                      </div>
                      <div>
                          <label class="block text-sm font-medium text-gray-700 dark:text-slate-300">Password</label>
                          <input type="password" name="password" required class="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm">
                      </div>
                  </div>
                  <div class="mt-8 flex justify-end gap-3">
                      <button type="button" onclick="usersList.closeCreateModal()" class="px-4 py-2 bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 font-medium transition-colors">Cancel</button>
                      <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium shadow-lg shadow-green-500/20 transition-all">Create User</button>
                  </div>
               </form>
            </div>
          </div>
        </div>
      </div>

    `;
        document.getElementById('main-content').innerHTML = html;
        // Re-run theme toggle script to ensure icons are correct? (Handled by Navigation render)
    },

    async loadUsers() {
        try {
            const response = await API.users.list();
            if (response.success) {
                this.users = response.data;
                this.renderTableBody();
            }
        } catch (error) {
            console.error('Failed to load users:', error);
            showToast('Failed to load users: ' + error.message, 'error');
        }
    },

    renderTableBody() {
        const tbody = document.getElementById('users-table-body');
        if (!tbody) return;

        if (this.users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-12 text-center text-gray-500 dark:text-slate-400">
                        No users found.
                    </td>
                </tr>`;
            return;
        }

        const currentUser = Storage.getUser();

        tbody.innerHTML = this.users.map(user => `
            <tr class="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-150 group">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-4">
                        <div class="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white dark:ring-slate-700">
                            ${user.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div class="text-sm font-semibold text-gray-900 dark:text-white capitalize">${user.full_name}</div>
                            <div class="text-xs text-gray-500 dark:text-slate-400 font-mono">@${user.username}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="relative inline-block">
                        <select onchange="usersList.handleRoleChange('${user.id}', this.value)" 
                                class="appearance-none text-xs font-bold px-4 py-1.5 rounded-full border-0 focus:ring-2 focus:ring-offset-2 focus:ring-green-500 cursor-pointer transition-all uppercase tracking-wider ${this.getRoleBadgeColor(user.role)} disabled:opacity-80 disabled:cursor-not-allowed"
                                ${user.id === currentUser.id ? 'disabled title="Cannot change your own role"' : ''}>
                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''} class="bg-white dark:bg-slate-800 text-gray-900 dark:text-white">ADMIN</option>
                            <option value="editor" ${user.role === 'editor' ? 'selected' : ''} class="bg-white dark:bg-slate-800 text-gray-900 dark:text-white">EDITOR</option>
                        </select>
                        <!-- Custom Arrow for non-disabled -->
                         ${user.id !== currentUser.id ? `
                        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-50">
                            <svg class="h-3 w-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                        </div>` : ''}
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                   <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300'}">
                     ${user.is_active ? 'Active' : 'Inactive'}
                   </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                    ${new Date(user.created_at).toLocaleDateString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    ${user.id !== currentUser.id ? `
                    <button onclick="usersList.handleDelete('${user.id}')" class="text-gray-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-rose-400 p-2 hover:bg-red-50 dark:hover:bg-rose-900/20 rounded-lg transition-all transform hover:scale-110 active:scale-95" title="Delete User">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                    ` : '<span class="text-xs font-bold text-gray-300 dark:text-slate-600 select-none">YOU</span>'}
                </td>
            </tr>
        `).join('');
    },

    getRoleBadgeColor(role) {
        // High contrast colors for both modes
        switch (role) {
            case 'admin': return 'bg-violet-100 text-violet-700 dark:bg-violet-500/30 dark:text-violet-200 ring-1 ring-violet-500/50';
            case 'editor': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/30 dark:text-blue-200 ring-1 ring-blue-500/50';
            case 'viewer': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/30 dark:text-amber-200 ring-1 ring-amber-500/50';
            default: return 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300';
        }
    },

    openCreateModal() {
        document.getElementById('create-user-modal').classList.remove('hidden');
    },

    closeCreateModal() {
        document.getElementById('create-user-modal').classList.add('hidden');
        document.getElementById('create-user-form').reset();
    },

    async handleCreateUser(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await API.users.create(data);
            if (response.success) {
                showToast('User created successfully!', 'success');
                this.closeCreateModal();
                this.loadUsers();
            }
        } catch (error) {
            showToast(error.message, 'error');
        }
    },

    async handleRoleChange(userId, newRole) {
        try {
            await API.users.updateRole(userId, newRole);
            showToast('Role updated successfully', 'success');
            // Refresh to ensure state consistency (optional)
            this.loadUsers();
        } catch (error) {
            showToast('Failed to update role: ' + error.message, 'error');
            this.loadUsers(); // Revert UI
        }
    },

    async handleDelete(userId) {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            await API.users.delete(userId);
            showToast('User deleted successfully', 'success');
            this.loadUsers();
        } catch (error) {
            showToast('Failed to delete user: ' + error.message, 'error');
        }
    }
};

// Expose rendering function
window.renderUsersList = () => usersList.init();
