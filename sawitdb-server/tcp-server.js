const SawitDB = require('@wowoengine/sawitdb');
const net = require('net');
const path = require('path');

// Database instance - use absolute path relative to this script
const dbPath = path.join(__dirname, 'tree_logbook.sawit');
console.log('📂 Loading database from:', dbPath);
const db = new SawitDB(dbPath);

// TCP Server
const server = net.createServer((socket) => {
    console.log('📡 Client connected:', socket.remoteAddress);

    // Handle incoming queries
    socket.on('data', async (data) => {
        try {
            const query = data.toString().trim();
            console.log('🔍 Query received:', query);

            // SAFETY PATCH: Ignore LAHAN commands (prevent reset)
            // SAFETY PATCH: Smart LAHAN Handling (Corrected)
            // SAFETY PATCH: Smart LAHAN Handling (Corrected V2)
            if (query.toUpperCase().startsWith('LAHAN')) {
                try {
                    // Check if table exists by trying to read
                    const check = await db.query('PANEN * DARI trees BATAS 1');

                    // SawitDB returns string "Error: ..." if table missing, NOT throws.
                    const isError = typeof check === 'string' && check.startsWith('Error');

                    // If NO Error and IS Array -> Table Exists -> BLOCK
                    if (!isError && Array.isArray(check)) {
                        console.log('🛡️ PROTECTED: Table exists. Ignoring destructive LAHAN command');
                        const response = JSON.stringify({
                            success: true,
                            data: [],
                            message: "Collection verified (Simulated)",
                            timestamp: new Date().toISOString()
                        });
                        socket.write(response + '\n');
                        return; // BLOCK command
                    }

                    console.log('⚠️ INITIALIZING: Table missing (Check returned error). Allowing LAHAN to create it.');
                    // Fallthrough to execute db.query(query) below (ALLOW Create)

                } catch (e) {
                    console.log('⚠️ INITIALIZING: Shield check failed safely. Allowing LAHAN.');
                }
            }

            // Execute query on SawitDB
            const result = await db.query(query);

            // Send response as JSON
            const response = JSON.stringify({
                success: true,
                data: result,
                timestamp: new Date().toISOString()
            });

            socket.write(response + '\n');
            console.log('✅ Response sent');

        } catch (error) {
            console.error('❌ Query error:', error.message);

            const errorResponse = JSON.stringify({
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            });

            socket.write(errorResponse + '\n');
        }
    });

    socket.on('end', () => {
        console.log('👋 Client disconnected');
    });

    socket.on('error', (err) => {
        console.error('🚨 Socket error:', err.message);
    });
});

const PORT = process.env.SAWIT_PORT || 7878;
const HOST = process.env.SAWIT_HOST || '127.0.0.1';

server.listen(PORT, HOST, () => {
    console.log('🌾 SawitDB TCP Server started');
    console.log('📡 Listening on:', `${HOST}:${PORT}`);
    console.log('📁 Database:', 'tree_logbook.sawit');
    console.log('');
    console.log('✅ Ready to accept Go client connections!');
    console.log('Press Ctrl+C to stop');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n👋 Shutting down...');
    server.close();
    await db.close();
    console.log('✅ Server closed cleanly');
    process.exit(0);
});
