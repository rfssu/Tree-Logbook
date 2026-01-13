const SawitDB = require('@wowoengine/sawitdb');
const path = require('path');

// Connect to database
const dbPath = path.join(__dirname, 'tree_logbook.sawit');
const db = new SawitDB(dbPath);

async function viewAllTables() {
    try {
        console.log('\n📊 === VIEWING SAWITDB TABLES (using AQL) ===\n');

        // Use AQL PANEN (SELECT equivalent)
        console.log('🌳 TREES Table:\n');
        const treesQuery = `
      PANEN * DARI trees URUTKAN code ASC BATAS 5
    `;
        const trees = await db.query(treesQuery);
        console.log('Sample Trees (first 5):');
        console.log('Type of trees:', typeof trees);
        console.log('Is Array?', Array.isArray(trees));
        if (Array.isArray(trees)) {
            console.table(trees);
        } else {
            console.log('Result:', trees);
        }

        console.log('\n🔍 Full Tree Record (checking fields):');
        if (Array.isArray(trees) && trees.length > 0) {
            console.log(JSON.stringify(trees[0], null, 2));
            console.log(`\n✅ Has 'registered_by_username'? ${trees[0].hasOwnProperty('registered_by_username') ? 'YES' : 'NO ❌'}`);
        } else {
            console.log('No trees found or invalid format.');
        }

        // Monitoring Logs
        console.log('\n\n📝 MONITORING_LOGS Table:\n');
        const logsQuery = `
      PANEN * DARI monitoring_logs URUTKAN monitor_date DESC BATAS 5
    `;
        const logs = await db.query(logsQuery);
        console.log('Latest 5 logs:');
        if (logs && logs.length > 0) {
            logs.forEach((log, i) => {
                console.log(`${i + 1}. Tree: ${log.tree_id} | Status: ${log.status} | Health: ${log.health_score}% | Date: ${new Date(log.monitor_date).toLocaleString('id-ID')} | By: ${log.monitored_by}`);
            });

            console.log('\n🔍 Full Log Record (checking fields):');
            console.log(JSON.stringify(logs[0], null, 2));
            console.log(`\n✅ Has 'monitored_by_username'? ${logs[0].hasOwnProperty('monitored_by_username') ? 'YES' : 'NO ❌'}`);
        }

        // Count total records
        console.log('\n\n📊 SUMMARY:');
        const allTrees = await db.query('PANEN * DARI trees');
        const allLogs = await db.query('PANEN * DARI monitoring_logs');
        console.log(`Total Trees: ${allTrees ? allTrees.length : 0}`);
        console.log(`Total Logs: ${allLogs ? allLogs.length : 0}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
    }
}

viewAllTables();
