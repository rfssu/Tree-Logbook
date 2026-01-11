package monitoring_repository

import (
	"context"
	"database/sql"
	"fmt"

	"prabogo/internal/domain/tree"
)

type MonitoringLog struct {
	ID           string  `json:"id"`
	TreeID       string  `json:"tree_id"`
	MonitorDate  string  `json:"monitor_date"`
	Status       string  `json:"status"`
	HealthScore  int     `json:"health_score"`
	HeightMeters float64 `json:"height_meters"`
	DiameterCm   float64 `json:"diameter_cm"`
	Observations string  `json:"observations"`
	ActionsTaken string  `json:"actions_taken"`
	MonitoredBy  string  `json:"monitored_by"`
	CreatedAt    string  `json:"created_at"`
}

type MonitoringRepository struct {
	db *sql.DB
}

func NewMonitoringRepository(db *sql.DB) *MonitoringRepository {
	return &MonitoringRepository{
		db: db,
	}
}

// GetLogsByTreeCode gets all monitoring logs for a specific tree
func (r *MonitoringRepository) GetLogsByTreeCode(ctx context.Context, treeCode string) ([]MonitoringLog, error) {
	// First get tree ID from code
	var treeID string
	err := r.db.QueryRowContext(ctx, "SELECT id FROM trees WHERE code = $1", treeCode).Scan(&treeID)
	if err != nil {
		return nil, fmt.Errorf("tree not found: %w", err)
	}

	// Query monitoring logs with correct column names
	query := `
		SELECT id, tree_id, monitor_date, status, health_score, 
		       height_meters, diameter_cm, observations, actions_taken,
		       monitored_by, created_at
		FROM monitoring_logs
		WHERE tree_id = $1
		ORDER BY monitor_date DESC, created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, treeID)
	if err != nil {
		return nil, fmt.Errorf("query error: %w", err)
	}
	defer rows.Close()

	var logs []MonitoringLog
	for rows.Next() {
		var log MonitoringLog
		err := rows.Scan(
			&log.ID,
			&log.TreeID,
			&log.MonitorDate,
			&log.Status,
			&log.HealthScore,
			&log.HeightMeters,
			&log.DiameterCm,
			&log.Observations,
			&log.ActionsTaken,
			&log.MonitoredBy,
			&log.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("scan error: %w", err)
		}
		logs = append(logs, log)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %w", err)
	}

	// DEBUG: Log what we're returning
	if len(logs) > 0 {
		fmt.Printf("🔍 First log monitor_date from DB: '%s'\n", logs[0].MonitorDate)
		fmt.Printf("🔍 First log created_at from DB: '%s'\n", logs[0].CreatedAt)
	}

	return logs, nil
}

// CreateLog inserts a new monitoring log - implements tree.MonitoringRepository interface
func (r *MonitoringRepository) CreateLog(ctx context.Context, log *tree.MonitoringLog) error {
	// Get tree ID from tree code
	var treeID string
	err := r.db.QueryRowContext(ctx, "SELECT id FROM trees WHERE code = $1", log.TreeCode).Scan(&treeID)
	if err != nil {
		return fmt.Errorf("tree not found: %w", err)
	}

	// Also get current tree height/diameter for logging
	var heightMeters, diameterCm float64
	err = r.db.QueryRowContext(ctx,
		"SELECT height_meters, diameter_cm FROM trees WHERE code = $1",
		log.TreeCode).Scan(&heightMeters, &diameterCm)
	if err != nil {
		// If can't get dimensions, use 0 as default
		heightMeters = 0
		diameterCm = 0
	}

	query := `
		INSERT INTO monitoring_logs (
			id, tree_id, monitor_date, status, health_score, 
			height_meters, diameter_cm, observations, actions_taken, 
			monitored_by, created_at
		)
		VALUES ($1, $2, NOW(), $3, $4, $5, $6, $7, $8, $9, NOW())
	`

	_, err = r.db.ExecContext(ctx, query,
		log.ID,
		treeID,
		// $3 is NOW() - PostgreSQL current timestamp!
		string(log.Status),
		log.HealthScore,
		heightMeters,
		diameterCm,
		log.Notes,
		"Dashboard status update",
		log.MonitoredBy,
	)

	if err != nil {
		return fmt.Errorf("failed to insert monitoring log: %w", err)
	}

	return nil
}
