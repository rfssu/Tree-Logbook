package tree

import (
	"context"
	"time"
)

// TreeUseCase handles tree use cases
type TreeUseCase struct {
	service *TreeService
}

// NewTreeUseCase creates a new tree use case
func NewTreeUseCase(repo TreeRepository, monitoringRepo MonitoringRepository) *TreeUseCase {
	return &TreeUseCase{
		service: NewTreeService(repo, monitoringRepo),
	}
}

// TreeResponse represents tree data for API responses
type TreeResponse struct {
	ID                   string  `json:"id"`
	Code                 string  `json:"code"`
	SpeciesID            string  `json:"species_id"`
	LocationID           string  `json:"location_id"`
	PlantingDate         string  `json:"planting_date"`
	AgeYears             int     `json:"age_years"`
	HeightMeters         float64 `json:"height_meters"`
	DiameterCm           float64 `json:"diameter_cm"`
	Status               string  `json:"status"`
	HealthScore          int     `json:"health_score"`
	Notes                string  `json:"notes"`
	RegisteredBy         string  `json:"registered_by"`
	RegisteredByUsername string  `json:"registered_by_username"` // Populated by handler
	CreatedAt            string  `json:"created_at"`
	UpdatedAt            string  `json:"updated_at"`
}

// RegisterTree registers a new tree
func (uc *TreeUseCase) RegisterTree(ctx context.Context, req RegisterTreeRequest) (*TreeResponse, error) {
	tree, err := uc.service.RegisterNewTree(ctx, req)
	if err != nil {
		return nil, err
	}
	return toTreeResponse(tree), nil
}

// GetTreeByCode retrieves tree by C-code
func (uc *TreeUseCase) GetTreeByCode(ctx context.Context, code string) (*TreeResponse, error) {
	tree, err := uc.service.GetTreeByCode(ctx, code)
	if err != nil {
		return nil, err
	}
	return toTreeResponse(tree), nil
}

// ListTrees retrieves trees with filter
func (uc *TreeUseCase) ListTrees(ctx context.Context, filter TreeFilter) ([]*TreeResponse, error) {
	trees, err := uc.service.ListTrees(ctx, filter)
	if err != nil {
		return nil, err
	}
	return toTreeResponses(trees), nil
}

// UpdateTreeStatus updates tree condition
func (uc *TreeUseCase) UpdateTreeStatus(ctx context.Context, code string, status TreeStatus, healthScore int, notes string, userID string) error {
	return uc.service.UpdateTreeCondition(ctx, code, status, healthScore, notes, userID)
}

// DeleteTree removes a tree
func (uc *TreeUseCase) DeleteTree(ctx context.Context, code string) error {
	return uc.service.DeleteTree(ctx, code)
}

// GetStatistics retrieves tree statistics
func (uc *TreeUseCase) GetStatistics(ctx context.Context) (*TreeStatisticsResponse, error) {
	stats, err := uc.service.GetTreeStatistics(ctx)
	if err != nil {
		return nil, err
	}
	return toStatisticsResponse(stats), nil
}

// TreeStatisticsResponse for API
type TreeStatisticsResponse struct {
	Total      int `json:"total"`
	Healthy    int `json:"healthy"`
	Sick       int `json:"sick"`
	Dead       int `json:"dead"`
	Fertilized int `json:"fertilized"`
	Monitored  int `json:"monitored"`
}

// Helper: Convert Tree entity to TreeResponse
func toTreeResponse(t *Tree) *TreeResponse {
	return &TreeResponse{
		ID:           t.ID,
		Code:         t.Code,
		SpeciesID:    t.SpeciesID,
		LocationID:   t.LocationID,
		PlantingDate: t.PlantingDate.Format("2006-01-02"),
		AgeYears:     t.AgeYears,
		HeightMeters: t.HeightMeters,
		DiameterCm:   t.DiameterCm,
		Status:       string(t.Status),
		HealthScore:  t.HealthScore,
		Notes:        t.Notes,
		RegisteredBy: t.RegisteredBy,
		CreatedAt:    t.CreatedAt.Format(time.RFC3339),
		UpdatedAt:    t.UpdatedAt.Format(time.RFC3339),
	}
}

// Helper: Convert multiple trees
func toTreeResponses(trees []*Tree) []*TreeResponse {
	responses := make([]*TreeResponse, len(trees))
	for i, tree := range trees {
		responses[i] = toTreeResponse(tree)
	}
	return responses
}

// Helper: Convert statistics
func toStatisticsResponse(stats *TreeStatistics) *TreeStatisticsResponse {
	return &TreeStatisticsResponse{
		Total:      stats.TotalCount,
		Healthy:    stats.HealthyCount,
		Sick:       stats.SickCount,
		Dead:       stats.DeadCount,
		Fertilized: stats.FertilizedCount,
		Monitored:  stats.MonitoredCount,
	}
}
