package http

import (
	"strings"

	"prabogo/internal/domain/auth"
	"prabogo/utils/activity"

	"github.com/gofiber/fiber/v2"
)

// AuthMiddleware validates JWT token
func AuthMiddleware(authService *auth.AuthService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get Authorization header
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"error":   "missing authorization header",
			})
		}

		// Extract token
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"error":   "invalid authorization format (use: Bearer <token>)",
			})
		}

		token := parts[1]

		// Validate token and get user
		ctx := activity.NewContext(c.Path())
		user, err := authService.ValidateToken(ctx, token)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"error":   "invalid or expired token",
			})
		}

		// Store user in context
		c.Locals("user", user)
		c.Locals("userID", user.ID)
		c.Locals("userRole", user.Role)

		return c.Next()
	}
}

// RoleMiddleware checks if user has required role
func RoleMiddleware(allowedRoles ...auth.UserRole) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get user from context
		user, ok := c.Locals("user").(*auth.User)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"error":   "unauthorized",
			})
		}

		// Check if user role is allowed
		for _, role := range allowedRoles {
			if user.Role == role {
				return c.Next()
			}
		}

		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "insufficient permissions",
		})
	}
}

// GetCurrentUser helper to get user from context
func GetCurrentUser(c *fiber.Ctx) (*auth.User, error) {
	user, ok := c.Locals("user").(*auth.User)
	if !ok {
		return nil, fiber.NewError(fiber.StatusUnauthorized, "user not found in context")
	}
	return user, nil
}
