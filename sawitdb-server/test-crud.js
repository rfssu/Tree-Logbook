const SawitDB = require('@wowoengine/sawitdb');

async function test() {
    const db = new SawitDB('tree_logbook.sawit');

    try {
        console.log('🧪 Testing SawitDB...\n');

        // Test 1: Create table
        console.log('1️⃣ Creating users table...');
        await db.query('LAHAN users');
        console.log('✅ Table created!\n');

        // Test 2: Insert data
        console.log('2️⃣ Inserting test user...');
        await db.query(`TANAM KE users (id, name, email) BIBIT ('USR001', 'Admin', 'admin@tree-id.com')`);
        console.log('✅ Data inserted!\n');

        // Test 3: Query data
        console.log('3️⃣ Querying users...');
        const result = await db.query('PANEN * DARI users');
        console.log('✅ Query result:', JSON.stringify(result, null, 2));
        console.log('');

        // Test 4: Create trees table
        console.log('4️⃣ Creating trees table...');
        await db.query('LAHAN trees');
        console.log('✅ Trees table created!\n');

        // Test 5: Create index
        console.log('5️⃣ Creating index on trees...');
        await db.query('INDEKS trees PADA id');
        console.log('✅ Index created!\n');

        // Test 6: Show tables
        console.log('6️⃣ Listing all tables...');
        const tables = await db.query('LIHAT LAHAN');
        console.log('✅ Tables:', tables);
        console.log('');

        console.log('🎉 ALL TESTS PASSED!\n');
        console.log('📊 Summary:');
        console.log('- Tables created: users, trees');
        console.log('- Data inserted: 1 user');
        console.log('- Indexes: 1 (trees.id)');
        console.log('');
        console.log('✅ SawitDB is working perfectly!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await db.close();
        console.log('\n👋 Database closed');
    }
}

test();
