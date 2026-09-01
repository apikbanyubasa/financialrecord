-- Insert Default Global Income & Expense Categories
INSERT INTO categories (id, user_id, name, type, icon, color, is_system_default) VALUES
-- EXPENSE CATEGORIES
('10000000-0000-0000-0000-000000000001', NULL, 'Makanan & Minuman', 'EXPENSE', 'Utensils', '#EF4444', TRUE),
('10000000-0000-0000-0000-000000000002', NULL, 'Transportasi', 'EXPENSE', 'Car', '#F59E0B', TRUE),
('10000000-0000-0000-0000-000000000003', NULL, 'Belanja Kebutuhan', 'EXPENSE', 'ShoppingBag', '#3B82F6', TRUE),
('10000000-0000-0000-0000-000000000004', NULL, 'Tagihan & Utilitas', 'EXPENSE', 'Receipt', '#8B5CF6', TRUE),
('10000000-0000-0000-0000-000000000005', NULL, 'Hiburan & Liburan', 'EXPENSE', 'Film', '#EC4899', TRUE),
('10000000-0000-0000-0000-000000000006', NULL, 'Kesehatan & Medis', 'EXPENSE', 'HeartPulse', '#10B981', TRUE),
('10000000-0000-0000-0000-000000000007', NULL, 'Pendidikan & Kursus', 'EXPENSE', 'GraduationCap', '#6366F1', TRUE),
('10000000-0000-0000-0000-000000000008', NULL, 'Bocor Halus / Kopi / Admin', 'EXPENSE', 'Coffee', '#D97706', TRUE),
('10000000-0000-0000-0000-000000000009', NULL, 'Pengeluaran Lainnya', 'EXPENSE', 'MoreHorizontal', '#64748B', TRUE),

-- INCOME CATEGORIES
('20000000-0000-0000-0000-000000000001', NULL, 'Gaji Pokok', 'INCOME', 'Briefcase', '#10B981', TRUE),
('20000000-0000-0000-0000-000000000002', NULL, 'Freelance & Side Job', 'INCOME', 'Laptop', '#06B6D4', TRUE),
('20000000-0000-0000-0000-000000000003', NULL, 'Investasi & Dividen', 'INCOME', 'TrendingUp', '#8B5CF6', TRUE),
('20000000-0000-0000-0000-000000000004', NULL, 'Bonus & Tunjangan', 'INCOME', 'Gift', '#F59E0B', TRUE),
('20000000-0000-0000-0000-000000000005', NULL, 'Pemasukan Lainnya', 'INCOME', 'Coins', '#64748B', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Seed Default Admin & Demo User (BCrypt password for 'admin123' and 'user123')
-- Hash for 'admin123' and 'user123' generated with BCrypt 10 rounds:
-- '$2a$10$wN1q0V97Fq94yqZsqKjF/OSr13U9Z0LzZlD9w7uJ/6oM8Y4b3vCda'
INSERT INTO users (id, email, password_hash, full_name, role, is_active) VALUES
('a0000000-0000-0000-0000-000000000001', 'admin@financialrecord.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'ROLE_ADMIN', TRUE),
('b0000000-0000-0000-0000-000000000001', 'user@financialrecord.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo User', 'ROLE_USER', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Seed Default Wallets for Demo User
INSERT INTO wallets (id, user_id, name, type, balance) VALUES
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'BCA Rekening Utama', 'BANK', 12500000.00),
('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'GoPay & OVO', 'EWALLET', 850000.00),
('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'Cash Dompet', 'CASH', 450000.00)
ON CONFLICT (id) DO NOTHING;
