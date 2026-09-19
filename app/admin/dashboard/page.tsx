import Link from 'next/link';
import { StatCard } from '@/components/dashboard/StatCard';
import { AIInsightCard } from '@/components/dashboard/AIInsightCard';
import ComplaintOverview from '@/components/admin/ComplaintOverview';
import SocietyActivityFeed from '@/components/admin/SocietyActivityFeed';
import { Card } from '@/components/ui/Card';
import { Users, AlertCircle, IndianRupee, UserCheck } from 'lucide-react';
import { getAdminDashboardData } from '@/app/actions/analytics';
import { AdminDashboardRealtimeWrapper } from '@/components/admin/AdminDashboardRealtimeWrapper';

export default async function AdminDashboardPage() {
  const res = await getAdminDashboardData();
  const data = res.data;

  const totalResidents = data?.totalResidents ?? 0;
  const openComplaints = data?.openComplaints ?? 0;
  const highPriority = data?.highPriorityComplaints ?? 0;
  const paidAmount = data?.maintenancePaidAmount ?? 0;
  const totalAmount = data?.maintenanceTotalAmount ?? 0;
  const collectionRate = data?.maintenanceCollectionRate ?? 0;
  const todayVisitors = data?.todayVisitorsCount ?? 0;
  const insideVisitors = data?.insideVisitorsCount ?? 0;
  const recentComplaints = data?.recentComplaints ?? [];
  const recentActivity = data?.recentActivity ?? [];
  const societyName = data?.societyName ?? 'Society';

  return (
    <div className="space-y-6 max-w-7xl">
      {data?.societyId && <AdminDashboardRealtimeWrapper societyId={data.societyId} />}
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Society Dashboard</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{societyName} · Operational Overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Residents"
          value={totalResidents}
          subtitle={`${data?.activeResidents ?? 0} active profiles`}
          icon={<Users className="w-5 h-5 text-primary-600" />}
          variant="default"
        />
        <StatCard
          title="Open Complaints"
          value={openComplaints}
          subtitle={highPriority > 0 ? `${highPriority} high priority` : 'None urgent'}
          icon={<AlertCircle className="w-5 h-5 text-red-600" />}
          variant={openComplaints > 0 ? 'error' : 'default'}
        />
        <StatCard
          title="Maintenance Collection"
          value={totalAmount > 0 ? `₹${(paidAmount / 1000).toFixed(1)}K / ₹${(totalAmount / 1000).toFixed(1)}K` : `₹${paidAmount.toLocaleString('en-IN')}`}
          subtitle={`${collectionRate}% collected`}
          icon={<IndianRupee className="w-5 h-5 text-amber-600" />}
          variant="warning"
        />
        <StatCard
          title="Today's Visitors"
          value={todayVisitors}
          subtitle={insideVisitors > 0 ? `${insideVisitors} currently inside` : 'None inside'}
          icon={<UserCheck className="w-5 h-5 text-green-600" />}
          variant="success"
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          <Card padding="md">
            <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-4">Complaint Overview</h3>
            <ComplaintOverview complaints={recentComplaints} />
          </Card>

          <Card padding="md">
            <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-4">Recent Society Activity</h3>
            <SocietyActivityFeed items={recentActivity} />
          </Card>
        </div>

        {/* Right */}
        <div className="space-y-6">
          <AIInsightCard
            title="AavaasIQ Insights"
            insights={[
              openComplaints > 0
                ? `${openComplaints} complaint${openComplaints > 1 ? 's are' : ' is'} currently open requiring committee resolution.`
                : 'All complaints have been resolved.',
              `Maintenance collection is standing at ${collectionRate}% for this cycle.`,
              todayVisitors > 0
                ? `${todayVisitors} visitor entry log${todayVisitors > 1 ? 's' : ''} verified at gate today.`
                : 'Gate traffic is normal with 0 active alerts.',
            ]}
            actionLabel="View Full Analytics"
          />

          {/* Quick actions */}
          <Card padding="md">
            <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'Send Notice to All Residents', href: '/admin/notices' },
                { label: 'Review Pending Complaints', href: '/admin/complaints' },
                { label: 'Residents Directory', href: '/admin/residents' },
                { label: 'Generate Society Report', href: '/admin/analytics' },
              ].map((a) => (
                <Link
                  key={a.label}
                  href={a.href}
                  className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg border border-neutral-200 dark:border-[#2a3547] text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#1a2232] hover:border-neutral-300 dark:hover:border-[#38455c] transition-colors"
                >
                  <span>{a.label}</span>
                  <span className="text-neutral-400 dark:text-neutral-500">→</span>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
