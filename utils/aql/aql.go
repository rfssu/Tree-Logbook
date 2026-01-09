package aql

import "fmt"

// QueryBuilder provides AQL (Agricultural Query Language) syntax helpers
// for SawitDB WowoEngine operations
type QueryBuilder struct{}

func New() *QueryBuilder {
	return &QueryBuilder{}
}

// CreateTable - LAHAN [table_name] (columns)
// Example: LAHAN data_pohon (id VARCHAR(50), status VARCHAR(20))
func (q *QueryBuilder) CreateTable(tableName string, columns string) string {
	return fmt.Sprintf("LAHAN %s (%s)", tableName, columns)
}

// Insert - TANAM KE [table] (columns) BIBIT (values)
// Example: TANAM KE data_pohon (id, status) BIBIT ('P001', 'SEHAT')
func (q *QueryBuilder) Insert(table string, columns []string, values []interface{}) string {
	return fmt.Sprintf("TANAM KE %s (%s) BIBIT (%s)",
		table,
		joinStrings(columns),
		joinValues(values))
}

// Select - PANEN [columns] DARI [table] DIMANA [condition]
// Example: PANEN * DARI data_pohon DIMANA id='P001'
func (q *QueryBuilder) Select(table string, columns string, where string) string {
	query := fmt.Sprintf("PANEN %s DARI %s", columns, table)
	if where != "" {
		query += " DIMANA " + where
	}
	return query
}

// Update - PUPUK [table] DENGAN [set] DIMANA [condition]
// Example: PUPUK data_pohon DENGAN status='SAKIT' DIMANA id='P001'
func (q *QueryBuilder) Update(table string, set string, where string) string {
	query := fmt.Sprintf("PUPUK %s DENGAN %s", table, set)
	if where != "" {
		query += " DIMANA " + where
	}
	return query
}

// Delete - GUSUR DARI [table] DIMANA [condition]
// Example: GUSUR DARI data_pohon DIMANA id='P001'
func (q *QueryBuilder) Delete(table string, where string) string {
	query := fmt.Sprintf("GUSUR DARI %s", table)
	if where != "" {
		query += " DIMANA " + where
	}
	return query
}

// DropTable - BAKAR LAHAN [table]
// ⚠️ DANGEROUS: This should ONLY be called through SafeExecutor
// Use internal/safeaql.SafeExecutor.SafeDropTable() in production
func (q *QueryBuilder) DropTable(table string) string {
	return fmt.Sprintf("BAKAR LAHAN %s", table)
}

// ShowTables - LIHAT LAHAN
// Lists all tables in database
func (q *QueryBuilder) ShowTables() string {
	return "LIHAT LAHAN"
}

// Count - HITUNG COUNT(*) DARI [table]
// Example: HITUNG COUNT(*) DARI data_pohon
func (q *QueryBuilder) Count(table string, where string) string {
	query := fmt.Sprintf("HITUNG COUNT(*) DARI %s", table)
	if where != "" {
		query += " DIMANA " + where
	}
	return query
}

// Helper functions

func joinStrings(items []string) string {
	result := ""
	for i, item := range items {
		if i > 0 {
			result += ", "
		}
		result += item
	}
	return result
}

func joinValues(items []interface{}) string {
	result := ""
	for i, item := range items {
		if i > 0 {
			result += ", "
		}
		result += fmt.Sprintf("'%v'", item)
	}
	return result
}
