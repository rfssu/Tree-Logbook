-- +goose Up
-- +goose StatementBegin
-- Seed Sample Monitoring Logs
INSERT INTO monitoring_logs (id, tree_id, monitor_date, status, health_score, height_meters, diameter_cm, observations, actions_taken, monitored_by) VALUES
-- C001 logs
('LOG001', 'TRE001', '2024-01-15', 'SEHAT', 95, 8.5, 25.0, 'Kondisi pohon sangat baik, tidak ada tanda penyakit', 'Pemeriksaan rutin', 'USR002'),
('LOG002', 'TRE001', '2024-06-15', 'SEHAT', 95, 8.5, 25.0, 'Pertumbuhan stabil, daun hijau segar', 'Tidak ada tindakan khusus', 'USR002'),

-- C002 logs
('LOG003', 'TRE002', '2024-02-01', 'SEHAT', 80, 12.0, 34.5, 'Sebelum pemupukan', 'Persiapan area untuk pemupukan', 'USR002'),
('LOG004', 'TRE002', '2024-03-15', 'DIPUPUK', 85, 12.3, 35.2, 'Proses pemupukan dilakukan', 'Aplikasi pupuk organik 50kg', 'USR002'),

-- C003 logs  
('LOG005', 'TRE003', '2024-01-20', 'SEHAT', 85, 6.5, 18.0, 'Kondisi normal', 'Monitoring rutin', 'USR003'),
('LOG006', 'TRE003', '2024-04-10', 'SAKIT', 60, 6.8, 18.5, 'Daun menguning, kemungkinan kekurangan nutrisi', 'Treatment dengan fungisida', 'USR002'),

-- C004 logs
('LOG007', 'TRE004', '2024-03-05', 'SEHAT', 90, 10.2, 30.8, 'Pohon dalam kondisi prima', 'Pemangkasan ringan', 'USR002'),

-- C006 logs
('LOG008', 'TRE006', '2024-05-12', 'SEHAT', 92, 5.2, 12.3, 'Pertumbuhan akasia sangat cepat', 'Pemeriksaan standar', 'USR003'),

-- C007 logs
('LOG009', 'TRE007', '2024-02-20', 'DIPANTAU', 88, 3.5, 8.5, 'Cendana perlu monitoring ketat karena nilai ekonomi', 'Foto dokumentasi', 'USR002'),

-- C008 logs
('LOG010', 'TRE008', '2024-04-25', 'SEHAT', 94, 7.2, 20.1, 'Angsana tumbuh dengan baik', 'Tidak ada tindakan', 'USR003');
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DELETE FROM monitoring_logs WHERE id IN ('LOG001', 'LOG002', 'LOG003', 'LOG004', 'LOG005', 'LOG006', 'LOG007', 'LOG008', 'LOG009', 'LOG010');
-- +goose StatementEnd
