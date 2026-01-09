package tree_repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"prabogo/internal/domain/tree"
	"prabogo/internal/safeaql"
)

// TreeRepositoryAdapter implements TreeRepository using AQL
type TreeRepositoryAdapter struct {
	safeExec *safeaql.SafeExecutor
}

// NewTreeRepository creates new tree repository
func NewTreeRepository(db *sql.DB) tree.TreeRepository {
	return &TreeRepositoryAdapter{
		safeExec: safeaql.NewSafeExecutor(db),
	}
}

// Create inserts new tree using TANAM KE
func (r *TreeRepositoryAdapter) Create(ctx context.Context, t *tree.Tree) error {
	return r.safeExec.Insert(ctx, "trees",
		[]string{"id", "code", "species_id", "location_id", "planting_date", "age_years",
			"height_meters", "diameter_cm", "status", "health_score", "notes", "registered_by"},
		[]interface{}{t.ID, t.Code, t.SpeciesID, t.LocationID, t.PlantingDate.Format("2006-01-02"), t.AgeYears,
			t.HeightMeters, t.DiameterCm, string(t.Status), t.HealthScore, t.Notes, t.RegisteredBy})
}

// FindByCode retrieves tree by C-code using PANEN
func (r *TreeRepositoryAdapter) FindByCode(ctx context.Context, code string) (*tree.Tree, error) {
	rows, err := r.safeExec.Select(ctx, "trees", "*", fmt.Sprintf("code='%s'", code))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if !rows.Next() {
		return nil, fmt.Errorf("tree with code %s not found", code)
	}

	return r.scanTree(rows)
}

// FindByID retrieves tree by ID using PANEN
func (r *TreeRepositoryAdapter) FindByID(ctx context.Context, id string) (*tree.Tree, error) {
	rows, err := r.safeExec.Select(ctx, "trees", "*", fmt.Sprintf("id='%s'", id))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if !rows.Next() {
		return nil, fmt.Errorf("tree with id %s not found", id)
	}

	return r.scanTree(rows)
}

// FindAll retrieves trees with filter using PANEN
func (r *TreeRepositoryAdapter) FindAll(ctx context.Context, filter tree.TreeFilter) ([]*tree.Tree, error) {
	where := r.buildWhereClause(filter)

	// Add LIMIT and OFFSET to WHERE clause
	if filter.Limit > 0 {
		where += fmt.Sprintf(" LIMIT %d", filter.Limit)
	}
	if filter.Offset > 0 {
		where += fmt.Sprintf(" OFFSET %d", filter.Offset)
	}

	rows, err := r.safeExec.Select(ctx, "trees", "*", where)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var trees []*tree.Tree
	for rows.Next() {
		t, err := r.scanTree(rows)
		if err != nil {
			return nil, err
		}
		trees = append(trees, t)
	}

	return trees, nil
}

// Update modifies tree using PUPUK
func (r *TreeRepositoryAdapter) Update(ctx context.Context, t *tree.Tree) error {
	set := fmt.Sprintf("species_id='%s', location_id='%s', planting_date='%s', "+
		"age_years=%d, height_meters=%.2f, diameter_cm=%.2f, status='%s', "+
		"health_score=%d, notes='%s', updated_at=CURRENT_TIMESTAMP",
		t.SpeciesID, t.LocationID, t.PlantingDate.Format("2006-01-02"),
		t.AgeYears, t.HeightMeters, t.DiameterCm, string(t.Status),
		t.HealthScore, t.Notes)

	where := fmt.Sprintf("id='%s'", t.ID)
	return r.safeExec.Update(ctx, "trees", set, where)
}

// UpdateStatus changes tree status using PUPUK
func (r *TreeRepositoryAdapter) UpdateStatus(ctx context.Context, id string, status tree.TreeStatus, healthScore int) error {
	set := fmt.Sprintf("status='%s', health_score=%d, updated_at=CURRENT_TIMESTAMP",
		string(status), healthScore)
	where := fmt.Sprintf("id='%s'", id)
	return r.safeExec.Update(ctx, "trees", set, where)
}

// Delete removes tree using GUSUR
func (r *TreeRepositoryAdapter) Delete(ctx context.Context, id string) error {
	where := fmt.Sprintf("id='%s'", id)
	return r.safeExec.Delete(ctx, "trees", where)
}

// GetNextCode generates next C-code
func (r *TreeRepositoryAdapter) GetNextCode(ctx context.Context) (string, error) {
	// Query max code
	rows, err := r.safeExec.Select(ctx, "trees", "code", "1=1 ORDER BY code DESC LIMIT 1")
	if err != nil {
		return "", err
	}
	defer rows.Close()

	var maxCode string
	if rows.Next() {
		rows.Scan(&maxCode)
	}

	if maxCode == "" {
		return "C001", nil
	}

	// Extract number and increment
	var num int
	fmt.Sscanf(maxCode, "C%d", &num)
	num++

	return fmt.Sprintf("C%03d", num), nil
}

// CountByLocation counts trees in location
func (r *TreeRepositoryAdapter) CountByLocation(ctx context.Context, locationID string) (int64, error) {
	return r.safeExec.Count(ctx, "trees", fmt.Sprintf("location_id='%s'", locationID))
}

// CountByStatus counts trees by status
func (r *TreeRepositoryAdapter) CountByStatus(ctx context.Context, status tree.TreeStatus) (int64, error) {
	return r.safeExec.Count(ctx, "trees", fmt.Sprintf("status='%s'", string(status)))
}

// Helper: Build WHERE clause from filter
func (r *TreeRepositoryAdapter) buildWhereClause(filter tree.TreeFilter) string {
	conditions := []string{}

	if filter.LocationID != "" {
		conditions = append(conditions, fmt.Sprintf("location_id='%s'", filter.LocationID))
	}
	if filter.SpeciesID != "" {
		conditions = append(conditions, fmt.Sprintf("species_id='%s'", filter.SpeciesID))
	}
	if filter.Status != "" {
		conditions = append(conditions, fmt.Sprintf("status='%s'", string(filter.Status)))
	}

	if len(conditions) == 0 {
		return "1=1"
	}

	where := conditions[0]
	for i := 1; i < len(conditions); i++ {
		where += " AND " + conditions[i]
	}

	return where
}

// Helper: Scan database row to Tree entity
func (r *TreeRepositoryAdapter) scanTree(rows *sql.Rows) (*tree.Tree, error) {
	var t tree.Tree
	var statusStr string
	var plantingDate string

	err := rows.Scan(
		&t.ID, &t.Code, &t.SpeciesID, &t.LocationID, &plantingDate, &t.AgeYears,
		&t.HeightMeters, &t.DiameterCm, &statusStr, &t.HealthScore, &t.Notes,
		&t.RegisteredBy, &t.CreatedAt, &t.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	// Parse planting date
	t.PlantingDate, _ = time.Parse("2006-01-02", plantingDate)
	t.Status = tree.TreeStatus(statusStr)

	return &t, nil
}
