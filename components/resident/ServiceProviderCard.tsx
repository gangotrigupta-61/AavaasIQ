'use client';

import { ServiceProvider } from '@/lib/types';
import { Star, CheckCircle2, MapPin, ExternalLink, Navigation } from 'lucide-react';
import { formatCurrency, getInitials } from '@/lib/utils';
import {
  getGoogleMapsLocationUrl,
  getGoogleMapsDirectionsUrl,
  calculateHaversineDistanceKm,
  LocationCoordinates,
} from '@/lib/maps';

interface ServiceProviderCardProps {
  provider: ServiceProvider;
  onBook?: (provider: ServiceProvider) => void;
  userCoords?: LocationCoordinates | null;
}

export default function ServiceProviderCard({
  provider,
  onBook,
  userCoords,
}: ServiceProviderCardProps) {
  const hasCoordinates =
    provider.latitude != null &&
    provider.longitude != null &&
    !isNaN(provider.latitude) &&
    !isNaN(provider.longitude);

  const cleanAddress = provider.address?.trim() || null;
  const hasLocation = Boolean(cleanAddress || hasCoordinates);

  // Generate official Google Maps URLs only when real location data exists
  const mapsLocationUrl = hasLocation
    ? getGoogleMapsLocationUrl({
        latitude: provider.latitude,
        longitude: provider.longitude,
        address: cleanAddress,
      })
    : null;

  const mapsDirectionsUrl = hasLocation
    ? getGoogleMapsDirectionsUrl(
        {
          latitude: provider.latitude,
          longitude: provider.longitude,
          address: cleanAddress,
        },
        userCoords
      )
    : null;

  // Calculate real distance only when BOTH user and provider coordinates are valid
  const distanceKm =
    userCoords && hasCoordinates
      ? calculateHaversineDistanceKm(
          userCoords.latitude,
          userCoords.longitude,
          provider.latitude!,
          provider.longitude!
        )
      : null;

  return (
    <div className="bg-white dark:bg-[#131924] rounded-xl border border-neutral-200 dark:border-[#222b3d] p-5 flex flex-col gap-4 hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-start gap-3">
        {provider.avatarUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={provider.avatarUrl}
            alt={provider.name}
            className="w-11 h-11 rounded-full object-cover shrink-0 border border-neutral-200 dark:border-neutral-700"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-primary-600 flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-bold">{getInitials(provider.name)}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">{provider.name}</p>
            {provider.verified && (
              <span className="inline-flex items-center gap-0.5 text-xs text-green-600 dark:text-green-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified
              </span>
            )}
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                provider.available
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700'
              }`}
            >
              {provider.available ? 'Available' : 'Unavailable'}
            </span>
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

      {/* Real Location Section */}
      <div className="pt-3 border-t border-neutral-100 dark:border-[#222b3d] text-xs">
        {hasLocation ? (
          <div className="space-y-2">
            <div className="flex items-start gap-1.5 text-neutral-800 dark:text-neutral-200">
              <MapPin className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {cleanAddress || `${provider.latitude}, ${provider.longitude}`}
                </p>
                {distanceKm !== null && (
                  <p className="text-[11px] text-primary-600 dark:text-primary-400 font-semibold mt-0.5">
                    ~{distanceKm} km away
                  </p>
                )}
              </div>
            </div>

            {/* Google Maps Actions */}
            <div className="flex items-center gap-2 pt-0.5">
              {mapsLocationUrl && (
                <a
                  href={mapsLocationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-medium transition-colors cursor-pointer"
                  title="Open location in Google Maps"
                >
                  <ExternalLink className="w-3 h-3 text-neutral-500 dark:text-neutral-400" />
                  View Location
                </a>
              )}
              {mapsDirectionsUrl && (
                <a
                  href={mapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary-50 dark:bg-primary-950/60 hover:bg-primary-100 dark:hover:bg-primary-900/60 text-primary-700 dark:text-primary-300 text-xs font-medium border border-primary-200 dark:border-primary-800/60 transition-colors cursor-pointer"
                  title="Get directions in Google Maps"
                >
                  <Navigation className="w-3 h-3 text-primary-600 dark:text-primary-400" />
                  Get Directions
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-neutral-400 dark:text-neutral-500">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>Location not available</span>
          </div>
        )}
      </div>

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
