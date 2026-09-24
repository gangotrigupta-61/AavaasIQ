/**
 * Google Maps URL Helpers & Haversine Distance Calculation
 *
 * Uses official Google Maps Search and Directions URL schemes.
 * Requires NO private API keys and NO client SDK downloads.
 * Strictly avoids fabricating addresses or coordinates.
 */

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface ProviderLocationInput {
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

/**
 * Validates that latitude is within [-90, 90] and longitude is within [-180, 180].
 */
export function isValidCoordinatePair(
  lat: unknown,
  lng: unknown
): lat is number {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (isNaN(lat) || isNaN(lng)) return false;
  if (!isFinite(lat) || !isFinite(lng)) return false;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Returns an official Google Maps search/location URL if valid coordinates or address exist.
 * Returns null if location is unavailable.
 */
export function getGoogleMapsLocationUrl(loc: ProviderLocationInput): string | null {
  const { latitude, longitude, address } = loc;

  if (latitude != null && longitude != null && isValidCoordinatePair(latitude, longitude)) {
    return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  }

  const cleanAddress = address?.trim();
  if (cleanAddress) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanAddress)}`;
  }

  return null;
}

/**
 * Returns an official Google Maps directions URL if valid coordinates or address exist.
 * Uses: https://www.google.com/maps/dir/?api=1&destination=LATITUDE,LONGITUDE
 * If origin coordinates are provided, appends &origin=LATITUDE,LONGITUDE.
 * Returns null if destination location is unavailable.
 */
export function getGoogleMapsDirectionsUrl(
  destination: ProviderLocationInput,
  origin?: LocationCoordinates | null
): string | null {
  const { latitude, longitude, address } = destination;

  let destParam = '';
  if (latitude != null && longitude != null && isValidCoordinatePair(latitude, longitude)) {
    destParam = `${latitude},${longitude}`;
  } else if (address && address.trim()) {
    destParam = encodeURIComponent(address.trim());
  } else {
    return null;
  }

  let url = `https://www.google.com/maps/dir/?api=1&destination=${destParam}`;

  if (
    origin &&
    isValidCoordinatePair(origin.latitude, origin.longitude)
  ) {
    url += `&origin=${origin.latitude},${origin.longitude}`;
  }

  return url;
}

/**
 * Calculates the great-circle distance between two points on a sphere (Earth)
 * using the Haversine formula.
 *
 * Returns distance in kilometers (rounded to 1 decimal place), or null if any coordinate is invalid.
 */
export function calculateHaversineDistanceKm(
  lat1: number | null | undefined,
  lon1: number | null | undefined,
  lat2: number | null | undefined,
  lon2: number | null | undefined
): number | null {
  if (
    lat1 == null ||
    lon1 == null ||
    lat2 == null ||
    lon2 == null ||
    !isValidCoordinatePair(lat1, lon1) ||
    !isValidCoordinatePair(lat2, lon2)
  ) {
    return null;
  }

  const R = 6371; // Earth's mean radius in kilometers
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  // Round to 1 decimal place (e.g., 2.4 km)
  return Math.round(d * 10) / 10;
}
