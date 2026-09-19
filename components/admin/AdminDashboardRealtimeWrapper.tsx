'use client';

import { useRouter } from 'next/navigation';
import { useAdminComplaintsRealtime } from '@/lib/realtime/useComplaintsRealtime';
import { useToast } from '@/components/ui/Toast';

interface AdminDashboardRealtimeWrapperProps {
  societyId: string;
}

/**
 * Client-side Realtime listener for the Admin Dashboard.
 * Sits alongside the server-rendered dashboard and triggers a soft
 * router.refresh() when new complaints are created or updated,
 * updating dashboard KPI counts and activity feeds live.
 */
export function AdminDashboardRealtimeWrapper({ societyId }: AdminDashboardRealtimeWrapperProps) {
  const router = useRouter();
  const { showToast } = useToast();

  useAdminComplaintsRealtime({
    societyId,
    onInsert: () => {
      showToast('New complaint received from resident.', 'info');
      router.refresh();
    },
    onUpdate: () => {
      router.refresh();
    },
  });

  return null;
}
