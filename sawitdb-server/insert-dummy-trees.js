// Insert Dummy Trees into SawitDB
const SawitDB = require('@wowoengine/sawitdb');
const path = require('path');

const dbPath = path.join(__dirname, 'tree_logbook.sawit');
console.log('📂 Loading database from:', dbPath);
const db = new SawitDB(dbPath);

// Dummy trees data
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
        registered_by_username: "admin",
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

async function insertDummyData() {
    try {
        console.log('🌳 Starting to insert dummy trees...\n');

        // Create trees collection if not exists
        await db.query('LAHAN trees');
        console.log('✅ Collection "trees" ready\n');

        // Insert each tree
        for (const tree of dummyTrees) {
            const query = `TAMBAH trees ${JSON.stringify(tree)}`;
            await db.query(query);
            console.log(`✅ Inserted: ${tree.code} - ${tree.species_id} (${tree.status})`);
        }

        console.log('\n🎉 All dummy trees inserted successfully!');
        console.log('\n📋 Summary:');
        console.log('   TREE-001: Kelapa Sawit - SEHAT (92%)');
        console.log('   TREE-002: Kelapa Sawit - SAKIT (65%)');
        console.log('   TREE-003: Kelapa Sawit - DIPANTAU (75%)');
        console.log('   TREE-004: Jati - SEHAT (88%)');
        console.log('   TREE-005: Mahoni - DIPUPUK (80%)');
        console.log('\n🔍 Test Scanner dengan QR code: TREE-001, TREE-002, atau TREE-003');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

insertDummyData();
