'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { getMyDeliveries, confirmDeliveryCollection } from '@/app/actions/deliveries';
import { useResidentDeliveriesRealtime } from '@/lib/realtime/useDeliveriesRealtime';
import { Delivery } from '@/lib/types';
import { Package, Clock, CheckCircle2, RotateCcw, Loader2 } from 'lucide-react';

const statusConfig: Record<string, { label: string; variant: 'warning' | 'info' | 'success' | 'neutral'; icon: React.ReactNode }> = {
  expected:   { label: 'Awaiting Collection', variant: 'info',    icon: <Package className="w-4 h-4 text-blue-500" /> },
  received:   { label: 'Awaiting Collection', variant: 'info',    icon: <Package className="w-4 h-4 text-blue-500" /> },
  arrived:    { label: 'Awaiting Collection', variant: 'info',    icon: <Package className="w-4 h-4 text-blue-500" /> },
  in_transit: { label: 'In Transit',          variant: 'warning', icon: <Clock className="w-4 h-4 text-amber-500" /> },
  collected:  { label: 'Collected',           variant: 'success', icon: <CheckCircle2 className="w-4 h-4 text-green-500" /> },
  returned:   { label: 'Returned',            variant: 'neutral', icon: <RotateCcw className="w-4 h-4 text-neutral-400" /> },
};

export default function ResidentDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [residentId, setResidentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [collectingId, setCollectingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const refresh = useCallback(async () => {
    const res = await getMyDeliveries();
    if (!res.error) {
      setDeliveries(res.deliveries || []);
      if (res.residentId) setResidentId(res.residentId);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const res = await getMyDeliveries();
      if (!mounted) return;
      if (res.error) {
        showToast(res.error, 'error');
        setDeliveries([]);
      } else {
        setDeliveries(res.deliveries || []);
        if (res.residentId) setResidentId(res.residentId);
      }
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, [showToast]);

  // Realtime subscription for incoming deliveries (INSERT) and status updates (UPDATE)
  useResidentDeliveriesRealtime({
    residentId,
    onInsert: (row) => {
      showToast(`New delivery arrived from ${row.courier_name || 'courier'}!`, 'info');
      refresh();
    },
    onUpdate: () => {
      refresh();
    },
  });

  async function markCollected(id: string, provider: string) {
    setCollectingId(id);
    const res = await confirmDeliveryCollection(id);
    setCollectingId(null);

    if (res.error) {
      showToast(res.error, 'error');
      return;
    }

    showToast(`${provider} package marked as collected.`, 'success');
    await refresh();
  }

  const awaitingCollection = deliveries.filter((d) => d.status === 'expected' || d.status === 'received' || d.status === 'arrived').length;
  const inTransitCount = deliveries.filter((d) => d.status === 'in_transit').length;
  const collectedCount = deliveries.filter((d) => d.status === 'collected').length;
  const returnedCount = deliveries.filter((d) => d.status === 'returned').length;

  const summaryCards = [
    { label: 'Awaiting Collection', count: awaitingCollection, icon: <Package className="w-4 h-4 text-blue-500" /> },
    { label: 'In Transit', count: inTransitCount, icon: <Clock className="w-4 h-4 text-amber-500" /> },
    { label: 'Collected', count: collectedCount, icon: <CheckCircle2 className="w-4 h-4 text-green-500" /> },
    { label: 'Returned', count: returnedCount, icon: <RotateCcw className="w-4 h-4 text-neutral-400" /> },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">My Deliveries</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Track packages delivered to Green Valley Residency Gate.</p>
      </div>

      {/* Alert for packages waiting */}
      {awaitingCollection > 0 && (
        <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 rounded-xl px-4 py-3">
          <Package className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
            {awaitingCollection} package{awaitingCollection > 1 ? 's are' : ' is'} waiting at the gate for collection.
          </p>
        </div>
      )}

      {/* Status summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {summaryCards.map((sc) => (
          <div key={sc.label} className="bg-white dark:bg-[#131924] border border-neutral-200 dark:border-[#222b3d] rounded-xl p-4 flex items-center gap-2 transition-colors">
            {sc.icon}
            <div>
              <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{sc.count}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{sc.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Deliveries list */}
      <Card padding="none">
        <div className="px-5 py-4 border-b border-neutral-100 dark:border-[#222b3d]">
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">All Deliveries</h3>
        </div>
        {loading ? (
          <div className="py-12 text-center text-neutral-400 text-sm">Loading deliveries...</div>
        ) : deliveries.length === 0 ? (
          <div className="py-12 text-center text-neutral-400 text-sm">No deliveries recorded yet.</div>
        ) : (
          <ul className="divide-y divide-neutral-50 dark:divide-[#222b3d]">
            {deliveries.map((d) => {
              const sc = statusConfig[d.status] || statusConfig.expected;
              const isAwaiting = d.status === 'expected' || d.status === 'received' || d.status === 'arrived';
              return (
                <li key={d.id} className="px-5 py-4 flex items-center gap-4 flex-wrap sm:flex-nowrap">
                  <div className="w-10 h-10 bg-neutral-50 dark:bg-[#1a2232] border border-neutral-100 dark:border-[#2a3547] rounded-xl flex items-center justify-center shrink-0">
                    {sc.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{d.provider}</span>
                      <Badge variant={sc.variant} size="sm">{sc.label}</Badge>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{d.description}</p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5 font-mono">{d.trackingId}</p>
                    {d.arrivedAt && (
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Arrived {new Date(d.arrivedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                    {d.collectedAt && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                        Collected {new Date(d.collectedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                  {isAwaiting && (
                    <button
                      onClick={() => markCollected(d.id, d.provider)}
                      disabled={collectingId === d.id}
                      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      {collectingId === d.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Mark Collected
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
