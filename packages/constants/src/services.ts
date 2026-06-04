import type { ServiceType } from '@vroom/types';

// ---------------------------------------------------------------------------
// Service types
// ---------------------------------------------------------------------------

/** All supported service types offered by the platform. */
export const SERVICE_TYPES = ['ride', 'delivery'] as const satisfies readonly ServiceType[];

/** Human-readable display labels for each service type. */
export const SERVICE_TYPE_LABELS: Readonly<Record<ServiceType, string>> = {
  ride: 'Ride',
  delivery: 'Delivery',
} as const;
