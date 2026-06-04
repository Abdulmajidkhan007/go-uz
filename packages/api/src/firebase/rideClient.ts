/**
 * Firebase Firestore implementation of RideApi.
 *
 * Fare computation:
 *   Runs client-side using haversineMeters from @vroom/utils.
 *   Rates (per-km in UZS minor units):
 *     economy: base 5000 + 1200/km
 *     comfort:  base 8000 + 1800/km
 *     xl:       base 12000 + 2500/km
 *     default:  base 5000 + 1000/km
 *   Surge multiplier = 1 (no dynamic pricing in this adapter).
 *
 * Paths:
 *   quotes/{quoteId}  — fare quote (written on getRideQuote)
 *   trips/{tripId}    — trip document
 *   orders/{orderId}  — order envelope
 *
 * Status progression is driven server-side by the Cloud Function in
 * firebase/functions/src/progressOrders.ts — this client only reads docs.
 */
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { haversineMeters, estimateDurationSeconds, createId } from '@vroom/utils';
import type { TripId, PaymentId, OrderId, QuoteId, IsoDateTime, CurrencyCode } from '@vroom/types';
import type { RideApi } from '../endpoints/ride.js';
import { unauthorizedError, notFoundError, conflictError } from '../errors.js';
import { err } from '@vroom/utils';
import { fbGuard } from './errors.js';
import { COLLECTIONS, docToTrip, isoToTs } from './mappers.js';

// ---------------------------------------------------------------------------
// Fare calculation helpers
// ---------------------------------------------------------------------------

const BASE_FARE: Record<string, number> = {
  economy: 5_000,
  comfort: 8_000,
  xl: 12_000,
  courier_bike: 4_000,
  courier_van: 7_000,
};

const PER_KM: Record<string, number> = {
  economy: 1_200,
  comfort: 1_800,
  xl: 2_500,
  courier_bike: 900,
  courier_van: 1_500,
};

const CURRENCY = 'UZS' as CurrencyCode;

function computeFare(vehicleClass: string, distanceMeters: number): number {
  const base = BASE_FARE[vehicleClass] ?? 5_000;
  const perKm = PER_KM[vehicleClass] ?? 1_000;
  return Math.round(base + (distanceMeters / 1_000) * perKm);
}

// ---------------------------------------------------------------------------
// Terminal-state check
// ---------------------------------------------------------------------------

function isTripTerminal(kind: string): boolean {
  return kind === 'completed' || kind === 'cancelled' || kind === 'no_drivers';
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createRideClient(auth: Auth, db: Firestore): RideApi {
  function requireUid(): string | null {
    return auth.currentUser?.uid ?? null;
  }

  return {
    async getRideQuote(req) {
      const uid = requireUid();
      if (uid === null) return err(unauthorizedError('Not authenticated'));

      return fbGuard(async () => {
        const distanceMeters = haversineMeters(req.pickup, req.dropoff);
        const durationSeconds = estimateDurationSeconds(distanceMeters);
        const fareAmount = computeFare(req.vehicleClass, distanceMeters);
        const quoteId = createId('qid') as QuoteId;
        const expiresAt = new Date(Date.now() + 300_000).toISOString() as IsoDateTime;

        const quoteData = {
          serviceType: 'ride',
          pickup: req.pickup,
          dropoff: req.dropoff,
          vehicleClass: req.vehicleClass,
          estimate: { amount: fareAmount, currency: CURRENCY },
          surgeMultiplier: 1,
          distanceMeters,
          durationSeconds,
          expiresAt: isoToTs(expiresAt),
          createdAt: Timestamp.now(),
          userId: uid,
        };

        await setDoc(doc(db, COLLECTIONS.quotes, quoteId), quoteData);

        return {
          id: quoteId,
          serviceType: 'ride' as const,
          pickup: req.pickup,
          dropoff: req.dropoff,
          vehicleClass: req.vehicleClass,
          estimate: { amount: fareAmount, currency: CURRENCY },
          surgeMultiplier: 1,
          distanceMeters,
          durationSeconds,
          expiresAt,
        };
      });
    },

    async requestRide(req) {
      const uid = requireUid();
      if (uid === null) return err(unauthorizedError('Not authenticated'));

      return fbGuard(async () => {
        // Resolve quote for pickup/dropoff + fare.
        const quoteSnap = await getDoc(doc(db, COLLECTIONS.quotes, req.quoteId));
        const quoteData = quoteSnap.exists()
          ? quoteSnap.data()
          : {
              pickup: { lat: 0, lng: 0 },
              dropoff: { lat: 0, lng: 0 },
              estimate: { amount: 18_000_00, currency: CURRENCY },
            };

        const tripId = createId('trp') as TripId;
        const paymentId = createId('pay') as PaymentId;
        const orderId = createId('ord') as OrderId;
        const now = Timestamp.now();
        const nowIso = now.toDate().toISOString() as IsoDateTime;

        const tripDoc = {
          riderId: uid,
          pickup: quoteData['pickup'] ?? { lat: 0, lng: 0 },
          dropoff: quoteData['dropoff'] ?? { lat: 0, lng: 0 },
          fare: quoteData['estimate'] ?? { amount: 0, currency: CURRENCY },
          status: { kind: 'matching' },
          timeline: [{ status: 'matching', at: now }],
          paymentId,
          createdAt: now,
          quoteId: req.quoteId,
          ...(req.promoCode !== undefined ? { promoCode: req.promoCode } : {}),
        };

        const paymentDoc = {
          orderId,
          methodId: req.paymentMethodId,
          amount: quoteData['estimate'] ?? { amount: 0, currency: CURRENCY },
          state: { kind: 'pending' },
          createdAt: now,
        };

        const orderDoc = {
          kind: 'ride',
          refId: tripId,
          state: 'placed',
          userId: uid,
          createdAt: now,
        };

        await Promise.all([
          setDoc(doc(db, COLLECTIONS.trips, tripId), tripDoc),
          setDoc(doc(db, COLLECTIONS.payments, paymentId), paymentDoc),
          setDoc(doc(db, COLLECTIONS.orders, orderId), orderDoc),
        ]);

        return docToTrip(tripId, {
          ...tripDoc,
          timeline: [{ status: 'matching', at: now }],
          createdAt: now,
        });
      });
    },

    async getTrip(req) {
      const uid = requireUid();
      if (uid === null) return err(unauthorizedError('Not authenticated'));

      return fbGuard(async () => {
        const snap = await getDoc(doc(db, COLLECTIONS.trips, req.tripId));
        if (!snap.exists()) {
          throw Object.assign(new Error(`Trip ${req.tripId} not found`), { code: 'not-found' });
        }
        const data = snap.data();
        if (data['riderId'] !== uid) {
          throw Object.assign(new Error('Insufficient permissions'), { code: 'permission-denied' });
        }
        return docToTrip(snap.id, data);
      });
    },

    async cancelTrip(req) {
      const uid = requireUid();
      if (uid === null) return err(unauthorizedError('Not authenticated'));

      return fbGuard(async () => {
        const tripRef = doc(db, COLLECTIONS.trips, req.tripId);
        const snap = await getDoc(tripRef);
        if (!snap.exists()) {
          throw Object.assign(new Error(`Trip ${req.tripId} not found`), { code: 'not-found' });
        }
        const data = snap.data();
        if (data['riderId'] !== uid) {
          throw Object.assign(new Error('Insufficient permissions'), { code: 'permission-denied' });
        }

        const currentKind = (data['status'] as { kind: string } | undefined)?.kind ?? '';
        if (isTripTerminal(currentKind)) {
          throw Object.assign(
            new Error(`Trip ${req.tripId} is already in a terminal state`),
            { code: 'failed-precondition' },
          );
        }

        const now = Timestamp.now();
        const cancelledStatus = { kind: 'cancelled', cancelledBy: 'rider', reason: req.reason };
        const timeline = [
          ...(Array.isArray(data['timeline']) ? data['timeline'] : []),
          { status: 'cancelled', at: now },
        ];

        await updateDoc(tripRef, { status: cancelledStatus, timeline });

        return docToTrip(snap.id, { ...data, status: cancelledStatus, timeline });
      });
    },
  };
}
