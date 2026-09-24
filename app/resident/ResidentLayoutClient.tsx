'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar, { NavItem } from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import type { UserProfileData } from '@/app/actions/profile';

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/resident/dashboard', iconName: 'LayoutDashboard' },
  { label: 'Visitors', href: '/resident/visitors', iconName: 'Users' },
  { label: 'Deliveries', href: '/resident/deliveries', iconName: 'Package' },
  { label: 'Complaints', href: '/resident/complaints', iconName: 'AlertCircle' },
  { label: 'Maintenance', href: '/resident/maintenance', iconName: 'Wrench' },
  { label: 'Notices', href: '/resident/notices', iconName: 'Bell' },
  { label: 'Home Services', href: '/resident/services', iconName: 'Briefcase' },
  { label: 'Emergency', href: '/resident/emergency', iconName: 'ShieldAlert' },
];

const bottomItems: NavItem[] = [
  { label: 'Help', href: '/resident/help', iconName: 'HelpCircle' },
  { label: 'Settings', href: '/resident/settings', iconName: 'Settings' },
];

const PAGE_TITLES: Record<string, string> = {
  '/resident/dashboard': 'Dashboard',
  '/resident/visitors': 'Visitor Management',
  '/resident/deliveries': 'Deliveries',
  '/resident/complaints': 'My Complaints',
  '/resident/maintenance': 'Maintenance',
  '/resident/notices': 'Notices',
  '/resident/events': 'Community Events',
  '/resident/services': 'Home Services',
  '/resident/emergency': 'Emergency',
  '/resident/help': 'Help & Support',
  '/resident/settings': 'Settings',
  '/resident/profile': 'Resident Profile & Pass',
};

interface ResidentLayoutClientProps {
  user: UserProfileData | null;
  children: React.ReactNode;
}

export default function ResidentLayoutClient({ user, children }: ResidentLayoutClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? 'Resident Portal';

  const userName = user?.fullName || 'Resident';
  const userFlat = user?.flatDisplay || undefined;
  const societyName = user?.societyName || undefined;
  const userSubtitle = [societyName, userFlat].filter(Boolean).join(' · ') || undefined;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0b0f17] transition-colors">
      <Sidebar
        navItems={navItems}
        bottomItems={bottomItems}
        role="resident"
        userName={userName}
        userFlat={userFlat}
        societyName={societyName}
        isMobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main content — offset by sidebar on desktop */}
      <div className="lg:pl-60 flex flex-col min-h-screen">
        <DashboardHeader
          title={title}
          onMenuToggle={() => setMobileOpen(true)}
          userName={userName}
          userSubtitle={userSubtitle}
          homeHref="/resident/dashboard"
        />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
