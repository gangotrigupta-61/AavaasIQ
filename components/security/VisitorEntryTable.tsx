import { Visitor } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';

interface VisitorEntryTableProps {
  visitors: Visitor[];
}

const statusVariant: Record<string, 'info' | 'warning' | 'success' | 'neutral' | 'error'> = {
  expected: 'info',
  approved: 'warning',
  inside: 'success',
  exited: 'neutral',
  rejected: 'error',
};

const statusLabel: Record<string, string> = {
  expected: 'Expected',
  approved: 'Approved',
  inside: 'Inside',
  exited: 'Exited',
  rejected: 'Rejected',
};

const purposeLabel = {
  delivery: 'Delivery',
  guest: 'Guest',
  service: 'Service',
  cab: 'Cab',
  other: 'Other',
} as const;

function formatTime(isoString?: string) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function VisitorEntryTable({ visitors }: VisitorEntryTableProps) {
  if (visitors.length === 0) {
    return (
      <div className="py-10 text-center text-neutral-400 dark:text-neutral-500 text-sm">No visitor entries today.</div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 dark:border-neutral-800">
              <th className="pb-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Name</th>
              <th className="pb-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Flat</th>
              <th className="pb-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Purpose</th>
              <th className="pb-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Time</th>
              <th className="pb-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Status</th>
              <th className="pb-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800/60">
            {visitors.map((v) => (
              <tr key={v.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                <td className="py-3.5 font-medium text-neutral-900 dark:text-neutral-100">{v.name}</td>
                <td className="py-3.5 text-neutral-600 dark:text-neutral-300">{v.flatNo}</td>
                <td className="py-3.5 text-neutral-500 dark:text-neutral-400">{purposeLabel[v.purpose]}</td>
                <td className="py-3.5 text-neutral-500 dark:text-neutral-400">
                  {v.arrivedAt ? formatTime(v.arrivedAt) : v.expectedAt ? formatTime(v.expectedAt) : '—'}
                </td>
                <td className="py-3.5">
                  <Badge variant={statusVariant[v.status]} size="sm">
                    {statusLabel[v.status]}
                  </Badge>
                </td>
                <td className="py-3.5">
                  {v.status === 'inside' && (
                    <button className="text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-200 dark:border-red-800/80 rounded-lg px-2.5 py-1 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer">
                      Mark Exit
                    </button>
                  )}
                  {v.status === 'expected' && (
                    <button className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 border border-primary-200 dark:border-primary-800/80 rounded-lg px-2.5 py-1 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors cursor-pointer">
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {visitors.map((v) => (
          <div key={v.id} className="bg-neutral-50 dark:bg-[#131924] border border-transparent dark:border-[#222b3d] rounded-xl p-4 flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{v.name}</p>
                <Badge variant={statusVariant[v.status]} size="sm">{statusLabel[v.status]}</Badge>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {v.flatNo} · {purposeLabel[v.purpose]} ·{' '}
                {v.arrivedAt ? formatTime(v.arrivedAt) : v.expectedAt ? formatTime(v.expectedAt) : '—'}
              </p>
            </div>
            {v.status === 'inside' && (
              <button className="text-xs font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/80 rounded-lg px-2.5 py-1 shrink-0 cursor-pointer">
                Exit
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
