'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { Star, Search, Shield, ToggleLeft, ToggleRight, Loader2, MapPin, ExternalLink } from 'lucide-react';
import { getAdminServiceProviders, toggleProviderAvailability } from '@/app/actions/services';
import { ServiceProvider } from '@/lib/types';
import { getGoogleMapsLocationUrl } from '@/lib/maps';

export default function AdminServicesPage() {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [, startTransition] = useTransition();
  const { showToast } = useToast();

  function loadProviders() {
    startTransition(async () => {
      setLoading(true);
      const res = await getAdminServiceProviders();
      if (res.data) {
        setProviders(res.data);
      }
      setLoading(false);
    });
  }

  useEffect(() => {
    loadProviders();
  }, []);

  async function handleToggle(id: string, name: string, currentStatus: boolean) {
    const nextStatus = !currentStatus;
    // Optimistic update
    setProviders((prev) => prev.map((p) => (p.id === id ? { ...p, available: nextStatus } : p)));

    const res = await toggleProviderAvailability(id, nextStatus);
    if (res.error) {
      showToast(res.error, 'error');
      // Revert
      setProviders((prev) => prev.map((p) => (p.id === id ? { ...p, available: currentStatus } : p)));
      return;
    }

    showToast(
      `${name} marked as ${nextStatus ? 'Available' : 'Unavailable'}.`,
      nextStatus ? 'success' : 'info'
    );
  }

  const categories = ['All', ...Array.from(new Set(providers.map((p) => p.category))).sort()];

  const filtered = providers.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'All' || p.category === filterCategory;
    return matchSearch && matchCat;
  });

  const available = providers.filter((p) => p.available).length;
  const unavailable = providers.length - available;
  const verified = providers.filter((p) => p.verified).length;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Service Providers</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Manage home-service professionals on the marketplace.</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 dark:bg-green-950/40 border border-green-100 dark:border-green-900/40 rounded-xl p-4">
          <p className="text-2xl font-bold text-green-700 dark:text-green-400">{available}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Available</p>
        </div>
        <div className="bg-neutral-100 dark:bg-[#131924] border border-neutral-200 dark:border-[#222b3d] rounded-xl p-4">
          <p className="text-2xl font-bold text-neutral-500 dark:text-neutral-400">{unavailable}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Unavailable</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 rounded-xl p-4">
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{verified}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Verified</p>
        </div>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 text-sm border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-neutral-800 dark:text-neutral-200 rounded-lg focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c}>{c === 'All' ? 'All Categories' : c}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Provider Cards */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-neutral-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          <p className="text-sm">Loading service partners...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.length === 0 ? (
            <Card padding="md">
              <p className="text-center text-sm text-neutral-400 py-8">No providers found.</p>
            </Card>
          ) : (
            filtered.map((p) => {
              return (
                <Card key={p.id} padding="md">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{p.name}</h3>
                        {p.verified && (
                          <span className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-semibold">
                            <Shield className="w-3 h-3" />Verified
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{p.category} · {p.experience} experience</p>
                    </div>
                    <Badge variant={p.available ? 'success' : 'neutral'} size="sm">
                      {p.available ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>

                  <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed mb-2 line-clamp-2">{p.bio}</p>

                  {/* Location info */}
                  <div className="text-xs mb-3 flex items-center justify-between">
                    {p.address?.trim() || (p.latitude != null && p.longitude != null) ? (
                      <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400 shrink-0" />
                        <span className="truncate">{p.address?.trim() || `${p.latitude}, ${p.longitude}`}</span>
                        {getGoogleMapsLocationUrl({ address: p.address, latitude: p.latitude, longitude: p.longitude }) && (
                          <a
                            href={getGoogleMapsLocationUrl({ address: p.address, latitude: p.latitude, longitude: p.longitude })!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 text-primary-600 dark:text-primary-400 hover:underline shrink-0 ml-1 font-medium"
                          >
                            Map <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-neutral-400 dark:text-neutral-500">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>Location not available</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-neutral-100 dark:border-[#222b3d] pt-3">
                    <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        {p.rating}
                      </span>
                      <span>{p.reviewCount} reviews</span>
                      <span className="font-semibold text-neutral-700 dark:text-neutral-300">From ₹{p.startingPrice}</span>
                    </div>
                    <button
                      onClick={() => handleToggle(p.id, p.name, p.available)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors cursor-pointer"
                      title="Toggle availability"
                    >
                      {p.available ? (
                        <ToggleRight className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
                      )}
                      {p.available ? 'On' : 'Off'}
                    </button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
