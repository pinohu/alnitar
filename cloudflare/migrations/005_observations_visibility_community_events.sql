-- observations.visibility: private | public | anonymous (default private for feed filtering)
ALTER TABLE observations ADD COLUMN visibility TEXT NOT NULL DEFAULT 'private';

-- community_events: user-reported meteors/transients
CREATE TABLE IF NOT EXISTS community_events (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL DEFAULT 'meteor',
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  observed_at TEXT NOT NULL DEFAULT (datetime('now')),
  notes TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_community_events_observed_at ON community_events(observed_at);
CREATE INDEX IF NOT EXISTS idx_community_events_type ON community_events(event_type);

-- user_event_reminders: event notifications (in_app | email | push)
CREATE TABLE IF NOT EXISTS user_event_reminders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL,
  notify_days_before INTEGER NOT NULL DEFAULT 1,
  channel TEXT NOT NULL DEFAULT 'in_app',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, event_id, channel)
);
CREATE INDEX IF NOT EXISTS idx_user_event_reminders_user ON user_event_reminders(user_id);
