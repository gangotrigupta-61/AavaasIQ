'use client';

import { useState, useEffect } from 'react';
import { MaintenanceBill } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { getMyMaintenance, simulateMaintenancePayment } from '@/app/actions/maintenance';
import { CheckCircle2, IndianRupee, Calendar, CreditCard, Download, AlertTriangle, RefreshCw } from 'lucide-react';

const statusConfig = {
  paid:    { label: 'Paid',    variant: 'success' as const },
  pending: { label: 'Pending', variant: 'warning' as const },
  overdue: { label: 'Overdue', variant: 'error' as const },
};

export default function ResidentMaintenancePage() {
  const [bills, setBills] = useState<MaintenanceBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [paid, setPaid] = useState(false);
  const [paying, setPaying] = useState(false);
  const [txnId, setTxnId] = useState('');

  const { showToast } = useToast();

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setErrorMsg(null);
      const res = await getMyMaintenance();
      if (!mounted) return;

      if (res.error) {
        setErrorMsg(res.error);
        setBills([]);
      } else {
        setBills(res.bills || []);
      }
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, []);

  const pendingBill = bills.find((b) => b.status === 'pending' || b.status === 'overdue');

  async function handlePay() {
    if (!pendingBill) return;
    setPaying(true);

    const res = await simulateMaintenancePayment(pendingBill.id);
    setPaying(false);

    if (res.error) {
      showToast(res.error, 'error');
      return;
    }

    if (res.paymentReference) {
      setTxnId(res.paymentReference);
      setPaid(true);
      showToast(`Payment of ₹${pendingBill.amount.toLocaleString('en-IN')} recorded successfully!`, 'success');

      // Update the bill in state
      setBills((prev) =>
        prev.map((b) =>
          b.id === pendingBill.id
            ? {
                ...b,
                status: 'paid',
                paidDate: res.paidAt || new Date().toISOString(),
                paymentReference: res.paymentReference,
              }
            : b
        )
      );
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Maintenance Billing</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">View and pay your society maintenance charges.</p>
      </div>

      {/* Error state */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-sm text-red-700 dark:text-red-400">
          <p className="font-semibold">Unable to load maintenance records</p>
          <p className="text-xs mt-0.5">{errorMsg}</p>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <Card padding="md">
          <div className="py-8 flex flex-col items-center justify-center gap-2 text-neutral-400">
            <RefreshCw className="w-5 h-5 animate-spin text-primary-600" />
            <p className="text-sm">Loading billing records...</p>
          </div>
        </Card>
      ) : (
        <>
          {/* Pending Payment Card */}
          {pendingBill && !paid && (
            <Card padding="md">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/40 rounded-xl flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">₹{pendingBill.amount.toLocaleString('en-IN')}</h3>
                    <Badge variant={pendingBill.status === 'overdue' ? 'error' : 'warning'} size="sm">
                      {pendingBill.status === 'overdue' ? 'Overdue' : 'Pending'}
                    </Badge>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">{pendingBill.month} · Green Valley Residency</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Due by {new Date(pendingBill.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Breakdown */}
              <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-[#222b3d] space-y-2">
                <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">Breakdown</p>
                {[
                  { label: 'Maintenance Charges', amount: Math.round(pendingBill.amount * 0.75) },
                  { label: 'Water Charges',        amount: Math.round(pendingBill.amount * 0.125) },
                  { label: 'Housekeeping',          amount: Math.round(pendingBill.amount * 0.083) },
                  { label: 'Sinking Fund',          amount: Math.max(0, pendingBill.amount - Math.round(pendingBill.amount * 0.75) - Math.round(pendingBill.amount * 0.125) - Math.round(pendingBill.amount * 0.083)) },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-300">{item.label}</span>
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">₹{item.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm pt-2 border-t border-neutral-100 dark:border-[#222b3d] font-bold">
                  <span className="text-neutral-900 dark:text-neutral-100">Total</span>
                  <span className="text-neutral-900 dark:text-neutral-100">₹{pendingBill.amount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={handlePay}
                disabled={paying}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                {paying ? 'Processing...' : `Pay ₹${pendingBill.amount.toLocaleString('en-IN')} Now`}
              </button>
              <p className="text-center text-xs text-neutral-400 dark:text-neutral-500 mt-2">Payments are simulated — records are updated in Supabase without third-party gateways.</p>
            </Card>
          )}

          {/* Payment Success */}
          {paid && (
            <Card padding="md">
              <div className="flex flex-col items-center py-6 text-center">
                <div className="w-14 h-14 bg-green-50 dark:bg-green-950/40 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-7 h-7 text-green-500" />
                </div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Payment Successful!</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Payment has been recorded in Supabase.</p>
                <p className="text-xs text-neutral-400 mt-0.5">Reference: {txnId}</p>
              </div>
            </Card>
          )}

          {/* No pending bill message */}
          {!pendingBill && !paid && (
            <Card padding="md">
              <div className="flex items-center gap-3 py-2">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                <div>
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">All dues cleared</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">You have no pending maintenance payments.</p>
                </div>
              </div>
            </Card>
          )}

          {/* Payment History */}
          <Card padding="none">
            <div className="px-5 py-4 border-b border-neutral-100 dark:border-[#222b3d] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Payment History</h3>
              <span className="text-xs text-neutral-400">Green Valley Residency</span>
            </div>
            {bills.length === 0 ? (
              <div className="py-8 text-center text-sm text-neutral-400">
                No billing history recorded yet.
              </div>
            ) : (
              <ul className="divide-y divide-neutral-50 dark:divide-[#222b3d]">
                {bills.map((bill) => {
                  const sc = statusConfig[bill.status] || statusConfig.pending;
                  return (
                    <li key={bill.id} className="flex items-center justify-between px-5 py-4 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-neutral-50 dark:bg-[#1a2232] rounded-lg flex items-center justify-center shrink-0">
                          <IndianRupee className="w-4 h-4 text-neutral-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{bill.month}</p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                            Due: {new Date(bill.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            {bill.paidDate && (
                              <span className="text-green-600 dark:text-green-400 ml-2">
                                · Paid {new Date(bill.paidDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </span>
                            )}
                            {bill.paymentReference && (
                              <span className="text-neutral-400 ml-2 font-mono text-[10px]">
                                · Ref: {bill.paymentReference}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">₹{bill.amount.toLocaleString('en-IN')}</span>
                        <Badge variant={sc.variant} size="sm">{sc.label}</Badge>
                        {bill.status === 'paid' && (
                          <button className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors" title="Download receipt">
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </>
      )}

      {/* Info */}
      <p className="text-xs text-neutral-400 text-center pb-2">
        For billing disputes, contact the society office or write to accounts@greenvalley.in
      </p>
    </div>
  );
}
