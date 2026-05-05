ALTER TABLE announcements
  ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
