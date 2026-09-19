import { Complaint } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ComplaintOverviewProps {
  complaints: Complaint[];
}

interface StatusRow {
  label: string;
  key: Complaint['status'];
  color: string;
  bg: string;
}

const STATUS_ROWS: StatusRow[] = [
  { label: 'Open', key: 'open', color: 'bg-red-500', bg: 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300' },
  { label: 'In Progress', key: 'in_progress', color: 'bg-amber-500', bg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300' },
  { label: 'Resolved', key: 'resolved', color: 'bg-green-500', bg: 'bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300' },
];

export default function ComplaintOverview({ complaints }: ComplaintOverviewProps) {
  const total = complaints.length;

  const counts: Record<Complaint['status'], number> = {
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
  };

  for (const c of complaints) {
    counts[c.status] = (counts[c.status] ?? 0) + 1;
  }

  return (
    <div className="space-y-4">
      {STATUS_ROWS.map(({ label, key, color, bg }) => {
        const count = counts[key];
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</span>
              <div className="flex items-center gap-2">
                <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', bg)}>
                  {count}
                </span>
                <span className="text-xs text-neutral-400 dark:text-neutral-500">{pct}%</span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-500', color)}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}

      <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 pt-3 border-t border-neutral-100 dark:border-neutral-800">
        Total: <span className="font-semibold text-neutral-700 dark:text-neutral-200">{total}</span> complaints this month
      </p>
    </div>
  );
}
