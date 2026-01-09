package monitoring_repository

import (
	"context"
	"database/sql"

	"prabogo/internal/safeaql"
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
	safeExec *safeaql.SafeExecutor
}

func NewMonitoringRepository(db *sql.DB) *MonitoringRepository {
	return &MonitoringRepository{
		safeExec: safeaql.NewSafeExecutor(db),
	}
}

// GetLogsByTreeCode gets all monitoring logs for a specific tree
func (r *MonitoringRepository) GetLogsByTreeCode(ctx context.Context, treeCode string) ([]MonitoringLog, error) {
	// Use Select with WHERE clause
	where := "tree_code = '" + treeCode + "' ORDER BY monitoring_date DESC, created_at DESC"
	rows, err := r.safeExec.Select(ctx, "monitoring_logs", "*", where)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logs []MonitoringLog
	for rows.Next() {
		var log MonitoringLog
		var id sql.NullString
		err := rows.Scan(&id, &log.TreeCode, &log.Status, &log.HealthScore,
			&log.Notes, &log.MonitoredBy, &log.MonitoringDate, &log.CreatedAt)
		if err != nil {
			continue
		}
		if id.Valid {
			log.ID = id.String
		}
		logs = append(logs, log)
	}

	return logs, nil
}
