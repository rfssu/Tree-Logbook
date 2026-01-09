-- +goose Up
-- +goose StatementBegin
CREATE TABLE trees (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    species_id VARCHAR(50) REFERENCES tree_species(id),
    location_id VARCHAR(50) REFERENCES locations(id),
    planting_date DATE NOT NULL,
    age_years INTEGER,
    height_meters DECIMAL(5,2),
    diameter_cm DECIMAL(5,2),
    status VARCHAR(20) NOT NULL DEFAULT 'SEHAT',
    health_score INTEGER DEFAULT 100,
    notes TEXT,
    registered_by VARCHAR(50) REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_status CHECK (status IN ('SEHAT', 'SAKIT', 'MATI', 'DIPUPUK', 'DIPANTAU')),
    CONSTRAINT chk_health_score CHECK (health_score >= 0 AND health_score <= 100)
);

CREATE INDEX idx_trees_code ON trees(code);
CREATE INDEX idx_trees_location ON trees(location_id);
CREATE INDEX idx_trees_species ON trees(species_id);
CREATE INDEX idx_trees_status ON trees(status);
CREATE INDEX idx_trees_registered_by ON trees(registered_by);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS trees;
-- +goose StatementEnd
