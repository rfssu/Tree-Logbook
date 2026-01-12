package main

import (
	"context"
	"fmt"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq" // PostgreSQL driver (needed for user & monitoring repos)

	"prabogo/internal/adapter/inbound/http"
	"prabogo/internal/adapter/outbound/monitoring_repository"
	"prabogo/internal/adapter/outbound/sawit_client"
	"prabogo/internal/adapter/outbound/sawit_repository"
	"prabogo/internal/adapter/outbound/tree_repository"
	"prabogo/internal/adapter/outbound/user_repository"
	"prabogo/internal/cache"
	"prabogo/internal/domain/auth"
	"prabogo/internal/domain/tree"
	"prabogo/utils/database"
)

func main() {
	// Load .env
	godotenv.Load(".env")

	ctx := context.Background()

	// Initialize Gib.Run cache
	if err := cache.InitGibRun(); err != nil {
		fmt.Printf("⚠️ Warning: Failed to initialize cache: %v\n", err)
		fmt.Println("   Continuing without cache (direct database queries)")
	}
	// Choose database: SawitDB or PostgreSQL
	useSawitDB := os.Getenv("USE_SAWITDB") == "true"

	var treeRepo tree.TreeRepository
	var userRepo auth.UserRepository
	var monitoringRepo tree.MonitoringRepository

	if useSawitDB {
		// Initialize SawitDB TCP client
		sawitAddr := os.Getenv("SAWIT_ADDR")
		if sawitAddr == "" {
			sawitAddr = "127.0.0.1:7878"
		}

		fmt.Printf("🌾 Connecting to SawitDB at %s...\n", sawitAddr)
		sawitClient := sawit_client.NewSawitClient(sawitAddr)
		if err := sawitClient.Connect(); err != nil {
			fmt.Printf("❌ Failed to connect to SawitDB: %v\n", err)
			fmt.Println("⚠️  Make sure SawitDB TCP server is running:")
			fmt.Println("    node sawitdb-server/tcp-server.js")
			os.Exit(1)
		}
		defer sawitClient.Close()
		fmt.Println("✅ Connected to SawitDB!")

		// Initialize SawitDB repositories
		treeRepo = sawit_repository.NewTreeRepository(sawitClient)
		// TODO: Implement user and monitoring repositories for SawitDB
		// For now, fall back to PostgreSQL for these
		db := database.InitDatabase(ctx, "postgres")
		defer db.Close()

		// 🔧 HYBRID MODE FIX: Drop Foreign Key because SawitDB trees don't exist in Postgres 'trees' table!
		fmt.Println("🔧 Hybrid Mode: Dropping Foreign Key constraint on monitoring_logs...")
		_, err := db.Exec("ALTER TABLE monitoring_logs DROP CONSTRAINT IF EXISTS monitoring_logs_tree_id_fkey")
		if err != nil {
			fmt.Printf("⚠️ Warning: Failed to drop constraint: %v\n", err)
		} else {
			fmt.Println("✅ Foreign Key constraint dropped. Hybrid storage ready.")
		}

		userRepo = user_repository.NewUserRepository(db)
		monitoringRepo = monitoring_repository.NewMonitoringRepository(db)
	} else {
		// Initialize PostgreSQL database
		db := database.InitDatabase(ctx, os.Getenv("OUTBOUND_DATABASE_DRIVER"))
		defer db.Close()

		// 🔧 HYBRID MODE FIX (Just in case): Drop Foreign Key
		fmt.Println("🔧 dropping Foreign Key constraint (if exists)...")
		db.Exec("ALTER TABLE monitoring_logs DROP CONSTRAINT IF EXISTS monitoring_logs_tree_id_fkey")

		// Initialize PostgreSQL repositories
		treeRepo = tree_repository.NewTreeRepository(db)
		userRepo = user_repository.NewUserRepository(db)
		monitoringRepo = monitoring_repository.NewMonitoringRepository(db)
	}

	// Initialize services & use cases
	treeUseCase := tree.NewTreeUseCase(treeRepo, monitoringRepo)
	authService := auth.NewAuthService(userRepo)

	// Initialize handlers
	treeHandler := http.NewTreeHandler(treeUseCase, userRepo)
	authHandler := http.NewAuthHandler(authService)
	userHandler := http.NewUserHandler(authService) // User Management Handler
	// MonitoringHandler requires concrete type (always uses PostgreSQL)
	monitoringHandlerRepo := monitoring_repository.NewMonitoringRepository(database.InitDatabase(ctx, "postgres"))
	monitoringHandler := http.NewMonitoringHandler(monitoringHandlerRepo, userRepo, treeRepo)

	// Create auth middleware
	authMiddleware := http.AuthMiddleware(authService)

	// Create Fiber app
	app := fiber.New(fiber.Config{
		AppName: "Tree-ID API v1.0",
	})

	// Global middleware
	app.Use(logger.New())
	app.Use(cors.New())

	// Serve static frontend files
	app.Static("/", "./web")

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "healthy",
			"app":    "Tree-ID API",
		})
	})

	// Register auth routes
	authHandler.Routes(app, authMiddleware)
	userHandler.Routes(app, authMiddleware) // Register User Routes

	// Register tree routes (with auth protection)
	treeHandler.RoutesWithAuth(app, authMiddleware)

	// Register monitoring routes
	api := app.Group("/api")
	api.Get("/trees/:code/history", authMiddleware, monitoringHandler.GetTreeHistory)

	// Print banner
	printBanner()

	// Start server
	port := getPort()
	if err := app.Listen(":" + port); err != nil {
		fmt.Printf("Error starting server: %v\n", err)
	}
}

func getPort() string {
	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "7000"
	}
	return port
}

func printBanner() {
	fmt.Println("\n🌳 Tree-ID API Server with Authentication")
	fmt.Println("============================================================")
	if os.Getenv("USE_SAWITDB") == "true" {
		fmt.Println("✅ Database: SawitDB (TCP)")
		fmt.Println("✅ AQL: Agricultural Query Language")
	} else {
		fmt.Println("✅ Database: PostgreSQL")
		fmt.Println("✅ AQL Translator: Active")
	}
	fmt.Println("✅ Authentication: JWT Enabled")
	fmt.Println("\n📍 Public Routes:")
	fmt.Println("   GET    /health")
	fmt.Println("   POST   /api/auth/register")
	fmt.Println("   POST   /api/auth/login")
	fmt.Println("\n🔒 Protected Routes:")
	fmt.Println("   GET    /api/auth/me")
	fmt.Println("   POST   /api/trees              (admin, editor)")
	fmt.Println("   GET    /api/trees/:code        (all roles)")
	fmt.Println("   GET    /api/trees              (all roles)")
	fmt.Println("   PUT    /api/trees/:code/status (admin, editor)")
	fmt.Println("   DELETE /api/trees/:code        (admin only)")
	fmt.Println("   GET    /api/stats              (all roles)")
	fmt.Println("   GET    /api/trees/:code/history (all roles)")
	fmt.Printf("\n🚀 Server running on http://localhost:%s\n", getPort())
	fmt.Println("============================================================\n")
}
