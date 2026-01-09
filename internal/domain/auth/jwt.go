package auth

import (
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// Claims represents JWT claims
type Claims struct {
	UserID   string   `json:"user_id"`
	Username string   `json:"username"`
	Role     UserRole `json:"role"`
	jwt.RegisteredClaims
}

// GetJWTSecret returns JWT secret from environment
func GetJWTSecret() string {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return "default-secret-change-in-production"
	}
	return secret
}

// GetJWTExpiration returns token expiration duration
func GetJWTExpiration() time.Duration {
	// Default 24 hours
	return 24 * time.Hour
}

// GenerateToken creates a JWT token for user
func GenerateToken(user *User) (string, error) {
	expirationTime := time.Now().Add(GetJWTExpiration())

	claims := &Claims{
		UserID:   user.ID,
		Username: user.Username,
		Role:     user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(GetJWTSecret()))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// ValidateToken validates and parses JWT token
func ValidateToken(tokenString string) (*Claims, error) {
	claims := &Claims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		// Verify signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid signing method")
		}
		return []byte(GetJWTSecret()), nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}

// GetUserIDFromToken extracts user ID from token
func GetUserIDFromToken(tokenString string) (string, error) {
	claims, err := ValidateToken(tokenString)
	if err != nil {
		return "", err
	}
	return claims.UserID, nil
}

// GetUserRoleFromToken extracts user role from token
func GetUserRoleFromToken(tokenString string) (UserRole, error) {
	claims, err := ValidateToken(tokenString)
	if err != nil {
		return "", err
	}
	return claims.Role, nil
}
