'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { Inbox, CheckCircle2, XCircle, MapPin, Clock, IndianRupee, User, Loader2 } from 'lucide-react';
import { getProviderRequests, updateServiceRequestStatus } from '@/app/actions/services';
import { useProviderBookingsRealtime } from '@/lib/realtime/useServiceBookingsRealtime';
import { ServiceBooking } from '@/lib/types';

type RequestStatus = 'pending' | 'accepted' | 'declined';

const statusConfig: Record<string, { label: string; variant: 'warning' | 'success' | 'neutral' }> = {
  pending:   { label: 'Pending',  variant: 'warning' },
  accepted:  { label: 'Accepted', variant: 'success' },
  confirmed: { label: 'Accepted', variant: 'success' },
  declined:  { label: 'Declined', variant: 'neutral' },
};

export default function ProviderRequestsPage() {
  const [requests, setRequests] = useState<ServiceBooking[]>([]);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RequestStatus | 'all'>('all');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const { showToast } = useToast();

  function loadRequests() {
    startTransition(async () => {
      setLoading(true);
      const res = await getProviderRequests();
      if (res.data) {
        setRequests(res.data);
      }
      if (res.providerId) {
        setProviderId(res.providerId);
      }
      setLoading(false);
    });
  }

  useEffect(() => {
    loadRequests();
  }, []);

  useProviderBookingsRealtime({
    providerId,
    onInsert: () => {
      showToast('New service request received!', 'info');
      loadRequests();
    },
  });

  async function respond(id: string, action: 'accepted' | 'declined') {
    setActionInProgress(id);
    const res = await updateServiceRequestStatus(id, action);
    setActionInProgress(null);

    if (res.error) {
      showToast(res.error, 'error');
      return;
    }
    showToast(
      action === 'accepted'
        ? 'Request accepted! Resident has been notified.'
        : 'Request declined. Resident will be informed.',
      action === 'accepted' ? 'success' : 'info'
    );
    loadRequests();
  }

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const acceptedCount = requests.filter((r) => r.status === 'accepted' || r.status === 'confirmed').length;
  const declinedCount = requests.filter((r) => r.status === 'declined').length;

  const filtered = requests.filter((r) => {
    if (filter === 'all') return true;
    if (filter === 'accepted') return r.status === 'accepted' || r.status === 'confirmed';
    return r.status === filter;
  });

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-900">Service Requests</h2>
        <p className="text-sm text-neutral-500 mt-0.5">Review and respond to incoming job requests.</p>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
          <p className="text-xs text-neutral-500 mt-0.5">Pending</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <p className="text-2xl font-bold text-green-700">{acceptedCount}</p>
          <p className="text-xs text-neutral-500 mt-0.5">Accepted</p>
        </div>
        <div className="bg-neutral-100 rounded-xl p-4">
          <p className="text-2xl font-bold text-neutral-500">{declinedCount}</p>
          <p className="text-xs text-neutral-500 mt-0.5">Declined</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'pending', 'accepted', 'declined'] as const).map((s) => {
          const count = s === 'all' ? requests.length : s === 'pending' ? pendingCount : s === 'accepted' ? acceptedCount : declinedCount;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors capitalize ${
                filter === s
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300'
              }`}
            >
              {s === 'all' ? `All (${count})` : `${s} (${count})`}
            </button>
          );
        })}
      </div>

      {/* Request Cards */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-neutral-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          <p className="text-sm">Loading service requests...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <Card padding="md">
              <p className="text-center text-sm text-neutral-400 py-8">No requests in this category.</p>
            </Card>
          ) : (
            filtered.map((req) => {
              const sc = statusConfig[req.status] || { label: req.status, variant: 'neutral' };
              const scheduled = new Date(req.scheduledAt);
              return (
                <Card key={req.id} padding="md">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                        <Inbox className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-bold text-neutral-900">{req.service}</span>
                          <Badge variant={sc.variant} size="sm">{sc.label}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-neutral-500">
                          <span className="flex items-center gap-1"><User className="w-3 h-3" />{req.residentName}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{req.flat}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {scheduled.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} at{' '}
                            {scheduled.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-neutral-700">
                            <IndianRupee className="w-3 h-3" />₹{req.amount}
                          </span>
                        </div>
                        {req.notes && (
                          <p className="mt-2 text-xs text-neutral-500 bg-neutral-50 rounded-lg px-3 py-1.5 border border-neutral-100">
                            {req.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {req.status === 'pending' && (
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => respond(req.id, 'accepted')}
                          disabled={actionInProgress === req.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          {actionInProgress === req.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          Accept
                        </button>
                        <button
                          onClick={() => respond(req.id, 'declined')}
                          disabled={actionInProgress === req.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-60 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />Decline
                        </button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
