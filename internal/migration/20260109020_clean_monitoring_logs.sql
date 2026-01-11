-- Clean all monitoring logs to fix timestamp issues
-- This removes all old seed data with hardcoded 2024 dates
-- +goose Up
-- +goose StatementBegin

-- Delete ALL existing monitoring logs
DELETE FROM monitoring_logs;

-- NOTE: Trees will remain but have no history
-- Users will build fresh history with correct timestamps when they update trees

-- +goose StatementEnd

-- +goose Down  
-- +goose StatementBegin
-- Cannot restore - data permanently removed
SELECT 'Monitoring logs cleaned - history starts fresh' AS info;
-- +goose StatementEnd
