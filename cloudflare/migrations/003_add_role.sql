-- Add role column for admin/superuser (run if you already had users table)
ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user';
