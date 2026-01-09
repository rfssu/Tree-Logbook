package database

import (
	"context"
	"database/sql"
	"os"

	"github.com/pressly/goose/v3"

	"prabogo/utils"
	"prabogo/utils/log"
)

func InitDatabase(ctx context.Context, outboundDatabaseDriver string) *sql.DB {
	connStr := utils.GetDatabaseString()

	// For SawitDB (WowoEngine), use custom driver
	// Assuming sawitdb provides a driver compatible with database/sql
	db, err := sql.Open(outboundDatabaseDriver, connStr)
	if err != nil {
		log.WithContext(ctx).Fatalf("failed to open database: %+v", err)
		os.Exit(1)
	}

	if err := db.Ping(); err != nil {
		log.WithContext(ctx).Fatalf("failed to connect database: %+v", err)
		os.Exit(1)
	}

	// AQL-based migrations for SawitDB handled differently
	// Goose does not support AQL syntax - migrations must use AQL query builder
	if outboundDatabaseDriver != "sawitdb" {
		if err := goose.Up(db, utils.GetMigrationDir()); err != nil {
			log.WithContext(ctx).Fatalf("failed to running migration: %+v", err)
			os.Exit(1)
		}
	} else {
		log.WithContext(ctx).Info("SawitDB detected - skipping goose migrations (use AQL migrations)")
	}

	return db
}
