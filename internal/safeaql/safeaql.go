package safeaql

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"prabogo/utils/aql"
	"prabogo/utils/log"
)

// SafeExecutor wraps AQL operations with safety checks
// This is the ONLY recommended way to execute database operations in Tree-ID
// Translates AQL to SQL for PostgreSQL backend compatibility
type SafeExecutor struct {
	db         *sql.DB
	builder    *aql.QueryBuilder
	translator *aql.Translator
}

func NewSafeExecutor(db *sql.DB) *SafeExecutor {
	return &SafeExecutor{
		db:         db,
		builder:    aql.New(),
		translator: aql.NewTranslator(),
	}
}

// DropTableOptions configuration for BAKAR LAHAN operation
type DropTableOptions struct {
	TableName       string
	ConfirmationKey string // Must match "CONFIRM_BAKAR_LAHAN_<TABLENAME>"
	Reason          string // Required business justification
	RequestedBy     string // User/system identifier
}

// SafeDropTable - Protected wrapper for BAKAR LAHAN
// ⚠️ CRITICAL: This is the ONLY way to execute DROP TABLE safely
//
// Example usage:
//
//	err := safeExec.SafeDropTable(ctx, safeaql.DropTableOptions{
//	    TableName:       "logs_pohon",
//	    ConfirmationKey: "CONFIRM_BAKAR_LAHAN_logs_pohon",
//	    Reason:          "Migration to new schema version 2.0",
//	    RequestedBy:     "admin@tree-id.com",
//	})
func (s *SafeExecutor) SafeDropTable(ctx context.Context, opts DropTableOptions) error {
	expectedKey := fmt.Sprintf("CONFIRM_BAKAR_LAHAN_%s", opts.TableName)

	// Validation: Require explicit confirmation
	if opts.ConfirmationKey != expectedKey {
		log.WithContext(ctx).Errorf(
			"SECURITY VIOLATION: Attempted BAKAR LAHAN without confirmation. Table: %s, By: %s",
			opts.TableName, opts.RequestedBy,
		)
		return fmt.Errorf("BAKAR LAHAN blocked: confirmation key mismatch (expected: %s)", expectedKey)
	}

	// Validation: Require reason
	if opts.Reason == "" {
		return fmt.Errorf("BAKAR LAHAN blocked: reason required")
	}

	// Validation: Require requester identity
	if opts.RequestedBy == "" {
		return fmt.Errorf("BAKAR LAHAN blocked: RequestedBy required")
	}

	// Audit log BEFORE execution
	log.WithContext(ctx).Warnf(
		"🔥 BAKAR LAHAN INITIATED - Table: %s | Reason: %s | By: %s | Time: %s",
		opts.TableName,
		opts.Reason,
		opts.RequestedBy,
		time.Now().Format(time.RFC3339),
	)

	// Build AQL query
	aqlQuery := s.builder.DropTable(opts.TableName)

	// Translate to SQL
	sqlQuery := s.translator.ToSQL(aqlQuery)
	log.WithContext(ctx).Debugf("AQL: %s -> SQL: %s", aqlQuery, sqlQuery)

	// Execute destructive operation
	_, err := s.db.ExecContext(ctx, sqlQuery)

	if err != nil {
		log.WithContext(ctx).Errorf(
			"❌ BAKAR LAHAN FAILED - Table: %s | Error: %+v",
			opts.TableName, err,
		)
		return fmt.Errorf("failed to execute BAKAR LAHAN: %w", err)
	}

	// Success audit log
	log.WithContext(ctx).Infof(
		"✅ BAKAR LAHAN SUCCESS - Table: %s | By: %s",
		opts.TableName, opts.RequestedBy,
	)

	return nil
}

// Standard safe operations (no confirmation needed)

// CreateTable - LAHAN [table]
func (s *SafeExecutor) CreateTable(ctx context.Context, tableName, columns string) error {
	aqlQuery := s.builder.CreateTable(tableName, columns)
	sqlQuery := s.translator.ToSQL(aqlQuery)

	log.WithContext(ctx).Infof("Creating table: %s (AQL: %s)", tableName, aqlQuery)
	log.WithContext(ctx).Debugf("SQL: %s", sqlQuery)

	_, err := s.db.ExecContext(ctx, sqlQuery)
	return err
}

// Insert - TANAM KE [table]
func (s *SafeExecutor) Insert(ctx context.Context, table string, columns []string, values []interface{}) error {
	aqlQuery := s.builder.Insert(table, columns, values)
	sqlQuery := s.translator.ToSQL(aqlQuery)

	log.WithContext(ctx).Debugf("AQL: %s -> SQL: %s", aqlQuery, sqlQuery)

	_, err := s.db.ExecContext(ctx, sqlQuery)
	return err
}

// Select - PANEN [columns] DARI [table]
func (s *SafeExecutor) Select(ctx context.Context, table, columns, where string) (*sql.Rows, error) {
	aqlQuery := s.builder.Select(table, columns, where)
	sqlQuery := s.translator.ToSQL(aqlQuery)

	log.WithContext(ctx).Debugf("AQL: %s -> SQL: %s", aqlQuery, sqlQuery)

	return s.db.QueryContext(ctx, sqlQuery)
}

// Update - PUPUK [table] DENGAN [set]
func (s *SafeExecutor) Update(ctx context.Context, table, set, where string) error {
	aqlQuery := s.builder.Update(table, set, where)
	sqlQuery := s.translator.ToSQL(aqlQuery)

	log.WithContext(ctx).Debugf("AQL: %s -> SQL: %s", aqlQuery, sqlQuery)

	_, err := s.db.ExecContext(ctx, sqlQuery)
	return err
}

// Delete - GUSUR DARI [table]
func (s *SafeExecutor) Delete(ctx context.Context, table, where string) error {
	aqlQuery := s.builder.Delete(table, where)
	sqlQuery := s.translator.ToSQL(aqlQuery)

	log.WithContext(ctx).Debugf("AQL: %s -> SQL: %s", aqlQuery, sqlQuery)

	_, err := s.db.ExecContext(ctx, sqlQuery)
	return err
}

// ShowTables - LIHAT LAHAN
func (s *SafeExecutor) ShowTables(ctx context.Context) (*sql.Rows, error) {
	aqlQuery := s.builder.ShowTables()
	sqlQuery := s.translator.ToSQL(aqlQuery)

	log.WithContext(ctx).Debugf("AQL: %s -> SQL: %s", aqlQuery, sqlQuery)

	return s.db.QueryContext(ctx, sqlQuery)
}

// Count - HITUNG COUNT(*) DARI [table]
func (s *SafeExecutor) Count(ctx context.Context, table, where string) (int64, error) {
	aqlQuery := s.builder.Count(table, where)
	sqlQuery := s.translator.ToSQL(aqlQuery)

	log.WithContext(ctx).Debugf("AQL: %s -> SQL: %s", aqlQuery, sqlQuery)

	var count int64
	err := s.db.QueryRowContext(ctx, sqlQuery).Scan(&count)
	return count, err
}
