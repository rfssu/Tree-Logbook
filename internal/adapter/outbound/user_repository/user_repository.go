package user_repository

import (
	"context"
	"database/sql"
	"fmt"

	"prabogo/internal/domain/auth"
	"prabogo/internal/safeaql"
)

// UserRepository interface
type UserRepository interface {
	Create(ctx context.Context, user *auth.User) error
	FindByID(ctx context.Context, id string) (*auth.User, error)
	FindByUsername(ctx context.Context, username string) (*auth.User, error)
	FindByEmail(ctx context.Context, email string) (*auth.User, error)
	Update(ctx context.Context, user *auth.User) error
}

// UserRepositoryAdapter implements UserRepository using AQL
type UserRepositoryAdapter struct {
	safeExec *safeaql.SafeExecutor
}

// NewUserRepository creates new user repository
func NewUserRepository(db *sql.DB) UserRepository {
	return &UserRepositoryAdapter{
		safeExec: safeaql.NewSafeExecutor(db),
	}
}

// Create inserts new user
func (r *UserRepositoryAdapter) Create(ctx context.Context, u *auth.User) error {
	return r.safeExec.Insert(ctx, "users",
		[]string{"id", "username", "email", "password_hash", "full_name", "role", "is_active"},
		[]interface{}{u.ID, u.Username, u.Email, u.PasswordHash, u.FullName, string(u.Role), u.IsActive})
}

// FindByID retrieves user by ID
func (r *UserRepositoryAdapter) FindByID(ctx context.Context, id string) (*auth.User, error) {
	rows, err := r.safeExec.Select(ctx, "users", "*", fmt.Sprintf("id='%s'", id))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if !rows.Next() {
		return nil, fmt.Errorf("user with id %s not found", id)
	}

	return r.scanUser(rows)
}

// FindByUsername retrieves user by username
func (r *UserRepositoryAdapter) FindByUsername(ctx context.Context, username string) (*auth.User, error) {
	rows, err := r.safeExec.Select(ctx, "users", "*", fmt.Sprintf("username='%s'", username))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if !rows.Next() {
		return nil, fmt.Errorf("user with username %s not found", username)
	}

	return r.scanUser(rows)
}

// FindByEmail retrieves user by email
func (r *UserRepositoryAdapter) FindByEmail(ctx context.Context, email string) (*auth.User, error) {
	rows, err := r.safeExec.Select(ctx, "users", "*", fmt.Sprintf("email='%s'", email))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if !rows.Next() {
		return nil, fmt.Errorf("user with email %s not found", email)
	}

	return r.scanUser(rows)
}

// Update modifies user
func (r *UserRepositoryAdapter) Update(ctx context.Context, u *auth.User) error {
	set := fmt.Sprintf("email='%s', full_name='%s', role='%s', is_active=%t, updated_at=CURRENT_TIMESTAMP",
		u.Email, u.FullName, string(u.Role), u.IsActive)
	where := fmt.Sprintf("id='%s'", u.ID)
	return r.safeExec.Update(ctx, "users", set, where)
}

// Helper: Scan database row to User entity
func (r *UserRepositoryAdapter) scanUser(rows *sql.Rows) (*auth.User, error) {
	var u auth.User
	var roleStr string

	err := rows.Scan(
		&u.ID, &u.Username, &u.Email, &u.PasswordHash, &u.FullName,
		&roleStr, &u.IsActive, &u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	u.Role = auth.UserRole(roleStr)
	return &u, nil
}
