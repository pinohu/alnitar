-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create observations table (journal 2.0)
CREATE TABLE public.observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  constellation_id TEXT NOT NULL,
  constellation_name TEXT NOT NULL,
  confidence INTEGER DEFAULT 0,
  notes TEXT DEFAULT '',
  location TEXT DEFAULT '',
  date DATE DEFAULT CURRENT_DATE,
  equipment TEXT DEFAULT '',
  sky_quality TEXT DEFAULT '',
  image_url TEXT,
  alternate_matches JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create badges table
CREATE TABLE public.badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL
);

-- Create user_badges table
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES public.badges(id),
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Create user_progress table
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_observations INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_observation_date DATE,
  constellations_found TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create weekly_challenges table
CREATE TABLE public.weekly_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_constellation_id TEXT,
  target_type TEXT NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Observations policies
CREATE POLICY "Users can view own observations" ON public.observations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own observations" ON public.observations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own observations" ON public.observations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own observations" ON public.observations FOR DELETE USING (auth.uid() = user_id);

-- Badges are public read
CREATE POLICY "Anyone can view badges" ON public.badges FOR SELECT USING (true);

-- User badges policies
CREATE POLICY "Users can view own badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can earn badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User progress policies
CREATE POLICY "Users can view own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.user_progress FOR UPDATE USING (auth.uid() = user_id);

-- Weekly challenges are public read
CREATE POLICY "Anyone can view challenges" ON public.weekly_challenges FOR SELECT USING (true);

-- Timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Timestamp triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  INSERT INTO public.user_progress (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed badges
INSERT INTO public.badges (id, name, description, icon, category) VALUES
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

-- Seed weekly challenges
INSERT INTO public.weekly_challenges (title, description, target_constellation_id, target_type, week_start, week_end) VALUES
  ('Find Orion', 'Identify the mighty hunter in the winter sky', 'orion', 'find_constellation', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days'),
  ('Spot Cassiopeia', 'Find the W-shaped queen constellation', 'cassiopeia', 'find_constellation', CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE + INTERVAL '14 days'),
  ('Nebula Quest', 'Find any constellation containing a nebula', NULL, 'find_nebula', CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE + INTERVAL '21 days');