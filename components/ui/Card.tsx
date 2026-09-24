import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: CardPadding;
  hover?: boolean;
}

const paddingClasses: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  children,
  className,
  padding = 'md',
  hover = false,
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-[#131924] rounded-xl border border-neutral-200 dark:border-[#222b3d] shadow-sm text-neutral-900 dark:text-neutral-100 transition-colors duration-200',
        paddingClasses[padding],
        hover && 'hover:shadow-md hover:-translate-y-0.5 transition-shadow transition-transform duration-200',
        className
      )}
    >
      {children}
    </div>
  );
}
