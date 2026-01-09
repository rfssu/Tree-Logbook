-- Reset Trees and Monitoring Logs Data
-- +goose Up
-- +goose StatementBegin

-- Clear existing data
DELETE FROM monitoring_logs;
DELETE FROM trees;

-- Insert fresh tree data (using correct foreign keys from seed data)
INSERT INTO trees (id, code, species_id, location_id, planting_date, age_years, height_meters, diameter_cm, status, health_score, notes, registered_by, created_at, updated_at) VALUES
-- Sehat Trees
('TRE001', 'C001', 'SP001', 'LOC001', '2020-03-15', 4, 8.5, 25.0, 'SEHAT', 95, 'Jati tumbuh sehat di kebun A', 'USR001', NOW(), NOW()),
('TRE002', 'C002', 'SP002', 'LOC002', '2019-06-20', 5, 12.0, 34.5, 'SEHAT', 88, 'Mahoni berkembang baik di Bandung', 'USR001', NOW(), NOW()),
('TRE003', 'C003', 'SP004', 'LOC001', '2021-01-10', 3, 5.2, 12.3, 'SEHAT', 92, 'Akasia muda tumbuh cepat', 'USR002', NOW(), NOW()),

-- Dipupuk Tree
('TRE004', 'C004', 'SP003', 'LOC003', '2018-11-05', 5, 10.2, 30.8, 'DIPUPUK', 78, 'Angsana sedang dalam treatment pemupukan', 'USR001', NOW(), NOW()),

-- Sakit Tree
('TRE005', 'C005', 'SP001', 'LOC002', '2022-04-12', 2, 3.8, 8.5, 'SAKIT', 45, 'Jati muda - daun menguning, kekurangan nutrisi', 'USR002', NOW(), NOW()),

-- Dipantau Tree
('TRE006', 'C006', 'SP005', 'LOC001', '2023-02-20', 1, 3.5, 8.5, 'DIPANTAU', 85, 'Cendana perlu monitoring ketat (nilai ekonomi tinggi)', 'USR003', NOW(), NOW()),

-- Mati Tree
('TRE007', 'C007', 'SP002', 'LOC003', '2017-08-14', 7, 4.2, 15.0, 'MATI', 0, 'Mahoni mati akibat serangan hama berat', 'USR001', NOW(), NOW());

-- Insert monitoring logs for each tree
INSERT INTO monitoring_logs (id, tree_id, monitor_date, status, health_score, height_meters, diameter_cm, observations, actions_taken, monitored_by, created_at) VALUES
-- C001 History (Jati - always healthy)
('LOG001', 'TRE001', '2024-01-15', 'SEHAT', 90, 8.0, 24.0, 'Kondisi baik, daun hijau segar', 'Pemeriksaan rutin', 'USR001', NOW()),
('LOG002', 'TRE001', '2024-07-10', 'SEHAT', 95, 8.5, 25.0, 'Pertumbuhan optimal, batang kokoh', 'Tidak ada tindakan khusus', 'USR002', NOW()),

-- C002 History (Mahoni - steady growth)  
('LOG003', 'TRE002', '2024-02-20', 'SEHAT', 85, 11.5, 33.8, 'Batang kokoh, tajuk rimbun', 'Pemangkasan ringan', 'USR001', NOW()),
('LOG004', 'TRE002', '2024-08-15', 'SEHAT', 88, 12.0, 34.5, 'Diameter bertambah signifikan', 'Monitoring rutin', 'USR002', NOW()),

-- C003 History (Akasia - rapid growth)
('LOG005', 'TRE003', '2024-03-10', 'SEHAT', 88, 4.8, 11.5, 'Pertumbuhan sangat cepat', 'Pemeriksaan standar', 'USR003', NOW()),
('LOG006', 'TRE003', '2024-09-05', 'SEHAT', 92, 5.2, 12.3, 'Akasia cocok untuk kawasan ini', 'Tidak ada tindakan', 'USR002', NOW()),

-- C004 History (Angsana - treatment journey)
('LOG007', 'TRE004', '2024-01-25', 'SEHAT', 82, 9.8, 30.0, 'Kondisi stabil sebelum pemupukan', 'Monitoring berkala', 'USR001', NOW()),
('LOG008', 'TRE004', '2024-04-12', 'DIPUPUK', 75, 10.0, 30.5, 'Mulai treatment pemupukan', 'Aplikasi pupuk organik 40kg', 'USR001', NOW()),
('LOG009', 'TRE004', '2024-10-01', 'DIPUPUK', 78, 10.2, 30.8, 'Respon baik terhadap pemupukan', 'Lanjut program pemupukan', 'USR002', NOW()),

-- C005 History (Jati - health decline)
('LOG010', 'TRE005', '2024-06-15', 'SEHAT', 80, 3.5, 8.0, 'Pertumbuhan normal untuk usia muda', 'Check rutin', 'USR002', NOW()),
('LOG011', 'TRE005', '2024-09-20', 'SAKIT', 55, 3.7, 8.2, 'Daun mulai menguning di beberapa bagian', 'Treatment fungisida ringan', 'USR002', NOW()),
('LOG012', 'TRE005', '2024-12-10', 'SAKIT', 45, 3.8, 8.5, 'Kondisi memburuk, perlu treatment intensif', 'Aplikasi nutrisi tambahan', 'USR001', NOW()),

-- C006 History (Cendana - special monitoring)
('LOG013', 'TRE006', '2024-05-08', 'DIPANTAU', 82, 3.2, 8.0, 'Bibit cendana perlu perhatian ekstra', 'Foto dokumentasi, pengukuran detail', 'USR003', NOW()),
('LOG014', 'TRE006', '2024-11-15', 'DIPANTAU', 85, 3.5, 8.5, 'Pertumbuhan sesuai target', 'Update database konservasi', 'USR003', NOW()),

-- C007 History (Mahoni - path to death)
('LOG015', 'TRE007', '2023-11-20', 'SEHAT', 70, 4.0, 14.8, 'Kondisi menurun, perlu perhatian', 'Identifikasi penyebab', 'USR001', NOW()),
('LOG016', 'TRE007', '2024-01-15', 'SAKIT', 35, 4.1, 14.9, 'Serangan hama terdeteksi', 'Pestisida dan treatment', 'USR001', NOW()),
('LOG017', 'TRE007', '2024-03-10', 'SAKIT', 15, 4.2, 15.0, 'Kondisi kritis, hama menyebar', 'Treatment intensif gagal', 'USR002', NOW()),
('LOG018', 'TRE007', '2024-06-05', 'MATI', 0, 4.2, 15.0, 'Pohon tidak dapat diselamatkan', 'Dokumentasi untuk analisis', 'USR001', NOW());

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
-- Restore would need backup data - not implemented for safety
SELECT 'Data reset complete - no automatic restore available' AS warning;
-- +goose StatementEnd
