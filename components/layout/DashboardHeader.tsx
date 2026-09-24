'use client';

import { useState } from 'react';
import {
  Menu,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Home,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { AavaasIQAssistant, type AssistantRole } from '@/components/dashboard/AavaasIQAssistant';

interface DashboardHeaderProps {
  title: string;
  onMenuToggle: () => void;
  userName: string;
  userSubtitle?: string;
  homeHref?: string;
}

export default function DashboardHeader({
  title,
  onMenuToggle,
  userName,
  userSubtitle,
  homeHref,
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  // Compute portal role for assistant guidance
  const currentRole: AssistantRole = pathname.startsWith('/admin')
    ? 'admin'
    : pathname.startsWith('/security')
      ? 'security'
      : pathname.startsWith('/provider')
        ? 'provider'
        : 'resident';

  // Determine profile and settings URLs dynamically based on active route
  const isResident =
    pathname.startsWith('/resident') ||
    (!pathname.startsWith('/admin') &&
      !pathname.startsWith('/security') &&
      !pathname.startsWith('/provider'));
  const profileUrl = isResident
    ? '/resident/profile'
    : pathname.startsWith('/admin')
      ? '/admin/settings'
      : pathname.startsWith('/security')
        ? '/security/settings'
        : '/provider/settings';
  const settingsUrl = isResident
    ? '/resident/settings'
    : pathname.startsWith('/admin')
      ? '/admin/settings'
      : pathname.startsWith('/security')
        ? '/security/settings'
        : '/provider/settings';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white dark:bg-[#0f141c] border-b border-neutral-200 dark:border-neutral-800 shrink-0 transition-colors">
      {/* Left: hamburger + home button + title */}
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        {homeHref && (
          <Link
            href={homeHref}
            className="min-h-[38px] min-w-[38px] flex items-center justify-center p-2 rounded-lg text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-primary-600 dark:hover:text-primary-400 active:scale-95 transition-colors transition-transform duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label="Go to Dashboard"
            title="Dashboard Home"
          >
            <Home className="w-4 h-4" />
          </Link>
        )}
        <h1 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 truncate">{title}</h1>
      </div>

      {/* Right: assistant trigger + theme toggle + user profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Ask AavaasIQ Guided Product Assistant Trigger */}
        <button
          type="button"
          onClick={() => setAssistantOpen(true)}
          className="hidden sm:inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-lg border border-primary-200 dark:border-primary-800/60 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/50 active:scale-[0.98] text-xs font-semibold transition-colors transition-transform duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          title="Open AavaasIQ Guided Product Assistant"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
          <span>Ask AavaasIQ</span>
        </button>
        <button
          type="button"
          onClick={() => setAssistantOpen(true)}
          className="sm:hidden min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-lg text-primary-600 dark:text-primary-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:scale-95 transition-colors transition-transform duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          title="Ask AavaasIQ"
          aria-label="Ask AavaasIQ"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {/* Global Theme Toggle */}
        <ThemeToggle />

        {/* Avatar + User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 pl-2 pr-1.5 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="User menu"
          >
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center shrink-0 shadow-2xs">
              <span className="text-white text-xs font-bold">{getInitials(userName || 'User')}</span>
            </div>
            <span className="hidden sm:block text-sm font-semibold text-neutral-800 dark:text-neutral-200 max-w-[130px] truncate">
              {userName}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
          </button>

          {/* User Dropdown Menu */}
          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setDropdownOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#131924] border border-neutral-200 dark:border-[#222b3d] rounded-2xl shadow-xl z-30 py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2.5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/50">
                  <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">{userName}</p>
                  {userSubtitle && (
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                      {userSubtitle}
                    </p>
                  )}
                </div>

                <div className="py-1">
                  <Link
                    href={profileUrl}
                    onClick={() => setDropdownOpen(false)}
                    className={cn(dropdownItemCls)}
                  >
                    <User className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                    <span>My Profile & Pass</span>
                  </Link>

                  <Link
                    href={settingsUrl}
                    onClick={() => setDropdownOpen(false)}
                    className={cn(dropdownItemCls)}
                  >
                    <Settings className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                    <span>Account Settings</span>
                  </Link>
                </div>

                <div className="my-1 border-t border-neutral-100 dark:border-neutral-800" />

                <div className="px-1 py-0.5">
                  <Link
                    href="/login"
                    onClick={() => setDropdownOpen(false)}
                    className={cn(dropdownItemCls, 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg mx-1')}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* AavaasIQ Guided Assistant Modal */}
      <AavaasIQAssistant
        isOpen={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        role={currentRole}
      />
    </header>
  );
}

const dropdownItemCls =
  'flex items-center gap-2.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-white transition-colors';
