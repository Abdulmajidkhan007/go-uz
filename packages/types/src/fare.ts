import type { QuoteId, GeoPoint, Money, IsoDateTime } from './common.js';
import type { VehicleClass } from './vehicle.js';

// ---------------------------------------------------------------------------
// Service type
// ---------------------------------------------------------------------------

export type ServiceType = 'ride' | 'delivery';

// ---------------------------------------------------------------------------
// Fare quote
// ---------------------------------------------------------------------------

/**
 * A time-limited price estimate for a specific route and service.
 * Always check `expiresAt` before presenting to the user.
 */
export interface FareQuote {
  readonly id: QuoteId;
  readonly serviceType: ServiceType;
  readonly pickup: GeoPoint;
  readonly dropoff: GeoPoint;
  readonly vehicleClass: VehicleClass;
  /** Estimated fare in minor units. */
  readonly estimate: Money;
  /** Demand-based multiplier applied to the base fare (1.0 = no surge). */
  readonly surgeMultiplier: number;
  readonly distanceMeters: number;
  readonly durationSeconds: number;
  /** The quote is only valid until this timestamp. */
  readonly expiresAt: IsoDateTime;
}
