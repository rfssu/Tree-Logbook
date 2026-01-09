-- +goose Up
-- +goose StatementBegin
CREATE TABLE tree_species (
    id VARCHAR(50) PRIMARY KEY,
    scientific_name VARCHAR(200) NOT NULL,
    common_name VARCHAR(100) NOT NULL,
    family VARCHAR(100),
    characteristics TEXT,
    growth_rate VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS tree_species;
-- +goose StatementEnd
