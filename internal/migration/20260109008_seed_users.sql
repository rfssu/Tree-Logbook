-- +goose Up
-- +goose StatementBegin
-- Seed Admin User (password: admin123 - hashed with bcrypt)
INSERT INTO users (id, username, email, password_hash, full_name, role, is_active) VALUES
('USR001', 'admin', 'admin@tree-id.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Administrator', 'admin', true),
('USR002', 'editor1', 'editor@tree-id.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Editor User', 'editor', true),
('USR003', 'viewer1', 'viewer@tree-id.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Viewer User', 'viewer', true);

-- Note: Password hash is for 'admin123' (for development only!)
-- In production, users should change passwords immediately
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DELETE FROM users WHERE id IN ('USR001', 'USR002', 'USR003');
-- +goose StatementEnd
