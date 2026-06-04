/**
 * Status ticker — deterministic time-based state machine.
 *
 * When a Trip or Delivery is created via the mock client, the ticker records
 * its creation timestamp.  `getProgressedTrip` / `getProgressedDelivery`
 * compute the current status based on elapsed wall-clock time, producing a
 * stable read-only snapshot each call.  The store entry is mutated in place
 * so polling via `getTrip` / `getDelivery` returns the advanced state.
 *
 * Progression timings (from creation):
 *
 * Trip:
 *   0 s      → matching
 *   5 s      → driver_assigned
 *   15 s     → arriving
 *   40 s     → in_progress
 *   90 s     → completed
 *
 * Delivery:
 *   0 s      → courier_search
 *   6 s      → courier_assigned
 *   18 s     → pickup_enroute
 *   45 s     → picked_up
 *   70 s     → dropoff_enroute
 *   110 s    → delivered
 *
 * Payment:
 *   0 s      → pending
 *   5 s      → authorized
 *   30 s     → captured
 *   90 s     → settled
 */
import type {
  Trip,
  TripId,
  TripStatus,
  Delivery,
  DeliveryId,
  DeliveryStatus,
  Payment,
  PaymentId,
  PaymentState,
  IsoDateTime,
  TimelineEntry,
} from '@vroom/types';

import { demoDrivers, demoVehicles } from './fixtures.js';
import { store } from './store.js';

// ---------------------------------------------------------------------------
// Creation-time registry — records when each entity was created
// ---------------------------------------------------------------------------

const tripCreatedAt = new Map<TripId, number>();
const deliveryCreatedAt = new Map<DeliveryId, number>();
const paymentCreatedAt = new Map<PaymentId, number>();

export function registerTrip(id: TripId, nowMs: number = Date.now()): void {
  tripCreatedAt.set(id, nowMs);
}

export function registerDelivery(id: DeliveryId, nowMs: number = Date.now()): void {
  deliveryCreatedAt.set(id, nowMs);
}

export function registerPayment(id: PaymentId, nowMs: number = Date.now()): void {
  paymentCreatedAt.set(id, nowMs);
}

// ---------------------------------------------------------------------------
// Terminal state guards
// ---------------------------------------------------------------------------

export function isTripTerminal(status: TripStatus): boolean {
  return status.kind === 'completed' || status.kind === 'cancelled' || status.kind === 'no_drivers';
}

export function isDeliveryTerminal(status: DeliveryStatus): boolean {
  return (
    status.kind === 'delivered' ||
    status.kind === 'cancelled' ||
    status.kind === 'failed_delivery' ||
    status.kind === 'returned'
  );
}

// ---------------------------------------------------------------------------
// Trip progression
// ---------------------------------------------------------------------------

const TRIP_THRESHOLDS = {
  driver_assigned: 5_000,
  arriving: 15_000,
  in_progress: 40_000,
  completed: 90_000,
} as const;

function computeTripStatus(elapsedMs: number, vehicleClass: string): TripStatus {
  const driver = demoDrivers[vehicleClass] ?? demoDrivers['economy'];
  const vehicle = demoVehicles[vehicleClass] ?? demoVehicles['economy'];

  if (elapsedMs < TRIP_THRESHOLDS.driver_assigned) {
    return { kind: 'matching' };
  }
  if (elapsedMs < TRIP_THRESHOLDS.arriving) {
    // driver and vehicle are guaranteed to be defined via the fallback above
    return { kind: 'driver_assigned', driver: driver!, vehicle: vehicle! };
  }
  if (elapsedMs < TRIP_THRESHOLDS.in_progress) {
    return { kind: 'arriving', driver: driver!, vehicle: vehicle! };
  }
  if (elapsedMs < TRIP_THRESHOLDS.completed) {
    return { kind: 'in_progress', driver: driver!, vehicle: vehicle! };
  }
  return { kind: 'completed' };
}

function buildTripTimeline(elapsedMs: number, baseAt: IsoDateTime): readonly TimelineEntry[] {
  const base = new Date(baseAt).getTime();
  const entries: TimelineEntry[] = [{ status: 'matching', at: baseAt }];

  if (elapsedMs >= TRIP_THRESHOLDS.driver_assigned) {
    entries.push({
      status: 'driver_assigned',
      at: new Date(base + TRIP_THRESHOLDS.driver_assigned).toISOString() as IsoDateTime,
    });
  }
  if (elapsedMs >= TRIP_THRESHOLDS.arriving) {
    entries.push({
      status: 'arriving',
      at: new Date(base + TRIP_THRESHOLDS.arriving).toISOString() as IsoDateTime,
    });
  }
  if (elapsedMs >= TRIP_THRESHOLDS.in_progress) {
    entries.push({
      status: 'in_progress',
      at: new Date(base + TRIP_THRESHOLDS.in_progress).toISOString() as IsoDateTime,
    });
  }
  if (elapsedMs >= TRIP_THRESHOLDS.completed) {
    entries.push({
      status: 'completed',
      at: new Date(base + TRIP_THRESHOLDS.completed).toISOString() as IsoDateTime,
    });
  }
  return entries;
}

/**
 * Returns the trip with its status progressed based on elapsed time since
 * creation, and mutates the store so subsequent reads are consistent.
 */
export function getProgressedTrip(trip: Trip, nowMs: number = Date.now()): Trip {
  if (isTripTerminal(trip.status)) return trip;

  const createdMs = tripCreatedAt.get(trip.id);
  if (createdMs === undefined) return trip;

  const elapsedMs = nowMs - createdMs;

  // Infer vehicleClass from the driver if already assigned, else default economy
  let vehicleClass = 'economy';
  if (trip.status.kind === 'driver_assigned' || trip.status.kind === 'arriving' || trip.status.kind === 'in_progress') {
    const vId = trip.status.vehicle.id;
    vehicleClass = Object.entries(demoVehicles).find(([, v]) => v.id === vId)?.[0] ?? 'economy';
  }

  const newStatus = computeTripStatus(elapsedMs, vehicleClass);
  const timeline = buildTripTimeline(elapsedMs, trip.createdAt);
  const progressed: Trip = { ...trip, status: newStatus, timeline };

  store.trips.set(trip.id, progressed);
  return progressed;
}

// ---------------------------------------------------------------------------
// Delivery progression
// ---------------------------------------------------------------------------

const DELIVERY_THRESHOLDS = {
  courier_assigned: 6_000,
  pickup_enroute: 18_000,
  picked_up: 45_000,
  dropoff_enroute: 70_000,
  delivered: 110_000,
} as const;

function computeDeliveryStatus(elapsedMs: number, vehicleClass: string): DeliveryStatus {
  const courier = demoDrivers[vehicleClass] ?? demoDrivers['courier_bike'];

  if (elapsedMs < DELIVERY_THRESHOLDS.courier_assigned) {
    return { kind: 'courier_search' };
  }
  if (elapsedMs < DELIVERY_THRESHOLDS.pickup_enroute) {
    return { kind: 'courier_assigned', courier: courier! };
  }
  if (elapsedMs < DELIVERY_THRESHOLDS.picked_up) {
    return { kind: 'pickup_enroute', courier: courier! };
  }
  if (elapsedMs < DELIVERY_THRESHOLDS.dropoff_enroute) {
    return { kind: 'picked_up', courier: courier! };
  }
  if (elapsedMs < DELIVERY_THRESHOLDS.delivered) {
    return { kind: 'dropoff_enroute', courier: courier! };
  }
  return { kind: 'delivered', courier: courier! };
}

function buildDeliveryTimeline(elapsedMs: number, baseAt: IsoDateTime): readonly TimelineEntry[] {
  const base = new Date(baseAt).getTime();
  const entries: TimelineEntry[] = [{ status: 'courier_search', at: baseAt }];

  if (elapsedMs >= DELIVERY_THRESHOLDS.courier_assigned) {
    entries.push({
      status: 'courier_assigned',
      at: new Date(base + DELIVERY_THRESHOLDS.courier_assigned).toISOString() as IsoDateTime,
    });
  }
  if (elapsedMs >= DELIVERY_THRESHOLDS.pickup_enroute) {
    entries.push({
      status: 'pickup_enroute',
      at: new Date(base + DELIVERY_THRESHOLDS.pickup_enroute).toISOString() as IsoDateTime,
    });
  }
  if (elapsedMs >= DELIVERY_THRESHOLDS.picked_up) {
    entries.push({
      status: 'picked_up',
      at: new Date(base + DELIVERY_THRESHOLDS.picked_up).toISOString() as IsoDateTime,
    });
  }
  if (elapsedMs >= DELIVERY_THRESHOLDS.dropoff_enroute) {
    entries.push({
      status: 'dropoff_enroute',
      at: new Date(base + DELIVERY_THRESHOLDS.dropoff_enroute).toISOString() as IsoDateTime,
    });
  }
  if (elapsedMs >= DELIVERY_THRESHOLDS.delivered) {
    entries.push({
      status: 'delivered',
      at: new Date(base + DELIVERY_THRESHOLDS.delivered).toISOString() as IsoDateTime,
    });
  }
  return entries;
}

/**
 * Returns the delivery with its status progressed based on elapsed time.
 */
export function getProgressedDelivery(delivery: Delivery, nowMs: number = Date.now()): Delivery {
  if (isDeliveryTerminal(delivery.status)) return delivery;

  const createdMs = deliveryCreatedAt.get(delivery.id);
  if (createdMs === undefined) return delivery;

  const elapsedMs = nowMs - createdMs;

  // Determine vehicleClass from the courier if already assigned
  let vehicleClass = 'courier_bike';
  if (
    delivery.status.kind === 'courier_assigned' ||
    delivery.status.kind === 'pickup_enroute' ||
    delivery.status.kind === 'picked_up' ||
    delivery.status.kind === 'dropoff_enroute' ||
    delivery.status.kind === 'delivered'
  ) {
    const vId = delivery.status.courier.vehicleId;
    vehicleClass = Object.entries(demoVehicles).find(([, v]) => v.id === vId)?.[0] ?? 'courier_bike';
  }

  const newStatus = computeDeliveryStatus(elapsedMs, vehicleClass);
  const timeline = buildDeliveryTimeline(elapsedMs, delivery.timeline[0]?.at ?? (new Date().toISOString() as IsoDateTime));
  const progressed: Delivery = { ...delivery, status: newStatus, timeline };

  store.deliveries.set(delivery.id, progressed);
  return progressed;
}

// ---------------------------------------------------------------------------
// Payment progression
// ---------------------------------------------------------------------------

const PAYMENT_THRESHOLDS = {
  authorized: 5_000,
  captured: 30_000,
  settled: 90_000,
} as const;

function computePaymentState(elapsedMs: number): PaymentState {
  if (elapsedMs < PAYMENT_THRESHOLDS.authorized) return { kind: 'pending' };
  if (elapsedMs < PAYMENT_THRESHOLDS.captured) return { kind: 'authorized' };
  if (elapsedMs < PAYMENT_THRESHOLDS.settled) return { kind: 'captured' };
  return { kind: 'settled' };
}

/**
 * Returns the payment with its state progressed based on elapsed time.
 */
export function getProgressedPayment(payment: Payment, nowMs: number = Date.now()): Payment {
  const terminalKinds: ReadonlySet<string> = new Set(['settled', 'failed', 'refunded', 'refund_pending']);
  if (terminalKinds.has(payment.state.kind)) return payment;

  const createdMs = paymentCreatedAt.get(payment.id);
  if (createdMs === undefined) return payment;

  const elapsedMs = nowMs - createdMs;
  const newState = computePaymentState(elapsedMs);
  const progressed: Payment = { ...payment, state: newState };

  store.payments.set(payment.id, progressed);
  return progressed;
}

// ---------------------------------------------------------------------------
// Export thresholds for tests
// ---------------------------------------------------------------------------

export { TRIP_THRESHOLDS, DELIVERY_THRESHOLDS, PAYMENT_THRESHOLDS };
