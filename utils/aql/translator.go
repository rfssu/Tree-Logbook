package aql

import (
	"fmt"
	"regexp"
	"strings"
)

// Translator converts AQL syntax to standard SQL
// This allows using Agricultural Query Language with PostgreSQL backend
type Translator struct{}

func NewTranslator() *Translator {
	return &Translator{}
}

// ToSQL converts AQL query to standard SQL
func (t *Translator) ToSQL(aqlQuery string) string {
	query := strings.TrimSpace(aqlQuery)

	// LAHAN -> CREATE TABLE
	if strings.HasPrefix(query, "LAHAN ") {
		return t.translateLahan(query)
	}

	// TANAM KE -> INSERT INTO
	if strings.HasPrefix(query, "TANAM KE ") {
		return t.translateTanam(query)
	}

	// PANEN -> SELECT
	if strings.HasPrefix(query, "PANEN ") {
		return t.translatePanen(query)
	}

	// PUPUK -> UPDATE
	if strings.HasPrefix(query, "PUPUK ") {
		return t.translatePupuk(query)
	}

	// GUSUR -> DELETE
	if strings.HasPrefix(query, "GUSUR DARI ") {
		return t.translateGusur(query)
	}

	// BAKAR LAHAN -> DROP TABLE
	if strings.HasPrefix(query, "BAKAR LAHAN ") {
		return t.translateBakarLahan(query)
	}

	// LIHAT LAHAN -> SHOW TABLES (PostgreSQL)
	if query == "LIHAT LAHAN" {
		return t.translateLihatLahan()
	}

	// HITUNG -> SELECT COUNT
	if strings.HasPrefix(query, "HITUNG ") {
		return t.translateHitung(query)
	}

	// If no AQL pattern matched, return as-is (assume it's already SQL)
	return query
}

// LAHAN data_pohon (id VARCHAR(50), status VARCHAR(20))
// -> CREATE TABLE data_pohon (id VARCHAR(50), status VARCHAR(20))
func (t *Translator) translateLahan(query string) string {
	re := regexp.MustCompile(`LAHAN\s+(\w+)\s*\((.*)\)`)
	matches := re.FindStringSubmatch(query)
	if len(matches) == 3 {
		return fmt.Sprintf("CREATE TABLE %s (%s)", matches[1], matches[2])
	}
	return query
}

// TANAM KE data_pohon (id, status) BIBIT ('P001', 'SEHAT')
// -> INSERT INTO data_pohon (id, status) VALUES ('P001', 'SEHAT')
func (t *Translator) translateTanam(query string) string {
	re := regexp.MustCompile(`TANAM KE\s+(\w+)\s*\((.*?)\)\s*BIBIT\s*\((.*)\)`)
	matches := re.FindStringSubmatch(query)
	if len(matches) == 4 {
		return fmt.Sprintf("INSERT INTO %s (%s) VALUES (%s)", matches[1], matches[2], matches[3])
	}
	return query
}

// PANEN * DARI data_pohon DIMANA id='P001'
// -> SELECT * FROM data_pohon WHERE id='P001'
func (t *Translator) translatePanen(query string) string {
	query = strings.Replace(query, "PANEN ", "SELECT ", 1)
	query = strings.Replace(query, " DARI ", " FROM ", 1)
	query = strings.Replace(query, " DIMANA ", " WHERE ", 1)
	return query
}

// PUPUK data_pohon DENGAN status='SAKIT' DIMANA id='P001'
// -> UPDATE data_pohon SET status='SAKIT' WHERE id='P001'
func (t *Translator) translatePupuk(query string) string {
	query = strings.Replace(query, "PUPUK ", "UPDATE ", 1)
	query = strings.Replace(query, " DENGAN ", " SET ", 1)
	query = strings.Replace(query, " DIMANA ", " WHERE ", 1)
	return query
}

// GUSUR DARI data_pohon DIMANA id='P001'
// -> DELETE FROM data_pohon WHERE id='P001'
func (t *Translator) translateGusur(query string) string {
	query = strings.Replace(query, "GUSUR DARI ", "DELETE FROM ", 1)
	query = strings.Replace(query, " DIMANA ", " WHERE ", 1)
	return query
}

// BAKAR LAHAN data_pohon
// -> DROP TABLE data_pohon
func (t *Translator) translateBakarLahan(query string) string {
	return strings.Replace(query, "BAKAR LAHAN ", "DROP TABLE ", 1)
}

// LIHAT LAHAN
// -> SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema'
func (t *Translator) translateLihatLahan() string {
	return "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema'"
}

// HITUNG COUNT(*) DARI data_pohon
// -> SELECT COUNT(*) FROM data_pohon
func (t *Translator) translateHitung(query string) string {
	query = strings.Replace(query, "HITUNG ", "SELECT ", 1)
	query = strings.Replace(query, " DARI ", " FROM ", 1)
	query = strings.Replace(query, " DIMANA ", " WHERE ", 1)
	return query
}
