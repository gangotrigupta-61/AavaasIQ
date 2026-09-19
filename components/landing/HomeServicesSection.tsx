"use client";

import { useState } from "react";
import { Star, BadgeCheck } from "lucide-react";
import Link from "next/link";

const categories = ["Cleaning", "Plumbing", "Electrical", "AC Service", "Painting", "Beauty", "Appliances"];

const providers = [
  { name: "Ramesh Kumar",        initials: "RK", category: "Plumbing",    rating: 4.8, experience: "8 years",  price: "₹300 onwards" },
  { name: "Sunita Clean Services", initials: "SC", category: "Cleaning",  rating: 4.6, experience: "5 years",  price: "₹500 onwards" },
  { name: "CoolAir Pro",         initials: "CA", category: "AC Service",  rating: 4.9, experience: "15 years", price: "₹800 onwards" },
];

export default function HomeServicesSection() {
  const [activeCategory, setActiveCategory] = useState("Cleaning");

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
            Trusted, verified professionals for every home need — available on demand.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                activeCategory === cat
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white dark:bg-[#131924] border-neutral-200 dark:border-[#222b3d] text-neutral-600 dark:text-neutral-300 hover:border-green-300 dark:hover:border-green-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Provider Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {providers.map((provider) => (
            <div
              key={provider.name}
              className="bg-white dark:bg-[#131924] rounded-xl border border-neutral-200 dark:border-[#222b3d] p-5 flex flex-col gap-4 shadow-2xs transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-950/80 flex items-center justify-center text-green-700 dark:text-green-300 font-bold text-sm flex-shrink-0">
                  {provider.initials}
                </div>
                <div>
                  <p className="font-bold text-neutral-900 dark:text-neutral-100 text-sm leading-tight">{provider.name}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{provider.category}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 text-xs text-neutral-600 dark:text-neutral-400">
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">{provider.rating}</span>
                </span>
                <span className="text-neutral-300 dark:text-neutral-700">·</span>
                <span>{provider.experience}</span>
                <span className="text-neutral-300 dark:text-neutral-700">·</span>
                <span className="font-medium text-neutral-800 dark:text-neutral-200">{provider.price}</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-medium">
                <BadgeCheck className="w-4 h-4" />
                Verified Professional
              </div>

              <button className="mt-auto w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors cursor-pointer">
                Book Now
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/signup"
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold text-sm hover:underline transition-colors"
          >
            Sign up to book services →
          </Link>
        </div>
      </div>
    </section>
  );
}
