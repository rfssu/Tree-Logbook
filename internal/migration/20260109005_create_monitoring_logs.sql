-- +goose Up
-- +goose StatementBegin
CREATE TABLE monitoring_logs (
    id VARCHAR(50) PRIMARY KEY,
    tree_id VARCHAR(50) NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
    monitor_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    health_score INTEGER,
    height_meters DECIMAL(5,2),
    diameter_cm DECIMAL(5,2),
    observations TEXT,
    actions_taken TEXT,
    monitored_by VARCHAR(50) REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_log_status CHECK (status IN ('SEHAT', 'SAKIT', 'MATI', 'DIPUPUK', 'DIPANTAU')),
    CONSTRAINT chk_log_health_score CHECK (health_score >= 0 AND health_score <= 100)
);

CREATE INDEX idx_logs_tree ON monitoring_logs(tree_id);
CREATE INDEX idx_logs_date ON monitoring_logs(monitor_date);
CREATE INDEX idx_logs_monitored_by ON monitoring_logs(monitored_by);
CREATE INDEX idx_logs_status ON monitoring_logs(status);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS monitoring_logs;
-- +goose StatementEnd
