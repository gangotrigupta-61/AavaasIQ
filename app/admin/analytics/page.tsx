import { Card } from '@/components/ui/Card';
import { TrendingUp, TrendingDown, Users, AlertTriangle, IndianRupee, UserCheck } from 'lucide-react';
import { getAdminAnalytics } from '@/app/actions/analytics';

export default async function AdminAnalyticsPage() {
  const res = await getAdminAnalytics();
  const d = res.data;

  const totalResidents = d?.totalResidents ?? 0;
  const activeResidents = d?.activeResidents ?? 0;
  const openComplaints = d?.openComplaints ?? 0;
  const resolvedComplaints = d?.resolvedComplaints ?? 0;
  const resolutionRate = d?.resolutionRate ?? 100;
  const collectionRate = d?.collectionRate ?? 0;
  const todayVisitors = d?.todayVisitors ?? 0;

  const monthlyComplaints = d?.monthlyComplaints ?? [];
  const collectionMonths = d?.collectionMonths ?? [];
  const categoryBreakdown = d?.categoryBreakdown ?? [];
  const societyAtGlance = d?.societyAtGlance ?? [];

  const maxComplaints = Math.max(1, ...monthlyComplaints.map((m) => m.open + m.resolved));
  const maxCatCount = Math.max(1, ...categoryBreakdown.map((c) => c.count));

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Analytics Overview</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Society Performance & Operational Metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Active Residents',
            value: activeResidents,
            subtitle: `of ${totalResidents} total members`,
            icon: <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
            bg: 'bg-primary-50 dark:bg-primary-950/60',
            color: 'text-primary-600 dark:text-primary-400',
            trend: 'Verified profiles',
            up: true,
          },
          {
            title: 'Open Complaints',
            value: openComplaints,
            subtitle: `${resolutionRate}% resolved`,
            icon: <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />,
            bg: 'bg-red-50 dark:bg-red-950/60',
            color: 'text-red-600 dark:text-red-400',
            trend: `${resolvedComplaints} closed`,
            up: openComplaints === 0,
          },
          {
            title: 'Collection Rate',
            value: `${collectionRate}%`,
            subtitle: 'Current cycle',
            icon: <IndianRupee className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
            bg: 'bg-amber-50 dark:bg-amber-950/60',
            color: 'text-amber-600 dark:text-amber-400',
            trend: 'Maintenance',
            up: collectionRate >= 75,
          },
          {
            title: 'Visitors Today',
            value: todayVisitors,
            subtitle: 'Gate check-ins',
            icon: <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />,
            bg: 'bg-green-50 dark:bg-green-950/60',
            color: 'text-green-600 dark:text-green-400',
            trend: 'Gate verified',
            up: true,
          },
        ].map((kpi) => (
          <div key={kpi.title} className="bg-white dark:bg-[#131924] rounded-xl border border-neutral-200 dark:border-[#222b3d] p-5 relative transition-colors shadow-2xs">
            <div className={`absolute top-4 right-4 w-9 h-9 ${kpi.bg} rounded-full flex items-center justify-center`}>
              {kpi.icon}
            </div>
            <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">{kpi.title}</p>
            <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{kpi.subtitle}</p>
            <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${kpi.up ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {kpi.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {kpi.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Complaints Trend */}
        <Card padding="md">
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-5">Complaints Activity Trend</h3>
          <div className="flex items-end gap-3 h-32 mb-3">
            {monthlyComplaints.map((m) => {
              const openH = Math.round((m.open / maxComplaints) * 100);
              const resolvedH = Math.round((m.resolved / maxComplaints) * 100);
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col items-center gap-0.5" style={{ height: '100px' }}>
                    <div className="w-full flex flex-col justify-end h-full gap-0.5">
                      <div className="w-full bg-red-300 dark:bg-red-400/80 rounded-xs" style={{ height: `${openH}%` }} title={`Open: ${m.open}`} />
                      <div className="w-full bg-green-400 dark:bg-green-500 rounded-xs" style={{ height: `${resolvedH}%` }} title={`Resolved: ${m.resolved}`} />
                    </div>
                  </div>
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">{m.month}</span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 text-xs text-neutral-600 dark:text-neutral-300">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-300 dark:bg-red-400/80 rounded-xs inline-block" />Open</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-green-400 dark:bg-green-500 rounded-xs inline-block" />Resolved</span>
          </div>
        </Card>

        {/* Collection Rate Trend */}
        <Card padding="md">
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-5">Maintenance Collection %</h3>
          <div className="flex items-end gap-3 h-32 mb-3">
            {collectionMonths.map((m, idx) => {
              const isLatest = idx === collectionMonths.length - 1;
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{m.pct}%</span>
                  <div className="w-full flex items-end" style={{ height: '80px' }}>
                    <div
                      className={`w-full rounded-t-xs transition-all ${isLatest ? 'bg-primary-600' : 'bg-primary-200 dark:bg-primary-900/60'}`}
                      style={{ height: `${Math.max(8, m.pct)}%` }}
                    />
                  </div>
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">{m.month}</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">Target: 95% collection per cycle</p>
        </Card>

        {/* Complaint Categories from live data */}
        <Card padding="md">
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-4">Complaints by Category</h3>
          {categoryBreakdown.length === 0 ? (
            <p className="text-xs text-neutral-400 dark:text-neutral-500 py-6 text-center">No complaints recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {categoryBreakdown.map((cat) => {
                const pct = Math.round((cat.count / maxCatCount) * 100);
                return (
                  <div key={cat.category}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-neutral-700 dark:text-neutral-300 capitalize">{cat.category}</span>
                      <span className="text-neutral-500 dark:text-neutral-400">{cat.count} complaint{cat.count > 1 ? 's' : ''}</span>
                    </div>
                    <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full" style={{ width: `${Math.max(5, pct)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Society at a Glance */}
        <Card padding="md">
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-4">Society Operations at a Glance</h3>
          <div className="space-y-3">
            {societyAtGlance.map((row) => (
              <div key={row.label} className="flex justify-between items-center text-sm border-b border-neutral-50 dark:border-neutral-800/80 pb-2 last:border-0 last:pb-0">
                <span className="text-neutral-600 dark:text-neutral-400">{row.label}</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">{row.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
