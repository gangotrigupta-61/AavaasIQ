'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { DbDelivery } from '@/lib/supabase/types';

// ─── Resident: Subscribe to INSERT + UPDATE on their own deliveries ───────────

interface UseResidentDeliveriesRealtimeOptions {
  residentId: string | null | undefined;
  onInsert: (row: DbDelivery) => void;
  onUpdate: (row: DbDelivery) => void;
}

/**
 * Subscribes to INSERT and UPDATE events on public.deliveries filtered by
 * resident_id = residentId.
 *
 * INSERT fires when security logs a new delivery for this resident.
 * UPDATE fires when security changes delivery status (received → collected, etc.)
 * or when the resident marks as collected.
 *
 * Resident only receives their own delivery events — RLS enforces this;
 * the filter provides defence-in-depth.
 */
export function useResidentDeliveriesRealtime({
  residentId,
  onInsert,
  onUpdate,
}: UseResidentDeliveriesRealtimeOptions) {
  useEffect(() => {
    if (!residentId) return;

    const supabase = createClient();
    const channelName = `deliveries:resident:${residentId}`;

    const channel = supabase
      .channel(channelName)
      .on<DbDelivery>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'deliveries',
          filter: `resident_id=eq.${residentId}`,
        },
        (payload) => {
          onInsert(payload.new);
        },
      )
      .on<DbDelivery>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'deliveries',
          filter: `resident_id=eq.${residentId}`,
        },
        (payload) => {
          onUpdate(payload.new);
        },
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn(`[ResidentDeliveriesRealtime] channel ${channelName} status:`, status);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [residentId, onInsert, onUpdate]);
}
