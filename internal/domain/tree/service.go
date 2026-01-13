package tree

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
)

// TreeFilter for querying trees
type TreeFilter struct {
	LocationID string
	SpeciesID  string
	Status     TreeStatus
	Limit      int
	Offset     int
}

// TreeRepository interface for tree data operations
type TreeRepository interface {
	// Create inserts a new tree (TANAM KE)
	Create(ctx context.Context, tree *Tree) error

	// FindByID retrieves tree by ID (PANEN)
	FindByID(ctx context.Context, id string) (*Tree, error)

	// FindByCode retrieves tree by code like C001 (PANEN)
	FindByCode(ctx context.Context, code string) (*Tree, error)

	// FindAll retrieves trees with filter (PANEN)
	FindAll(ctx context.Context, filter TreeFilter) ([]*Tree, error)

	// Update modifies existing tree (PUPUK)
	Update(ctx context.Context, tree *Tree) error

	// UpdateStatus changes tree status (PUPUK)
	UpdateStatus(ctx context.Context, id string, status TreeStatus, healthScore int) error

	// Delete removes a tree (GUSUR)
	Delete(ctx context.Context, id string) error

	// GetNextCode generates next C-code (C001, C002, etc.)
	GetNextCode(ctx context.Context) (string, error)

	// CountByLocation counts trees in a location
	CountByLocation(ctx context.Context, locationID string) (int64, error)

	// CountByStatus counts trees by status
	CountByStatus(ctx context.Context, status TreeStatus) (int64, error)
}

// TreeService handles tree business logic
type TreeService struct {
	repo           TreeRepository
	monitoringRepo MonitoringRepository
}

// MonitoringRepository interface for logging tree changes
type MonitoringRepository interface {
	CreateLog(ctx context.Context, log *MonitoringLog) error
}

// MonitoringLog represents a tree monitoring event
type MonitoringLog struct {
	ID             string
	TreeID         string
	TreeCode       string
	Status         TreeStatus
	HealthScore    int
	Notes          string
	MonitoredBy    string
	MonitoringDate time.Time
}

// NewTreeService creates a new tree service
func NewTreeService(repo TreeRepository, monitoringRepo MonitoringRepository) *TreeService {
	return &TreeService{
		repo:           repo,
		monitoringRepo: monitoringRepo,
	}
}

// RegisterTreeRequest represents request to register a new tree
type RegisterTreeRequest struct {
	SpeciesID    string
	LocationID   string
	PlantingDate time.Time
	HeightMeters float64
	DiameterCm   float64
	Notes        string
	RegisteredBy string
}

// Validate validates the registration request
func (r *RegisterTreeRequest) Validate() error {
	if r.SpeciesID == "" {
		return errors.New("species ID is required")
	}
	if r.LocationID == "" {
		return errors.New("location ID is required")
	}
	if r.PlantingDate.IsZero() {
		return errors.New("planting date is required")
	}
	if r.PlantingDate.After(time.Now()) {
		return errors.New("planting date cannot be in the future")
	}
	if r.RegisteredBy == "" {
		return errors.New("registered by is required")
	}
	return nil
}

// RegisterNewTree registers a new tree in the system
func (s *TreeService) RegisterNewTree(ctx context.Context, req RegisterTreeRequest) (*Tree, error) {
	// 1. Validate request
	if err := req.Validate(); err != nil {
		return nil, fmt.Errorf("validation error: %w", err)
	}

	// 2. Generate next C-code
	code, err := s.repo.GetNextCode(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to generate tree code: %w", err)
	}

	// 3. Create tree entity
	tree := &Tree{
		ID:           uuid.New().String(),
		Code:         code,
		SpeciesID:    req.SpeciesID,
		LocationID:   req.LocationID,
		PlantingDate: req.PlantingDate,
		AgeYears:     0, // Will be calculated
		HeightMeters: req.HeightMeters,
		DiameterCm:   req.DiameterCm,
		Status:       StatusSehat, // Default to healthy
		HealthScore:  100,         // Default perfect health
		Notes:        req.Notes,
		RegisteredBy: req.RegisteredBy,
		CreatedAt:    time.Now().UTC(),
		UpdatedAt:    time.Now().UTC(),
	}

	// 4. Calculate age
	tree.AgeYears = tree.CalculateAge()

	// 5. Validate tree entity
	if err := tree.Validate(); err != nil {
		return nil, fmt.Errorf("tree validation error: %w", err)
	}

	// 6. Save to repository
	if err := s.repo.Create(ctx, tree); err != nil {
		return nil, fmt.Errorf("failed to create tree: %w", err)
	}

	// 7. Create initial monitoring log so tree appears in history immediately
	now := time.Now().UTC()
	initialLog := &MonitoringLog{
		ID:             uuid.New().String(),
		TreeID:         tree.ID, // ✅ Populate TreeID
		TreeCode:       tree.Code,
		Status:         tree.Status,
		HealthScore:    tree.HealthScore,
		MonitoringDate: now,
		MonitoredBy:    tree.RegisteredBy,
		Notes:          "Pohon terdaftar (Initial registration)",
	}

	// Create log but don't fail tree creation if logging fails
	if err := s.monitoringRepo.CreateLog(ctx, initialLog); err != nil {
		// Log the error but continue - tree creation succeeded
		fmt.Printf("⚠️ Warning: Failed to create initial monitoring log for tree %s: %v\n", tree.Code, err)
	} else {
		fmt.Printf("✅ Initial monitoring log created for tree %s\n", tree.Code)
	}

	return tree, nil
}

// UpdateTreeCondition updates tree status and health
// UpdateTreeCondition updates tree status and health
func (s *TreeService) UpdateTreeCondition(ctx context.Context, code string, newStatus TreeStatus, healthScore int, notes string, userID string) error {
	// 1. Get existing tree
	tree, err := s.repo.FindByCode(ctx, code)
	if err != nil {
		return fmt.Errorf("tree not found: %w", err)
	}

	// 2. Validate status transition
	if err := tree.CanUpdateStatus(newStatus); err != nil {
		return fmt.Errorf("invalid status transition: %w", err)
	}

	// 3. Validate health score
	if healthScore < 0 || healthScore > 100 {
		return errors.New("health score must be between 0 and 100")
	}

	// 4. Update tree
	tree.Status = newStatus
	tree.HealthScore = healthScore
	if notes != "" {
		tree.Notes = notes
	}
	tree.UpdatedAt = time.Now().UTC()

	// 5. Save changes to trees table
	if err := s.repo.Update(ctx, tree); err != nil {
		return fmt.Errorf("failed to update tree: %w", err)
	}

	// ✅ USER'S BRILLIANT FIX: Use tree.UpdatedAt for monitoring log (same timestamp!)
	fmt.Printf("⏰ Creating monitoring log for tree %s (status: %s, health: %d)\n", tree.Code, newStatus, healthScore)
	fmt.Printf("🕐 Using tree.UpdatedAt: %s\n", tree.UpdatedAt.Format("2006-01-02 15:04:05"))

	monitoringLog := &MonitoringLog{
		ID:             uuid.New().String(),
		TreeID:         tree.ID, // ✅ Populate TreeID from tree object
		TreeCode:       tree.Code,
		Status:         newStatus,
		HealthScore:    healthScore,
		Notes:          notes,
		MonitoredBy:    userID,         // ✅ Use actual User ID
		MonitoringDate: tree.UpdatedAt, // ✅ COPY from tree.UpdatedAt (SAME source!)
	}

	fmt.Printf("📅 MonitoringDate being saved: %s\n", monitoringLog.MonitoringDate.Format("2006-01-02 15:04:05"))

	if err := s.monitoringRepo.CreateLog(ctx, monitoringLog); err != nil {
		// Log error but don't fail the update
		// Tree update succeeded, logging is secondary
		fmt.Printf("❌ ERROR: Failed to create monitoring log: %v\n", err)
	} else {
		fmt.Printf("✅ Successfully created monitoring log for %s\n", tree.Code)
	}

	return nil
}

// GetTreeByCode retrieves tree by its C-code
func (s *TreeService) GetTreeByCode(ctx context.Context, code string) (*Tree, error) {
	tree, err := s.repo.FindByCode(ctx, code)
	if err != nil {
		return nil, fmt.Errorf("tree not found: %w", err)
	}
	return tree, nil
}

// ListTrees retrieves trees with optional filters
func (s *TreeService) ListTrees(ctx context.Context, filter TreeFilter) ([]*Tree, error) {
	trees, err := s.repo.FindAll(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to list trees: %w", err)
	}
	return trees, nil
}

// DeleteTree removes a tree from the system
func (s *TreeService) DeleteTree(ctx context.Context, code string) error {
	// 1. Get tree first
	tree, err := s.repo.FindByCode(ctx, code)
	if err != nil {
		return fmt.Errorf("tree not found: %w", err)
	}

	// 2. Delete tree
	if err := s.repo.Delete(ctx, tree.ID); err != nil {
		return fmt.Errorf("failed to delete tree: %w", err)
	}

	return nil
}

// GetTreeStatistics retrieves statistics about trees including growth and maintenance needs
func (s *TreeService) GetTreeStatistics(ctx context.Context) (*TreeStatistics, error) {
	stats := &TreeStatistics{
		MonthlyGrowth: make(map[string]int),
		Maintenance:   []Tree{},
	}

	// Fetch all trees to perform aggregation (SawitDB works best in memory for stats)
	allTrees, err := s.repo.FindAll(ctx, TreeFilter{})
	if err != nil {
		return nil, err
	}

	now := time.Now()

	stats.TotalCount = len(allTrees)

	for _, t := range allTrees {
		// 1. Count by Status
		switch t.Status {
		case StatusSehat:
			stats.HealthyCount++
		case StatusSakit:
			stats.SickCount++
		case StatusMati:
			stats.DeadCount++
		case StatusDipupuk:
			stats.FertilizedCount++
		case StatusDipantau:
			stats.MonitoredCount++
		}

		// 2. Monthly Growth (Planting Date)
		// Format: "YYYY-MM"
		if !t.PlantingDate.IsZero() {
			monthKey := t.PlantingDate.Format("2006-01")
			stats.MonthlyGrowth[monthKey]++
		}

		// 3. Identify Maintenance Candidates (Top 5 Priority)
		// Priority: SAKIT (Any), SEHAT (>30 days since update), Score < 50
		needsAttention := false

		// If Sick, always needs attention
		if t.Status == StatusSakit {
			needsAttention = true
		}

		// If Health Score drops below 50
		if t.HealthScore < 50 && t.Status != StatusMati {
			needsAttention = true
		}

		// If not updated in 30 days (Maintenance overdue)
		// Approximate using UpdatedAt or PlantingDate if UpdatedAt is zero
		lastActivity := t.UpdatedAt
		if lastActivity.IsZero() {
			lastActivity = t.PlantingDate
		}
		daysSince := now.Sub(lastActivity).Hours() / 24
		if daysSince > 30 && t.Status != StatusMati {
			needsAttention = true
		}

		if needsAttention {
			// Prepend to list (simple LIFO or just append)
			// Limit to 5 for dashboard
			if len(stats.Maintenance) < 5 {
				stats.Maintenance = append(stats.Maintenance, *t)
			}
		}
	}

	return stats, nil
}

// TreeStatistics represents tree statistics
type TreeStatistics struct {
	TotalCount      int            `json:"total"`
	HealthyCount    int            `json:"healthy"`
	SickCount       int            `json:"sick"`
	DeadCount       int            `json:"dead"`
	FertilizedCount int            `json:"fertilized"`
	MonitoredCount  int            `json:"monitored"`
	MonthlyGrowth   map[string]int `json:"monthly_growth"`
	Maintenance     []Tree         `json:"maintenance"` // List of trees needing attention
}
