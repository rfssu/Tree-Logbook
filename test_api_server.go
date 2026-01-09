package main

import (
	"fmt"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"

	"prabogo/internal/adapter/inbound/http"
	"prabogo/internal/adapter/outbound/tree_repository"
	"prabogo/internal/domain/tree"
	"prabogo/utils/activity"
	"prabogo/utils/database"
)

func main() {
	// Load .env
	godotenv.Load(".env")

	ctx := activity.NewContext("api_server")

	// Initialize database
	db := database.InitDatabase(ctx, os.Getenv("OUTBOUND_DATABASE_DRIVER"))
	defer db.Close()

	// Initialize repository & use case
	treeRepo := tree_repository.NewTreeRepository(db)
	treeUseCase := tree.NewTreeUseCase(treeRepo)
	treeHandler := http.NewTreeHandler(treeUseCase)

	// Create Fiber app
	app := fiber.New(fiber.Config{
		AppName: "Tree-ID API v1.0",
	})

	// Middleware
	app.Use(logger.New())
	app.Use(cors.New())

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "healthy",
			"app":    "Tree-ID API",
		})
	})

	// Register tree routes
	treeHandler.Routes(app)

	// Print banner
	fmt.Println("\n🌳 Tree-ID API Server")
	fmt.Println("=" + repeatString("=", 49))
	fmt.Println("✅ Database: Connected")
	fmt.Println("✅ AQL Translator: Active")
	fmt.Println("\n📍 Routes:")
	fmt.Println("   GET    /health")
	fmt.Println("   POST   /api/trees")
	fmt.Println("   GET    /api/trees/:code")
	fmt.Println("   GET    /api/trees")
	fmt.Println("   PUT    /api/trees/:code/status")
	fmt.Println("   DELETE /api/trees/:code")
	fmt.Println("   GET    /api/stats")
	fmt.Println("\n🚀 Server running on http://localhost:8000")
	fmt.Println("=" + repeatString("=", 49) + "\n")

	// Start server
	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "8000"
	}

	if err := app.Listen(":" + port); err != nil {
		fmt.Printf("Error starting server: %v\n", err)
	}
}

func repeatString(s string, count int) string {
	result := ""
	for i := 0; i < count; i++ {
		result += s
	}
	return result
}
