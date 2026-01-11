package main

import (
	"context"
	"fmt"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"

	"prabogo/internal/adapter/inbound/http"
	"prabogo/internal/adapter/outbound/monitoring_repository"
	"prabogo/internal/adapter/outbound/tree_repository"
	"prabogo/internal/adapter/outbound/user_repository"
	"prabogo/internal/domain/auth"
	"prabogo/internal/domain/tree"
	"prabogo/utils/database"
)

func main() {
	// Load .env
	godotenv.Load(".env")

	// Initialize database
	ctx := context.Background()
	db := database.InitDatabase(ctx, os.Getenv("OUTBOUND_DATABASE_DRIVER"))
	defer db.Close()

	// Initialize repositories
	treeRepo := tree_repository.NewTreeRepository(db)
	userRepo := user_repository.NewUserRepository(db)
	monitoringRepo := monitoring_repository.NewMonitoringRepository(db)

	// Initialize services & use cases
	treeUseCase := tree.NewTreeUseCase(treeRepo, monitoringRepo)
	authService := auth.NewAuthService(userRepo)

	// Initialize handlers
	treeHandler := http.NewTreeHandler(treeUseCase)
	authHandler := http.NewAuthHandler(authService)
	monitoringHandler := http.NewMonitoringHandler(monitoringRepo)

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
	fmt.Println("✅ Database: Connected")
	fmt.Println("✅ AQL Translator: Active")
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
