/**
 * In-memory mutable store.
 *
 * Keyed maps for each mutable domain entity.  Initialised from fixtures at
 * module load time so the store is deterministic and can be reset in tests.
 *
 * Domain state that the mock mutates lives here; fixtures.ts provides the
 * read-only seed data.
 */
import type {
  Trip,
  Delivery,
  Order,
  Payment,
  PaymentMethod,
  Address,
  SupportTicket,
  Notification,
  TripId,
  DeliveryId,
  OrderId,
  PaymentId,
  PaymentMethodId,
  AddressId,
  TicketId,
  NotificationId,
} from '@vroom/types';

import {
  demoTrips,
  demoDeliveries,
  demoOrders,
  demoPayments,
  demoPaymentMethods,
  demoAddresses,
  demoTickets,
  demoNotifications,
} from './fixtures.js';

// ---------------------------------------------------------------------------
// Store shape
// ---------------------------------------------------------------------------

export interface MockStore {
  trips: Map<TripId, Trip>;
  deliveries: Map<DeliveryId, Delivery>;
  orders: Map<OrderId, Order>;
  payments: Map<PaymentId, Payment>;
  paymentMethods: Map<PaymentMethodId, PaymentMethod>;
  addresses: Map<AddressId, Address>;
  tickets: Map<TicketId, SupportTicket>;
  notifications: Map<NotificationId, Notification>;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

function buildStore(): MockStore {
  return {
    trips: new Map(demoTrips.map((t) => [t.id, t])),
    deliveries: new Map(demoDeliveries.map((d) => [d.id, d])),
    orders: new Map(demoOrders.map((o) => [o.id, o])),
    payments: new Map(demoPayments.map((p) => [p.id, p])),
    paymentMethods: new Map(demoPaymentMethods.map((m) => [m.id, m])),
    addresses: new Map(demoAddresses.map((a) => [a.id, a])),
    tickets: new Map(demoTickets.map((t) => [t.id, t])),
    notifications: new Map(demoNotifications.map((n) => [n.id, n])),
  };
}

// ---------------------------------------------------------------------------
// Singleton store — module-level so all mock client methods share it.
// ---------------------------------------------------------------------------

export const store: MockStore = buildStore();

/**
 * Resets the store back to its seed state.
 * Call this in test `beforeEach` hooks.
 */
export function resetStore(): void {
  const fresh = buildStore();
  store.trips = fresh.trips;
  store.deliveries = fresh.deliveries;
  store.orders = fresh.orders;
  store.payments = fresh.payments;
  store.paymentMethods = fresh.paymentMethods;
  store.addresses = fresh.addresses;
  store.tickets = fresh.tickets;
  store.notifications = fresh.notifications;
}
