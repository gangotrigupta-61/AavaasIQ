import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { LifeBuoy, ArrowRight, ShieldCheck, HelpCircle, PhoneCall, Mail } from 'lucide-react';

export default function UniversalHelpPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20 bg-neutral-50 dark:bg-[#0b0f17] min-h-screen transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 text-xs font-semibold uppercase tracking-wider">
              <LifeBuoy className="w-3.5 h-3.5" />
              AavaasIQ Help Center
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
              We&apos;re here to help you live better.
            </h1>
            <p className="text-neutral-600 dark:text-neutral-300 text-base">
              Find quick answers, explore user guides, or connect with your community administrators.
            </p>
          </div>

          {/* Quick Access Portals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#131924] rounded-2xl p-6 border border-neutral-200 dark:border-[#222b3d] shadow-sm flex flex-col justify-between space-y-4 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
              <div>
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Are you an active resident?</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                  Access your society-specific FAQ, raise committee support tickets, or contact Gate 1 security directly from your resident dashboard.
                </p>
              </div>
              <Link
                href="/resident/help"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 pt-2"
              >
                Go to Resident Help Desk <ArrowRight size={14} />
              </Link>
            </div>

            <div className="bg-white dark:bg-[#131924] rounded-2xl p-6 border border-neutral-200 dark:border-[#222b3d] shadow-sm flex flex-col justify-between space-y-4 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Need platform onboarding?</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                  Interested in bringing AavaasIQ to your apartment complex or society management committee? Our sales team can schedule an on-site presentation.
                </p>
              </div>
              <Link
                href="/#contact"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 pt-2"
              >
                Request a Committee Demo <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* General Inquiries */}
          <div className="bg-white dark:bg-[#131924] rounded-2xl p-6 sm:p-8 border border-neutral-200 dark:border-[#222b3d] shadow-sm">
            <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Central Support & Contacts</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
              For security emergencies, account recovery, or partner queries:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40">
                <PhoneCall className="w-5 h-5 text-primary-600 dark:text-primary-400 shrink-0" />
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Toll-Free Helpline</p>
                  <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">+91 80 4567 8900</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40">
                <Mail className="w-5 h-5 text-primary-600 dark:text-primary-400 shrink-0" />
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Official Support Email</p>
                  <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">support@aavaasiq.in</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
