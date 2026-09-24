import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Shield, Users, Wrench, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16 bg-white dark:bg-[#0b0f17] min-h-screen transition-colors">
        {/* Hero */}
        <section className="py-20 px-4 text-center border-b border-neutral-100 dark:border-neutral-800">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 tracking-widest uppercase mb-3">
              About AavaasIQ
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 dark:text-neutral-50 leading-tight">
              Unified Management for Residential Communities
            </h1>
            <p className="mt-4 text-lg text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
              Replacing paper registers, scattered messaging groups, and manual logbooks with a transparent, role-aware digital operating system.
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                Built for real housing society dynamics
              </h2>
              <p className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed">
                Modern residential societies face communication gaps between management committees, residents, gate security teams, and local service professionals. AavaasIQ was created to unite these four critical stakeholders into a synchronized ecosystem.
              </p>
              <p className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed">
                Every feature is built around accountability: entries are logged with verified timestamps, complaints have assigned resolution workflows, and maintenance payments are tracked transparently.
              </p>
              <ul className="space-y-2 pt-2">
                {[
                  'Zero unnecessary overhead or complex training required',
                  'Role-tailored dashboards preventing information overload',
                  'Real-time data synchronization across gate and residents',
                  'Complete privacy-first community records architecture',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                    <CheckCircle2 className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="p-6 rounded-2xl border border-neutral-200 dark:border-[#222b3d] bg-neutral-50/50 dark:bg-[#131924]">
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-3">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-base mb-1">Gate &amp; Perimeter Security</h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Real-time visitor passcode validation and immediate delivery notification straight to residents.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-neutral-200 dark:border-[#222b3d] bg-neutral-50/50 dark:bg-[#131924] hover:shadow-md hover:-translate-y-0.5 transition-transform transition-shadow duration-200">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-base mb-1">Community Governance</h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Broadcast notices, coordinate meetings, record meetings, and handle grievances systematically.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-neutral-200 dark:border-[#222b3d] bg-neutral-50/50 dark:bg-[#131924] hover:shadow-md hover:-translate-y-0.5 transition-transform transition-shadow duration-200">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                  <Wrench className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-base mb-1">Facility Maintenance</h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Maintenance collections, vendor management, and verified on-demand household services.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contextual Prev / Next Navigation */}
        <section className="py-12 px-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#0c121e]">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/services"
              className="min-h-[44px] inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> <span>Previous: Home Services</span>
            </Link>
            <Link
              href="/contact"
              className="min-h-[44px] inline-flex items-center gap-2 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline transition-colors"
            >
              <span>Next: Contact &amp; Demo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
