# State Flows

Data flow from user interaction through view state, server state (React Query), and the API layer, with worked examples for ride booking and delivery.

---

## State Management Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ User Interaction (Button click, form submission)                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ View State (Zustand)                                             │
│ - Form drafts (destination, parcel details)                     │
│ - UI toggles (modals, tabs, visibility)                         │
│ - Multi-step wizard step tracking                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ React Query Mutation Hook (useMutation)                          │
│ - Validates input via @vroom/validation Zod schema             │
│ - Calls api.requestRide({ quoteId, paymentMethodId, ... })    │
│ - Handles optimistic updates, error rollback                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ ApiClient Interface (createApiClient)                            │
│ Mode: 'mock' (in-memory) | 'http' (real backend)               │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        ↓                                 ↓
   Mock Backend                    HTTP Backend
   - In-memory store              - Real REST/GraphQL API
   - Deterministic ticker         - Network requests
   - Demo fixtures                - Real database
        │                                 │
        ↓                                 ↓
   Returns Trip (mocked)          Returns Trip (real)
        │                                 │
        └────────────────┬────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ React Query Cache Update                                         │
│ - Cache entry: queryKey: ['trips', tripId]                     │
│ - Components subscribed to this key re-render with new data    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ Component Re-render (UI updated)                                 │
│ - LiveTracking now shows trip.status = 'driver_assigned'       │
│ - Driver + vehicle info rendered                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Example 1: Ride Booking Flow

### Starting State

User is on the `RideBooking` screen, form is empty:

```ts
// View State (Zustand)
const rideBookingStore = {
  destination: null,
  vehicleClass: null,
  selectedPaymentMethod: null,
  step: 'destination',
};

// Server State (React Query)
const queryCache = {
  rides: {
    quotes: {},  // Empty
  },
  orders: { /* ... */ },
};
```

### Step 1: User Enters Destination

**Action:** Type destination address and press "Next"

```ts
// 1. View State updates immediately
rideBookingStore.destination = { lat: 40.7128, lng: -74.0060 };
rideBookingStore.step = 'vehicle';

// 2. Get fare quote (React Query fetch)
const { data: fareQuote } = api.useRideQuote({
  pickup: userLocation,          // e.g., { lat: 40.7489, lng: -73.9680 }
  dropoff: destination,           // { lat: 40.7128, lng: -74.0060 }
  vehicleClass: 'economy',
});

// Query key: ['rides', 'quote', { pickup, dropoff, vehicleClass }]
// React Query calls: client.rideApi.rideQuote(...)
```

**Mock response:**

```ts
// In-memory store returns immediately
FareQuote {
  id: 'quote-123',
  pickup: { lat: 40.7489, lng: -73.9680 },
  dropoff: { lat: 40.7128, lng: -74.0060 },
  distance: 5800,  // meters
  duration: 900,   // seconds
  baseFare: { amount: 250, currency: 'USD' },
  estimatedFare: { amount: 1200, currency: 'USD' },
  expiresAt: '2024-12-01T15:10:30Z',
}
```

**UI Update:**
```
Screen shows:
  - Pickup: "Madison Square Garden, NY"
  - Dropoff: "Wall Street, NY"
  - Estimated fare: $12.00
  - [Next] button → proceeds to vehicle selection
```

---

### Step 2: User Selects Payment Method & Confirms

**Action:** Select payment method, tap "Confirm Booking"

```ts
// View State updates
rideBookingStore.selectedPaymentMethod = { id: 'pm-456', type: 'card' };

// Mutation hook set up
const { mutate: requestRide, isLoading } = api.useRequestRide();

// User taps Confirm
requestRide({
  quoteId: 'quote-123',
  paymentMethodId: 'pm-456',
  promoCode: undefined,  // Optional
});
```

**Before mutation:** React Query query status = `loading`

**Server State before mutation:**
```ts
queryCache = {
  trips: {},  // Empty
  orders: {},
};
```

**Optimistic update (optional in this case, but shown for completeness):**
```ts
// React Query can optimistically add to orders
queryCache = {
  trips: {
    'trip-789': {
      id: 'trip-789',
      status: { kind: 'requested' },  // Optimistic
      fare: { amount: 1200, currency: 'USD' },
      // ... other fields
    },
  },
};
```

---

### Step 3: API Response (Mock)

**Mock backend processing:**

```ts
// packages/api/src/mock/mockClient.ts
async requestRide(req: RequestRideReq): Promise<Result<Trip, ApiError>> {
  // Validate request
  const validated = requestRideSchema.safeParse(req);
  if (!validated.success) {
    return { ok: false, error: validationError('Invalid request') };
  }

  // Create trip in store
  const trip: Trip = {
    id: crypto.randomUUID() as TripId,
    riderId: store.userId,
    pickup: quote.pickup,
    dropoff: quote.dropoff,
    fare: quote.estimatedFare,
    status: { kind: 'requested' },
    timeline: [{ status: 'requested', at: new Date().toISOString() }],
    paymentId: createPayment(...),  // Create payment
    createdAt: new Date().toISOString(),
  };

  // Register with ticker (starts progression)
  registerTrip(trip.id);
  store.trips.set(trip.id, trip);

  // Return trip immediately
  return { ok: true, value: trip };
}
```

**Response (after ~100ms mock latency):**

```ts
Trip {
  id: 'trip-789',
  riderId: 'user-123',
  pickup: { lat: 40.7489, lng: -73.9680 },
  dropoff: { lat: 40.7128, lng: -74.0060 },
  fare: { amount: 1200, currency: 'USD' },
  status: { kind: 'requested' },
  timeline: [
    { status: 'requested', at: '2024-12-01T15:05:30Z' },
  ],
  paymentId: 'payment-999',
  createdAt: '2024-12-01T15:05:30Z',
}
```

---

### Step 4: Cache Update & Navigation

**React Query updates cache:**

```ts
queryCache = {
  trips: {
    'trip-789': Trip { ... },  // Server response
  },
  orders: {
    _list: [
      Order {
        id: 'order-111',
        kind: 'ride',
        tripId: 'trip-789',
        state: { kind: 'placed' },
      },
      // ... other orders
    ],
  },
};
```

**Components subscribed to `useTrip('trip-789')` re-render:**

```ts
function LiveTracking() {
  const { data: trip } = api.useTrip('trip-789');  // Subscribes to cache key

  // trip.status = { kind: 'requested' } at first render
  return (
    <div>
      <StatusBadge status={trip.status.kind} />  // "Searching for driver"
      {trip.status.kind === 'requested' && <Spinner />}
    </div>
  );
}
```

**App navigates to tracking screen:**

```ts
// Mobile
navigation.navigate('ActivityTab', {
  screen: 'tracking.live-tracking',
  params: { tripId: 'trip-789' },
});

// Web
navigate(`/app/track/trip-789`);
```

---

### Step 5: Mock Ticker Progression

The mock ticker runs in the background, auto-progressing the trip based on elapsed time:

```ts
// packages/api/src/mock/ticker.ts
const TRIP_THRESHOLDS = {
  0: 'requested',
  1: 'matching',
  5: 'driver_assigned',
  15: 'arriving',
  40: 'in_progress',
  90: 'completed',
};

// When getTrip is called, compute elapsed time:
function getProgressedTrip(tripId: TripId): Trip {
  const createdAt = tripCreatedAt.get(tripId);
  const elapsedSec = (Date.now() - createdAt) / 1000;

  const status = getProgressedStatus(elapsedSec);
  trip.status = status;  // Mutate in place
  trip.timeline.push(...newTimeline);
  return trip;
}
```

**After 5 seconds:**

React Query auto-refetch (every 3s while component mounted):

```ts
// api.useTrip(tripId) refetches
// client.rideApi.getTrip(tripId) called
// Mock backend computes elapsed = 5s → status = 'driver_assigned'

Trip {
  id: 'trip-789',
  status: {
    kind: 'driver_assigned',
    driver: { id: 'driver-001', name: 'Alice', rating: 4.9, ... },
    vehicle: { id: 'vehicle-001', make: 'Toyota', model: 'Prius', ... },
  },
  timeline: [
    { status: 'requested', at: '2024-12-01T15:05:30Z' },
    { status: 'matching', at: '2024-12-01T15:05:31Z' },
    { status: 'driver_assigned', at: '2024-12-01T15:05:35Z' },
  ],
}
```

**Component subscribing to cache re-renders automatically:**

```ts
function LiveTracking() {
  const { data: trip } = api.useTrip('trip-789');

  // trip.status now has driver info
  return (
    <div>
      <DriverCard driver={trip.status.driver} />  // Shows Alice
      <VehicleCard vehicle={trip.status.vehicle} />
    </div>
  );
}
```

**Timeline continues:**
- After 15s: `arriving` (includes ETA countdown)
- After 40s: `in_progress` (live location map)
- After 90s: `completed` (show receipt, ask for rating)

---

## Example 2: Delivery Flow

### Starting State

User on `Delivery` screen:

```ts
// View State
deliveryStore = {
  parcelSize: null,
  pickupLocation: null,
  dropoffLocation: null,
  recipientName: null,
  step: 'parcel-details',
};

// Server State (React Query)
queryCache = {
  deliveries: {
    quotes: {},
  },
};
```

---

### Step 1: User Fills Parcel Details

**Action:** Select "medium" parcel, add description

```ts
// View State
deliveryStore.parcelSize = 'medium';
deliveryStore.weight = 2.5;  // kg
deliveryStore.description = 'Electronics package';
deliveryStore.step = 'route';  // Move to next step
```

---

### Step 2: User Enters Route (Pickup & Dropoff)

**Action:** Enter pickup and dropoff addresses

```ts
// View State
deliveryStore.pickupLocation = { lat: 40.7489, lng: -73.9680 };
deliveryStore.dropoffLocation = { lat: 40.7128, lng: -74.0060 };
deliveryStore.recipientName = 'Bob Smith';
deliveryStore.recipientPhone = '+14155552671';

// Get delivery quote
const { data: fareQuote } = api.useDeliveryQuote({
  pickupLocation: deliveryStore.pickupLocation,
  dropoffLocation: deliveryStore.dropoffLocation,
  parcel: {
    size: 'medium',
    weight: 2.5,
    description: 'Electronics package',
    requiresSignature: false,
  },
});
```

**Mock response:**

```ts
FareQuote {
  id: 'quote-456',
  pickup: { lat: 40.7489, lng: -73.9680 },
  dropoff: { lat: 40.7128, lng: -74.0060 },
  distance: 5800,
  baseFare: { amount: 300, currency: 'USD' },
  estimatedFare: { amount: 1500, currency: 'USD' },  // Delivery is pricier
  expiresAt: '2024-12-01T15:20:30Z',
}
```

---

### Step 3: Confirm & Create Delivery

**Action:** Select payment method, tap "Confirm Delivery"

```ts
const { mutate: createDelivery } = api.useCreateDelivery();

createDelivery({
  quoteId: 'quote-456',
  pickupAddress: savedAddresses[0],  // From user's saved addresses
  recipient: {
    name: 'Bob Smith',
    phone: '+14155552671',
    address: selectedDropoffAddress,
  },
  dropoffAddress: selectedDropoffAddress,
  paymentMethodId: 'pm-456',
});
```

---

### Step 4: Delivery Created & Progression Starts

**Mock backend:**

```ts
// Create delivery
const delivery = Delivery {
  id: 'delivery-202',
  senderId: 'user-123',
  parcel: { size: 'medium', weight: 2.5, ... },
  pickupLocation: { lat: 40.7489, lng: -73.9680 },
  dropoffLocation: { lat: 40.7128, lng: -74.0060 },
  status: { kind: 'created' },
  timeline: [...],
  createdAt: new Date().toISOString(),
};

// Register with ticker
registerDelivery(delivery.id);
store.deliveries.set(delivery.id, delivery);
```

**Response returned, cache updated, user navigated to tracking.**

---

### Step 5: Ticker Progression

```ts
const DELIVERY_THRESHOLDS = {
  0: 'created',
  1: 'courier_search',
  6: 'courier_assigned',
  18: 'pickup_enroute',
  45: 'picked_up',
  70: 'dropoff_enroute',
  110: 'delivered',
};
```

**Timeline:**

| Time | Status | UI Updates |
|------|--------|-----------|
| 0s | created | "Booking courier..." |
| 1s | courier_search | Spinner |
| 6s | courier_assigned | Show courier avatar, name, rating |
| 18s | pickup_enroute | "Courier en route to pickup" |
| 45s | picked_up | "Parcel picked up" |
| 70s | dropoff_enroute | "Courier en route to recipient" |
| 110s | delivered | "Delivered!" + proof of delivery image |

---

## State Flow Diagram: Ride Booking (Text)

```
User Input
  │
  ├─ Enter destination
  │  ├─ View State: rideBookingStore.destination = GeoPoint
  │  └─ React Query: useRideQuote fetches fare estimate
  │     ├─ QueryKey: ['rides', 'quote', { pickup, dropoff, vehicleClass }]
  │     ├─ Mock → Returns FareQuote in 50-100ms
  │     └─ Cache: queryCache['rides.quote'] = FareQuote
  │
  ├─ Select payment method
  │  └─ View State: rideBookingStore.selectedPaymentMethod = PaymentMethod
  │
  ├─ Confirm booking
  │  ├─ React Query: useRequestRide() mutation triggered
  │  │  ├─ Validates via @vroom/validation requestRideSchema
  │  │  └─ Calls: client.rideApi.requestRide(RequestRideReq)
  │  │
  │  ├─ Mock backend:
  │  │  ├─ Creates Trip in store
  │  │  ├─ Registers with ticker (starts state machine)
  │  │  └─ Returns Trip with status='requested'
  │  │
  │  ├─ Cache updated:
  │  │  ├─ queryCache['trips', tripId] = Trip
  │  │  └─ queryCache['orders'] invalidated & refetched
  │  │
  │  └─ Components subscribed to useTrip(tripId) re-render
  │
  └─ Navigation to LiveTracking(tripId)
     ├─ useTrip(tripId) establishes polling interval (3s)
     ├─ Every 3s: getTrip called → ticker advances status
     ├─ 5s: status changes to 'driver_assigned' → UI updates
     └─ Eventually: status='completed' → ticker stops polling
```

---

## Loading, Error, Empty States

### Pattern: Skeleton Loaders (not spinners)

```ts
function LiveTracking({ tripId }) {
  const { data: trip, isLoading, error } = api.useTrip(tripId);

  if (isLoading) {
    return (
      <div>
        <SkeletonCard height="80px" />
        <SkeletonCard height="120px" />
      </div>
    );
  }

  if (error) {
    if (error.kind === 'not_found') {
      return <EmptyState title="Trip not found" />;
    }
    return <ErrorView error={error} onRetry={() => ...} />;
  }

  return <TripDetail trip={trip} />;
}
```

### Pattern: Optimistic Updates with Rollback

```ts
function CancelTripButton({ tripId }) {
  const queryClient = useQueryClient();
  const { mutate: cancelTrip } = api.useCancelTrip();

  const handleCancel = () => {
    // Save previous state
    const previousTrip = queryClient.getQueryData(['trips', tripId]);

    // Optimistic: update cache immediately
    queryClient.setQueryData(['trips', tripId], {
      ...previousTrip,
      status: { kind: 'cancelled', cancelledBy: 'rider', reason: 'User requested' },
    });

    // Send mutation
    cancelTrip(
      { tripId, reason: 'User requested' },
      {
        onError: () => {
          // Rollback on error
          queryClient.setQueryData(['trips', tripId], previousTrip);
        },
      },
    );
  };

  return <button onClick={handleCancel}>Cancel Trip</button>;
}
```

---

## Common State Patterns

### Form State (Zustand)

```ts
// stores/useRideBookingStore.ts
import { create } from 'zustand';

export const useRideBookingStore = create((set) => ({
  destination: null,
  vehicleClass: 'economy',
  selectedPaymentMethod: null,

  setDestination: (location) => set({ destination: location }),
  setVehicleClass: (vc) => set({ vehicleClass: vc }),
  setPaymentMethod: (pm) => set({ selectedPaymentMethod: pm }),
  reset: () => set({
    destination: null,
    vehicleClass: 'economy',
    selectedPaymentMethod: null,
  }),
}));
```

### Polling Configuration

React Query's `useTrip` hook auto-configures polling for live data:

```ts
api.useTrip(tripId)
  // staleTime: 0 (always refetch)
  // refetchInterval: 3000 (every 3s)
  // refetchOnWindowFocus: true (refetch when tab focused)
  // Stops refetching when trip reaches terminal state
```

### Cache Invalidation After Mutation

```ts
const { mutate } = api.useRequestRide();

mutate(
  { quoteId, paymentMethodId },
  {
    onSuccess: () => {
      // React Query automatically invalidates:
      // - ['orders'] (list orders refreshes)
      // - ['rides', 'quotes', ...] (quotes may expire)
    },
  },
);
```

---

## Further Reading

- [api-contracts.md](api-contracts.md) — Full API endpoint and hook reference
- [navigation.md](navigation.md) — How state flows integrate with navigation
- React Query: https://tanstack.com/query/latest/docs/react/overview
- Zustand: https://github.com/pmndrs/zustand
