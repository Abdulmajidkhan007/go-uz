import type { TripStatus, DeliveryStatus, PaymentState, UserStatus } from '@vroom/types';

// ---------------------------------------------------------------------------
// Human-readable status labels
// Status union `kind` discriminants mapped to display strings.
// ---------------------------------------------------------------------------

/** Labels for TripStatus `kind` discriminants. */
export const TRIP_STATUS_LABELS: Readonly<Record<TripStatus['kind'], string>> = {
  requested: 'Finding drivers…',
  matching: 'Matching driver…',
  driver_assigned: 'Driver assigned',
  arriving: 'Driver on the way',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_drivers: 'No drivers available',
} as const;

/** Labels for DeliveryStatus `kind` discriminants. */
export const DELIVERY_STATUS_LABELS: Readonly<Record<DeliveryStatus['kind'], string>> = {
  created: 'Created',
  courier_search: 'Finding courier…',
  courier_assigned: 'Courier assigned',
  pickup_enroute: 'Courier on the way',
  picked_up: 'Package picked up',
  dropoff_enroute: 'En route to delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  failed_delivery: 'Delivery failed',
  returning: 'Returning to sender',
  returned: 'Returned to sender',
} as const;

/** Labels for PaymentState `kind` discriminants. */
export const PAYMENT_STATE_LABELS: Readonly<Record<PaymentState['kind'], string>> = {
  pending: 'Pending',
  authorized: 'Authorised',
  captured: 'Captured',
  settled: 'Settled',
  failed: 'Failed',
  refund_pending: 'Refund pending',
  refunded: 'Refunded',
} as const;

/** Labels for UserStatus values. */
export const USER_STATUS_LABELS: Readonly<Record<UserStatus, string>> = {
  active: 'Active',
  suspended: 'Suspended',
  pending_verification: 'Pending verification',
} as const;
