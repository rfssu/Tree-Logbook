const net = require('net');

const PORT = 7878;
const HOST = '127.0.0.1';

const dummyTrees = [
    {
        id: "550e8400-e29b-41d4-a716-446655440001",
        code: "TREE-001",
        species_id: "Kelapa Sawit (Elaeis guineensis)",
        location_id: "Blok A - Baris 1",
        planting_date: "2020-01-15T00:00:00Z",
        age_years: 4,
        height_meters: 5.2,
        diameter_cm: 45.0,
        status: "SEHAT",
        health_score: 92,
        notes: "Pertumbuhan optimal, tidak ada hama, pemupukan teratur",
        registered_by: "admin",
        registered_by_username: "admin", // Added for UI
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2026-01-13T00:00:00Z"
    },
    {
        id: "550e8400-e29b-41d4-a716-446655440002",
        code: "TREE-002",
        species_id: "Kelapa Sawit (Elaeis guineensis)",
        location_id: "Blok A - Baris 2",
        planting_date: "2019-06-20T00:00:00Z",
        age_years: 5,
        height_meters: 4.8,
        diameter_cm: 38.0,
        status: "SAKIT",
        health_score: 65,
        notes: "Daun menguning, membutuhkan pemupukan tambahan dan perawatan khusus",
        registered_by: "admin",
        registered_by_username: "admin",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2026-01-12T00:00:00Z"
    },
    {
        id: "550e8400-e29b-41d4-a716-446655440003",
        code: "TREE-003",
        species_id: "Kelapa Sawit (Elaeis guineensis)",
        location_id: "Blok B - Baris 1",
        planting_date: "2021-03-10T00:00:00Z",
        age_years: 3,
        height_meters: 3.5,
        diameter_cm: 28.0,
        status: "DIPANTAU",
        health_score: 75,
        notes: "Dalam tahap pemantauan intensif setelah pemupukan baru",
        registered_by: "admin",
        registered_by_username: "admin",
        created_at: "2024-02-01T00:00:00Z",
        updated_at: "2026-01-13T00:00:00Z"
    },
    {
        id: "550e8400-e29b-41d4-a716-446655440004",
        code: "TREE-004",
        species_id: "Jati (Tectona grandis)",
        location_id: "Blok C - Baris 1",
        planting_date: "2018-11-05T00:00:00Z",
        age_years: 6,
        height_meters: 8.5,
        diameter_cm: 62.0,
        status: "SEHAT",
        health_score: 88,
        notes: "Pertumbuhan bagus, batang kokoh, tidak ada serangan hama",
        registered_by: "admin",
        registered_by_username: "admin",
        created_at: "2024-01-15T00:00:00Z",
        updated_at: "2026-01-10T00:00:00Z"
    },
    {
        id: "550e8400-e29b-41d4-a716-446655440005",
        code: "TREE-005",
        species_id: "Mahoni (Swietenia macrophylla)",
        location_id: "Blok C - Baris 3",
        planting_date: "2022-08-20T00:00:00Z",
        age_years: 2,
        height_meters: 2.8,
        diameter_cm: 18.0,
        status: "DIPUPUK",
        health_score: 80,
        notes: "Baru selesai pemupukan NPK, diharapkan pertumbuhan lebih optimal",
        registered_by: "admin",
        registered_by_username: "admin",
        created_at: "2024-03-01T00:00:00Z",
        updated_at: "2026-01-13T00:00:00Z"
    }
];

// Helper to execute sequence of commands
async function runSeeding() {
    const socket = new net.Socket();

    return new Promise((resolve, reject) => {
        socket.connect(PORT, HOST, async () => {
            console.log('✅ Connected to SawitDB TCP Server');

            try {
                // 1. Ensure Collection Exists
                console.log('Creating/Verifying collection exists...');
                await sendCommand(socket, 'LAHAN trees');

                // 2. Insert Trees
                console.log('Inserting dummy trees...');
                for (const tree of dummyTrees) {
                    // Normalize date format to YYYY-MM-DD for consistency
                    const plantingDate = tree.planting_date.split('T')[0];
                    const createdAt = tree.created_at;
                    const updatedAt = tree.updated_at;

                    // Construct TANAM query (Standard AQL)
                    // Note: SawitDB strings must be single quoted
                    const query = `TANAM KE trees (
                        id, code, species_id, location_id, planting_date,
                        age_years, height_meters, diameter_cm, status,
                        health_score, notes, registered_by, created_at, updated_at
                    ) BIBIT (
                        '${tree.id}', '${tree.code}', '${tree.species_id}', '${tree.location_id}', '${plantingDate}',
                        ${tree.age_years}, ${tree.height_meters}, ${tree.diameter_cm}, '${tree.status}',
                        ${tree.health_score}, '${tree.notes}', '${tree.registered_by}', '${createdAt}', '${updatedAt}'
                    )`;

                    await sendCommand(socket, query.replace(/\s+/g, ' ').trim());
                    console.log(`- Inserted: ${tree.code} (${tree.status})`);
                }

                console.log('\n🎉 Seeding Complete via TCP!');
                socket.end();
                resolve();
            } catch (err) {
                console.error('❌ Seeding failed:', err);
                socket.destroy();
                resolve(); // Don't crash main process
            }
        });

        socket.on('error', (err) => {
            console.error('Connection Error:', err.message);
            resolve();
        });
    });
}

// Promisified Socket Write/Read
function sendCommand(socket, command) {
    return new Promise((resolve, reject) => {
        const onData = (data) => {
            const str = data.toString().trim();
            // Basic error checking from server response
            try {
                const json = JSON.parse(str);
                if (json.success === false) {
                    console.warn('  ⚠️ Server Warning:', json.error);
                    // We don't verify full failure here to allow idempotency
                }
            } catch (e) {
                // Ignore parsing errors for now
            }

            socket.removeListener('data', onData);
            resolve();
        };

        socket.on('data', onData);
        socket.write(command + '\n');
    });
}

runSeeding();
