import { cn } from '@/lib/utils';
import type { ActivityItem } from '@/lib/types';

interface ActivityFeedProps {
  items: ActivityItem[];
}

const typeConfig: Record<
  ActivityItem['type'],
  { dot: string; label: string }
> = {
  visitor:   { dot: 'bg-blue-500',    label: 'Visitor' },
  delivery:  { dot: 'bg-green-500',   label: 'Delivery' },
  complaint: { dot: 'bg-red-500',     label: 'Complaint' },
  notice:    { dot: 'bg-amber-500',   label: 'Notice' },
  payment:   { dot: 'bg-purple-500',  label: 'Payment' },
  event:     { dot: 'bg-primary-500', label: 'Event' },
};

export function ActivityFeed({ items }: ActivityFeedProps) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-neutral-400 dark:text-neutral-500">
        No recent activity.
      </p>
    );
  }

  return (
    <ul className="space-y-0">
      {items.map((item, index) => {
        const config = typeConfig[item.type];
        const isLast = index === items.length - 1;
        return (
          <li key={item.id} className="flex gap-3">
            {/* Timeline column */}
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  'mt-1 h-2.5 w-2.5 shrink-0 rounded-full',
                  config.dot,
                )}
              />
              {!isLast && (
                <span className="mt-1 w-px grow bg-neutral-100 dark:bg-neutral-800" />
              )}
            </div>

            {/* Content */}
            <div
              className={cn(
                'flex flex-1 items-start justify-between pb-4',
                isLast && 'pb-0',
              )}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 leading-tight">
                  {item.title}
                </p>
                <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400 leading-snug">
                  {item.description}
                </p>
              </div>
              <span className="ml-4 shrink-0 text-xs text-neutral-400 dark:text-neutral-500 whitespace-nowrap">
                {item.time}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
