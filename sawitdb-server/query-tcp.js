const net = require('net');

// Connect to SawitDB TCP server
const client = new net.Socket();
const PORT = 5555;
const HOST = 'localhost';

function sendQuery(query) {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();

        client.connect(PORT, HOST, () => {
            console.log(`\n📡 Sending query: ${query}\n`);
            client.write(query);
        });

        let data = '';
        client.on('data', (chunk) => {
            data += chunk.toString();
        });

        client.on('end', () => {
            try {
                const result = JSON.parse(data);
                resolve(result);
            } catch (e) {
                resolve(data);
            }
        });

        client.on('error', reject);
    });
}

async function viewDatabase() {
    try {
        console.log('📊 === SAWITDB CONTENT VIEWER (via TCP) ===');

        // Query 1: Get all trees
        console.log('\n🌳 TREES TABLE:');
        const treesResult = await sendQuery('PANEN * DARI trees BATAS 5');
        console.log('Result:', JSON.stringify(treesResult, null, 2));

        // Query 2: Get monitoring logs
        console.log('\n\n📝 MONITORING LOGS TABLE:');
        const logsResult = await sendQuery('PANEN * DARI monitoring_logs BATAS 5');
        console.log('Result:', JSON.stringify(logsResult, null, 2));

        // Query 3: Count total
        console.log('\n\n📊 COUNTS:');
        const countTrees = await sendQuery('PANEN HITUNG(*) DARI trees');
        console.log('Total Trees:', countTrees);

        const countLogs = await sendQuery('PANEN HITUNG(*) DARI monitoring_logs');
        console.log('Total Logs:', countLogs);

    } catch (error) {
        console.error('❌ Error:', error.message);
    }

    process.exit(0);
}

console.log('🔌 Connecting to SawitDB server on localhost:5555...');
viewDatabase();
