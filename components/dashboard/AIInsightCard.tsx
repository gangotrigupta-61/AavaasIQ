'use client';

import { Sparkles } from 'lucide-react';

interface AIInsightCardProps {
  insights?: string[];
  /** Label for the bottom action link. Renders even without onAction. */
  actionLabel?: string;
  onAction?: () => void;
  title?: string;
}

export function AIInsightCard({
  insights = [],
  actionLabel = 'Ask AavaasIQ',
  onAction,
  title = 'AavaasIQ Assistant',
}: AIInsightCardProps) {
  return (
    <div className="bg-primary-50 dark:bg-primary-950/30 rounded-xl border border-primary-100 dark:border-primary-900/50 p-5 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-primary-600 dark:text-primary-400 shrink-0" />
        <span className="text-sm font-semibold text-primary-800 dark:text-primary-200">{title}</span>
      </div>

      {/* Insights list */}
      {insights.length > 0 ? (
        <ul className="space-y-2.5 mb-4">
          {insights.map((insight, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary-400 dark:bg-primary-500 shrink-0" />
              <p className="text-sm text-primary-700 dark:text-primary-300 leading-snug">{insight}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-primary-600 dark:text-primary-400 mb-4">
          No insights available right now.
        </p>
      )}

      {/* Action — always shown when actionLabel provided */}
      <button
        type="button"
        onClick={onAction}
        className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 transition-colors cursor-pointer"
      >
        {actionLabel}
        <span aria-hidden>→</span>
      </button>
    </div>
  );
}
