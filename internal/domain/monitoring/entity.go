package monitoring

import (
	"errors"
	"time"
)

// MonitoringLog entity represents a tree monitoring record
type MonitoringLog struct {
	ID           string
	TreeID       string
	MonitorDate  time.Time
	Status       string // Use string to avoid circular dependency
	HealthScore  int
	HeightMeters float64
	DiameterCm   float64
	Observations string
	ActionsTaken string
	MonitoredBy  string
	CreatedAt    time.Time
}

// Validate checks if monitoring log entity is valid
func (ml *MonitoringLog) Validate() error {
	if ml.TreeID == "" {
		return errors.New("tree ID is required")
	}
	if ml.MonitorDate.IsZero() {
		return errors.New("monitor date is required")
	}
	if ml.Status == "" {
		return errors.New("status is required")
	}
	if ml.HealthScore < 0 || ml.HealthScore > 100 {
		return errors.New("health score must be between 0 and 100")
	}
	if ml.MonitoredBy == "" {
		return errors.New("monitored by is required")
	}
	return nil
}

// IsRecentMonitoring returns true if monitoring was done in last 30 days
func (ml *MonitoringLog) IsRecentMonitoring() bool {
	return time.Since(ml.MonitorDate).Hours()/24 <= 30
}
