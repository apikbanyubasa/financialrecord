-- V5: Add soft delete columns to transactions and wallets tables
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_transactions_deleted_at ON transactions(deleted_at);
CREATE INDEX IF NOT EXISTS idx_wallets_deleted_at ON wallets(deleted_at);
