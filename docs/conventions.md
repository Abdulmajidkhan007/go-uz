# Conventions

Naming, file organization, feature-folder structure, loading/error/empty patterns, and other codebase standards.

---

## File Organization

### Packages

Each shared package follows this structure:

```
packages/my-package/
├── src/
│   ├── index.ts              # Barrel export — only file apps should import from
│   ├── domain/               # Domain types & logic
│   │   ├── user.ts          # Type definitions
│   │   └── ...
│   ├── utils/                # Helper functions
│   │   ├── formatter.ts
│   │   └── ...
│   └── ...
├── package.json
├── tsconfig.json
└── README.md (optional)
```

**Key rule:** All exports flow through `src/index.ts`. Internal files are never imported directly.

**Example (wrong):**
```ts
import { User } from '@vroom/types/src/user.js';  // ❌ Never do this
```

**Example (correct):**
```ts
import type { User } from '@vroom/types';  // ✓ OK
```

---

### Apps (Mobile & Web)

Feature-based folder structure:

```
apps/mobile/
├── src/
│   ├── app/                  # Expo Router file-based routing
│   │   ├── _layout.tsx       # Root navigator layout
│   │   ├── (auth)/
│   │   │   ├── _layout.tsx
│   │   │   ├── phone.tsx
│   │   │   ├── otp.tsx
│   │   │   └── setup.tsx
│   │   ├── (app)/
│   │   │   ├── _layout.tsx   # Bottom tabs layout
│   │   │   ├── index.tsx     # Home tab, default route
│   │   │   ├── ride/
│   │   │   │   ├── destination.tsx
│   │   │   │   ├── vehicle.tsx
│   │   │   │   ├── confirm.tsx
│   │   │   │   └── searching.tsx
│   │   │   ├── activity/
│   │   │   ├── payments/
│   │   │   └── profile/
│   │   └── ...
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx    # Reusable primitives
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── ...
│   │   └── features/
│   │       ├── ride-booking/
│   │       │   ├── RideQuoteCard.tsx
│   │       │   ├── DestinationInput.tsx
│   │       │   └── VehicleSelector.tsx
│   │       ├── delivery/
│   │       ├── payments/
│   │       └── ...
│   ├── hooks/
│   │   ├── useAuth.ts        # Custom hooks wrapping @vroom/ui + Zustand
│   │   ├── useRideBooking.ts
│   │   └── ...
│   ├── stores/               # Zustand stores
│   │   ├── useAuthStore.ts
│   │   ├── useRideBookingStore.ts
│   │   └── ...
│   ├── api.ts               # createApiClient + createApiHooks instance
│   ├── main.tsx             # Entry point
│   └── ...
├── app.json                 # Expo config
├── package.json
└── tsconfig.json

apps/web/
├── src/
│   ├── routes/              # React Router route definitions
│   │   ├── AuthRoutes.tsx
│   │   ├── AppRoutes.tsx
│   │   └── index.tsx
│   ├── pages/               # Page-level components (one per route)
│   │   ├── AuthLayout.tsx
│   │   ├── Home.tsx
│   │   ├── RideBooking/
│   │   │   ├── SetDestination.tsx
│   │   │   ├── ChooseVehicle.tsx
│   │   │   └── ...
│   │   ├── Activity.tsx
│   │   └── ...
│   ├── components/
│   │   ├── common/          # Reusable UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── ...
│   │   └── features/        # Feature-scoped components
│   │       ├── RideQuoteCard.tsx
│   │       ├── LiveMap.tsx
│   │       └── ...
│   ├── hooks/               # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useRideBooking.ts
│   │   └── ...
│   ├── stores/              # Zustand stores
│   │   ├── useAuthStore.ts
│   │   ├── useRideBookingStore.ts
│   │   └── ...
│   ├── api.ts              # API instance
│   ├── main.tsx            # Entry point
│   ├── index.html          # HTML template
│   └── ...
├── vite.config.ts
├── tailwind.config.ts
├── package.json
└── tsconfig.json
```

---

## Naming Conventions

### Files & Folders

- **Folders:** `kebab-case`
  ```
  src/components/ride-booking/
  src/hooks/useRideBooking.ts
  ```

- **Components:** `PascalCase`
  ```tsx
  function RideQuoteCard() { ... }
  export default RideQuoteCard;
  ```

- **Hooks:** `camelCase` with `use` prefix
  ```ts
  function useRideBooking() { ... }
  export { useRideBooking };
  ```

- **Utilities & helpers:** `camelCase`
  ```ts
  function formatMoney(amount: Money): string { ... }
  function haversineDistance(a: GeoPoint, b: GeoPoint): number { ... }
  ```

- **Stores:** `camelCase` with `use` prefix (PascalCase for exported store class)
  ```ts
  import { create } from 'zustand';
  export const useAuthStore = create((set) => ({ ... }));
  ```

- **Constants:** `UPPER_SNAKE_CASE`
  ```ts
  export const DEFAULT_CURRENCY = 'USD';
  export const API_TIMEOUT_MS = 10000;
  ```

---

### Types & Interfaces

- **Domain types:** `PascalCase`
  ```ts
  interface User { ... }
  type TripStatus = { kind: 'requested' } | { kind: 'matching' } | ...;
  ```

- **Input types (from validation):** `PascalCase` + `Input` suffix
  ```ts
  interface PhoneInput { ... }
  interface RequestRideInput { ... }
  ```

- **Request/Response contracts:** `PascalCase` + `Req`/`Res` suffix
  ```ts
  interface RequestRideReq { ... }
  interface RequestRideRes { ... }
  ```

- **Generic utility types:** `PascalCase`
  ```ts
  type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
  type Brand<T, S> = T & { readonly __brand: S };
  ```

---

## Component Size Guidelines

Keep components small and focused:

- **< 150 lines:** Standard component
- **150–300 lines:** Consider splitting into sub-components
- **> 300 lines:** Must be broken down

**Example: Too large, should split**

```tsx
// ❌ RideBooking.tsx (400+ lines)
function RideBooking() {
  // ... destination logic
  // ... vehicle selection logic
  // ... payment method selection logic
  // ... confirmation logic
  // ... searching state
}
```

**Better: Split into smaller components**

```tsx
// ✓ RideBooking.tsx (80 lines)
function RideBooking() {
  const { step } = useStepper(...);
  
  switch (step) {
    case 'destination': return <SetDestination />;
    case 'vehicle': return <ChooseVehicle />;
    case 'confirm': return <ConfirmRide />;
    case 'searching': return <Searching />;
  }
}

// ✓ components/ride-booking/SetDestination.tsx (150 lines)
function SetDestination() { ... }

// ✓ components/ride-booking/ChooseVehicle.tsx (120 lines)
function ChooseVehicle() { ... }
```

---

## Loading, Error, Empty States

### Three distinct states, not mixed

```tsx
function OrderList() {
  const { data, isLoading, error } = api.useOrders();

  // 1. Loading: Skeleton (not spinner)
  if (isLoading) {
    return (
      <div>
        <SkeletonCard height="80px" />
        <SkeletonCard height="80px" />
        <SkeletonCard height="80px" />
      </div>
    );
  }

  // 2. Error: ErrorView with action
  if (error) {
    if (error.kind === 'unauthorized') {
      return <Redirect to="/auth/phone" />;
    }
    return (
      <ErrorView
        title="Failed to load orders"
        message={error.message}
        action={{ label: 'Retry', onPress: () => refetch() }}
      />
    );
  }

  // 3. Empty: EmptyState (distinct from error)
  if (!data || data.orders.length === 0) {
    return (
      <EmptyState
        icon={<PackageIcon />}
        title="No orders yet"
        subtitle="Book a ride or delivery to get started"
        action={{ label: 'Book now', href: '/app/home' }}
      />
    );
  }

  // 4. Success: Render data
  return (
    <div>
      {data.orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
```

**Key points:**
- **Skeleton loaders** for loading (better UX than spinners)
- **ErrorView** with distinct styling for errors
- **EmptyState** for successful but empty data
- **Never mix states** (e.g., don't show spinner + partial content)

---

## Error Handling Pattern

Always discriminate on error kind:

```tsx
const { error } = api.useTrip(tripId);

if (error) {
  switch (error.kind) {
    case 'unauthorized':
      // Redirect to login
      return <Redirect to="/auth" />;

    case 'not_found':
      // Trip doesn't exist
      return <EmptyState title="Trip not found" />;

    case 'network':
      // No internet
      return (
        <ErrorView
          title="Connection lost"
          action={{ label: 'Retry', onPress: () => refetch() }}
        />
      );

    case 'timeout':
      // Request took too long
      return (
        <ErrorView
          title="Request timed out"
          action={{ label: 'Try again', onPress: () => refetch() }}
        />
      );

    case 'validation':
      // Input validation failed
      return (
        <ErrorView
          title="Invalid request"
          details={error.details}  // Field-level errors
        />
      );

    case 'conflict':
      // Business logic conflict (e.g., trip already cancelled)
      return <ErrorView title={error.message} />;

    case 'server':
      // 5xx error
      return <ErrorView title="Server error" />;

    case 'unknown':
      // Catch-all
      return <ErrorView title="Something went wrong" />;
  }
}
```

---

## Form Handling Pattern

Use React Hook Form + Zod:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { phoneSchema } from '@vroom/validation';

function PhoneEntry() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  });

  const { mutate: requestOtp, isLoading } = api.useRequestOtp();

  const onSubmit = (data) => {
    requestOtp(data, {
      onSuccess: () => navigate('/auth/otp'),
      onError: (error) => {
        if (error.kind === 'validation') {
          // Display field errors
          setFieldError('phone', error.details?.phone?.[0]);
        }
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextInput
        placeholder="+1..."
        {...register('phone')}
        error={errors.phone?.message}
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Send OTP'}
      </Button>
    </form>
  );
}
```

---

## State Management Pattern

**View state (Zustand):** Local, temporary UI state

```ts
// stores/useRideBookingStore.ts
export const useRideBookingStore = create((set) => ({
  destination: null,
  vehicleClass: 'economy',
  
  setDestination: (location) => set({ destination: location }),
  setVehicleClass: (vc) => set({ vehicleClass: vc }),
  reset: () => set({ destination: null, vehicleClass: 'economy' }),
}));

// Usage in component
function RideBooking() {
  const { destination, setDestination } = useRideBookingStore();
  return <MapInput value={destination} onChange={setDestination} />;
}
```

**Server state (React Query):** API data, shared cache

```ts
// Usage in component
function LiveTracking({ tripId }) {
  const { data: trip } = api.useTrip(tripId);  // Automatically cached, polled
  return <TripStatus trip={trip} />;
}
```

**Never mix:**
```tsx
// ❌ WRONG: Writing server state to Zustand
const { destination } = useRideBookingStore();
const { mutate: requestRide } = api.useRequestRide();

const book = () => {
  const trip = await requestRide({ destination });
  useRideBookingStore.setState({ bookingResult: trip });  // Don't do this
};

// ✓ CORRECT: Let React Query manage server state
const { data: trip } = api.useRequestRide();
```

---

## Import & Export Style

### Barrel Exports

Each package exports from a single `src/index.ts`:

```ts
// packages/types/src/index.ts
export type { User } from './user.js';
export type { Trip, TripStatus } from './trip.js';
export type { Order } from './order.js';
// ... etc
```

**Import style:**
```ts
// ✓ Correct
import type { User, Trip } from '@vroom/types';

// ❌ Wrong
import type { User } from '@vroom/types/src/user.js';
```

### Platform-Agnostic Imports

Packages never import React Native or React DOM:

```ts
// ✓ Correct: Pure TS, libraries
import { z } from 'zod';
import { create } from 'zustand';
import type { User } from '@vroom/types';

// ❌ Wrong: Platform-specific
import { View } from 'react-native';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';  // (OK in app code, not packages)
```

---

## Git Commit Style

Use conventional commits:

```
feat: add ride booking wizard
fix: correct trip status progression timing
docs: update architecture guide
refactor: simplify payment validation
test: add tests for haversine distance
ci: fix ESLint config
chore: bump @vroom/api version
```

**Example full message:**
```
feat(ride-booking): add destination search autocomplete

- Integrate useAutocomplete hook from @vroom/api
- Add debounced input handler
- Show place suggestions in dropdown
- Closes #123
```

---

## Code Quality Standards

### TypeScript Strictness

All code must pass:

```bash
pnpm typecheck
```

Never use:
```ts
any
unknown (without narrowing)
@ts-ignore
!  (non-null assertion, except when absolutely necessary)
```

**Example: Correct narrowing**

```ts
// ✓ Good: Discriminated union
switch (trip.status.kind) {
  case 'driver_assigned':
    console.log(trip.status.driver);  // Safe, driver exists
    break;
}

// ❌ Bad: Non-null assertion
console.log(trip.status.driver!);  // Unsafe if status.kind !== 'driver_assigned'
```

### Linting

All code must pass:

```bash
pnpm lint
```

Use ESLint + Prettier for consistency. No eslint-disable-next-line without clear justification.

### Testing

(Optional for now, but structure tests as:)

```
packages/my-package/
├── src/
│   └── ...
└── __tests__/
    ├── unit/
    │   └── helper.test.ts
    └── integration/
        └── api.test.ts
```

---

## Documentation Standards

### README in Each Package

Every package should have a brief README explaining:

```markdown
# @vroom/my-package

Brief description.

## Exports

- `MyType` — Type definition
- `myFunction()` — What it does
- `MyConstant` — Value

## Usage

```ts
import { MyType, myFunction } from '@vroom/my-package';
```

## Notes

Any special considerations (e.g., no React imports, performance tips).
```

### JSDoc for Public APIs

```ts
/**
 * Calculate the straight-line distance between two geo points using the
 * Haversine formula.
 *
 * @param a First coordinate
 * @param b Second coordinate
 * @returns Distance in meters
 *
 * @example
 * ```ts
 * const distance = haversineDistance(
 *   { lat: 40.7128, lng: -74.0060 },
 *   { lat: 40.7489, lng: -73.9680 }
 * );
 * // ~10,000 meters
 * ```
 */
export function haversineDistance(a: GeoPoint, b: GeoPoint): number {
  // ...
}
```

---

## Performance Considerations

### Component Memoization

Memoize expensive components:

```tsx
import { memo } from 'react';

const DriverCard = memo(function DriverCard({ driver }) {
  return (
    <div>
      <img src={driver.avatar} />
      <p>{driver.name} ({driver.rating})</p>
    </div>
  );
});
```

### React Query Optimization

Leverage caching:

```ts
// ✓ Good: Uses cache, minimal refetches
const { data: user } = api.useMe();  // staleTime: 5 min

// ❌ Bad: Refetches on every render
const { data: user } = api.useMe({ staleTime: 0 });
```

### Large Lists

Use virtualization:

```tsx
import { FlatList } from 'react-native';  // Mobile
// or
import { FixedSizeList } from 'react-window';  // Web

function OrderList() {
  const { data } = api.useOrders();

  return (
    <FlatList
      data={data.orders}
      keyExtractor={(order) => order.id}
      renderItem={({ item }) => <OrderCard order={item} />}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
    />
  );
}
```

---

## Further Reading

- [architecture.md](architecture.md) — Dependency structure
- [api-contracts.md](api-contracts.md) — API usage patterns
- [state-flows.md](state-flows.md) — Data flow examples
- Prettier: https://prettier.io
- ESLint: https://eslint.org
- React Hook Form: https://react-hook-form.com
- Zod: https://zod.dev
