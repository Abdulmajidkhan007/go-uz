import type { TripId, UserId, PaymentId, GeoPoint, Money, IsoDateTime } from './common.js';
import type { Driver, Vehicle } from './vehicle.js';

// ---------------------------------------------------------------------------
// Timeline
// ---------------------------------------------------------------------------

export interface TimelineEntry {
  readonly status: string;
  readonly at: IsoDateTime;
}

// ---------------------------------------------------------------------------
// TripStatus — discriminated union so each state carries exactly the
// right data. Compiler prevents accessing `driver` on a `requested` trip.
// ---------------------------------------------------------------------------

export type TripStatusRequested = { readonly kind: 'requested' };
export type TripStatusMatching = { readonly kind: 'matching' };
export type TripStatusNoDrivers = { readonly kind: 'no_drivers' };

export interface TripStatusDriverAssigned {
  readonly kind: 'driver_assigned';
  readonly driver: Driver;
  readonly vehicle: Vehicle;
}

export interface TripStatusArriving {
  readonly kind: 'arriving';
  readonly driver: Driver;
  readonly vehicle: Vehicle;
}

export interface TripStatusInProgress {
  readonly kind: 'in_progress';
  readonly driver: Driver;
  readonly vehicle: Vehicle;
}

export type TripStatusCompleted = { readonly kind: 'completed' };

export interface TripStatusCancelled {
  readonly kind: 'cancelled';
  readonly cancelledBy: 'rider' | 'driver' | 'system';
  readonly reason: string;
}

export type TripStatus =
  | TripStatusRequested
  | TripStatusMatching
  | TripStatusDriverAssigned
  | TripStatusArriving
  | TripStatusInProgress
  | TripStatusCompleted
  | TripStatusCancelled
  | TripStatusNoDrivers;

// ---------------------------------------------------------------------------
// Trip entity
// ---------------------------------------------------------------------------

export interface Trip {
  readonly id: TripId;
  readonly riderId: UserId;
  readonly pickup: GeoPoint;
  readonly dropoff: GeoPoint;
  /** Optional intermediate stops between pickup and dropoff. */
  readonly stops?: readonly GeoPoint[];
  readonly fare: Money;
  readonly status: TripStatus;
  /** Ordered array of coordinates representing the planned or driven route. */
  readonly route?: readonly GeoPoint[];
  readonly timeline: readonly TimelineEntry[];
  readonly paymentId?: PaymentId;
  readonly createdAt: IsoDateTime;
}
