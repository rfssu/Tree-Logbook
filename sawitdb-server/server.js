const SawitDB = require('@wowoengine/sawitdb');

// Create database instance with file path
const db = new SawitDB('tree_logbook.sawit');

async function startServer() {
    try {
        console.log('🌾 SawitDB Engine initialized');
        console.log('📁 Database file: tree_logbook.sawit');
        console.log('✅ Ready to accept queries!');
        console.log('');
        console.log('Press Ctrl+C to stop');

        // Keep process alive
        process.on('SIGINT', async () => {
            console.log('\n👋 Closing database...');
            await db.close();
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ Failed to start:', error.message);
        process.exit(1);
    }
}

startServer();
