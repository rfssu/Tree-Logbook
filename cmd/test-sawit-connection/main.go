package main

import (
	"context"
	"fmt"
	"log"

	"prabogo/internal/adapter/outbound/sawit_client"
)

func main() {
	fmt.Println("🧪 Testing Go ↔ SawitDB Connection\n")

	// Create client
	client := sawit_client.NewSawitClient("127.0.0.1:7878")

	// Connect
	fmt.Println("1️⃣ Connecting to SawitDB server...")
	err := client.Connect()
	if err != nil {
		log.Fatal("❌ Connection failed:", err)
	}
	defer client.Close()
	fmt.Println("✅ Connected!\n")

	ctx := context.Background()

	// Test 1: Show tables
	fmt.Println("2️⃣ Querying tables...")
	tables, err := client.Query(ctx, "LIHAT LAHAN")
	if err != nil {
		log.Fatal("❌ Query failed:", err)
	}
	fmt.Printf("✅ Tables: %v\n\n", tables)

	// Test 2: Query users
	fmt.Println("3️⃣ Querying users...")
	users, err := client.Query(ctx, "PANEN * DARI users")
	if err != nil {
		log.Fatal("❌ Query failed:", err)
	}
	fmt.Printf("✅ Users: %v\n\n", users)

	// Test 3: Insert test tree
	fmt.Println("4️⃣ Inserting test tree...")
	_, err = client.Query(ctx, `TANAM KE trees (id, code, status) BIBIT ('TREE_GO_001', 'C888', 'SEHAT')`)
	if err != nil {
		log.Fatal("❌ Insert failed:", err)
	}
	fmt.Println("✅ Tree inserted!\n")

	// Test 4: Query inserted tree
	fmt.Println("5️⃣ Querying inserted tree...")
	tree, err := client.Query(ctx, "PANEN * DARI trees DIMANA code='C888'")
	if err != nil {
		log.Fatal("❌ Query failed:", err)
	}
	fmt.Printf("✅ Tree: %v\n\n", tree)

	// Test 5: Delete test tree
	fmt.Println("6️⃣ Cleaning up test data...")
	_, err = client.Query(ctx, "GUSUR DARI trees DIMANA code='C888'")
	if err != nil {
		log.Println("⚠️ Cleanup warning:", err)
	} else {
		fmt.Println("✅ Test data deleted!\n")
	}

	fmt.Println("🎉 ALL TESTS PASSED!")
	fmt.Println("✅ Go can communicate with SawitDB successfully")
}
