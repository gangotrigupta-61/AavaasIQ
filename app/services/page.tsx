import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  BadgeCheck,
  ArrowRight,
  Sparkles,
  Wrench,
  Zap,
  Wind,
  Paintbrush,
  Heart,
  Tv,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { getCurrentUserProfile } from '@/app/actions/profile';

interface ServiceCategoryData {
  icon: LucideIcon;
  name: string;
  desc: string;
  from: string;
}

const categories: ServiceCategoryData[] = [
  {
    icon: Sparkles,
    name: 'Cleaning',
    desc: 'Deep cleaning, housekeeping, and post-renovation cleanup.',
    from: '₹500 onwards',
  },
  {
    icon: Wrench,
    name: 'Plumbing',
    desc: 'Tap repairs, pipe leaks, bathroom fittings, and drainage solutions.',
    from: '₹300 onwards',
  },
  {
    icon: Zap,
    name: 'Electrical',
    desc: 'Wiring, switchboard repairs, fan installations, and safety checks.',
    from: '₹350 onwards',
  },
  {
    icon: Wind,
    name: 'AC Service',
    desc: 'Gas refilling, filter cleaning, cooling repairs, and AMC.',
    from: '₹800 onwards',
  },
  {
    icon: Paintbrush,
    name: 'Painting',
    desc: 'Interior, exterior, and texture painting with prep and finish.',
    from: '₹12 per sq. ft.',
  },
  {
    icon: Heart,
    name: 'Beauty & Wellness',
    desc: 'Facial, waxing, threading, hair care, and spa at your doorstep.',
    from: '₹400 onwards',
  },
  {
    icon: Tv,
    name: 'Appliances',
    desc: 'Washing machine, refrigerator, microwave, and TV repair.',
    from: '₹450 onwards',
  },
];

export default async function ServicesPage() {
  const profile = await getCurrentUserProfile();
  const isResident = profile?.role === 'resident';

  return (
    <>
      <Navbar />
      <main className="pt-16 bg-white dark:bg-[#0b0f17] min-h-screen transition-colors">
        {/* Hero */}
        <section className="py-20 px-4 text-center border-b border-neutral-100 dark:border-neutral-800">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 tracking-widest uppercase mb-3">Home Services</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 dark:text-neutral-50 leading-tight tracking-tight">
              Trusted professionals.<br />
              <span className="text-primary-600 dark:text-primary-400">At your doorstep.</span>
            </h1>
            <p className="mt-4 text-lg text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
              AavaasIQ connects residents with background-verified, community-rated service professionals — bookable directly from your resident portal.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
              <BadgeCheck className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span>All providers are background-verified before listing</span>
            </div>
          </div>
        </section>

        {/* Category grid */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">Service Categories</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => {
                const CatIcon = cat.icon;
                return (
                  <div
                    key={cat.name}
                    className="group bg-white dark:bg-[#131924] rounded-2xl border border-neutral-200 dark:border-[#222b3d] p-6 flex flex-col gap-4 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700/60 hover:-translate-y-0.5 transition-transform transition-shadow transition-colors duration-200"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-950/60 border border-primary-100 dark:border-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                      <CatIcon className="w-6 h-6" strokeWidth={1.75} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">{cat.name}</h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">{cat.desc}</p>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-neutral-100 dark:border-[#1e2a3a]">
                      <div className="flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 font-medium">
                        <BadgeCheck className="w-3.5 h-3.5" />
                        <span>Verified Pros</span>
                      </div>
                      <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">{cat.from}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How booking works */}
        <section className="py-16 px-4 bg-neutral-50 dark:bg-[#0c121e] border-t border-neutral-100 dark:border-neutral-800">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-8 text-center tracking-tight">How booking works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { step: '1', title: 'Browse Category', desc: 'Open Home Services in your resident portal and select a service category.' },
                { step: '2', title: 'Choose Provider', desc: 'View verified professionals with ratings, experience, and starting price.' },
                { step: '3', title: 'Book a Slot', desc: 'Select a preferred date and time. The provider confirms the booking.' },
                { step: '4', title: 'Job Completed', desc: 'Provider marks the job done. You rate their service for the community.' },
              ].map((s) => (
                <div key={s.step} className="text-center p-4 rounded-xl bg-white dark:bg-[#131924] border border-neutral-200 dark:border-[#222b3d] shadow-2xs hover:shadow-xs transition-shadow duration-150">
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 text-sm font-bold rounded-full flex items-center justify-center mx-auto mb-3">{s.step}</div>
                  <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100 mb-1">{s.title}</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 border-t border-neutral-100 dark:border-neutral-800">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-3 tracking-tight">Ready to book?</h2>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6 text-sm sm:text-base">
              {isResident
                ? "You are logged in as a resident. Browse verified providers, check availability, and book directly in your portal."
                : "Home Services is available to all registered residents. Sign up and access your portal to browse and book."}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link
                href={isResident ? "/resident/services" : "/signup"}
                className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-sm font-semibold shadow-2xs hover:shadow-xs active:scale-[0.98] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <span>{isResident ? "Go to Services Portal" : "Sign Up to Book"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              {!isResident && (
                <Link
                  href="/login"
                  className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 active:scale-[0.98] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  Already a resident? Sign In
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Contextual Prev / Next Navigation */}
        <section className="py-12 px-4 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-[#0b0f17]">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/roles"
              className="min-h-[44px] inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              ← Roles &amp; Stakeholders
            </Link>
            <Link
              href="/about"
              className="min-h-[44px] inline-flex items-center gap-2 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline transition-colors"
            >
              <span>Next: About AavaasIQ</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
