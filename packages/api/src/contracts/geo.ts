import type { GeoPoint, PlaceSuggestion, Address } from '@vroom/types';

// ---------------------------------------------------------------------------
// Geo contracts
// ---------------------------------------------------------------------------

export interface AutocompleteReq {
  readonly query: string;
  /** Optional bias point for proximity ranking. */
  readonly near?: GeoPoint;
}

export type AutocompleteRes = readonly PlaceSuggestion[];

export interface ReverseGeocodeReq {
  readonly point: GeoPoint;
}

export type ReverseGeocodeRes = Address;
