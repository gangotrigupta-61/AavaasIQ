-- =============================================================================
-- AavaasIQ — Phase 5: Home Services, Emergency Contacts & Protocols, Analytics
-- =============================================================================
-- Dependency Ordering:
--   1. Trigger helper (ensure update_updated_at_column exists)
--   2. Tables: service_providers -> service_bookings -> emergency_contacts
--   3. Indexes on new tables
--   4. Triggers on new tables
--   5. Helper function: is_society_member (references service_providers)
--   6. Enable Row Level Security (RLS)
--   7. Explicit Grants for authenticated role
--   8. RLS Policies (use is_society_member, is_society_admin, is_society_security)
--   9. Demo / Initial Seed Data (safe idempotent block)
-- =============================================================================
-- Safe to re-run. Does NOT drop or recreate existing Phase 1–4 tables.
-- Does NOT reintroduce Parking or Amenities.
-- =============================================================================

-- ─── 1. Ensure Updated At Trigger Function Exists ───────────────────────────

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── 2. Tables ──────────────────────────────────────────────────────────────

-- Table 2a: service_providers
-- Must be created BEFORE service_bookings (foreign key target) and BEFORE
-- is_society_member (which queries public.service_providers).
CREATE TABLE IF NOT EXISTS public.service_providers (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id     UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  user_id        UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  name           TEXT NOT NULL,
  category       TEXT NOT NULL,
  phone          TEXT,
  rating         NUMERIC(2,1) NOT NULL DEFAULT 5.0,
  review_count   INTEGER NOT NULL DEFAULT 0,
  experience     TEXT,
  starting_price INTEGER NOT NULL DEFAULT 299,
  verified       BOOLEAN NOT NULL DEFAULT TRUE,
  available      BOOLEAN NOT NULL DEFAULT TRUE,
  bio            TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 2b: service_bookings
-- References public.service_providers(id) created above.
CREATE TABLE IF NOT EXISTS public.service_bookings (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id     UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  provider_id    UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  resident_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_title  TEXT NOT NULL,
  description    TEXT,
  flat_number    TEXT NOT NULL,
  block          TEXT,
  scheduled_at   TIMESTAMPTZ NOT NULL,
  status         TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined', 'confirmed', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  amount         INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 2c: emergency_contacts
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id      UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  category        TEXT NOT NULL,
  phone           TEXT NOT NULL,
  available_hours TEXT NOT NULL DEFAULT '24 × 7',
  description     TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 3. Indexes ─────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_service_providers_society_id ON public.service_providers(society_id);
CREATE INDEX IF NOT EXISTS idx_service_providers_user_id ON public.service_providers(user_id);
CREATE INDEX IF NOT EXISTS idx_service_providers_category ON public.service_providers(category);

CREATE INDEX IF NOT EXISTS idx_service_bookings_society_id ON public.service_bookings(society_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_provider_id ON public.service_bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_resident_id ON public.service_bookings(resident_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_status ON public.service_bookings(status);

CREATE INDEX IF NOT EXISTS idx_emergency_contacts_society_id ON public.emergency_contacts(society_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_category ON public.emergency_contacts(category);

-- ─── 4. Triggers ────────────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS trg_service_providers_updated_at ON public.service_providers;
CREATE TRIGGER trg_service_providers_updated_at
  BEFORE UPDATE ON public.service_providers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_service_bookings_updated_at ON public.service_bookings;
CREATE TRIGGER trg_service_bookings_updated_at
  BEFORE UPDATE ON public.service_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_emergency_contacts_updated_at ON public.emergency_contacts;
CREATE TRIGGER trg_emergency_contacts_updated_at
  BEFORE UPDATE ON public.emergency_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ─── 5. Helper Function: Check Society Membership ───────────────────────────
-- Now safe to create because public.service_providers already exists.

CREATE OR REPLACE FUNCTION public.is_society_member(check_society_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.society_memberships sm
    WHERE sm.user_id = auth.uid()
      AND sm.society_id = check_society_id
      AND sm.status = 'active'
  ) OR EXISTS (
    SELECT 1 FROM public.service_providers sp
    WHERE sp.user_id = auth.uid()
      AND sp.society_id = check_society_id
  );
$$;

-- ─── 6. Enable Row Level Security (RLS) ─────────────────────────────────────

ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- ─── 7. Explicit Grants to authenticated Role ───────────────────────────────

GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_providers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_bookings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.emergency_contacts TO authenticated;

-- ─── 8. RLS Policies: service_providers ─────────────────────────────────────

DROP POLICY IF EXISTS "Members can view providers in their society" ON public.service_providers;
CREATE POLICY "Members can view providers in their society"
  ON public.service_providers FOR SELECT
  TO authenticated
  USING (
    is_society_member(society_id)
    OR is_society_admin(society_id)
    OR is_society_security(society_id)
    OR user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Admin can insert service providers" ON public.service_providers;
CREATE POLICY "Admin can insert service providers"
  ON public.service_providers FOR INSERT
  TO authenticated
  WITH CHECK (
    is_society_admin(society_id)
  );

DROP POLICY IF EXISTS "Admin and Provider can update service providers" ON public.service_providers;
CREATE POLICY "Admin and Provider can update service providers"
  ON public.service_providers FOR UPDATE
  TO authenticated
  USING (
    is_society_admin(society_id) OR user_id = auth.uid()
  )
  WITH CHECK (
    is_society_admin(society_id) OR user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Admin can delete service providers" ON public.service_providers;
CREATE POLICY "Admin can delete service providers"
  ON public.service_providers FOR DELETE
  TO authenticated
  USING (
    is_society_admin(society_id)
  );

-- ─── 9. RLS Policies: service_bookings ──────────────────────────────────────

DROP POLICY IF EXISTS "Parties can view service bookings" ON public.service_bookings;
CREATE POLICY "Parties can view service bookings"
  ON public.service_bookings FOR SELECT
  TO authenticated
  USING (
    resident_id = auth.uid()
    OR provider_id IN (SELECT sp.id FROM public.service_providers sp WHERE sp.user_id = auth.uid())
    OR is_society_admin(society_id)
  );

DROP POLICY IF EXISTS "Residents can create service bookings" ON public.service_bookings;
CREATE POLICY "Residents can create service bookings"
  ON public.service_bookings FOR INSERT
  TO authenticated
  WITH CHECK (
    resident_id = auth.uid()
    AND is_society_member(society_id)
  );

DROP POLICY IF EXISTS "Parties can update service bookings" ON public.service_bookings;
CREATE POLICY "Parties can update service bookings"
  ON public.service_bookings FOR UPDATE
  TO authenticated
  USING (
    (resident_id = auth.uid() AND status = 'pending')
    OR provider_id IN (SELECT sp.id FROM public.service_providers sp WHERE sp.user_id = auth.uid())
    OR is_society_admin(society_id)
  )
  WITH CHECK (
    (resident_id = auth.uid() AND status = 'cancelled')
    OR provider_id IN (SELECT sp.id FROM public.service_providers sp WHERE sp.user_id = auth.uid())
    OR is_society_admin(society_id)
  );

DROP POLICY IF EXISTS "Admin can delete service bookings" ON public.service_bookings;
CREATE POLICY "Admin can delete service bookings"
  ON public.service_bookings FOR DELETE
  TO authenticated
  USING (
    is_society_admin(society_id)
  );

-- ─── 10. RLS Policies: emergency_contacts ───────────────────────────────────

DROP POLICY IF EXISTS "Members can view emergency contacts in their society" ON public.emergency_contacts;
CREATE POLICY "Members can view emergency contacts in their society"
  ON public.emergency_contacts FOR SELECT
  TO authenticated
  USING (
    is_society_member(society_id)
    OR is_society_admin(society_id)
    OR is_society_security(society_id)
  );

DROP POLICY IF EXISTS "Admin can manage emergency contacts" ON public.emergency_contacts;
CREATE POLICY "Admin can manage emergency contacts"
  ON public.emergency_contacts FOR ALL
  TO authenticated
  USING (
    is_society_admin(society_id)
  )
  WITH CHECK (
    is_society_admin(society_id)
  );

-- ─── 11. Seed Demo / Initial Data for Green Valley Residency ─────────────────
-- Identified clearly as initial sample data. Uses DO block with conflict checks.

DO $$
DECLARE
  v_society_id UUID;
  v_provider_user_id UUID;
  v_ramesh_provider_id UUID;
  v_rahul_user_id UUID;
BEGIN
  -- 1. Look up Green Valley Residency
  SELECT id INTO v_society_id
  FROM public.societies
  WHERE lower(name) LIKE '%green valley%'
  LIMIT 1;

  IF v_society_id IS NULL THEN
    RAISE NOTICE 'Green Valley Residency not found. Skipping initial seed.';
    RETURN;
  END IF;

  -- 2. Look up Ramesh Kumar (Provider Profile)
  SELECT id INTO v_provider_user_id
  FROM public.profiles
  WHERE role = 'provider' AND lower(full_name) LIKE '%ramesh%'
  LIMIT 1;

  -- 3. Look up Rahul Sharma (Resident Profile)
  SELECT id INTO v_rahul_user_id
  FROM public.profiles
  WHERE role = 'resident' AND lower(full_name) LIKE '%rahul%'
  LIMIT 1;

  -- 4. Seed Service Providers
  -- Ramesh Kumar (Plumbing) linked to auth profile
  IF NOT EXISTS (
    SELECT 1 FROM public.service_providers
    WHERE society_id = v_society_id AND name = 'Ramesh Kumar'
  ) THEN
    INSERT INTO public.service_providers (
      society_id, user_id, name, category, phone, rating, review_count, experience, starting_price, verified, available, bio
    ) VALUES (
      v_society_id,
      v_provider_user_id,
      'Ramesh Kumar',
      'Plumbing',
      '+91 98230 12345',
      4.8,
      134,
      '8 years',
      300,
      TRUE,
      TRUE,
      'Expert plumber specialising in pipe fitting, leakage repairs, and bathroom fittings. 3-month service warranty.'
    ) RETURNING id INTO v_ramesh_provider_id;
  ELSE
    SELECT id INTO v_ramesh_provider_id
    FROM public.service_providers
    WHERE society_id = v_society_id AND name = 'Ramesh Kumar'
    LIMIT 1;

    -- Update user_id link if needed
    IF v_provider_user_id IS NOT NULL THEN
      UPDATE public.service_providers
      SET user_id = v_provider_user_id
      WHERE id = v_ramesh_provider_id AND user_id IS NULL;
    END IF;
  END IF;

  -- Other society verified service providers
  INSERT INTO public.service_providers (society_id, name, category, phone, rating, review_count, experience, starting_price, verified, available, bio)
  SELECT v_society_id, d.name, d.category, d.phone, d.rating, d.review_count, d.experience, d.starting_price, d.verified, d.available, d.bio
  FROM (VALUES
    ('Mohan Pipes & Fittings', 'Plumbing', '+91 98230 23456', 4.6, 98, '12 years', 350, TRUE, TRUE, 'Comprehensive plumbing solutions including water heater installation, drainage unclogging, and pipeline overhaul.'),
    ('Sunil Electric Works', 'Electrical', '+91 98230 34567', 4.7, 212, '10 years', 400, TRUE, TRUE, 'Licensed electrician for wiring, switch/socket replacement, MCB panel work, and short-circuit repair.'),
    ('Ravi Wiring Solutions', 'Electrical', '+91 98230 45678', 4.5, 76, '6 years', 350, TRUE, TRUE, 'Specialises in home wiring, fan installations, geyser fitting, and CCTV power cabling.'),
    ('Sunita Clean Services', 'Cleaning', '+91 98230 56789', 4.6, 189, '5 years', 500, TRUE, TRUE, 'Professional home cleaning with eco-friendly products — deep cleaning, kitchen scrubbing, bathroom sanitisation.'),
    ('Fresh Home Cleaners', 'Cleaning', '+91 98230 67890', 4.4, 115, '3 years', 450, TRUE, TRUE, 'Affordable and reliable home cleaning — one-time deep cleans and regular weekly/monthly subscriptions.'),
    ('CoolAir Pro', 'AC Service', '+91 98230 78901', 4.9, 307, '15 years', 800, TRUE, TRUE, 'Authorised service for Voltas, Daikin, and LG AC units. Servicing, gas refilling, compressor repair.'),
    ('Arctic AC Services', 'AC Service', '+91 98230 89012', 4.8, 241, '8 years', 750, TRUE, TRUE, 'Multi-brand AC servicing and repairs. Emergency breakdown service available 24x7.'),
    ('Rang De Painters', 'Painting', '+91 98230 90123', 4.7, 163, '10 years', 5000, TRUE, TRUE, 'Interior and exterior painting using Asian Paints and Berger premium products. Free colour consultation.'),
    ('Perfect Finish Painters', 'Painting', '+91 98230 01234', 4.5, 88, '7 years', 4500, TRUE, TRUE, 'Designer wall finishes, Italian putty, and stencil work. Full flat painting packages with 1-year paint warranty.'),
    ('Priya Beauty at Home', 'Beauty', '+91 98230 11223', 4.8, 274, '6 years', 500, TRUE, TRUE, 'Professional beauty services at your doorstep — facial, waxing, manicure, pedicure, and bridal makeup.'),
    ('Glamour At Home', 'Beauty', '+91 98230 22334', 4.6, 198, '4 years', 450, TRUE, TRUE, 'Salon-quality beauty services at home. Hair care, skin care, and party makeup packages.')
  ) AS d(name, category, phone, rating, review_count, experience, starting_price, verified, available, bio)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.service_providers sp
    WHERE sp.society_id = v_society_id AND sp.name = d.name
  );

  -- 5. Seed Emergency Contacts
  INSERT INTO public.emergency_contacts (society_id, name, category, phone, available_hours, description, sort_order)
  SELECT v_society_id, d.name, d.category, d.phone, d.available_hours, d.description, d.sort_order
  FROM (VALUES
    ('National Emergency', 'National Emergency', '112', '24 × 7', 'All emergency services', 1),
    ('Police Emergency', 'National Emergency', '100', '24 × 7', 'Police control room', 2),
    ('Fire Brigade', 'National Emergency', '101', '24 × 7', 'Fire emergency response', 3),
    ('Ambulance (National)', 'National Emergency', '108', '24 × 7', 'Medical emergency ambulance', 4),

    ('Security Gate — Gate 1', 'Society Security', '020-2700-0001', '24 × 7', 'Main Gate Security Desk', 5),
    ('Security Gate — Gate 2', 'Society Security', '020-2700-0002', '24 × 7', 'Rear Gate Security Desk', 6),
    ('Security Control Room', 'Society Security', '020-2700-0099', '24 × 7', 'Central Security Office', 7),
    ('Society Office', 'Society Security', '020-2700-0010', '9 AM – 6 PM', 'Administrative Office', 8),

    ('Poona Hospital A&E', 'Medical', '020-2613-3000', '24 × 7', 'Emergency department · 2.1 km away', 9),
    ('Ruby Hall Clinic', 'Medical', '020-6645-5000', '24 × 7', 'Multispecialty hospital · 3.4 km away', 10),
    ('Society First-Aid Room', 'Medical', '020-2700-0030', '24 × 7', 'Located in Clubhouse Block A', 11),

    ('Pune Fire Brigade', 'Fire', '020-2645-1707', '24 × 7', 'Central fire station', 12),
    ('Fire Helpline (Toll Free)', 'Fire', '1800-233-0418', '24 × 7', 'Toll-free emergency helpline', 13),

    ('Baner Police Station', 'Police', '020-2729-5100', '24 × 7', 'Local jurisdiction police station', 14),
    ('Women Helpline', 'Police', '1091', '24 × 7', 'National women safety helpline', 15),

    ('MSEDCL Power Failure', 'Utilities', '1800-102-3435', '24 × 7', 'Electricity emergency & outage reporting', 16),
    ('Maharashtra Natural Gas', 'Utilities', '1800-233-4455', '24 × 7', 'Gas pipeline emergency leak helpline', 17),
    ('PMRDA Water Supply', 'Utilities', '020-2721-2121', '9 AM – 6 PM', 'Municipal water helpline', 18),

    ('Society Plumber', 'Maintenance', '98765-11111', '8 AM – 9 PM', 'Society on-call plumber', 19),
    ('Society Electrician', 'Maintenance', '98765-22222', '8 AM – 9 PM', 'Society on-call electrician', 20),
    ('Lift Maintenance Helpdesk', 'Maintenance', '98765-33333', '24 × 7', 'Otis elevator service desk', 21)
  ) AS d(name, category, phone, available_hours, description, sort_order)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.emergency_contacts ec
    WHERE ec.society_id = v_society_id AND ec.name = d.name
  );

  -- 6. Seed Sample Initial Bookings for Ramesh Kumar (only if provider & resident exist)
  IF v_ramesh_provider_id IS NOT NULL AND v_rahul_user_id IS NOT NULL THEN
    -- Seed initial pending request if none exist
    IF NOT EXISTS (
      SELECT 1 FROM public.service_bookings
      WHERE provider_id = v_ramesh_provider_id
    ) THEN
      INSERT INTO public.service_bookings (
        society_id, provider_id, resident_id, service_title, description, flat_number, block, scheduled_at, status, amount
      ) VALUES
      (
        v_society_id, v_ramesh_provider_id, v_rahul_user_id,
        'Pipe Leak Repair', 'Kitchen sink pipe dripping continuously under the counter.',
        '204', 'A', NOW() + INTERVAL '1 day', 'pending', 450
      ),
      (
        v_society_id, v_ramesh_provider_id, v_rahul_user_id,
        'Bathroom Fitting', 'Replace leaking shower mixer and basin tap.',
        '204', 'A', NOW() + INTERVAL '2 days', 'confirmed', 800
      ),
      (
        v_society_id, v_ramesh_provider_id, v_rahul_user_id,
        'Water Tank Cleaning', 'Routine quarterly water tank flush and disinfection.',
        '204', 'A', NOW() - INTERVAL '3 days', 'completed', 600
      );
    END IF;
  END IF;

END $$;
