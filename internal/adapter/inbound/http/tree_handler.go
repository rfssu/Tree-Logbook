package http

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"prabogo/internal/cache"
	"prabogo/internal/domain/auth"
	"prabogo/internal/domain/tree"
	"prabogo/utils/activity"

	"github.com/gofiber/fiber/v2"
)

// TreeHandler handles tree HTTP requests
type TreeHandler struct {
	usecase  *tree.TreeUseCase
	userRepo auth.UserRepository
}

// NewTreeHandler creates a new tree handler
func NewTreeHandler(usecase *tree.TreeUseCase, userRepo auth.UserRepository) *TreeHandler {
	return &TreeHandler{
		usecase:  usecase,
		userRepo: userRepo,
	}
}

// populateUsername looks up username from user ID (UUID)
func (h *TreeHandler) populateUsername(ctx context.Context, userID string) string {
	if userID == "" {
		return "System"
	}
	user, err := h.userRepo.FindByID(ctx, userID)
	if err != nil || user == nil {
		return userID // Fallback to UUID if lookup fails
	}
	return user.Username
}

// RoutesPublic registers public tree routes (accessible without login)
func (h *TreeHandler) RoutesPublic(app *fiber.App) {
	api := app.Group("/api")
	trees := api.Group("/trees")

	// Public access to view tree details by code
	trees.Get("/:code", h.GetTree)
}

// RoutesWithAuth registers tree routes with authentication and role-based access
func (h *TreeHandler) RoutesWithAuth(app *fiber.App, authMiddleware fiber.Handler) {
	api := app.Group("/api")
	trees := api.Group("/trees")

	// Protected Read Routes
	trees.Get("/", authMiddleware, h.ListTrees)

	// Protected Write Routes (Admin/Editor)
	trees.Post("/", authMiddleware, RoleMiddleware(auth.RoleAdmin, auth.RoleEditor), h.CreateTree)
	trees.Put("/:code/status", authMiddleware, RoleMiddleware(auth.RoleAdmin, auth.RoleEditor), h.UpdateTreeStatus)
	trees.Delete("/:code", authMiddleware, RoleMiddleware(auth.RoleAdmin), h.DeleteTree)

	// Stats available to all authenticated users
	api.Get("/stats", authMiddleware, h.GetStatistics)
}

// CreateTree handles POST /api/trees
func (h *TreeHandler) CreateTree(c *fiber.Ctx) error {
	ctx := activity.NewContext(c.Path())

	// Parse request
	var req struct {
		SpeciesID    string  `json:"species_id"`
		LocationID   string  `json:"location_id"`
		PlantingDate string  `json:"planting_date"`
		HeightMeters float64 `json:"height_meters"`
		DiameterCm   float64 `json:"diameter_cm"`
		Notes        string  `json:"notes"`
		RegisteredBy string  `json:"registered_by"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	// Parse planting date
	plantingDate, err := time.Parse("2006-01-02", req.PlantingDate)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid planting date format (use YYYY-MM-DD)",
		})
	}

	// Call use case
	response, err := h.usecase.RegisterTree(ctx, tree.RegisterTreeRequest{
		SpeciesID:    req.SpeciesID,
		LocationID:   req.LocationID,
		PlantingDate: plantingDate,
		HeightMeters: req.HeightMeters,
		DiameterCm:   req.DiameterCm,
		Notes:        req.Notes,
		RegisteredBy: req.RegisteredBy,
	})

	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"data":    response,
	})
}

// GetTree handles GET /api/trees/:code with caching
func (h *TreeHandler) GetTree(c *fiber.Ctx) error {
	ctx := activity.NewContext(c.Path())
	code := c.Params("code")

	// Try cache first (Gib.Run - ~2-5ms)
	// Try cache first (Gib.Run - ~2-5ms)
	// Try cache first (Gib.Run - ~2-5ms)
	// var cachedTree tree.Tree
	// cacheHit, _ := cache.GetCachedTree(ctx, code, &cachedTree)

	// if cacheHit {
	// 	// Increment scan counter
	// 	cache.IncrementScanCount(ctx, code)

	// 	return c.JSON(fiber.Map{
	// 		"success": true,
	// 		"data":    cachedTree,
	// 		"source":  "cache", // Debug: show cache hit
	// 	})
	// }

	// Cache MISS -	// Get from database
	response, err := h.usecase.GetTreeByCode(ctx, code)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	// Populate username from PostgreSQL (cross-database lookup)
	if response.RegisteredBy != "" {
		response.RegisteredByUsername = h.populateUsername(ctx, response.RegisteredBy)
	}

	// Store in cache for 5 minutes
	cache.CacheTree(ctx, code, response, 5*time.Minute)

	// Increment scan counter
	cache.IncrementScanCount(ctx, code)

	return c.JSON(fiber.Map{
		"success": true,
		"data":    response,
		"source":  "database", // Debug: show cache miss
		"cached":  true,       // Now cached for next request
	})
}

// ListTrees handles GET /api/trees
func (h *TreeHandler) ListTrees(c *fiber.Ctx) error {
	ctx := activity.NewContext(c.Path())

	// Parse query params
	filter := tree.TreeFilter{
		LocationID: c.Query("location_id"),
		SpeciesID:  c.Query("species_id"),
		Status:     tree.TreeStatus(c.Query("status")),
	}

	// Parse limit and offset
	if limit := c.Query("limit"); limit != "" {
		if val, err := strconv.Atoi(limit); err == nil {
			filter.Limit = val
		}
	}
	if offset := c.Query("offset"); offset != "" {
		if val, err := strconv.Atoi(offset); err == nil {
			filter.Offset = val
		}
	}

	// Default limit
	if filter.Limit == 0 {
		filter.Limit = 10
	}

	response, err := h.usecase.ListTrees(ctx, filter)
	if err != nil {
		fmt.Printf("❌ ListTrees error: %v\n", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   fmt.Sprintf("Failed to list trees: %v", err),
		})
	}

	// Populate usernames for all trees (cross-database lookup)
	for i := range response {
		if response[i].RegisteredBy != "" {
			response[i].RegisteredByUsername = h.populateUsername(ctx, response[i].RegisteredBy)
		}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    response,
		"total":   len(response),
	})
}

// UpdateTreeStatus handles PUT /api/trees/:code/status
func (h *TreeHandler) UpdateTreeStatus(c *fiber.Ctx) error {
	ctx := activity.NewContext(c.Path())
	code := c.Params("code")

	// Parse request
	var req struct {
		Status      string `json:"status"`
		HealthScore int    `json:"health_score"`
		Notes       string `json:"notes"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	// Extract user ID from token
	userID := c.Locals("userID").(string)

	// Call use case
	err := h.usecase.UpdateTreeStatus(ctx, code, tree.TreeStatus(req.Status), req.HealthScore, req.Notes, userID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	// Invalidate cache after update
	cache.InvalidateTree(ctx, code)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Tree status updated successfully",
	})
}

// DeleteTree handles DELETE /api/trees/:code
func (h *TreeHandler) DeleteTree(c *fiber.Ctx) error {
	ctx := activity.NewContext(c.Path())
	code := c.Params("code")

	err := h.usecase.DeleteTree(ctx, code)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Tree deleted successfully",
	})
}

// GetStatistics handles GET /api/stats
func (h *TreeHandler) GetStatistics(c *fiber.Ctx) error {
	ctx := activity.NewContext(c.Path())

	response, err := h.usecase.GetStatistics(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to get statistics",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    response,
	})
}
