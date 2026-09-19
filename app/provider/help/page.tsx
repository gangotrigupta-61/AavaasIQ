'use client';

import { useState } from 'react';
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Phone,
  Send,
  Download,
  BookOpen,
  FileText,
  AlertCircle,
  CheckCircle2,
  Wrench,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

interface ProviderFAQ {
  id: string;
  category: 'bookings' | 'payments' | 'gate' | 'cancellations' | 'ratings';
  question: string;
  answer: string;
}

const PROVIDER_FAQS: ProviderFAQ[] = [
  {
    id: 'pf-1',
    category: 'bookings',
    question: 'How do I receive and accept service booking requests from residents?',
    answer:
      'Navigate to "New Requests" from the sidebar. Incoming bookings display the requested service, resident flat number, requested time slot, and standard visiting fee. Click "Accept Request" within 15 minutes to secure the job and notify the resident.',
  },
  {
    id: 'pf-2',
    category: 'bookings',
    question: 'How do standard visiting charges and spare material costs work?',
    answer:
      'The base visiting/inspection fee is fixed according to your profile rate card. For replacement parts or additional materials (e.g. MCB switch, PVC pipe, AC gas refill), provide an itemized written estimate to the resident before commencing work.',
  },
  {
    id: 'pf-3',
    category: 'payments',
    question: 'When and how do I receive payment for completed jobs?',
    answer:
      'Residents can pay you directly upon completion via UPI QR code or cash. If booked through platform escrow, funds are reconciled and settled directly into your linked bank account every Tuesday without deduction of hidden fees.',
  },
  {
    id: 'pf-4',
    category: 'payments',
    question: 'How do I download weekly earnings statements and GST tax summaries?',
    answer:
      'Go to the "Earnings" tab from your sidebar. You can view total completed jobs, gross collections, and platform credits. Click "Download Payout Statement" to export a PDF receipt for your personal tax filing.',
  },
  {
    id: 'pf-5',
    category: 'gate',
    question: 'How do I get seamless gate entry into societies without phone verification?',
    answer:
      'Whenever you have a confirmed booking, your AavaasIQ app generates an active Service Partner Gate Pass containing a 4-digit verification code. Show this pass at Gate 1 security to gain instant entry without guard intercom calls.',
  },
  {
    id: 'pf-6',
    category: 'cancellations',
    question: 'What happens if a resident is not home or cancels at the last moment?',
    answer:
      'If a resident cancels less than 2 hours before the scheduled appointment or is unavailable after 15 minutes of your arrival at the door, submit an "Inconvenience Claim" below. A standard ₹150 visiting compensation fee is credited to your balance.',
  },
  {
    id: 'pf-7',
    category: 'ratings',
    question: 'How are customer ratings calculated and how do they impact my bookings?',
    answer:
      'After job completion, residents rate the service between 1 and 5 stars. Maintaining an average rating of 4.6 or higher grants you the "Verified Pro" badge and ranks your profile at the top of the resident home services marketplace.',
  },
  {
    id: 'pf-8',
    category: 'ratings',
    question: 'What is the policy for customer disputes or warranty claims?',
    answer:
      'All certified service partners provide a 7-day workmanship satisfaction warranty on labor. If a resident reports an unresolved leak or recurring electrical fault within 7 days, partner operations will contact you to arrange a complimentary follow-up inspection.',
  },
];

const CATEGORIES = [
  { label: 'All Topics', value: 'all' },
  { label: 'Bookings & Jobs', value: 'bookings' },
  { label: 'Pricing & Payouts', value: 'payments' },
  { label: 'Gate Clearance', value: 'gate' },
  { label: 'Cancellations', value: 'cancellations' },
  { label: 'Ratings & Policies', value: 'ratings' },
];

export default function ProviderHelpPage() {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>('pf-1');

  // Support ticket form state
  const [ticketCategory, setTicketCategory] = useState('Booking Schedule / Resident Contact');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketPriority, setTicketPriority] = useState('normal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);

  const filteredFaqs = PROVIDER_FAQS.filter((faq) => {
    const matchesCat = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  function handleTicketSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      showToast('Please fill out both subject and description.', 'error');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setTicketSuccess(true);
      showToast('Partner support ticket #PRV-7215 submitted to operations.', 'success');
      setTicketSubject('');
      setTicketMessage('');
    }, 600);
  }

  function handleDownloadResource(docName: string) {
    showToast(`Downloading "${docName}"...`, 'info');
  }

  return (
    <div className="space-y-8 max-w-7xl pb-12">
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-primary-700 via-primary-600 to-primary-800 text-white p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-primary-100 text-xs font-semibold backdrop-blur-sm mb-3">
            <Wrench className="w-3.5 h-3.5" />
            Partner Support Desk
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Service Partner Support &amp; Guidelines
          </h2>
          <p className="text-primary-100 text-sm sm:text-base mt-2 leading-relaxed">
            Booking management workflows, payment reconciliation, gate fast-pass clearance, and partner dispute escalation.
          </p>

          {/* Search bar */}
          <div className="mt-5 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search partner guides (e.g. payout schedule, gate pass, inconvenience fee)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-[#131924] border border-transparent dark:border-[#222b3d] text-neutral-900 dark:text-neutral-100 text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-300 shadow-md transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Direct Desk Contacts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#131924] p-5 rounded-xl border border-neutral-200 dark:border-[#222b3d] shadow-2xs flex flex-col justify-between transition-colors">
          <div>
            <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-3">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Partner Operations Helpline</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Booking Support &amp; Onboarding</p>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-1">
            <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Phone: +91 80 4567 8910</p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Available: Mon – Sun, 8:00 AM – 9:00 PM</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#131924] p-5 rounded-xl border border-neutral-200 dark:border-[#222b3d] shadow-2xs flex flex-col justify-between transition-colors">
          <div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Gate 1 Security Clearance</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Physical Gate Entry &amp; Barrier Check</p>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-1">
            <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Intercom: Ext. 101</p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Gate 1 Duty Terminal (24/7)</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#131924] p-5 rounded-xl border border-neutral-200 dark:border-[#222b3d] shadow-2xs flex flex-col justify-between transition-colors">
          <div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Settlements &amp; UPI Desk</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Bank Payouts &amp; Disputed Invoices</p>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-1">
            <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">settlements@aavaasiq.in</p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Weekly Payout Cycles: Every Tuesday</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid: FAQs (Left) + Submit Ticket (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: FAQs (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              Frequently Asked Partner Questions
            </h3>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">{filteredFaqs.length} answers</span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer',
                  activeCategory === cat.value
                    ? 'bg-primary-600 text-white border-primary-600 shadow-2xs'
                    : 'bg-white dark:bg-[#131924] border-neutral-200 dark:border-[#222b3d] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#182130]'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* FAQ Accordion List */}
          <div className="space-y-3">
            {filteredFaqs.length === 0 ? (
              <div className="bg-white dark:bg-[#131924] rounded-xl p-8 text-center border border-neutral-200 dark:border-[#222b3d]">
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">No answers matched your search.</p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">Try another keyword or submit an inquiry to partner operations.</p>
              </div>
            ) : (
              filteredFaqs.map((faq) => {
                const isOpen = expandedId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className={cn(
                      'rounded-xl border bg-white dark:bg-[#131924] overflow-hidden transition-all duration-200 shadow-2xs',
                      isOpen ? 'border-primary-300 dark:border-primary-700 ring-1 ring-primary-100 dark:ring-primary-900/60' : 'border-neutral-200 dark:border-[#222b3d]'
                    )}
                  >
                    <button
                      onClick={() => setExpandedId(isOpen ? null : faq.id)}
                      className="w-full flex items-center justify-between p-4 text-left font-semibold text-neutral-900 dark:text-neutral-100 text-sm hover:bg-neutral-50/70 dark:hover:bg-[#182130] transition-colors cursor-pointer gap-4"
                    >
                      <span className="flex-1 leading-snug">{faq.question}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-neutral-400 dark:text-neutral-500 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-neutral-600 dark:text-neutral-300 text-xs sm:text-sm leading-relaxed border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/40 dark:bg-[#1a2232]/50">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Helpful Partner Documents & Downloads */}
          <div className="bg-white dark:bg-[#131924] rounded-xl p-5 border border-neutral-200 dark:border-[#222b3d] shadow-2xs space-y-3 transition-colors">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              Service Partner Resources &amp; Guides
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleDownloadResource('AavaasIQ Service Partner Code of Conduct 2026.pdf')}
                className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-[#222b3d] hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50/40 dark:hover:bg-primary-950/30 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0" />
                  <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">Code of Conduct (PDF)</span>
                </div>
                <Download className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => handleDownloadResource('Standard Service Rate Card & Warranty Guide.pdf')}
                className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-[#222b3d] hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50/40 dark:hover:bg-primary-950/30 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0" />
                  <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">Rate Card &amp; Warranty (PDF)</span>
                </div>
                <Download className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 shrink-0" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Support Ticket Form (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#131924] rounded-2xl p-6 border border-neutral-200 dark:border-[#222b3d] shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Raise Partner Inquiry</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Assistance with payouts, gate, or jobs</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300">
              Partner Help
            </span>
          </div>

          {ticketSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-950/80 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-base">Inquiry #PRV-7215 Submitted</h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-xs mx-auto">
                Your request has been received by partner operations. Our partner success manager will contact you within 4 hours.
              </p>
              <button
                type="button"
                onClick={() => setTicketSuccess(false)}
                className="mt-3 px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
              >
                Submit another inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleTicketSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Inquiry Category
                </label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-[#2a3547] text-xs text-neutral-800 dark:text-neutral-100 bg-white dark:bg-[#1a2232] focus:outline-none focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 transition"
                >
                  <option value="Booking Schedule / Resident Contact" className="bg-white dark:bg-[#1a2232]">Booking Schedule &amp; Resident Contact</option>
                  <option value="Payment Settlement & Direct UPI" className="bg-white dark:bg-[#1a2232]">Payment Settlement &amp; Bank Transfer</option>
                  <option value="Gate Access / Security Clearance" className="bg-white dark:bg-[#1a2232]">Gate Access &amp; Partner Fast-Pass</option>
                  <option value="Cancellation / Inconvenience Fee" className="bg-white dark:bg-[#1a2232]">Resident Cancellation &amp; Inconvenience Fee</option>
                  <option value="Profile, Trade or Rate Update" className="bg-white dark:bg-[#1a2232]">Profile, Trade Rates &amp; Certification</option>
                  <option value="General Partner Inquiry" className="bg-white dark:bg-[#1a2232]">General Partner Operations Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Priority Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'normal', 'urgent'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setTicketPriority(p)}
                      className={cn(
                        'py-1.5 text-xs font-medium rounded-lg border capitalize transition-colors cursor-pointer',
                        ticketPriority === p
                          ? p === 'urgent'
                            ? 'bg-red-50 dark:bg-red-950/60 border-red-500 text-red-700 dark:text-red-300 font-bold'
                            : 'bg-primary-50 dark:bg-primary-950/60 border-primary-600 text-primary-700 dark:text-primary-300 font-bold'
                          : 'border-neutral-200 dark:border-[#222b3d] text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-[#182130]'
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Subject / Summary <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Booking #BK-302 resident uncontactable upon arrival"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-xs text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Description / Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide booking ID, resident name, flat number, or payment reference details..."
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-xs text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Submitting Inquiry…
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Submit Inquiry to Partner Ops
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2 text-[11px] text-neutral-400 dark:text-neutral-500">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>For urgent gate clearance issues, call the Gate 1 desk on intercom Ext. 101.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
