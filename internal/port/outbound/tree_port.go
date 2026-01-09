package outbound_port

import (
	"context"
	"prabogo/internal/domain/tree"
)

// TreeFilter for querying trees
type TreeFilter struct {
	LocationID string
	SpeciesID  string
	Status     tree.TreeStatus
	Limit      int
	Offset     int
}

// TreeRepository interface for tree data operations
type TreeRepository interface {
	// Create inserts a new tree (TANAM KE)
	Create(ctx context.Context, tree *tree.Tree) error

	// FindByID retrieves tree by ID (PANEN)
	FindByID(ctx context.Context, id string) (*tree.Tree, error)

	// FindByCode retrieves tree by code like C001 (PANEN)
	FindByCode(ctx context.Context, code string) (*tree.Tree, error)

	// FindAll retrieves trees with filter (PANEN)
	FindAll(ctx context.Context, filter TreeFilter) ([]*tree.Tree, error)

	// Update modifies existing tree (PUPUK)
	Update(ctx context.Context, tree *tree.Tree) error

	// UpdateStatus changes tree status (PUPUK)
	UpdateStatus(ctx context.Context, id string, status tree.TreeStatus, healthScore int) error

	// Delete removes a tree (GUSUR)
	Delete(ctx context.Context, id string) error

	// GetNextCode generates next C-code (C001, C002, etc.)
	GetNextCode(ctx context.Context) (string, error)

	// CountByLocation counts trees in a location
	CountByLocation(ctx context.Context, locationID string) (int, error)

	// CountByStatus counts trees by status
	CountByStatus(ctx context.Context, status tree.TreeStatus) (int, error)
}
