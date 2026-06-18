-- Add status column to websites_users to support invitation flow for existing users
-- 'member' = active group member (default for all existing rows)
-- 'invited' = invited but not yet accepted
ALTER TABLE websites_users ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'member';
