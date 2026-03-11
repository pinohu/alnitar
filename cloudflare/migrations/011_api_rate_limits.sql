-- Rate limiting for API key requests (per key_id per minute)
CREATE TABLE IF NOT EXISTS api_rate_limits (
  key_id TEXT NOT NULL,
  window INTEGER NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (key_id, window)
);
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_window ON api_rate_limits(window);
