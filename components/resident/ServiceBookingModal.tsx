'use client';

import { useState, useTransition } from 'react';
import { ServiceProvider } from '@/lib/types';
import { createServiceBooking } from '@/app/actions/services';
import { useToast } from '@/components/ui/Toast';
import { X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ServiceBookingModalProps {
  provider: ServiceProvider | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ServiceBookingModal({
  provider,
  isOpen,
  onClose,
  onSuccess,
}: ServiceBookingModalProps) {
  const [serviceTitle, setServiceTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  if (!isOpen || !provider) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!provider) return;
    const currentProvider = provider;
    if (!serviceTitle.trim()) {
      showToast('Please specify the service needed.', 'error');
      return;
    }
    if (!date) {
      showToast('Please select a preferred date.', 'error');
      return;
    }

    const scheduledAt = new Date(`${date}T${time}:00`).toISOString();

    startTransition(async () => {
      const res = await createServiceBooking({
        providerId: currentProvider.id,
        serviceTitle: serviceTitle.trim(),
        scheduledAt,
        amount: currentProvider.startingPrice,
        description: notes.trim() || undefined,
      });

      if (res.error) {
        showToast(res.error, 'error');
        return;
      }

      showToast('Service request submitted successfully!', 'success');
      onSuccess?.();
      onClose();
    });
  }

  // Minimum date is tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white dark:bg-[#131924] rounded-2xl shadow-xl border border-neutral-100 dark:border-[#222b3d] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40">
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Book Home Service</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {provider.name} · {provider.category}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide mb-1.5">
              Service / Issue Needed
            </label>
            <input
              type="text"
              required
              placeholder={`e.g. ${provider.category === 'Plumbing' ? 'Pipe Leak Repair' : 'General Maintenance'}`}
              value={serviceTitle}
              onChange={(e) => setServiceTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide mb-1.5">
                Preferred Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  min={minDateStr}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-neutral-900 dark:text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide mb-1.5">
                Time Slot
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-neutral-200 dark:border-[#2a3547] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 bg-white dark:bg-[#1a2232] text-neutral-900 dark:text-neutral-100"
              >
                <option value="09:00">09:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="11:30">11:30 AM</option>
                <option value="14:00">02:00 PM</option>
                <option value="16:00">04:00 PM</option>
                <option value="18:00">06:00 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide mb-1.5">
              Specific Notes / Instructions (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Describe the problem, location inside flat, or special instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition resize-none"
            />
          </div>

          {/* Pricing indicator */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-primary-50/60 dark:bg-primary-950/40 border border-primary-100/80 dark:border-primary-900/60 text-xs">
            <span className="text-neutral-600 dark:text-neutral-300 font-medium">Estimated Starting Fee</span>
            <span className="text-primary-700 dark:text-primary-300 font-bold text-sm">
              {formatCurrency(provider.startingPrice)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-semibold text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isPending ? 'Submitting...' : 'Confirm Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
