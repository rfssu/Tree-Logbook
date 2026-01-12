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
	// 🔧 Auto-create 'trees' collection if not exists (SawitDB 'LAHAN trees' is idempotent)
	// We use background context as this is initialization
	_, _ = client.Query(context.Background(), "LAHAN trees")

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

// FindAll retrieves trees with optional filter
func (r *TreeRepository) FindAll(ctx context.Context, filter tree.TreeFilter) ([]*tree.Tree, error) {
	// Build AQL query with filters
	aql := "PANEN * DARI trees"

	// TODO: Add WHERE clauses based on filter
	// For now, return all trees

	// Execute query (Fetch ALL - avoid fragile AQL offset/filters)
	result, err := r.client.Query(ctx, aql)
	if err != nil {
		return nil, fmt.Errorf("failed to query trees: %w", err)
	}

	allTrees, err := r.parseTreeResults(result)
	if err != nil {
		return nil, err
	}

	// 🛡️ Robust In-Memory Filtering & Pagination
	var filtered []*tree.Tree

	for _, t := range allTrees {
		// Filter by Location
		if filter.LocationID != "" && t.LocationID != filter.LocationID {
			continue
		}
		// Filter by Species
		if filter.SpeciesID != "" && t.SpeciesID != filter.SpeciesID {
			continue
		}
		// Filter by Status
		if filter.Status != "" && t.Status != filter.Status {
			continue
		}
		filtered = append(filtered, t)
	}

	// Pagination logic
	total := len(filtered)
	start := filter.Offset
	if start >= total {
		return []*tree.Tree{}, nil
	}

	end := start + filter.Limit
	if end > total {
		end = total
	}

	return filtered[start:end], nil
}

// UpdateStatus updates tree status and health score
func (r *TreeRepository) UpdateStatus(ctx context.Context, id string, status tree.TreeStatus, healthScore int) error {
	aql := fmt.Sprintf(`
		PUPUK trees DENGAN
			status='%s',
			health_score=%d,
			updated_at='%s'
		DIMANA id='%s'
	`,
		string(status), healthScore,
		time.Now().UTC().Format(time.RFC3339),
		id,
	)

	_, err := r.client.Query(ctx, aql)
	if err != nil {
		return fmt.Errorf("failed to update status: %w", err)
	}

	return nil
}

// GetNextCode generates next C-code (C001, C002, etc.)
func (r *TreeRepository) GetNextCode(ctx context.Context) (string, error) {
	// Query to get max code
	aql := "PANEN code DARI trees"

	result, err := r.client.Query(ctx, aql)
	if err != nil {
		return "", fmt.Errorf("failed to query codes: %w", err)
	}

	// Parse codes and find max number
	maxNum := 0
	if result != nil {
		resultJSON, _ := json.Marshal(result)
		var codes []map[string]interface{}
		json.Unmarshal(resultJSON, &codes)

		for _, item := range codes {
			if codeVal, ok := item["code"]; ok {
				if code, ok := codeVal.(string); ok && len(code) > 1 && code[0] == 'C' {
					var num int
					fmt.Sscanf(code, "C%d", &num)
					if num > maxNum {
						maxNum = num
					}
				}
			}
		}
	}

	// Generate next code
	nextCode := fmt.Sprintf("C%03d", maxNum+1)
	return nextCode, nil
}

// CountByLocation counts trees in a location
func (r *TreeRepository) CountByLocation(ctx context.Context, locationID string) (int64, error) {
	aql := fmt.Sprintf("PANEN * DARI trees DIMANA location_id='%s'", locationID)

	result, err := r.client.Query(ctx, aql)
	if err != nil {
		return 0, fmt.Errorf("failed to count trees: %w", err)
	}

	trees, err := r.parseTreeResults(result)
	if err != nil {
		return 0, err
	}

	return int64(len(trees)), nil
}

// CountByStatus counts trees by status
func (r *TreeRepository) CountByStatus(ctx context.Context, status tree.TreeStatus) (int64, error) {
	aql := fmt.Sprintf("PANEN * DARI trees DIMANA status='%s'", string(status))

	result, err := r.client.Query(ctx, aql)
	if err != nil {
		return 0, fmt.Errorf("failed to count trees: %w", err)
	}

	trees, err := r.parseTreeResults(result)
	if err != nil {
		return 0, err
	}

	return int64(len(trees)), nil
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
	var rawTrees []map[string]interface{}

	// Check if result is already a JSON string (from TCP client)
	if jsonStr, ok := result.(string); ok {
		// Check if the string itself is a reported error from the engine (e.g. "Error: ...")
		if len(jsonStr) >= 5 && jsonStr[:5] == "Error" {
			return nil, fmt.Errorf("sawitdb engine error: %s", jsonStr)
		}

		// Direct unmarshal from JSON string
		err := json.Unmarshal([]byte(jsonStr), &rawTrees)
		if err != nil {
			// If unmarshal fails, it might be an obscure error message or invalid data
			return nil, fmt.Errorf("failed to unmarshal JSON string: %w (content: %s)", err, jsonStr)
		}
	} else {
		// SawitDB returns []interface{} with map[string]interface{} items
		resultJSON, err := json.Marshal(result)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal result: %w", err)
		}

		err = json.Unmarshal(resultJSON, &rawTrees)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal result: %w", err)
		}
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
