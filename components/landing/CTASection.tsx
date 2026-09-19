import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="py-20 bg-primary-600">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to make your society smarter?
        </h2>
        <p className="text-primary-100 text-base mb-10 leading-relaxed">
          Join thousands of residents who have already upgraded to smarter, more connected community living.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-7 py-3 bg-white text-primary-600 font-semibold text-sm rounded-lg hover:bg-primary-50 transition-colors w-full sm:w-auto"
          >
            Get Started with AavaasIQ
          </Link>
          <Link
            href="#contact"
            className="inline-flex items-center justify-center px-7 py-3 border border-white/40 text-white font-semibold text-sm rounded-lg hover:bg-white/10 transition-colors w-full sm:w-auto"
          >
            Talk to Us
          </Link>
        </div>

        {/* Trust signals */}
        <div className="mt-8 flex items-center justify-center gap-6 text-primary-100 text-xs">
          <span>✓ Free to get started</span>
          <span>✓ No credit card required</span>
          <span>✓ Setup in minutes</span>
        </div>
      </div>
    </section>
  );
}
