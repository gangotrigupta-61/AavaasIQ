import { Complaint } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { formatRelativeTime } from '@/lib/utils';
import Link from 'next/link';

interface ComplaintsListProps {
  complaints: Complaint[];
  showViewAll?: boolean;
  viewAllHref?: string;
}

const statusVariant: Record<string, 'error' | 'warning' | 'success' | 'neutral'> = {
  open: 'error',
  in_progress: 'warning',
  resolved: 'success',
  closed: 'neutral',
};

const statusLabel: Record<string, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

export default function ComplaintsList({
  complaints,
  showViewAll = true,
  viewAllHref = '/resident/complaints',
}: ComplaintsListProps) {
  if (complaints.length === 0) {
    return (
      <div className="py-10 text-center text-neutral-400 dark:text-neutral-500 text-sm">
        No complaints found.
      </div>
    );
  }

  return (
    <div>
      <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
        {complaints.map((c) => (
          <div key={c.id} className="flex items-start justify-between py-3.5 gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">{c.title}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">{c.category} · {formatRelativeTime(c.createdAt)}</p>
            </div>
            <div className="shrink-0">
              <Badge variant={statusVariant[c.status]} size="sm">
                {statusLabel[c.status]}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {showViewAll && (
        <Link
          href={viewAllHref}
          className="mt-3 inline-flex items-center text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
        >
          View all complaints →
        </Link>
      )}
    </div>
  );
}
