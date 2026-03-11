-- Add plan column for Stripe Pro (run if you already had users table before this)
ALTER TABLE users ADD COLUMN plan TEXT NOT NULL DEFAULT 'free';
