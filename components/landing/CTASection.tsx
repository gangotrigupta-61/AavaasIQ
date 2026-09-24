import Link from 'next/link';
import { Check } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-20 bg-primary-600">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">
          Ready to make your society smarter?
        </h2>
        <p className="text-primary-100 text-base mb-10 leading-relaxed max-w-xl mx-auto">
          Join thousands of residents who have already upgraded to smarter, more connected community living.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/signup"
            className="min-h-[44px] inline-flex items-center justify-center px-7 py-3 bg-white text-primary-600 font-semibold text-sm rounded-lg hover:bg-primary-50 active:bg-neutral-100 active:scale-[0.98] transition-colors transition-transform transition-shadow duration-150 shadow-sm hover:shadow w-full sm:w-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-600"
          >
            Get Started with AavaasIQ
          </Link>
          <Link
            href="#contact"
            className="min-h-[44px] inline-flex items-center justify-center px-7 py-3 border border-white/40 text-white font-semibold text-sm rounded-lg hover:bg-white/10 active:scale-[0.98] transition-colors transition-transform duration-150 w-full sm:w-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-600"
          >
            Talk to Us
          </Link>
        </div>

        {/* Trust signals */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-primary-100 text-xs">
          <span className="inline-flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-primary-200" strokeWidth={2.5} />
            Free to get started
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-primary-200" strokeWidth={2.5} />
            No credit card required
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-primary-200" strokeWidth={2.5} />
            Setup in minutes
          </span>
        </div>
      </div>
    </section>
  );
}
