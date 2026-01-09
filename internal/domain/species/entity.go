package species

import (
	"errors"
	"time"
)

// TreeSpecies entity represents a tree species/type
type TreeSpecies struct {
	ID              string
	ScientificName  string
	CommonName      string
	Family          string
	Characteristics string
	GrowthRate      string // fast, medium, slow
	CreatedAt       time.Time
}

// Validate checks if tree species entity is valid
func (ts *TreeSpecies) Validate() error {
	if ts.ScientificName == "" {
		return errors.New("scientific name is required")
	}
	if ts.CommonName == "" {
		return errors.New("common name is required")
	}
	if ts.GrowthRate != "" {
		validRates := []string{"fast", "medium", "slow"}
		valid := false
		for _, rate := range validRates {
			if ts.GrowthRate == rate {
				valid = true
				break
			}
		}
		if !valid {
			return errors.New("growth rate must be fast, medium, or slow")
		}
	}
	return nil
}

// IsFastGrowing returns true if species has fast growth rate
func (ts *TreeSpecies) IsFastGrowing() bool {
	return ts.GrowthRate == "fast"
}
