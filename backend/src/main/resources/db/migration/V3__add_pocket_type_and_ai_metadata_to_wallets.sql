-- Migration V3: Add pocket_type and AI metadata to wallets
ALTER TABLE wallets
ADD COLUMN IF NOT EXISTS pocket_type VARCHAR(20) DEFAULT 'EXPENSE',
ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ai_insight VARCHAR(255);

-- Create index on pocket_type for efficient filtering
CREATE INDEX IF NOT EXISTS idx_wallets_pocket_type ON wallets(user_id, pocket_type);
