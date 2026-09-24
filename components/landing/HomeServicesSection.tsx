"use client";

import { useState } from "react";
import { BadgeCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

const categories = ["Cleaning", "Plumbing", "Electrical", "AC Service", "Painting", "Beauty", "Appliances"];

type CategoryKey = typeof categories[number];

// Static representative cards per category — truthful marketing content (not user data)
const categoryCards: Record<CategoryKey, { title: string; description: string; priceFrom: string }> = {
  Cleaning: {
    title: "Verified Cleaning Professionals",
    description: "Deep cleaning, regular housekeeping, and post-renovation cleanup by background-verified partners.",
    priceFrom: "₹500 onwards",
  },
  Plumbing: {
    title: "Licensed Plumbing Experts",
    description: "Tap repairs, pipe leaks, bathroom fittings, and drainage solutions — available on demand.",
    priceFrom: "₹300 onwards",
  },
  Electrical: {
    title: "Certified Electricians",
    description: "Wiring, switch-board repairs, fan installations, and electrical safety inspections.",
    priceFrom: "₹350 onwards",
  },
  "AC Service": {
    title: "AC Service & Repair Technicians",
    description: "Gas refilling, filter cleaning, cooling issues, and annual maintenance contracts.",
    priceFrom: "₹800 onwards",
  },
  Painting: {
    title: "Professional Painting Services",
    description: "Interior, exterior, and texture painting with prep, primer, and 2-coat finish.",
    priceFrom: "₹12 per sq. ft.",
  },
  Beauty: {
    title: "At-Home Beauty & Wellness",
    description: "Facial, waxing, threading, hair care, and spa services at your doorstep.",
    priceFrom: "₹400 onwards",
  },
  Appliances: {
    title: "Appliance Repair Specialists",
    description: "Washing machine, refrigerator, microwave, and TV repair by certified technicians.",
    priceFrom: "₹450 onwards",
  },
};

interface HomeServicesSectionProps {
  isResident?: boolean;
}

export default function HomeServicesSection({ isResident = false }: HomeServicesSectionProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("Cleaning");
  const card = categoryCards[activeCategory];

  return (
    <section id="services" className="py-16 px-4 bg-neutral-50 dark:bg-[#0b0f17] scroll-mt-16 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <p className="text-xs font-semibold text-green-600 dark:text-green-400 tracking-widest uppercase mb-3">
            Home Services
          </p>
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 max-w-lg">
            Home Services Marketplace
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 mt-3 text-base max-w-xl">
            Trusted, verified professionals for every home need — book directly through AavaasIQ after sign-up.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`min-h-[38px] px-4 py-2 rounded-full text-sm font-medium border transition-colors transition-transform duration-150 active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                activeCategory === cat
                  ? "bg-primary-600 text-white border-primary-600 shadow-2xs"
                  : "bg-white dark:bg-[#131924] border-neutral-200 dark:border-[#222b3d] text-neutral-600 dark:text-neutral-300 hover:border-primary-300 dark:hover:border-primary-700 hover:text-primary-700 dark:hover:text-primary-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Category feature card */}
        <div className="bg-white dark:bg-[#131924] rounded-2xl border border-neutral-200 dark:border-[#222b3d] p-6 sm:p-8 flex flex-col md:flex-row md:items-center gap-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 text-xs font-semibold uppercase tracking-wide">
              <BadgeCheck className="w-4 h-4" />
              {activeCategory} · Verified Professionals
            </div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{card.title}</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-lg">{card.description}</p>
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Starting from <span className="text-primary-600 dark:text-primary-400 font-bold">{card.priceFrom}</span>
            </p>
          </div>
          <div className="flex flex-col gap-3 shrink-0">
            <Link
              href={isResident ? "/resident/services" : "/signup"}
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-sm font-semibold shadow-2xs hover:shadow-xs active:scale-[0.98] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              <span>{isResident ? "Go to Services Portal" : "Sign Up to Book"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            {!isResident && (
              <Link
                href="/login"
                className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-neutral-200 dark:border-[#2a3547] text-neutral-700 dark:text-neutral-300 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-[#1a2232] active:scale-[0.98] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                Already have an account? Sign in
              </Link>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            All service professionals are background-verified and community-rated before listing on AavaasIQ.
          </p>
        </div>
      </div>
    </section>
  );
}
