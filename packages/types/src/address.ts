import type { AddressId, UserId, GeoPoint } from './common.js';

// ---------------------------------------------------------------------------
// Address label
// ---------------------------------------------------------------------------

export type AddressLabel = 'home' | 'work' | 'custom';

// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------

export interface Address {
  readonly id: AddressId;
  readonly userId: UserId;
  readonly label: AddressLabel;
  /** Human-readable single-line address string. */
  readonly formatted: string;
  readonly geo: GeoPoint;
  /** External place identifier (e.g. from a geocoding provider). */
  readonly placeId?: string;
  readonly notes?: string;
}

/** Autocomplete suggestion returned by a place-search endpoint. */
export interface PlaceSuggestion {
  readonly placeId: string;
  /** Main display text, e.g. street name or POI name. */
  readonly primaryText: string;
  /** Secondary display text, e.g. city or district. */
  readonly secondaryText: string;
  /** Coordinates, populated when the suggestion is already resolved. */
  readonly geo?: GeoPoint;
}
