-- =============================================================================
-- AavaasIQ — Phase 3 & 4 Fix: Delivery Flow Permissions & Resident Lookup
-- =============================================================================
-- IMPORTANT: This migration must be executed in the Supabase SQL Editor.
-- It is safe to re-run. It does NOT recreate tables or delete existing data.
-- =============================================================================

-- ─── 1. Ensure Columns on Deliveries Table ────────────────────────────────────

ALTER TABLE public.deliveries ADD COLUMN IF NOT EXISTS flat_number TEXT;
ALTER TABLE public.deliveries ADD COLUMN IF NOT EXISTS sender_name TEXT;

-- ─── 2. Allow Staff (Security & Admin) to View Memberships in their Society ──

DROP POLICY IF EXISTS "Staff can view society memberships" ON public.society_memberships;
CREATE POLICY "Staff can view society memberships"
  ON public.society_memberships FOR SELECT
  TO authenticated
  USING (
    is_society_admin(society_id) OR is_society_security(society_id)
  );

-- ─── 3. Allow Staff to View Member Profiles in their Society ─────────────────

DROP POLICY IF EXISTS "Staff can view member profiles in their society" ON public.profiles;
CREATE POLICY "Staff can view member profiles in their society"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.society_memberships sm
      WHERE sm.user_id = profiles.id
        AND (is_society_admin(sm.society_id) OR is_society_security(sm.society_id))
    )
  );

-- ─── 4. Secure Helper Function: Resident Lookup for Delivery Logging ─────────

CREATE OR REPLACE FUNCTION find_society_resident_for_delivery(
  p_block TEXT DEFAULT NULL,
  p_flat_number TEXT DEFAULT NULL
)
RETURNS TABLE (
  resident_id UUID,
  full_name TEXT,
  society_id UUID,
  flat_number TEXT,
  block TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_id UUID;
  v_society_id UUID;
  v_norm_block TEXT;
  v_norm_flat TEXT;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  -- Verify caller is active security or admin in their society
  SELECT sm.society_id INTO v_society_id
  FROM public.profiles p
  JOIN public.society_memberships sm ON sm.user_id = p.id
  WHERE p.id = v_caller_id
    AND sm.status = 'active'
    AND p.role IN ('security', 'admin')
  LIMIT 1;

  IF v_society_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Active staff membership required' USING ERRCODE = '42501';
  END IF;

  v_norm_block := NULLIF(trim(p_block), '');
  v_norm_flat := NULLIF(trim(p_flat_number), '');

  RETURN QUERY
  SELECT
    p.id AS resident_id,
    p.full_name,
    sm.society_id,
    sm.flat_number,
    sm.block
  FROM public.society_memberships sm
  JOIN public.profiles p ON p.id = sm.user_id
  WHERE sm.society_id = v_society_id
    AND sm.status = 'active'
    AND (
      (v_norm_block IS NOT NULL AND lower(trim(coalesce(sm.block, ''))) = lower(v_norm_block) AND lower(trim(sm.flat_number)) = lower(v_norm_flat))
      OR (v_norm_block IS NULL AND (
        lower(trim(sm.flat_number)) = lower(v_norm_flat)
        OR lower(trim(coalesce(sm.block, '') || '-' || sm.flat_number)) = lower(v_norm_flat)
      ))
    )
  LIMIT 1;
END;
$$;

REVOKE ALL ON FUNCTION find_society_resident_for_delivery(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION find_society_resident_for_delivery(TEXT, TEXT) TO authenticated;

-- ─── 5. Deliveries: Security can view all deliveries in their society ─────────

DROP POLICY IF EXISTS "Security can view society deliveries" ON public.deliveries;
CREATE POLICY "Security can view society deliveries"
  ON public.deliveries FOR SELECT
  TO authenticated
  USING (
    is_society_security(society_id) OR is_society_admin(society_id)
  );

DROP POLICY IF EXISTS "Security can insert deliveries for their society" ON public.deliveries;
CREATE POLICY "Security can insert deliveries for their society"
  ON public.deliveries FOR INSERT
  TO authenticated
  WITH CHECK (
    (is_society_security(society_id) OR is_society_admin(society_id))
    AND resident_id IS NOT NULL
  );

-- ─── 6. Deliveries: Residents can view and collect their own deliveries ───────

DROP POLICY IF EXISTS "Residents can view own deliveries" ON public.deliveries;
CREATE POLICY "Residents can view own deliveries"
  ON public.deliveries FOR SELECT
  TO authenticated
  USING (resident_id = auth.uid());

DROP POLICY IF EXISTS "Residents can mark own received deliveries as collected" ON public.deliveries;
DROP POLICY IF EXISTS "Residents can mark own deliveries as collected" ON public.deliveries;
CREATE POLICY "Residents can mark own deliveries as collected"
  ON public.deliveries FOR UPDATE
  TO authenticated
  USING (resident_id = auth.uid())
  WITH CHECK (resident_id = auth.uid() AND status = 'collected');

-- ─── 7. Explicit Grants ───────────────────────────────────────────────────────

GRANT SELECT, INSERT, UPDATE ON public.deliveries TO authenticated;
GRANT SELECT ON public.society_memberships TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;
