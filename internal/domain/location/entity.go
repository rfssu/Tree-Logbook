package location

import (
	"errors"
	"time"
)

// Location entity represents a planting area
type Location struct {
	ID          string
	Name        string
	Address     string
	Latitude    float64
	Longitude   float64
	AreaHectare float64
	Description string
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// Validate checks if location entity is valid
func (l *Location) Validate() error {
	if l.Name == "" {
		return errors.New("location name is required")
	}
	if l.AreaHectare < 0 {
		return errors.New("area must be positive")
	}
	// Latitude: -90 to 90
	if l.Latitude < -90 || l.Latitude > 90 {
		return errors.New("invalid latitude")
	}
	// Longitude: -180 to 180
	if l.Longitude < -180 || l.Longitude > 180 {
		return errors.New("invalid longitude")
	}
	return nil
}
