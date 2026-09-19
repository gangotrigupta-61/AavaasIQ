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
  Shield,
  Radio,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

interface SecurityFAQ {
  id: string;
  category: 'passcode' | 'deliveries' | 'emergency' | 'hardware' | 'shift';
  question: string;
  answer: string;
}

const SECURITY_FAQS: SecurityFAQ[] = [
  {
    id: 'sf-1',
    category: 'passcode',
    question: 'How do I verify a visitor 4-digit entry passcode at the gate?',
    answer:
      'Go to the "Visitors" page on the security console. Enter the 4-digit code provided by the visitor into the verification bar. The system instantly displays the expected guest\'s name, visiting flat number, and vehicle registration. Click "Mark Entered" to open the boom barrier.',
  },
  {
    id: 'sf-2',
    category: 'passcode',
    question: 'What if a visitor does not have a pre-approved digital pass?',
    answer:
      'Click "Log Walk-in Visitor". Enter the visitor\'s full name, phone number, vehicle number, and target flat number. The system places an automated notification to the resident\'s AavaasIQ app for instant one-tap approval before you allow gate entry.',
  },
  {
    id: 'sf-3',
    category: 'deliveries',
    question: 'What is the procedure when an unexpected delivery parcel arrives?',
    answer:
      'Navigate to "Deliveries" and click "Log Delivery". Select the delivery partner (e.g. Swiggy, Zomato, Amazon, Blinkit, Flipkart), enter the flat number and tracking/OTP digits. The resident receives an alert instantly. If the resident is away, store the package in the Gate Holding Bay.',
  },
  {
    id: 'sf-4',
    category: 'deliveries',
    question: 'How do I release a package when the resident or helper collects it?',
    answer:
      'Open the "Deliveries" tab and find the pending package by flat number. Verify the resident\'s identity or maid pass, and click "Hand Over Package". The parcel status updates to Handed Over with an authoritative timestamp.',
  },
  {
    id: 'sf-5',
    category: 'emergency',
    question: 'What must security personnel do when a Resident Panic Alarm triggers?',
    answer:
      'The Security Emergency console sounds an immediate audible siren and highlights the affected block and flat number in flashing red. Station Officer must immediately: (1) Dispatch 1 patrol guard to the flat, (2) Ring flat intercom, and (3) If no response within 60 seconds, alert Chief Supervisor and emergency services.',
  },
  {
    id: 'sf-6',
    category: 'emergency',
    question: 'How do I log medical, fire, or police emergency dispatches?',
    answer:
      'From "Emergency" page, click "Log Incident". Note the arriving agency, ambulance/fire engine registration, and guide them along designated emergency access routes. Keep the boom barrier held open in manual override mode.',
  },
  {
    id: 'sf-7',
    category: 'hardware',
    question: 'How do I operate the boom barrier manual override during power or app outages?',
    answer:
      'In the event of a network or power disruption, insert the manual mechanical key into the barrier base lock and turn 90 degrees clockwise to disengage the clutch. Raise the barrier arm manually. Report the incident via the ticket form below.',
  },
  {
    id: 'sf-8',
    category: 'shift',
    question: 'What is the standard protocol for end-of-shift handover?',
    answer:
      'Before signing out: (1) Review all visitors currently marked "Inside" and investigate any overstays, (2) Hand over gate holding parcels count, (3) Confirm radio and tablet battery levels, and (4) Both incoming and outgoing guards sign the digital register.',
  },
];

const CATEGORIES = [
  { label: 'All Topics', value: 'all' },
  { label: 'Passcodes & Visitors', value: 'passcode' },
  { label: 'Deliveries & Parcels', value: 'deliveries' },
  { label: 'Emergency & Alarms', value: 'emergency' },
  { label: 'Hardware & Barrier', value: 'hardware' },
  { label: 'Shift Handover', value: 'shift' },
];

export default function SecurityHelpPage() {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>('sf-1');

  // Support ticket form state
  const [ticketCategory, setTicketCategory] = useState('Gate Passcode & App Issue');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketPriority, setTicketPriority] = useState('normal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);

  const filteredFaqs = SECURITY_FAQS.filter((faq) => {
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
      showToast('Security incident ticket #SEC-4029 dispatched to Chief Supervisor.', 'success');
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
            <Shield className="w-3.5 h-3.5" />
            Gate Console Support Desk
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Security Gate &amp; Terminal Operations Help
          </h2>
          <p className="text-primary-100 text-sm sm:text-base mt-2 leading-relaxed">
            Standard operating procedures, visitor pass verification, emergency protocols, and hardware troubleshooting for gate duty officers.
          </p>

          {/* Search bar */}
          <div className="mt-5 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search security SOPs (e.g. passcode verify, parcel holding, barrier override)..."
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
              <Radio className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Chief Security Supervisor</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Gate 1 Command &amp; Duty Roster</p>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-1">
            <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Intercom: Ext. 101 | Walkie: Ch 4</p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Mobile: +91 98450 12345 (24/7)</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#131924] p-5 rounded-xl border border-neutral-200 dark:border-[#222b3d] shadow-2xs flex flex-col justify-between transition-colors">
          <div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Society Admin Liaison</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Management Office &amp; KYC Desk</p>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-1">
            <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Intercom: Ext. 100</p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Hours: 9:00 AM – 8:00 PM</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#131924] p-5 rounded-xl border border-neutral-200 dark:border-[#222b3d] shadow-2xs flex flex-col justify-between transition-colors">
          <div>
            <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mb-3">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Emergency First Responders</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">National Emergency Dispatch</p>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-1">
            <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Police: 112 | Fire: 101</p>
            <p className="text-xs text-red-600 dark:text-red-400 font-semibold">Ambulance: 108 (Direct Dispatch)</p>
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
              Security Standard Operating Procedures
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
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">No SOP matched your search.</p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">Try another keyword or raise an incident log to the supervisor.</p>
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

          {/* Helpful Security Documents & Downloads */}
          <div className="bg-white dark:bg-[#131924] rounded-xl p-5 border border-neutral-200 dark:border-[#222b3d] shadow-2xs space-y-3 transition-colors">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              Security Manuals &amp; Protocols
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleDownloadResource('Gate Security Standard Operating Procedures 2026.pdf')}
                className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-[#222b3d] hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50/40 dark:hover:bg-primary-950/30 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0" />
                  <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">Gate Security SOP Manual</span>
                </div>
                <Download className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => handleDownloadResource('Emergency Evacuation & First Responder Protocol.pdf')}
                className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-[#222b3d] hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50/40 dark:hover:bg-primary-950/30 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0" />
                  <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">Evacuation Protocol (PDF)</span>
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
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Log Security Incident / Ticket</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Escalate hardware or gate issues</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300">
              Gate Support
            </span>
          </div>

          {ticketSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-950/80 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-base">Incident #SEC-4029 Recorded</h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-xs mx-auto">
                Your report has been logged to the Chief Security Supervisor and society office for immediate review.
              </p>
              <button
                type="button"
                onClick={() => setTicketSuccess(false)}
                className="mt-3 px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
              >
                Log another report
              </button>
            </div>
          ) : (
            <form onSubmit={handleTicketSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Incident / Inquiry Category
                </label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-[#2a3547] text-xs text-neutral-800 dark:text-neutral-100 bg-white dark:bg-[#1a2232] focus:outline-none focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 transition"
                >
                  <option value="Gate Passcode & App Issue" className="bg-white dark:bg-[#1a2232]">Passcode Verification / App Sync</option>
                  <option value="Hardware / Barrier Malfunction" className="bg-white dark:bg-[#1a2232]">Boom Barrier / RFID / Scanner Failure</option>
                  <option value="Unregistered Visitor Dispute" className="bg-white dark:bg-[#1a2232]">Visitor Dispute / Denied Entry</option>
                  <option value="Delivery Package Issue" className="bg-white dark:bg-[#1a2232]">Unclaimed Parcel / Delivery Conflict</option>
                  <option value="Resident Emergency Follow-up" className="bg-white dark:bg-[#1a2232]">Emergency Alarm Follow-up Report</option>
                  <option value="Shift Handover Note" className="bg-white dark:bg-[#1a2232]">Shift Handover &amp; Overnight Vehicles</option>
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
                  placeholder="e.g. Barrier arm stuck in open position at Gate 1"
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
                  placeholder="Provide gate location, vehicle registration, visitor name, or guard observations..."
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
                    Logging Incident…
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Submit to Chief Supervisor
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2 text-[11px] text-neutral-400 dark:text-neutral-500">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>For active crimes, fire, or medical emergencies, press Emergency immediately.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
