/**
 * Core primitives shared across every domain model.
 * No imports from external packages — this file must have zero dependencies.
 */

// ---------------------------------------------------------------------------
// Brand helper
// ---------------------------------------------------------------------------

/** Phantom-type brand. Makes `Brand<string,'UserId'>` incompatible with a raw string. */
export type Brand<T, B extends string> = T & { readonly __brand: B };

// ---------------------------------------------------------------------------
// Branded IDs
// ---------------------------------------------------------------------------

export type UserId = Brand<string, 'UserId'>;
export type AddressId = Brand<string, 'AddressId'>;
export type TripId = Brand<string, 'TripId'>;
export type DeliveryId = Brand<string, 'DeliveryId'>;
export type OrderId = Brand<string, 'OrderId'>;
export type PaymentId = Brand<string, 'PaymentId'>;
export type PaymentMethodId = Brand<string, 'PaymentMethodId'>;
export type PromoId = Brand<string, 'PromoId'>;
export type TicketId = Brand<string, 'TicketId'>;
export type NotificationId = Brand<string, 'NotificationId'>;
export type VehicleId = Brand<string, 'VehicleId'>;
export type DriverId = Brand<string, 'DriverId'>;
export type QuoteId = Brand<string, 'QuoteId'>;

// ---------------------------------------------------------------------------
// Scalar primitives
// ---------------------------------------------------------------------------

/** ISO-8601 date-time string, e.g. "2024-03-15T10:30:00Z". */
export type IsoDateTime = Brand<string, 'IsoDateTime'>;

/** Supported currency codes. */
export type CurrencyCode = 'UZS' | 'USD' | 'EUR';

/**
 * Monetary value expressed in minor units (e.g. tiyins for UZS, cents for USD).
 * Always carry the currency alongside the amount to avoid implicit conversions.
 */
export interface Money {
  /** Amount in the smallest unit of the currency (minor units). */
  readonly amount: number;
  readonly currency: CurrencyCode;
}

/** WGS-84 geographic coordinate. */
export interface GeoPoint {
  readonly lat: number;
  readonly lng: number;
}

// ---------------------------------------------------------------------------
// Generic collection wrappers
// ---------------------------------------------------------------------------

/** Cursor-based paginated response. */
export interface Paginated<T> {
  readonly items: readonly T[];
  readonly nextCursor?: string;
}

// ---------------------------------------------------------------------------
// Result type  (duplicated in utils/result.ts with helpers; keep in sync)
// ---------------------------------------------------------------------------

/** A discriminated-union result type for explicit error handling without exceptions. */
export type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };
