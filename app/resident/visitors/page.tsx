'use client';

import { useState, useEffect, useCallback } from 'react';
import { Visitor } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { useToast } from '@/components/ui/Toast';
import { getMyVisitors, createVisitor } from '@/app/actions/visitors';
import { useResidentVisitorsRealtime } from '@/lib/realtime/useVisitorsRealtime';
import {
  Plus, Phone, Clock, CheckCircle2, LogOut, Users, Package,
  Wrench, Car, HelpCircle, UserCheck,
} from 'lucide-react';

const purposeIcon: Record<Visitor['purpose'], React.ReactNode> = {
  guest: <Users className="w-4 h-4" />,
  delivery: <Package className="w-4 h-4" />,
  service: <Wrench className="w-4 h-4" />,
  cab: <Car className="w-4 h-4" />,
  other: <HelpCircle className="w-4 h-4" />,
};

const statusConfig: Record<Visitor['status'], { label: string; variant: 'info' | 'warning' | 'success' | 'neutral' | 'error' }> = {
  expected: { label: 'Expected', variant: 'info' },
  approved: { label: 'Approved', variant: 'warning' },
  inside:   { label: 'Inside',   variant: 'success' },
  exited:   { label: 'Exited',   variant: 'neutral' },
  rejected: { label: 'Rejected', variant: 'error' },
};

type FormState = { name: string; purpose: string; phone: string; date: string; time: string };
const defaultForm: FormState = { name: '', purpose: 'guest', phone: '', date: '', time: '' };

export default function ResidentVisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [residentId, setResidentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const res = await getMyVisitors();
      if (!mounted) return;

      if (res.error) {
        showToast(res.error, 'error');
        setVisitors([]);
      } else {
        setVisitors(res.visitors || []);
        if (res.residentId) setResidentId(res.residentId);
      }
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, [showToast]);

  const handleRealtimeUpdate = useCallback((updatedRow: { id: string; visitor_name: string; status: Visitor['status']; arrived_at: string | null; exited_at: string | null }) => {
    setVisitors((prev) =>
      prev.map((v) =>
        v.id === updatedRow.id
          ? {
              ...v,
              status: updatedRow.status,
              arrivedAt: updatedRow.arrived_at ?? v.arrivedAt,
              exitedAt: updatedRow.exited_at ?? v.exitedAt,
            }
          : v
      )
    );
    showToast(`Visitor "${updatedRow.visitor_name}" status updated to ${updatedRow.status}`, 'info');
  }, [showToast]);

  useResidentVisitorsRealtime({
    residentId,
    onUpdate: handleRealtimeUpdate,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const res = await createVisitor({
      name: form.name,
      purpose: form.purpose,
      phone: form.phone,
      date: form.date,
      time: form.time,
    });

    setSubmitting(false);

    if (res.error) {
      showToast(res.error, 'error');
      return;
    }

    if (res.visitor) {
      setVisitors((prev) => [res.visitor!, ...prev]);
      setSubmitted(true);
      showToast('Visitor pass created!', 'success');
      setTimeout(() => {
        setSubmitted(false);
        setShowForm(false);
        setForm(defaultForm);
      }, 1500);
    }
  }

  const expectedCount = visitors.filter((v) => v.status === 'expected').length;
  const approvedCount = visitors.filter((v) => v.status === 'approved').length;
  const insideCount   = visitors.filter((v) => v.status === 'inside').length;
  const exitedCount   = visitors.filter((v) => v.status === 'exited').length;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Visitor Management</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Track and approve visitors to your flat.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Visitor
        </button>
      </div>

      {/* Add Visitor Form */}
      {showForm && (
        <Card padding="md">
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-4">Pre-register a Visitor</h3>
          {submitted ? (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 py-4">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Visitor pass created! Security has been notified.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Visitor Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Ravi Kumar"
                  className="px-3 py-2 text-sm border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Purpose *</label>
                <select
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  className="px-3 py-2 text-sm border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-neutral-800 dark:text-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600"
                >
                  <option value="guest">Guest / Family</option>
                  <option value="delivery">Delivery</option>
                  <option value="service">Service Professional</option>
                  <option value="cab">Cab / Driver</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="px-3 py-2 text-sm border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Expected Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="px-3 py-2 text-sm border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-neutral-900 dark:text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Expected Time</label>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="px-3 py-2 text-sm border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-neutral-900 dark:text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600"
                />
              </div>

              <div className="sm:col-span-2 flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors disabled:opacity-60"
                >
                  {submitting ? 'Creating Pass…' : 'Create Visitor Pass'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setForm(defaultForm); }}
                  className="text-sm text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 font-medium px-4 py-2 rounded-lg border border-neutral-200 dark:border-[#2a3547] hover:bg-neutral-50 dark:hover:bg-[#1a2232] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </Card>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Expected', count: expectedCount, icon: <Clock className="w-4 h-4 text-blue-500 dark:text-blue-400" />, bg: 'bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40' },
          { label: 'Approved', count: approvedCount, icon: <CheckCircle2 className="w-4 h-4 text-amber-500 dark:text-amber-400" />, bg: 'bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40' },
          { label: 'Inside',   count: insideCount,   icon: <UserCheck className="w-4 h-4 text-green-600 dark:text-green-400" />, bg: 'bg-green-50 dark:bg-green-950/40 border border-green-100 dark:border-green-900/40' },
          { label: 'Exited',   count: exitedCount,   icon: <LogOut className="w-4 h-4 text-neutral-400" />,  bg: 'bg-neutral-100 dark:bg-[#131924] border border-neutral-200 dark:border-[#222b3d]' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 flex items-center gap-3`}>
            {s.icon}
            <div>
              <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{s.count}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Visitor List */}
      <Card padding="none">
        <div className="px-5 py-4 border-b border-neutral-100 dark:border-[#222b3d]">
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">My Visitors</h3>
        </div>

        {loading ? (
          <div className="py-12 text-center text-neutral-400 text-sm">Loading visitors...</div>
        ) : visitors.length === 0 ? (
          <div className="py-12 text-center text-neutral-400 text-sm">No visitors recorded yet.</div>
        ) : (
          <ul className="divide-y divide-neutral-50 dark:divide-[#222b3d]">
            {visitors.map((v) => {
              const sc = statusConfig[v.status] || statusConfig.expected;
              return (
                <li key={v.id} className="flex items-center gap-4 px-5 py-4">
                  <Avatar name={v.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{v.name}</span>
                      <Badge variant={sc.variant} size="sm">{sc.label}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 capitalize">
                        {purposeIcon[v.purpose] || purposeIcon.guest}
                        {v.purpose}
                      </span>
                      {v.phone && (
                        <span className="inline-flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                          <Phone className="w-3 h-3" />
                          {v.phone}
                        </span>
                      )}
                      {v.expectedAt && (
                        <span className="inline-flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                          <Clock className="w-3 h-3" />
                          {new Date(v.expectedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                      {v.arrivedAt && !v.exitedAt && (
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          Arrived {new Date(v.arrivedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                      {v.exitedAt && (
                        <span className="text-xs text-neutral-400">
                          Exited {new Date(v.exitedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
