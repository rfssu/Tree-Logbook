package http

import (
	"prabogo/internal/domain/auth"
	"prabogo/utils/activity"

	"github.com/gofiber/fiber/v2"
)

// AuthHandler handles authentication HTTP requests
type AuthHandler struct {
	authService *auth.AuthService
}

// NewAuthHandler creates a new auth handler
func NewAuthHandler(authService *auth.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

// Routes registers auth routes
func (h *AuthHandler) Routes(app *fiber.App, authMiddleware fiber.Handler) {
	api := app.Group("/api")
	authGroup := api.Group("/auth")

	// Public routes
	authGroup.Post("/register", h.Register)
	authGroup.Post("/login", h.Login)

	// Protected routes
	authGroup.Get("/me", authMiddleware, h.GetMe)
}

// Register handles POST /api/auth/register
func (h *AuthHandler) Register(c *fiber.Ctx) error {
	ctx := activity.NewContext(c.Path())

	// Parse request
	var req auth.RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "invalid request body",
		})
	}

	// Register user
	user, err := h.authService.Register(ctx, req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "user registered successfully",
		"data":    user.ToResponse(),
	})
}

// Login handles POST /api/auth/login
func (h *AuthHandler) Login(c *fiber.Ctx) error {
	ctx := activity.NewContext(c.Path())

	// Parse request
	var req auth.LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "invalid request body",
		})
	}

	// Login user
	token, user, err := h.authService.Login(ctx, req)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": auth.LoginResponse{
			Token: token,
			User:  user.ToResponse(),
		},
	})
}

// GetMe handles GET /api/auth/me
func (h *AuthHandler) GetMe(c *fiber.Ctx) error {
	// Get user from context (set by middleware)
	user, err := GetCurrentUser(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"error":   "unauthorized",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    user.ToResponse(),
	})
}
