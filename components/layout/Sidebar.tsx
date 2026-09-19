'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, X, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';

export interface NavItem {
  label: string;
  href: string;
  iconName: string;
  badge?: number;
}

interface SidebarProps {
  navItems: NavItem[];
  bottomItems?: NavItem[];
  role: string;
  userName: string;
  userFlat?: string;
  societyName?: string;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

function NavIcon({ name, className }: { name: string; className?: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Icon = (LucideIcons as any)[name];
  if (!Icon) return null;
  return <Icon className={cn('w-4 h-4 shrink-0', className)} />;
}

function SidebarContent({
  navItems,
  bottomItems,
  role,
  userName,
  userFlat,
  societyName,
  onClose,
}: Omit<SidebarProps, 'isMobileOpen' | 'onMobileClose'> & { onClose?: () => void }) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    if (onClose) onClose();
    startTransition(() => logoutAction());
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0f141c] text-neutral-800 dark:text-neutral-100">
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base text-neutral-900 dark:text-neutral-100 tracking-tight">AavaasIQ</span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* User / Society info */}
      <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
        <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">{userName}</p>
        {userFlat && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{userFlat}</p>
        )}
        {societyName && (
          <p className="text-xs text-neutral-400 dark:text-neutral-500 truncate mt-0.5">{societyName}</p>
        )}
        <span className="inline-flex mt-1.5 items-center px-1.5 py-0.5 rounded text-xs bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-medium capitalize">
          {role}
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative',
                isActive
                  ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 border-r-2 border-primary-600'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-neutral-100'
              )}
            >
              <NavIcon name={item.iconName} className={isActive ? 'text-primary-600 dark:text-primary-400' : ''} />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-semibold">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom items */}
      {bottomItems && bottomItems.length > 0 && (
        <div className="border-t border-neutral-100 dark:border-neutral-800 px-2 py-3 space-y-0.5 shrink-0">
          {bottomItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 font-semibold border-r-2 border-primary-600'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-neutral-100'
                )}
              >
                <NavIcon name={item.iconName} className={isActive ? 'text-primary-600 dark:text-primary-400' : ''} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isPending}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>{isPending ? 'Signing out…' : 'Sign Out'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function Sidebar(props: SidebarProps) {
  const { isMobileOpen, onMobileClose, ...contentProps } = props;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-60 bg-white dark:bg-[#0f141c] border-r border-neutral-200 dark:border-neutral-800 z-40 transition-colors">
        <SidebarContent {...contentProps} />
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          {/* Drawer */}
          <aside className="relative w-72 max-w-[85vw] bg-white dark:bg-[#0f141c] h-full shadow-xl">
            <SidebarContent {...contentProps} onClose={onMobileClose} />
          </aside>
        </div>
      )}
    </>
  );
}
