
-- Add enriched observation metadata columns
ALTER TABLE public.observations
ADD COLUMN IF NOT EXISTS atmospheric_conditions text DEFAULT '',
ADD COLUMN IF NOT EXISTS device_type text DEFAULT 'phone',
ADD COLUMN IF NOT EXISTS observation_success boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS sky_ra double precision,
ADD COLUMN IF NOT EXISTS sky_dec double precision,
ADD COLUMN IF NOT EXISTS brightness_estimate double precision,
ADD COLUMN IF NOT EXISTS anonymized boolean DEFAULT false;

-- Create aggregated sky data table for the intelligence platform
CREATE TABLE IF NOT EXISTS public.sky_observations_aggregate (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region_key text NOT NULL,
  latitude_bucket double precision NOT NULL,
  longitude_bucket double precision NOT NULL,
  observation_date date NOT NULL,
  hour_bucket integer NOT NULL,
  object_type text NOT NULL,
  object_id text NOT NULL,
  object_name text NOT NULL,
  observation_count integer DEFAULT 1,
  avg_confidence double precision DEFAULT 0,
  avg_brightness double precision,
  equipment_distribution jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(region_key, observation_date, hour_bucket, object_id)
);

ALTER TABLE public.sky_observations_aggregate ENABLE ROW LEVEL SECURITY;

-- Public read for aggregated data (anonymized, no user info)
CREATE POLICY "Anyone can view aggregated sky data"
ON public.sky_observations_aggregate
FOR SELECT
TO public
USING (true);

-- Create sky alerts table
CREATE TABLE IF NOT EXISTS public.sky_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  alert_type text NOT NULL DEFAULT 'observation',
  severity text NOT NULL DEFAULT 'info',
  region text,
  object_id text,
  object_name text,
  observation_count integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

ALTER TABLE public.sky_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sky alerts"
ON public.sky_alerts
FOR SELECT
TO public
USING (true);
