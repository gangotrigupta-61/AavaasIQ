import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: string; direction: 'up' | 'down' | 'neutral' };
  variant?: 'default' | 'warning' | 'success' | 'error';
  className?: string;
}

const variantConfig = {
  default: {
    iconWrapper: 'bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400',
    value: 'text-neutral-900 dark:text-neutral-100',
  },
  warning: {
    iconWrapper: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
    value: 'text-amber-600 dark:text-amber-400',
  },
  success: {
    iconWrapper: 'bg-green-50 dark:bg-green-950/60 text-green-600 dark:text-green-400',
    value: 'text-neutral-900 dark:text-neutral-100',
  },
  error: {
    iconWrapper: 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400',
    value: 'text-red-600 dark:text-red-400',
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  className,
}: StatCardProps) {
  const config = variantConfig[variant];

  const TrendIcon =
    trend?.direction === 'up'
      ? TrendingUp
      : trend?.direction === 'down'
        ? TrendingDown
        : Minus;

  const trendColor =
    trend?.direction === 'up'
      ? 'text-green-600 dark:text-green-400'
      : trend?.direction === 'down'
        ? 'text-red-600 dark:text-red-400'
        : 'text-neutral-400 dark:text-neutral-500';

  return (
    <div
      className={cn(
        'relative bg-white dark:bg-[#131924] rounded-xl border border-neutral-200 dark:border-[#222b3d] p-5 transition-colors shadow-xs',
        className,
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full',
          config.iconWrapper,
        )}
      >
        <span className="h-4 w-4 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      </div>

      {/* Title */}
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        {title}
      </p>

      {/* Value */}
      <p className={cn('mt-1 text-2xl font-bold', config.value)}>{value}</p>

      {/* Subtitle */}
      {subtitle && (
        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{subtitle}</p>
      )}

      {/* Trend */}
      {trend && (
        <div className={cn('mt-2 flex items-center gap-1', trendColor)}>
          <TrendIcon className="h-3 w-3" />
          <span className="text-xs font-medium">{trend.value}</span>
        </div>
      )}
    </div>
  );
}
