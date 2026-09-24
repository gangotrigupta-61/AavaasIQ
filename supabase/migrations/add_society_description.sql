-- =============================================================================
-- AavaasIQ — Add Society Description Column
-- =============================================================================
-- Adds an optional description text column to the societies table.
-- Safe to re-run (uses IF NOT EXISTS).
-- Does NOT drop or modify any existing columns or policies.
-- =============================================================================

ALTER TABLE public.societies
  ADD COLUMN IF NOT EXISTS description TEXT;
