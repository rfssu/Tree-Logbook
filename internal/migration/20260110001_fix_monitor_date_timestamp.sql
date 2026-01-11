-- Fix monitor_date column type from DATE to TIMESTAMP
-- This migration fixes the timestamp issue where all monitor_date values were set to midnight (00:00:00)
-- +goose Up
-- +goose StatementBegin

-- Change monitor_date from DATE to TIMESTAMP to preserve time information
ALTER TABLE monitoring_logs 
ALTER COLUMN monitor_date TYPE TIMESTAMP USING monitor_date::TIMESTAMP;

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

-- Revert back to DATE (will truncate time information)
ALTER TABLE monitoring_logs 
ALTER COLUMN monitor_date TYPE DATE USING monitor_date::DATE;

-- +goose StatementEnd
