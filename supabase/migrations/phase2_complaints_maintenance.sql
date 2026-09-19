-- =============================================================================
-- AavaasIQ — Phase 2: Complaints + Maintenance Schema & RLS Policies
-- =============================================================================

-- 1. Helper function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Helper function to safely check society admin role without RLS recursion
CREATE OR REPLACE FUNCTION is_society_admin(check_society_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.society_memberships sm ON sm.user_id = p.id
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND sm.society_id = check_society_id
      AND sm.status = 'active'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- =============================================================================
-- Table 1: complaints
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.complaints (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  society_id   UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  category     TEXT NOT NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  priority     TEXT NOT NULL DEFAULT 'medium'
                 CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status       TEXT NOT NULL DEFAULT 'open'
                 CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_to  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at  TIMESTAMPTZ
);

-- Indexes for complaints
CREATE INDEX IF NOT EXISTS idx_complaints_resident_id ON public.complaints(resident_id);
CREATE INDEX IF NOT EXISTS idx_complaints_society_id ON public.complaints(society_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);

-- Updated_at trigger for complaints
DROP TRIGGER IF EXISTS trg_complaints_updated_at ON public.complaints;
CREATE TRIGGER trg_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on complaints
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Complaints SELECT: Resident can view own; Admin can view society's complaints
CREATE POLICY "complaints_select"
  ON public.complaints FOR SELECT
  USING (
    resident_id = auth.uid()
    OR
    is_society_admin(society_id)
  );

-- Complaints INSERT: Resident can insert for self; Admin can insert for society
CREATE POLICY "complaints_insert"
  ON public.complaints FOR INSERT
  WITH CHECK (
    (
      resident_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.society_memberships
        WHERE user_id = auth.uid()
          AND society_id = complaints.society_id
          AND status = 'active'
      )
    )
    OR
    is_society_admin(society_id)
  );

-- Complaints UPDATE: Only Admin can update status, priority, or assignment
CREATE POLICY "complaints_update_admin"
  ON public.complaints FOR UPDATE
  USING (is_society_admin(society_id))
  WITH CHECK (is_society_admin(society_id));

-- (Note: No DELETE policy — complaint deletion is not permitted)

-- =============================================================================
-- Table 2: maintenance_records
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.maintenance_records (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  society_id         UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  title              TEXT NOT NULL,
  amount             NUMERIC(10,2) NOT NULL DEFAULT 0,
  due_date           DATE,
  status             TEXT NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending', 'paid', 'overdue')),
  payment_reference  TEXT,
  paid_at            TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for maintenance_records
CREATE INDEX IF NOT EXISTS idx_maintenance_resident_id ON public.maintenance_records(resident_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_society_id ON public.maintenance_records(society_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON public.maintenance_records(status);

-- Updated_at trigger for maintenance_records
DROP TRIGGER IF EXISTS trg_maintenance_updated_at ON public.maintenance_records;
CREATE TRIGGER trg_maintenance_updated_at
  BEFORE UPDATE ON public.maintenance_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on maintenance_records
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;

-- Maintenance SELECT: Resident can view own records; Admin can view society records
CREATE POLICY "maintenance_select"
  ON public.maintenance_records FOR SELECT
  USING (
    resident_id = auth.uid()
    OR
    is_society_admin(society_id)
  );

-- Maintenance INSERT: Admin only
CREATE POLICY "maintenance_insert_admin"
  ON public.maintenance_records FOR INSERT
  WITH CHECK (is_society_admin(society_id));

-- Maintenance UPDATE: Admin only for general record updates
CREATE POLICY "maintenance_update_admin"
  ON public.maintenance_records FOR UPDATE
  USING (is_society_admin(society_id))
  WITH CHECK (is_society_admin(society_id));

-- (Note: Residents have NO direct UPDATE permission on maintenance_records)

-- 3. Controlled function for simulated resident payments
-- Verifies ownership & pending status, then updates payment-related fields safely
CREATE OR REPLACE FUNCTION record_simulated_payment(p_record_id UUID, p_payment_ref TEXT)
RETURNS public.maintenance_records AS $$
DECLARE
  v_record public.maintenance_records;
BEGIN
  UPDATE public.maintenance_records
  SET status = 'paid',
      paid_at = NOW(),
      payment_reference = p_payment_ref,
      updated_at = NOW()
  WHERE id = p_record_id
    AND resident_id = auth.uid()
    AND status IN ('pending', 'overdue')
  RETURNING * INTO v_record;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Maintenance record not found, does not belong to user, or is already paid';
  END IF;

  RETURN v_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
