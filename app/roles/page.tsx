import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  ArrowRight,
  CheckCircle,
  Home,
  Building2,
  ShieldCheck,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';

interface RoleCardData {
  icon: LucideIcon;
  label: string;
  tagline: string;
  desc: string;
  signupCta: string;
  color: string;
  border: string;
  headerBg: string;
  features: string[];
}

const roles: RoleCardData[] = [
  {
    icon: Home,
    label: 'Resident',
    tagline: 'Your home, managed smartly',
    desc: 'Residents get a clean, simple portal that handles everything from expecting a guest to paying maintenance dues — all from one app.',
    signupCta: 'Sign Up as Resident',
    color: 'text-primary-600 dark:text-primary-400',
    border: 'border-primary-200 dark:border-primary-800/60',
    headerBg: 'bg-primary-50 dark:bg-primary-950/40',
    features: [
      'Pre-register visitors with pass codes',
      'Track package deliveries in real time',
      'Raise and track complaints',
      'View and manage maintenance dues',
      'Book verified home service professionals',
      'Read society notices and RSVP to events',
      'Access emergency contacts instantly',
    ],
  },
  {
    icon: Building2,
    label: 'Society Admin',
    tagline: 'Run your society, not spreadsheets',
    desc: 'The Admin portal gives management committees complete control over residents, complaints, finances, and community communications.',
    signupCta: 'Sign Up as Admin',
    color: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-200 dark:border-indigo-800/60',
    headerBg: 'bg-indigo-50 dark:bg-indigo-950/40',
    features: [
      'Full residents directory with flat assignments',
      'Analytics: complaint rates, collection %, traffic',
      'Publish notices to all residents instantly',
      'Track and resolve complaints with priority',
      'Maintenance billing and collection oversight',
      'Manage verified service partner listings',
      'Society settings and configuration',
    ],
  },
  {
    icon: ShieldCheck,
    label: 'Security Staff',
    tagline: 'Gate-to-gate visibility',
    desc: 'Security personnel get a focused, no-clutter console to manage gate activity, verify visitors, and handle emergencies with confidence.',
    signupCta: 'Sign Up as Security',
    color: 'text-green-600 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800/60',
    headerBg: 'bg-green-50 dark:bg-green-950/40',
    features: [
      'Verify pre-approved visitors with pass codes',
      'Add and approve walk-in visitors',
      'Log delivery arrivals with flat and courier',
      'Full gate entry and exit audit trail',
      'One-tap access to emergency contacts',
      'Society security and admin escalation lines',
    ],
  },
  {
    icon: Wrench,
    label: 'Service Professional',
    tagline: 'Grow your business, one booking at a time',
    desc: 'Verified service providers get a clean partner desk to manage bookings, view their schedule, and track monthly earnings.',
    signupCta: 'Sign Up as Service Pro',
    color: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-800/60',
    headerBg: 'bg-orange-50 dark:bg-orange-950/40',
    features: [
      'Receive booking requests from residents',
      'Accept or decline jobs from your phone',
      'View daily and weekly job schedule',
      'Update job status (in-progress, completed)',
      'Track monthly earnings and transactions',
      'Build reputation through resident ratings',
    ],
  },
];

export default function RolesPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16 bg-white dark:bg-[#0b0f17] min-h-screen transition-colors">
        {/* Hero */}
        <section className="py-20 px-4 text-center border-b border-neutral-100 dark:border-neutral-800">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 tracking-widest uppercase mb-3">Roles &amp; Access</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 dark:text-neutral-50 leading-tight tracking-tight">
              The right tools for every role
            </h1>
            <p className="mt-4 text-lg text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
              Every stakeholder in a housing society sees only what they need. No role sees irrelevant features.
            </p>
          </div>
        </section>

        {/* Role Cards */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {roles.map((role) => {
              const RoleIcon = role.icon;
              return (
                <div
                  key={role.label}
                  className={`rounded-2xl border ${role.border} bg-white dark:bg-[#131924] overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-transform transition-shadow duration-200 flex flex-col justify-between`}
                >
                  <div>
                    <div className={`${role.headerBg} px-6 py-5 border-b ${role.border}`}>
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-white dark:bg-[#1a2232] border border-neutral-200/80 dark:border-[#2a3547] flex items-center justify-center shrink-0 shadow-2xs">
                          <RoleIcon className={`w-5 h-5 ${role.color}`} strokeWidth={2} />
                        </div>
                        <div>
                          <h2 className={`text-lg font-bold ${role.color}`}>{role.label}</h2>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{role.tagline}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-5">{role.desc}</p>
                      <ul className="space-y-2 mb-6">
                        {role.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                            <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${role.color}`} />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="px-6 pb-6 pt-0">
                    <Link
                      href="/signup"
                      className="min-h-[44px] inline-flex items-center gap-2 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 active:scale-[0.98] transition-colors transition-transform duration-150"
                    >
                      <span>{role.signupCta}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 bg-neutral-50 dark:bg-[#0c121e] border-t border-neutral-100 dark:border-neutral-800">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-3 tracking-tight">
              Which role are you?
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6 text-sm sm:text-base">
              AavaasIQ guides you to the correct portal based on your role during sign-up.
            </p>
            <Link
              href="/signup"
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-sm font-semibold shadow-2xs hover:shadow-xs active:scale-[0.98] transition-colors transition-transform transition-shadow duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Contextual Prev / Next Navigation */}
        <section className="py-12 px-4 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-[#0b0f17]">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/how-it-works"
              className="min-h-[44px] inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              ← How It Works
            </Link>
            <Link
              href="/services"
              className="min-h-[44px] inline-flex items-center gap-2 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline transition-colors"
            >
              <span>Next: Home Services</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
