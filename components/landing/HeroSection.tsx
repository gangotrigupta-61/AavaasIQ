import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative min-h-[600px] lg:min-h-[680px] bg-white dark:bg-[#0b0f17] overflow-hidden pt-24 pb-16 transition-colors">
      {/* Background image — right side only, fades out via gradient */}
      <div
        className="absolute inset-0 hidden lg:block"
        aria-hidden="true"
        style={{
          backgroundImage: "url('/LandingHero.png')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center right",
        }}
      />

      {/* Theme-aware gradient overlay: full-opaque on left, transparent toward right */}
      <div
        className="absolute inset-0 hidden lg:block"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(to right, var(--hero-overlay-start) 30%, var(--hero-overlay-mid) 40%, var(--hero-overlay-soft) 60%, transparent 100%)",
        }}
      />

      {/* Mobile/tablet: subtle background tint so text stays readable */}
      <div
        className="absolute inset-0 lg:hidden"
        aria-hidden="true"
        style={{
          backgroundImage: "url('/LandingHero.png')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "top center",
          opacity: 0.36
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <div className="flex flex-col gap-6 max-w-xl lg:max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 self-start bg-green-50 dark:bg-green-950/60 border border-green-200 dark:border-green-800/60 text-green-700 dark:text-green-300 text-xs font-semibold px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Introducing AavaasIQ
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-neutral-50 leading-tight">
            Smarter Societies.
            <br />
            <span className="text-primary-600 dark:text-primary-400">Better Living.</span>
          </h1>

          {/* Subtext */}
          <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-xl leading-relaxed">
            AavaasIQ brings residents, society management, security teams and
            trusted home-service professionals together on one intelligent
            platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
            >
              Get Started Free
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center border border-neutral-300 dark:border-neutral-700 hover:border-primary-400 dark:hover:border-primary-500 text-neutral-700 dark:text-neutral-200 hover:text-primary-700 dark:hover:text-primary-300 font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
            >
              Explore Features →
            </Link>
          </div>

          {/* Trust text */}
          <p className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
            <span className="inline-flex w-4 h-4 rounded-full bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400 items-center justify-center text-[10px] font-bold">
              ✓
            </span>
            Built for modern housing societies &amp; gated communities
          </p>
        </div>
      </div>
    </section>
  );
}