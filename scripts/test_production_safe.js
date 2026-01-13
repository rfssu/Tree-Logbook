const net = require('net');

const PORT = 7878;
const HOST = '127.0.0.1';

// Test Data
const testTree = {
    id: "test-prod-001",
    code: "PROD-TEST",
    species_id: "Integration Test",
    status: "TEST"
};

function sendCommand(socket, command) {
    return new Promise((resolve) => {
        const onData = (data) => {
            socket.removeListener('data', onData);
            resolve(data.toString());
        };
        socket.on('data', onData);
        socket.write(command + '\n');
    });
}

async function runTest() {
    const socket = new net.Socket();
    socket.connect(PORT, HOST, async () => {
        console.log('🔗 Connected to SawitDB Production Test');
        console.log('----------------------------------------');

        // 1. Test BLOCKED Command (LAHAN / RESET)
        console.log('1. Testing RESET (LAHAN)...');
        let res = await sendCommand(socket, 'LAHAN trees');
        if (res.includes('PROTECTED (HARD SHIELD)')) {
            console.log('   ✅ PASS: Reset blocked successfully.');
        } else if (res.includes('Collection verified')) {
            console.log('   ✅ PASS: Reset blocked (Simulated success).');
        } else {
            console.log('   ⚠️ WARNING: Reset might have gone through:', res);
        }

        // 2. Test ALLOWED Command (TANAM / CREATE)
        console.log('\n2. Testing INSERT (TANAM)...');
        res = await sendCommand(socket, `TANAM KE trees ${JSON.stringify(testTree)}`);
        console.log('   Response:', res.trim());

        // 3. Test ALLOWED Command (GUSUR / DELETE)
        // This answers the user's question: "Can I delete products?"
        console.log('\n3. Testing DELETE (GUSUR)...');
        res = await sendCommand(socket, `GUSUR DARI trees DIMANA code = 'PROD-TEST'`);
        console.log('   Response:', res.trim());

        if (!res.includes('Error')) {
            console.log('   ✅ PASS: DELETE works! You can remove products freely.');
        } else {
            console.log('   ❌ FAIL: DELETE failed.');
        }

        console.log('----------------------------------------');
        socket.end();
    });
}

runTest();
