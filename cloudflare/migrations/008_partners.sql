-- Partners (organizations); admin creates and links to API key
CREATE TABLE IF NOT EXISTS partners (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT,
  contact_email TEXT,
  api_key_id TEXT REFERENCES api_keys(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_partners_domain ON partners(domain);
