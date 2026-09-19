'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar, { NavItem } from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import type { UserProfileData } from '@/app/actions/profile';

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/security/dashboard', iconName: 'LayoutDashboard' },
  { label: 'Visitors', href: '/security/visitors', iconName: 'Users' },
  { label: 'Deliveries', href: '/security/deliveries', iconName: 'Package' },
  { label: 'Emergency', href: '/security/emergency', iconName: 'ShieldAlert' },
];

const bottomItems: NavItem[] = [
  { label: 'Settings', href: '/security/settings', iconName: 'Settings' },
  { label: 'Help', href: '/help', iconName: 'HelpCircle' },
];

const PAGE_TITLES: Record<string, string> = {
  '/security/dashboard': 'Security Dashboard',
  '/security/visitors': 'Visitor Log',
  '/security/deliveries': 'Delivery Management',
  '/security/emergency': 'Emergency Alerts',
  '/security/settings': 'Terminal Settings',
};

interface SecurityLayoutClientProps {
  user: UserProfileData | null;
  children: React.ReactNode;
}

export default function SecurityLayoutClient({ user, children }: SecurityLayoutClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? 'Security Portal';

  const userName = user?.fullName || 'Security Officer';
  const societyName = user?.societyName || undefined;
  const userSubtitle = societyName ? `${societyName} · Gate Security` : 'Security Officer';

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0b0f17] transition-colors">
      <Sidebar
        navItems={navItems}
        bottomItems={bottomItems}
        role="security"
        userName={userName}
        societyName={societyName}
        isMobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="lg:pl-60 flex flex-col min-h-screen">
        <DashboardHeader
          title={title}
          onMenuToggle={() => setMobileOpen(true)}
          userName={userName}
          userSubtitle={userSubtitle}
        />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
