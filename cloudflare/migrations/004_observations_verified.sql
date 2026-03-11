-- Add verification fields to observations for Pro/club/science export
ALTER TABLE observations ADD COLUMN verified_at TEXT;
ALTER TABLE observations ADD COLUMN verification_payload TEXT;
