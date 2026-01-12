const net = require('net');

const port = 7878;
const host = '127.0.0.1';

const client = new net.Socket();

client.connect(port, host, () => {
    console.log(`Connected to SawitDB at ${host}:${port}`);
    const query = "LAHAN trees";
    console.log(`Sending: ${query}`);
    client.write(query);
});

client.on('data', (data) => {
    console.log('Received raw data:');
    console.log(data.toString());

    try {
        const json = JSON.parse(data.toString());
        console.log('Parsed JSON:', JSON.stringify(json, null, 2));
    } catch (e) {
        console.log('Failed to parse JSON:', e.message);
    }
    client.destroy();
});

client.on('close', () => {
    console.log('Connection closed');
});

client.on('error', (err) => {
    console.error('Connection error:', err.message);
});
