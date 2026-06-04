// Common primitives — Brand, branded IDs, Money, GeoPoint, Paginated, Result
export type {
  Brand,
  UserId,
  AddressId,
  TripId,
  DeliveryId,
  OrderId,
  PaymentId,
  PaymentMethodId,
  PromoId,
  TicketId,
  NotificationId,
  VehicleId,
  DriverId,
  QuoteId,
  IsoDateTime,
  CurrencyCode,
  Money,
  GeoPoint,
  Paginated,
  Result,
} from './common.js';

// User domain
export type { UserStatus, User, Session } from './user.js';

// Address domain
export type { AddressLabel, Address, PlaceSuggestion } from './address.js';

// Vehicle domain
export type { VehicleClass, Vehicle, Driver } from './vehicle.js';

// Fare & service type
export type { ServiceType, FareQuote } from './fare.js';

// Trip domain
export type {
  TimelineEntry,
  TripStatusRequested,
  TripStatusMatching,
  TripStatusNoDrivers,
  TripStatusDriverAssigned,
  TripStatusArriving,
  TripStatusInProgress,
  TripStatusCompleted,
  TripStatusCancelled,
  TripStatus,
  Trip,
} from './trip.js';

// Delivery domain
export type {
  ParcelSizeClass,
  Parcel,
  ProofOfDelivery,
  DeliveryStatusCreated,
  DeliveryStatusCourierSearch,
  DeliveryStatusCourierAssigned,
  DeliveryStatusPickupEnroute,
  DeliveryStatusPickedUp,
  DeliveryStatusDropoffEnroute,
  DeliveryStatusDelivered,
  DeliveryStatusCancelled,
  DeliveryStatusFailedDelivery,
  DeliveryStatusReturning,
  DeliveryStatusReturned,
  DeliveryStatus,
  DeliveryRecipient,
  Delivery,
} from './delivery.js';

// Order domain
export type { OrderKind, OrderState, Order } from './order.js';

// Payment domain
export type {
  PaymentMethod,
  PaymentStatePending,
  PaymentStateAuthorized,
  PaymentStateCaptured,
  PaymentStateSettled,
  PaymentStateFailed,
  PaymentStateRefundPending,
  PaymentStateRefunded,
  PaymentState,
  Payment,
  WalletTxn,
  Wallet,
} from './payment.js';

// Promo domain
export type { PromoStatus, Promo, PromoApplication } from './promo.js';

// Support domain
export type {
  TicketStatus,
  TicketCategory,
  TicketMessage,
  SupportTicket,
} from './support.js';

// Notification domain
export type { NotificationType, Notification } from './notification.js';

// Rating domain
export type { RatingScore, Rating } from './rating.js';
