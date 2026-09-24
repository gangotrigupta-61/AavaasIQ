import Link from 'next/link';
import { StatCard } from '@/components/dashboard/StatCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { AssistantInsightCard } from '@/components/dashboard/AssistantInsightCard';
import ComplaintsList from '@/components/resident/ComplaintsList';
import { Card } from '@/components/ui/Card';
import { Complaint, ActivityItem } from '@/lib/types';
import {
  IndianRupee,
  AlertCircle,
  Users,
  Calendar,
  Plus,
  Wrench,
  Briefcase,
  Bell,
  CreditCard,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

/**
 * Fetches the logged-in resident's profile and society membership from Supabase.
 */
async function getResidentData() {
  try {
    const supabase = await createClient();

    // Get the authenticated user from the verified JWT
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, phone, role')
      .eq('id', user.id)
      .single();

    if (!profile) return null;

    // Fetch membership + society name in one join
    const { data: membership } = await supabase
      .from('society_memberships')
      .select('flat_number, block, status, societies(name)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    // Fetch active complaints count
    let activeComplaintsCount: number | null = null;
    let recentComplaints: Complaint[] | null = null;
    try {
      const { count } = await supabase
        .from('complaints')
        .select('id', { count: 'exact', head: true })
        .eq('resident_id', user.id)
        .in('status', ['open', 'in_progress']);
      activeComplaintsCount = count ?? 0;

      const { data: dbComplaints } = await supabase
        .from('complaints')
        .select('*')
        .eq('resident_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (dbComplaints) {
        recentComplaints = dbComplaints.map((c: { id: string; title: string; category: string; status: string; priority: string; resident_id: string; created_at: string; updated_at: string }) => ({
          id: c.id,
          title: c.title,
          description: '',
          category: c.category,
          status: (c.status as 'open' | 'in_progress' | 'resolved') || 'open',
          priority: (c.priority as 'low' | 'medium' | 'high') || 'medium',
          residentId: c.resident_id,
          residentName: profile.full_name || 'Resident',
          flat: membership ? (membership.block ? `Flat ${membership.block}-${membership.flat_number}` : `Flat ${membership.flat_number}`) : 'Flat',
          createdAt: c.created_at,
          updatedAt: c.updated_at,
        }));
      }
    } catch {}

    // Fetch pending maintenance bill
    let pendingMaintenance: { amount: number; dueDate: string; title: string } | null = null;
    try {
      const { data: dbMaint } = await supabase
        .from('maintenance_records')
        .select('amount, due_date, title')
        .eq('resident_id', user.id)
        .in('status', ['pending', 'overdue'])
        .order('due_date', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (dbMaint) {
        pendingMaintenance = {
          amount: Number(dbMaint.amount),
          dueDate: dbMaint.due_date || 'Due soon',
          title: dbMaint.title,
        };
      }
    } catch {}

    // Build real activity items
    const activityItems: ActivityItem[] = [];
    if (recentComplaints && recentComplaints.length > 0) {
      recentComplaints.slice(0, 2).forEach((c) => {
        activityItems.push({
          id: `act-c-${c.id}`,
          type: 'complaint',
          title: `Complaint: ${c.title}`,
          description: `Status: ${c.status} · Priority: ${c.priority}`,
          time: new Date(c.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        });
      });
    }

    try {
      const { data: dbDeliveries } = await supabase
        .from('deliveries')
        .select('*')
        .eq('resident_id', user.id)
        .order('created_at', { ascending: false })
        .limit(2);

      if (dbDeliveries) {
        dbDeliveries.forEach((d: { id: string; courier_name: string; status: string; created_at: string }) => {
          activityItems.push({
            id: `act-d-${d.id}`,
            type: 'delivery',
            title: `Package from ${d.courier_name || 'Courier'}`,
            description: `Status: ${d.status === 'collected' ? 'Collected' : 'Awaiting Collection'}`,
            time: new Date(d.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
          });
        });
      }
    } catch {}

    try {
      const { data: dbVisitors } = await supabase
        .from('visitors')
        .select('*')
        .eq('resident_id', user.id)
        .order('created_at', { ascending: false })
        .limit(2);

      if (dbVisitors) {
        dbVisitors.forEach((v: { id: string; visitor_name: string; purpose: string | null; status: string; created_at: string }) => {
          activityItems.push({
            id: `act-v-${v.id}`,
            type: 'visitor',
            title: `Visitor: ${v.visitor_name}`,
            description: `Purpose: ${v.purpose || 'Guest'} · Status: ${v.status}`,
            time: new Date(v.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
          });
        });
      }
    } catch {}

    return {
      fullName:    profile.full_name,
      flatDisplay: membership
        ? (membership.block ? `Flat ${membership.block}-${membership.flat_number}` : `Flat ${membership.flat_number}`)
        : null,
      societyName: membership
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? (membership.societies as any)?.name ?? null
        : null,
      activeComplaintsCount,
      recentComplaints: recentComplaints ?? [],
      pendingMaintenance,
      activityItems,
      hasRealData: true,
    };
  } catch {
    return null;
  }
}

export default async function ResidentDashboardPage() {
  const residentData = await getResidentData();

  const firstName   = residentData?.fullName?.split(' ')[0] ?? 'Resident';
  const flatDisplay = residentData?.flatDisplay  ?? 'Your Flat';
  const societyName = residentData?.societyName  ?? 'Society';

  const complaints = residentData?.recentComplaints ?? [];

  const maintDueValue = residentData?.pendingMaintenance
    ? `₹${residentData.pendingMaintenance.amount.toLocaleString('en-IN')}`
    : '₹0';
  const maintDueSub = residentData?.pendingMaintenance
    ? `Due ${residentData.pendingMaintenance.dueDate}`
    : 'All dues cleared';
  const maintVariant = residentData?.pendingMaintenance ? ('warning' as const) : ('success' as const);

  const activeComplaintsVal = residentData?.activeComplaintsCount ?? 0;
  const activeComplaintsSub = activeComplaintsVal === 1 ? '1 active ticket' : `${activeComplaintsVal} active tickets`;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Welcome */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Good morning, {firstName} 👋</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{societyName} · {flatDisplay}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Maintenance Due"
          value={maintDueValue}
          subtitle={maintDueSub}
          icon={<IndianRupee className="w-5 h-5 text-amber-600" />}
          variant={maintVariant}
        />
        <StatCard
          title="Active Complaints"
          value={activeComplaintsVal}
          subtitle={activeComplaintsSub}
          icon={<AlertCircle className="w-5 h-5 text-red-600" />}
          variant={activeComplaintsVal > 0 ? 'error' : 'default'}
        />
        <StatCard
          title="Today's Visitors"
          value={3}
          subtitle="1 expected"
          icon={<Users className="w-5 h-5 text-primary-600" />}
          variant="default"
        />
        <StatCard
          title="Upcoming Events"
          value={1}
          subtitle="Tomorrow"
          icon={<Calendar className="w-5 h-5 text-green-600" />}
          variant="success"
        />
      </div>


      {/* Quick Actions */}
      <Card padding="md">
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/resident/visitors"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-neutral-200 dark:border-[#2a3547] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#1a2232] transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Visitor
          </Link>
          <Link
            href="/resident/complaints"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-neutral-200 dark:border-[#2a3547] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#1a2232] transition-colors"
          >
            <AlertCircle className="w-4 h-4" /> Raise Complaint
          </Link>
          <Link
            href="/resident/maintenance"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
          >
            <CreditCard className="w-4 h-4" /> Pay Maintenance
          </Link>
          <Link
            href="/resident/services"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-neutral-200 dark:border-[#2a3547] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#1a2232] transition-colors"
          >
            <Briefcase className="w-4 h-4" /> Book Service
          </Link>
          <Link
            href="/resident/notices"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#1a2232] transition-colors"
          >
            <Bell className="w-4 h-4" /> View Notices
          </Link>
        </div>
      </Card>

      {/* Main content: 2-col on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Activity Feed */}
          <Card padding="md">
            <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-4">Today&apos;s Activity</h3>
            <ActivityFeed items={residentData?.activityItems ?? []} />
          </Card>

          {/* Complaints */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">My Complaints</h3>
              <Link
                href="/resident/complaints"
                className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
              >
                View all →
              </Link>
            </div>
            <ComplaintsList complaints={complaints} showViewAll={false} />
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <AssistantInsightCard
            role="resident"
            title="AavaasIQ Assistant"
            insights={[
              (residentData?.activeComplaintsCount ?? 0) > 0
                ? `You have ${residentData!.activeComplaintsCount} open complaint${(residentData?.activeComplaintsCount ?? 0) > 1 ? 's' : ''} in progress.`
                : 'All your complaints are resolved. Raise a new one if needed.',
              residentData?.pendingMaintenance
                ? `Your maintenance bill of ₹${residentData.pendingMaintenance.amount.toLocaleString('en-IN')} is due on ${residentData.pendingMaintenance.dueDate}.`
                : 'No pending maintenance dues. You are all clear for this cycle.',
              'Need a plumber, electrician, or cleaner? Book verified service pros from Home Services.',
            ]}
            actionLabel="Ask AavaasIQ"
          />

          {/* Maintenance card */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Maintenance Bill</h3>
              <Wrench className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="space-y-2">
              {residentData?.hasRealData && !residentData.pendingMaintenance ? (
                <div className="py-2 text-center">
                  <span className="inline-block text-xs bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300 font-medium px-2.5 py-1 rounded-full mb-2">
                    All Dues Cleared
                  </span>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">No pending maintenance payments for your flat.</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">{residentData?.pendingMaintenance?.title || 'September 2026'}</span>
                    <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                      ₹{(residentData?.pendingMaintenance?.amount || 2400).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">Due date</span>
                    <span className="text-xs text-neutral-700 dark:text-neutral-300 font-medium">{residentData?.pendingMaintenance?.dueDate || '5 Oct 2026'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">Status</span>
                    <span className="text-xs bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-medium px-2 py-0.5 rounded-full">
                      Pending
                    </span>
                  </div>
                </>
              )}
            </div>
            <Link
              href="/resident/maintenance"
              className="mt-4 flex items-center justify-center w-full py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
            >
              {residentData?.hasRealData && !residentData.pendingMaintenance ? 'View History' : 'Pay Now'}
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
