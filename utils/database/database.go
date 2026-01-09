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

	// Open database connection
	db, err := sql.Open(outboundDatabaseDriver, connStr)
	if err != nil {
		log.WithContext(ctx).Fatalf("failed to open database: %+v", err)
		os.Exit(1)
	}

	if err := db.Ping(); err != nil {
		log.WithContext(ctx).Fatalf("failed to connect database: %+v", err)
		os.Exit(1)
	}

	// Run migrations based on driver
	// For postgres: use goose
	// For sawitdb: skip (AQL migrations handled separately)
	if outboundDatabaseDriver == "postgres" {
		if err := goose.Up(db, utils.GetMigrationDir()); err != nil {
			log.WithContext(ctx).Fatalf("failed to running migration: %+v", err)
			os.Exit(1)
		}
	} else if outboundDatabaseDriver == "sawitdb" {
		log.WithContext(ctx).Info("SawitDB mode - skipping goose migrations (use AQL migrations when available)")
	}

	return db
}
