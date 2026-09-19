-- =============================================================================
-- AavaasIQ — Phase 3 & 4 Fix: Events & Event RSVPs Schema, Constraints, & RLS
-- =============================================================================
-- Safe to execute once in Supabase SQL Editor.
-- =============================================================================

-- 1. Ensure unique constraint on event_rsvps (event_id, resident_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'uq_event_resident_rsvp'
  ) THEN
    ALTER TABLE public.event_rsvps
      ADD CONSTRAINT uq_event_resident_rsvp UNIQUE (event_id, resident_id);
  END IF;
END $$;

-- 2. Ensure RLS is enabled on events and event_rsvps
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

-- 3. Events RLS Policies
DROP POLICY IF EXISTS "Members can view society events" ON public.events;
CREATE POLICY "Members can view society events"
  ON public.events FOR SELECT
  TO authenticated
  USING (is_society_member(society_id));

DROP POLICY IF EXISTS "Admins can create society events" ON public.events;
CREATE POLICY "Admins can create society events"
  ON public.events FOR INSERT
  TO authenticated
  WITH CHECK (is_society_admin(society_id));

DROP POLICY IF EXISTS "Admins can update society events" ON public.events;
CREATE POLICY "Admins can update society events"
  ON public.events FOR UPDATE
  TO authenticated
  USING (is_society_admin(society_id))
  WITH CHECK (is_society_admin(society_id));

-- 4. Event RSVPs RLS Policies
DROP POLICY IF EXISTS "Members can view event RSVPs" ON public.event_rsvps;
CREATE POLICY "Members can view event RSVPs"
  ON public.event_rsvps FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_rsvps.event_id
        AND is_society_member(e.society_id)
    )
  );

DROP POLICY IF EXISTS "Residents can create their own RSVP" ON public.event_rsvps;
CREATE POLICY "Residents can create their own RSVP"
  ON public.event_rsvps FOR INSERT
  TO authenticated
  WITH CHECK (
    resident_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_rsvps.event_id
        AND is_society_member(e.society_id)
    )
  );

DROP POLICY IF EXISTS "Residents can update their own RSVP" ON public.event_rsvps;
CREATE POLICY "Residents can update their own RSVP"
  ON public.event_rsvps FOR UPDATE
  TO authenticated
  USING (resident_id = auth.uid())
  WITH CHECK (resident_id = auth.uid());

DROP POLICY IF EXISTS "Residents can delete their own RSVP" ON public.event_rsvps;
CREATE POLICY "Residents can delete their own RSVP"
  ON public.event_rsvps FOR DELETE
  TO authenticated
  USING (resident_id = auth.uid());

-- 5. Explicit Table Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_rsvps TO authenticated;
