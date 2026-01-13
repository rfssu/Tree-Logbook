const SawitDB = require('@wowoengine/sawitdb');
const path = require('path');
const fs = require('fs');

const testDbPath = path.join(__dirname, 'test_persistence.sawit');

async function runTest() {
    console.log('🧪 Starting Offline Persistence Test');

    // Clean start
    if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);

    // ROUND 1: Init and Fill
    console.log('\n--- Round 1: Init & Seed ---');
    const db1 = new SawitDB(testDbPath);
    await db1.query('LAHAN trees'); // Create table
    await db1.query('TANAM KE trees (code, status) BIBIT ("T1", "GROWING")');
    const res1 = await db1.query('PANEN * DARI trees');
    console.log('Round 1 Result:', res1.length, 'trees. (Expect 1)');
    // Simulate close (SawitDB doesn't have explicit close, but we drop reference)

    // ROUND 2: Re-open and Read (Simulate Restart)
    console.log('\n--- Round 2: Re-open & Read ---');
    const db2 = new SawitDB(testDbPath);
    try {
        const res2 = await db2.query('PANEN * DARI trees');
        console.log('Round 2 Result (Direct Read):', res2.length, 'trees.');
    } catch (e) {
        console.log('Round 2 Failed (Direct Read):', e.message);
        console.log('-> Conclusion: SawitDB does NOT auto-load tables on start.');

        // ROUND 3: Re-create and Read (The "Soft Init")
        console.log('\n--- Round 3: Run LAHAN & Read ---');
        await db2.query('LAHAN trees');
        const res3 = await db2.query('PANEN * DARI trees');
        console.log('Round 3 Result (After LAHAN):', res3.length, 'trees.');

        if (res3.length === 0) {
            console.log('🚨 CRITICAL: LAHAN WIPED THE DATA!');
        } else {
            console.log('✅ SUCCESS: LAHAN is safe (Idempotent/If-Not-Exists).');
        }
    }
}

runTest();
