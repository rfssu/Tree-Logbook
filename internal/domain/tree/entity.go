package tree

import (
	"errors"
	"time"
)

// TreeStatus represents tree condition
type TreeStatus string

const (
	StatusSehat    TreeStatus = "SEHAT"
	StatusSakit    TreeStatus = "SAKIT"
	StatusMati     TreeStatus = "MATI"
	StatusDipupuk  TreeStatus = "DIPUPUK"
	StatusDipantau TreeStatus = "DIPANTAU"
)

// Tree entity represents a tree in the logbook
type Tree struct {
	ID                   string
	Code                 string // C001, C002, etc.
	SpeciesID            string
	LocationID           string
	PlantingDate         time.Time
	AgeYears             int
	HeightMeters         float64
	DiameterCm           float64
	Status               TreeStatus
	HealthScore          int
	Notes                string
	RegisteredBy         string // User ID (UUID)
	RegisteredByUsername string `json:"registered_by_username"` // Username for display
	CreatedAt            time.Time
	UpdatedAt            time.Time
}

// Validate checks if tree entity is valid
func (t *Tree) Validate() error {
	if t.Code == "" {
		return errors.New("tree code is required")
	}
	if t.SpeciesID == "" {
		return errors.New("species ID is required")
	}
	if t.LocationID == "" {
		return errors.New("location ID is required")
	}
	if t.PlantingDate.IsZero() {
		return errors.New("planting date is required")
	}
	if t.HealthScore < 0 || t.HealthScore > 100 {
		return errors.New("health score must be between 0 and 100")
	}
	if !t.IsValidStatus() {
		return errors.New("invalid tree status")
	}
	return nil
}

// IsValidStatus checks if current status is valid
func (t *Tree) IsValidStatus() bool {
	validStatuses := []TreeStatus{StatusSehat, StatusSakit, StatusMati, StatusDipupuk, StatusDipantau}
	for _, s := range validStatuses {
		if t.Status == s {
			return true
		}
	}
	return false
}

// CanUpdateStatus checks if status transition is allowed
func (t *Tree) CanUpdateStatus(newStatus TreeStatus) error {
	// Cannot revive a dead tree
	if t.Status == StatusMati {
		return errors.New("cannot change status of a dead tree")
	}

	// Cannot set invalid status
	tempTree := &Tree{Status: newStatus}
	if !tempTree.IsValidStatus() {
		return errors.New("invalid status")
	}

	return nil
}

// CalculateAge calculates tree age in years based on planting date
func (t *Tree) CalculateAge() int {
	if t.PlantingDate.IsZero() {
		return 0
	}
	return int(time.Since(t.PlantingDate).Hours() / 24 / 365)
}

// IsDead returns true if tree is dead
func (t *Tree) IsDead() bool {
	return t.Status == StatusMati
}

// IsHealthy returns true if tree is healthy
func (t *Tree) IsHealthy() bool {
	return t.Status == StatusSehat && t.HealthScore >= 80
}

// NeedsAttention returns true if tree needs monitoring or treatment
func (t *Tree) NeedsAttention() bool {
	return t.Status == StatusSakit || t.Status == StatusDipantau || t.HealthScore < 60
}
