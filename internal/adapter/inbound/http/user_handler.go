package http

import (
	"prabogo/internal/domain/auth"
	"prabogo/utils/activity"

	"github.com/gofiber/fiber/v2"
)

// UserHandler handles user management requests
type UserHandler struct {
	authService *auth.AuthService
}

// NewUserHandler creates a new user handler
func NewUserHandler(authService *auth.AuthService) *UserHandler {
	return &UserHandler{
		authService: authService,
	}
}

// Routes registers user routes
func (h *UserHandler) Routes(app *fiber.App, authMiddleware fiber.Handler) {
	api := app.Group("/api")
	usersGroup := api.Group("/users", authMiddleware)

	// Admin only users
	usersGroup.Get("/", h.GetAllUsers)
	usersGroup.Post("/", h.CreateUser)
	usersGroup.Put("/:id/role", h.UpdateUserRole)
	usersGroup.Delete("/:id", h.DeleteUser)
}

// GetAllUsers handles GET /api/users
func (h *UserHandler) GetAllUsers(c *fiber.Ctx) error {
	ctx := activity.NewContext(c.Path())

	// Check if admin? (Ideally yes, but for now assuming middleware handles authentication.
	// We should probably check role here)
	user, err := GetCurrentUser(c)
	if err != nil || user.Role != auth.RoleAdmin {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "forbidden: admin access required",
		})
	}

	users, err := h.authService.GetAllUsers(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	// Map to response (hide password hash typically handled by ToResponse)
	var response []auth.UserResponse
	for _, u := range users {
		response = append(response, *u.ToResponse())
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    response,
	})
}

// CreateUser handles POST /api/users
func (h *UserHandler) CreateUser(c *fiber.Ctx) error {
	ctx := activity.NewContext(c.Path())

	user, err := GetCurrentUser(c)
	if err != nil || user.Role != auth.RoleAdmin {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"success": false, "error": "forbidden"})
	}

	var req auth.RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": "invalid request"})
	}

	newUser, err := h.authService.Register(ctx, req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"data":    newUser.ToResponse(),
	})
}

// UpdateUserRole handles PUT /api/users/:id/role
func (h *UserHandler) UpdateUserRole(c *fiber.Ctx) error {
	ctx := activity.NewContext(c.Path())
	id := c.Params("id")

	user, err := GetCurrentUser(c)
	if err != nil || user.Role != auth.RoleAdmin {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"success": false, "error": "forbidden"})
	}

	var req struct {
		Role auth.UserRole `json:"role"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": "invalid request"})
	}

	if err := h.authService.UpdateUserRole(ctx, id, req.Role); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "error": err.Error()})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "user role updated",
	})
}

// DeleteUser handles DELETE /api/users/:id
func (h *UserHandler) DeleteUser(c *fiber.Ctx) error {
	ctx := activity.NewContext(c.Path())
	id := c.Params("id")

	user, err := GetCurrentUser(c)
	if err != nil || user.Role != auth.RoleAdmin {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"success": false, "error": "forbidden"})
	}

	// Prevent self-deletion
	if user.ID == id {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": "cannot delete yourself"})
	}

	if err := h.authService.DeleteUser(ctx, id); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "error": err.Error()})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "user deleted",
	})
}
