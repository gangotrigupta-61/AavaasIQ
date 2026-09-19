'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { getSecurityDeliveries, createDelivery, updateDeliveryStatus } from '@/app/actions/deliveries';
import { Delivery } from '@/lib/types';
import { Package, CheckCircle2, Clock, Plus } from 'lucide-react';

const statusConfig: Record<string, { label: string; variant: 'info' | 'success' | 'neutral' | 'warning' }> = {
  expected:   { label: 'Awaiting Collection', variant: 'info' },
  received:   { label: 'Awaiting Collection', variant: 'info' },
  arrived:    { label: 'Awaiting Collection', variant: 'info' },
  in_transit: { label: 'In Transit',          variant: 'warning' },
  collected:  { label: 'Collected',           variant: 'success' },
  returned:   { label: 'Returned',            variant: 'neutral' },
};

type FormState = { provider: string; block: string; flatNo: string; residentName: string; description: string };
const defaultForm: FormState = { provider: '', block: '', flatNo: '', residentName: '', description: '' };

export default function SecurityDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const res = await getSecurityDeliveries();
      if (!mounted) return;
      if (res.error) {
        showToast(res.error, 'error');
        setDeliveries([]);
      } else {
        setDeliveries(res.deliveries || []);
      }
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, [showToast]);

  async function refresh() {
    const res = await getSecurityDeliveries();
    if (!res.error) {
      setDeliveries(res.deliveries || []);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const res = await createDelivery({
      provider: form.provider,
      block: form.block,
      flatNo: form.flatNo,
      residentName: form.residentName,
      description: form.description,
    });

    setSubmitting(false);

    if (res.error) {
      showToast(res.error, 'error');
      return;
    }

    showToast('Delivery logged successfully!', 'success');
    setShowForm(false);
    setForm(defaultForm);
    await refresh();
  }

  async function markCollected(id: string) {
    const res = await updateDeliveryStatus(id, 'collected');
    if (res.error) {
      showToast(res.error, 'error');
      return;
    }

    showToast('Delivery marked as collected', 'success');
    await refresh();
  }

  const awaitingPickup = deliveries.filter((d) => d.status === 'expected' || d.status === 'received' || d.status === 'arrived').length;
  const collectedCount = deliveries.filter((d) => d.status === 'collected').length;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Delivery Management</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Log and track package deliveries at the gate.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Log Delivery
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-transparent dark:border-blue-900/30 rounded-xl p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-blue-500" />
          <div>
            <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{awaitingPickup}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Awaiting Pickup</p>
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-950/30 border border-transparent dark:border-green-900/30 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{collectedCount}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Collected</p>
          </div>
        </div>
        <div className="bg-neutral-100 dark:bg-[#131924] border border-transparent dark:border-[#222b3d] rounded-xl p-4 flex items-center gap-3">
          <Package className="w-5 h-5 text-neutral-400" />
          <div>
            <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{deliveries.length}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Total Today</p>
          </div>
        </div>
      </div>

      {/* Log Delivery Form */}
      {showForm && (
        <Card padding="md">
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-4">Log New Delivery</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Delivery Provider *</label>
              <input
                required
                value={form.provider}
                onChange={(e) => setForm({ ...form, provider: e.target.value })}
                placeholder="e.g. Amazon, Flipkart, Zomato, Swiggy"
                className="px-3 py-2 text-sm border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Block</label>
              <input
                value={form.block}
                onChange={(e) => setForm({ ...form, block: e.target.value })}
                placeholder="e.g. A"
                className="px-3 py-2 text-sm border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Flat Number *</label>
              <input
                required
                value={form.flatNo}
                onChange={(e) => setForm({ ...form, flatNo: e.target.value })}
                placeholder="e.g. 204 or A-204"
                className="px-3 py-2 text-sm border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Resident Name</label>
              <input
                value={form.residentName}
                onChange={(e) => setForm({ ...form, residentName: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                className="px-3 py-2 text-sm border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Description</label>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="e.g. 2 large boxes"
                className="px-3 py-2 text-sm border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600"
              />
            </div>
            <div className="sm:col-span-2 flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors disabled:opacity-60"
              >
                {submitting ? 'Logging Delivery…' : 'Log Delivery'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm(defaultForm); }}
                className="text-sm text-neutral-600 dark:text-neutral-300 font-medium px-4 py-2 rounded-lg border border-neutral-200 dark:border-[#2a3547] hover:bg-neutral-50 dark:hover:bg-[#1a2232] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Deliveries List */}
      <Card padding="none">
        <div className="px-5 py-3.5 border-b border-neutral-100 dark:border-[#222b3d]">
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Today&apos;s Deliveries</h3>
        </div>
        {loading ? (
          <div className="py-12 text-center text-neutral-400 dark:text-neutral-500 text-sm">Loading deliveries...</div>
        ) : deliveries.length === 0 ? (
          <div className="py-12 text-center text-neutral-400 dark:text-neutral-500 text-sm">No deliveries logged today.</div>
        ) : (
          <ul className="divide-y divide-neutral-50 dark:divide-[#222b3d]">
            {deliveries.map((d) => {
              const sc = statusConfig[d.status] || statusConfig.expected;
              const isAwaiting = d.status === 'expected' || d.status === 'received' || d.status === 'arrived';
              return (
                <li key={d.id} className="px-5 py-4 flex items-center gap-4 flex-wrap sm:flex-nowrap">
                  <div className="w-10 h-10 bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-xl flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{d.provider}</span>
                      <Badge variant={sc.variant} size="sm">{sc.label}</Badge>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {d.flatNo} · {d.residentName} · {d.description}
                    </p>
                    {d.arrivedAt && (
                      <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                        {new Date(d.arrivedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                  {isAwaiting && (
                    <button
                      onClick={() => markCollected(d.id)}
                      className="shrink-0 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
                    >
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
