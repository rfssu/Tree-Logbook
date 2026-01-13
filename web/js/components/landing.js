async function renderLandingPage() {
    render(`
        <div class="min-h-screen bg-gradient-to-br from-lime-600 via-green-600 to-emerald-600 flex items-center justify-center p-6">
            
            <!-- Grid Pattern Background -->
            <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>

            <!-- Main Card -->
            <div class="relative max-w-sm p-8 bg-white rounded-xl shadow-lg">
                
                <!-- Logo Section -->
                <div class="text-center mb-2">
                    <img src="/assets/pantaupohon.png" alt="PANTAUPOHON Logo" class="h-40 mx-auto mb-2" />
                </div>

                <!-- Scanner Button -->
                <div class="flex justify-center mb-2">
                    <button onclick="startQRScanner()" class="w-full relative px-6 py-3 bg-green-600 text-white font-semibold rounded-lg overflow-hidden group focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 hover:bg-green-700">
                        <span class="relative z-10 flex items-center justify-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path>
                            </svg>
                            Scan QR Code
                        </span>
                        <div class="absolute inset-0 bg-green-400 opacity-0 group-hover:opacity-30 group-hover:animate-ping rounded-lg"></div>
                        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    </button>
                </div>

                <!-- Description -->
                <div class="text-center">
                    <p class="text-xs text-gray-500 leading-relaxed">
                        Pindai QR Code pada pohon untuk melihat kondisi terkini
                    </p>
                </div>

            </div>

        </div>
    `);
}

let html5QrCode = null;

function startQRScanner() {
    // Create modal
    const modal = document.createElement('div');
    modal.id = 'qr-scanner-modal';
    modal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="relative w-full max-w-md bg-white rounded-xl p-6">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-bold text-gray-900">Scan QR Code</h3>
                <button onclick="stopQRScanner()" class="text-gray-500 hover:text-gray-700">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <div id="qr-reader" class="w-full rounded-lg overflow-hidden bg-black min-h-[250px] relative"></div>
            
            <div class="mt-4 pt-4 border-t border-gray-100">
                <p class="text-xs text-center text-gray-500 mb-3">- ATAU UPLOAD GAMBAR -</p>
                <label class="flex items-center justify-center w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 border border-gray-200 transition-colors group">
                    <svg class="w-5 h-5 mr-2 text-gray-400 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <span class="text-sm font-medium">Pilih Foto QR Code</span>
                    <input type="file" accept="image/*" class="hidden" onchange="handleFileScan(this)">
                </label>
            </div>

        </div>
    `;

    document.body.appendChild(modal);

    // Initialize scanner
    html5QrCode = new Html5Qrcode("qr-reader");

    const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
    };

    html5QrCode.start(
        { facingMode: "environment" }, // Use back camera
        config,
        (decodedText) => {
            // Success callback
            onScanSuccess(decodedText);
        },
        (errorMessage) => {
            // Error callback (can be ignored)
        }
    ).catch((err) => {
        console.error('Unable to start scanning', err);
        // showToast('Gagal mengakses kamera. Gunakan fitur upload.', 'warning'); // Optional toast
        // Don't close modal, show fallback UI
        const reader = document.getElementById('qr-reader');
        if (reader) {
            reader.innerHTML = `
                <div class="h-64 flex flex-col items-center justify-center bg-gray-100 text-gray-500 p-4 text-center">
                    <svg class="w-12 h-12 mb-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
                    <p class="text-xs mt-2 text-green-600 font-bold">⬇️ Gunakan Upload Gambar di bawah ⬇️</p>
                </div>
            `;
        }
    });
}

function onScanSuccess(decodedText) {
    console.log(`QR Code detected: ${decodedText}`);
    stopQRScanner();
    showToast(`QR Code terdeteksi: ${decodedText}`, 'success');
    Router.navigate(`/trees/${decodedText}`);
}

function handleFileScan(input) {
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const html5QrCode = new Html5Qrcode("qr-reader");

    html5QrCode.scanFile(file, true)
        .then(decodedText => {
            onScanSuccess(decodedText);
        })
        .catch(err => {
            showToast('Tidak ada QR Code valid di gambar ini.', 'error');
            console.error(err);
        });
}

function stopQRScanner() {
    if (html5QrCode) {
        try {
            if (html5QrCode.isScanning) {
                html5QrCode.stop().then(() => {
                    html5QrCode.clear();
                    html5QrCode = null;
                });
            } else {
                html5QrCode.clear();
                html5QrCode = null;
            }
        } catch (e) {
            html5QrCode = null;
        }
    }

    const modal = document.getElementById('qr-scanner-modal');
    if (modal) {
        modal.remove();
    }
}

window.renderLandingPage = renderLandingPage;
window.startQRScanner = startQRScanner;
window.stopQRScanner = stopQRScanner;
window.handleFileScan = handleFileScan;

