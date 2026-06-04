// ---------------------------------------------------------------------------
// Client interface + factory
// ---------------------------------------------------------------------------
export type { ApiClient, ApiClientConfig } from './client.js';
export { createApiClient } from './client.js';

// ---------------------------------------------------------------------------
// Sub-API interfaces
// ---------------------------------------------------------------------------
export type {
  AuthApi,
  UserApi,
  RideApi,
  DeliveryApi,
  OrdersApi,
  PaymentsApi,
  PromosApi,
  SupportApi,
  NotificationsApi,
  GeoApi,
} from './endpoints/index.js';

// ---------------------------------------------------------------------------
// Contracts (request / response types)
// ---------------------------------------------------------------------------
export type {
  // Auth
  RequestOtpReq,
  RequestOtpRes,
  VerifyOtpReq,
  VerifyOtpRes,
  RefreshReq,
  RefreshRes,
  // User
  GetMeRes,
  ListAddressesRes,
  SaveAddressReq,
  SaveAddressRes,
  DeleteAddressRes,
  // Ride
  RideQuoteReq,
  RideQuoteRes,
  RequestRideReq,
  RequestRideRes,
  GetTripReq,
  GetTripRes,
  CancelTripReq,
  CancelTripRes,
  // Delivery
  DeliveryQuoteReq,
  DeliveryQuoteRes,
  CreateDeliveryReq,
  CreateDeliveryRes,
  GetDeliveryReq,
  GetDeliveryRes,
  CancelDeliveryReq,
  CancelDeliveryRes,
  // Orders
  ListOrdersReq,
  ListOrdersRes,
  // Payments
  ListPaymentMethodsRes,
  AddPaymentMethodReq,
  AddPaymentMethodRes,
  DeletePaymentMethodRes,
  GetPaymentReq,
  GetPaymentRes,
  GetWalletRes,
  // Promos
  ApplyPromoReq,
  ApplyPromoRes,
  ValidatePromoReq,
  ValidatePromoRes,
  // Support
  ListTicketsRes,
  CreateTicketReq,
  CreateTicketRes,
  PostMessageReq,
  PostMessageRes,
  // Notifications
  ListNotificationsReq,
  ListNotificationsRes,
  MarkReadReq,
  MarkReadRes,
  // Geo
  AutocompleteReq,
  AutocompleteRes,
  ReverseGeocodeReq,
  ReverseGeocodeRes,
} from './contracts/index.js';

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------
export type {
  ApiError,
  ApiResult,
  ApiErrorNetwork,
  ApiErrorTimeout,
  ApiErrorUnauthorized,
  ApiErrorValidation,
  ApiErrorNotFound,
  ApiErrorConflict,
  ApiErrorServer,
  ApiErrorUnknown,
} from './errors.js';
export {
  networkError,
  timeoutError,
  unauthorizedError,
  validationError,
  notFoundError,
  conflictError,
  serverError,
  unknownError,
} from './errors.js';

// ---------------------------------------------------------------------------
// Query hooks + keys
// ---------------------------------------------------------------------------
export { createApiHooks, queryKeys } from './query/index.js';
export type { ApiHooks, QueryKeys } from './query/index.js';

// ---------------------------------------------------------------------------
// Mock fixtures (for Storybook, tests, other agents)
// ---------------------------------------------------------------------------
export {
  DEMO_USER_ID,
  DEMO_SESSION,
  demoUser,
  demoAddresses,
  demoPaymentMethods,
  demoWallet,
  demoVehicles,
  demoDrivers,
  demoFareQuotes,
  demoTrips,
  demoDeliveries,
  demoOrders,
  demoPayments,
  demoPromos,
  demoTickets,
  demoNotifications,
  demoPlaceSuggestions,
} from './mock/fixtures.js';

// ---------------------------------------------------------------------------
// Mock client + store control (for tests)
// ---------------------------------------------------------------------------
export { createMockClient } from './mock/mockClient.js';
export { store, resetStore } from './mock/store.js';
export { setFailureInjection } from './mock/latency.js';
export {
  TRIP_THRESHOLDS,
  DELIVERY_THRESHOLDS,
  PAYMENT_THRESHOLDS,
} from './mock/ticker.js';
