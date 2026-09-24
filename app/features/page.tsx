import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  UserCheck,
  Wrench,
  MessageSquare,
  Package,
  Bell,
  Calendar,
  Briefcase,
  Siren,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: UserCheck,
    title: 'Visitor Management',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    desc: 'Pre-register expected guests and get notified the moment they arrive at the gate. Security can verify, approve, or reject entries with a single tap.',
    steps: ['Pre-approval', 'Gate check', 'Entry'],
    points: [
      'Pre-approval pass codes for guests',
      'Real-time gate arrival notifications',
      'Full visitor entry and exit log',
      'Walk-in visitor capture by security',
    ],
  },
  {
    icon: Wrench,
    title: 'Maintenance Management',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    desc: 'Residents can raise maintenance tickets by category. Management tracks resolution, assigns priority, and communicates updates — all in one place.',
    steps: ['Log request', 'Assigned', 'Resolved'],
    points: [
      'Categorized complaint/ticket raising',
      'Priority assignment and status tracking',
      'Maintenance billing and collection',
      'Admin analytics on resolution times',
    ],
  },
  {
    icon: MessageSquare,
    title: 'Complaints Resolution',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/40',
    desc: 'Transparent complaint lifecycle from submission to resolution. Residents track status; management monitors open tickets to prevent backlog.',
    steps: ['Raise issue', 'Track status', 'Resolution'],
    points: [
      'Multi-category complaint logging',
      'Status updates: Open → In Progress → Resolved',
      'High-priority flagging for urgent issues',
      'Committee-level complaint analytics',
    ],
  },
  {
    icon: Package,
    title: 'Delivery Tracking',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-950/40',
    desc: 'Security logs deliveries as they arrive. Residents get notified and can mark parcels as collected — eliminating missed-delivery confusion.',
    steps: ['Gate arrival', 'Notification', 'Collected'],
    points: [
      'Parcel arrival logging by security',
      'Resident notification on delivery',
      'Collected / uncollected status',
      'Delivery history per flat',
    ],
  },
  {
    icon: Bell,
    title: 'Society Notices',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    desc: 'Society management can publish structured notices to all residents instantly. No more WhatsApp group chaos.',
    steps: ['Admin post', 'Read alert', 'Take action'],
    points: [
      'Admin publishes; residents read instantly',
      'Categorized: General, Maintenance, Events, Urgent',
      'Persistent notice board with history',
      'Replaces informal group messaging',
    ],
  },
  {
    icon: Calendar,
    title: 'Events & RSVP',
    color: 'text-pink-600 dark:text-pink-400',
    bg: 'bg-pink-50 dark:bg-pink-950/40',
    desc: 'Management creates community events. Residents RSVP directly from the platform. No third-party forms needed.',
    steps: ['Announcement', 'RSVP', 'Community'],
    points: [
      'Admin creates events with date, time, venue',
      'Resident RSVP with confirmation',
      'Live attendance count for organizers',
      'Event history for the community',
    ],
  },
  {
    icon: Briefcase,
    title: 'Home Services',
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-50 dark:bg-teal-950/40',
    desc: 'A marketplace of verified service professionals — plumbers, electricians, cleaners, AC technicians — bookable directly by residents.',
    steps: ['Choose pro', 'Book slot', 'Service done'],
    points: [
      'Background-verified service partners',
      'Category browsing & provider profiles',
      'Booking with date and time slot',
      'Provider accepts/declines & updates status',
    ],
  },
  {
    icon: Siren,
    title: 'Emergency Contacts',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    desc: 'Centralized emergency contact directory accessible to every portal. Police, fire, ambulance, and society-specific contacts, always one tap away.',
    steps: ['Select contact', 'Instant call', 'Response'],
    points: [
      'Police (100/112), Fire (101), Ambulance (108)',
      'Society security and admin direct lines',
      'Available on all portals including Security',
      'No internet required for stored contacts',
    ],
  },
];

export default function FeaturesPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16 bg-white dark:bg-[#0b0f17] min-h-screen transition-colors">
        {/* Hero */}
        <section className="py-20 px-4 text-center border-b border-neutral-100 dark:border-neutral-800">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 tracking-widest uppercase mb-3">
              Platform Features
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 dark:text-neutral-50 leading-tight tracking-tight">
              Everything your society needs
            </h1>
            <p className="mt-4 text-lg text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
              AavaasIQ covers the full operational lifecycle of a residential society — from gate security to home services.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <Link
                href="/signup"
                className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-sm font-semibold shadow-2xs hover:shadow-xs active:scale-[0.98] transition-colors transition-transform transition-shadow duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/how-it-works"
                className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 active:scale-[0.98] transition-colors transition-transform duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                How It Works
              </Link>
            </div>
          </div>
        </section>

        {/* Feature cards — Horizontal row on desktop/tablet, stacked on mobile */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto space-y-5">
            {features.map(({ icon: Icon, title, color, bg, desc, steps, points }) => (
              <div
                key={title}
                className="group bg-white dark:bg-[#131924] rounded-2xl border border-neutral-200 dark:border-[#222b3d] p-6 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700/60 hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-4"
              >
                {/* [ICON] [CATEGORY NAME] [SHORT DESCRIPTION] horizontal row */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                  <div className="flex items-center gap-3.5 shrink-0 sm:w-64 lg:w-72">
                    <div
                      className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${bg} group-hover:scale-105 transition-transform duration-200 shrink-0`}
                    >
                      <Icon className={`w-5 h-5 ${color}`} strokeWidth={1.75} />
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                      {title}
                    </h2>
                  </div>

                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed flex-1">
                    {desc}
                  </p>
                </div>

                {/* Key capabilities list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-3 border-t border-neutral-100 dark:border-[#1e2a3a]">
                  {points.map((p) => (
                    <div
                      key={p}
                      className="flex items-start gap-1.5 text-xs text-neutral-700 dark:text-neutral-300"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>

                {/* Compact, visually secondary workflow progression */}
                <div className="pt-2.5 border-t border-neutral-100 dark:border-[#1e2a3a] flex items-center flex-wrap gap-1.5 text-[11px] text-neutral-400 dark:text-neutral-500 font-medium select-none">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mr-1">
                    Workflow:
                  </span>
                  <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300">
                    {steps[0]}
                  </span>
                  <span className="text-neutral-300 dark:text-neutral-600">→</span>
                  <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300">
                    {steps[1]}
                  </span>
                  <span className="text-neutral-300 dark:text-neutral-600">→</span>
                  <span className="px-2 py-0.5 rounded bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-semibold">
                    {steps[2]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 bg-neutral-50 dark:bg-[#0c121e] border-t border-neutral-100 dark:border-neutral-800">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-3 tracking-tight">
              Ready to modernize your society?
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6 text-sm sm:text-base">
              Sign up and start using AavaasIQ today — no setup fee, no credit card required.
            </p>
            <Link
              href="/signup"
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-sm font-semibold shadow-2xs hover:shadow-xs active:scale-[0.98] transition-colors transition-transform transition-shadow duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <span>Create a Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Contextual Prev / Next Navigation */}
        <section className="py-12 px-4 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-[#0b0f17]">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/contact"
              className="min-h-[44px] inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              ← Contact &amp; Inquiries
            </Link>
            <Link
              href="/how-it-works"
              className="min-h-[44px] inline-flex items-center gap-2 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline transition-colors"
            >
              <span>Next: How It Works</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
