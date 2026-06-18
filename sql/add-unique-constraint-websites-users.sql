-- Remove any duplicate websites_users rows keeping the most recent one,
-- then add a unique constraint so the same user can't be inserted twice for the same group.

-- Delete older duplicate rows (keep the one with the highest id)
DELETE FROM websites_users
WHERE id NOT IN (
  SELECT MAX(id)
  FROM websites_users
  GROUP BY website_id, user_id
);

-- Add unique constraint
ALTER TABLE websites_users
  ADD CONSTRAINT websites_users_website_id_user_id_key UNIQUE (website_id, user_id);
