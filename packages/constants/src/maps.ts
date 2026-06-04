import type { GeoPoint } from '@vroom/types';

/**
 * Default map camera settings, shared by the web (Google Maps JS) and mobile
 * (react-native-maps) apps so both render an identical default view.
 */
export const MAP_DEFAULTS: {
  readonly center: GeoPoint;
  readonly zoom: number;
  readonly trackingZoom: number;
} = {
  /** Tashkent city center. */
  center: { lat: 41.2995, lng: 69.2401 },
  zoom: 13,
  trackingZoom: 15,
};
