'use client';

import { useState, useEffect } from 'react';
import { Notice, CommunityEvent } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { getSocietyNotices } from '@/app/actions/notices';
import { getSocietyEvents, rsvpEvent, cancelEventRsvp } from '@/app/actions/events';
import { Bell, Calendar, User, ChevronDown, Clock, MapPin, Users } from 'lucide-react';

const noticeCategoryConfig: Record<string, { label: string; variant: 'error' | 'warning' | 'success' | 'info' | 'neutral' }> = {
  urgent:      { label: 'Urgent',      variant: 'error' },
  maintenance: { label: 'Maintenance', variant: 'warning' },
  event:       { label: 'Event',       variant: 'success' },
  general:     { label: 'General',     variant: 'neutral' },
};

const eventCategoryConfig: Record<string, { label: string; variant: 'success' | 'neutral' | 'info' | 'warning' | 'error'; bg: string }> = {
  festival:    { label: 'Festival',    variant: 'success', bg: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300' },
  meeting:     { label: 'Meeting',     variant: 'neutral', bg: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300' },
  sports:      { label: 'Sports',      variant: 'info',    bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' },
  cultural:    { label: 'Cultural',    variant: 'warning', bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' },
  maintenance: { label: 'Maintenance', variant: 'error',   bg: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300' },
};

type FilterCat = 'all' | Notice['category'];

export default function ResidentNoticesPage() {
  // Notices state
  const [notices, setNotices] = useState<Notice[]>([]);
  const [noticesLoading, setNoticesLoading] = useState(true);
  const [filter, setFilter] = useState<FilterCat>('all');
  const [expandedNotice, setExpandedNotice] = useState<string | null>(null);

  // Events state
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState<Record<string, boolean>>({});

  const { showToast } = useToast();

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      const [noticesRes, eventsRes] = await Promise.all([
        getSocietyNotices(),
        getSocietyEvents(),
      ]);

      if (!mounted) return;

      if (noticesRes.error) {
        showToast(noticesRes.error, 'error');
        setNotices([]);
      } else {
        setNotices(noticesRes.notices || []);
        if (noticesRes.notices?.[0]?.id) setExpandedNotice(noticesRes.notices[0].id);
      }
      setNoticesLoading(false);

      if (eventsRes.error) {
        showToast(eventsRes.error, 'error');
        setEvents([]);
      } else {
        setEvents(eventsRes.events || []);
      }
      setEventsLoading(false);
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, [showToast]);

  // RSVP Action handler
  async function handleRsvp(eventId: string, title: string) {
    setRsvpLoading((prev) => ({ ...prev, [eventId]: true }));
    const res = await rsvpEvent(eventId);
    if (res.error) {
      showToast(res.error, 'error');
      setRsvpLoading((prev) => ({ ...prev, [eventId]: false }));
      return;
    }

    // Re-fetch from Supabase to guarantee synchronized attendance count and RSVP state
    const refreshed = await getSocietyEvents();
    if (refreshed.events) {
      setEvents(refreshed.events);
    }
    setRsvpLoading((prev) => ({ ...prev, [eventId]: false }));
    showToast(`RSVP confirmed for "${title}"!`, 'success');
  }

  // Cancel RSVP Action handler
  async function handleCancelRsvp(eventId: string, title: string) {
    setRsvpLoading((prev) => ({ ...prev, [eventId]: true }));
    const res = await cancelEventRsvp(eventId);
    if (res.error) {
      showToast(res.error, 'error');
      setRsvpLoading((prev) => ({ ...prev, [eventId]: false }));
      return;
    }

    // Re-fetch from Supabase to guarantee synchronized attendance count and RSVP state
    const refreshed = await getSocietyEvents();
    if (refreshed.events) {
      setEvents(refreshed.events);
    }
    setRsvpLoading((prev) => ({ ...prev, [eventId]: false }));
    showToast(`RSVP cancelled for "${title}"`, 'info');
  }

  const filteredNotices = filter === 'all' ? notices : notices.filter((n) => n.category === filter);

  return (
    <div className="space-y-8 max-w-4xl">
      {/* ---------------------------------------------------- */}
      {/* SECTION 1: Society Notices                           */}
      {/* ---------------------------------------------------- */}
      <section className="space-y-5">
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Notice Board</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Stay updated with society announcements.</p>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          {(['all', 'urgent', 'maintenance', 'event', 'general'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors capitalize ${
                filter === cat
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white dark:bg-[#1a2232] border-neutral-200 dark:border-[#2a3547] text-neutral-600 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-500'
              }`}
            >
              {cat === 'all' ? 'All Notices' : cat}{' '}
              <span className="opacity-70">
                ({cat === 'all' ? notices.length : notices.filter((n) => n.category === cat).length})
              </span>
            </button>
          ))}
        </div>

        {/* Notices List */}
        <div className="space-y-3">
          {noticesLoading ? (
            <Card padding="md">
              <p className="text-center text-sm text-neutral-400 dark:text-neutral-500 py-8">Loading notices...</p>
            </Card>
          ) : filteredNotices.length === 0 ? (
            <Card padding="md">
              <p className="text-center text-sm text-neutral-400 dark:text-neutral-500 py-8">No notices in this category.</p>
            </Card>
          ) : (
            filteredNotices.map((notice) => {
              const cc = noticeCategoryConfig[notice.category] || noticeCategoryConfig.general;
              const isOpen = expandedNotice === notice.id;
              return (
                <Card key={notice.id} padding="none" hover>
                  <button
                    onClick={() => setExpandedNotice(isOpen ? null : notice.id)}
                    className="w-full text-left px-5 py-4 flex items-start gap-4"
                  >
                    <div className="w-9 h-9 bg-neutral-50 dark:bg-neutral-800 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <Bell className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{notice.title}</span>
                        <Badge variant={cc.variant} size="sm">{cc.label}</Badge>
                        {notice.priority && notice.priority !== 'normal' && (
                          <Badge variant="error" size="sm">
                            {notice.priority.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {notice.publishedBy}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(notice.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-neutral-400 shrink-0 mt-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 border-t border-neutral-50 dark:border-[#222b3d]">
                      <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-3 leading-relaxed whitespace-pre-line">{notice.content}</p>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* SECTION 2: Upcoming Events                           */}
      {/* ---------------------------------------------------- */}
      <section className="space-y-4 pt-4 border-t border-neutral-200 dark:border-[#222b3d]">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Upcoming Events</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Community gatherings, meetings, and celebrations in your society.</p>
        </div>

        <div className="space-y-4">
          {eventsLoading ? (
            <Card padding="md">
              <p className="text-center text-sm text-neutral-400 dark:text-neutral-500 py-8">Loading upcoming events...</p>
            </Card>
          ) : events.length === 0 ? (
            <Card padding="md">
              <p className="text-center text-sm text-neutral-400 dark:text-neutral-500 py-8">No upcoming events scheduled right now.</p>
            </Card>
          ) : (
            events.map((event) => {
              const cc = eventCategoryConfig[event.category] || eventCategoryConfig.festival;
              const isRsvpd = Boolean(event.isUserRsvpd);
              const isLoadingAction = Boolean(rsvpLoading[event.id]);
              const eventDateObj = new Date(`${event.date}T00:00:00`);
              const formattedDate = !isNaN(eventDateObj.getTime())
                ? eventDateObj.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
                : event.date;

              return (
                <Card key={event.id} padding="none" hover>
                  <div className={`px-5 py-4 ${cc.bg} rounded-t-xl border-b border-neutral-100 dark:border-[#222b3d]`}>
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{event.title}</h3>
                          <Badge variant={cc.variant} size="sm">{cc.label}</Badge>
                          {isRsvpd && <Badge variant="success" size="sm">✓ RSVP&apos;d</Badge>}
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-neutral-600 dark:text-neutral-300">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formattedDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {event.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.venue}
                          </span>
                        </div>
                      </div>

                      {/* RSVP / Cancel RSVP Button */}
                      <div className="shrink-0">
                        {isRsvpd ? (
                          <button
                            type="button"
                            onClick={() => handleCancelRsvp(event.id, event.title)}
                            disabled={isLoadingAction}
                            className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 hover:border-red-300 transition-colors disabled:opacity-50"
                          >
                            {isLoadingAction ? 'Cancelling...' : 'Cancel RSVP'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRsvp(event.id, event.title)}
                            disabled={isLoadingAction}
                            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors disabled:opacity-50 shadow-sm"
                          >
                            {isLoadingAction ? 'Saving...' : 'RSVP'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-3.5 space-y-2">
                    {event.description && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
                        {event.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between gap-4 pt-1 flex-wrap text-xs text-neutral-500 dark:text-neutral-400">
                      <span className="flex items-center gap-1.5 font-medium text-neutral-700 dark:text-neutral-300">
                        <Users className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                        Attending: {event.rsvpCount} {event.rsvpCount === 1 ? 'resident' : 'residents'}
                      </span>
                      {event.organiser && (
                        <span>Organised by: {event.organiser}</span>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
