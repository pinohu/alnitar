-- Persistence: user favorites and observation journal sessions
-- RLS: users can only access their own rows (auth.uid() = user_id).

-- Favorites: object/event/constellation/dso saved by user
CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type text NOT NULL,
  item_id text NOT NULL,
  name text,
  saved_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_type, item_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_type ON public.favorites(user_id, item_type);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON public.favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON public.favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own favorites"
  ON public.favorites FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON public.favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Journal sessions: observation log entries (title, observed_at, location, notes, object/event slugs)
CREATE TABLE IF NOT EXISTS public.journal_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  observed_at timestamptz NOT NULL,
  location text,
  sky_condition text,
  notes text,
  object_slugs text[] NOT NULL DEFAULT '{}',
  event_slugs text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_journal_sessions_user_id ON public.journal_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_sessions_observed_at ON public.journal_sessions(user_id, observed_at DESC);

ALTER TABLE public.journal_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own journal sessions"
  ON public.journal_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal sessions"
  ON public.journal_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal sessions"
  ON public.journal_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal sessions"
  ON public.journal_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
