'use client';

import { cn } from '@/lib/utils';
import React from 'react';

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 border border-primary-600 shadow-2xs hover:shadow-xs active:shadow-none',
  outline:
    'bg-white dark:bg-[#131924] text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 active:bg-neutral-100 dark:active:bg-neutral-700 border border-neutral-200 dark:border-[#222b3d]',
  ghost:
    'bg-transparent text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:bg-neutral-200 dark:active:bg-neutral-700 border border-transparent',
  destructive:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 border border-red-600 shadow-2xs hover:shadow-xs active:shadow-none',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'min-h-[36px] px-3 py-1.5 text-xs rounded-lg',
  md: 'min-h-[44px] px-4 py-2 text-sm rounded-lg',
  lg: 'min-h-[48px] px-5 py-2.5 text-sm rounded-xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-colors transition-transform duration-150 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {loading && (
        <svg
          className="h-3.5 w-3.5 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
