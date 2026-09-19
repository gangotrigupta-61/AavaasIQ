-- =============================================================================
-- AavaasIQ — Phase 3 & 4: Visitors, Deliveries, Notices, Events, Parking, Amenities
-- =============================================================================
-- Supabase Free Tier Schema & RLS Policies
-- Safe to execute once in Supabase SQL Editor.
-- =============================================================================

-- --- 1. Helper Functions (SECURITY DEFINER with fixed search_path) -----------

CREATE OR REPLACE FUNCTION is_society_security(check_society_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.society_memberships sm ON sm.user_id = p.id
    WHERE p.id = auth.uid()
      AND p.role = 'security'
      AND sm.society_id = check_society_id
      AND sm.status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION is_society_member(check_society_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.society_memberships sm
    WHERE sm.user_id = auth.uid()
      AND sm.society_id = check_society_id
      AND sm.status = 'active'
  );
$$;

REVOKE ALL ON FUNCTION is_society_security(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION is_society_security(UUID) TO authenticated;

REVOKE ALL ON FUNCTION is_society_member(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION is_society_member(UUID) TO authenticated;


-- --- 2. Phase 3: Visitors Table ----------------------------------------------

CREATE TABLE IF NOT EXISTS public.visitors (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  society_id        UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  visitor_name      TEXT NOT NULL,
  visitor_phone     TEXT,
  purpose           TEXT,
  visit_date        DATE,
  expected_arrival  TIMESTAMPTZ,
  arrived_at        TIMESTAMPTZ,
  exited_at         TIMESTAMPTZ,
  pass_code         TEXT,
  status            TEXT NOT NULL DEFAULT 'expected'
                      CHECK (status IN ('expected', 'approved', 'inside', 'exited', 'rejected')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visitors_resident_id ON public.visitors(resident_id);
CREATE INDEX IF NOT EXISTS idx_visitors_society_id ON public.visitors(society_id);
CREATE INDEX IF NOT EXISTS idx_visitors_status ON public.visitors(status);

DROP TRIGGER IF EXISTS trg_visitors_updated_at ON public.visitors;
CREATE TRIGGER trg_visitors_updated_at
  BEFORE UPDATE ON public.visitors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Residents can view own visitors" ON public.visitors;
CREATE POLICY "Residents can view own visitors"
  ON public.visitors FOR SELECT
  TO authenticated
  USING (resident_id = auth.uid());

DROP POLICY IF EXISTS "Security and admin can view society visitors" ON public.visitors;
CREATE POLICY "Security and admin can view society visitors"
  ON public.visitors FOR SELECT
  TO authenticated
  USING (is_society_admin(society_id) OR is_society_security(society_id));

DROP POLICY IF EXISTS "Residents can create own visitor entries" ON public.visitors;
CREATE POLICY "Residents can create own visitor entries"
  ON public.visitors FOR INSERT
  TO authenticated
  WITH CHECK (
    resident_id = auth.uid() AND is_society_member(society_id)
  );

DROP POLICY IF EXISTS "Residents can cancel own pending visitor entries" ON public.visitors;
CREATE POLICY "Residents can cancel own pending visitor entries"
  ON public.visitors FOR UPDATE
  TO authenticated
  USING (resident_id = auth.uid())
  WITH CHECK (
    resident_id = auth.uid() AND status IN ('rejected', 'expected')
  );

DROP POLICY IF EXISTS "Security and admin can update society visitors" ON public.visitors;
CREATE POLICY "Security and admin can update society visitors"
  ON public.visitors FOR UPDATE
  TO authenticated
  USING (is_society_admin(society_id) OR is_society_security(society_id))
  WITH CHECK (is_society_admin(society_id) OR is_society_security(society_id));


-- --- 3. Phase 3: Deliveries Table --------------------------------------------

CREATE TABLE IF NOT EXISTS public.deliveries (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  society_id       UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  courier_name     TEXT,
  tracking_number  TEXT,
  description      TEXT,
  delivery_date    DATE,
  status           TEXT NOT NULL DEFAULT 'expected'
                     CHECK (status IN ('expected', 'received', 'collected', 'returned')),
  received_at      TIMESTAMPTZ,
  collected_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deliveries_resident_id ON public.deliveries(resident_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_society_id ON public.deliveries(society_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON public.deliveries(status);

DROP TRIGGER IF EXISTS trg_deliveries_updated_at ON public.deliveries;
CREATE TRIGGER trg_deliveries_updated_at
  BEFORE UPDATE ON public.deliveries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Residents can view own deliveries" ON public.deliveries;
CREATE POLICY "Residents can view own deliveries"
  ON public.deliveries FOR SELECT
  TO authenticated
  USING (resident_id = auth.uid());

DROP POLICY IF EXISTS "Security and admin can view society deliveries" ON public.deliveries;
CREATE POLICY "Security and admin can view society deliveries"
  ON public.deliveries FOR SELECT
  TO authenticated
  USING (is_society_admin(society_id) OR is_society_security(society_id));

DROP POLICY IF EXISTS "Security and admin can create deliveries" ON public.deliveries;
CREATE POLICY "Security and admin can create deliveries"
  ON public.deliveries FOR INSERT
  TO authenticated
  WITH CHECK (is_society_admin(society_id) OR is_society_security(society_id));

DROP POLICY IF EXISTS "Security and admin can update deliveries" ON public.deliveries;
CREATE POLICY "Security and admin can update deliveries"
  ON public.deliveries FOR UPDATE
  TO authenticated
  USING (is_society_admin(society_id) OR is_society_security(society_id))
  WITH CHECK (is_society_admin(society_id) OR is_society_security(society_id));

DROP POLICY IF EXISTS "Residents can mark own received deliveries as collected" ON public.deliveries;
CREATE POLICY "Residents can mark own received deliveries as collected"
  ON public.deliveries FOR UPDATE
  TO authenticated
  USING (resident_id = auth.uid())
  WITH CHECK (resident_id = auth.uid() AND status = 'collected');


-- --- 4. Phase 4: Notices Table -----------------------------------------------

CREATE TABLE IF NOT EXISTS public.notices (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id    UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  content       TEXT NOT NULL,
  category      TEXT,
  priority      TEXT NOT NULL DEFAULT 'normal'
                  CHECK (priority IN ('normal', 'important', 'urgent')),
  published_by  UUID REFERENCES public.profiles(id),
  published_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notices_society_id ON public.notices(society_id);
CREATE INDEX IF NOT EXISTS idx_notices_priority ON public.notices(priority);

DROP TRIGGER IF EXISTS trg_notices_updated_at ON public.notices;
CREATE TRIGGER trg_notices_updated_at
  BEFORE UPDATE ON public.notices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view society notices" ON public.notices;
CREATE POLICY "Members can view society notices"
  ON public.notices FOR SELECT
  TO authenticated
  USING (is_society_member(society_id));

DROP POLICY IF EXISTS "Admins can create society notices" ON public.notices;
CREATE POLICY "Admins can create society notices"
  ON public.notices FOR INSERT
  TO authenticated
  WITH CHECK (is_society_admin(society_id));

DROP POLICY IF EXISTS "Admins can update society notices" ON public.notices;
CREATE POLICY "Admins can update society notices"
  ON public.notices FOR UPDATE
  TO authenticated
  USING (is_society_admin(society_id))
  WITH CHECK (is_society_admin(society_id));


-- --- 5. Phase 4: Events & Event RSVPs Table ----------------------------------

CREATE TABLE IF NOT EXISTS public.events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id    UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  event_date    DATE NOT NULL,
  start_time    TIME,
  end_time      TIME,
  location      TEXT,
  created_by    UUID REFERENCES public.profiles(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_society_id ON public.events(society_id);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON public.events(event_date);

DROP TRIGGER IF EXISTS trg_events_updated_at ON public.events;
CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

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

CREATE TABLE IF NOT EXISTS public.event_rsvps (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  resident_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'going'
                  CHECK (status IN ('going', 'not_going')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_event_resident_rsvp UNIQUE (event_id, resident_id)
);

CREATE INDEX IF NOT EXISTS idx_event_rsvps_event_id ON public.event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_resident_id ON public.event_rsvps(resident_id);

ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

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


-- --- 6. Phase 4: Parking Slots Table -----------------------------------------

CREATE TABLE IF NOT EXISTS public.parking_slots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id      UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  resident_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  slot_number     TEXT NOT NULL,
  vehicle_number  TEXT,
  vehicle_type    TEXT,
  status          TEXT NOT NULL DEFAULT 'assigned'
                    CHECK (status IN ('available', 'assigned')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parking_slots_society_id ON public.parking_slots(society_id);
CREATE INDEX IF NOT EXISTS idx_parking_slots_resident_id ON public.parking_slots(resident_id);

DROP TRIGGER IF EXISTS trg_parking_slots_updated_at ON public.parking_slots;
CREATE TRIGGER trg_parking_slots_updated_at
  BEFORE UPDATE ON public.parking_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.parking_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Residents can view own and society parking slots" ON public.parking_slots;
CREATE POLICY "Residents can view own and society parking slots"
  ON public.parking_slots FOR SELECT
  TO authenticated
  USING (is_society_member(society_id));

DROP POLICY IF EXISTS "Admins can create parking slots" ON public.parking_slots;
CREATE POLICY "Admins can create parking slots"
  ON public.parking_slots FOR INSERT
  TO authenticated
  WITH CHECK (is_society_admin(society_id));

DROP POLICY IF EXISTS "Admins can update parking slots" ON public.parking_slots;
CREATE POLICY "Admins can update parking slots"
  ON public.parking_slots FOR UPDATE
  TO authenticated
  USING (is_society_admin(society_id))
  WITH CHECK (is_society_admin(society_id));


-- --- 7. Phase 4: Amenities & Amenity Bookings Table --------------------------

CREATE TABLE IF NOT EXISTS public.amenities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id    UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  location      TEXT,
  capacity      INTEGER,
  status        TEXT NOT NULL DEFAULT 'available'
                  CHECK (status IN ('available', 'maintenance', 'closed')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_amenities_society_id ON public.amenities(society_id);

DROP TRIGGER IF EXISTS trg_amenities_updated_at ON public.amenities;
CREATE TRIGGER trg_amenities_updated_at
  BEFORE UPDATE ON public.amenities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view society amenities" ON public.amenities;
CREATE POLICY "Members can view society amenities"
  ON public.amenities FOR SELECT
  TO authenticated
  USING (is_society_member(society_id));

DROP POLICY IF EXISTS "Admins can create amenities" ON public.amenities;
CREATE POLICY "Admins can create amenities"
  ON public.amenities FOR INSERT
  TO authenticated
  WITH CHECK (is_society_admin(society_id));

DROP POLICY IF EXISTS "Admins can update amenities" ON public.amenities;
CREATE POLICY "Admins can update amenities"
  ON public.amenities FOR UPDATE
  TO authenticated
  USING (is_society_admin(society_id))
  WITH CHECK (is_society_admin(society_id));

CREATE TABLE IF NOT EXISTS public.amenity_bookings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amenity_id    UUID NOT NULL REFERENCES public.amenities(id) ON DELETE CASCADE,
  resident_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  booking_date  DATE NOT NULL,
  start_time    TIME,
  end_time      TIME,
  status        TEXT NOT NULL DEFAULT 'booked'
                  CHECK (status IN ('booked', 'cancelled', 'completed')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_amenity_bookings_amenity_id ON public.amenity_bookings(amenity_id);
CREATE INDEX IF NOT EXISTS idx_amenity_bookings_resident_id ON public.amenity_bookings(resident_id);

DROP TRIGGER IF EXISTS trg_amenity_bookings_updated_at ON public.amenity_bookings;
CREATE TRIGGER trg_amenity_bookings_updated_at
  BEFORE UPDATE ON public.amenity_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.amenity_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Residents can view own amenity bookings" ON public.amenity_bookings;
CREATE POLICY "Residents can view own amenity bookings"
  ON public.amenity_bookings FOR SELECT
  TO authenticated
  USING (resident_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view society amenity bookings" ON public.amenity_bookings;
CREATE POLICY "Admins can view society amenity bookings"
  ON public.amenity_bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.amenities a
      WHERE a.id = amenity_bookings.amenity_id
        AND is_society_admin(a.society_id)
    )
  );

DROP POLICY IF EXISTS "Residents can create amenity bookings" ON public.amenity_bookings;
CREATE POLICY "Residents can create amenity bookings"
  ON public.amenity_bookings FOR INSERT
  TO authenticated
  WITH CHECK (
    resident_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.amenities a
      WHERE a.id = amenity_bookings.amenity_id
        AND is_society_member(a.society_id)
    )
  );

DROP POLICY IF EXISTS "Residents can cancel their own amenity bookings" ON public.amenity_bookings;
CREATE POLICY "Residents can cancel their own amenity bookings"
  ON public.amenity_bookings FOR UPDATE
  TO authenticated
  USING (resident_id = auth.uid())
  WITH CHECK (resident_id = auth.uid() AND status = 'cancelled');

DROP POLICY IF EXISTS "Admins can update society amenity bookings" ON public.amenity_bookings;
CREATE POLICY "Admins can update society amenity bookings"
  ON public.amenity_bookings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.amenities a
      WHERE a.id = amenity_bookings.amenity_id
        AND is_society_admin(a.society_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.amenities a
      WHERE a.id = amenity_bookings.amenity_id
        AND is_society_admin(a.society_id)
    )
  );


-- --- 8. Explicit Permissions (GRANT statements for authenticated role) -------

GRANT SELECT, INSERT, UPDATE ON public.visitors TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.deliveries TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.notices TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_rsvps TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.parking_slots TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.amenities TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.amenity_bookings TO authenticated;
