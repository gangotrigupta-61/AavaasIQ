'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { getSocietyEvents, rsvpEvent, cancelEventRsvp } from '@/app/actions/events';
import { CommunityEvent } from '@/lib/types';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

const categoryConfig = {
  festival:    { label: 'Festival',    variant: 'success' as const, bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200' },
  meeting:     { label: 'Meeting',     variant: 'neutral' as const, bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200' },
  sports:      { label: 'Sports',      variant: 'info' as const,    bg: 'bg-green-50 dark:bg-green-950/40 text-green-900 dark:text-green-200' },
  cultural:    { label: 'Cultural',    variant: 'warning' as const, bg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200' },
  maintenance: { label: 'Maintenance', variant: 'error' as const,   bg: 'bg-neutral-50 dark:bg-neutral-850/60 text-neutral-900 dark:text-neutral-200' },
};

export default function ResidentEventsPage() {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState<Record<string, boolean>>({});
  const { showToast } = useToast();

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      const res = await getSocietyEvents();
      if (!mounted) return;

      if (res.error) {
        showToast(res.error, 'error');
        setEvents([]);
      } else {
        setEvents(res.events || []);
      }
      setLoading(false);
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, [showToast]);

  async function handleRsvp(id: string, title: string) {
    setRsvpLoading((prev) => ({ ...prev, [id]: true }));
    const res = await rsvpEvent(id);
    if (res.error) {
      showToast(res.error, 'error');
      setRsvpLoading((prev) => ({ ...prev, [id]: false }));
      return;
    }

    const refreshed = await getSocietyEvents();
    if (refreshed.events) {
      setEvents(refreshed.events);
    }
    setRsvpLoading((prev) => ({ ...prev, [id]: false }));
    showToast(`RSVP confirmed for "${title}"!`, 'success');
  }

  async function handleCancelRsvp(id: string, title: string) {
    setRsvpLoading((prev) => ({ ...prev, [id]: true }));
    const res = await cancelEventRsvp(id);
    if (res.error) {
      showToast(res.error, 'error');
      setRsvpLoading((prev) => ({ ...prev, [id]: false }));
      return;
    }

    const refreshed = await getSocietyEvents();
    if (refreshed.events) {
      setEvents(refreshed.events);
    }
    setRsvpLoading((prev) => ({ ...prev, [id]: false }));
    showToast(`RSVP cancelled for "${title}"`, 'info');
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Community Events</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Stay connected with what&apos;s happening in society.</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <Card padding="md">
            <p className="text-center text-sm text-neutral-400 dark:text-neutral-500 py-8">Loading community events...</p>
          </Card>
        ) : events.length === 0 ? (
          <Card padding="md">
            <p className="text-center text-sm text-neutral-400 dark:text-neutral-500 py-8">No community events scheduled right now.</p>
          </Card>
        ) : (
          events.map((event) => {
            const cc = categoryConfig[event.category] || categoryConfig.festival;
            const isRsvpd = Boolean(event.isUserRsvpd);
            const isFull = event.maxCapacity !== undefined && event.rsvpCount >= event.maxCapacity;
            const eventDate = new Date(`${event.date}T00:00:00`);
            const isUpcoming = isNaN(eventDate.getTime()) || eventDate >= new Date();
            const isActionLoading = Boolean(rsvpLoading[event.id]);

            return (
              <Card key={event.id} padding="none" hover>
                <div className={`px-5 py-4 ${cc.bg} rounded-t-xl border-b border-neutral-100 dark:border-[#222b3d]`}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{event.title}</h3>
                        <Badge variant={cc.variant} size="sm">{cc.label}</Badge>
                        {isRsvpd && <Badge variant="success" size="sm">✓ RSVP&apos;d</Badge>}
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-neutral-600 dark:text-neutral-300">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {!isNaN(eventDate.getTime())
                            ? eventDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long' })
                            : event.date}
                        </span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{event.time}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.venue}</span>
                      </div>
                    </div>
                    {isUpcoming && (
                      <div>
                        {isRsvpd ? (
                          <button
                            type="button"
                            onClick={() => handleCancelRsvp(event.id, event.title)}
                            disabled={isActionLoading}
                            className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
                          >
                            {isActionLoading ? 'Cancelling...' : 'Cancel RSVP'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRsvp(event.id, event.title)}
                            disabled={isActionLoading || (isFull && !isRsvpd)}
                            className={`shrink-0 px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 ${
                              isFull
                                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 border border-neutral-200 dark:border-[#2a3547] cursor-not-allowed'
                                : 'bg-primary-600 hover:bg-primary-700 text-white'
                            }`}
                          >
                            {isActionLoading ? 'Saving...' : isFull ? 'Full' : 'RSVP'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="px-5 py-3">
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">{event.description}</p>
                  <div className="flex items-center justify-between gap-3 mt-2 text-xs text-neutral-400 dark:text-neutral-500 flex-wrap">
                    <span className="flex items-center gap-1 text-neutral-600 dark:text-neutral-300 font-medium">
                      <Users className="w-3 h-3" />
                      Attending: {event.rsvpCount} {event.rsvpCount === 1 ? 'resident' : 'residents'}
                      {event.maxCapacity ? ` / ${event.maxCapacity}` : ''}
                    </span>
                    <span>By {event.organiser}</span>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
