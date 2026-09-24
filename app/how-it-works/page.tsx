import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { UserPlus, ShieldCheck, LayoutDashboard, Zap, ArrowRight, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Create Your Account',
    desc: 'Sign up in under 2 minutes. Choose your role — Resident, Society Admin, Security, or Service Professional — and complete the registration wizard.',
    details: [
      'Select your community role',
      'Enter basic personal details',
      'Add society name, flat, or service category',
      'Account is ready immediately after sign-up',
    ],
    color: 'text-primary-600 dark:text-primary-400',
    bg: 'bg-primary-50 dark:bg-primary-950/40',
    border: 'border-primary-200 dark:border-primary-800/60',
  },
  {
    number: '02',
    icon: ShieldCheck,
    title: 'Get Verified',
    desc: 'For residents and staff, society membership is verified through the society name and flat details. Service professionals are onboarded through the Admin portal.',
    details: [
      'Residents: society name + flat number',
      'Admins: society name + unit count',
      'Security: society assignment by admin',
      'Providers: category + years of experience',
    ],
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-950/40',
    border: 'border-green-200 dark:border-green-800/60',
  },
  {
    number: '03',
    icon: LayoutDashboard,
    title: 'Access Your Portal',
    desc: 'After login, you are taken directly to your role-specific dashboard. No clutter from features that don\'t apply to you.',
    details: [
      'Resident Dashboard: visitors, deliveries, complaints, services',
      'Admin Dashboard: residents, analytics, notices, maintenance',
      'Security Console: gate log, delivery log, emergency contacts',
      'Provider Desk: booking requests, schedule, earnings',
    ],
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-800/60',
  },
  {
    number: '04',
    icon: Zap,
    title: 'Manage Everything in Real Time',
    desc: 'AavaasIQ uses real-time data sync — when security logs a visitor, the resident sees it immediately. When a complaint is updated, status reflects at once.',
    details: [
      'Live visitor and delivery updates',
      'Instant complaint status changes',
      'Real-time booking notifications for providers',
      'Admin analytics reflect current data always',
    ],
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-200 dark:border-rose-800/60',
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16 bg-white dark:bg-[#0b0f17] min-h-screen transition-colors">
        {/* Hero */}
        <section className="py-20 px-4 text-center border-b border-neutral-100 dark:border-neutral-800">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 tracking-widest uppercase mb-3">How It Works</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 dark:text-neutral-50 leading-tight">
              Up and running in minutes
            </h1>
            <p className="mt-4 text-lg text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
              AavaasIQ is designed for immediate use. No training required, no complex configuration.
            </p>
          </div>
        </section>

        {/* Steps */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="flex gap-6 items-start">
                  {/* Step number + connector */}
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-2xl ${step.bg} border ${step.border} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-5 h-5 ${step.color}`} />
                    </div>
                    {i < steps.length - 1 && (
                      <div className="w-0.5 flex-1 bg-neutral-100 dark:bg-neutral-800 mt-2 min-h-[40px]" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-8">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Step {step.number}</span>
                    </div>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">{step.title}</h2>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">{step.desc}</p>
                    <ul className="space-y-1.5">
                      {step.details.map((d) => (
                        <li key={d} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                          <ChevronRight className={`w-4 h-4 shrink-0 mt-0.5 ${step.color}`} />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 bg-neutral-50 dark:bg-[#0c121e] border-t border-neutral-100 dark:border-neutral-800">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-3">Ready to get started?</h2>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6">Create your AavaasIQ account in under 2 minutes and start managing your society smarter.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link
                href="/signup"
                className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-sm font-semibold shadow-2xs hover:shadow-xs active:scale-[0.98] transition-colors transition-transform transition-shadow duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/features"
                className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 active:scale-[0.98] transition-colors transition-transform duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                Explore Features
              </Link>
            </div>
          </div>
        </section>

        {/* Contextual Prev / Next Navigation */}
        <section className="py-12 px-4 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-[#0b0f17]">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/features"
              className="min-h-[44px] inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              ← Platform Features
            </Link>
            <Link
              href="/roles"
              className="min-h-[44px] inline-flex items-center gap-2 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline transition-colors"
            >
              <span>Next: Roles &amp; Stakeholders</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
