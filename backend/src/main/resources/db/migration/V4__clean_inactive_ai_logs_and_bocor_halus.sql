-- Clean inactive AI usage logs and ensure categories are clean
DELETE FROM ai_usage_logs WHERE feature_type != 'NLP_INPUT';
UPDATE categories SET name = 'Kuliner & Jajan' WHERE name LIKE '%Bocor Halus%';
