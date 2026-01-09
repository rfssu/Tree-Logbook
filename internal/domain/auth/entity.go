package auth

import (
	"errors"
	"time"
)

// User entity for authentication
type User struct {
	ID           string
	Username     string
	Email        string
	PasswordHash string
	FullName     string
	Role         UserRole
	IsActive     bool
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

// UserRole represents user permission level
type UserRole string

const (
	RoleAdmin  UserRole = "admin"
	RoleEditor UserRole = "editor"
	RoleViewer UserRole = "viewer"
)

// Validate checks if user entity is valid
func (u *User) Validate() error {
	if u.Username == "" {
		return errors.New("username is required")
	}
	if u.Email == "" {
		return errors.New("email is required")
	}
	if !u.IsValidRole() {
		return errors.New("invalid user role")
	}
	return nil
}

// IsValidRole checks if role is valid
func (u *User) IsValidRole() bool {
	validRoles := []UserRole{RoleAdmin, RoleEditor, RoleViewer}
	for _, role := range validRoles {
		if u.Role == role {
			return true
		}
	}
	return false
}

// IsAdmin returns true if user is admin
func (u *User) IsAdmin() bool {
	return u.Role == RoleAdmin
}

// CanEdit returns true if user can edit (admin or editor)
func (u *User) CanEdit() bool {
	return u.Role == RoleAdmin || u.Role == RoleEditor
}

// CanDelete returns true if user can delete (admin only)
func (u *User) CanDelete() bool {
	return u.Role == RoleAdmin
}

// ToResponse converts User to safe response (without password)
func (u *User) ToResponse() *UserResponse {
	return &UserResponse{
		ID:        u.ID,
		Username:  u.Username,
		Email:     u.Email,
		FullName:  u.FullName,
		Role:      string(u.Role),
		IsActive:  u.IsActive,
		CreatedAt: u.CreatedAt.Format(time.RFC3339),
	}
}

// UserResponse for API responses (no password)
type UserResponse struct {
	ID        string `json:"id"`
	Username  string `json:"username"`
	Email     string `json:"email"`
	FullName  string `json:"full_name"`
	Role      string `json:"role"`
	IsActive  bool   `json:"is_active"`
	CreatedAt string `json:"created_at"`
}

// RegisterRequest for user registration
type RegisterRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
	FullName string `json:"full_name"`
}

// Validate registration request
func (r *RegisterRequest) Validate() error {
	if r.Username == "" {
		return errors.New("username is required")
	}
	if r.Email == "" {
		return errors.New("email is required")
	}
	if r.Password == "" {
		return errors.New("password is required")
	}
	if len(r.Password) < 6 {
		return errors.New("password must be at least 6 characters")
	}
	return nil
}

// LoginRequest for user login
type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// Validate login request
func (lr *LoginRequest) Validate() error {
	if lr.Username == "" {
		return errors.New("username is required")
	}
	if lr.Password == "" {
		return errors.New("password is required")
	}
	return nil
}

// LoginResponse for successful login
type LoginResponse struct {
	Token string        `json:"token"`
	User  *UserResponse `json:"user"`
}
