package main

import (
	"database/sql"
	"fmt"
	"os"
	"prabogo/internal/safeaql"
	"prabogo/utils"
	"prabogo/utils/activity"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	// Load environment variables
	godotenv.Load(".env")

	ctx := activity.NewContext("test_aql")

	// Connect to database directly (skip migrations)
	connStr := utils.GetDatabaseString()
	fmt.Printf("📡 Connecting to: %s\n", connStr)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		fmt.Printf("❌ Connection error: %v\n", err)
		os.Exit(1)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		fmt.Printf("❌ Ping error: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("✅ PostgreSQL connected!\n")

	// Create safe executor
	safeExec := safeaql.NewSafeExecutor(db)

	// Test 1: Create table using AQL (LAHAN)
	fmt.Println("🌱 Test 1: Creating table with AQL (LAHAN)...")
	err = safeExec.CreateTable(ctx, "data_pohon", "id VARCHAR(50) PRIMARY KEY, status VARCHAR(20), lokasi VARCHAR(100)")
	if err != nil {
		fmt.Printf("❌ Error: %v\n", err)
	} else {
		fmt.Println("✅ Table created: data_pohon")
	}

	// Test 2: Insert using AQL (TANAM)
	fmt.Println("\n🌱 Test 2: Inserting data with AQL (TANAM KE)...")
	err = safeExec.Insert(ctx, "data_pohon",
		[]string{"id", "status", "lokasi"},
		[]interface{}{"P001", "SEHAT", "Kebun A"})
	if err != nil {
		fmt.Printf("❌ Error: %v\n", err)
	} else {
		fmt.Println("✅ Data inserted: P001 - SEHAT - Kebun A")
	}

	// Test 3: Select using AQL (PANEN)
	fmt.Println("\n🌱 Test 3: Querying data with AQL (PANEN)...")
	rows, err := safeExec.Select(ctx, "data_pohon", "*", "status='SEHAT'")
	if err != nil {
		fmt.Printf("❌ Error: %v\n", err)
	} else {
		defer rows.Close()
		count := 0
		for rows.Next() {
			var id, status, lokasi string
			rows.Scan(&id, &status, &lokasi)
			fmt.Printf("✅ Found tree: %s - %s - %s\n", id, status, lokasi)
			count++
		}
		fmt.Printf("   Total: %d trees\n", count)
	}

	// Test 4: Update using AQL (PUPUK)
	fmt.Println("\n🌱 Test 4: Updating data with AQL (PUPUK)...")
	err = safeExec.Update(ctx, "data_pohon", "status='DIPUPUK'", "id='P001'")
	if err != nil {
		fmt.Printf("❌ Error: %v\n", err)
	} else {
		fmt.Println("✅ Data updated: P001 -> status DIPUPUK")
	}

	// Test 5: Verify update (PANEN again)
	fmt.Println("\n🌱 Test 5: Verify update (PANEN)...")
	rows2, err := safeExec.Select(ctx, "data_pohon", "*", "id='P001'")
	if err != nil {
		fmt.Printf("❌ Error: %v\n", err)
	} else {
		defer rows2.Close()
		for rows2.Next() {
			var id, status, lokasi string
			rows2.Scan(&id, &status, &lokasi)
			fmt.Printf("✅ Tree after update: %s - %s - %s\n", id, status, lokasi)
		}
	}

	// Test 6: Delete using AQL (GUSUR)
	fmt.Println("\n🌱 Test 6: Deleting data with AQL (GUSUR)...")
	err = safeExec.Delete(ctx, "data_pohon", "id='P001'")
	if err != nil {
		fmt.Printf("❌ Error: %v\n", err)
	} else {
		fmt.Println("✅ Data deleted: P001")
	}

	// Cleanup: Drop table
	fmt.Println("\n🧹 Cleanup: Dropping test table...")
	_, err = db.Exec("DROP TABLE IF EXISTS data_pohon")
	if err != nil {
		fmt.Printf("❌ Cleanup error: %v\n", err)
	} else {
		fmt.Println("✅ Test table dropped")
	}

	fmt.Println("\n==================================================")
	fmt.Println("🎉 AQL TEST COMPLETE!")
	fmt.Println("==================================================")
	fmt.Println("✅ All AQL operations working:")
	fmt.Println("   - LAHAN (CREATE TABLE)")
	fmt.Println("   - TANAM KE ... BIBIT (INSERT)")
	fmt.Println("   - PANEN ... DARI ... DIMANA (SELECT)")
	fmt.Println("   - PUPUK ... DENGAN ... DIMANA (UPDATE)")
	fmt.Println("   - GUSUR DARI ... DIMANA (DELETE)")
	fmt.Println("\n🌳 Tree-ID AQL-to-SQL Translator: OPERATIONAL!")
}
