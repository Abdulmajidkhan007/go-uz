/**
 * React Query v5 hooks factory.
 *
 * Usage:
 * ```ts
 * const client = createApiClient({ mode: 'mock' });
 * const api = createApiHooks(client);
 *
 * // In a component:
 * const { data, isLoading } = api.useMe();
 * const requestRide = api.useRequestRide();
 * ```
 *
 * The factory pattern keeps this package dependency-free on React context.
 * Apps own the QueryClientProvider.  The hooks close over the client instance.
 *
 * Design decisions:
 * - `useTrip` / `useDelivery` refetch every 3 s while active, stopping at terminal.
 * - Optimistic updates on `useCancelTrip` / `useCancelDelivery` with rollback.
 * - staleTime for read-heavy queries (me, addresses, paymentMethods) = 5 min.
 * - staleTime for status-polling queries (trip, delivery) = 0.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type {
  UseQueryResult,
  UseMutationResult,
  Query,
} from '@tanstack/react-query';

import type { ApiClient } from '../client.js';
import type { ApiError } from '../errors.js';
import type {
  User,
  Address,
  FareQuote,
  Trip,
  TripId,
  Delivery,
  DeliveryId,
  PaymentMethod,
  PaymentMethodId,
  Payment,
  PaymentId,
  Wallet,
  Promo,
  PromoApplication,
  SupportTicket,
  Notification,
  PlaceSuggestion,
  OrderKind,
} from '@vroom/types';

import type {
  RequestRideReq,
  CreateDeliveryReq,
  RideQuoteReq,
  DeliveryQuoteReq,
  ApplyPromoReq,
  CreateTicketReq,
  PostMessageReq,
  AddPaymentMethodReq,
  SaveAddressReq,
  CancelTripReq,
  CancelDeliveryReq,
  AutocompleteReq,
  ReverseGeocodeReq,
  MarkReadReq,
  ListAddressesRes,
  ListOrdersRes,
  ListPaymentMethodsRes,
  ListTicketsRes,
  ListNotificationsRes,
  MarkReadRes,
  DeletePaymentMethodRes,
  DeleteAddressRes,
} from '../contracts/index.js';

import { queryKeys } from './keys.js';


// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ACTIVE_REFETCH_INTERVAL_MS = 3_000;
const STALE_STANDARD_MS = 5 * 60 * 1_000; // 5 min
const STALE_QUOTES_MS = 60 * 1_000; // 1 min

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isTripTerminal(trip: Trip): boolean {
  return (
    trip.status.kind === 'completed' ||
    trip.status.kind === 'cancelled' ||
    trip.status.kind === 'no_drivers'
  );
}

function isDeliveryTerminal(delivery: Delivery): boolean {
  return (
    delivery.status.kind === 'delivered' ||
    delivery.status.kind === 'cancelled' ||
    delivery.status.kind === 'failed_delivery' ||
    delivery.status.kind === 'returned'
  );
}

/**
 * Unwraps a Result<T, ApiError> from an API call, throwing the error so
 * React Query captures it in its `error` field.
 */
async function unwrap<T>(
  call: Promise<{ ok: true; value: T } | { ok: false; error: ApiError }>,
): Promise<T> {
  const result = await call;
  if (result.ok) return result.value;
  throw result.error;
}

// ---------------------------------------------------------------------------
// Hooks factory interface
// ---------------------------------------------------------------------------

export interface ApiHooks {
  // User
  useMe(): UseQueryResult<User, ApiError>;
  useAddresses(): UseQueryResult<ListAddressesRes, ApiError>;
  useSaveAddress(): UseMutationResult<Address, ApiError, SaveAddressReq>;
  useDeleteAddress(): UseMutationResult<DeleteAddressRes, ApiError, Address['id']>;

  // Ride
  useRideQuote(req: RideQuoteReq | null): UseQueryResult<FareQuote, ApiError>;
  useRequestRide(): UseMutationResult<Trip, ApiError, RequestRideReq>;
  useTrip(id: TripId | null): UseQueryResult<Trip, ApiError>;
  useCancelTrip(): UseMutationResult<Trip, ApiError, CancelTripReq>;

  // Delivery
  useDeliveryQuote(req: DeliveryQuoteReq | null): UseQueryResult<FareQuote, ApiError>;
  useCreateDelivery(): UseMutationResult<Delivery, ApiError, CreateDeliveryReq>;
  useDelivery(id: DeliveryId | null): UseQueryResult<Delivery, ApiError>;
  useCancelDelivery(): UseMutationResult<Delivery, ApiError, CancelDeliveryReq>;

  // Orders
  useOrders(filter?: { kind?: OrderKind; cursor?: string }): UseQueryResult<ListOrdersRes, ApiError>;

  // Payments
  usePaymentMethods(): UseQueryResult<ListPaymentMethodsRes, ApiError>;
  useAddPaymentMethod(): UseMutationResult<PaymentMethod, ApiError, AddPaymentMethodReq>;
  useDeletePaymentMethod(): UseMutationResult<DeletePaymentMethodRes, ApiError, PaymentMethodId>;
  usePayment(id: PaymentId | null): UseQueryResult<Payment, ApiError>;
  useWallet(): UseQueryResult<Wallet, ApiError>;

  // Promos
  useApplyPromo(): UseMutationResult<PromoApplication, ApiError, ApplyPromoReq>;
  useValidatePromo(code: string | null): UseQueryResult<Promo, ApiError>;

  // Support
  useTickets(): UseQueryResult<ListTicketsRes, ApiError>;
  useCreateTicket(): UseMutationResult<SupportTicket, ApiError, CreateTicketReq>;
  usePostMessage(): UseMutationResult<SupportTicket, ApiError, PostMessageReq>;

  // Notifications
  useNotifications(cursor?: string): UseQueryResult<ListNotificationsRes, ApiError>;
  useMarkNotificationsRead(): UseMutationResult<MarkReadRes, ApiError, MarkReadReq>;

  // Geo
  useAutocomplete(req: AutocompleteReq | null): UseQueryResult<readonly PlaceSuggestion[], ApiError>;
  useReverseGeocode(req: ReverseGeocodeReq | null): UseQueryResult<Address, ApiError>;
}

// ---------------------------------------------------------------------------
// Optimistic cancel context types
// ---------------------------------------------------------------------------

interface CancelTripContext {
  previous: Trip | undefined;
  key: ReturnType<typeof queryKeys.trips.detail>;
}

interface CancelDeliveryContext {
  previous: Delivery | undefined;
  key: ReturnType<typeof queryKeys.deliveries.detail>;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createApiHooks(client: ApiClient): ApiHooks {
  return {
    // -------------------------------------------------------------------------
    // User
    // -------------------------------------------------------------------------

    useMe() {
      return useQuery<User, ApiError>({
        queryKey: queryKeys.me(),
        queryFn: () => unwrap(client.user.getMe()),
        staleTime: STALE_STANDARD_MS,
      });
    },

    useAddresses() {
      return useQuery<ListAddressesRes, ApiError>({
        queryKey: queryKeys.addresses.list(),
        queryFn: () => unwrap(client.user.listAddresses()),
        staleTime: STALE_STANDARD_MS,
      });
    },

    useSaveAddress() {
      const queryClient = useQueryClient();
      return useMutation<Address, ApiError, SaveAddressReq>({
        mutationFn: (req: SaveAddressReq) => unwrap(client.user.saveAddress(req)),
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
        },
      });
    },

    useDeleteAddress() {
      const queryClient = useQueryClient();
      return useMutation<DeleteAddressRes, ApiError, Address['id']>({
        mutationFn: (id: Address['id']) => unwrap(client.user.deleteAddress(id)),
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
        },
      });
    },

    // -------------------------------------------------------------------------
    // Ride
    // -------------------------------------------------------------------------

    useRideQuote(req) {
      return useQuery<FareQuote, ApiError>({
        queryKey: req !== null
          ? (['ride', 'quote', req.pickup, req.dropoff, req.vehicleClass] as const)
          : (['ride', 'quote', null] as const),
        queryFn: () => {
          if (req === null) throw new Error('No quote request');
          return unwrap(client.ride.getRideQuote(req));
        },
        enabled: req !== null,
        staleTime: STALE_QUOTES_MS,
      });
    },

    useRequestRide() {
      const queryClient = useQueryClient();
      return useMutation<Trip, ApiError, RequestRideReq>({
        mutationFn: (req: RequestRideReq) => unwrap(client.ride.requestRide(req)),
        onSuccess: (trip: Trip) => {
          queryClient.setQueryData<Trip>(queryKeys.trips.detail(trip.id), trip);
          void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
        },
      });
    },

    useTrip(id) {
      return useQuery<Trip, ApiError, Trip, readonly string[]>({
        queryKey: id !== null
          ? (queryKeys.trips.detail(id) as unknown as readonly string[])
          : (['trips', 'detail', '__none__'] as const),
        queryFn: () => {
          if (id === null) throw new Error('No trip id');
          return unwrap(client.ride.getTrip({ tripId: id }));
        },
        enabled: id !== null,
        staleTime: 0,
        refetchInterval: (query: Query<Trip, ApiError, Trip, readonly string[]>) => {
          const trip = query.state.data;
          if (trip === undefined) return ACTIVE_REFETCH_INTERVAL_MS;
          return isTripTerminal(trip) ? false : ACTIVE_REFETCH_INTERVAL_MS;
        },
      });
    },

    useCancelTrip() {
      const queryClient = useQueryClient();
      return useMutation<Trip, ApiError, CancelTripReq, CancelTripContext>({
        mutationFn: (req: CancelTripReq) => unwrap(client.ride.cancelTrip(req)),
        onMutate: async (req: CancelTripReq): Promise<CancelTripContext> => {
          const key = queryKeys.trips.detail(req.tripId);
          await queryClient.cancelQueries({ queryKey: key });
          const previous = queryClient.getQueryData<Trip>(key);
          if (previous !== undefined) {
            queryClient.setQueryData<Trip>(key, {
              ...previous,
              status: {
                kind: 'cancelled',
                cancelledBy: 'rider',
                reason: req.reason,
              },
            });
          }
          return { previous, key };
        },
        onError: (_error: ApiError, _req: CancelTripReq, context: CancelTripContext | undefined) => {
          if (context?.previous !== undefined) {
            queryClient.setQueryData(context.key, context.previous);
          }
        },
        onSettled: (_data: Trip | undefined, _error: ApiError | null, req: CancelTripReq) => {
          void queryClient.invalidateQueries({ queryKey: queryKeys.trips.detail(req.tripId) });
          void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
        },
      });
    },

    // -------------------------------------------------------------------------
    // Delivery
    // -------------------------------------------------------------------------

    useDeliveryQuote(req) {
      return useQuery<FareQuote, ApiError>({
        queryKey: req !== null
          ? (['delivery', 'quote', req.pickup, req.dropoff, req.parcel.sizeClass] as const)
          : (['delivery', 'quote', null] as const),
        queryFn: () => {
          if (req === null) throw new Error('No quote request');
          return unwrap(client.delivery.getDeliveryQuote(req));
        },
        enabled: req !== null,
        staleTime: STALE_QUOTES_MS,
      });
    },

    useCreateDelivery() {
      const queryClient = useQueryClient();
      return useMutation<Delivery, ApiError, CreateDeliveryReq>({
        mutationFn: (req: CreateDeliveryReq) => unwrap(client.delivery.createDelivery(req)),
        onSuccess: (delivery: Delivery) => {
          queryClient.setQueryData<Delivery>(
            queryKeys.deliveries.detail(delivery.id),
            delivery,
          );
          void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
        },
      });
    },

    useDelivery(id) {
      return useQuery<Delivery, ApiError, Delivery, readonly string[]>({
        queryKey: id !== null
          ? (queryKeys.deliveries.detail(id) as unknown as readonly string[])
          : (['deliveries', 'detail', '__none__'] as const),
        queryFn: () => {
          if (id === null) throw new Error('No delivery id');
          return unwrap(client.delivery.getDelivery({ deliveryId: id }));
        },
        enabled: id !== null,
        staleTime: 0,
        refetchInterval: (query: Query<Delivery, ApiError, Delivery, readonly string[]>) => {
          const delivery = query.state.data;
          if (delivery === undefined) return ACTIVE_REFETCH_INTERVAL_MS;
          return isDeliveryTerminal(delivery) ? false : ACTIVE_REFETCH_INTERVAL_MS;
        },
      });
    },

    useCancelDelivery() {
      const queryClient = useQueryClient();
      return useMutation<Delivery, ApiError, CancelDeliveryReq, CancelDeliveryContext>({
        mutationFn: (req: CancelDeliveryReq) => unwrap(client.delivery.cancelDelivery(req)),
        onMutate: async (req: CancelDeliveryReq): Promise<CancelDeliveryContext> => {
          const key = queryKeys.deliveries.detail(req.deliveryId);
          await queryClient.cancelQueries({ queryKey: key });
          const previous = queryClient.getQueryData<Delivery>(key);
          if (previous !== undefined) {
            queryClient.setQueryData<Delivery>(key, {
              ...previous,
              status: { kind: 'cancelled', reason: req.reason },
            });
          }
          return { previous, key };
        },
        onError: (
          _error: ApiError,
          _req: CancelDeliveryReq,
          context: CancelDeliveryContext | undefined,
        ) => {
          if (context?.previous !== undefined) {
            queryClient.setQueryData(context.key, context.previous);
          }
        },
        onSettled: (
          _data: Delivery | undefined,
          _error: ApiError | null,
          req: CancelDeliveryReq,
        ) => {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.deliveries.detail(req.deliveryId),
          });
          void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
        },
      });
    },

    // -------------------------------------------------------------------------
    // Orders
    // -------------------------------------------------------------------------

    useOrders(filter) {
      return useQuery<ListOrdersRes, ApiError>({
        queryKey: queryKeys.orders.list(filter),
        queryFn: () => unwrap(client.orders.listOrders(filter ?? {})),
        staleTime: STALE_STANDARD_MS,
      });
    },

    // -------------------------------------------------------------------------
    // Payments
    // -------------------------------------------------------------------------

    usePaymentMethods() {
      return useQuery<ListPaymentMethodsRes, ApiError>({
        queryKey: queryKeys.payments.methods(),
        queryFn: () => unwrap(client.payments.listPaymentMethods()),
        staleTime: STALE_STANDARD_MS,
      });
    },

    useAddPaymentMethod() {
      const queryClient = useQueryClient();
      return useMutation<PaymentMethod, ApiError, AddPaymentMethodReq>({
        mutationFn: (req: AddPaymentMethodReq) => unwrap(client.payments.addPaymentMethod(req)),
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: queryKeys.payments.methods() });
        },
      });
    },

    useDeletePaymentMethod() {
      const queryClient = useQueryClient();
      return useMutation<DeletePaymentMethodRes, ApiError, PaymentMethodId>({
        mutationFn: (id: PaymentMethodId) => unwrap(client.payments.deletePaymentMethod(id)),
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: queryKeys.payments.methods() });
        },
      });
    },

    usePayment(id) {
      return useQuery<Payment, ApiError>({
        queryKey: id !== null
          ? queryKeys.payments.detail(id)
          : (['payments', 'detail', null] as const),
        queryFn: () => {
          if (id === null) throw new Error('No payment id');
          return unwrap(client.payments.getPayment({ paymentId: id }));
        },
        enabled: id !== null,
        staleTime: STALE_STANDARD_MS,
      });
    },

    useWallet() {
      return useQuery<Wallet, ApiError>({
        queryKey: queryKeys.payments.wallet(),
        queryFn: () => unwrap(client.payments.getWallet()),
        staleTime: STALE_STANDARD_MS,
      });
    },

    // -------------------------------------------------------------------------
    // Promos
    // -------------------------------------------------------------------------

    useApplyPromo() {
      return useMutation<PromoApplication, ApiError, ApplyPromoReq>({
        mutationFn: (req: ApplyPromoReq) => unwrap(client.promos.applyPromo(req)),
      });
    },

    useValidatePromo(code) {
      return useQuery<Promo, ApiError>({
        queryKey: code !== null
          ? queryKeys.promos.validate(code)
          : (['promos', 'validate', null] as const),
        queryFn: () => {
          if (code === null) throw new Error('No promo code');
          return unwrap(client.promos.validatePromo({ code }));
        },
        enabled: code !== null && code.trim().length > 0,
        staleTime: STALE_STANDARD_MS,
        retry: false,
      });
    },

    // -------------------------------------------------------------------------
    // Support
    // -------------------------------------------------------------------------

    useTickets() {
      return useQuery<ListTicketsRes, ApiError>({
        queryKey: queryKeys.support.tickets(),
        queryFn: () => unwrap(client.support.listTickets()),
        staleTime: STALE_STANDARD_MS,
      });
    },

    useCreateTicket() {
      const queryClient = useQueryClient();
      return useMutation<SupportTicket, ApiError, CreateTicketReq>({
        mutationFn: (req: CreateTicketReq) => unwrap(client.support.createTicket(req)),
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: queryKeys.support.tickets() });
        },
      });
    },

    usePostMessage() {
      const queryClient = useQueryClient();
      return useMutation<SupportTicket, ApiError, PostMessageReq>({
        mutationFn: (req: PostMessageReq) => unwrap(client.support.postMessage(req)),
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: queryKeys.support.tickets() });
        },
      });
    },

    // -------------------------------------------------------------------------
    // Notifications
    // -------------------------------------------------------------------------

    useNotifications(cursor) {
      return useQuery<ListNotificationsRes, ApiError>({
        queryKey: queryKeys.notifications.list(cursor),
        // exactOptionalPropertyTypes: pass cursor only when defined
        queryFn: () => unwrap(
          cursor !== undefined
            ? client.notifications.listNotifications({ cursor })
            : client.notifications.listNotifications({}),
        ),
        staleTime: 30_000,
      });
    },

    useMarkNotificationsRead() {
      const queryClient = useQueryClient();
      return useMutation<MarkReadRes, ApiError, MarkReadReq>({
        mutationFn: (req: MarkReadReq) => unwrap(client.notifications.markRead(req)),
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
        },
      });
    },

    // -------------------------------------------------------------------------
    // Geo
    // -------------------------------------------------------------------------

    useAutocomplete(req) {
      return useQuery<readonly PlaceSuggestion[], ApiError>({
        queryKey: req !== null
          ? queryKeys.geo.autocomplete(req.query, req.near)
          : (['geo', 'autocomplete', null] as const),
        queryFn: () => {
          if (req === null) throw new Error('No autocomplete request');
          return unwrap(client.geo.autocomplete(req));
        },
        enabled: req !== null && req.query.trim().length >= 2,
        staleTime: 30_000,
      });
    },

    useReverseGeocode(req) {
      return useQuery<Address, ApiError>({
        queryKey: req !== null
          ? queryKeys.geo.reverseGeocode(req.point.lat, req.point.lng)
          : (['geo', 'reverseGeocode', null] as const),
        queryFn: () => {
          if (req === null) throw new Error('No reverse geocode request');
          return unwrap(client.geo.reverseGeocode(req));
        },
        enabled: req !== null,
        staleTime: 60_000,
      });
    },
  };
}
