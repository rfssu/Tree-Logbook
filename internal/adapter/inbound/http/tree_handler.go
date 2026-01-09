package http

import (
	"strconv"
	"time"

	"prabogo/internal/domain/auth"
	"prabogo/internal/domain/tree"
	"prabogo/utils/activity"

	"github.com/gofiber/fiber/v2"
)

// TreeHandler handles tree HTTP requests
type TreeHandler struct {
	usecase *tree.TreeUseCase
}

// NewTreeHandler creates a new tree handler
func NewTreeHandler(usecase *tree.TreeUseCase) *TreeHandler {
	return &TreeHandler{
		usecase: usecase,
	}
}

// Routes registers all tree routes
func (h *TreeHandler) Routes(app *fiber.App) {
	api := app.Group("/api")
	trees := api.Group("/trees")

	trees.Post("/", h.CreateTree)
	trees.Get("/:code", h.GetTree)
	trees.Get("/", h.ListTrees)
	trees.Put("/:code/status", h.UpdateTreeStatus)
	trees.Delete("/:code", h.DeleteTree)

	api.Get("/stats", h.GetStatistics)
}

// RoutesWithAuth registers tree routes with authentication and role-based access
func (h *TreeHandler) RoutesWithAuth(app *fiber.App, authMiddleware fiber.Handler) {
	api := app.Group("/api")
	trees := api.Group("/trees")

	// All authenticated users can read (viewer, editor, admin)
	trees.Get("/:code", authMiddleware, h.GetTree)
	trees.Get("/", authMiddleware, h.ListTrees)

	// Only Admin and Editor can create trees
	trees.Post("/", authMiddleware, RoleMiddleware(auth.RoleAdmin, auth.RoleEditor), h.CreateTree)

	// Only Admin and Editor can update tree status
	trees.Put("/:code/status", authMiddleware, RoleMiddleware(auth.RoleAdmin, auth.RoleEditor), h.UpdateTreeStatus)

	// Only Admin can delete trees
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

// GetTree handles GET /api/trees/:code
func (h *TreeHandler) GetTree(c *fiber.Ctx) error {
	ctx := activity.NewContext(c.Path())
	code := c.Params("code")

	response, err := h.usecase.GetTreeByCode(ctx, code)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Tree not found",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    response,
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
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to list trees",
		})
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

	// Call use case
	err := h.usecase.UpdateTreeStatus(ctx, code, tree.TreeStatus(req.Status), req.HealthScore, req.Notes)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

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
