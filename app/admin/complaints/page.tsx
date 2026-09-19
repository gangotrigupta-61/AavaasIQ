'use client';

import { useState, useEffect, useCallback } from 'react';
import { Complaint, ComplaintStatus } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { getAdminComplaints, updateComplaintStatus, getComplaintById } from '@/app/actions/complaints';
import { useAdminComplaintsRealtime } from '@/lib/realtime/useComplaintsRealtime';
import { Search, AlertTriangle, Clock, CheckCircle2, RefreshCw } from 'lucide-react';

const STATUS_OPTIONS = ['all', 'open', 'in_progress', 'resolved', 'closed'] as const;
type StatusFilter = typeof STATUS_OPTIONS[number];

const PRIORITY_OPTIONS = ['all', 'high', 'medium', 'low', 'urgent'] as const;
type PriorityFilter = typeof PRIORITY_OPTIONS[number];

const statusConfig: Record<string, { label: string; variant: 'error' | 'warning' | 'success'; icon: React.ReactNode }> = {
  open:        { label: 'Open',        variant: 'error',   icon: <AlertTriangle className="w-4 h-4 text-red-500" /> },
  in_progress: { label: 'In Progress', variant: 'warning', icon: <Clock className="w-4 h-4 text-amber-500" /> },
  resolved:    { label: 'Resolved',    variant: 'success', icon: <CheckCircle2 className="w-4 h-4 text-green-500" /> },
  closed:      { label: 'Closed',      variant: 'success', icon: <CheckCircle2 className="w-4 h-4 text-green-500" /> },
};

const priorityVariant: Record<string, 'error' | 'warning' | 'neutral'> = {
  urgent: 'error', high: 'error', medium: 'warning', low: 'neutral',
};

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [societyId, setSocietyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setErrorMsg(null);
      const res = await getAdminComplaints();
      if (!mounted) return;

      if (res.error) {
        setErrorMsg(res.error);
        setComplaints([]);
      } else {
        setComplaints(res.complaints || []);
        if (res.societyId) setSocietyId(res.societyId);
      }
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, []);

  // Realtime subscription: targeted authoritative re-fetch on INSERT / UPDATE
  const handleRealtimeInsert = useCallback(async (id: string) => {
    const res = await getComplaintById(id);
    if (res.complaint) {
      setComplaints((prev) => {
        if (prev.some((c) => c.id === res.complaint!.id)) return prev;
        return [res.complaint!, ...prev];
      });
      showToast(`New complaint: ${res.complaint.title}`, 'info');
    }
  }, [showToast]);

  const handleRealtimeUpdate = useCallback(async (row: { id: string }) => {
    const res = await getComplaintById(row.id);
    if (res.complaint) {
      setComplaints((prev) =>
        prev.map((c) => (c.id === res.complaint!.id ? res.complaint! : c))
      );
    }
  }, []);

  useAdminComplaintsRealtime({
    societyId,
    onInsert: handleRealtimeInsert,
    onUpdate: handleRealtimeUpdate,
  });

  async function handleStatusChange(id: string, newStatus: ComplaintStatus) {
    setUpdatingId(id);
    const res = await updateComplaintStatus(id, newStatus);
    setUpdatingId(null);

    if (res.error) {
      showToast(res.error, 'error');
      return;
    }

    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
    showToast(`Complaint status updated to ${newStatus}`, 'success');
  }

  const filtered = complaints.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.residentName.toLowerCase().includes(search.toLowerCase()) ||
      c.flat.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || c.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const counts = {
    open:        complaints.filter((c) => c.status === 'open').length,
    in_progress: complaints.filter((c) => c.status === 'in_progress').length,
    resolved:    complaints.filter((c) => c.status === 'resolved' || c.status === 'closed').length,
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Complaint Management</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Review, prioritise and resolve resident complaints in realtime.</p>
      </div>

      {/* Error state */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-sm text-red-700 dark:text-red-400">
          <p className="font-semibold">Unable to load society complaints</p>
          <p className="text-xs mt-0.5">{errorMsg}</p>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {(['open', 'in_progress', 'resolved'] as const).map((s) => {
          const sc = statusConfig[s];
          return (
            <div key={s} className="bg-white dark:bg-[#131924] rounded-xl border border-neutral-200 dark:border-[#222b3d] p-4 flex items-center gap-3 transition-colors">
              {sc.icon}
              <div>
                <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{counts[s]}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{sc.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <Card padding="md">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by title, resident or flat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-3 py-2 text-sm border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-neutral-800 dark:text-neutral-200 rounded-lg focus:outline-none"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === 'all' ? 'All Status' : s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
            className="px-3 py-2 text-sm border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-neutral-800 dark:text-neutral-200 rounded-lg focus:outline-none"
          >
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p === 'all' ? 'All Priority' : p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Complaints Table */}
      <Card padding="none">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-neutral-400">
            <RefreshCw className="w-5 h-5 animate-spin text-primary-600" />
            <p className="text-sm">Loading complaints...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-[#222b3d] bg-neutral-50 dark:bg-[#171f2e]">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Complaint</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide hidden sm:table-cell">Resident</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Priority</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide hidden md:table-cell">Filed</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 dark:divide-[#222b3d]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-neutral-400 text-sm">
                      {complaints.length === 0
                        ? 'No complaints filed in this society yet.'
                        : 'No complaints found matching filters.'}
                    </td>
                  </tr>
                ) : filtered.map((c) => {
                  const sc = statusConfig[c.status] || { label: c.status, variant: 'neutral' };
                  const isRowUpdating = updatingId === c.id;
                  return (
                    <tr key={c.id} className="hover:bg-neutral-50 dark:hover:bg-[#171f2e]/60 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-medium text-neutral-900 dark:text-neutral-100 leading-tight">{c.title}</p>
                        <p className="text-xs text-neutral-400 mt-0.5 capitalize">{c.category}</p>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <p className="text-neutral-700 dark:text-neutral-300">{c.residentName}</p>
                        <p className="text-xs text-neutral-400">{c.flat}</p>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={priorityVariant[c.priority] || 'neutral'} size="sm">
                          {c.priority.charAt(0).toUpperCase() + c.priority.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={sc.variant} size="sm">{sc.label}</Badge>
                      </td>
                      <td className="px-5 py-4 text-xs text-neutral-400 hidden md:table-cell">
                        {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={c.status}
                            disabled={isRowUpdating}
                            onChange={(e) => handleStatusChange(c.id, e.target.value as ComplaintStatus)}
                            className="text-xs border border-neutral-200 dark:border-[#2a3547] rounded-lg px-2 py-1 bg-white dark:bg-[#1a2232] text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-600/20 cursor-pointer disabled:opacity-50"
                          >
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                          {isRowUpdating && <RefreshCw className="w-3.5 h-3.5 animate-spin text-neutral-400" />}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-5 py-3 border-t border-neutral-100 dark:border-[#222b3d] bg-neutral-50 dark:bg-[#171f2e] rounded-b-xl">
          <p className="text-xs text-neutral-400">Showing {filtered.length} of {complaints.length} complaints</p>
        </div>
      </Card>
    </div>
  );
}
