-- =============================================================================
-- AavaasIQ — Remove Parking and Amenity Objects
-- =============================================================================
-- This migration safely removes obsolete Parking and Amenity database objects
-- as these modules have been removed from the MVP.
-- Safe to execute in the Supabase SQL Editor.
-- =============================================================================

-- ─── 1. Drop Dependent Amenity Bookings Table ─────────────────────────────────

DROP TRIGGER IF EXISTS trg_amenity_bookings_updated_at ON public.amenity_bookings;
DROP POLICY IF EXISTS "Residents can view own amenity bookings" ON public.amenity_bookings;
DROP POLICY IF EXISTS "Admins can view society amenity bookings" ON public.amenity_bookings;
DROP POLICY IF EXISTS "Residents can create amenity bookings" ON public.amenity_bookings;
DROP POLICY IF EXISTS "Residents can cancel own amenity bookings" ON public.amenity_bookings;
DROP INDEX IF EXISTS public.idx_amenity_bookings_amenity_id;
DROP INDEX IF EXISTS public.idx_amenity_bookings_resident_id;
DROP TABLE IF EXISTS public.amenity_bookings CASCADE;

-- ─── 2. Drop Amenities Table ──────────────────────────────────────────────────

DROP TRIGGER IF EXISTS trg_amenities_updated_at ON public.amenities;
DROP POLICY IF EXISTS "Members can view society amenities" ON public.amenities;
DROP POLICY IF EXISTS "Admins can create amenities" ON public.amenities;
DROP POLICY IF EXISTS "Admins can update amenities" ON public.amenities;
DROP INDEX IF EXISTS public.idx_amenities_society_id;
DROP TABLE IF EXISTS public.amenities CASCADE;

-- ─── 3. Drop Parking Slots Table ──────────────────────────────────────────────

DROP TRIGGER IF EXISTS trg_parking_slots_updated_at ON public.parking_slots;
DROP POLICY IF EXISTS "Members can view society parking slots" ON public.parking_slots;
DROP POLICY IF EXISTS "Admins can insert parking slots" ON public.parking_slots;
DROP POLICY IF EXISTS "Admins can update parking slots" ON public.parking_slots;
DROP INDEX IF EXISTS public.idx_parking_slots_society_id;
DROP INDEX IF EXISTS public.idx_parking_slots_resident_id;
DROP TABLE IF EXISTS public.parking_slots CASCADE;
