'use client';

import { cn } from '@/lib/utils';
import { ChangeEvent } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  required?: boolean;
  name?: string;
  id?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function Select({
  label,
  options,
  value,
  onChange,
  error,
  required = false,
  name,
  id,
  disabled = false,
  placeholder,
  className,
}: SelectProps) {
  const selectId = id ?? name;

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : undefined}
          className={cn(
            'w-full appearance-none rounded-lg border bg-white dark:bg-[#1a2232] text-sm text-neutral-900 dark:text-neutral-100',
            'py-2 pl-3 pr-8',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            error
              ? 'border-red-400 dark:border-red-500 focus:ring-red-400 focus:border-red-400'
              : 'border-neutral-300 dark:border-[#2a3547]',
            disabled && 'bg-neutral-50 dark:bg-neutral-800/60 text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
          )}
        >
          {placeholder && (
            <option value="" disabled className="bg-white dark:bg-[#1a2232] text-neutral-500">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#1a2232] text-neutral-900 dark:text-neutral-100">
              {opt.label}
            </option>
          ))}
        </select>

        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-neutral-400 dark:text-neutral-500">
          <svg
            className="w-4 h-4"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>

      {error && (
        <p
          id={`${selectId}-error`}
          role="alert"
          className="mt-1 text-xs text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}
