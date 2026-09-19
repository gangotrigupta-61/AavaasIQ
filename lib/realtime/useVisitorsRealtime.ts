'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { DbVisitor } from '@/lib/supabase/types';

// ─── Resident: Subscribe to UPDATE events on their own visitors ───────────────

interface UseResidentVisitorsRealtimeOptions {
  residentId: string | null | undefined;
  onUpdate: (row: DbVisitor) => void;
}

/**
 * Subscribes to UPDATE events on public.visitors filtered by
 * resident_id = residentId. Fires when security changes a visitor's status
 * (expected → approved → inside → exited).
 *
 * Resident only receives updates to their own visitors — RLS enforces this
 * at the database level; the filter provides defence-in-depth.
 */
export function useResidentVisitorsRealtime({
  residentId,
  onUpdate,
}: UseResidentVisitorsRealtimeOptions) {
  useEffect(() => {
    if (!residentId) return;

    const supabase = createClient();
    const channelName = `visitors:resident:${residentId}`;

    const channel = supabase
      .channel(channelName)
      .on<DbVisitor>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'visitors',
          filter: `resident_id=eq.${residentId}`,
        },
        (payload) => {
          onUpdate(payload.new);
        },
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn(`[ResidentVisitorsRealtime] channel ${channelName} status:`, status);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [residentId, onUpdate]);
}

// ─── Security: Subscribe to INSERT events (new visitor pre-registrations) ─────

interface UseSecurityVisitorsRealtimeOptions {
  societyId: string | null | undefined;
  onInsert: (row: DbVisitor) => void;
}

/**
 * Subscribes to INSERT events on public.visitors filtered by
 * society_id = societyId. Fires when a resident pre-registers a new visitor.
 * Security sees the new expected visitor without refreshing.
 *
 * RLS on visitors ensures security only sees visitors for their society.
 */
export function useSecurityVisitorsRealtime({
  societyId,
  onInsert,
}: UseSecurityVisitorsRealtimeOptions) {
  useEffect(() => {
    if (!societyId) return;

    const supabase = createClient();
    const channelName = `visitors:society:${societyId}`;

    const channel = supabase
      .channel(channelName)
      .on<DbVisitor>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'visitors',
          filter: `society_id=eq.${societyId}`,
        },
        (payload) => {
          onInsert(payload.new);
        },
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn(`[SecurityVisitorsRealtime] channel ${channelName} status:`, status);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [societyId, onInsert]);
}
