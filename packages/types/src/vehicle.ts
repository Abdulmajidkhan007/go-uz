import type { VehicleId, DriverId } from './common.js';

// ---------------------------------------------------------------------------
// Vehicle class
// ---------------------------------------------------------------------------

export type VehicleClass =
  | 'economy'
  | 'comfort'
  | 'xl'
  | 'courier_bike'
  | 'courier_van';

// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------

export interface Vehicle {
  readonly id: VehicleId;
  readonly class: VehicleClass;
  /** License plate string. */
  readonly plate: string;
  /** Human-readable model name, e.g. "Chevrolet Malibu". */
  readonly model: string;
  readonly color: string;
  /** Maximum passenger or parcel capacity (context-dependent). */
  readonly capacity: number;
  /** Live estimated-time-of-arrival in minutes; absent when not yet dispatched. */
  readonly etaMinutes?: number;
}

export interface Driver {
  readonly id: DriverId;
  readonly displayName: string;
  /** Aggregate rating, 1.0–5.0. */
  readonly rating: number;
  readonly avatarUrl?: string;
  readonly vehicleId: VehicleId;
  /** Partially masked phone number for display, e.g. "+998 ** *** 67". */
  readonly phoneMasked: string;
}
