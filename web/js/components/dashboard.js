async function renderDashboard() {
    render(`
        <div class="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-900">
            <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
        </div>
    `);

    try {
        const response = await API.stats.get();
        if (!response.success) throw new Error(response.error);
        const stats = response.data;

        render(`
            <div class="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
                ${Navigation.renderNavbar('dashboard')}

                <div class="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <!-- Main Container -->
                    <div class="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-sm dark:shadow-none border border-gray-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
                        <div class="p-6 sm:p-8 space-y-8">
                            
                            <!-- 1. PREMIUM HEADER (Restored) -->
                            <div class="bg-gradient-to-r from-green-900 to-emerald-800 rounded-2xl p-8 shadow-lg relative overflow-hidden group">
                                <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div>
                                        <h1 class="text-3xl font-bold text-white mb-2 tracking-tight">PANTAUPOHON</h1>
                                        <p class="text-emerald-100/90 text-sm font-medium">Real-time plantation monitoring & analytics</p>
                                    </div>
                                    <div class="flex items-center gap-3">
                                        <button class="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-emerald-900/20 active:scale-95 flex items-center gap-2">
                                            <span>📥</span> Export Report
                                        </button>
                                    </div>
                                </div>
                                <div class="absolute right-0 top-0 h-64 w-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
                                <div class="absolute bottom-0 left-0 h-32 w-32 bg-green-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>
                            </div>

                            <!-- 2. Stat Cards (Grid 4) -->
                            <div class="grid grid-cols-2 lg:grid-cols-4 gap-8">
                                ${renderJokoCard('Total Trees', stats.total, '🌲', 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400')}
                                ${renderJokoCard('Healthy', stats.healthy, '🌿', 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400')}
                                ${renderJokoCard('Attention', stats.sick + stats.monitored, '⚠️', 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400')}
                                ${renderJokoCard('Critical', stats.dead, '💀', 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400')}
                            </div>

                            <!-- 3. Charts Section (Side-by-Side Locked) -->
                            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <!-- Growth Chart -->
                                <div class="lg:col-span-2 bg-gray-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm dark:shadow-none">
                                    <div class="flex justify-between items-center mb-6">
                                        <div>
                                            <h3 class="text-base font-semibold text-gray-900 dark:text-white">Growth Trends</h3>
                                            <p class="text-xs text-gray-500 dark:text-slate-400">Trees planted over time</p>
                                        </div>
                                         <div class="flex gap-2">
                                            <span class="px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-[10px] font-medium text-gray-500 dark:text-slate-400">Monthly</span>
                                         </div>
                                    </div>
                                    <div class="relative h-64 w-full">
                                        <canvas id="growthChart"></canvas>
                                    </div>
                                </div>

                                <!-- Health Distribution -->
                                <div class="bg-gray-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm dark:shadow-none flex flex-col">
                                    <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-2">Health Status</h3>
                                     <p class="text-xs text-gray-500 dark:text-slate-400 mb-4">Current condition summary</p>
                                    <div class="relative flex-1 flex justify-center items-center min-h-[200px]">
                                        <canvas id="healthChart"></canvas>
                                    </div>
                                </div>
                            </div>

                            <!-- 4. Bottom Widgets (Side-by-Side Locked) -->
                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <!-- Maintenance List -->
                                <div class="bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm dark:shadow-none flex flex-col h-full">
                                    <div class="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 flex justify-between items-center">
                                        <div class="flex items-center gap-2">
                                            <span class="text-lg">🛠️</span>
                                            <h3 class="text-base font-semibold text-gray-900 dark:text-white">Maintenance Required</h3>
                                        </div>
                                        <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 ring-1 ring-amber-500/20">
                                            ${(stats.maintenance || []).length} PENDING
                                        </span>
                                    </div>
                                    <div class="flex-1 overflow-y-auto max-h-80 divide-y divide-gray-100 dark:divide-slate-700/50 custom-scrollbar">
                                        ${renderMaintenanceList(stats.maintenance || [])}
                                    </div>
                                </div>

                                <!-- Recent Activity -->
                                <div class="bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm dark:shadow-none flex flex-col h-full">
                                     <div class="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50">
                                        <div class="flex items-center gap-2">
                                            <span class="text-lg">⚡</span>
                                            <h3 class="text-base font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
                                        </div>
                                    </div>
                                    <div class="p-6 space-y-6 flex-1 overflow-y-auto max-h-80 custom-scrollbar">
                                        <div class="flex gap-4 group">
                                            <div class="relative">
                                                 <div class="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 border border-green-100 dark:border-green-900/30 flex items-center justify-center text-green-600 dark:text-green-500 shadow-sm z-10 relative group-hover:scale-110 transition-transform">
                                                    🌱
                                                </div>
                                                <div class="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-full bg-gray-200 dark:bg-slate-700 -z-0"></div>
                                            </div>
                                            <div class="pb-2">
                                                <p class="text-sm font-semibold text-gray-900 dark:text-white">New Tree Registered</p>
                                                <p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Added to Block A via Mobile App</p>
                                                <p class="text-[10px] uppercase font-bold text-gray-400 mt-1 tracking-wider">Today, 10:23 AM</p>
                                            </div>
                                        </div>
                                        <div class="flex gap-4 group">
                                            <div class="relative">
                                                 <div class="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 border border-blue-100 dark:border-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-500 shadow-sm z-10 relative group-hover:scale-110 transition-transform">
                                                    🔄
                                                </div>
                                            </div>
                                            <div>
                                                <p class="text-sm font-semibold text-gray-900 dark:text-white">System Optimized</p>
                                                <p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Automatic cache clean & database backup</p>
                                                <p class="text-[10px] uppercase font-bold text-gray-400 mt-1 tracking-wider">Yesterday, 4:00 PM</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            <style>
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; border: 2px solid transparent; background-clip: content-box; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border: 2px solid transparent; background-clip: content-box; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
            </style>
        `);

        initCharts(stats);

    } catch (error) {
        console.error(error);
        render(`<div class="p-10 text-center text-red-500">Error loading dashboard</div>`);
    }
}

function renderJokoCard(title, value, icon, colorClass) {
    return `
        <div class="bg-gray-50 dark:bg-slate-900/50 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-500 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden">
            <div class="relative z-10 flex justify-between items-start mb-2">
                <div>
                    <h3 class="text-3xl font-bold text-gray-900 dark:text-white mb-1 group-hover:translate-x-1 transition-transform">${value}</h3>
                    <p class="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">${title}</p>
                </div>
                <div class="text-2xl opacity-80 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                    ${icon}
                </div>
            </div>
            <div class="absolute bottom-0 left-0 w-full h-1 bg-gray-200 dark:bg-slate-700">
                 <div class="h-full ${title === 'Healthy' ? 'bg-green-500' : (title === 'Attention' ? 'bg-amber-500' : 'bg-blue-500')} w-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
            </div>
        </div>
    `;
}

function renderMaintenanceList(list) {
    if (!list || list.length === 0) {
        return `
            <div class="h-64 flex flex-col items-center justify-center text-center p-6">
                <div class="h-16 w-16 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-3xl mb-4 animate-bounce">
                    🎉
                </div>
                <h3 class="text-sm font-bold text-gray-900 dark:text-white">All Clear!</h3>
                <p class="text-xs text-gray-500 dark:text-slate-400 mt-1 max-w-[200px]">Great job! All trees are healthy and up to date.</p>
            </div>
        `;
    }

    return list.map(item => `
        <div class="p-4 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer group border-l-4 border-transparent hover:border-amber-500" onclick="Router.navigate('/trees/${item.code}')">
            <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-2">
                    <span class="font-mono text-xs font-bold text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        ${item.code}
                    </span>
                    <span class="text-xs font-semibold text-gray-900 dark:text-white group-hover:text-green-600 transition-colors">
                        ${item.issue}
                    </span>
                </div>
                <span class="text-[10px] font-medium text-gray-400">
                    ${item.updated_at ? item.updated_at.split(' ')[0] : 'Just now'}
                </span>
            </div>
            <div class="flex items-center justify-between">
                <p class="text-xs text-gray-500 dark:text-slate-500 truncate pr-4">Requires immediate attention</p>
                <span class="h-2 w-2 rounded-full ${item.status === 'SAKIT' ? 'bg-red-500' : 'bg-amber-500'}"></span>
            </div>
        </div>
    `).join('');
}

function initCharts(stats) {
    const isDark = document.documentElement.classList.contains('dark') || true;
    const textColor = '#94a3b8'; // Slate 400

    // Growth Chart
    const growthCtx = document.getElementById('growthChart').getContext('2d');
    const growthLabels = Object.keys(stats.monthly_growth || {}).sort();
    const growthData = growthLabels.map(k => stats.monthly_growth[k]);

    new Chart(growthCtx, {
        type: 'line',
        data: {
            labels: growthLabels.length ? growthLabels : ['No Data'],
            datasets: [{
                label: 'Planted',
                data: growthData.length ? growthData : [0],
                borderColor: '#22c55e',
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
                    gradient.addColorStop(0, 'rgba(34, 197, 94, 0.2)');
                    gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
                    return gradient;
                },
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#166534',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(51, 65, 85, 0.1)', borderDash: [4, 4] }, ticks: { color: textColor, font: { size: 11 } } },
                x: { grid: { display: false }, ticks: { color: textColor, font: { size: 11 } } }
            },
            interaction: { mode: 'nearest', axis: 'x', intersect: false }
        }
    });

    // Health Chart
    const healthCtx = document.getElementById('healthChart').getContext('2d');
    new Chart(healthCtx, {
        type: 'doughnut',
        data: {
            labels: ['Healthy', 'Sick', 'Dead', 'Others'],
            datasets: [{
                data: [stats.healthy, stats.sick, stats.dead, stats.fertilized + stats.monitored],
                backgroundColor: ['#22c55e', '#f59e0b', '#ef4444', '#3b82f6'],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', labels: { color: textColor, usePointStyle: true, boxWidth: 8, font: { size: 11 }, padding: 15 } }
            },
            cutout: '75%',
            layout: { padding: 10 }
        }
    });
}
