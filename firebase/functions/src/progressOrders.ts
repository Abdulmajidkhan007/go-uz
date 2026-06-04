/**
 * progressOrders — Firestore-triggered Cloud Function (SAMPLE / ILLUSTRATIVE)
 *
 * This function advances trip, delivery, and payment statuses server-side,
 * mirroring the timing thresholds used by the mock ticker in:
 *   packages/api/src/mock/ticker.ts
 *
 * It is triggered on WRITE to trips/{tripId} and deliveries/{deliveryId}
 * and runs a scheduled check every minute for payments.
 *
 * NOTE: This file is intentionally outside the main monorepo tsconfig include
 * path and has its own tsconfig.json. It does NOT compile as part of the
 * `packages/api` type-check. It is illustrative — deploy it to a real Firebase
 * project after installing firebase-admin and firebase-functions.
 *
 * Timing thresholds (mirrors mock/ticker.ts):
 *   Trip:
 *     matching        ->  driver_assigned   after  5 s
 *     driver_assigned ->  arriving          after 15 s
 *     arriving        ->  in_progress       after 40 s
 *     in_progress     ->  completed         after 90 s
 *
 *   Delivery:
 *     courier_search   ->  courier_assigned  after  5 s
 *     courier_assigned ->  pickup_enroute    after 15 s
 *     pickup_enroute   ->  picked_up         after 40 s
 *     picked_up        ->  dropoff_enroute   after 60 s
 *     dropoff_enroute  ->  delivered         after 90 s
 *
 *   Payment:
 *     pending    ->  authorized  after 10 s
 *     authorized ->  captured    after 20 s
 *     captured   ->  settled     after 60 s
 */

import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import type { Timestamp, DocumentData } from 'firebase-admin/firestore';

admin.initializeApp();
const db = admin.firestore();

// ---------------------------------------------------------------------------
// Stub driver/vehicle for status transitions that require them
// ---------------------------------------------------------------------------

const STUB_DRIVER = {
  id: 'drv_stub_001',
  displayName: 'Jasur Karimov',
  rating: 4.9,
  vehicleId: 'veh_stub_001',
  phoneMasked: '+998 ** *** 77',
};

const STUB_VEHICLE = {
  id: 'veh_stub_001',
  class: 'economy',
  plate: '01 A 123 AA',
  model: 'Chevrolet Cobalt',
  color: 'white',
  capacity: 4,
  etaMinutes: 3,
};

const STUB_COURIER = {
  id: 'drv_stub_002',
  displayName: 'Bekzod Yusupov',
  rating: 4.8,
  vehicleId: 'veh_stub_002',
  phoneMasked: '+998 ** *** 88',
};

// ---------------------------------------------------------------------------
// Timing thresholds in milliseconds
// ---------------------------------------------------------------------------

const TRIP_TRANSITIONS: Record<string, { nextKind: string; afterMs: number }> = {
  matching:        { nextKind: 'driver_assigned', afterMs: 5_000 },
  driver_assigned: { nextKind: 'arriving',        afterMs: 15_000 },
  arriving:        { nextKind: 'in_progress',      afterMs: 40_000 },
  in_progress:     { nextKind: 'completed',        afterMs: 90_000 },
};

const DELIVERY_TRANSITIONS: Record<string, { nextKind: string; afterMs: number }> = {
  courier_search:   { nextKind: 'courier_assigned', afterMs: 5_000 },
  courier_assigned: { nextKind: 'pickup_enroute',   afterMs: 15_000 },
  pickup_enroute:   { nextKind: 'picked_up',        afterMs: 40_000 },
  picked_up:        { nextKind: 'dropoff_enroute',  afterMs: 60_000 },
  dropoff_enroute:  { nextKind: 'delivered',        afterMs: 90_000 },
};

const PAYMENT_TRANSITIONS: Record<string, { nextKind: string; afterMs: number }> = {
  pending:    { nextKind: 'authorized', afterMs: 10_000 },
  authorized: { nextKind: 'captured',  afterMs: 20_000 },
  captured:   { nextKind: 'settled',   afterMs: 60_000 },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function elapsedMs(createdAt: Timestamp): number {
  return Date.now() - createdAt.toMillis();
}

function nextTripStatus(kind: string): object | null {
  switch (kind) {
    case 'driver_assigned':
    case 'arriving':
    case 'in_progress':
      return { kind, driver: STUB_DRIVER, vehicle: STUB_VEHICLE };
    case 'completed':
      return { kind: 'completed' };
    default:
      return { kind };
  }
}

function nextDeliveryStatus(kind: string): object | null {
  switch (kind) {
    case 'courier_assigned':
    case 'pickup_enroute':
    case 'picked_up':
    case 'dropoff_enroute':
    case 'delivered':
    case 'returning':
    case 'returned':
      return { kind, courier: STUB_COURIER };
    default:
      return { kind };
  }
}

// ---------------------------------------------------------------------------
// Trip status progression — triggered on write
// ---------------------------------------------------------------------------

export const onTripWrite = functions.firestore
  .document('trips/{tripId}')
  .onWrite(async (change) => {
    const after = change.after;
    if (!after.exists) return;

    const data = after.data() as DocumentData;
    const status = data['status'] as { kind: string } | undefined;
    const currentKind = status?.kind ?? '';
    const transition = TRIP_TRANSITIONS[currentKind];

    if (transition === undefined) return; // terminal state

    const createdAt = data['createdAt'] as Timestamp | undefined;
    if (createdAt === undefined) return;

    const elapsed = elapsedMs(createdAt);
    const delayMs = Math.max(0, transition.afterMs - elapsed);

    // Schedule the update after the remaining delay.
    // Cloud Functions v2 supports `setTimeout` in onCall but not in Firestore
    // triggers. The recommended pattern is to use Cloud Tasks or a scheduled
    // function. For illustrative purposes we use a simple setTimeout here
    // (works in emulator; in production replace with Cloud Tasks).
    await new Promise<void>((resolve) => setTimeout(resolve, delayMs));

    const nowTs = admin.firestore.Timestamp.now();
    const newStatus = nextTripStatus(transition.nextKind);
    const timeline = [
      ...(Array.isArray(data['timeline']) ? data['timeline'] : []),
      { status: transition.nextKind, at: nowTs },
    ];

    await after.ref.update({ status: newStatus, timeline });
  });

// ---------------------------------------------------------------------------
// Delivery status progression — triggered on write
// ---------------------------------------------------------------------------

export const onDeliveryWrite = functions.firestore
  .document('deliveries/{deliveryId}')
  .onWrite(async (change) => {
    const after = change.after;
    if (!after.exists) return;

    const data = after.data() as DocumentData;
    const status = data['status'] as { kind: string } | undefined;
    const currentKind = status?.kind ?? '';
    const transition = DELIVERY_TRANSITIONS[currentKind];

    if (transition === undefined) return;

    const createdAt = data['createdAt'] as Timestamp | undefined;
    if (createdAt === undefined) return;

    const elapsed = elapsedMs(createdAt);
    const delayMs = Math.max(0, transition.afterMs - elapsed);

    await new Promise<void>((resolve) => setTimeout(resolve, delayMs));

    const nowTs = admin.firestore.Timestamp.now();
    const newStatus = nextDeliveryStatus(transition.nextKind);
    const timeline = [
      ...(Array.isArray(data['timeline']) ? data['timeline'] : []),
      { status: transition.nextKind, at: nowTs },
    ];

    await after.ref.update({ status: newStatus, timeline });
  });

// ---------------------------------------------------------------------------
// Payment status progression — scheduled every minute
// ---------------------------------------------------------------------------

export const progressPayments = functions.pubsub
  .schedule('every 1 minutes')
  .onRun(async () => {
    const snap = await db
      .collection('payments')
      .where('state.kind', 'in', ['pending', 'authorized', 'captured'])
      .limit(100)
      .get();

    const batch = db.batch();
    const now = admin.firestore.Timestamp.now();

    for (const docSnap of snap.docs) {
      const data = docSnap.data() as DocumentData;
      const state = data['state'] as { kind: string } | undefined;
      const currentKind = state?.kind ?? '';
      const transition = PAYMENT_TRANSITIONS[currentKind];

      if (transition === undefined) continue;

      const createdAt = data['createdAt'] as Timestamp | undefined;
      if (createdAt === undefined) continue;

      if (elapsedMs(createdAt) >= transition.afterMs) {
        batch.update(docSnap.ref, { state: { kind: transition.nextKind } });
      }
    }

    await batch.commit();
  });
