
-- Star catalog table
CREATE TABLE public.star_catalog (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  catalog_id TEXT NOT NULL,
  right_ascension DOUBLE PRECISION NOT NULL,
  declination DOUBLE PRECISION NOT NULL,
  magnitude DOUBLE PRECISION NOT NULL,
  constellation TEXT NOT NULL,
  spectral_type TEXT NOT NULL DEFAULT '',
  distance TEXT,
  luminosity DOUBLE PRECISION,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.star_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view star catalog"
  ON public.star_catalog FOR SELECT
  TO public
  USING (true);

-- Deep sky catalog table
CREATE TABLE public.deep_sky_catalog (
  id TEXT PRIMARY KEY,
  object_name TEXT NOT NULL,
  catalog TEXT NOT NULL,
  object_type TEXT NOT NULL,
  constellation TEXT NOT NULL,
  magnitude DOUBLE PRECISION NOT NULL DEFAULT 99,
  distance TEXT,
  right_ascension TEXT NOT NULL,
  declination TEXT NOT NULL,
  visibility_level TEXT NOT NULL DEFAULT 'telescope',
  description TEXT NOT NULL DEFAULT '',
  angular_size TEXT,
  best_months TEXT[] NOT NULL DEFAULT '{}',
  photography_tips TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.deep_sky_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view deep sky catalog"
  ON public.deep_sky_catalog FOR SELECT
  TO public
  USING (true);

-- Planet data table
CREATE TABLE public.planets (
  id TEXT PRIMARY KEY,
  planet_name TEXT NOT NULL,
  orbital_period_years DOUBLE PRECISION NOT NULL,
  semi_major_axis_au DOUBLE PRECISION NOT NULL,
  eccentricity DOUBLE PRECISION NOT NULL DEFAULT 0,
  inclination DOUBLE PRECISION NOT NULL DEFAULT 0,
  typical_magnitude DOUBLE PRECISION NOT NULL DEFAULT 0,
  mean_longitude_j2000 DOUBLE PRECISION NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.planets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view planets"
  ON public.planets FOR SELECT
  TO public
  USING (true);

-- Light pollution / sky quality reference table
CREATE TABLE public.sky_quality_zones (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  bortle_level INTEGER NOT NULL,
  sky_darkness_score INTEGER NOT NULL DEFAULT 50,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  radius_km DOUBLE PRECISION,
  recommended_targets TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sky_quality_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sky quality zones"
  ON public.sky_quality_zones FOR SELECT
  TO public
  USING (true);
