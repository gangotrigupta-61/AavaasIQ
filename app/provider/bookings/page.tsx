'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { CalendarDays, MapPin, Clock, IndianRupee, User, CheckCircle2, Loader2 } from 'lucide-react';
import { getProviderBookings, updateServiceBookingStatus } from '@/app/actions/services';
import { ServiceBooking } from '@/lib/types';

type BookingStatus = 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

const statusConfig: Record<string, { label: string; variant: 'info' | 'warning' | 'success' | 'neutral' }> = {
  confirmed:   { label: 'Confirmed',   variant: 'info' },
  accepted:    { label: 'Confirmed',   variant: 'info' },
  in_progress: { label: 'In Progress', variant: 'warning' },
  completed:   { label: 'Completed',   variant: 'success' },
  cancelled:   { label: 'Cancelled',   variant: 'neutral' },
  declined:    { label: 'Cancelled',   variant: 'neutral' },
};

type FilterStatus = BookingStatus | 'all';

export default function ProviderBookingsPage() {
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [, startTransition] = useTransition();
  const { showToast } = useToast();

  function loadBookings() {
    startTransition(async () => {
      setLoading(true);
      const res = await getProviderBookings();
      if (res.data) {
        setBookings(res.data);
      }
      setLoading(false);
    });
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function markComplete(id: string) {
    const res = await updateServiceBookingStatus(id, 'completed');
    if (res.error) {
      showToast(res.error, 'error');
      return;
    }
    showToast('Job marked as completed! Earnings updated.', 'success');
    loadBookings();
  }

  const counts = {
    confirmed:   bookings.filter((b) => b.status === 'confirmed' || b.status === 'accepted').length,
    in_progress: bookings.filter((b) => b.status === 'in_progress').length,
    completed:   bookings.filter((b) => b.status === 'completed').length,
    cancelled:   bookings.filter((b) => b.status === 'cancelled' || b.status === 'declined').length,
  };

  const filtered = bookings.filter((b) => {
    if (filter === 'all') return true;
    if (filter === 'confirmed') return b.status === 'confirmed' || b.status === 'accepted';
    if (filter === 'cancelled') return b.status === 'cancelled' || b.status === 'declined';
    return b.status === filter;
  });

  const sortedFiltered = [...filtered].sort(
    (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">My Bookings</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">All confirmed and completed service bookings.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { key: 'confirmed',   label: 'Upcoming',    bg: 'bg-blue-50 dark:bg-blue-950/30',   text: 'text-blue-700 dark:text-blue-300' },
          { key: 'in_progress', label: 'In Progress', bg: 'bg-amber-50 dark:bg-amber-950/30',  text: 'text-amber-700 dark:text-amber-300' },
          { key: 'completed',   label: 'Completed',   bg: 'bg-green-50 dark:bg-green-950/30',  text: 'text-green-700 dark:text-green-300' },
          { key: 'cancelled',   label: 'Cancelled',   bg: 'bg-neutral-100 dark:bg-[#131924]', text: 'text-neutral-500 dark:text-neutral-400' },
        ].map(({ key, label, bg, text }) => (
          <div key={key} className={`${bg} rounded-xl p-4`}>
            <p className={`text-2xl font-bold ${text}`}>{counts[key as BookingStatus]}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'confirmed', 'in_progress', 'completed', 'cancelled'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              filter === s
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white dark:bg-[#1a2232] border-neutral-200 dark:border-[#2a3547] text-neutral-600 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-500'
            }`}
          >
            {s === 'all' ? 'All' : s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Booking Cards */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          <p className="text-sm">Loading your bookings...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedFiltered.length === 0 ? (
            <Card padding="md"><p className="text-center text-sm text-neutral-400 dark:text-neutral-500 py-8">No bookings found.</p></Card>
          ) : sortedFiltered.map((b) => {
            const sc = statusConfig[b.status] || { label: b.status, variant: 'neutral' };
            const scheduled = new Date(b.scheduledAt);
            const isToday = scheduled.toDateString() === new Date().toDateString();
            const canComplete = b.status === 'confirmed' || b.status === 'accepted' || b.status === 'in_progress';

            return (
              <Card key={b.id} padding="md" hover>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-xl flex items-center justify-center shrink-0">
                      <CalendarDays className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{b.service}</span>
                        <Badge variant={sc.variant} size="sm">{sc.label}</Badge>
                        {isToday && b.status !== 'completed' && b.status !== 'cancelled' && (
                          <span className="text-xs bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 font-semibold px-2 py-0.5 rounded-full">Today</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{b.residentName}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{b.flat}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {scheduled.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {scheduled.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-neutral-700 dark:text-neutral-200">
                          <IndianRupee className="w-3 h-3" />₹{b.amount}
                        </span>
                      </div>
                      {b.notes && (
                        <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-850/60 rounded-lg px-3 py-1.5 border border-neutral-100 dark:border-neutral-800">
                          {b.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  {canComplete && (
                    <button
                      onClick={() => markComplete(b.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors shrink-0 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />Mark Complete
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
