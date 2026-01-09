-- +goose Up
-- +goose StatementBegin
-- Seed Tree Species
INSERT INTO tree_species (id, scientific_name, common_name, family, characteristics, growth_rate) VALUES
('SP001', 'Tectona grandis', 'Jati', 'Lamiaceae', 'Kayu keras berkualitas tinggi, tahan lama, cocok untuk furniture', 'medium'),
('SP002', 'Swietenia macrophylla', 'Mahoni', 'Meliaceae', 'Kayu merah kecoklatan, serat halus, tahan rayap', 'fast'),
('SP003', 'Pterocarpus indicus', 'Angsana', 'Fabaceae', 'Kayu keras merah, tahan cuaca, untuk konstruksi', 'fast'),
('SP004', 'Acacia mangium', 'Akasia', 'Fabaceae', 'Pertumbuhan cepat, kayu untuk pulp dan konstruksi ringan', 'fast'),
('SP005', 'Santalum album', 'Cendana', 'Santalaceae', 'Kayu aromatik, bernilai tinggi, untuk wewangian', 'slow');
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DELETE FROM tree_species WHERE id IN ('SP001', 'SP002', 'SP003', 'SP004', 'SP005');
-- +goose StatementEnd
