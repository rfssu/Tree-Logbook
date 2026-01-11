const SawitDB = require('@wowoengine/sawitdb');
const net = require('net');

// Database instance
const db = new SawitDB('tree_logbook.sawit');

// TCP Server
const server = net.createServer((socket) => {
    console.log('📡 Client connected:', socket.remoteAddress);

    // Handle incoming queries
    socket.on('data', async (data) => {
        try {
            const query = data.toString().trim();
            console.log('🔍 Query received:', query);

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
