'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar, { NavItem } from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import type { UserProfileData } from '@/app/actions/profile';

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', iconName: 'LayoutDashboard' },
  { label: 'Residents', href: '/admin/residents', iconName: 'Users' },
  { label: 'Complaints', href: '/admin/complaints', iconName: 'AlertCircle' },
  { label: 'Maintenance', href: '/admin/maintenance', iconName: 'Wrench' },
  { label: 'Visitors', href: '/admin/visitors', iconName: 'UserCheck' },
  { label: 'Services', href: '/admin/services', iconName: 'Briefcase' },
  { label: 'Notices', href: '/admin/notices', iconName: 'Bell' },
  { label: 'Analytics', href: '/admin/analytics', iconName: 'BarChart3' },
];

const bottomItems: NavItem[] = [
  { label: 'Settings', href: '/admin/settings', iconName: 'Settings' },
  { label: 'Help', href: '/admin/help', iconName: 'HelpCircle' },
];

const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard': 'Society Dashboard',
  '/admin/residents': 'Residents',
  '/admin/complaints': 'Complaints',
  '/admin/maintenance': 'Maintenance Collection',
  '/admin/visitors': 'Visitor Records',
  '/admin/services': 'Service Management',
  '/admin/notices': 'Notice Board',
  '/admin/analytics': 'Analytics & Reports',
  '/admin/settings': 'Society Settings',
  '/admin/help': 'Help & Support',
};

interface AdminLayoutClientProps {
  user: UserProfileData | null;
  children: React.ReactNode;
}

export default function AdminLayoutClient({ user, children }: AdminLayoutClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? 'Admin Portal';

  const userName = user?.fullName || 'Society Administrator';
  const societyName = user?.societyName || undefined;
  const userSubtitle = societyName ? `${societyName} · Admin` : 'Administrator';

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0b0f17] transition-colors">
      <Sidebar
        navItems={navItems}
        bottomItems={bottomItems}
        role="admin"
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
