-- =============================================================================
-- Phase 5.5: Supabase Realtime Publication Configuration
-- =============================================================================
--
-- PURPOSE:
--   Enable Postgres Changes Realtime for the 4 tables that require live
--   subscriptions. This uses ALTER PUBLICATION ... ADD TABLE which is safe
--   and idempotent — adding an already-published table is a no-op in Postgres.
--
-- TABLES ENABLED FOR REALTIME:
--   public.complaints       → Admin receives new complaints; Resident sees status updates
--   public.visitors         → Resident sees visitor status updates; Security sees new visitors
--   public.deliveries       → Resident sees new deliveries and status updates
--   public.service_bookings → Provider sees new incoming service requests
--
-- IMPORTANT:
--   - Does NOT drop, recreate, or modify any existing tables or policies.
--   - Does NOT touch the realtime schema directly.
--   - Does NOT modify any Phase 1–5 objects.
--   - RLS policies are NOT changed — Realtime already respects existing RLS.
--   - A resident subscriber will only receive their own complaint/visitor/delivery
--     updates because the existing RLS policies apply at the Realtime layer too.
--
-- MANUAL EXECUTION REQUIRED:
--   Run this in the Supabase SQL Editor. Do NOT execute automatically.
--
-- VERIFICATION:
--   After running, verify in Supabase Dashboard:
--   Database → Replication → supabase_realtime publication
--   All 4 tables should appear in the publication's table list.
-- =============================================================================

-- Enable Realtime for the complaints table
-- Supports: Admin receives new resident complaints (INSERT)
--           Resident sees their own complaint status changes (UPDATE)
ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;

-- Enable Realtime for the visitors table
-- Supports: Security sees new visitor pre-registrations by residents (INSERT)
--           Resident sees their visitor status updates from security (UPDATE)
ALTER PUBLICATION supabase_realtime ADD TABLE public.visitors;

-- Enable Realtime for the deliveries table
-- Supports: Resident sees new deliveries logged by security (INSERT)
--           Resident sees delivery status updates from security (UPDATE)
ALTER PUBLICATION supabase_realtime ADD TABLE public.deliveries;

-- Enable Realtime for the service_bookings table
-- Supports: Provider receives new service booking requests (INSERT)
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_bookings;

-- =============================================================================
-- VERIFICATION QUERIES (run after the above to confirm publication)
-- =============================================================================
SELECT
  schemaname,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('complaints', 'visitors', 'deliveries', 'service_bookings')
ORDER BY tablename;

-- Expected output: 4 rows, one for each table above.
-- If any table is missing, re-run its ALTER PUBLICATION statement.
