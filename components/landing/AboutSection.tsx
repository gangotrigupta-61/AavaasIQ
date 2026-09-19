import { Shield, Users, Wrench } from 'lucide-react';

export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-white dark:bg-[#0b0f17] scroll-mt-16 border-t border-neutral-100 dark:border-neutral-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 tracking-widest uppercase mb-2">
            About AavaasIQ
          </p>
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
            Unified Management for Residential Communities
          </h2>
          <p className="mt-3 text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
            AavaasIQ replaces paper registers, scattered messaging groups, and manual logbooks with a single, transparent digital platform built for residents, committees, and staff.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-neutral-200 dark:border-[#222b3d] bg-neutral-50/50 dark:bg-[#131924] hover:bg-neutral-50 dark:hover:bg-[#182130] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-base mb-1.5">Gate &amp; Visitor Security</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Track visitor check-ins, approve guest entries, and log deliveries in real-time.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-neutral-200 dark:border-[#222b3d] bg-neutral-50/50 dark:bg-[#131924] hover:bg-neutral-50 dark:hover:bg-[#182130] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-base mb-1.5">Community &amp; Notices</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Publish society announcements, coordinate meetings, and keep everyone informed.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-neutral-200 dark:border-[#222b3d] bg-neutral-50/50 dark:bg-[#131924] hover:bg-neutral-50 dark:hover:bg-[#182130] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4">
              <Wrench className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-base mb-1.5">Maintenance &amp; Requests</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Raise maintenance tickets, follow resolution status, and book verified service technicians.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
