'use client';

import { formatCurrency } from '@/lib/utils';

interface ServiceRequestCardProps {
  id: string;
  service: string;
  flat: string;
  residentName: string;
  scheduledAt: string;
  amount: number;
  onAccept?: () => void;
  onDecline?: () => void;
}

function formatSchedule(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' · ' +
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function ServiceRequestCard({
  service,
  flat,
  residentName,
  scheduledAt,
  amount,
  onAccept,
  onDecline,
}: ServiceRequestCardProps) {
  return (
    <div className="bg-white dark:bg-[#131924] rounded-xl border border-neutral-200 dark:border-[#222b3d] p-5 shadow-2xs transition-colors">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{service}</p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{flat} · {residentName}</p>
        </div>
        <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100 shrink-0">{formatCurrency(amount)}</span>
      </div>

      <div className="flex items-center gap-2 mb-5">
        <div className="w-2 h-2 rounded-full bg-amber-400" />
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{formatSchedule(scheduledAt)}</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onAccept}
          className="flex-1 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors cursor-pointer"
        >
          Accept
        </button>
        <button
          onClick={onDecline}
          className="flex-1 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
