const SawitDB = require('@wowoengine/sawitdb');
const path = require('path');

// Connect to database
const db = new SawitDB({
    filename: path.join(__dirname, 'tree_logbook.sawit')
});

async function viewAllTables() {
    try {
        console.log('\n📊 === VIEWING ALL SAWITDB TABLES ===\n');

        // 1. View all trees
        const trees = await db.query(`
      FOR tree IN trees
        SORT tree.code ASC
        RETURN tree
    `);

        console.log(`\n🌳 TREES (${trees.length} records):`);
        console.table(trees.map(t => ({
            code: t.code,
            species: t.species_id,
            location: t.location_id,
            status: t.status,
            health: t.health_score + '%',
            registered_by: t.registered_by_username || t.registered_by
        })));

        // 2. View all monitoring logs
        const logs = await db.query(`
      FOR log IN monitoring_logs
        SORT log.monitor_date DESC
        LIMIT 10
        RETURN log
    `);

        console.log(`\n📝 MONITORING LOGS (showing latest 10 of ${logs.length}):`);
        console.table(logs.map(l => ({
            tree_id: l.tree_id,
            status: l.status,
            health: l.health_score + '%',
            date: new Date(l.monitor_date).toLocaleString('id-ID'),
            monitored_by: l.monitored_by
        })));

        // 3. Check if monitored_by_username exists
        console.log('\n🔍 Sample log with all fields:');
        console.log(JSON.stringify(logs[0], null, 2));

    } catch (error) {
        console.error('❌ Error viewing tables:', error);
    }
}

viewAllTables();
