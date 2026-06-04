# Domain Model

Entity definitions, branded IDs, and state machine diagrams for the Vroom super-app.

---

## Core Primitives

### Branded IDs

All entity IDs use branded string types to prevent type confusion at compile time:

```ts
type Brand<T, S extends string> = T & { readonly __brand: S };

type UserId = Brand<string, 'UserId'>;
type TripId = Brand<string, 'TripId'>;
type DeliveryId = Brand<string, 'DeliveryId'>;
type OrderId = Brand<string, 'OrderId'>;
type PaymentId = Brand<string, 'PaymentId'>;
type PaymentMethodId = Brand<string, 'PaymentMethodId'>;
type PromoId = Brand<string, 'PromoId'>;
type TicketId = Brand<string, 'TicketId'>;
type NotificationId = Brand<string, 'NotificationId'>;
type VehicleId = Brand<string, 'VehicleId'>;
type DriverId = Brand<string, 'DriverId'>;
type QuoteId = Brand<string, 'QuoteId'>;
type AddressId = Brand<string, 'AddressId'>;
```

**Usage:**
```ts
const userId: UserId = crypto.randomUUID() as UserId;
const tripId: TripId = crypto.randomUUID() as TripId;

// TypeScript prevents this:
api.getTrip(userId);  // ❌ Compile error
api.getTrip(tripId);  // ✓ OK
```

### Money & Currency

```ts
type CurrencyCode = Brand<string, 'CurrencyCode'>;

interface Money {
  readonly amount: number;  // In minor units (e.g., cents)
  readonly currency: CurrencyCode;
}
```

**Example:** $12.50 USD = `{ amount: 1250, currency: 'USD' }`

### Geo Point

```ts
interface GeoPoint {
  readonly lat: number;     // Latitude (-90 to 90)
  readonly lng: number;     // Longitude (-180 to 180)
}
```

### Result Type

Used throughout the API layer for error handling:

```ts
type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };
```

---

## User Domain

### User Entity

```ts
type UserStatus = 'active' | 'suspended' | 'deleted';

interface User {
  readonly id: UserId;
  readonly phone: string;          // E.164 format
  readonly name: string;
  readonly email?: string;
  readonly avatar?: string;        // URL
  readonly status: UserStatus;
  readonly createdAt: IsoDateTime;
  readonly lastActiveAt: IsoDateTime;
}
```

### Session

```ts
interface Session {
  readonly userId: UserId;
  readonly token: string;          // Bearer token for API requests
  readonly refreshToken: string;
  readonly expiresAt: IsoDateTime;
}
```

### Address

```ts
type AddressLabel = 'home' | 'work' | 'other';

interface Address {
  readonly id: AddressId;
  readonly userId: UserId;
  readonly label: AddressLabel;
  readonly displayName: string;    // e.g., "Home"
  readonly fullAddress: string;    // e.g., "123 Main St, City, State 12345"
  readonly location: GeoPoint;
  readonly savedAt: IsoDateTime;
}
```

---

## Ride Domain

### Vehicle Class

```ts
type VehicleClass = 'economy' | 'comfort' | 'premium';
```

### Vehicle & Driver

```ts
interface Vehicle {
  readonly id: VehicleId;
  readonly make: string;          // e.g., "Toyota"
  readonly model: string;         // e.g., "Camry"
  readonly year: number;
  readonly licensePlate: string;
  readonly color: string;
  readonly vehicleClass: VehicleClass;
}

interface Driver {
  readonly id: DriverId;
  readonly name: string;
  readonly phone: string;
  readonly avatar?: string;
  readonly rating: number;        // 0 to 5, e.g., 4.8
  readonly totalTrips: number;
  readonly verifiedAt: IsoDateTime;
}
```

### Fare Quote

```ts
interface FareQuote {
  readonly id: QuoteId;
  readonly pickup: GeoPoint;
  readonly dropoff: GeoPoint;
  readonly distance: number;      // In meters
  readonly duration: number;      // In seconds
  readonly baseFare: Money;
  readonly perKmFare: Money;
  readonly surgeFactor: number;   // 1.0 = no surge, 2.0 = 2x surge
  readonly estimatedFare: Money;
  readonly expiresAt: IsoDateTime;
}
```

### Trip Status Machine

```
requested
    ↓
  matching ←─ no_drivers
    ↓
driver_assigned
    ↓
  arriving
    ↓
in_progress
    ↓
completed

(any state) ↓ → cancelled
```

**State definitions:**

```ts
type TripStatusRequested = { readonly kind: 'requested' };
type TripStatusMatching = { readonly kind: 'matching' };
type TripStatusNoDrivers = { readonly kind: 'no_drivers' };

interface TripStatusDriverAssigned {
  readonly kind: 'driver_assigned';
  readonly driver: Driver;
  readonly vehicle: Vehicle;
}

interface TripStatusArriving {
  readonly kind: 'arriving';
  readonly driver: Driver;
  readonly vehicle: Vehicle;
}

interface TripStatusInProgress {
  readonly kind: 'in_progress';
  readonly driver: Driver;
  readonly vehicle: Vehicle;
}

type TripStatusCompleted = { readonly kind: 'completed' };

interface TripStatusCancelled {
  readonly kind: 'cancelled';
  readonly cancelledBy: 'rider' | 'driver' | 'system';
  readonly reason: string;
}

type TripStatus =
  | TripStatusRequested
  | TripStatusMatching
  | TripStatusNoDrivers
  | TripStatusDriverAssigned
  | TripStatusArriving
  | TripStatusInProgress
  | TripStatusCompleted
  | TripStatusCancelled;
```

### Trip Entity

```ts
interface Trip {
  readonly id: TripId;
  readonly riderId: UserId;
  readonly pickup: GeoPoint;
  readonly dropoff: GeoPoint;
  readonly stops?: readonly GeoPoint[];  // Optional intermediate stops
  readonly fare: Money;
  readonly status: TripStatus;
  readonly route?: readonly GeoPoint[];  // Actual route polyline
  readonly timeline: readonly TimelineEntry[];
  readonly paymentId?: PaymentId;
  readonly createdAt: IsoDateTime;
}

interface TimelineEntry {
  readonly status: string;
  readonly at: IsoDateTime;
}
```

### Mock Trip Progression Timing

Created → after progression time → next status:

| Elapsed Time | Status |
|--------------|--------|
| 0 s | requested |
| 1 s | matching |
| 5 s | driver_assigned |
| 15 s | arriving |
| 40 s | in_progress |
| 90 s | completed |

---

## Delivery Domain

### Parcel

```ts
type ParcelSizeClass = 'small' | 'medium' | 'large';

interface Parcel {
  readonly size: ParcelSizeClass;
  readonly weight: number;        // In kg
  readonly description: string;
  readonly requiresSignature: boolean;
}
```

### Delivery Recipient

```ts
interface DeliveryRecipient {
  readonly name: string;
  readonly phone: string;
  readonly address: Address;
}
```

### Delivery Status Machine

```
created
    ↓
courier_search
    ↓
courier_assigned
    ↓
pickup_enroute
    ↓
picked_up
    ↓
dropoff_enroute
    ↓
delivered

(any state) ↓ → cancelled
picked_up ↓ → failed_delivery → returning → returned
```

**State definitions:**

```ts
type DeliveryStatusCreated = { readonly kind: 'created' };
type DeliveryStatusCourierSearch = { readonly kind: 'courier_search' };
type DeliveryStatusCourierAssigned = { readonly kind: 'courier_assigned' };
type DeliveryStatusPickupEnroute = { readonly kind: 'pickup_enroute' };
type DeliveryStatusPickedUp = { readonly kind: 'picked_up' };
type DeliveryStatusDropoffEnroute = { readonly kind: 'dropoff_enroute' };
type DeliveryStatusDelivered = { readonly kind: 'delivered' };
type DeliveryStatusCancelled = { readonly kind: 'cancelled' };
type DeliveryStatusFailedDelivery = { readonly kind: 'failed_delivery' };
type DeliveryStatusReturning = { readonly kind: 'returning' };
type DeliveryStatusReturned = { readonly kind: 'returned' };

type DeliveryStatus =
  | DeliveryStatusCreated
  | DeliveryStatusCourierSearch
  | DeliveryStatusCourierAssigned
  | DeliveryStatusPickupEnroute
  | DeliveryStatusPickedUp
  | DeliveryStatusDropoffEnroute
  | DeliveryStatusDelivered
  | DeliveryStatusCancelled
  | DeliveryStatusFailedDelivery
  | DeliveryStatusReturning
  | DeliveryStatusReturned;
```

### Proof of Delivery

```ts
interface ProofOfDelivery {
  readonly recipientSignature?: string;  // Base64-encoded image
  readonly photo?: string;               // URL or base64
  readonly notes?: string;
  readonly timestamp: IsoDateTime;
}
```

### Delivery Entity

```ts
interface Delivery {
  readonly id: DeliveryId;
  readonly senderId: UserId;
  readonly parcel: Parcel;
  readonly pickupLocation: GeoPoint;
  readonly pickupAddress: Address;
  readonly recipient: DeliveryRecipient;
  readonly dropoffAddress: Address;
  readonly dropoffLocation: GeoPoint;
  readonly fare: Money;
  readonly status: DeliveryStatus;
  readonly proofOfDelivery?: ProofOfDelivery;
  readonly timeline: readonly TimelineEntry[];
  readonly paymentId?: PaymentId;
  readonly createdAt: IsoDateTime;
}
```

### Mock Delivery Progression Timing

Created → after progression time → next status:

| Elapsed Time | Status |
|--------------|--------|
| 0 s | created |
| 1 s | courier_search |
| 6 s | courier_assigned |
| 18 s | pickup_enroute |
| 45 s | picked_up |
| 70 s | dropoff_enroute |
| 110 s | delivered |

---

## Order Domain

### Order

An order is an abstraction over trips and deliveries, grouping related requests.

```ts
type OrderKind = 'ride' | 'delivery';

type OrderState =
  | { kind: 'draft' }
  | { kind: 'quoted' }
  | { kind: 'placed' }
  | { kind: 'active' }
  | { kind: 'completed' }
  | { kind: 'cancelled' }
  | { kind: 'failed' };

interface Order {
  readonly id: OrderId;
  readonly userId: UserId;
  readonly kind: OrderKind;
  readonly state: OrderState;
  readonly tripId?: TripId;        // Set if kind='ride'
  readonly deliveryId?: DeliveryId; // Set if kind='delivery'
  readonly createdAt: IsoDateTime;
  readonly updatedAt: IsoDateTime;
}
```

---

## Payment Domain

### Payment Method

```ts
interface PaymentMethod {
  readonly id: PaymentMethodId;
  readonly userId: UserId;
  readonly type: 'card' | 'wallet' | 'bank_transfer';
  readonly lastFour?: string;      // For cards
  readonly expiryMonth?: number;
  readonly expiryYear?: number;
  readonly isDefault: boolean;
  readonly savedAt: IsoDateTime;
}
```

### Payment Status Machine

```
pending
    ↓
authorized
    ↓
captured
    ↓
settled

(any state) ↓ → failed
captured ↓ → refund_pending → refunded
```

**State definitions:**

```ts
type PaymentStatePending = { readonly kind: 'pending' };
type PaymentStateAuthorized = { readonly kind: 'authorized' };
type PaymentStateCaptured = { readonly kind: 'captured' };
type PaymentStateSettled = { readonly kind: 'settled' };
type PaymentStateFailed = { readonly kind: 'failed'; readonly reason: string };
type PaymentStateRefundPending = { readonly kind: 'refund_pending' };
type PaymentStateRefunded = { readonly kind: 'refunded' };

type PaymentState =
  | PaymentStatePending
  | PaymentStateAuthorized
  | PaymentStateCaptured
  | PaymentStateSettled
  | PaymentStateFailed
  | PaymentStateRefundPending
  | PaymentStateRefunded;
```

### Payment Entity

```ts
interface Payment {
  readonly id: PaymentId;
  readonly userId: UserId;
  readonly orderId: OrderId;
  readonly amount: Money;
  readonly method: PaymentMethod;
  readonly state: PaymentState;
  readonly appliedPromo?: Promo;
  readonly discountAmount?: Money;
  readonly createdAt: IsoDateTime;
  readonly settledAt?: IsoDateTime;
}
```

### Wallet & Transactions

```ts
interface WalletTxn {
  readonly id: string;
  readonly type: 'credit' | 'debit';
  readonly amount: Money;
  readonly description: string;
  readonly relatedOrderId?: OrderId;
  readonly timestamp: IsoDateTime;
}

interface Wallet {
  readonly userId: UserId;
  readonly balance: Money;
  readonly transactions: readonly WalletTxn[];
}
```

### Mock Payment Progression Timing

Created → after progression time → next status:

| Elapsed Time | Status |
|--------------|--------|
| 0 s | pending |
| 5 s | authorized |
| 30 s | captured |
| 90 s | settled |

---

## Promo Domain

### Promo

```ts
type PromoStatus = 'active' | 'inactive' | 'expired';

interface Promo {
  readonly id: PromoId;
  readonly code: string;           // e.g., "SUMMER50"
  readonly description: string;
  readonly status: PromoStatus;
  readonly discountType: 'percentage' | 'fixed';
  readonly discountValue: number;  // 50 for 50%, 500 for $5
  readonly minOrderAmount?: Money;
  readonly maxUsages?: number;
  readonly usageCount: number;
  readonly validFrom: IsoDateTime;
  readonly validTo: IsoDateTime;
}
```

### Promo Application

```ts
interface PromoApplication {
  readonly promo: Promo;
  readonly discountAmount: Money;
  readonly appliedAt: IsoDateTime;
}
```

---

## Support Domain

### Ticket

```ts
type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
type TicketCategory =
  | 'ride_issue'
  | 'delivery_issue'
  | 'payment_issue'
  | 'account_issue'
  | 'feedback'
  | 'other';

interface TicketMessage {
  readonly id: string;
  readonly authorId: UserId;
  readonly body: string;
  readonly attachments?: readonly string[]; // URLs or base64
  readonly sentAt: IsoDateTime;
}

interface SupportTicket {
  readonly id: TicketId;
  readonly userId: UserId;
  readonly category: TicketCategory;
  readonly subject: string;
  readonly status: TicketStatus;
  readonly messages: readonly TicketMessage[];
  readonly createdAt: IsoDateTime;
  readonly resolvedAt?: IsoDateTime;
}
```

---

## Notification Domain

### Notification

```ts
type NotificationType =
  | 'trip_update'
  | 'delivery_update'
  | 'payment_confirmation'
  | 'promo_alert'
  | 'support_reply'
  | 'rating_request'
  | 'system_alert';

interface Notification {
  readonly id: NotificationId;
  readonly userId: UserId;
  readonly type: NotificationType;
  readonly title: string;
  readonly body: string;
  readonly data?: Record<string, string>;  // Deep-link info, etc.
  readonly isRead: boolean;
  readonly createdAt: IsoDateTime;
}
```

---

## Rating Domain

### Rating

```ts
interface Rating {
  readonly id: string;
  readonly ratedBy: UserId;
  readonly ratedUser: UserId;  // Driver or courier
  readonly score: RatingScore; // 1 to 5
  readonly comment?: string;
  readonly relatedOrderId: OrderId;
  readonly createdAt: IsoDateTime;
}

type RatingScore = 1 | 2 | 3 | 4 | 5;
```

---

## Type Export Hierarchy

All types are exported from `@vroom/types`:

```ts
// packages/types/src/index.ts
export type {
  // Primitives
  Brand,
  UserId,
  TripId,
  DeliveryId,
  OrderId,
  PaymentId,
  PromoId,
  TicketId,
  NotificationId,
  VehicleId,
  DriverId,
  QuoteId,
  AddressId,
  Money,
  GeoPoint,
  Paginated,
  Result,

  // User domain
  User,
  Session,
  Address,

  // Ride domain
  VehicleClass,
  Vehicle,
  Driver,
  FareQuote,
  Trip,
  TripStatus,
  // ... and all TripStatusXxx variants

  // Delivery domain
  Parcel,
  Delivery,
  DeliveryStatus,
  DeliveryRecipient,
  // ... and all DeliveryStatusXxx variants

  // Order domain
  Order,
  OrderKind,
  OrderState,

  // Payment domain
  PaymentMethod,
  Payment,
  PaymentState,
  Wallet,
  WalletTxn,

  // Promo domain
  Promo,
  PromoApplication,

  // Support domain
  SupportTicket,
  TicketMessage,
  TicketStatus,
  TicketCategory,

  // Notification domain
  Notification,
  NotificationType,

  // Rating domain
  Rating,
  RatingScore,
};
```

**No runtime code is exported from `@vroom/types`. Only type definitions.**

---

## Key Design Notes

1. **Discriminated unions** (TripStatus, DeliveryStatus, PaymentState) force exhaustive case handling and prevent accessing fields that don't exist in a state.

2. **Branded IDs** prevent passing a UserId where a TripId is expected, catching bugs at compile time.

3. **Readonly properties** throughout ensure immutability and prevent accidental mutations.

4. **Status timelines** (TimelineEntry[]) provide a complete history of state changes with timestamps.

5. **Optional fields** use the `readonly key?: Type` syntax (not `key: Type | undefined`) to comply with `exactOptionalPropertyTypes` compiler flag.

6. **Money is stored in minor units** (e.g., cents for USD) to avoid floating-point precision errors.

7. **State machines are explicit.** No implicit state transitions; the API always returns the full current state.
