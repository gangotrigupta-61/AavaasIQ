'use client';

import { useState, useEffect, useCallback } from 'react';
import { Visitor } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { useToast } from '@/components/ui/Toast';
import { getSecurityVisitors, updateVisitorStatus } from '@/app/actions/visitors';
import { useSecurityVisitorsRealtime } from '@/lib/realtime/useVisitorsRealtime';
import {
  Search, Phone, Clock, CheckCircle2, LogOut, Package,
  Wrench, Car, Users, UserCheck, Filter,
} from 'lucide-react';

const purposeIcon: Record<Visitor['purpose'], React.ReactNode> = {
  guest:    <Users className="w-3.5 h-3.5" />,
  delivery: <Package className="w-3.5 h-3.5" />,
  service:  <Wrench className="w-3.5 h-3.5" />,
  cab:      <Car className="w-3.5 h-3.5" />,
  other:    <UserCheck className="w-3.5 h-3.5" />,
};

const statusConfig: Record<Visitor['status'], { label: string; variant: 'info' | 'warning' | 'success' | 'neutral' | 'error'; next?: Visitor['status']; nextLabel?: string }> = {
  expected: { label: 'Expected', variant: 'info',    next: 'approved', nextLabel: 'Approve Entry' },
  approved: { label: 'Approved', variant: 'warning', next: 'inside',   nextLabel: 'Mark Inside' },
  inside:   { label: 'Inside',   variant: 'success', next: 'exited',   nextLabel: 'Mark Exited' },
  exited:   { label: 'Exited',   variant: 'neutral' },
  rejected: { label: 'Rejected', variant: 'error' },
};

type FilterStatus = 'all' | Visitor['status'];

export default function SecurityVisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [societyId, setSocietyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const { showToast } = useToast();

  const refreshVisitors = useCallback(async () => {
    const res = await getSecurityVisitors();
    if (!res.error) {
      setVisitors(res.visitors || []);
      if (res.societyId) setSocietyId(res.societyId);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const res = await getSecurityVisitors();
      if (!mounted) return;
      if (res.error) {
        showToast(res.error, 'error');
        setVisitors([]);
      } else {
        setVisitors(res.visitors || []);
        if (res.societyId) setSocietyId(res.societyId);
      }
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, [showToast]);

  // Realtime subscription for resident visitor pre-registrations (INSERT)
  useSecurityVisitorsRealtime({
    societyId,
    onInsert: (row) => {
      showToast(`New visitor registered: ${row.visitor_name}`, 'info');
      refreshVisitors();
    },
  });

  async function advance(id: string, next: Visitor['status']) {
    const res = await updateVisitorStatus(id, next);
    if (res.error) {
      showToast(res.error, 'error');
      return;
    }

    setVisitors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: next } : v))
    );
    showToast(`Visitor status updated to ${next}`, 'success');
  }

  const filtered = visitors.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.flatNo.toLowerCase().includes(search.toLowerCase()) ||
      v.residentName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || v.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Counts
  const counts: Record<Visitor['status'], number> = {
    expected: 0,
    approved: 0,
    inside: 0,
    exited: 0,
    rejected: 0,
  };
  visitors.forEach((v) => {
    if (counts[v.status] !== undefined) counts[v.status]++;
  });

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-900">Visitor Log</h2>
        <p className="text-sm text-neutral-500 mt-0.5">Today&apos;s entries � Gate 1 � Green Valley Residency</p>
      </div>

      {/* Stat Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Expected', status: 'expected' as const, icon: <Clock className="w-4 h-4 text-blue-500" />, bg: 'bg-blue-50' },
          { label: 'Approved', status: 'approved' as const, icon: <CheckCircle2 className="w-4 h-4 text-amber-500" />, bg: 'bg-amber-50' },
          { label: 'Inside',   status: 'inside' as const,   icon: <UserCheck className="w-4 h-4 text-green-600" />, bg: 'bg-green-50' },
          { label: 'Exited',   status: 'exited' as const,   icon: <LogOut className="w-4 h-4 text-neutral-400" />,  bg: 'bg-neutral-100' },
        ].map((s) => (
          <button
            key={s.label}
            onClick={() => setFilterStatus(filterStatus === s.status ? 'all' : s.status)}
            className={`${s.bg} rounded-xl p-4 flex items-center gap-3 text-left transition-opacity ${
              filterStatus !== 'all' && filterStatus !== s.status ? 'opacity-50' : ''
            }`}
          >
            {s.icon}
            <div>
              <p className="text-xl font-bold text-neutral-900">{counts[s.status]}</p>
              <p className="text-xs text-neutral-500">{s.label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <Card padding="sm">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search visitor, flat or resident..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600"
            />
          </div>
          <button
            onClick={() => setFilterStatus('all')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-neutral-200 rounded-lg hover:bg-neutral-50 text-neutral-600 transition-colors"
          >
            <Filter className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </Card>

      {/* Visitor List */}
      <Card padding="none">
        <div className="px-5 py-3.5 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-800">All Entries ({filtered.length})</h3>
        </div>

        {loading ? (
          <div className="py-12 text-center text-neutral-400 text-sm">Loading visitor log...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-neutral-400 text-sm">No visitors match your filter.</div>
        ) : (
          <ul className="divide-y divide-neutral-50">
            {filtered.map((v) => {
              const sc = statusConfig[v.status] || statusConfig.expected;
              return (
                <li key={v.id} className="px-5 py-4 flex items-center gap-4 flex-wrap sm:flex-nowrap">
                  <Avatar name={v.name} size="md" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-sm font-semibold text-neutral-900">{v.name}</span>
                      <Badge variant={sc.variant} size="sm">{sc.label}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-neutral-500">
                      <span className="flex items-center gap-1 capitalize">
                        {purposeIcon[v.purpose] || purposeIcon.guest}
                        {v.purpose}
                      </span>
                      <span>? {v.flatNo} ({v.residentName})</span>
                      {v.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {v.phone}
                        </span>
                      )}
                      {v.expectedAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Expected {new Date(v.expectedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                      {v.arrivedAt && (
                        <span>Arrived {new Date(v.arrivedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                      )}
                      {v.exitedAt && (
                        <span className="text-neutral-400">
                          Exited {new Date(v.exitedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action button */}
                  {sc.next && sc.nextLabel && (
                    <button
                      onClick={() => advance(v.id, sc.next!)}
                      className="shrink-0 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
                    >
                      {sc.nextLabel}
                    </button>
                  )}
                  {v.status === 'exited' && (
                    <span className="shrink-0 text-xs text-neutral-400 italic">Done</span>
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
