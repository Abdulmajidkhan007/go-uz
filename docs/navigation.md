# Navigation

Mobile (React Navigation) and web (React Router) navigation architecture, including screen/route hierarchies, deep-linking, and shared feature names.

---

## Overview

Both mobile and web apps mirror the same logical feature structure:
- **Auth flow:** Phone entry, OTP verification, profile setup
- **App tabs:** Home (with ride/delivery), Activity, Tracking, Payments, Profile
- **Nested flows:** Ride booking wizard, delivery creation, payment methods, support tickets

The difference is in the platform's navigation API:
- **Mobile:** React Navigation with stack, tab, and modal navigators
- **Web:** React Router with nested routes and URL-based state

Both support **deep-linking** at the system level:
- **Mobile:** Custom URI scheme `vroom://`
- **Web:** Query parameters and route fragments

---

## Mobile Navigation (React Navigation)

### Root Navigator Structure

```
RootNavigator
├── AuthNavigator (if not authenticated)
│   ├── Welcome
│   ├── PhoneEntry
│   ├── OtpVerify
│   └── ProfileSetup
│
├── OnboardingNavigator (if first launch, not authenticated)
│   ├── Permissions (location, contacts, camera)
│   └── ServiceIntro (ride vs. delivery explanation)
│
└── AppTabs (if authenticated)
    ├── HomeTab (stack)
    │   ├── Home
    │   ├── RideBooking (modal stack)
    │   │   ├── SetDestination
    │   │   ├── ChooseVehicle
    │   │   ├── ConfirmRide
    │   │   └── Searching
    │   └── Delivery (modal stack)
    │       ├── ParcelDetails
    │       ├── PickupDropoff
    │       └── ConfirmDelivery
    │
    ├── ActivityTab (stack)
    │   ├── History
    │   └── OrderDetail (with tripId or deliveryId)
    │
    ├── TrackingTab (stack)
    │   └── LiveTracking (with orderId param)
    │
    ├── PaymentsTab (stack)
    │   ├── Methods
    │   ├── AddCard
    │   ├── Wallet
    │   └── Promos
    │
    └── ProfileTab (stack)
        ├── Profile
        ├── Addresses
        ├── Settings
        └── Support (modal stack)
            ├── Tickets
            ├── TicketThread (with ticketId)
            ├── NewTicket
            └── FAQ
```

### Route Names & Parameters

```ts
// HomeTab
export const HOME_SCREENS = {
  HOME: 'home',
  RIDE_BOOKING: 'ride-booking',
  DELIVERY: 'delivery',
} as const;

// RideBooking sub-screens
export const RIDE_BOOKING_SCREENS = {
  SET_DESTINATION: 'ride-booking.set-destination',
  CHOOSE_VEHICLE: 'ride-booking.choose-vehicle',
  CONFIRM_RIDE: 'ride-booking.confirm-ride',
  SEARCHING: 'ride-booking.searching',
} as const;

// ActivityTab
export const ACTIVITY_SCREENS = {
  HISTORY: 'activity.history',
  ORDER_DETAIL: 'activity.order-detail',  // params: { orderId }
} as const;

// TrackingTab
export const TRACKING_SCREENS = {
  LIVE_TRACKING: 'tracking.live-tracking',  // params: { orderId }
} as const;

// PaymentsTab
export const PAYMENTS_SCREENS = {
  METHODS: 'payments.methods',
  ADD_CARD: 'payments.add-card',
  WALLET: 'payments.wallet',
  PROMOS: 'payments.promos',
} as const;

// ProfileTab
export const PROFILE_SCREENS = {
  PROFILE: 'profile.profile',
  ADDRESSES: 'profile.addresses',
  SETTINGS: 'profile.settings',
  SUPPORT_TICKETS: 'profile.support.tickets',
  SUPPORT_TICKET_THREAD: 'profile.support.thread',  // params: { ticketId }
  SUPPORT_NEW_TICKET: 'profile.support.new',
  SUPPORT_FAQ: 'profile.support.faq',
} as const;

// Auth
export const AUTH_SCREENS = {
  WELCOME: 'auth.welcome',
  PHONE_ENTRY: 'auth.phone-entry',
  OTP_VERIFY: 'auth.otp-verify',
  PROFILE_SETUP: 'auth.profile-setup',
} as const;
```

### Deep-Linking on Mobile

**Scheme:** `vroom://`

**Standard paths:**

```
vroom://trip/:tripId              → Navigate to tracking for trip
vroom://delivery/:deliveryId      → Navigate to tracking for delivery
vroom://order/:orderId            → Navigate to order detail
vroom://payment/:paymentId        → Navigate to payment detail
vroom://promo/:promoCode          → Show promo details
vroom://support/ticket/:ticketId  → Navigate to support ticket thread
vroom://profile                   → Navigate to profile tab
vroom://wallet                    → Navigate to wallet
```

**Implementation:**

```ts
// navigation/linking.ts
import { DEEP_LINK_SCHEME } from '@vroom/constants';

export const linking = {
  prefixes: [`${DEEP_LINK_SCHEME}://`, 'https://vroom.app/'],
  config: {
    screens: {
      'activity.order-detail': 'order/:orderId',
      'tracking.live-tracking': 'trip/:tripId',  // Also matches delivery
      'profile.support.thread': 'support/ticket/:ticketId',
      'payments.wallet': 'wallet',
      'profile.profile': 'profile',
    },
  },
};
```

**Usage:**

```ts
// React Navigation accepts these URIs
navigation.navigate('ActivityTab', {
  screen: 'activity.order-detail',
  params: { orderId },
});

// Or from Linking.openURL (system notifications, etc.)
Linking.openURL(`vroom://order/${orderId}`);
```

---

## Web Navigation (React Router)

### Route Structure

All routes are under `/app`:

```
/auth
├── /auth/phone
├── /auth/otp
└── /auth/setup

/app
├── /app/welcome (onboarding)
├── /app/home
├── /app/ride
│   ├── /app/ride/destination
│   ├── /app/ride/vehicle
│   ├── /app/ride/confirm
│   └── /app/ride/searching
├── /app/delivery
│   ├── /app/delivery/parcel
│   ├── /app/delivery/route
│   └── /app/delivery/confirm
├── /app/track/:orderId
├── /app/activity
├── /app/activity/:orderId
├── /app/payments
│   ├── /app/payments/methods
│   ├── /app/payments/wallet
│   ├── /app/payments/promos
│   └── /app/payments/add-card
├── /app/profile
│   ├── /app/profile/addresses
│   ├── /app/profile/settings
│   └── /app/profile
├── /app/support
│   ├── /app/support/tickets
│   ├── /app/support/:ticketId
│   ├── /app/support/new
│   └── /app/support/faq
```

### Route Definitions

```ts
// src/routes.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { WEB_BASE_PATH } from '@vroom/constants';

const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'phone', element: <PhoneEntry /> },
      { path: 'otp', element: <OtpVerify /> },
      { path: 'setup', element: <ProfileSetup /> },
      { index: true, element: <Navigate to="phone" /> },
    ],
  },
  {
    path: WEB_BASE_PATH, // '/app'
    element: <AppLayout />,
    children: [
      { path: 'welcome', element: <Welcome /> },
      { path: 'home', element: <Home /> },
      {
        path: 'ride',
        children: [
          { path: 'destination', element: <SetDestination /> },
          { path: 'vehicle', element: <ChooseVehicle /> },
          { path: 'confirm', element: <ConfirmRide /> },
          { path: 'searching', element: <Searching /> },
        ],
      },
      {
        path: 'delivery',
        children: [
          { path: 'parcel', element: <ParcelDetails /> },
          { path: 'route', element: <PickupDropoff /> },
          { path: 'confirm', element: <ConfirmDelivery /> },
        ],
      },
      { path: 'track/:orderId', element: <LiveTracking /> },
      { path: 'activity', element: <Activity /> },
      { path: 'activity/:orderId', element: <OrderDetail /> },
      {
        path: 'payments',
        children: [
          { path: 'methods', element: <PaymentMethods /> },
          { path: 'wallet', element: <Wallet /> },
          { path: 'promos', element: <Promos /> },
          { path: 'add-card', element: <AddCard /> },
        ],
      },
      {
        path: 'profile',
        children: [
          { index: true, element: <Profile /> },
          { path: 'addresses', element: <Addresses /> },
          { path: 'settings', element: <Settings /> },
        ],
      },
      {
        path: 'support',
        children: [
          { path: 'tickets', element: <TicketList /> },
          { path: ':ticketId', element: <TicketThread /> },
          { path: 'new', element: <NewTicket /> },
          { path: 'faq', element: <FAQ /> },
        ],
      },
      { index: true, element: <Navigate to="home" /> },
    ],
  },
  { path: '/', element: <Navigate to={`${WEB_BASE_PATH}/home`} /> },
]);

export default router;
```

### Navigation Helpers

```ts
// src/utils/navigation.ts
import { useNavigate } from 'react-router-dom';
import { WEB_BASE_PATH } from '@vroom/constants';

export function useAppNavigation() {
  const navigate = useNavigate();

  return {
    toHome: () => navigate(`${WEB_BASE_PATH}/home`),
    toRideBooking: () => navigate(`${WEB_BASE_PATH}/ride/destination`),
    toDelivery: () => navigate(`${WEB_BASE_PATH}/delivery/parcel`),
    toOrderDetail: (orderId: string) => navigate(`${WEB_BASE_PATH}/activity/${orderId}`),
    toLiveTracking: (orderId: string) => navigate(`${WEB_BASE_PATH}/track/${orderId}`),
    toPaymentMethods: () => navigate(`${WEB_BASE_PATH}/payments/methods`),
    toProfile: () => navigate(`${WEB_BASE_PATH}/profile`),
    toTickets: () => navigate(`${WEB_BASE_PATH}/support/tickets`),
    toTicketThread: (ticketId: string) => navigate(`${WEB_BASE_PATH}/support/${ticketId}`),
  };
}
```

### Deep-Linking on Web

**Scheme:** Standard HTTPS URL or `vroom://` protocol handler

**Standard paths (under /app):**

```
/app/track/:orderId              → Live tracking screen
/app/activity/:orderId           → Order detail
/app/support/:ticketId           → Support ticket thread
/app/payments/wallet             → Wallet
/app/profile                      → Profile
```

**Query parameters for state (optional):**

```
/app/ride/destination?lat=40.7128&lng=-74.0060    → Auto-populate map
/app/delivery/parcel?size=medium                   → Pre-fill parcel size
```

**Handling deep-links:**

```ts
// src/hooks/useDeepLink.ts
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useDeepLink() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleNavigation = (e: Event) => {
      // Handle vroom:// protocol URIs that the browser can't navigate to natively
      // In practice, use a custom protocol handler or redirect via /open?uri=...
    };

    window.addEventListener('deeplink', handleNavigation);
    return () => window.removeEventListener('deeplink', handleNavigation);
  }, [navigate]);
}
```

---

## Shared Navigation Constants

Both mobile and web import from `@vroom/constants`:

```ts
// packages/constants/src/navigation.ts
export const DEEP_LINK_SCHEME = 'vroom' as const;
export const WEB_BASE_PATH = '/app' as const;

export const DEEP_LINK_PATHS = {
  TRIP: 'trip',
  DELIVERY: 'delivery',
  ORDER: 'order',
  PAYMENT: 'payment',
  PROMO: 'promo',
  SUPPORT_TICKET: 'support/ticket',
  PROFILE: 'profile',
  WALLET: 'wallet',
} as const;
```

**Usage:**

```ts
// Mobile
import { DEEP_LINK_SCHEME, DEEP_LINK_PATHS } from '@vroom/constants';
const uri = `${DEEP_LINK_SCHEME}://${DEEP_LINK_PATHS.ORDER}/${orderId}`;

// Web
import { WEB_BASE_PATH, DEEP_LINK_PATHS } from '@vroom/constants';
const url = `${WEB_BASE_PATH}/activity/${orderId}`;
```

---

## Conditional Rendering Based on Navigation State

### Mobile (React Navigation)

```ts
import { useRoute } from '@react-navigation/native';

function MyComponent() {
  const route = useRoute();

  if (route.name === 'ride-booking.searching') {
    return <SearchingState />;
  }
  return <DefaultState />;
}
```

### Web (React Router)

```ts
import { useLocation } from 'react-router-dom';

function MyComponent() {
  const location = useLocation();

  if (location.pathname.includes('/ride/searching')) {
    return <SearchingState />;
  }
  return <DefaultState />;
}
```

---

## State Persistence & History

### Mobile

React Navigation maintains a **navigation state stack**. When the user navigates back, the previous screen's state is restored (unless explicitly reset).

**Clearing history (after logout):**

```ts
navigation.reset({
  index: 0,
  routes: [{ name: 'AuthNavigator' }],
});
```

### Web

React Router manages history via the browser back/forward buttons. Use `navigate(-1)` to go back, or `replace()` to avoid adding to history.

```ts
const navigate = useNavigate();

// Go back
navigate(-1);

// Replace history entry (don't create back button target)
navigate('/somewhere', { replace: true });
```

---

## Auth Flow

Both mobile and web follow the same auth sequence:

```
Welcome
  ↓
PhoneEntry
  ↓
OtpVerify (mock: any 6-digit OTP, demo code is 000000)
  ↓
ProfileSetup (name, email, avatar)
  ↓
Home (AppTabs / /app/home)
```

After successful OTP verification, the app:
1. Creates a session (token stored in secure storage on mobile, cookies on web)
2. Stores userId in Zustand auth store
3. Navigates to onboarding (Permissions/ServiceIntro) if first launch
4. Otherwise navigates to AppTabs / /app/home

On logout:
- Clear session from storage
- Reset navigation to AuthNavigator / /auth
- Clear React Query cache

---

## Booking Wizards (Multi-Step)

Both ride and delivery use **step-based navigation** within their respective flows.

### Mobile (Modal Stack)

```ts
// RideBooking modal with internal step state
function useRideBookingStepper() {
  const [step, setStep] = useState<'destination' | 'vehicle' | 'confirm' | 'searching'>('destination');

  const navigate = useNavigation();

  const goNext = () => {
    const nextStep = {
      'destination': 'vehicle',
      'vehicle': 'confirm',
      'confirm': 'searching',
      'searching': 'destination', // Back to home
    }[step];

    if (nextStep === 'destination') {
      navigate.goBack(); // Exit modal
    } else {
      setStep(nextStep);
    }
  };

  return { step, goNext, goBack: () => navigate.goBack() };
}
```

### Web (URL-based)

```ts
// Step is determined by the URL path
function RideBooking() {
  const location = useLocation();
  const navigate = useNavigate();

  const step = location.pathname.split('/').pop(); // 'destination', 'vehicle', etc.

  const goNext = () => {
    const nextStep = {
      'destination': 'vehicle',
      'vehicle': 'confirm',
      'confirm': 'searching',
      'searching': 'home',
    }[step];

    navigate(`${WEB_BASE_PATH}/${nextStep === 'home' ? 'home' : `ride/${nextStep}`}`);
  };

  return <RideBookingStep step={step} onNext={goNext} />;
}
```

**Shared logic:**

Use `@vroom/ui` hook `useStepper` to manage step state independently of navigation:

```ts
import { useStepper } from '@vroom/ui';

function RideBooking() {
  const { step, goNext, goBack, canGoBack } = useStepper({
    steps: ['destination', 'vehicle', 'confirm', 'searching'],
    initialStep: 0,
  });

  return (
    <RideBookingStep
      step={steps[step]}
      onNext={goNext}
      onBack={canGoBack ? goBack : undefined}
    />
  );
}
```

---

## Bottom Sheet / Modal Patterns

### Mobile (React Navigation Modal)

Modals are presented as a separate stack that slides up:

```ts
// RootNavigator has modal stack
<NavigationContainer>
  <RootNavigator.Navigator>
    <RootNavigator.Group>
      {/* Regular stack */}
      <RootNavigator.Screen name="AppTabs" component={AppTabs} />
    </RootNavigator.Group>
    <RootNavigator.Group screenOptions={{ presentation: 'modal' }}>
      <RootNavigator.Screen name="RideBooking" component={RideBooking} />
    </RootNavigator.Group>
  </RootNavigator.Navigator>
</NavigationContainer>
```

### Web (Dialog / Drawer)

Use a combination of routing and local state:

```ts
function AppLayout() {
  const location = useLocation();
  const isRideBookingOpen = location.pathname.includes('/ride');

  return (
    <>
      <AppContent />
      {isRideBookingOpen && <RideBookingModal />}
    </>
  );
}
```

Or use headless hooks from `@vroom/ui`:

```ts
import { useDisclosure } from '@vroom/ui';

function Home() {
  const rideBooking = useDisclosure();

  return (
    <>
      <button onClick={rideBooking.open}>Book a ride</button>
      {rideBooking.isOpen && <RideBookingModal onClose={rideBooking.close} />}
    </>
  );
}
```

---

## Further Reading

- [api-contracts.md](api-contracts.md) — API endpoints used during navigation flows
- [state-flows.md](state-flows.md) — How navigation state maps to server state
- React Navigation: https://reactnavigation.org/docs/getting-started
- React Router: https://reactrouter.com/docs
