import { StatCard } from '@/components/dashboard/StatCard';
import VisitorEntryTable from '@/components/security/VisitorEntryTable';
import { Card } from '@/components/ui/Card';
import { getSecurityVisitors } from '@/app/actions/visitors';
import { Clock, CheckCircle2, UserCheck, LogOut, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default async function SecurityDashboardPage() {
  const res = await getSecurityVisitors();
  const visitors = res.visitors || [];

  const expected = visitors.filter((v) => v.status === 'expected');
  const inside = visitors.filter((v) => v.status === 'inside');
  const approved = visitors.filter((v) => v.status === 'approved');
  const exited = visitors.filter((v) => v.status === 'exited');

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Security Dashboard</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Green Valley Residency · Gate 1</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Expected"
          value={expected.length}
          subtitle="Awaiting arrival"
          icon={<Clock className="w-5 h-5 text-blue-600" />}
          variant="default"
        />
        <StatCard
          title="Approved"
          value={approved.length}
          subtitle="At gate"
          icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
          variant="success"
        />
        <StatCard
          title="Inside"
          value={inside.length}
          subtitle="On premises"
          icon={<UserCheck className="w-5 h-5 text-primary-600" />}
          variant="default"
        />
        <StatCard
          title="Exited"
          value={exited.length}
          subtitle="Today"
          icon={<LogOut className="w-5 h-5 text-neutral-500" />}
          variant="default"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link
          href="/security/visitors"
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors text-center"
        >
          <UserCheck className="w-6 h-6" />
          <span className="text-sm font-semibold">Verify Visitor</span>
        </Link>
        <Link
          href="/security/visitors"
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white dark:bg-[#131924] border border-neutral-200 dark:border-[#222b3d] text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-[#1a2232] transition-colors text-center"
        >
          <CheckCircle2 className="w-6 h-6" />
          <span className="text-sm font-semibold">Add Visitor</span>
        </Link>
        <Link
          href="/security/deliveries"
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white dark:bg-[#131924] border border-neutral-200 dark:border-[#222b3d] text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-[#1a2232] transition-colors text-center"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-sm font-semibold">Delivery Entry</span>
        </Link>
        <Link
          href="/security/emergency"
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors text-center"
        >
          <ShieldAlert className="w-6 h-6" />
          <span className="text-sm font-semibold">Emergency Alert</span>
        </Link>
      </div>

      {/* Visitor Table */}
      <Card padding="md">
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-4">Today&apos;s Entries</h3>
        <VisitorEntryTable visitors={visitors} />
      </Card>
    </div>
  );
}
