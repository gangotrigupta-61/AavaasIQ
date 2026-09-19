'use client';

import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

interface ThemeToggleProps {
  className?: string;
  variant?: 'compact' | 'pill';
}

export function ThemeToggle({ className, variant = 'compact' }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const mounted = useMounted();

  // Avoid hydration mismatch by rendering a neutral placeholder until mounted
  if (!mounted) {
    return (
      <div
        className={cn(
          'w-9 h-9 rounded-lg border border-transparent p-2',
          className
        )}
        aria-hidden="true"
      />
    );
  }

  const isDark = resolvedTheme === 'dark';

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer',
          isDark
            ? 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700'
            : 'bg-neutral-100 border-neutral-200 text-neutral-700 hover:bg-neutral-200',
          className
        )}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDark ? (
          <>
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Light</span>
          </>
        ) : (
          <>
            <Moon className="w-3.5 h-3.5 text-neutral-600" />
            <span>Dark</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'relative p-2 rounded-lg transition-colors cursor-pointer border',
        isDark
          ? 'bg-neutral-800/80 hover:bg-neutral-700 border-neutral-700 text-amber-400'
          : 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-600',
        className
      )}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform duration-200 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-200 -rotate-12 hover:rotate-0" />
      )}
    </button>
  );
}
