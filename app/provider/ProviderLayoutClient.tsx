'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar, { NavItem } from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import type { UserProfileData } from '@/app/actions/profile';

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/provider/dashboard', iconName: 'LayoutDashboard' },
  { label: 'New Requests', href: '/provider/requests', iconName: 'Inbox' },
  { label: 'My Bookings', href: '/provider/bookings', iconName: 'CalendarDays' },
  { label: 'Earnings', href: '/provider/earnings', iconName: 'IndianRupee' },
];

const bottomItems: NavItem[] = [
  { label: 'Settings', href: '/provider/settings', iconName: 'Settings' },
  { label: 'Help', href: '/provider/help', iconName: 'HelpCircle' },
];

const PAGE_TITLES: Record<string, string> = {
  '/provider/dashboard': 'Provider Dashboard',
  '/provider/requests': 'Service Requests',
  '/provider/bookings': 'My Bookings',
  '/provider/earnings': 'Earnings',
  '/provider/settings': 'Provider Settings',
  '/provider/help': 'Partner Help & Support',
};

interface ProviderLayoutClientProps {
  user: UserProfileData | null;
  children: React.ReactNode;
}

export default function ProviderLayoutClient({ user, children }: ProviderLayoutClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? 'Provider Portal';

  const userName = user?.fullName || 'Service Provider';
  const societyName = user?.providerCategory
    ? `${user.providerCategory} Services`
    : user?.societyName || undefined;
  const userSubtitle = user?.providerCategory
    ? `${user.providerCategory} Professional`
    : 'Verified Service Partner';

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0b0f17] transition-colors">
      <Sidebar
        navItems={navItems}
        bottomItems={bottomItems}
        role="provider"
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
          homeHref="/provider/dashboard"
        />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
