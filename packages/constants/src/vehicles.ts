import type { VehicleClass } from '@vroom/types';

// ---------------------------------------------------------------------------
// Vehicle class registry
// ---------------------------------------------------------------------------

/** Ordered list of all vehicle classes from cheapest to most specialised. */
export const VEHICLE_CLASSES = [
  'economy',
  'comfort',
  'xl',
  'courier_bike',
  'courier_van',
] as const satisfies readonly VehicleClass[];

/** Human-readable display labels for each vehicle class. */
export const VEHICLE_CLASS_LABELS: Readonly<Record<VehicleClass, string>> = {
  economy: 'Economy',
  comfort: 'Comfort',
  xl: 'XL',
  courier_bike: 'Courier Bike',
  courier_van: 'Courier Van',
} as const;
