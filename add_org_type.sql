-- Add 'type' column to organizations table
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('pro', 'agri')) DEFAULT 'pro';

-- Update existing organizations to be 'pro' by default
UPDATE organizations SET type = 'pro' WHERE type IS NULL;
