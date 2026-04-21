-- Add email column to visibility-brigade-submissions table
ALTER TABLE "visibility-brigade-submissions"
  ADD COLUMN IF NOT EXISTS email TEXT;

CREATE INDEX IF NOT EXISTS idx_vb_submissions_email ON "visibility-brigade-submissions" (email);
