'use client';

import { useState, useEffect, useTransition } from 'react';
import { StatCard } from '@/components/dashboard/StatCard';
import { AssistantInsightCard } from '@/components/dashboard/AssistantInsightCard';
import ServiceRequestCard from '@/components/provider/ServiceRequestCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { Inbox, CalendarDays, CheckCircle2, IndianRupee, Star, Loader2 } from 'lucide-react';
import { getProviderDashboardData, updateServiceRequestStatus, ProviderDashboardStats } from '@/app/actions/services';
import { useProviderBookingsRealtime } from '@/lib/realtime/useServiceBookingsRealtime';

const scheduleStatus = {
  completed: { label: 'Completed', variant: 'success' as const },
  in_progress: { label: 'In Progress', variant: 'warning' as const },
  upcoming: { label: 'Upcoming', variant: 'info' as const },
};

export default function ProviderDashboardPage() {
  const [stats, setStats] = useState<ProviderDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();
  const { showToast } = useToast();

  function loadData() {
    startTransition(async () => {
      const res = await getProviderDashboardData();
      if (res.data) {
        setStats(res.data);
      }
      setLoading(false);
    });
  }

  useEffect(() => {
    loadData();
  }, []);

  useProviderBookingsRealtime({
    providerId: stats?.providerId,
    onInsert: () => {
      showToast('New service request received!', 'info');
      loadData();
    },
  });

  async function handleResponse(id: string, action: 'accepted' | 'declined') {
    const res = await updateServiceRequestStatus(id, action);
    if (res.error) {
      showToast(res.error, 'error');
      return;
    }
    showToast(
      action === 'accepted' ? 'Request accepted! Added to upcoming bookings.' : 'Request declined.',
      action === 'accepted' ? 'success' : 'info'
    );
    loadData();
  }

  const newRequests = stats?.newRequests ?? [];
  const todaySchedule = stats?.todaySchedule ?? [];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Welcome */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          Welcome back, {stats?.providerName || 'Provider'}! 👋
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          {stats?.providerCategory ? `${stats.providerCategory} Services` : 'Home Services'} · Partner Portal
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          <p className="text-sm">Loading your service operations...</p>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="New Requests"
              value={stats?.newRequestsCount ?? 0}
              subtitle="Awaiting response"
              icon={<Inbox className="w-5 h-5 text-primary-600" />}
              variant="default"
            />
            <StatCard
              title="Today's Jobs"
              value={stats?.todayJobsCount ?? 0}
              subtitle={todaySchedule.length > 0 ? `${todaySchedule.filter(j => j.status === 'completed').length} completed` : 'No jobs today'}
              icon={<CalendarDays className="w-5 h-5 text-blue-600" />}
              variant="default"
            />
            <StatCard
              title="Month Completed"
              value={stats?.monthCompletedCount ?? 0}
              subtitle="Completed jobs"
              icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
              variant="success"
            />
            <StatCard
              title="Month Earnings"
              value={`₹${(stats?.monthEarnings ?? 0).toLocaleString('en-IN')}`}
              subtitle="Total earned"
              icon={<IndianRupee className="w-5 h-5 text-amber-600" />}
              variant="warning"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Requests + Schedule */}
            <div className="lg:col-span-2 space-y-6">
              {/* New Requests */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">New Service Requests</h3>
                  {newRequests.length > 0 && (
                    <span className="w-5 h-5 flex items-center justify-center bg-red-500 text-white text-xs font-semibold rounded-full">
                      {newRequests.length}
                    </span>
                  )}
                </div>
                {newRequests.length === 0 ? (
                  <Card padding="md">
                    <p className="text-center text-sm text-neutral-400 dark:text-neutral-500 py-6">
                      No new service requests right now.
                    </p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {newRequests.map((req) => (
                      <ServiceRequestCard
                        key={req.id}
                        id={req.id}
                        service={req.service}
                        flat={req.flat}
                        residentName={req.residentName ?? 'Resident'}
                        scheduledAt={req.scheduledAt}
                        amount={req.amount}
                        onAccept={() => handleResponse(req.id, 'accepted')}
                        onDecline={() => handleResponse(req.id, 'declined')}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Today's Schedule */}
              <Card padding="md">
                <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-4">Today&apos;s Schedule</h3>
                {todaySchedule.length === 0 ? (
                  <p className="text-center text-sm text-neutral-400 dark:text-neutral-500 py-6">
                    No service visits scheduled for today.
                  </p>
                ) : (
                  <div className="space-y-0 divide-y divide-neutral-50 dark:divide-[#222b3d]">
                    {todaySchedule.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-3.5 gap-3">
                        <div className="flex items-start gap-3">
                          <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 w-16 pt-0.5 shrink-0">{item.time}</span>
                          <div>
                            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{item.service}</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{item.flat} · {item.resident}</p>
                          </div>
                        </div>
                        <Badge variant={scheduleStatus[item.status].variant} size="sm">
                          {scheduleStatus[item.status].label}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Right */}
            <div className="space-y-6">
              <AssistantInsightCard
                role="provider"
                title="AavaasIQ Assistant"
                insights={[
                  newRequests.length > 0
                    ? `You have ${newRequests.length} pending service request${newRequests.length > 1 ? 's' : ''} awaiting response.`
                    : 'All service requests are up to date.',
                  'Maintain high service ratings by completing jobs on scheduled time.',
                  'Contact the society maintenance desk for complex pipeline or drainage queries.',
                ]}
                actionLabel="Ask AavaasIQ"
              />

              {/* Earnings Summary */}
              <Card padding="md">
                <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-4">Earnings Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">This Month</span>
                    <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      ₹{(stats?.monthEarnings ?? 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-neutral-100 dark:border-[#222b3d]">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">Completed Jobs</span>
                    <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      {stats?.monthCompletedCount ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">Avg Rating</span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600 dark:text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> 4.8
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
