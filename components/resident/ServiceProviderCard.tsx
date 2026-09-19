'use client';

import { ServiceProvider } from '@/lib/types';
import { Star, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getInitials } from '@/lib/utils';

interface ServiceProviderCardProps {
  provider: ServiceProvider;
  onBook?: (provider: ServiceProvider) => void;
}

export default function ServiceProviderCard({ provider, onBook }: ServiceProviderCardProps) {
  return (
    <div className="bg-white dark:bg-[#131924] rounded-xl border border-neutral-200 dark:border-[#222b3d] p-5 flex flex-col gap-4 hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-full bg-primary-600 flex items-center justify-center shrink-0">
          <span className="text-white text-sm font-bold">{getInitials(provider.name)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">{provider.name}</p>
            {provider.verified && (
              <span className="inline-flex items-center gap-0.5 text-xs text-green-600 dark:text-green-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified
              </span>
            )}
          </div>
          <span className="inline-flex mt-1 items-center px-2 py-0.5 rounded-full text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-medium">
            {provider.category}
          </span>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1.5">
        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
        <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{provider.rating}</span>
        <span className="text-xs text-neutral-400 dark:text-neutral-500">({provider.reviewCount} reviews)</span>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-2 text-xs text-neutral-500 dark:text-neutral-400">
        <div>
          <span className="text-neutral-400 dark:text-neutral-500">Experience</span>
          <p className="font-medium text-neutral-700 dark:text-neutral-200 mt-0.5">{provider.experience}</p>
        </div>
        <div>
          <span className="text-neutral-400 dark:text-neutral-500">Starting from</span>
          <p className="font-medium text-neutral-700 dark:text-neutral-200 mt-0.5">{formatCurrency(provider.startingPrice)}</p>
        </div>
      </div>

      {/* Bio */}
      <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed line-clamp-2">{provider.bio}</p>

      {/* Status + CTA */}
      <div className="mt-auto pt-1">
        {provider.available ? (
          <button
            onClick={() => onBook?.(provider)}
            className="w-full py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors cursor-pointer"
          >
            Book Now
          </button>
        ) : (
          <button
            disabled
            className="w-full py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 text-sm font-medium cursor-not-allowed"
          >
            Currently Unavailable
          </button>
        )}
      </div>
    </div>
  );
}
