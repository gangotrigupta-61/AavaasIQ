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
  LifeBuoy,
  FileText,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

interface FAQ {
  id: string;
  category: 'visitors' | 'payments' | 'complaints' | 'events' | 'account';
  question: string;
  answer: string;
}

const FAQS: FAQ[] = [
  {
    id: 'f-1',
    category: 'visitors',
    question: 'How do I pre-approve a guest or delivery?',
    answer:
      'Go to the "Visitors" page from the left sidebar and click "Add Visitor". Enter the guest\'s name and expected arrival time. An entry pass with a 4-digit verification code will be generated. The security guard at Gate 1 will verify this code for instant entry without calling your intercom.',
  },
  {
    id: 'f-2',
    category: 'visitors',
    question: 'What if an unexpected delivery arrives when I am away?',
    answer:
      'The security guard will log the package at Gate 1. You will receive an instant notification in your AavaasIQ app with the delivery parcel ID. You can approve temporary gate holding or collect the parcel later using your flat number.',
  },
  {
    id: 'f-3',
    category: 'payments',
    question: 'How do I pay monthly society maintenance and download receipts?',
    answer:
      'Navigate to "Maintenance" from the sidebar. You can view your current pending bill and click "Pay Now" via UPI, Net Banking, or Debit/Credit card. Once paid, the status immediately marks as Paid and an official GST tax invoice receipt is downloadable instantly.',
  },
  {
    id: 'f-4',
    category: 'payments',
    question: 'What is the late fee policy for maintenance payments?',
    answer:
      'Maintenance bills are generated on the 1st of every month and are due by the 19th. A 2% simple interest penalty is applied to overdue payments after the grace period of 5 days past due date as per society bylaws.',
  },
  {
    id: 'f-5',
    category: 'complaints',
    question: 'How fast will my maintenance or plumbing complaint be attended?',
    answer:
      'Emergency complaints (water leakage, lift stuck, power outage) are acknowledged within 15 minutes and attended within 2 hours. Standard complaints are resolved within 24 to 48 hours by verified society facility personnel.',
  },
  {
    id: 'f-6',
    category: 'complaints',
    question: 'How do I escalate an unresolved complaint?',
    answer:
      'If a complaint is not resolved within the SLA window, click on the complaint card under "My Complaints" and select "Escalate to Committee". An automated high-priority alert is sent directly to the Secretary and Facility Head.',
  },
  {
    id: 'f-7',
    category: 'events',
    question: 'How do I RSVP for society events?',
    answer:
      'Navigate to "Notices" from the sidebar and scroll to "Upcoming Events". You can view all scheduled celebrations, meetings, and community gatherings, and click "RSVP" to confirm your attendance.',
  },
  {
    id: 'f-8',
    category: 'account',
    question: 'How do I add my family members or domestic helper?',
    answer:
      'Navigate to "Settings" -> "Household & Vehicles". You can add family members with their mobile numbers so they can log in to AavaasIQ under your flat. You can also register regular maids, cooks, or drivers for seamless RFID or QR gate passes.',
  },
];

const CATEGORIES = [
  { label: 'All Topics', value: 'all' },
  { label: 'Visitors & Gate', value: 'visitors' },
  { label: 'Payments & Dues', value: 'payments' },
  { label: 'Complaints & SLA', value: 'complaints' },
  { label: 'Notices & Events', value: 'events' },
  { label: 'Account & Family', value: 'account' },
];

export default function ResidentHelpPage() {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>('f-1');

  // Support ticket form state
  const [ticketCategory, setTicketCategory] = useState('Billing & Maintenance');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketPriority, setTicketPriority] = useState('normal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);

  const filteredFaqs = FAQS.filter((faq) => {
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
      showToast('Support ticket #TK-8492 submitted to society office.', 'success');
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
            <LifeBuoy className="w-3.5 h-3.5" />
            Resident Support Desk
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            How can we assist you today?
          </h2>
          <p className="text-primary-100 text-sm sm:text-base mt-2 leading-relaxed">
            Search our society knowledge base or contact the management committee and gate desk directly.
          </p>

          {/* Search bar */}
          <div className="mt-5 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by keyword (e.g. gate pass, maintenance receipt, clubhouse)..."
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
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Main Gate Security</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Gate 1 &amp; Visitor Emergency Desk</p>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-1">
            <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Intercom: Ext. 101 / 102</p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Mobile: +91 98450 12345 (24/7)</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#131924] p-5 rounded-xl border border-neutral-200 dark:border-[#222b3d] shadow-2xs flex flex-col justify-between transition-colors">
          <div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Society Admin Office</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Management Committee &amp; Accounts</p>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-1">
            <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">admin@greenvalley.in</p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Clubhouse 1st Floor (10 AM - 6 PM)</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#131924] p-5 rounded-xl border border-neutral-200 dark:border-[#222b3d] shadow-2xs flex flex-col justify-between transition-colors">
          <div>
            <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Facility &amp; Maintenance</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Electrician, Plumber &amp; Lift Team</p>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-1">
            <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Desk Ext: 204</p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Rapid Response: 8:00 AM – 9:00 PM</p>
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
              Frequently Asked Questions
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
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">Try another keyword or submit a ticket to the office.</p>
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

          {/* Helpful Society Guidelines & Downloads */}
          <div className="bg-white dark:bg-[#131924] rounded-xl p-5 border border-neutral-200 dark:border-[#222b3d] shadow-2xs space-y-3 transition-colors">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              Society Documents &amp; Guidelines
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleDownloadResource('Green Valley Bylaws & Resident Handbook 2026.pdf')}
                className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-[#222b3d] hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50/40 dark:hover:bg-primary-950/30 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0" />
                  <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">Resident Handbook (PDF)</span>
                </div>
                <Download className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => handleDownloadResource('Gatepass & Visitor Security Guide.pdf')}
                className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-[#222b3d] hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50/40 dark:hover:bg-primary-950/30 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0" />
                  <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">Visitor Pass Guide</span>
                </div>
                <Download className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 shrink-0" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Support Ticket Form (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#131924] rounded-2xl p-6 border border-neutral-200 dark:border-[#222b3d] shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Raise a Support Ticket</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Direct line to committee &amp; building manager</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300">
              Resident Support
            </span>
          </div>

          {ticketSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-950/80 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-base">Ticket #TK-8492 Logged</h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-xs mx-auto">
                Your request has been forwarded to the committee desk. The average response time is under 4 business hours.
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
                  Query Category
                </label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-[#2a3547] text-xs text-neutral-800 dark:text-neutral-100 bg-white dark:bg-[#1a2232] focus:outline-none focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 transition"
                >
                  <option value="Billing & Maintenance" className="bg-white dark:bg-[#1a2232]">Billing & Maintenance Dues</option>
                  <option value="Gate & Visitors" className="bg-white dark:bg-[#1a2232]">Gate Entry & Visitor Passes</option>
                  <option value="Deliveries & Parcels" className="bg-white dark:bg-[#1a2232]">Deliveries & Parcel Collection</option>
                  <option value="Notices & Events" className="bg-white dark:bg-[#1a2232]">Notices & Community Events</option>
                  <option value="Society Bylaws" className="bg-white dark:bg-[#1a2232]">Society Bylaws & Permissions</option>
                  <option value="General Support" className="bg-white dark:bg-[#1a2232]">General Platform Support</option>
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
                  placeholder="e.g. Duplicate maintenance charge for August"
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
                  placeholder="Provide any relevant details, dates, or payment transaction IDs..."
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
                    Submit Ticket to Office
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2 text-[11px] text-neutral-400 dark:text-neutral-500">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>For urgent life-safety or security threats, use the Emergency button.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
