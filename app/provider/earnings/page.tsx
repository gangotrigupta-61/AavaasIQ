'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card } from '@/components/ui/Card';
import { IndianRupee, TrendingUp, Star, CheckCircle2, Download, Loader2 } from 'lucide-react';
import { getProviderEarnings, ProviderEarningsData } from '@/app/actions/services';

export default function ProviderEarningsPage() {
  const [data, setData] = useState<ProviderEarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      setLoading(true);
      const res = await getProviderEarnings();
      if (res.data) {
        setData(res.data);
      }
      setLoading(false);
    });
  }, []);

  const thisMonth = data?.thisMonth ?? { amount: 0, jobs: 0 };
  const lastMonth = data?.lastMonth ?? { amount: 0, jobs: 0 };
  const growthPct = data?.growthPct ?? 0;
  const totalJobs = data?.totalJobs ?? 0;
  const totalEarnings = data?.totalEarnings ?? 0;
  const monthlyEarnings = data?.monthlyEarnings ?? [];
  const recentTransactions = data?.recentTransactions ?? [];

  const maxAmount = Math.max(1, ...(monthlyEarnings as Array<{ amount: number }>).map((m) => m.amount));

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Earnings</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Your earnings overview · Verified Service Partner</p>
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          <p className="text-sm">Calculating your earnings...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#131924] rounded-xl border border-neutral-200 dark:border-[#222b3d] p-4">
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1">This Month</p>
              <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">₹{thisMonth.amount.toLocaleString('en-IN')}</p>
              <p className="text-xs text-green-600 dark:text-green-400 font-semibold mt-0.5">+{growthPct}% ↑</p>
            </div>
            <div className="bg-white dark:bg-[#131924] rounded-xl border border-neutral-200 dark:border-[#222b3d] p-4">
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1">Last Month</p>
              <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">₹{lastMonth.amount.toLocaleString('en-IN')}</p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{lastMonth.jobs} jobs</p>
            </div>
            <div className="bg-white dark:bg-[#131924] rounded-xl border border-neutral-200 dark:border-[#222b3d] p-4">
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1">Total Earnings</p>
              <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                ₹{totalEarnings >= 1000 ? `${(totalEarnings / 1000).toFixed(1)}K` : totalEarnings.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{totalJobs} jobs</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-100 dark:border-amber-900/30 p-4">
              <div className="flex items-center gap-1 mb-1">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Rating</p>
              </div>
              <p className="text-xl font-bold text-amber-700 dark:text-amber-300">{data?.rating ?? 4.8}</p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{data?.reviewCount ?? 128} reviews</p>
            </div>
          </div>

          {/* Monthly Bar Chart */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Monthly Earnings</h3>
              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                +{growthPct}% this month
              </div>
            </div>
            {monthlyEarnings.length === 0 ? (
              <p className="text-center text-sm text-neutral-400 dark:text-neutral-500 py-6">No historical earnings data yet.</p>
            ) : (
              <div className="flex items-end gap-3 h-40">
                {monthlyEarnings.map((m, idx) => {
                  const height = maxAmount > 0 ? Math.round((m.amount / maxAmount) * 100) : 0;
                  const isLatest = idx === monthlyEarnings.length - 1;
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5">
                      <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        ₹{(m.amount / 1000).toFixed(1)}K
                      </span>
                      <div className="w-full flex items-end" style={{ height: '100px' }}>
                        <div
                          className={`w-full rounded-t-lg transition-all ${isLatest ? 'bg-primary-600' : 'bg-primary-200 dark:bg-primary-950/60'}`}
                          style={{ height: `${Math.max(6, height)}%` }}
                        />
                      </div>
                      <span className="text-xs text-neutral-400 dark:text-neutral-500 text-center leading-tight">
                        {m.month.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Recent Transactions */}
          <Card padding="none">
            <div className="px-5 py-4 border-b border-neutral-100 dark:border-[#222b3d] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Recent Completed Jobs</h3>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            </div>
            {recentTransactions.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-neutral-400 dark:text-neutral-500">
                No completed job transactions recorded yet.
              </div>
            ) : (
              <ul className="divide-y divide-neutral-50 dark:divide-[#222b3d]">
                {recentTransactions.map((t) => (
                  <li key={t.id} className="flex items-center justify-between px-5 py-3.5 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-50 dark:bg-green-950/40 rounded-lg flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{t.service}</p>
                        <p className="text-xs text-neutral-400 dark:text-neutral-500">
                          {t.flat} · {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-neutral-900 dark:text-neutral-100">
                      <IndianRupee className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
                      {t.amount.toLocaleString('en-IN')}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {recentTransactions.length > 0 && (
              <div className="px-5 py-3 border-t border-neutral-100 dark:border-[#222b3d] bg-neutral-50 dark:bg-[#1a2232] rounded-b-xl flex justify-between items-center">
                <p className="text-xs text-neutral-400 dark:text-neutral-500">Showing {recentTransactions.length} transactions</p>
                <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Total: ₹{recentTransactions.reduce((s, t) => s + t.amount, 0).toLocaleString('en-IN')}
                </p>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
