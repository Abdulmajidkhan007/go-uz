/**
 * In-memory mock implementation of ApiClient.
 *
 * - Auth: any phone accepted; any 6-digit code accepted (treat '000000' as
 *   the canonical test OTP); issues a fixed demo Session.
 * - All methods run through simulateLatency.
 * - Deterministic failures via the latency module's injection toggle.
 * - Status advancement via ticker.ts.
 */
import { ok, err } from '@vroom/utils';
import type {
  TripId,
  DeliveryId,
  PaymentId,
  AddressId,
  TicketId,
  OrderId,
  PaymentMethod,
  IsoDateTime,
} from '@vroom/types';

import type { ApiClient } from '../client.js';
import {
  notFoundError,
  validationError,
  unauthorizedError,
  conflictError,
} from '../errors.js';
import { withLatencyAndFailure } from './latency.js';
import { store } from './store.js';
import {
  registerTrip,
  registerDelivery,
  registerPayment,
  getProgressedTrip,
  getProgressedDelivery,
  getProgressedPayment,
  isTripTerminal,
} from './ticker.js';
import {
  DEMO_SESSION,
  demoUser,
  demoWallet,
  demoFareQuotes,
  demoPromos,
  demoPlaceSuggestions,
  demoAddresses,
} from './fixtures.js';

// ---------------------------------------------------------------------------
// ID helpers
// ---------------------------------------------------------------------------

let _seq = 1;
function nextId(prefix: string): string {
  return `${prefix}_mock-${String(_seq++).padStart(4, '0')}`;
}

function nowIso(): IsoDateTime {
  return new Date().toISOString() as IsoDateTime;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createMockClient(): ApiClient {
  return {
    // -------------------------------------------------------------------------
    // Auth
    // -------------------------------------------------------------------------
    auth: {
      async requestOtp(req) {
        if (!req.phone.startsWith('+')) {
          return withLatencyAndFailure(
            err(validationError('Phone must be in E.164 format', { phone: ['Must start with +'] })),
          );
        }
        return withLatencyAndFailure(ok({ challengeId: `chg_${Date.now()}` }), 300);
      },

      async verifyOtp(req) {
        if (!/^\d{6}$/.test(req.code)) {
          return withLatencyAndFailure(
            err(validationError('Invalid OTP format', { code: ['Must be 6 digits'] })),
          );
        }
        return withLatencyAndFailure(ok(DEMO_SESSION), 400);
      },

      async refresh(req) {
        if (!req.refreshToken) {
          return withLatencyAndFailure(err(unauthorizedError('Missing refresh token')));
        }
        const refreshed = {
          ...DEMO_SESSION,
          accessToken: `mock-access-${Date.now()}`,
          expiresAt: new Date(Date.now() + 3_600_000).toISOString() as IsoDateTime,
        };
        return withLatencyAndFailure(ok(refreshed), 250);
      },

      async signOut() {
        return withLatencyAndFailure(ok(undefined), 200);
      },
    },

    // -------------------------------------------------------------------------
    // User
    // -------------------------------------------------------------------------
    user: {
      async getMe() {
        return withLatencyAndFailure(ok(demoUser));
      },

      async listAddresses() {
        const addresses = [...store.addresses.values()];
        return withLatencyAndFailure(ok({ addresses }));
      },

      async saveAddress(req) {
        const id = nextId('addr') as AddressId;
        // exactOptionalPropertyTypes: only include optional keys when defined
        const base = {
          id,
          userId: demoUser.id,
          label: req.label,
          formatted: req.formatted,
          geo: req.geo,
        };
        const address = req.placeId !== undefined && req.notes !== undefined
          ? { ...base, placeId: req.placeId, notes: req.notes }
          : req.placeId !== undefined
            ? { ...base, placeId: req.placeId }
            : req.notes !== undefined
              ? { ...base, notes: req.notes }
              : base;
        store.addresses.set(id, address);
        return withLatencyAndFailure(ok(address));
      },

      async deleteAddress(id) {
        if (!store.addresses.has(id)) {
          return withLatencyAndFailure(err(notFoundError(`Address ${id} not found`)));
        }
        store.addresses.delete(id);
        return withLatencyAndFailure(ok({ deleted: true }));
      },
    },

    // -------------------------------------------------------------------------
    // Ride
    // -------------------------------------------------------------------------
    ride: {
      async getRideQuote(req) {
        const vehicleClass = req.vehicleClass;
        const baseQuote = demoFareQuotes[vehicleClass] ?? demoFareQuotes['economy'];
        if (baseQuote === undefined) {
          return withLatencyAndFailure(err(notFoundError(`No quote for vehicleClass ${vehicleClass}`)));
        }
        const distanceLat = Math.abs(req.dropoff.lat - req.pickup.lat);
        const distanceLng = Math.abs(req.dropoff.lng - req.pickup.lng);
        const approxMeters = Math.round((distanceLat + distanceLng) * 111_000);

        const quote = {
          ...baseQuote,
          id: nextId('qid') as typeof baseQuote.id,
          serviceType: 'ride' as const,
          pickup: req.pickup,
          dropoff: req.dropoff,
          vehicleClass,
          distanceMeters: approxMeters > 0 ? approxMeters : baseQuote.distanceMeters,
          expiresAt: new Date(Date.now() + 300_000).toISOString() as IsoDateTime,
        };
        return withLatencyAndFailure(ok(quote));
      },

      async requestRide(req) {
        const tripId = nextId('trp') as TripId;
        const paymentId = nextId('pay') as PaymentId;
        const orderId = nextId('ord') as OrderId;

        const now = nowIso();
        const trip = {
          id: tripId,
          riderId: demoUser.id,
          pickup: { lat: 41.3565, lng: 69.2845 },
          dropoff: { lat: 41.3123, lng: 69.2792 },
          fare: { amount: 18_000_00, currency: 'UZS' as const },
          status: { kind: 'matching' as const },
          timeline: [{ status: 'matching', at: now }],
          paymentId,
          createdAt: now,
        };

        store.trips.set(tripId, trip);
        registerTrip(tripId);

        const payment = {
          id: paymentId,
          orderId,
          methodId: req.paymentMethodId,
          amount: { amount: 18_000_00, currency: 'UZS' as const },
          state: { kind: 'pending' as const },
        };
        store.payments.set(paymentId, payment);
        registerPayment(paymentId);

        return withLatencyAndFailure(ok(trip));
      },

      async getTrip(req) {
        const trip = store.trips.get(req.tripId);
        if (!trip) {
          return withLatencyAndFailure(err(notFoundError(`Trip ${req.tripId} not found`)));
        }
        const progressed = getProgressedTrip(trip);
        return withLatencyAndFailure(ok(progressed), 150);
      },

      async cancelTrip(req) {
        const trip = store.trips.get(req.tripId);
        if (!trip) {
          return withLatencyAndFailure(err(notFoundError(`Trip ${req.tripId} not found`)));
        }
        if (isTripTerminal(trip.status)) {
          return withLatencyAndFailure(
            err(conflictError(`Trip ${req.tripId} is already in a terminal state`)),
          );
        }
        const cancelled = {
          ...trip,
          status: {
            kind: 'cancelled' as const,
            cancelledBy: 'rider' as const,
            reason: req.reason,
          },
          timeline: [
            ...trip.timeline,
            { status: 'cancelled', at: nowIso() },
          ],
        };
        store.trips.set(req.tripId, cancelled);
        return withLatencyAndFailure(ok(cancelled));
      },
    },

    // -------------------------------------------------------------------------
    // Delivery
    // -------------------------------------------------------------------------
    delivery: {
      async getDeliveryQuote(req) {
        const vehicleClass = req.parcel.sizeClass === 'xl' || req.parcel.sizeClass === 'l'
          ? 'courier_van'
          : 'courier_bike';
        const baseQuote = demoFareQuotes[vehicleClass] ?? demoFareQuotes['courier_bike'];
        if (baseQuote === undefined) {
          return withLatencyAndFailure(err(notFoundError('No delivery quote available')));
        }

        const quote = {
          ...baseQuote,
          id: nextId('qid') as typeof baseQuote.id,
          serviceType: 'delivery' as const,
          pickup: req.pickup,
          dropoff: req.dropoff,
          vehicleClass: vehicleClass as typeof baseQuote.vehicleClass,
          expiresAt: new Date(Date.now() + 300_000).toISOString() as IsoDateTime,
        };
        return withLatencyAndFailure(ok(quote));
      },

      async createDelivery(req) {
        const deliveryId = nextId('dlv') as DeliveryId;
        const paymentId = nextId('pay') as PaymentId;
        const orderId = nextId('ord') as OrderId;
        const now = nowIso();

        const pickupAddr = demoAddresses[0]!;
        const dropoffAddr = demoAddresses[1]!;

        const delivery = {
          id: deliveryId,
          senderId: demoUser.id,
          pickup: pickupAddr,
          dropoff: dropoffAddr,
          recipient: req.recipient,
          parcel: req.parcel,
          fare: { amount: 15_000_00, currency: 'UZS' as const },
          status: { kind: 'courier_search' as const },
          timeline: [{ status: 'courier_search', at: now }],
          paymentId,
        };

        store.deliveries.set(deliveryId, delivery);
        registerDelivery(deliveryId);

        const payment = {
          id: paymentId,
          orderId,
          methodId: req.paymentMethodId,
          amount: { amount: 15_000_00, currency: 'UZS' as const },
          state: { kind: 'pending' as const },
        };
        store.payments.set(paymentId, payment);
        registerPayment(paymentId);

        return withLatencyAndFailure(ok(delivery));
      },

      async getDelivery(req) {
        const delivery = store.deliveries.get(req.deliveryId);
        if (!delivery) {
          return withLatencyAndFailure(err(notFoundError(`Delivery ${req.deliveryId} not found`)));
        }
        const progressed = getProgressedDelivery(delivery);
        return withLatencyAndFailure(ok(progressed), 150);
      },

      async cancelDelivery(req) {
        const delivery = store.deliveries.get(req.deliveryId);
        if (!delivery) {
          return withLatencyAndFailure(err(notFoundError(`Delivery ${req.deliveryId} not found`)));
        }
        const terminalKinds = new Set(['delivered', 'cancelled', 'failed_delivery', 'returned']);
        if (terminalKinds.has(delivery.status.kind)) {
          return withLatencyAndFailure(
            err(conflictError(`Delivery ${req.deliveryId} is already in a terminal state`)),
          );
        }
        const cancelled = {
          ...delivery,
          status: { kind: 'cancelled' as const, reason: req.reason },
          timeline: [...delivery.timeline, { status: 'cancelled', at: nowIso() }],
        };
        store.deliveries.set(req.deliveryId, cancelled);
        return withLatencyAndFailure(ok(cancelled));
      },
    },

    // -------------------------------------------------------------------------
    // Orders
    // -------------------------------------------------------------------------
    orders: {
      async listOrders(req) {
        let items = [...store.orders.values()];
        if (req.kind !== undefined) {
          items = items.filter((o) => o.kind === req.kind);
        }
        items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

        const PAGE_SIZE = 10;
        const offset = req.cursor !== undefined ? parseInt(req.cursor, 10) : 0;
        const page = items.slice(offset, offset + PAGE_SIZE);
        const hasMore = offset + PAGE_SIZE < items.length;
        const result = hasMore
          ? { items: page, nextCursor: String(offset + PAGE_SIZE) }
          : { items: page };
        return withLatencyAndFailure(ok(result));
      },
    },

    // -------------------------------------------------------------------------
    // Payments
    // -------------------------------------------------------------------------
    payments: {
      async listPaymentMethods() {
        const methods = [...store.paymentMethods.values()];
        return withLatencyAndFailure(ok(methods));
      },

      async addPaymentMethod(req) {
        const id = nextId('pm') as PaymentMethod['id'];
        const base: PaymentMethod = {
          id,
          type: req.type,
          isDefault: false,
        };
        const method: PaymentMethod = {
          ...base,
          ...(req.brand !== undefined ? { brand: req.brand } : {}),
          ...(req.last4 !== undefined ? { last4: req.last4 } : {}),
          ...(req.expiry !== undefined ? { expiry: req.expiry } : {}),
        };
        store.paymentMethods.set(id, method);
        return withLatencyAndFailure(ok(method));
      },

      async deletePaymentMethod(id) {
        if (!store.paymentMethods.has(id)) {
          return withLatencyAndFailure(err(notFoundError(`Payment method ${id} not found`)));
        }
        store.paymentMethods.delete(id);
        return withLatencyAndFailure(ok({ deleted: true }));
      },

      async getPayment(req) {
        const payment = store.payments.get(req.paymentId);
        if (!payment) {
          return withLatencyAndFailure(err(notFoundError(`Payment ${req.paymentId} not found`)));
        }
        const progressed = getProgressedPayment(payment);
        return withLatencyAndFailure(ok(progressed), 150);
      },

      async getWallet() {
        return withLatencyAndFailure(ok(demoWallet));
      },
    },

    // -------------------------------------------------------------------------
    // Promos
    // -------------------------------------------------------------------------
    promos: {
      async applyPromo(req) {
        const promo = demoPromos.find((p) => p.code === req.code && p.status === 'active');
        if (!promo) {
          return withLatencyAndFailure(
            err(notFoundError(`Promo code '${req.code}' not found or inactive`)),
          );
        }
        if (!promo.appliesTo.includes(req.serviceType)) {
          return withLatencyAndFailure(
            err(validationError(`Promo '${req.code}' does not apply to ${req.serviceType}`)),
          );
        }
        if (promo.minSpend !== undefined && req.amount.amount < promo.minSpend.amount) {
          return withLatencyAndFailure(
            err(
              validationError(
                `Minimum spend of ${promo.minSpend.amount} required`,
                { amount: [`Minimum spend is ${promo.minSpend.amount}`] },
              ),
            ),
          );
        }

        const discountAmount =
          promo.kind === 'percent'
            ? Math.floor((req.amount.amount * promo.value) / 100)
            : Math.min(promo.value, req.amount.amount);

        const application = {
          promoId: promo.id,
          discount: { amount: discountAmount, currency: req.amount.currency },
          finalAmount: { amount: req.amount.amount - discountAmount, currency: req.amount.currency },
        };
        return withLatencyAndFailure(ok(application));
      },

      async validatePromo(req) {
        const promo = demoPromos.find((p) => p.code === req.code);
        if (!promo) {
          return withLatencyAndFailure(
            err(notFoundError(`Promo code '${req.code}' not found`)),
          );
        }
        return withLatencyAndFailure(ok(promo));
      },
    },

    // -------------------------------------------------------------------------
    // Support
    // -------------------------------------------------------------------------
    support: {
      async listTickets() {
        const tickets = [...store.tickets.values()];
        return withLatencyAndFailure(ok(tickets));
      },

      async createTicket(req) {
        const id = nextId('tkt') as TicketId;
        const now = nowIso();
        const base = {
          id,
          userId: demoUser.id,
          subject: req.subject,
          category: req.category,
          status: 'open' as const,
          messages: [
            {
              id: nextId('msg'),
              from: 'user' as const,
              body: req.body,
              at: now,
            },
          ],
          createdAt: now,
        };
        const ticket = req.orderId !== undefined
          ? { ...base, orderId: req.orderId }
          : base;
        store.tickets.set(id, ticket);
        return withLatencyAndFailure(ok(ticket));
      },

      async postMessage(req) {
        const ticket = store.tickets.get(req.ticketId as TicketId);
        if (!ticket) {
          return withLatencyAndFailure(err(notFoundError(`Ticket ${req.ticketId} not found`)));
        }
        const updated = {
          ...ticket,
          status: 'pending_agent' as const,
          messages: [
            ...ticket.messages,
            {
              id: nextId('msg'),
              from: 'user' as const,
              body: req.body,
              at: nowIso(),
            },
          ],
        };
        store.tickets.set(ticket.id, updated);
        return withLatencyAndFailure(ok(updated));
      },
    },

    // -------------------------------------------------------------------------
    // Notifications
    // -------------------------------------------------------------------------
    notifications: {
      async listNotifications(req) {
        const all = [...store.notifications.values()];
        all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

        const PAGE_SIZE = 20;
        const offset = req.cursor !== undefined ? parseInt(req.cursor, 10) : 0;
        const page = all.slice(offset, offset + PAGE_SIZE);
        const hasMore = offset + PAGE_SIZE < all.length;
        const result = hasMore
          ? { items: page, nextCursor: String(offset + PAGE_SIZE) }
          : { items: page };
        return withLatencyAndFailure(ok(result));
      },

      async markRead(req) {
        let updated = 0;
        for (const id of req.ids) {
          const notification = store.notifications.get(id);
          if (notification !== undefined && notification.readAt === undefined) {
            store.notifications.set(id, { ...notification, readAt: nowIso() });
            updated += 1;
          }
        }
        return withLatencyAndFailure(ok({ updated }));
      },
    },

    // -------------------------------------------------------------------------
    // Geo
    // -------------------------------------------------------------------------
    geo: {
      async autocomplete(req) {
        if (req.query.trim().length < 2) {
          return withLatencyAndFailure(ok([]));
        }
        const q = req.query.toLowerCase();
        const filtered = demoPlaceSuggestions.filter(
          (s) =>
            s.primaryText.toLowerCase().includes(q) ||
            s.secondaryText.toLowerCase().includes(q),
        );
        return withLatencyAndFailure(ok(filtered), 200);
      },

      async reverseGeocode(req) {
        let closest = demoAddresses[0]!;
        let minDist = Infinity;
        for (const addr of demoAddresses) {
          const dist =
            Math.abs(addr.geo.lat - req.point.lat) +
            Math.abs(addr.geo.lng - req.point.lng);
          if (dist < minDist) {
            minDist = dist;
            closest = addr;
          }
        }
        return withLatencyAndFailure(ok(closest), 250);
      },
    },
  };
}
