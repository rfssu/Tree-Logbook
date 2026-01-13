// Simple test to check if QRCode library loads
console.log('Testing QRCode library...');

window.addEventListener('load', () => {
    setTimeout(() => {
        console.log('QRCode available?', typeof window.QRCode);
        console.log('QRCode object:', window.QRCode);

        if (typeof window.QRCode !== 'undefined') {
            console.log('✅ QRCode.js loaded successfully!');
        } else {
            console.error('❌ QRCode.js NOT loaded!');
            console.log('Attempting manual load...');

            // Fallback: load from different CDN
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
            script.onload = () => console.log('✅ QRCode loaded from fallback CDN');
            script.onerror = () => console.error('❌ Fallback CDN also failed');
            document.head.appendChild(script);
        }
    }, 1000);
});
