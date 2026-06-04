/**
 * Typed query key factory.
 *
 * All keys are readonly tuples so React Query can deeply compare them.
 * The nested structure allows partial invalidation:
 *   queryClient.invalidateQueries({ queryKey: queryKeys.trips.all })
 *   invalidates both queryKeys.trips.detail(id) and queryKeys.trips.list(...)
 */
import type { TripId, DeliveryId, OrderId, PaymentId, OrderKind } from '@vroom/types';

// ---------------------------------------------------------------------------
// Key shapes
// ---------------------------------------------------------------------------

export const queryKeys = {
  me: () => ['me'] as const,

  addresses: {
    all: ['addresses'] as const,
    list: () => ['addresses', 'list'] as const,
  },

  trips: {
    all: ['trips'] as const,
    detail: (id: TripId) => ['trips', 'detail', id] as const,
  },

  deliveries: {
    all: ['deliveries'] as const,
    detail: (id: DeliveryId) => ['deliveries', 'detail', id] as const,
  },

  orders: {
    all: ['orders'] as const,
    list: (filter?: { kind?: OrderKind; cursor?: string }) =>
      ['orders', 'list', filter] as const,
  },

  payments: {
    all: ['payments'] as const,
    methods: () => ['payments', 'methods'] as const,
    detail: (id: PaymentId) => ['payments', 'detail', id] as const,
    wallet: () => ['payments', 'wallet'] as const,
  },

  promos: {
    all: ['promos'] as const,
    validate: (code: string) => ['promos', 'validate', code] as const,
  },

  support: {
    all: ['support'] as const,
    tickets: () => ['support', 'tickets'] as const,
  },

  notifications: {
    all: ['notifications'] as const,
    list: (cursor?: string) => ['notifications', 'list', cursor] as const,
  },

  geo: {
    all: ['geo'] as const,
    autocomplete: (query: string, near?: { lat: number; lng: number }) =>
      ['geo', 'autocomplete', query, near] as const,
    reverseGeocode: (lat: number, lng: number) =>
      ['geo', 'reverseGeocode', lat, lng] as const,
  },
} as const;

export type QueryKeys = typeof queryKeys;
