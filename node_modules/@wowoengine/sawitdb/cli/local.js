const readline = require('readline');
const SawitDB = require('../src/WowoEngine');
const path = require('path');
const fs = require('fs');

let currentDbName = 'example';
const dataDir = __dirname; // Default to CLI dir or configurable
let dbPath = path.join(dataDir, `${currentDbName}.sawit`);
let db = new SawitDB(dbPath);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("--- SawitDB (Local Mode) ---");
console.log("Perintah (Tani / SQL):");
console.log("  LAHAN [nama] | CREATE TABLE [name]");
console.log("  LIHAT LAHAN | SHOW TABLES");
console.log("  TANAM KE [table] (cols) BIBIT (vals) | INSERT INTO ... VALUES ...");
console.log("  PANEN ... DARI [table] | SELECT ... FROM ...");
console.log("  ... DIMANA [cond] | ... WHERE [cond]");
console.log("  PUPUK [table] DENGAN ... | UPDATE [table] SET ...");
console.log("  GUSUR DARI [table] | DELETE FROM [table]");
console.log("  BAKAR LAHAN [table] | DROP TABLE [table]");
console.log("  INDEKS [table] PADA [field] | CREATE INDEX ON [table]([field])");
console.log("  HITUNG FUNC(field) DARI ... | AGGREGATE support");
console.log("\nManajemen Wilayah:");
console.log("  MASUK WILAYAH [nama]  - Pindah Database");
console.log("  BUKA WILAYAH [nama]   - Buat Database Baru");
console.log("  LIHAT WILAYAH         - List Database");
console.log("\nContoh:");
console.log("  TANAM KE sawit (id, bibit) BIBIT (1, 'Dura')");
console.log("  PANEN * DARI sawit DIMANA id > 0");
console.log("  HITUNG AVG(umur) DARI sawit KELOMPOK bibit");
console.log("  BAKAR LAHAN karet");

function switchDatabase(name) {
    try {
        if (db) {
            try { db.close(); } catch (e) { }
        }
        currentDbName = name;
        dbPath = path.join(dataDir, `${name}.sawit`);
        db = new SawitDB(dbPath);
        console.log(`\nBerhasil masuk ke wilayah '${name}'.`);
    } catch (e) {
        console.error(`Gagal masuk wilayah: ${e.message}`);
    }
}

function listDatabases() {
    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.sawit'));
    console.log("Daftar Wilayah:");
    files.forEach(f => console.log(`- ${f.replace('.sawit', '')}`));
}

function prompt() {
    rl.question(`${currentDbName}> `, (line) => {
        const cmd = line.trim();
        const upperCmd = cmd.toUpperCase();

        if (upperCmd === 'EXIT') {
            if (db) try { db.close(); } catch (e) { }
            rl.close();
            return;
        }

        if (upperCmd.startsWith('MASUK WILAYAH ') || upperCmd.startsWith('USE ')) {
            const parts = cmd.split(/\s+/);
            const name = parts[2] || parts[1]; // Handle USE [name] or MASUK WILAYAH [name]
            if (name) {
                switchDatabase(name);
            } else {
                console.log("Syntax: MASUK WILAYAH [nama]");
            }
            return prompt();
        }

        if (upperCmd.startsWith('BUKA WILAYAH ')) {
            const parts = cmd.split(/\s+/);
            const name = parts[2];
            if (name) {
                switchDatabase(name); // Buka defaults to open/create in generic engine
            } else {
                console.log("Syntax: BUKA WILAYAH [nama]");
            }
            return prompt();
        }

        if (upperCmd === 'LIHAT WILAYAH' || upperCmd === 'SHOW DATABASES') {
            listDatabases();
            return prompt();
        }

        if (cmd) {
            try {
                const result = db.query(cmd);
                if (typeof result === 'object') {
                    console.log(JSON.stringify(result, null, 2));
                } else {
                    console.log(result);
                }
            } catch (e) {
                console.error("Error:", e.message);
            }
        }
        prompt();
    });
}

prompt();
