// View-only modal for dead trees
let lastUpdatedTimer = null;

async function openViewModal(code) {
    showLoading(true);
    try {
        const response = await API.trees.get(code);
        if (response.success && response.data) {
            const tree = response.data;
            document.getElementById('update-tree-code').value = code;
            document.getElementById('current-tree-code').textContent = tree.code;
            document.getElementById('current-tree-status').innerHTML = `<span class="px-2 py-1 rounded-full text-xs badge-${tree.status.toLowerCase()}">${tree.status}</span>`;
            document.getElementById('current-tree-health').innerHTML = `<span class="font-semibold text-gray-500">${tree.health_score}%</span>`;
            document.getElementById('current-tree-height').textContent = tree.height_meters + 'm';

            // Function to update "Last Updated" timestamp
            const updateLastUpdatedTime = () => {
                const updated = new Date(tree.updated_at);
                const now = new Date();
                const isToday = updated.toDateString() === now.toDateString();

                let timeDisplay;
                if (isToday) {
                    // Today: show time only (HH:mm:ss)
                    timeDisplay = updated.toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                    });
                } else {
                    // Other days: show date + time
                    timeDisplay = updated.toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    });
                }

                document.getElementById('last-updated-time').textContent = timeDisplay;
            };

            // Initial update
            updateLastUpdatedTime();
            document.getElementById('last-updated-by').textContent = tree.registered_by || 'System';

            // Clear existing timer
            if (lastUpdatedTimer) {
                clearInterval(lastUpdatedTimer);
            }

            // Auto-refresh every 30 seconds
            lastUpdatedTimer = setInterval(() => {
                const modal = document.getElementById('update-modal');
                if (!modal || modal.classList.contains('hidden')) {
                    clearInterval(lastUpdatedTimer);
                    lastUpdatedTimer = null;
                    return;
                }
                updateLastUpdatedTime();
            }, 30000);

            // Set modal title
            const modalTitle = document.querySelector('#update-modal h3');
            if (modalTitle) modalTitle.textContent = `View Tree - ${code} (Dead)`;

            document.getElementById('update-status').value = tree.status;
            document.getElementById('update-notes').value = tree.notes || '';

            // Disable all inputs for dead trees
            document.getElementById('update-status').disabled = true;
            document.getElementById('update-notes').disabled = true;
            const submitBtn = document.getElementById('update-submit-btn');
            if (submitBtn) submitBtn.style.display = 'none';

            loadUpdateHistory(code);
            document.getElementById('update-modal').classList.remove('hidden');
        }
    } catch (e) {
        showToast('Failed to load tree', 'error');
    } finally {
        showLoading(false);
    }
}

