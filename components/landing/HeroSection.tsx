import Link from "next/link";

interface HeroSectionProps {
  dashboardHref?: string | null;
}

export default function HeroSection({ dashboardHref }: HeroSectionProps = {}) {
  return (
    <section className="relative min-h-[600px] lg:min-h-[680px] bg-white dark:bg-[#0b0f17] overflow-hidden pt-6 pb-8 lg:pt-24 lg:pb-16 transition-colors duration-300">

      {/* Desktop Background image — right side only, fades out via gradient */}
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
          background: "linear-gradient(to right, var(--hero-overlay-start) 30%, var(--hero-overlay-mid) 40%, var(--hero-overlay-soft) 60%, transparent 120%)",
        }}
      />

      {/* Mobile/tablet background image - Set to full opacity to match mockup */}
      <div
        className="absolute inset-0 lg:hidden"
        aria-hidden="true"
        style={{
          backgroundImage: "url('/HeroMobile.png')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "top center",
        }}
      />

      {/* Interactive Mobile-only Dynamic Overlay: Gradients shift cleanly based on Active Theme */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/50 to-white/5 dark:from-black/90 dark:via-black/40 dark:to-transparent lg:hidden z-0 transition-all duration-200"
        aria-hidden="true"
      />

      {/* Content Layout wrapper */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-4 h-full">
        {/* Adjusted mobile min-height calculation to shift the button stack upward over the knees */}
        <div className="flex flex-col justify-between min-h-[calc(110vh-210px)] sm:min-h-0 lg:block gap-6 lg:gap-6 max-w-xl lg:max-w-2xl">

          {/* Top Grouping for Text Content */}
          <div className="flex flex-col gap-5 lg:block lg:gap-0">
            {/* Badge: Adapts colors automatically for clean Light/Dark identity segmentation */}
            <div className="inline-flex items-center gap-2 self-start bg-green-50 border border-green-200 dark:bg-[#143b23]/60 dark:border-[#1d5c34] lg:bg-green-50 lg:dark:bg-green-950/60 lg:border-green-200 lg:dark:border-green-800/60 text-green-700 dark:text-[#4ade80] lg:text-green-700 lg:dark:text-green-300 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm dark:shadow-none transition-all">

              Introducing AavaasIQ
            </div>

            {/* Heading: Flips dynamically from dark neutral text to crisp white over mobile media backgrounds */}
            <h1 className="text-[2.6rem] leading-[1.15] md:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-white lg:text-neutral-900 lg:dark:text-neutral-50 tracking-tight transition-colors duration-300 lg:mt-6">
              Smarter <br className="lg:hidden" /> Societies. <br />
              <span className="text-primary-600 dark:text-[#10b981] lg:text-primary-600 lg:dark:text-primary-400">Better Living.</span>
            </h1>

            {/* Subtext: Contrast balances adaptively based on global theme switches */}
            <p className="text-[0.95rem] md:text-lg text-neutral-900 dark:text-neutral-200 lg:text-neutral-900 lg:dark:text-neutral-200 max-w-xl leading-relaxed font-normal lg:opacity-90 pr-4 lg:pr-0 transition-colors duration-300 lg:mt-6">
              AavaasIQ brings residents, society management, security teams and trusted home-service professionals together on one intelligent platform.
            </p>
          </div>

          {/* Bottom Grouping for Interactive Layout Components - Added mb-14 on mobile to pull elements higher */}
          <div className="flex flex-col gap-4 lg:block lg:gap-0 mt-8 sm:mt-12 lg:mt-6 mb-14 lg:mb-0">
            {/* CTA Buttons: Highly interactive vertical stacked configuration built for target mobile environments */}
            <div className="flex flex-col gap-3.5 lg:flex-row lg:flex-wrap lg:gap-3 w-full lg:w-auto">
              <Link
                href={dashboardHref || "/signup"}
                className="inline-flex items-center justify-between lg:justify-center bg-primary-600 hover:bg-primary-700 dark:bg-[#15803d] dark:hover:bg-[#166534] lg:bg-primary-600 lg:hover:bg-primary-700 text-white font-medium lg:font-semibold px-5 py-4 lg:px-6 lg:py-3 rounded-full lg:rounded-lg text-[0.95rem] lg:text-sm border border-primary-500/20 dark:border-[#16a34a]/30 w-full lg:w-auto transition-all duration-300 active:scale-[0.98] transform hover:scale-[1.01] shadow-md dark:shadow-lg dark:shadow-black/20"
              >
                <span className="flex items-center gap-2.5">
                  {/* SVG Card/Badge Tracker Icon Asset */}
                  <svg className="w-5 h-5 lg:hidden text-white opacity-95" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {dashboardHref ? "Go to Dashboard" : "Get Started Free"}
                </span>
                <svg className="w-4 h-4 lg:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>

              <Link
                href="#features"
                className="inline-flex items-center justify-between lg:justify-center bg-white/80 dark:bg-black/20 border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 text-neutral-800 dark:text-white lg:border-neutral-300 lg:dark:border-neutral-700 lg:text-neutral-700 lg:dark:text-neutral-200 lg:hover:text-primary-700 lg:dark:hover:text-primary-300 font-medium lg:font-semibold px-5 py-4 lg:px-6 lg:py-3 rounded-full lg:rounded-lg text-[0.95rem] lg:text-sm w-full lg:w-auto transition-all duration-300 backdrop-blur-md active:scale-[0.98] transform hover:scale-[1.01] shadow-sm dark:shadow-none"
              >
                <span>Explore Features</span>
                <svg className="w-4 h-4 lg:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>

            {/* Trust text - Left visible for standard layouts, spacing updated cleanly */}
            <p className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-2 transition-colors duration-300 mt-4 lg:mt-6">
              <span className="inline-flex w-4 h-4 rounded-full bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400 items-center justify-center text-[10px] font-bold"> ✓ </span>
              Built for modern housing societies &amp; gated communities
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
