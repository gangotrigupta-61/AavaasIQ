'use client';

import { useState, useEffect, useTransition } from 'react';
import ServiceProviderCard from '@/components/resident/ServiceProviderCard';
import ServiceBookingModal from '@/components/resident/ServiceBookingModal';
import { getServiceProviders } from '@/app/actions/services';
import { ServiceProvider } from '@/lib/types';
import { Search, Loader2 } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Cleaning',
  'Plumbing',
  'Electrical',
  'AC Service',
  'Painting',
  'Beauty',
  'Appliances',
];

export default function ResidentServicesPage() {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [, startTransition] = useTransition();

  function loadProviders() {
    startTransition(async () => {
      setLoading(true);
      const res = await getServiceProviders();
      if (res.data) {
        setProviders(res.data);
      }
      setLoading(false);
    });
  }

  useEffect(() => {
    loadProviders();
  }, []);

  const filtered = providers.filter((p) => {
    const matchesCategory = activeCategory === 'All' || p.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.bio.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Home Services</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          Trusted, verified professionals for every home need.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
        <input
          type="text"
          placeholder="Search services or professionals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition"
        />
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-[#1a2232] border border-neutral-200 dark:border-[#2a3547] text-neutral-600 dark:text-neutral-300 hover:border-primary-300 dark:hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Provider grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          <p className="text-sm">Loading verified service partners...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-neutral-400 dark:text-neutral-500 text-sm">
          No providers found. Try a different search or category.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((provider) => (
            <ServiceProviderCard
              key={provider.id}
              provider={provider}
              onBook={(p) => {
                setSelectedProvider(p);
                setIsModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Booking Modal */}
      <ServiceBookingModal
        provider={selectedProvider}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProvider(null);
        }}
        onSuccess={() => {
          loadProviders();
        }}
      />
    </div>
  );
}
