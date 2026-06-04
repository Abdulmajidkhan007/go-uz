import type { GeoPoint } from '@vroom/types';

// ---------------------------------------------------------------------------
// Geo helpers — pure, deterministic, no platform dependencies
// ---------------------------------------------------------------------------

const EARTH_RADIUS_METERS = 6_371_000;

/**
 * Computes the great-circle distance between two WGS-84 coordinates using
 * the Haversine formula.
 *
 * @returns Distance in metres. Suitable for short-to-medium distances; for
 *          very long routes consider a routing API instead.
 */
export function haversineMeters(a: GeoPoint, b: GeoPoint): number {
  const toRad = (deg: number): number => (deg * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);

  const chord =
    sinDLat * sinDLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDLng * sinDLng;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(chord));
}

/**
 * Rough travel-time estimate based on straight-line distance.
 *
 * Applies a 1.4× winding factor to convert straight-line distance to an
 * approximate road distance before dividing by speed.
 *
 * @param distanceMeters - Straight-line (haversine) or road distance in metres.
 * @param avgSpeedKmh    - Average speed; defaults to 30 km/h (urban driving).
 * @returns Estimated duration in whole seconds.
 */
export function estimateDurationSeconds(
  distanceMeters: number,
  avgSpeedKmh: number = 30,
): number {
  const WINDING_FACTOR = 1.4;
  const speedMs = (avgSpeedKmh * 1000) / 3600;
  return Math.round((distanceMeters * WINDING_FACTOR) / speedMs);
}

/**
 * Computes the midpoint between two GeoPoints.
 * Useful for centering a map view between two pins.
 */
export function midpoint(a: GeoPoint, b: GeoPoint): GeoPoint {
  return {
    lat: (a.lat + b.lat) / 2,
    lng: (a.lng + b.lng) / 2,
  };
}

/**
 * Returns `true` when two GeoPoints are within `toleranceMeters` of each other.
 */
export function isWithinRadius(
  a: GeoPoint,
  b: GeoPoint,
  toleranceMeters: number,
): boolean {
  return haversineMeters(a, b) <= toleranceMeters;
}
