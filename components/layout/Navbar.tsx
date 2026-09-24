'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Settings,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { getCurrentUserProfile, type UserProfileData } from '@/app/actions/profile';
import { logoutAction } from '@/app/actions/auth';
import { createClient } from '@/lib/supabase/client';
import { getInitials } from '@/lib/utils';

const navLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'Services', href: '/#services' },
  { label: 'About', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
];

const exploreLinks = [
  { label: 'Features', href: '/features', desc: 'Full platform feature breakdown' },
  { label: 'How It Works', href: '/how-it-works', desc: 'Get started in 4 simple steps' },
  { label: 'Roles', href: '/roles', desc: 'Resident, Admin, Security, Provider' },
  { label: 'Services', href: '/services', desc: 'Home services marketplace' },
  { label: 'About', href: '/about', desc: 'Our mission and story' },
  { label: 'Contact', href: '/contact', desc: 'Get in touch or request a demo' },
];

const roleDashboardMap: Record<string, string> = {
  resident: '/resident/dashboard',
  admin: '/admin/dashboard',
  security: '/security/dashboard',
  provider: '/provider/dashboard',
};

const roleSettingsMap: Record<string, string> = {
  resident: '/resident/settings',
  admin: '/admin/settings',
  security: '/security/settings',
  provider: '/provider/settings',
};

const roleLabelMap: Record<string, string> = {
  resident: 'Resident',
  admin: 'Management',
  security: 'Security',
  provider: 'Provider',
};

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Check auth state & subscribe to auth changes
  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const profile = await getCurrentUserProfile();
        if (isMounted) {
          setUserProfile(profile);
        }
      } catch {
        if (isMounted) setUserProfile(null);
      } finally {
        if (isMounted) setAuthLoaded(true);
      }
    }

    checkAuth();

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (
        event === 'SIGNED_IN' ||
        event === 'USER_UPDATED' ||
        event === 'TOKEN_REFRESHED'
      ) {
        checkAuth();
      } else if (event === 'SIGNED_OUT') {
        if (isMounted) {
          setUserProfile(null);
          setAuthLoaded(true);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setExploreOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dashboardHref = userProfile
    ? roleDashboardMap[userProfile.role] || '/resident/dashboard'
    : '/login';

  const settingsHref = userProfile
    ? roleSettingsMap[userProfile.role] || '/resident/settings'
    : '/login';

  const roleLabel = userProfile
    ? roleLabelMap[userProfile.role] || userProfile.role
    : '';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-[#0f141c] border-b border-neutral-200 dark:border-neutral-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo — decorative green dot cleanly removed */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex items-center justify-center w-8 h-8 bg-primary-600 rounded-lg">
              <Building2 className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <span className="font-bold text-lg text-neutral-900 dark:text-neutral-100 tracking-tight">
              AavaasIQ
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/80 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {/* Explore dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setExploreOpen((v) => !v)}
                className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  exploreOpen
                    ? 'bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                    : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Explore
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${exploreOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {exploreOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-[#131924] border border-neutral-200 dark:border-[#222b3d] rounded-xl shadow-lg py-1.5 z-50">
                  {exploreLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setExploreOpen(false)}
                      className="flex flex-col px-4 py-3 hover:bg-neutral-50 dark:hover:bg-[#1a2232] transition-colors group"
                    >
                      <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {link.label}
                      </span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {link.desc}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />

            {/* If logged in, show Go to Dashboard & User Menu; otherwise Login/Get Started */}
            {authLoaded && userProfile ? (
              <div className="flex items-center gap-2">
                <Link
                  href={dashboardHref}
                  className="min-h-[38px] inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 active:bg-primary-800 rounded-lg shadow-2xs hover:shadow-xs active:scale-[0.98] transition-all duration-150"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
                    aria-label="User menu"
                  >
                    {userProfile.avatarUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={userProfile.avatarUrl}
                        alt={userProfile.fullName}
                        className="w-8 h-8 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950/80 text-primary-700 dark:text-primary-300 font-bold text-xs flex items-center justify-center border border-primary-200 dark:border-primary-800">
                        {getInitials(userProfile.fullName || 'User')}
                      </div>
                    )}
                    <div className="text-left hidden lg:block">
                      <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 leading-tight max-w-[120px] truncate">
                        {userProfile.fullName}
                      </p>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 capitalize">
                        {roleLabel}
                      </p>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-neutral-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute top-full right-0 mt-1 w-56 bg-white dark:bg-[#131924] border border-neutral-200 dark:border-[#222b3d] rounded-xl shadow-lg py-2 z-50">
                      <div className="px-4 py-2 border-b border-neutral-100 dark:border-[#1e2a3a]">
                        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                          {userProfile.fullName}
                        </p>
                        {userProfile.email && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                            {userProfile.email}
                          </p>
                        )}
                        <span className="inline-flex mt-1.5 items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800/60">
                          {roleLabel}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          href={dashboardHref}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-[#1a2232] transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-neutral-500" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          href={settingsHref}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-[#1a2232] transition-colors"
                        >
                          <Settings className="w-4 h-4 text-neutral-500" />
                          <span>Settings</span>
                        </Link>
                      </div>

                      <div className="pt-1 border-t border-neutral-100 dark:border-[#1e2a3a]">
                        <form action={logoutAction}>
                          <button
                            type="submit"
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer text-left"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 active:bg-primary-800 shadow-2xs hover:shadow-xs active:scale-[0.98] transition-all duration-150"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile actions: ThemeToggle + hamburger */}
          <div className="flex items-center gap-1.5 md:hidden">
            <ThemeToggle />
            <button
              className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-[#0f141c] border-t border-neutral-100 dark:border-neutral-800 px-4 pb-4 pt-2 shadow-lg">
          {/* Authenticated user mobile banner */}
          {userProfile && (
            <div className="p-3 mb-2 rounded-xl bg-neutral-50 dark:bg-[#131924] border border-neutral-200 dark:border-[#222b3d] flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                {userProfile.avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={userProfile.avatarUrl}
                    alt={userProfile.fullName}
                    className="w-9 h-9 rounded-full object-cover shrink-0 border border-neutral-200 dark:border-neutral-700"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-950/80 text-primary-700 dark:text-primary-300 font-bold text-xs flex items-center justify-center shrink-0 border border-primary-200 dark:border-primary-800">
                    {getInitials(userProfile.fullName || 'User')}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                    {userProfile.fullName}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
                    {roleLabel} {userProfile.societyName ? `· ${userProfile.societyName}` : ''}
                  </p>
                </div>
              </div>
            </div>
          )}

          <nav className="flex flex-col gap-1">
            {/* Homepage section links */}
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 px-4 pt-2 pb-1">
              On this page
            </p>
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="min-h-[44px] flex items-center px-4 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-200 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {/* Explore section */}
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 px-4 pt-3 pb-1">
              Explore
            </p>
            {exploreLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="min-h-[44px] flex items-center px-4 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-200 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex flex-col gap-2">
            {userProfile ? (
              <>
                <Link
                  href={dashboardHref}
                  onClick={() => setMobileOpen(false)}
                  className="min-h-[44px] flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 active:bg-primary-800 shadow-2xs active:scale-[0.98] transition-all duration-150"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to Dashboard</span>
                </Link>
                <form action={logoutAction} className="w-full">
                  <button
                    type="submit"
                    className="min-h-[44px] flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 active:scale-[0.98] transition-all duration-150 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="min-h-[44px] flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-200 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 active:scale-[0.98] transition-colors transition-transform duration-150"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="min-h-[44px] flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 active:bg-primary-800 shadow-2xs active:scale-[0.98] transition-colors transition-transform transition-shadow duration-150"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
