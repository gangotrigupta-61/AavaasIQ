-- =============================================================================
-- AavaasIQ -- Phase 1 Fix: Signup Society + Membership Creation
-- =============================================================================
-- Problem: societies table has no INSERT RLS policy for authenticated users.
--          Residents cannot directly insert into societies.
--          signupAction was silently swallowing the RLS error (42501).
--
-- Fix: A SECURITY DEFINER function that safely:
--   1. Looks up an existing society by name (case-insensitive match).
--   2. Creates it if it does not exist.
--   3. Creates a society_memberships row for auth.uid().
--   4. Raises an exception if the user already has an active membership
--      (prevents duplicate memberships).
--   5. Returns the society_id and membership_id.
--
-- Security model:
--   - Residents NEVER get direct INSERT on societies.
--   - The function runs as the database owner (SECURITY DEFINER), so it can
--     insert into societies on behalf of a verified authenticated user.
--   - The function always verifies auth.uid() IS NOT NULL so anonymous
--     callers cannot invoke it.
-- =============================================================================

CREATE OR REPLACE FUNCTION enroll_new_member(
  p_society_name  TEXT,
  p_block         TEXT,
  p_flat_number   TEXT,
  p_city          TEXT DEFAULT 'Pune',
  p_state         TEXT DEFAULT 'Maharashtra'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id       UUID;
  v_society_id    UUID;
  v_membership_id UUID;
BEGIN
  -- 1. Verify the caller is authenticated
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  -- 2. Prevent duplicate active memberships for this user
  IF EXISTS (
    SELECT 1 FROM public.society_memberships
    WHERE user_id = v_user_id AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'User already has an active society membership' USING ERRCODE = '23505';
  END IF;

  -- 3. Find existing society by name (case-insensitive) or create it
  SELECT id INTO v_society_id
  FROM public.societies
  WHERE lower(trim(name)) = lower(trim(p_society_name))
  LIMIT 1;

  IF v_society_id IS NULL THEN
    -- Society does not exist -- create it
    INSERT INTO public.societies (name, city, state)
    VALUES (trim(p_society_name), p_city, p_state)
    RETURNING id INTO v_society_id;
  END IF;

  -- 4. Create membership row
  INSERT INTO public.society_memberships (user_id, society_id, flat_number, block, status)
  VALUES (v_user_id, v_society_id, p_flat_number, p_block, 'active')
  RETURNING id INTO v_membership_id;

  -- 5. Return result
  RETURN jsonb_build_object(
    'society_id',    v_society_id,
    'membership_id', v_membership_id
  );
END;
$$;

-- Grant EXECUTE permission to authenticated users only
REVOKE ALL ON FUNCTION enroll_new_member(TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION enroll_new_member(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;


-- =============================================================================
-- OPTIONAL: One-time fix for Rahul Sharma (existing user with missing membership)
-- Run this AFTER creating the enroll_new_member function above.
-- If Rahul's membership was already added or you don't need this, skip it.
--
-- Instructions:
-- 1. Find Rahul Sharma's user ID from auth.users or profiles table:
--    SELECT id FROM profiles WHERE full_name = 'Rahul Sharma';
-- 2. Replace <RAHUL_USER_ID_HERE> below with his actual UUID.
-- 3. Run this block in the SQL Editor.
-- =============================================================================

-- Example (replace UUID and society name before running):
-- DO $$
-- DECLARE
--   v_society_id UUID;
-- BEGIN
--   -- Find or create society
--   SELECT id INTO v_society_id FROM public.societies WHERE lower(trim(name)) = lower('Green Valley Residency') LIMIT 1;
--   IF v_society_id IS NULL THEN
--     INSERT INTO public.societies (name, city, state) VALUES ('Green Valley Residency', 'Pune', 'Maharashtra') RETURNING id INTO v_society_id;
--   END IF;
--   -- Create membership for Rahul
--   INSERT INTO public.society_memberships (user_id, society_id, flat_number, block, status)
--   VALUES ('<RAHUL_USER_ID_HERE>', v_society_id, '204', 'A', 'active')
--   ON CONFLICT DO NOTHING;
-- END $$;
