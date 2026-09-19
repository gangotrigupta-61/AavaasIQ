'use client';

import { useState, useEffect } from 'react';
import { Visitor } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useToast } from '@/components/ui/Toast';
import { getAdminVisitors } from '@/app/actions/visitors';
import { Search, Phone, Clock, Users, Package, Wrench, Car } from 'lucide-react';

const purposeIcon: Record<Visitor['purpose'], React.ReactNode> = {
  guest:    <Users className="w-3.5 h-3.5" />,
  delivery: <Package className="w-3.5 h-3.5" />,
  service:  <Wrench className="w-3.5 h-3.5" />,
  cab:      <Car className="w-3.5 h-3.5" />,
  other:    <Clock className="w-3.5 h-3.5" />,
};

const statusConfig: Record<Visitor['status'], { label: string; variant: 'info' | 'warning' | 'success' | 'neutral' | 'error' }> = {
  expected: { label: 'Expected', variant: 'info' },
  approved: { label: 'Approved', variant: 'warning' },
  inside:   { label: 'Inside',   variant: 'success' },
  exited:   { label: 'Exited',   variant: 'neutral' },
  rejected: { label: 'Rejected', variant: 'error' },
};

type FilterStatus = 'all' | Visitor['status'];

export default function AdminVisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterFlat, setFilterFlat] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const res = await getAdminVisitors();
      if (!mounted) return;

      if (res.error) {
        showToast(res.error, 'error');
        setVisitors([]);
      } else {
        setVisitors(res.visitors || []);
      }
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, [showToast]);

  const flats = Array.from(new Set(visitors.map((v) => v.flatNo))).sort();

  const filtered = visitors.filter((v) => {
    const matchSearch =
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.flatNo.toLowerCase().includes(search.toLowerCase()) ||
      v.residentName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || v.status === filterStatus;
    const matchFlat = !filterFlat || v.flatNo === filterFlat;
    return matchSearch && matchStatus && matchFlat;
  });

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
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Visitor Log — Admin View</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">All visitor entries across society</p>
      </div>

      {/* Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Expected', key: 'expected' as const, bg: 'bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40', text: 'text-blue-700 dark:text-blue-400' },
          { label: 'Approved', key: 'approved' as const, bg: 'bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40', text: 'text-amber-700 dark:text-amber-400' },
          { label: 'Inside',   key: 'inside' as const,   bg: 'bg-green-50 dark:bg-green-950/40 border border-green-100 dark:border-green-900/40', text: 'text-green-700 dark:text-green-400' },
          { label: 'Exited',   key: 'exited' as const,   bg: 'bg-neutral-100 dark:bg-[#131924] border border-neutral-200 dark:border-[#222b3d]', text: 'text-neutral-500 dark:text-neutral-400' },
        ].map(({ label, key, bg, text }) => (
          <button
            key={key}
            onClick={() => setFilterStatus(filterStatus === key ? 'all' : key)}
            className={`${bg} rounded-xl p-4 text-left transition-opacity ${
              filterStatus !== 'all' && filterStatus !== key ? 'opacity-50' : ''
            }`}
          >
            <p className={`text-2xl font-bold ${text}`}>{counts[key]}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search name, flat or resident..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600"
            />
          </div>
          <select
            value={filterFlat}
            onChange={(e) => setFilterFlat(e.target.value)}
            className="px-3 py-2 text-sm border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-neutral-800 dark:text-neutral-200 rounded-lg focus:outline-none"
          >
            <option value="">All Flats</option>
            {flats.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <button
            onClick={() => { setSearch(''); setFilterStatus('all'); setFilterFlat(''); }}
            className="px-3 py-2 text-xs font-medium border border-neutral-200 dark:border-[#2a3547] rounded-lg hover:bg-neutral-50 dark:hover:bg-[#1a2232] text-neutral-600 dark:text-neutral-300 transition-colors"
          >
            Clear All
          </button>
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 dark:border-[#222b3d] bg-neutral-50 dark:bg-[#171f2e]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Visitor</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide hidden sm:table-cell">Purpose</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Flat</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide hidden md:table-cell">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 dark:divide-[#222b3d]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-neutral-400 text-sm">
                    Loading visitors...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-neutral-400 text-sm">
                    No visitors found.
                  </td>
                </tr>
              ) : (
                filtered.map((v) => {
                  const sc = statusConfig[v.status] || statusConfig.expected;
                  return (
                    <tr key={v.id} className="hover:bg-neutral-50 dark:hover:bg-[#171f2e]/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Avatar name={v.name} size="sm" />
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-neutral-100">{v.name}</p>
                            {v.phone && (
                              <p className="text-xs text-neutral-400 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {v.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <span className="inline-flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-300 capitalize">
                          {purposeIcon[v.purpose] || purposeIcon.guest}
                          {v.purpose}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-neutral-700 dark:text-neutral-300 font-medium">{v.flatNo}</p>
                        <p className="text-xs text-neutral-400">{v.residentName}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={sc.variant} size="sm">{sc.label}</Badge>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell text-xs text-neutral-400">
                        {v.arrivedAt
                          ? new Date(v.arrivedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                          : v.expectedAt
                          ? `Exp. ${new Date(v.expectedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
                          : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-neutral-100 dark:border-[#222b3d] bg-neutral-50 dark:bg-[#171f2e] rounded-b-xl">
          <p className="text-xs text-neutral-400">Showing {filtered.length} of {visitors.length} entries</p>
        </div>
      </Card>
    </div>
  );
}
