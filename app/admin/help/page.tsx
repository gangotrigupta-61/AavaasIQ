'use client';

import { useState } from 'react';
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  Clock,
  Send,
  Download,
  BookOpen,
  ShieldCheck,
  FileText,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

interface AdminFAQ {
  id: string;
  category: 'residents' | 'billing' | 'complaints' | 'security' | 'broadcasts';
  question: string;
  answer: string;
}

const ADMIN_FAQS: AdminFAQ[] = [
  {
    id: 'af-1',
    category: 'residents',
    question: 'How do I approve or verify new resident signup requests?',
    answer:
      'Navigate to the "Residents" section from the left sidebar. Pending join requests appear with a verification badge. Verify the unit ownership or rental agreement submitted against your society master register, then click "Approve" to grant gate and society portal privileges.',
  },
  {
    id: 'af-2',
    category: 'residents',
    question: 'How do I update flat allocations or deactivate moving residents?',
    answer:
      'Under the "Residents" directory, locate the resident profile and click "Manage". You can reassign flat numbers, add secondary family members, or change membership status to "Inactive" when a tenant vacates. This immediately revokes digital gate entry codes.',
  },
  {
    id: 'af-3',
    category: 'billing',
    question: 'How do I configure monthly maintenance rates and late payment penalties?',
    answer:
      'Go to "Maintenance" -> "Settings & Billing Schedule". You can define flat-rate or square-footage-based billing, set due dates (e.g. 15th or 20th of the month), and specify overdue penalty interest rates. Invoices are generated automatically on the 1st of every month.',
  },
  {
    id: 'af-4',
    category: 'billing',
    question: 'How do I reconcile manual or offline cheque/NEFT payments?',
    answer:
      'When a resident pays through direct bank transfer or society office cheque, navigate to "Maintenance", click "Record Offline Payment", input the transaction reference number and receipt date. The resident\'s ledger updates immediately and an e-receipt is generated.',
  },
  {
    id: 'af-5',
    category: 'complaints',
    question: 'How are complaints assigned to staff and how does SLA tracking work?',
    answer:
      'From the "Complaints" dashboard, click on any open complaint to view photographic evidence and resident notes. Use the "Assign To" dropdown to delegate to the facility supervisor, electrician, or plumbing vendor. Automatic alerts are triggered if not acknowledged within 2 hours.',
  },
  {
    id: 'af-6',
    category: 'security',
    question: 'How do I audit security gate logs and delivery compliance?',
    answer:
      'Open the "Visitors" page to review gate logs in real time. You can filter by gate entry point, visitor category (Guest, Delivery, Cab, Service), and inspect arrival-to-exit timestamps. Any flagged overstay or unapproved entry attempts are marked with an alert badge.',
  },
  {
    id: 'af-7',
    category: 'broadcasts',
    question: 'What is the protocol for issuing emergency announcements vs general notices?',
    answer:
      'Under "Notices", select "Create Notice". For routine society circulars (AGM, maintenance, festivals), select "General" or "Maintenance". For critical disruptions (water outage, lift emergency, fire drill), select "Urgent Broadcast" to send immediate high-priority alerts across all resident portals.',
  },
  {
    id: 'af-8',
    category: 'broadcasts',
    question: 'How do I schedule community events and track resident RSVPs?',
    answer:
      'In the "Notices" module under "Events", click "Add Event". Define event date, venue (e.g. Clubhouse, Amphitheater), and max capacity. Residents can RSVP through their portal, providing the management committee an exact headcount for catering and security arrangements.',
  },
];

const CATEGORIES = [
  { label: 'All Topics', value: 'all' },
  { label: 'Residents & KYC', value: 'residents' },
  { label: 'Billing & Dues', value: 'billing' },
  { label: 'Complaints & SLA', value: 'complaints' },
  { label: 'Gate & Security', value: 'security' },
  { label: 'Notices & Events', value: 'broadcasts' },
];

export default function AdminHelpPage() {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>('af-1');

  // Support ticket form state
  const [ticketCategory, setTicketCategory] = useState('Member Directory & KYC');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketPriority, setTicketPriority] = useState('normal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);

  const filteredFaqs = ADMIN_FAQS.filter((faq) => {
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
      showToast('Admin support ticket #ADM-9104 submitted to platform operations.', 'success');
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
            <ShieldCheck className="w-3.5 h-3.5" />
            Administrator Support Desk
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Society Administration &amp; Operations Support
          </h2>
          <p className="text-primary-100 text-sm sm:text-base mt-2 leading-relaxed">
            Administrative documentation, society management workflows, and direct technical escalation channels for committee leaders.
          </p>

          {/* Search bar */}
          <div className="mt-5 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search administration guides (e.g. KYC approval, billing penalties, notice broadcast)..."
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
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Committee Secretarial Desk</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Management Committee &amp; Legal Liaison</p>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-1">
            <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Intercom: Ext. 100</p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Hours: Mon – Sat, 10:00 AM – 6:00 PM</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#131924] p-5 rounded-xl border border-neutral-200 dark:border-[#222b3d] shadow-2xs flex flex-col justify-between transition-colors">
          <div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Platform Technical Support</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">AavaasIQ Infrastructure &amp; Bug Escalation</p>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-1">
            <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">support@aavaasiq.in</p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Priority SLA: Under 2 Hours</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#131924] p-5 rounded-xl border border-neutral-200 dark:border-[#222b3d] shadow-2xs flex flex-col justify-between transition-colors">
          <div>
            <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Accounts &amp; Financial Audit</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Maintenance Gateway &amp; GST Reconciliation</p>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-1">
            <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">accounts@aavaasiq.in</p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Desk: Clubhouse Suite 2 (Tue &amp; Thu)</p>
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
              Administrative Operational Guides
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
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">Try another keyword or submit an inquiry to platform operations.</p>
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

          {/* Helpful Society Documents & Downloads */}
          <div className="bg-white dark:bg-[#131924] rounded-xl p-5 border border-neutral-200 dark:border-[#222b3d] shadow-2xs space-y-3 transition-colors">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              Administrative Governance Documents
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleDownloadResource('Society Bylaws & Governance Framework 2026.pdf')}
                className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-[#222b3d] hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50/40 dark:hover:bg-primary-950/30 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0" />
                  <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">Society Bye-Laws (PDF)</span>
                </div>
                <Download className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => handleDownloadResource('Maintenance Collection & GST Billing Format.xlsx')}
                className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-[#222b3d] hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50/40 dark:hover:bg-primary-950/30 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0" />
                  <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">Billing Audit Sheet (XLSX)</span>
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
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Raise Administrative Ticket</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Platform operations &amp; database support</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300">
              Admin Support
            </span>
          </div>

          {ticketSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-950/80 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-base">Ticket #ADM-9104 Dispatched</h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-xs mx-auto">
                Your administrative request has been logged. Our technical support engineering team will reach out within 2 hours.
              </p>
              <button
                type="button"
                onClick={() => setTicketSuccess(false)}
                className="mt-3 px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleTicketSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Query Category
                </label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-[#2a3547] text-xs text-neutral-800 dark:text-neutral-100 bg-white dark:bg-[#1a2232] focus:outline-none focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 transition"
                >
                  <option value="Member Directory & KYC" className="bg-white dark:bg-[#1a2232]">Member Directory &amp; KYC Verification</option>
                  <option value="Maintenance & Billing Setup" className="bg-white dark:bg-[#1a2232]">Maintenance Rates &amp; Payment Gateway</option>
                  <option value="Complaint Routing & Staff" className="bg-white dark:bg-[#1a2232]">Complaint Routing &amp; Vendor Staff</option>
                  <option value="Security Console Operations" className="bg-white dark:bg-[#1a2232]">Security Console &amp; Gate Pass Sync</option>
                  <option value="Notices & Broadcasts" className="bg-white dark:bg-[#1a2232]">Notices, Circulars &amp; Events</option>
                  <option value="Database & Export Assistance" className="bg-white dark:bg-[#1a2232]">Financial Audit &amp; Data Export</option>
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
                  placeholder="e.g. Batch import resident directory for Block C"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-xs text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Description / Operational Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide complete context, block/flat numbers, or billing parameters..."
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
                    Submitting Ticket…
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Submit Ticket to Platform Support
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2 text-[11px] text-neutral-400 dark:text-neutral-500">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>For emergency gate outages or database downtime, contact the 24/7 hotline.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
