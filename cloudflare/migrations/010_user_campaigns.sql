-- User campaign participation (for badges and Year in Review)
CREATE TABLE IF NOT EXISTS user_campaigns (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  campaign_id TEXT NOT NULL,
  joined_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, campaign_id)
);
CREATE INDEX IF NOT EXISTS idx_user_campaigns_user ON user_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_user_campaigns_campaign ON user_campaigns(campaign_id);
