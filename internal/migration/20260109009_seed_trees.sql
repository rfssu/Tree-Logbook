-- +goose Up
-- +goose StatementBegin
-- Seed Sample Trees with C prefix (Condition monitoring)
INSERT INTO trees (id, code, species_id, location_id, planting_date, age_years, height_meters, diameter_cm, status, health_score, notes, registered_by) VALUES
('TRE001', 'C001', 'SP001', 'LOC001', '2020-01-15', 4, 8.5, 25.0, 'SEHAT', 95, 'Pohon Jati dalam kondisi sangat baik, pertumbuhan optimal', 'USR001'),
('TRE002', 'C002', 'SP002', 'LOC001', '2019-06-20', 5, 12.3, 35.2, 'DIPUPUK', 85, 'Sedang dalam proses pemupukan rutin', 'USR001'),
('TRE003', 'C003', 'SP003', 'LOC002', '2021-03-10', 3, 6.8, 18.5, 'SAKIT', 60, 'Terlihat gejala penyakit daun, perlu treatment', 'USR002'),
('TRE004', 'C004', 'SP001', 'LOC003', '2018-11-05', 5, 10.2, 30.8, 'SEHAT', 90, 'Pertumbuhan stabil dan sehat', 'USR001'),
('TRE005', 'C005', 'SP002', 'LOC002', '2017-08-12', 6, 15.5, 42.0, 'MATI', 0, 'Pohon mati karena serangan hama tahun lalu', 'USR002'),
('TRE006', 'C006', 'SP004', 'LOC001', '2022-02-28', 2, 5.2, 12.3, 'SEHAT', 92, 'Akasia muda, pertumbuhan cepat', 'USR001'),
('TRE007', 'C007', 'SP005', 'LOC003', '2020-09-15', 3, 3.5, 8.5, 'DIPANTAU', 88, 'Cendana dalam monitoring khusus karena nilai tinggi', 'USR002'),
('TRE008', 'C008', 'SP003', 'LOC001', '2021-12-01', 2, 7.2, 20.1, 'SEHAT', 94, 'Angsana berkembang dengan baik', 'USR001');
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DELETE FROM trees WHERE id IN ('TRE001', 'TRE002', 'TRE003', 'TRE004', 'TRE005', 'TRE006', 'TRE007', 'TRE008');
-- +goose StatementEnd
