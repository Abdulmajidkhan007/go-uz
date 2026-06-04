/**
 * Firebase Firestore implementation of DeliveryApi.
 *
 * Mirrors rideClient: haversine fare computation, quote -> delivery -> order.
 *
 * Parcel size surcharge:
 *   s: courier_bike rates
 *   m: courier_bike rates + 15% surcharge
 *   l: courier_van rates
 *   xl: courier_van rates + 20% surcharge
 *
 * Paths:
 *   quotes/{quoteId}        — fare quote
 *   deliveries/{id}         — delivery document
 *   orders/{orderId}        — order envelope (kind='delivery')
 *   payments/{paymentId}    — payment record
 *
 * Status progression is driven server-side by the Cloud Function.
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
import type { DeliveryId, PaymentId, OrderId, QuoteId, IsoDateTime, CurrencyCode, AddressId, UserId } from '@vroom/types';
import type { DeliveryApi } from '../endpoints/delivery.js';
import { unauthorizedError } from '../errors.js';
import { err } from '@vroom/utils';
import { fbGuard } from './errors.js';
import { COLLECTIONS, docToDelivery, isoToTs } from './mappers.js';

const CURRENCY = 'UZS' as CurrencyCode;

// Delivery vehicle class by parcel size
function vehicleClassForParcel(sizeClass: string): string {
  return sizeClass === 'l' || sizeClass === 'xl' ? 'courier_van' : 'courier_bike';
}

// Base + per-km in UZS minor units
const BASE_FARE: Record<string, number> = { courier_bike: 4_000, courier_van: 7_000 };
const PER_KM: Record<string, number> = { courier_bike: 900, courier_van: 1_500 };

function computeDeliveryFare(sizeClass: string, distanceMeters: number): number {
  const vehicleClass = vehicleClassForParcel(sizeClass);
  const base = BASE_FARE[vehicleClass] ?? 4_000;
  const perKm = PER_KM[vehicleClass] ?? 900;
  const surcharge = sizeClass === 'xl' ? 1.2 : sizeClass === 'm' ? 1.15 : 1.0;
  return Math.round((base + (distanceMeters / 1_000) * perKm) * surcharge);
}

function isDeliveryTerminal(kind: string): boolean {
  return ['delivered', 'cancelled', 'failed_delivery', 'returned'].includes(kind);
}

export function createDeliveryClient(auth: Auth, db: Firestore): DeliveryApi {
  function requireUid(): string | null {
    return auth.currentUser?.uid ?? null;
  }

  return {
    async getDeliveryQuote(req) {
      const uid = requireUid();
      if (uid === null) return err(unauthorizedError('Not authenticated'));

      return fbGuard(async () => {
        const distanceMeters = haversineMeters(req.pickup, req.dropoff);
        const durationSeconds = estimateDurationSeconds(distanceMeters);
        const fareAmount = computeDeliveryFare(req.parcel.sizeClass, distanceMeters);
        const vehicleClass = vehicleClassForParcel(req.parcel.sizeClass);
        const quoteId = createId('qid') as QuoteId;
        const expiresAt = new Date(Date.now() + 300_000).toISOString() as IsoDateTime;

        const quoteData = {
          serviceType: 'delivery',
          pickup: req.pickup,
          dropoff: req.dropoff,
          vehicleClass,
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
          serviceType: 'delivery' as const,
          pickup: req.pickup,
          dropoff: req.dropoff,
          vehicleClass: vehicleClass as import('@vroom/types').VehicleClass,
          estimate: { amount: fareAmount, currency: CURRENCY },
          surgeMultiplier: 1,
          distanceMeters,
          durationSeconds,
          expiresAt,
        };
      });
    },

    async createDelivery(req) {
      const uid = requireUid();
      if (uid === null) return err(unauthorizedError('Not authenticated'));

      return fbGuard(async () => {
        const quoteSnap = await getDoc(doc(db, COLLECTIONS.quotes, req.quoteId));
        const quoteData = quoteSnap.exists()
          ? quoteSnap.data()
          : {
              pickup: { lat: 0, lng: 0 },
              dropoff: { lat: 0, lng: 0 },
              estimate: { amount: 15_000_00, currency: CURRENCY },
            };

        const deliveryId = createId('dlv') as DeliveryId;
        const paymentId = createId('pay') as PaymentId;
        const orderId = createId('ord') as OrderId;
        const now = Timestamp.now();

        // Build embedded address objects for pickup/dropoff.
        const pickupGeo = quoteData['pickup'] ?? { lat: 0, lng: 0 };
        const dropoffGeo = quoteData['dropoff'] ?? { lat: 0, lng: 0 };

        const pickupAddr = {
          id: createId('addr') as AddressId,
          userId: uid as UserId,
          label: 'custom',
          formatted: 'Pickup address',
          geo: pickupGeo,
        };
        const dropoffAddr = {
          id: createId('addr') as AddressId,
          userId: uid as UserId,
          label: 'custom',
          formatted: 'Dropoff address',
          geo: dropoffGeo,
        };

        const deliveryDoc = {
          senderId: uid,
          pickup: pickupAddr,
          dropoff: dropoffAddr,
          recipient: req.recipient,
          parcel: req.parcel,
          fare: quoteData['estimate'] ?? { amount: 0, currency: CURRENCY },
          status: { kind: 'courier_search' },
          timeline: [{ status: 'courier_search', at: now }],
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
          kind: 'delivery',
          refId: deliveryId,
          state: 'placed',
          userId: uid,
          createdAt: now,
        };

        await Promise.all([
          setDoc(doc(db, COLLECTIONS.deliveries, deliveryId), deliveryDoc),
          setDoc(doc(db, COLLECTIONS.payments, paymentId), paymentDoc),
          setDoc(doc(db, COLLECTIONS.orders, orderId), orderDoc),
        ]);

        return docToDelivery(deliveryId, deliveryDoc);
      });
    },

    async getDelivery(req) {
      const uid = requireUid();
      if (uid === null) return err(unauthorizedError('Not authenticated'));

      return fbGuard(async () => {
        const snap = await getDoc(doc(db, COLLECTIONS.deliveries, req.deliveryId));
        if (!snap.exists()) {
          throw Object.assign(new Error(`Delivery ${req.deliveryId} not found`), {
            code: 'not-found',
          });
        }
        const data = snap.data();
        if (data['senderId'] !== uid) {
          throw Object.assign(new Error('Insufficient permissions'), { code: 'permission-denied' });
        }
        return docToDelivery(snap.id, data);
      });
    },

    async cancelDelivery(req) {
      const uid = requireUid();
      if (uid === null) return err(unauthorizedError('Not authenticated'));

      return fbGuard(async () => {
        const deliveryRef = doc(db, COLLECTIONS.deliveries, req.deliveryId);
        const snap = await getDoc(deliveryRef);
        if (!snap.exists()) {
          throw Object.assign(new Error(`Delivery ${req.deliveryId} not found`), {
            code: 'not-found',
          });
        }
        const data = snap.data();
        if (data['senderId'] !== uid) {
          throw Object.assign(new Error('Insufficient permissions'), { code: 'permission-denied' });
        }

        const currentKind = (data['status'] as { kind: string } | undefined)?.kind ?? '';
        if (isDeliveryTerminal(currentKind)) {
          throw Object.assign(
            new Error(`Delivery ${req.deliveryId} is already in a terminal state`),
            { code: 'failed-precondition' },
          );
        }

        const now = Timestamp.now();
        const cancelledStatus = { kind: 'cancelled', reason: req.reason };
        const timeline = [
          ...(Array.isArray(data['timeline']) ? data['timeline'] : []),
          { status: 'cancelled', at: now },
        ];

        await updateDoc(deliveryRef, { status: cancelledStatus, timeline });

        return docToDelivery(snap.id, { ...data, status: cancelledStatus, timeline });
      });
    },
  };
}
