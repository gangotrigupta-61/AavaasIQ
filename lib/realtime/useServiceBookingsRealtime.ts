'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { DbServiceBooking } from '@/lib/supabase/types';

// ─── Provider: Subscribe to INSERT events on their assigned bookings ──────────

interface UseProviderBookingsRealtimeOptions {
  providerId: string | null | undefined;
  onInsert: (row: DbServiceBooking) => void;
}

/**
 * Subscribes to INSERT events on public.service_bookings filtered by
 * provider_id = providerId. Fires when a resident creates a new service booking
 * for this provider.
 *
 * Provider only sees bookings assigned to them — RLS and the filter both
 * ensure no cross-provider data leakage.
 */
export function useProviderBookingsRealtime({
  providerId,
  onInsert,
}: UseProviderBookingsRealtimeOptions) {
  useEffect(() => {
    if (!providerId) return;

    const supabase = createClient();
    const channelName = `service_bookings:provider:${providerId}`;

    const channel = supabase
      .channel(channelName)
      .on<DbServiceBooking>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'service_bookings',
          filter: `provider_id=eq.${providerId}`,
        },
        (payload) => {
          onInsert(payload.new);
        },
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn(`[ProviderBookingsRealtime] channel ${channelName} status:`, status);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [providerId, onInsert]);
}
