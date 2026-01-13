const net = require('net');

const client = new net.Socket();
const PORT = 7878;
const HOST = '127.0.0.1';

client.connect(PORT, HOST, () => {
    console.log('Connected to SawitDB TCP Server');
    // Send query to fetch ALL trees
    client.write('PANEN * DARI trees\n');
});

client.on('data', (data) => {
    try {
        const response = JSON.parse(data.toString());
        console.log('Response received:');
        if (response.success && response.data) {
            console.log(`Count: ${response.data.length} trees`);
            response.data.forEach(t => {
                console.log(`- [${t.code}] ${t.species_id || t.nama_pohon} (${t.status})`);
            });
        } else {
            console.log('Error or empty:', response);
        }
    } catch (e) {
        console.error('Failed to parse response:', data.toString());
    }
    client.destroy();
});

client.on('close', () => {
    console.log('Connection closed');
});

client.on('error', (err) => {
    console.error('Connection error:', err.message);
});
