'use client';

import { cn } from '@/lib/utils';
import { ChangeEvent, ReactNode } from 'react';

interface InputProps {
  label?: string;
  placeholder?: string;
  error?: string;
  type?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  icon?: ReactNode;
  required?: boolean;
  name?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
}

export function Input({
  label,
  placeholder,
  error,
  type = 'text',
  value,
  onChange,
  icon,
  required = false,
  name,
  id,
  disabled = false,
  className,
}: InputProps) {
  const inputId = id ?? name;

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-400 dark:text-neutral-500">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn(
            'w-full rounded-lg border bg-white dark:bg-[#1a2232] text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500',
            'py-2 pr-3',
            icon ? 'pl-9' : 'pl-3',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            error
              ? 'border-red-400 dark:border-red-500 focus:ring-red-400 focus:border-red-400'
              : 'border-neutral-300 dark:border-[#2a3547]',
            disabled && 'bg-neutral-50 dark:bg-neutral-800/60 text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
          )}
        />
      </div>

      {error && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="mt-1 text-xs text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}
