# API Contracts

Complete specification of endpoint groups, request/response types, React Query hooks, and error handling for the Vroom API.

---

## Overview

The API is defined by three layers:

1. **Contracts** (`@vroom/api/src/contracts/`) — Request and response types (TypeScript interfaces)
2. **Endpoints** (`@vroom/api/src/endpoints/`) — API method signatures (AuthApi, RideApi, etc.)
3. **Client** (`@vroom/api/src/client.ts`) — Factory that swaps mock ↔ http implementation
4. **React Query Hooks** (`@vroom/api/src/query/hooks.ts`) — `createApiHooks(client)` for app consumption

---

## API Mode Swap Seam

### Factory Function

```ts
// packages/api/src/client.ts
export interface ApiClientConfig {
  readonly mode: 'mock' | 'http';
  readonly baseUrl?: string; // Required if mode='http'
}

export function createApiClient(cfg: ApiClientConfig): ApiClient {
  if (cfg.mode === 'mock') {
    return createMockClient();   // In-memory store + ticker
  }
  return createHttpClient(cfg.baseUrl ?? '');  // Real backend
}
```

### App Usage

```ts
// apps/mobile/src/main.tsx or apps/web/src/main.tsx
import { createApiClient } from '@vroom/api';
import { loadConfig } from '@vroom/config';

const config = loadConfig(import.meta.env);  // or process.env on Expo
const client = createApiClient({
  mode: config.apiMode,
  baseUrl: config.apiBaseUrl,
});

// Use with React Query
const apiHooks = createApiHooks(client);
```

**To switch from mock to production:** Change one environment variable and redeploy.

---

## Endpoint Groups

### 1. Auth

**Responsible for:** Phone/OTP registration, session management, token refresh.

| Method | Request | Response | Status |
|--------|---------|----------|--------|
| `requestOtp(phone)` | `RequestOtpReq` | `RequestOtpRes` | OTP sent via SMS (mocked) |
| `verifyOtp(phone, code)` | `VerifyOtpReq` | `VerifyOtpRes` | Returns `Session` with token |
| `refresh(token)` | `RefreshReq` | `RefreshRes` | New token + expiry |

**Contracts:**

```ts
// packages/api/src/contracts/auth.ts
export interface RequestOtpReq {
  readonly phone: string;  // E.164 format, e.g., "+14155552671"
}

export interface RequestOtpRes {
  readonly message: string;  // e.g., "OTP sent to +1..."
}

export interface VerifyOtpReq {
  readonly phone: string;
  readonly code: string;  // 6-digit OTP
}

export interface VerifyOtpRes {
  readonly session: Session;
}

export interface RefreshReq {
  readonly refreshToken: string;
}

export interface RefreshRes {
  readonly token: string;
  readonly expiresAt: IsoDateTime;
}
```

**Mock behavior:**
- `requestOtp` — Any E.164 phone accepted.
- `verifyOtp` — Any 6-digit code accepted; demo code is `000000`.
- Session has userId=DEMO_USER_ID, token="demo-token".

---

### 2. User

**Responsible for:** Profile, addresses, basic user data.

| Method | Request | Response | Status |
|--------|---------|----------|--------|
| `getMe()` | — | `GetMeRes` | Current user + profile |
| `listAddresses()` | — | `ListAddressesRes` | All saved addresses |
| `saveAddress(...)` | `SaveAddressReq` | `SaveAddressRes` | New or updated address |
| `deleteAddress(id)` | — | `DeleteAddressRes` | Confirmation |

**Contracts:**

```ts
// packages/api/src/contracts/user.ts
export type GetMeRes = User;

export interface ListAddressesRes {
  readonly addresses: readonly Address[];
}

export interface SaveAddressReq {
  readonly label: AddressLabel;  // 'home' | 'work' | 'other'
  readonly displayName: string;
  readonly fullAddress: string;
  readonly location: GeoPoint;
}

export type SaveAddressRes = Address;

export interface DeleteAddressRes {
  readonly success: boolean;
}
```

---

### 3. Ride

**Responsible for:** Fare quotes, trip requests, live trip tracking, cancellations.

| Method | Request | Response | Status |
|--------|---------|----------|--------|
| `rideQuote(...)` | `RideQuoteReq` | `RideQuoteRes` | Fare estimate |
| `requestRide(...)` | `RequestRideReq` | `RequestRideRes` | Trip created |
| `getTrip(tripId)` | `GetTripReq` | `GetTripRes` | Current trip state |
| `cancelTrip(...)` | `CancelTripReq` | `CancelTripRes` | Trip marked cancelled |

**Contracts:**

```ts
// packages/api/src/contracts/ride.ts
export interface RideQuoteReq {
  readonly pickup: GeoPoint;
  readonly dropoff: GeoPoint;
  readonly vehicleClass: VehicleClass;  // 'economy' | 'comfort' | 'premium'
}

export type RideQuoteRes = FareQuote;

export interface RequestRideReq {
  readonly quoteId: QuoteId;
  readonly paymentMethodId: PaymentMethodId;
  readonly promoCode?: string;
}

export type RequestRideRes = Trip;

export interface GetTripReq {
  readonly tripId: TripId;
}

export type GetTripRes = Trip;

export interface CancelTripReq {
  readonly tripId: TripId;
  readonly reason: string;
}

export type CancelTripRes = Trip;
```

**Mock behavior:**
- Quotes expire in 60s; valid for any location pair.
- `requestRide` creates a trip and starts the ticker (5s matching → 15s driver_assigned → 40s arriving → 90s in_progress → completed).
- `getTrip` returns the progressed state based on elapsed time since creation.
- `cancelTrip` stops progression and sets status to `cancelled`.

---

### 4. Delivery

**Responsible for:** Delivery quotes, parcel requests, delivery tracking, cancellations.

| Method | Request | Response | Status |
|--------|---------|----------|--------|
| `deliveryQuote(...)` | `DeliveryQuoteReq` | `DeliveryQuoteRes` | Fare estimate |
| `createDelivery(...)` | `CreateDeliveryReq` | `CreateDeliveryRes` | Delivery created |
| `getDelivery(deliveryId)` | `GetDeliveryReq` | `GetDeliveryRes` | Current delivery state |
| `cancelDelivery(...)` | `CancelDeliveryReq` | `CancelDeliveryRes` | Delivery marked cancelled |

**Contracts:**

```ts
// packages/api/src/contracts/delivery.ts
export interface DeliveryQuoteReq {
  readonly pickupLocation: GeoPoint;
  readonly dropoffLocation: GeoPoint;
  readonly parcel: Parcel;
}

export type DeliveryQuoteRes = FareQuote;

export interface CreateDeliveryReq {
  readonly quoteId: QuoteId;
  readonly pickupAddress: Address;
  readonly recipient: DeliveryRecipient;
  readonly dropoffAddress: Address;
  readonly paymentMethodId: PaymentMethodId;
  readonly promoCode?: string;
}

export type CreateDeliveryRes = Delivery;

export interface GetDeliveryReq {
  readonly deliveryId: DeliveryId;
}

export type GetDeliveryRes = Delivery;

export interface CancelDeliveryReq {
  readonly deliveryId: DeliveryId;
  readonly reason: string;
}

export type CancelDeliveryRes = Delivery;
```

**Mock behavior:**
- Quotes expire in 60s; valid for any location pair and parcel size.
- `createDelivery` creates a delivery and starts the ticker (6s courier_search → 18s courier_assigned → 45s pickup_enroute → 110s delivered).
- `getDelivery` returns the progressed state based on elapsed time.
- `cancelDelivery` stops progression and sets status to `cancelled`.

---

### 5. Orders

**Responsible for:** Order history and aggregation.

| Method | Request | Response | Status |
|--------|---------|----------|--------|
| `listOrders(filter?)` | `ListOrdersReq` | `ListOrdersRes` | Paginated order list |

**Contracts:**

```ts
// packages/api/src/contracts/orders.ts
export interface ListOrdersReq {
  readonly kind?: OrderKind;  // Filter by 'ride' or 'delivery'
  readonly cursor?: string;   // Pagination cursor
}

export interface ListOrdersRes {
  readonly orders: readonly Order[];
  readonly nextCursor?: string;
}
```

---

### 6. Payments

**Responsible for:** Payment methods, wallet, payment state, card management.

| Method | Request | Response | Status |
|--------|---------|----------|--------|
| `listPaymentMethods()` | — | `ListPaymentMethodsRes` | All saved payment methods |
| `addPaymentMethod(...)` | `AddPaymentMethodReq` | `AddPaymentMethodRes` | New payment method |
| `deletePaymentMethod(id)` | — | `DeletePaymentMethodRes` | Confirmation |
| `getPayment(paymentId)` | `GetPaymentReq` | `GetPaymentRes` | Payment state |
| `getWallet()` | — | `GetWalletRes` | User's wallet + balance |

**Contracts:**

```ts
// packages/api/src/contracts/payments.ts
export type ListPaymentMethodsRes = readonly PaymentMethod[];

export interface AddPaymentMethodReq {
  readonly cardNumber: string;
  readonly expiryMonth: number;
  readonly expiryYear: number;
  readonly cvv: string;
  readonly cardholderName: string;
  readonly isDefault?: boolean;
}

export type AddPaymentMethodRes = PaymentMethod;

export interface DeletePaymentMethodRes {
  readonly success: boolean;
}

export interface GetPaymentReq {
  readonly paymentId: PaymentId;
}

export type GetPaymentRes = Payment;

export type GetWalletRes = Wallet;
```

**Mock behavior:**
- `addPaymentMethod` accepts any card number (no real validation in mock).
- Payments auto-progress: pending (5s) → authorized (30s) → captured (90s) → settled.

---

### 7. Promos

**Responsible for:** Promo code validation and application.

| Method | Request | Response | Status |
|--------|---------|----------|--------|
| `validatePromo(code)` | `ValidatePromoReq` | `ValidatePromoRes` | Check if code is valid |
| `applyPromo(...)` | `ApplyPromoReq` | `ApplyPromoRes` | Apply code to order |

**Contracts:**

```ts
// packages/api/src/contracts/promos.ts
export interface ValidatePromoReq {
  readonly code: string;
}

export type ValidatePromoRes = Promo;

export interface ApplyPromoReq {
  readonly code: string;
  readonly orderId: OrderId;
}

export type ApplyPromoRes = PromoApplication;
```

**Mock behavior:**
- `validatePromo` accepts any code; demo codes: "DEMO50" (50% off), "DEMO10" ($10 off).
- Invalid codes return validation error.

---

### 8. Support

**Responsible for:** Support tickets, messages, FAQ.

| Method | Request | Response | Status |
|--------|---------|----------|--------|
| `listTickets()` | — | `ListTicketsRes` | User's support tickets |
| `createTicket(...)` | `CreateTicketReq` | `CreateTicketRes` | New ticket created |
| `postMessage(...)` | `PostMessageReq` | `PostMessageRes` | Message added to ticket |

**Contracts:**

```ts
// packages/api/src/contracts/support.ts
export type ListTicketsRes = readonly SupportTicket[];

export interface CreateTicketReq {
  readonly category: TicketCategory;
  readonly subject: string;
  readonly body: string;
  readonly attachments?: readonly string[];  // Base64 or URLs
}

export type CreateTicketRes = SupportTicket;

export interface PostMessageReq {
  readonly ticketId: TicketId;
  readonly body: string;
  readonly attachments?: readonly string[];
}

export type PostMessageRes = SupportTicket;
```

**Mock behavior:**
- `createTicket` generates a new ticket with status='open'.
- `postMessage` appends a message to the ticket's message list.

---

### 9. Notifications

**Responsible for:** Push notifications, in-app notifications, read status.

| Method | Request | Response | Status |
|--------|---------|----------|--------|
| `listNotifications(cursor?)` | `ListNotificationsReq` | `ListNotificationsRes` | Paginated notifications |
| `markNotificationsRead(...)` | `MarkReadReq` | `MarkReadRes` | Mark as read |

**Contracts:**

```ts
// packages/api/src/contracts/notifications.ts
export interface ListNotificationsReq {
  readonly cursor?: string;
}

export interface ListNotificationsRes {
  readonly notifications: readonly Notification[];
  readonly nextCursor?: string;
  readonly unreadCount: number;
}

export interface MarkReadReq {
  readonly notificationIds: readonly NotificationId[];
}

export type MarkReadRes = { readonly success: boolean };
```

**Mock behavior:**
- Returns a fixed list of demo notifications.
- `markNotificationsRead` updates the `isRead` flag in memory.

---

### 10. Geo

**Responsible for:** Place autocomplete and reverse geocoding.

| Method | Request | Response | Status |
|--------|---------|----------|--------|
| `autocomplete(query)` | `AutocompleteReq` | `AutocompleteRes` | Place suggestions |
| `reverseGeocode(location)` | `ReverseGeocodeReq` | `ReverseGeocodeRes` | Address from coordinates |

**Contracts:**

```ts
// packages/api/src/contracts/geo.ts
export interface AutocompleteReq {
  readonly query: string;
  readonly location?: GeoPoint;  // Bias results around this location
}

export type AutocompleteRes = readonly PlaceSuggestion[];

export interface ReverseGeocodeReq {
  readonly location: GeoPoint;
}

export type ReverseGeocodeRes = Address;
```

**Mock behavior:**
- `autocomplete` returns demo addresses (no real geocoding).
- `reverseGeocode` returns a demo address for any coordinates.

---

## Error Handling

### ApiError Discriminated Union

```ts
// packages/api/src/errors.ts
export type ApiError =
  | ApiErrorNetwork
  | ApiErrorTimeout
  | ApiErrorUnauthorized
  | ApiErrorValidation
  | ApiErrorNotFound
  | ApiErrorConflict
  | ApiErrorServer
  | ApiErrorUnknown;

export interface ApiErrorNetwork {
  readonly kind: 'network';
  readonly message: string;
  readonly details?: unknown;
}

export interface ApiErrorTimeout {
  readonly kind: 'timeout';
  readonly message: string;
  readonly details?: unknown;
}

export interface ApiErrorUnauthorized {
  readonly kind: 'unauthorized';
  readonly message: string;
}

export interface ApiErrorValidation {
  readonly kind: 'validation';
  readonly message: string;
  readonly details?: Record<string, string[]>;  // Field-level errors
}

export interface ApiErrorNotFound {
  readonly kind: 'not_found';
  readonly message: string;
}

export interface ApiErrorConflict {
  readonly kind: 'conflict';
  readonly message: string;
}

export interface ApiErrorServer {
  readonly kind: 'server';
  readonly message: string;
}

export interface ApiErrorUnknown {
  readonly kind: 'unknown';
  readonly message: string;
}
```

### Usage in Components

```ts
import { useMe } from '@vroom/api';

function Profile() {
  const { data: user, isLoading, error } = useMe();

  if (isLoading) return <Skeleton />;

  if (error) {
    if (error.kind === 'unauthorized') {
      return <Redirect to="/auth/phone" />;
    }
    if (error.kind === 'network') {
      return <ErrorView message="No internet connection" />;
    }
    return <ErrorView message={error.message} />;
  }

  return <UserCard user={user} />;
}
```

---

## React Query Hooks

All hooks are created by `createApiHooks(client)`:

```ts
// apps/mobile/src/api.ts or apps/web/src/api.ts
import { createApiClient, createApiHooks } from '@vroom/api';
import { loadConfig } from '@vroom/config';

const config = loadConfig(import.meta.env);
const client = createApiClient({
  mode: config.apiMode,
  baseUrl: config.apiBaseUrl,
});

export const api = createApiHooks(client);
```

### Hook Categories

#### User Hooks

```ts
api.useMe()                           // Get current user
api.useAddresses()                    // List saved addresses
api.useSaveAddress()                  // Save/update address
api.useDeleteAddress()                // Delete address
```

#### Ride Hooks

```ts
api.useRideQuote(rideQuoteReq)        // Get fare quote
api.useRequestRide()                  // Mutate: create trip
api.useTrip(tripId)                   // Get trip (polls every 3s while active)
api.useCancelTrip()                   // Mutate: cancel trip
```

#### Delivery Hooks

```ts
api.useDeliveryQuote(deliveryQuoteReq)  // Get fare quote
api.useCreateDelivery()                 // Mutate: create delivery
api.useDelivery(deliveryId)             // Get delivery (polls every 3s while active)
api.useCancelDelivery()                 // Mutate: cancel delivery
```

#### Order Hooks

```ts
api.useOrders(filter?)                // List orders (paginated)
```

#### Payment Hooks

```ts
api.usePaymentMethods()               // List payment methods
api.useAddPaymentMethod()              // Mutate: add card
api.useDeletePaymentMethod()           // Mutate: delete card
api.usePayment(paymentId)              // Get payment state
api.useWallet()                        // Get wallet + balance
```

#### Promo Hooks

```ts
api.useValidatePromo(code)            // Validate promo code
api.useApplyPromo()                    // Mutate: apply code
```

#### Support Hooks

```ts
api.useTickets()                       // List user's tickets
api.useCreateTicket()                  // Mutate: create ticket
api.usePostMessage()                   // Mutate: add message
```

#### Notification Hooks

```ts
api.useNotifications(cursor?)         // List notifications (paginated)
api.useMarkNotificationsRead()        // Mutate: mark as read
```

#### Geo Hooks

```ts
api.useAutocomplete(query)             // Place autocomplete
api.useReverseGeocode(location)        // Reverse geocoding
```

### Hook Configuration

#### Query Hooks (Read)

- **staleTime:** How long cached data is considered fresh
  - Standard (me, addresses, methods): 5 min
  - Quotes (fare, promo): 1 min
  - Live (trip, delivery): 0 (always refetch)
- **refetchInterval:** For live queries, 3 sec while active
- **refetchOnWindowFocus:** Refetch when tab regains focus

#### Mutation Hooks (Write)

- **Optimistic updates:** `useCancelTrip` / `useCancelDelivery` optimistically update cache, roll back on error
- **Invalidation:** Mutations auto-invalidate related cache keys (e.g., `useRequestRide` invalidates `useOrders`)

### Example: Booking a Ride

```ts
import { api } from '@/api';
import { useState } from 'react';

function RideBooking() {
  const [quote, setQuote] = useState(null);

  // 1. Get fare quote
  const { data: fareQuote } = api.useRideQuote({
    pickup: userLocation,
    dropoff: destination,
    vehicleClass: 'economy',
  });

  // 2. Request the ride (mutation)
  const { mutate: requestRide, isLoading } = api.useRequestRide();

  // 3. Handle booking submission
  const handleBook = async () => {
    requestRide(
      {
        quoteId: fareQuote.id,
        paymentMethodId: selectedPaymentMethod.id,
        promoCode: appliedPromo?.code,
      },
      {
        onSuccess: (trip) => {
          console.log('Trip created:', trip.id);
          // Navigate to live tracking
          navigate(`/track/${trip.id}`);
        },
        onError: (error) => {
          if (error.kind === 'validation') {
            console.error('Validation error:', error.details);
          }
        },
      },
    );
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleBook(); }}>
      <p>Estimated fare: {formatMoney(fareQuote.estimatedFare)}</p>
      <button disabled={isLoading}>Confirm Booking</button>
    </form>
  );
}
```

### Example: Live Tracking

```ts
function LiveTracking({ tripId }) {
  // This hook:
  // - Fetches immediately
  // - Refetches every 3s while the component is mounted
  // - Stops refetching after trip reaches terminal state (completed/cancelled)
  const { data: trip, isLoading, error } = api.useTrip(tripId);

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorView error={error} />;

  return (
    <>
      <Map route={trip.route} currentLocation={trip.route?.[-1]} />
      <StatusCard trip={trip} />
      {trip.status.kind === 'driver_assigned' && (
        <DriverCard driver={trip.status.driver} />
      )}
    </>
  );
}
```

---

## Query Keys

All query keys are managed by the hooks library and don't need to be constructed manually.

To invalidate related cache after a mutation:

```ts
const queryClient = useQueryClient();

const { mutate: requestRide } = api.useRequestRide();

const handleBook = () => {
  requestRide(
    { quoteId, paymentMethodId },
    {
      onSuccess: () => {
        // Automatically invalidated by the hook
        // But you can manually invalidate if needed:
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      },
    },
  );
};
```

---

## Mock vs. HTTP Implementation

### Mock Client

- **Location:** `packages/api/src/mock/mockClient.ts`
- **Store:** In-memory object store (`packages/api/src/mock/store.ts`)
- **State progression:** Time-based ticker (`packages/api/src/mock/ticker.ts`)
- **Latency injection:** Configurable delay for testing (`packages/api/src/mock/latency.ts`)
- **Fixtures:** Demo data (`packages/api/src/mock/fixtures.ts`)

### HTTP Client

- **Location:** `packages/api/src/http/httpClient.ts` (stub ready for implementation)
- **Transport:** Fetch API with Bearer token auth
- **Error mapping:** HTTP status codes → ApiError discriminated union
- **Retry:** Built-in retry logic for network errors and 5xx responses

### Switching Modes

**Development (mock):**
```bash
VROOM_API_MODE=mock
```

**Production (http):**
```bash
VROOM_API_MODE=http
VROOM_API_BASE_URL=https://api.vroom.example.com
```

No code changes required. Apps work identically with both.

---

## Further Reading

- [domain-model.md](domain-model.md) — Entity definitions
- [state-flows.md](state-flows.md) — How API calls integrate with state management
- [build-and-deploy.md](build-and-deploy.md) — Extending to a real backend
- React Query: https://tanstack.com/query/latest
