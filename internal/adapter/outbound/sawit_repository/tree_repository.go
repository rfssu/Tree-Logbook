package sawit_repository

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"prabogo/internal/adapter/outbound/sawit_client"
	"prabogo/internal/domain/tree"
)

// TreeRepository implements tree.TreeRepository using SawitDB
type TreeRepository struct {
	client *sawit_client.SawitClient
}

// NewTreeRepository creates a new SawitDB tree repository
func NewTreeRepository(client *sawit_client.SawitClient) tree.TreeRepository {
	return &TreeRepository{client: client}
}

// Create inserts a new tree into SawitDB
func (r *TreeRepository) Create(ctx context.Context, t *tree.Tree) error {
	aql := fmt.Sprintf(`
		TANAM KE trees (
			id, code, species_id, location_id, planting_date,
			age_years, height_meters, diameter_cm, status,
			health_score, notes, registered_by, created_at, updated_at
		) BIBIT (
			'%s', '%s', '%s', '%s', '%s',
			%d, %.2f, %.2f, '%s',
			%d, '%s', '%s', '%s', '%s'
		)
	`,
		t.ID, t.Code, t.SpeciesID, t.LocationID, t.PlantingDate.Format("2006-01-02"),
		t.AgeYears, t.HeightMeters, t.DiameterCm, string(t.Status),
		t.HealthScore, t.Notes, t.RegisteredBy,
		t.CreatedAt.UTC().Format(time.RFC3339),
		t.UpdatedAt.UTC().Format(time.RFC3339),
	)

	_, err := r.client.Query(ctx, aql)
	if err != nil {
		return fmt.Errorf("failed to create tree: %w", err)
	}

	return nil
}

// FindByCode retrieves a tree by its code
func (r *TreeRepository) FindByCode(ctx context.Context, code string) (*tree.Tree, error) {
	aql := fmt.Sprintf("PANEN * DARI trees DIMANA code='%s'", code)

	result, err := r.client.Query(ctx, aql)
	if err != nil {
		return nil, fmt.Errorf("failed to query tree: %w", err)
	}

	// Parse result
	trees, err := r.parseTreeResults(result)
	if err != nil {
		return nil, err
	}

	if len(trees) == 0 {
		return nil, fmt.Errorf("tree with code %s not found", code)
	}

	return trees[0], nil
}

// FindByID retrieves a tree by its ID
func (r *TreeRepository) FindByID(ctx context.Context, id string) (*tree.Tree, error) {
	aql := fmt.Sprintf("PANEN * DARI trees DIMANA id='%s'", id)

	result, err := r.client.Query(ctx, aql)
	if err != nil {
		return nil, fmt.Errorf("failed to query tree: %w", err)
	}

	trees, err := r.parseTreeResults(result)
	if err != nil {
		return nil, err
	}

	if len(trees) == 0 {
		return nil, fmt.Errorf("tree with id %s not found", id)
	}

	return trees[0], nil
}

// FindAll retrieves all trees
func (r *TreeRepository) FindAll(ctx context.Context) ([]*tree.Tree, error) {
	aql := "PANEN * DARI trees"

	result, err := r.client.Query(ctx, aql)
	if err != nil {
		return nil, fmt.Errorf("failed to query trees: %w", err)
	}

	return r.parseTreeResults(result)
}

// Update updates an existing tree
func (r *TreeRepository) Update(ctx context.Context, t *tree.Tree) error {
	aql := fmt.Sprintf(`
		PUPUK trees DENGAN
			species_id='%s',
			location_id='%s',
			planting_date='%s',
			age_years=%d,
			height_meters=%.2f,
			diameter_cm=%.2f,
			status='%s',
			health_score=%d,
			notes='%s',
			updated_at='%s'
		DIMANA id='%s'
	`,
		t.SpeciesID, t.LocationID, t.PlantingDate.Format("2006-01-02"),
		t.AgeYears, t.HeightMeters, t.DiameterCm,
		string(t.Status), t.HealthScore, t.Notes,
		time.Now().UTC().Format(time.RFC3339),
		t.ID,
	)

	_, err := r.client.Query(ctx, aql)
	if err != nil {
		return fmt.Errorf("failed to update tree: %w", err)
	}

	return nil
}

// Delete removes a tree
func (r *TreeRepository) Delete(ctx context.Context, id string) error {
	aql := fmt.Sprintf("GUSUR DARI trees DIMANA id='%s'", id)

	_, err := r.client.Query(ctx, aql)
	if err != nil {
		return fmt.Errorf("failed to delete tree: %w", err)
	}

	return nil
}

// parseTreeResults converts SawitDB result to tree structs
func (r *TreeRepository) parseTreeResults(result interface{}) ([]*tree.Tree, error) {
	// SawitDB returns []interface{} with map[string]interface{} items
	resultJSON, err := json.Marshal(result)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal result: %w", err)
	}

	var rawTrees []map[string]interface{}
	err = json.Unmarshal(resultJSON, &rawTrees)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal result: %w", err)
	}

	trees := make([]*tree.Tree, 0, len(rawTrees))
	for _, raw := range rawTrees {
		t, err := r.mapToTree(raw)
		if err != nil {
			return nil, fmt.Errorf("failed to map tree: %w", err)
		}
		trees = append(trees, t)
	}

	return trees, nil
}

// mapToTree converts map to Tree struct
func (r *TreeRepository) mapToTree(data map[string]interface{}) (*tree.Tree, error) {
	// Helper to get string value
	getString := func(key string) string {
		if v, ok := data[key]; ok && v != nil {
			return fmt.Sprintf("%v", v)
		}
		return ""
	}

	// Helper to get int value
	getInt := func(key string) int {
		if v, ok := data[key]; ok && v != nil {
			if f, ok := v.(float64); ok {
				return int(f)
			}
		}
		return 0
	}

	// Helper to get float value
	getFloat := func(key string) float64 {
		if v, ok := data[key]; ok && v != nil {
			if f, ok := v.(float64); ok {
				return f
			}
		}
		return 0.0
	}

	// Parse dates
	var plantingDate, createdAt, updatedAt time.Time
	if pd := getString("planting_date"); pd != "" {
		plantingDate, _ = time.Parse("2006-01-02", pd)
	}
	if ca := getString("created_at"); ca != "" {
		createdAt, _ = time.Parse(time.RFC3339, ca)
	}
	if ua := getString("updated_at"); ua != "" {
		updatedAt, _ = time.Parse(time.RFC3339, ua)
	}

	return &tree.Tree{
		ID:           getString("id"),
		Code:         getString("code"),
		SpeciesID:    getString("species_id"),
		LocationID:   getString("location_id"),
		PlantingDate: plantingDate,
		AgeYears:     getInt("age_years"),
		HeightMeters: getFloat("height_meters"),
		DiameterCm:   getFloat("diameter_cm"),
		Status:       tree.TreeStatus(getString("status")),
		HealthScore:  getInt("health_score"),
		Notes:        getString("notes"),
		RegisteredBy: getString("registered_by"),
		CreatedAt:    createdAt,
		UpdatedAt:    updatedAt,
	}, nil
}
