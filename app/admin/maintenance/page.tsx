'use client';

import { useState, useEffect } from 'react';
import { MaintenanceRecord, MaintenanceStatus } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getAdminMaintenance } from '@/app/actions/maintenance';
import { IndianRupee, Search, TrendingUp, CheckCircle2, Clock, AlertTriangle, RefreshCw } from 'lucide-react';

const statusConfig: Record<MaintenanceStatus, { label: string; variant: 'success' | 'warning' | 'error'; icon: React.ReactNode }> = {
  paid:    { label: 'Paid',    variant: 'success', icon: <CheckCircle2 className="w-4 h-4 text-green-500" /> },
  pending: { label: 'Pending', variant: 'warning', icon: <Clock className="w-4 h-4 text-amber-500" /> },
  overdue: { label: 'Overdue', variant: 'error',   icon: <AlertTriangle className="w-4 h-4 text-red-500" /> },
};

export default function AdminMaintenancePage() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | MaintenanceStatus>('all');

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setErrorMsg(null);
      const res = await getAdminMaintenance();
      if (!mounted) return;

      if (res.error) {
        setErrorMsg(res.error);
        setRecords([]);
      } else {
        setRecords(res.records || []);
      }
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, []);

  const filtered = records.filter((r) => {
    const matchesSearch =
      (r.residentName || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.flat || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.block || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const total = records.length;
  const paid = records.filter((r) => r.status === 'paid').length;
  const pending = records.filter((r) => r.status === 'pending').length;
  const overdue = records.filter((r) => r.status === 'overdue').length;

  const collected = records
    .filter((f) => f.status === 'paid')
    .reduce((sum, r) => sum + r.amount, 0);

  const target = records.reduce((sum, r) => sum + r.amount, 0);
  const pct = total > 0 && target > 0 ? Math.round((collected / target) * 100) : 0;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Maintenance Collection</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Society Maintenance Charges & Status</p>
      </div>

      {/* Error State */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-sm text-red-700 dark:text-red-400">
          <p className="font-semibold">Unable to load society maintenance records</p>
          <p className="text-xs mt-0.5">{errorMsg}</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#131924] rounded-xl border border-neutral-200 dark:border-[#222b3d] p-4 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Collection</span>
          </div>
          <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            ₹{(collected / 100000).toFixed(1)}L / ₹{(target / 100000).toFixed(1)}L
          </p>
          <div className="mt-2 h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div className="h-full bg-primary-600 rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{pct}% collected</p>
        </div>
        <div className="bg-green-50 dark:bg-green-950/40 rounded-xl border border-green-100 dark:border-green-900/40 p-4">
          <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mb-2" />
          <p className="text-xl font-bold text-green-700 dark:text-green-400">{paid}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Paid</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-100 dark:border-amber-900/40 p-4">
          <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 mb-2" />
          <p className="text-xl font-bold text-amber-700 dark:text-amber-400">{pending}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Pending</p>
        </div>
        <div className="bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-100 dark:border-red-900/40 p-4">
          <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 mb-2" />
          <p className="text-xl font-bold text-red-700 dark:text-red-400">{overdue}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Overdue</p>
        </div>
      </div>

      {/* Filters */}
      <Card padding="md">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by name or flat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="px-3 py-2 text-sm border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-neutral-800 dark:text-neutral-200 rounded-lg focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-neutral-400">
            <RefreshCw className="w-5 h-5 animate-spin text-primary-600" />
            <p className="text-sm">Loading maintenance records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-[#222b3d] bg-neutral-50 dark:bg-[#171f2e]">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Flat</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide hidden sm:table-cell">Resident</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Amount</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide hidden md:table-cell">Paid On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 dark:divide-[#222b3d]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-neutral-400 text-sm">
                      {records.length === 0
                        ? 'No maintenance records found for this society.'
                        : 'No records matching filters.'}
                    </td>
                  </tr>
                ) : filtered.map((f, i) => {
                  const sc = statusConfig[f.status] || statusConfig.pending;
                  return (
                    <tr key={f.id || `${f.flat}-${i}`} className="hover:bg-neutral-50 dark:hover:bg-[#171f2e]/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100">{f.flat}</p>
                        {f.block && <p className="text-xs text-neutral-400">Block {f.block}</p>}
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell text-neutral-700 dark:text-neutral-300">
                        {f.residentName}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 font-semibold text-neutral-900 dark:text-neutral-100">
                          <IndianRupee className="w-3.5 h-3.5 text-neutral-400" />
                          {f.amount.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={sc.variant} size="sm">{sc.label}</Badge>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell text-xs text-neutral-400">
                        {f.paidAt
                          ? new Date(f.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-5 py-3 border-t border-neutral-100 dark:border-[#222b3d] bg-neutral-50 dark:bg-[#171f2e] rounded-b-xl">
          <p className="text-xs text-neutral-400">Showing {filtered.length} of {records.length} records</p>
        </div>
      </Card>
    </div>
  );
}
