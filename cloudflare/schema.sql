-- Alnitar D1 (SQLite) schema — mirrors Supabase tables used by the app

-- Users (auth stored in Worker; D1 holds profile data)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  role TEXT NOT NULL DEFAULT 'user',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Profiles (display name, avatar, bio, location)
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location_public TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- follows: follower follows following
CREATE TABLE IF NOT EXISTS follows (
  id TEXT PRIMARY KEY,
  follower_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(follower_id, following_id)
);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

-- learning_progress
CREATE TABLE IF NOT EXISTS learning_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  path_id TEXT NOT NULL,
  step_index INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, path_id)
);
CREATE INDEX IF NOT EXISTS idx_learning_progress_user ON learning_progress(user_id);

-- API keys (research / developer)
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT 'read',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);

-- Partners (organizations)
CREATE TABLE IF NOT EXISTS partners (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT,
  contact_email TEXT,
  api_key_id TEXT REFERENCES api_keys(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_partners_domain ON partners(domain);

-- Observations (journal)
CREATE TABLE IF NOT EXISTS observations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  constellation_id TEXT NOT NULL,
  constellation_name TEXT NOT NULL,
  confidence INTEGER DEFAULT 0,
  notes TEXT DEFAULT '',
  location TEXT DEFAULT '',
  date TEXT DEFAULT (date('now')),
  equipment TEXT DEFAULT '',
  sky_quality TEXT DEFAULT '',
  image_url TEXT,
  device_type TEXT DEFAULT 'phone',
  alternate_matches TEXT DEFAULT '[]',
  verified_at TEXT,
  verification_payload TEXT,
  visibility TEXT NOT NULL DEFAULT 'private',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_observations_user_id ON observations(user_id);

-- Badges (seed data)
CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL
);

-- User badges (earned)
CREATE TABLE IF NOT EXISTS user_badges (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES badges(id),
  earned_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, badge_id)
);

-- User progress (streaks, constellations found)
CREATE TABLE IF NOT EXISTS user_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_observations INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_observation_date TEXT,
  constellations_found TEXT DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Weekly challenges (public read)
CREATE TABLE IF NOT EXISTS weekly_challenges (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_constellation_id TEXT,
  target_type TEXT NOT NULL,
  week_start TEXT NOT NULL,
  week_end TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Community events (meteors, transients)
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

-- User event reminders (in_app | email | push)
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

-- Seed badges
INSERT OR IGNORE INTO badges (id, name, description, icon, category) VALUES
  ('first-find', 'First Light', 'Identified your first constellation', 'star', 'milestone'),
  ('five-finds', 'Star Collector', 'Identified 5 different constellations', 'stars', 'milestone'),
  ('ten-finds', 'Sky Navigator', 'Identified 10 different constellations', 'compass', 'milestone'),
  ('winter-explorer', 'Winter Explorer', 'Found a winter constellation', 'snowflake', 'seasonal'),
  ('spring-explorer', 'Spring Explorer', 'Found a spring constellation', 'flower', 'seasonal'),
  ('summer-explorer', 'Summer Explorer', 'Found a summer constellation', 'sun', 'seasonal'),
  ('autumn-explorer', 'Autumn Explorer', 'Found an autumn constellation', 'leaf', 'seasonal'),
  ('nebula-hunter', 'Nebula Hunter', 'Found a constellation with a nebula', 'cloud', 'discovery'),
  ('galaxy-spotter', 'Galaxy Spotter', 'Found a constellation with a galaxy', 'circle', 'discovery'),
  ('streak-3', 'Consistent Observer', '3-day observation streak', 'flame', 'streak'),
  ('streak-7', 'Dedicated Stargazer', '7-day observation streak', 'zap', 'streak'),
  ('southern-sky', 'Southern Explorer', 'Found a southern hemisphere constellation', 'globe', 'exploration'),
  ('all-seasons', 'Four Seasons', 'Found constellations from all four seasons', 'calendar', 'mastery');
