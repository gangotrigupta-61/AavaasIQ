import { cn } from '@/lib/utils';

type Status = 'online' | 'offline' | 'busy' | 'away';

interface StatusIndicatorProps {
  status: Status;
  label?: boolean;
  className?: string;
}

const statusConfig: Record<Status, { dot: string; text: string; label: string }> = {
  online: {
    dot: 'bg-green-500',
    text: 'text-green-700 dark:text-green-400',
    label: 'Online',
  },
  offline: {
    dot: 'bg-neutral-400',
    text: 'text-neutral-500 dark:text-neutral-400',
    label: 'Offline',
  },
  busy: {
    dot: 'bg-red-500',
    text: 'text-red-700 dark:text-red-400',
    label: 'Busy',
  },
  away: {
    dot: 'bg-amber-400',
    text: 'text-amber-700 dark:text-amber-400',
    label: 'Away',
  },
};

export function StatusIndicator({
  status,
  label = false,
  className,
}: StatusIndicatorProps) {
  const config = statusConfig[status];

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span
        aria-hidden="true"
        className={cn('w-2 h-2 rounded-full shrink-0', config.dot)}
      />
      {label && (
        <span className={cn('text-xs font-medium', config.text)}>
          {config.label}
        </span>
      )}
      <span className="sr-only">{config.label}</span>
    </span>
  );
}
