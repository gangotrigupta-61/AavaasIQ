-- =============================================================================
-- AavaasIQ — Add Provider Location Support to service_providers
-- =============================================================================
-- Adds nullable address, latitude, and longitude columns to service_providers.
-- Preserves all existing RLS policies, triggers, and foreign keys.
-- Does NOT fabricate or seed fake coordinates/addresses.
-- =============================================================================

ALTER TABLE public.service_providers
  ADD COLUMN IF NOT EXISTS address TEXT NULL,
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION NULL,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION NULL;

-- Optional partial index on coordinates for spatial/range queries if populated in the future
CREATE INDEX IF NOT EXISTS idx_service_providers_lat_long
  ON public.service_providers(latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
