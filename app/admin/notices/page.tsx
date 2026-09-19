'use client';

import { useState, useEffect } from 'react';
import { Notice } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { getSocietyNotices, createNotice } from '@/app/actions/notices';
import { Plus, Bell, Calendar, CheckCircle2 } from 'lucide-react';

const categoryConfig: Record<string, { label: string; variant: 'error' | 'warning' | 'success' | 'neutral' | 'info' }> = {
  urgent:      { label: 'Urgent',      variant: 'error' },
  maintenance: { label: 'Maintenance', variant: 'warning' },
  event:       { label: 'Event',       variant: 'success' },
  general:     { label: 'General',     variant: 'neutral' },
};

type FormState = {
  title: string;
  category: string;
  content: string;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
};
const defaultForm: FormState = {
  title: '',
  category: 'general',
  content: '',
  eventDate: '',
  eventTime: '',
  eventVenue: '',
};

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
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
      const res = await getSocietyNotices();
      if (!mounted) return;

      if (res.error) {
        showToast(res.error, 'error');
        setNotices([]);
      } else {
        setNotices(res.notices || []);
      }
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, [showToast]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const res = await createNotice({
      title: form.title,
      category: form.category,
      content: form.content,
      eventDate: form.category === 'event' ? (form.eventDate || undefined) : undefined,
      eventTime: form.category === 'event' ? (form.eventTime || undefined) : undefined,
      eventVenue: form.category === 'event' ? (form.eventVenue || undefined) : undefined,
    });

    setSubmitting(false);

    if (res.error) {
      showToast(res.error, 'error');
      return;
    }

    if (res.notice) {
      setNotices((prev) => [res.notice!, ...prev]);
      setSubmitted(true);
      showToast(form.category === 'event' ? 'Event & Notice published successfully!' : 'Notice published successfully!', 'success');
      setTimeout(() => {
        setSubmitted(false);
        setShowForm(false);
        setForm(defaultForm);
      }, 1500);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Notice Board</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Publish announcements to all residents.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Notice
        </button>
      </div>

      {/* Create Notice Form */}
      {showForm && (
        <Card padding="md">
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-4">Create Notice</h3>
          {submitted ? (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 py-4">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Notice published to all residents!</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Notice Title *</label>
                  <input
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Water supply interruption on Friday"
                    className="px-3 py-2 text-sm border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="px-3 py-2 text-sm border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-neutral-800 dark:text-neutral-200 rounded-lg focus:outline-none"
                  >
                    <option value="general">General</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="event">Event</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Event Details (Visible only when Category is Event) */}
              {form.category === 'event' && (
                <div className="p-3 bg-neutral-50 dark:bg-[#171f2e] rounded-lg border border-neutral-200 dark:border-[#222b3d] space-y-3">
                  <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Event Details (for Upcoming Events & RSVP)</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Event Date *</label>
                      <input
                        type="date"
                        required={form.category === 'event'}
                        value={form.eventDate}
                        onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                        className="px-3 py-1.5 text-sm border border-neutral-200 dark:border-[#2a3547] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 bg-white dark:bg-[#1a2232] text-neutral-900 dark:text-neutral-100"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Event Time</label>
                      <input
                        type="text"
                        value={form.eventTime}
                        onChange={(e) => setForm({ ...form, eventTime: e.target.value })}
                        placeholder="e.g. 7:00 PM - 10:00 PM"
                        className="px-3 py-1.5 text-sm border border-neutral-200 dark:border-[#2a3547] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 bg-white dark:bg-[#1a2232] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Event Venue</label>
                      <input
                        type="text"
                        value={form.eventVenue}
                        onChange={(e) => setForm({ ...form, eventVenue: e.target.value })}
                        placeholder="e.g. Clubhouse Hall"
                        className="px-3 py-1.5 text-sm border border-neutral-200 dark:border-[#2a3547] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 bg-white dark:bg-[#1a2232] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Content *</label>
                <textarea
                  required
                  rows={4}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Write the full notice here..."
                  className="px-3 py-2 text-sm border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 resize-none"
                />
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 rounded-lg px-3 py-2.5 text-xs text-amber-700 dark:text-amber-400">
                This notice will be published to all registered residents in this society.
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors disabled:opacity-60"
                >
                  {submitting ? 'Publishing…' : 'Publish Notice'}
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
          )}
        </Card>
      )}

      {/* Published Notices */}
      <div>
        <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">Published Notices ({notices.length})</p>
        <div className="space-y-3">
          {loading ? (
            <Card padding="md">
              <p className="text-center text-sm text-neutral-400 py-8">Loading notices...</p>
            </Card>
          ) : notices.length === 0 ? (
            <Card padding="md">
              <p className="text-center text-sm text-neutral-400 py-8">No notices published yet.</p>
            </Card>
          ) : (
            notices.map((notice) => {
              const cc = categoryConfig[notice.category] || categoryConfig.general;
              return (
                <Card key={notice.id} padding="md" hover>
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 bg-neutral-50 dark:bg-[#1a2232] border border-neutral-100 dark:border-[#2a3547] rounded-lg flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{notice.title}</span>
                        <Badge variant={cc.variant} size="sm">{cc.label}</Badge>
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed line-clamp-2 whitespace-pre-line">{notice.content}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(notice.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span>By {notice.publishedBy}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
