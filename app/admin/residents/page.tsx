'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Search, Phone, Building2, Loader2 } from 'lucide-react';
import { getAdminResidents } from '@/app/actions/analytics';
import { Resident } from '@/lib/types';

export default function AdminResidentsPage() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterBlock, setFilterBlock] = useState('All');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      setLoading(true);
      const res = await getAdminResidents();
      if (res.data) {
        setResidents(res.data);
      }
      setLoading(false);
    });
  }, []);

  const blocks = ['All', ...Array.from(new Set(residents.map((r) => r.block))).sort()];

  const filtered = residents.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.flat.toLowerCase().includes(search.toLowerCase()) ||
      r.mobile.includes(search);
    const matchesBlock = filterBlock === 'All' || r.block === filterBlock;
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchesSearch && matchesBlock && matchesStatus;
  });

  const activeCount = residents.filter((r) => r.status === 'active').length;
  const inactiveCount = residents.filter((r) => r.status === 'inactive').length;
  const societyName = residents[0]?.societyName ?? 'Green Valley Residency';

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Residents Directory</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {activeCount} active · {inactiveCount} inactive · {societyName}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card padding="md">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by name, flat or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600"
            />
          </div>

          {/* Block filter */}
          <select
            value={filterBlock}
            onChange={(e) => setFilterBlock(e.target.value)}
            className="px-3 py-2 text-sm border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-neutral-800 dark:text-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600"
          >
            {blocks.map((b) => <option key={b}>{b === 'All' ? 'All Blocks' : `Block ${b}`}</option>)}
          </select>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="px-3 py-2 text-sm border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-neutral-800 dark:text-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </Card>

      {/* Residents Table */}
      <Card padding="none">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-neutral-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
            <p className="text-sm">Loading resident memberships...</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 dark:border-[#222b3d] bg-neutral-50 dark:bg-[#171f2e]">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Resident</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Flat</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Contact</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Registered</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50 dark:divide-[#222b3d]">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-12 text-neutral-400 text-sm">No registered residents found matching criteria.</td></tr>
                  ) : filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-neutral-50 dark:hover:bg-[#171f2e]/60 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={r.name} size="sm" />
                          <span className="font-medium text-neutral-900 dark:text-neutral-100">{r.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 text-neutral-700 dark:text-neutral-300 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                          {r.flat}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-neutral-600 dark:text-neutral-300 flex items-center gap-1"><Phone className="w-3 h-3" /> {r.mobile}</p>
                      </td>
                      <td className="px-5 py-4 text-neutral-500 dark:text-neutral-400 text-xs">
                        {new Date(r.joinedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={r.status === 'active' ? 'success' : 'neutral'} size="sm">
                          {r.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-neutral-50 dark:divide-[#222b3d]">
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-neutral-400 text-sm">No residents found.</div>
              ) : filtered.map((r) => (
                <div key={r.id} className="px-4 py-4 flex items-start gap-3">
                  <Avatar name={r.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{r.name}</span>
                      <Badge variant={r.status === 'active' ? 'success' : 'neutral'} size="sm">
                        {r.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">{r.flat}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{r.mobile}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-neutral-100 dark:border-[#222b3d] bg-neutral-50 dark:bg-[#171f2e] rounded-b-xl">
              <p className="text-xs text-neutral-400">
                Showing {filtered.length} of {residents.length} residents
              </p>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
