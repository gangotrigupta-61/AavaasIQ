'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { DbComplaint } from '@/lib/supabase/types';

// ─── Admin: Subscribe to new complaint INSERTs for their society ──────────────

interface UseAdminComplaintsRealtimeOptions {
  societyId: string | null | undefined;
  onInsert: (id: string) => void;   // Only the ID — caller re-fetches full row
  onUpdate: (row: DbComplaint) => void;
}

/**
 * Subscribes to INSERT and UPDATE events on public.complaints for the
 * admin's society. On INSERT, calls onInsert(id) so the admin page can
 * do a targeted server-side re-fetch for the full row (including joined
 * resident name and flat number). On UPDATE, calls onUpdate(row) with the
 * updated row payload.
 *
 * Supabase RLS applies: only events the admin's session is authorised to
 * see will be delivered — no cross-society leakage.
 */
export function useAdminComplaintsRealtime({
  societyId,
  onInsert,
  onUpdate,
}: UseAdminComplaintsRealtimeOptions) {
  useEffect(() => {
    if (!societyId) return;

    const supabase = createClient();
    const channelName = `complaints:society:${societyId}`;

    const channel = supabase
      .channel(channelName)
      .on<DbComplaint>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'complaints',
          filter: `society_id=eq.${societyId}`,
        },
        (payload) => {
          // Don't push an incomplete row into admin state.
          // Just surface the ID so the page can do a targeted authoritative re-fetch.
          onInsert(payload.new.id);
        },
      )
      .on<DbComplaint>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'complaints',
          filter: `society_id=eq.${societyId}`,
        },
        (payload) => {
          onUpdate(payload.new);
        },
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn(`[AdminComplaintsRealtime] channel ${channelName} status:`, status);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [societyId, onInsert, onUpdate]);
}

// ─── Resident: Subscribe to UPDATE events on their own complaints ─────────────

interface UseResidentComplaintsRealtimeOptions {
  residentId: string | null | undefined;
  onUpdate: (row: DbComplaint) => void;
}

/**
 * Subscribes to UPDATE events on public.complaints filtered by
 * resident_id = residentId.  Resident only sees their own complaint updates.
 * RLS on the complaints table enforces this at the database level too.
 */
export function useResidentComplaintsRealtime({
  residentId,
  onUpdate,
}: UseResidentComplaintsRealtimeOptions) {
  useEffect(() => {
    if (!residentId) return;

    const supabase = createClient();
    const channelName = `complaints:resident:${residentId}`;

    const channel = supabase
      .channel(channelName)
      .on<DbComplaint>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'complaints',
          filter: `resident_id=eq.${residentId}`,
        },
        (payload) => {
          onUpdate(payload.new);
        },
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn(`[ResidentComplaintsRealtime] channel ${channelName} status:`, status);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [residentId, onUpdate]);
}
