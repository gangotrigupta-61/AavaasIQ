import { ActivityItem } from '@/lib/types';

interface ActivityFeedProps {
  items: ActivityItem[];
  title?: string;
}

const typeColor: Record<ActivityItem['type'], string> = {
  visitor: 'bg-blue-500',
  delivery: 'bg-green-500',
  complaint: 'bg-red-500',
  notice: 'bg-amber-500',
  payment: 'bg-purple-500',
  event: 'bg-primary-500',
};

export default function SocietyActivityFeed({ items, title }: ActivityFeedProps) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-neutral-400 dark:text-neutral-500 py-6 text-center">No recent activity.</p>;
  }

  return (
    <div>
      {title && (
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-4">{title}</h3>
      )}
      <div className="space-y-0">
        {items.map((item, idx) => (
          <div key={item.id} className={`flex gap-3 ${idx < items.length - 1 ? 'pb-4' : ''}`}>
            {/* Timeline dot */}
            <div className="flex flex-col items-center pt-1 shrink-0">
              <div className={`w-2 h-2 rounded-full ${typeColor[item.type]}`} />
              {idx < items.length - 1 && (
                <div className="w-px flex-1 bg-neutral-100 dark:bg-neutral-800 mt-1" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pb-0.5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{item.title}</p>
                <span className="text-xs text-neutral-400 dark:text-neutral-500 shrink-0">{item.time}</span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
