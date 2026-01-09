package monitoring_repository

import (
	"context"
	"fmt"

	"prabogo/utils/activity"
	"prabogo/utils/database"
)

type MonitoringLog struct {
	ID             string `json:"id"`
	TreeCode       string `json:"tree_code"`
	Status         string `json:"status"`
	HealthScore    int    `json:"health_score"`
	Notes          string `json:"notes"`
	MonitoredBy    string `json:"monitored_by"`
	MonitoringDate string `json:"monitoring_date"`
	CreatedAt      string `json:"created_at"`
}

type MonitoringRepository struct {
	db *database.Database
}

func NewMonitoringRepository(db *database.Database) *MonitoringRepository {
	return &MonitoringRepository{db: db}
}

// GetLogsByTreeCode gets all monitoring logs for a specific tree
func (r *MonitoringRepository) GetLogsByTreeCode(ctx context.Context, treeCode string) ([]MonitoringLog, error) {
	activity.Log(ctx, "MonitoringRepository.GetLogsByTreeCode", "tree_code", treeCode)

	query := `
		FOR log IN monitoring_logs
			FILTER log.tree_code == @tree_code
			SORT log.monitoring_date DESC, log.created_at DESC
			RETURN {
				id: log._key,
				tree_code: log.tree_code,
				status: log.status,
				health_score: log.health_score,
				notes: log.notes,
				monitored_by: log.monitored_by,
				monitoring_date: log.monitoring_date,
				created_at: log.created_at
			}
	`

	bindVars := map[string]interface{}{
		"tree_code": treeCode,
	}

	cursor, err := r.db.Query(ctx, query, bindVars)
	if err != nil {
		return nil, fmt.Errorf("failed to query monitoring logs: %w", err)
	}
	defer cursor.Close()

	var logs []MonitoringLog
	for cursor.HasMore() {
		var log MonitoringLog
		_, err := cursor.ReadDocument(ctx, &log)
		if err != nil {
			return nil, fmt.Errorf("failed to read log document: %w", err)
		}
		logs = append(logs, log)
	}

	return logs, nil
}

// Create creates a new monitoring log entry
func (r *MonitoringRepository) Create(ctx context.Context, log MonitoringLog) error {
	activity.Log(ctx, "MonitoringRepository.Create", "tree_code", log.TreeCode)

	query := `
		INSERT {
			_key: @id,
			tree_code: @tree_code,
			status: @status,
			health_score: @health_score,
			notes: @notes,
			monitored_by: @monitored_by,
			monitoring_date: @monitoring_date,
			created_at: DATE_ISO8601(DATE_NOW())
		} INTO monitoring_logs
	`

	bindVars := map[string]interface{}{
		"id":              log.ID,
		"tree_code":       log.TreeCode,
		"status":          log.Status,
		"health_score":    log.HealthScore,
		"notes":           log.Notes,
		"monitored_by":    log.MonitoredBy,
		"monitoring_date": log.MonitoringDate,
	}

	_, err := r.db.Query(ctx, query, bindVars)
	if err != nil {
		return fmt.Errorf("failed to create monitoring log: %w", err)
	}

	return nil
}
