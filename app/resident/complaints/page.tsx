'use client';

import { useState, useEffect, useCallback } from 'react';
import { Complaint, ComplaintPriority } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { createComplaint, getMyComplaints, getComplaintById } from '@/app/actions/complaints';
import { useResidentComplaintsRealtime } from '@/lib/realtime/useComplaintsRealtime';
import { Plus, CheckCircle2, Clock, AlertTriangle, ChevronDown, RefreshCw } from 'lucide-react';

const statusConfig: Record<string, { label: string; variant: 'error' | 'warning' | 'success' }> = {
  open:        { label: 'Open',        variant: 'error' },
  in_progress: { label: 'In Progress', variant: 'warning' },
  resolved:    { label: 'Resolved',    variant: 'success' },
  closed:      { label: 'Closed',      variant: 'success' },
};

const priorityConfig: Record<string, { label: string; variant: 'error' | 'warning' | 'neutral' }> = {
  urgent: { label: 'Urgent', variant: 'error' },
  high:   { label: 'High',   variant: 'error' },
  medium: { label: 'Medium', variant: 'warning' },
  low:    { label: 'Low',    variant: 'neutral' },
};

const CATEGORIES = [
  'plumbing', 'electrical', 'lift', 'garbage', 'parking', 'noise', 'security', 'other',
];

type FormState = { title: string; category: string; description: string; priority: ComplaintPriority };
const defaultForm: FormState = { title: '', category: 'plumbing', description: '', priority: 'medium' };

type FilterStatus = 'all' | 'open' | 'in_progress' | 'resolved';

export default function ResidentComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [residentId, setResidentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const { showToast } = useToast();

  // Load complaints on mount
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setErrorMsg(null);
      const res = await getMyComplaints();
      if (!mounted) return;

      if (res.error) {
        setErrorMsg(res.error);
        setComplaints([]);
      } else {
        setComplaints(res.complaints || []);
        if (res.residentId) setResidentId(res.residentId);
      }
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, []);

  // Realtime subscription for status updates from Admin
  const handleRealtimeUpdate = useCallback(async (row: { id: string }) => {
    const res = await getComplaintById(row.id);
    if (res.complaint) {
      setComplaints((prev) =>
        prev.map((c) => (c.id === res.complaint!.id ? res.complaint! : c))
      );
      showToast(`Complaint "${res.complaint.title}" status updated to ${res.complaint.status}`, 'info');
    }
  }, [showToast]);

  useResidentComplaintsRealtime({
    residentId,
    onUpdate: handleRealtimeUpdate,
  });

  const filtered = filter === 'all'
    ? complaints
    : complaints.filter((c) => c.status === filter);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const res = await createComplaint({
      title: form.title,
      category: form.category,
      description: form.description,
      priority: form.priority,
    });

    setSubmitting(false);

    if (res.error) {
      showToast(res.error, 'error');
      return;
    }

    if (res.complaint) {
      setComplaints((prev) => [res.complaint!, ...prev]);
      showToast('Complaint submitted successfully! We\'ll look into it shortly.', 'success');
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setShowForm(false);
        setForm(defaultForm);
      }, 2000);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">My Complaints</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Raise and track issues in your society in realtime.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Raise Complaint
        </button>
      </div>

      {/* Raise Complaint Form */}
      {showForm && (
        <Card padding="md">
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-4">New Complaint</h3>
          {submitted ? (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 py-4">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Complaint submitted! We&apos;ll look into it shortly.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Title *</label>
                  <input
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Brief description of issue"
                    className="px-3 py-2 text-sm border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="px-3 py-2 text-sm border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-neutral-800 dark:text-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 capitalize"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="capitalize">{c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as ComplaintPriority })}
                    className="px-3 py-2 text-sm border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-neutral-800 dark:text-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the issue in detail..."
                  className="px-3 py-2 text-sm border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {submitting ? 'Submitting…' : 'Submit Complaint'}
                </button>
                <button
                  type="button"
                  disabled={submitting}
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

      {/* Error state if database error occurred */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-sm text-red-700 dark:text-red-400">
          <p className="font-semibold">Unable to load complaints</p>
          <p className="text-xs mt-0.5">{errorMsg}</p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'open', 'in_progress', 'resolved'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              filter === s
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white dark:bg-[#131924] border-neutral-200 dark:border-[#222b3d] text-neutral-600 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600'
            }`}
          >
            {s === 'all' ? 'All' : s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
            {' '}
            <span className="opacity-70">
              ({s === 'all' ? complaints.length : complaints.filter((c) => c.status === s).length})
            </span>
          </button>
        ))}
      </div>

      {/* Complaints List */}
      <div className="space-y-3">
        {loading ? (
          <Card padding="md">
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-neutral-400">
              <RefreshCw className="w-5 h-5 animate-spin text-primary-600" />
              <p className="text-sm">Loading complaints...</p>
            </div>
          </Card>
        ) : filtered.length === 0 ? (
          <Card padding="md">
            <p className="text-center text-sm text-neutral-400 py-8">
              {complaints.length === 0
                ? 'No complaints filed yet. Click "Raise Complaint" above if you have an issue.'
                : 'No complaints in this category.'}
            </p>
          </Card>
        ) : (
          filtered.map((c) => {
            const sc = statusConfig[c.status] || { label: c.status, variant: 'neutral' };
            const pc = priorityConfig[c.priority] || { label: c.priority, variant: 'neutral' };
            const isOpen = expanded === c.id;
            return (
              <Card key={c.id} padding="none" hover>
                <button
                  onClick={() => setExpanded(isOpen ? null : c.id)}
                  className="w-full text-left px-5 py-4 flex items-start gap-4"
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {c.status === 'resolved' || c.status === 'closed' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : c.status === 'in_progress' ? (
                      <Clock className="w-5 h-5 text-amber-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{c.title}</span>
                      <Badge variant={sc.variant} size="sm">{sc.label}</Badge>
                      <Badge variant={pc.variant} size="sm">{pc.label} Priority</Badge>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">{c.category} · {c.flat}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Filed {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-neutral-400 shrink-0 mt-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-5 pb-4 border-t border-neutral-50 dark:border-[#222b3d]">
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-3 leading-relaxed">{c.description}</p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-neutral-400">
                      <span>Last updated: {new Date(c.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
