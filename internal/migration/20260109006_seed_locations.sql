-- +goose Up
-- +goose StatementBegin
-- Seed Locations
INSERT INTO locations (id, name, address, latitude, longitude, area_hectare, description) VALUES
('LOC001', 'Kebun A', 'Jl. Raya Jakarta No. 123, Jakarta Selatan', -6.2615, 106.8106, 2.5, 'Kebun penanaman utama di Jakarta'),
('LOC002', 'Kebun B', 'Jl. Dago No. 456, Bandung', -6.9175, 107.6191, 3.2, 'Area penanaman di Bandung'),
('LOC003', 'Kebun C', 'Jl. Pemuda No. 789, Surabaya', -7.2575, 112.7521, 1.8, 'Site penanaman Surabaya');
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DELETE FROM locations WHERE id IN ('LOC001', 'LOC002', 'LOC003');
-- +goose StatementEnd
