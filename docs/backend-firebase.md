# Firebase Backend Setup — Vroom Super-App

This guide walks through connecting the Vroom apps to a real Firebase backend
using the `@vroom/api/firebase` adapter.

---

## 1. Create a Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com).
2. Click **Add project**, name it (e.g. `vroom-production`).
3. Disable Google Analytics (optional) and click **Create project**.

---

## 2. Enable Phone Authentication

1. In the Firebase console, open **Authentication > Sign-in method**.
2. Enable **Phone** and click **Save**.
3. For local development with the emulator, no phone number allowlist is needed.
   For production, add test numbers in the **Phone numbers for testing** section.

---

## 3. Enable Cloud Firestore

1. Go to **Firestore Database > Create database**.
2. Choose **Start in production mode** (security rules will be deployed next).
3. Select a region close to Uzbekistan — `europe-west1` (Belgium) or
   `asia-south1` (Mumbai) are reasonable choices.

---

## 4. Register the Web App and Copy Config

1. In **Project settings > General**, scroll to **Your apps**.
2. Click **Add app > Web**, give it a nickname (e.g. `vroom-web`).
3. Copy the `firebaseConfig` object shown — it looks like:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "vroom-production.firebaseapp.com",
  projectId: "vroom-production",
  storageBucket: "vroom-production.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

---

## 5. Set Environment Variables

Copy the values into your app's `.env` file. The package `@vroom/config`
reads `VROOM_FIREBASE_*` variables and maps them to `FirebaseConfig`.

### Vite (web app — `apps/web/.env.local`)

```env
VITE_VROOM_FIREBASE_API_KEY=AIzaSy...
VITE_VROOM_FIREBASE_AUTH_DOMAIN=vroom-production.firebaseapp.com
VITE_VROOM_FIREBASE_PROJECT_ID=vroom-production
VITE_VROOM_FIREBASE_STORAGE_BUCKET=vroom-production.appspot.com
VITE_VROOM_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_VROOM_FIREBASE_APP_ID=1:123456789:web:abcdef
```

Then in your app entry-point, pass `import.meta.env` with the VITE_ prefix
stripped (or map keys explicitly):

```ts
loadFirebaseConfig({
  VROOM_FIREBASE_API_KEY: import.meta.env.VITE_VROOM_FIREBASE_API_KEY,
  VROOM_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_VROOM_FIREBASE_AUTH_DOMAIN,
  VROOM_FIREBASE_PROJECT_ID: import.meta.env.VITE_VROOM_FIREBASE_PROJECT_ID,
  VROOM_FIREBASE_APP_ID: import.meta.env.VITE_VROOM_FIREBASE_APP_ID,
  VROOM_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_VROOM_FIREBASE_STORAGE_BUCKET,
  VROOM_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_VROOM_FIREBASE_MESSAGING_SENDER_ID,
})
```

### Expo (mobile app — `apps/mobile/.env`)

```env
EXPO_PUBLIC_VROOM_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_VROOM_FIREBASE_AUTH_DOMAIN=vroom-production.firebaseapp.com
EXPO_PUBLIC_VROOM_FIREBASE_PROJECT_ID=vroom-production
EXPO_PUBLIC_VROOM_FIREBASE_STORAGE_BUCKET=vroom-production.appspot.com
EXPO_PUBLIC_VROOM_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_VROOM_FIREBASE_APP_ID=1:123456789:web:abcdef
```

---

## 6. Deploy Firestore Security Rules

```bash
# From repo root
firebase use vroom-production
firebase deploy --only firestore:rules
```

The rules file is at `/home/user/go-uz/firebase/firestore.rules`. Key policies:

- Users can only read/write their own profile, addresses, and payment methods.
- Trips and deliveries are readable and cancellable only by the creating user.
- Orders are readable by owner; state transitions are Cloud Function territory.
- Promos are read-only for all authenticated clients.
- Tickets are owner-scoped; clients may append messages.
- Notifications: clients may only set `readAt`; no create/delete.

---

## 7. Deploy the Status-Progression Cloud Functions (Optional but Recommended)

The functions in `firebase/functions/src/progressOrders.ts` advance trip,
delivery, and payment statuses server-side, mirroring the mock ticker.

```bash
cd firebase/functions
npm install
npm run build
cd ../..
firebase deploy --only functions
```

Without these functions, trip/delivery statuses stay at their initial state
after creation. The React Query hooks poll via `getDoc`, so once the Cloud
Function updates the document, the next poll will see the new status.

---

## 8. App Wiring — ALREADY DONE (env-only activation)

Both apps are **pre-wired** to auto-select the Firebase backend when the
Firebase env vars are present, and fall back to mock/http otherwise. You do
**not** need to edit any code — just set the env vars from step 5.

- **Web** (`apps/web/src/app/providers/api.tsx`): when `VITE_VROOM_FIREBASE_*`
  are set, it builds the Firebase `ApiClient` and wires phone OTP through an
  invisible `RecaptchaVerifier` (the `#recaptcha-container` div already lives in
  `apps/web/index.html`). `firebase` is already in the web app's dependencies.
- **Mobile** (`apps/mobile/src/app/bootstrap.ts`): when
  `EXPO_PUBLIC_VROOM_FIREBASE_*` are set, it builds the Firebase `ApiClient`.
  `firebase` is already a dependency and Metro package-exports are enabled.

For reference, the web selection logic looks like this:

```ts
const fbConfig = loadFirebaseConfig({
  VROOM_FIREBASE_API_KEY: import.meta.env.VITE_VROOM_FIREBASE_API_KEY,
  // ... other vars
});

const api = fbConfig
  ? createFirebaseApiClient(fbConfig, {
      getPhoneVerifier: () =>
        new RecaptchaVerifier(getAuthInstance(getFirebaseApp(fbConfig)), 'recaptcha-container', {
          size: 'invisible',
        }),
    })
  : createApiClient({ mode: 'mock' });
```

### Mobile phone-auth caveat

Firebase phone-auth on React Native needs an `ApplicationVerifier`, which the
JS SDK does not provide natively. `expo-firebase-recaptcha` is unmaintained and
incompatible with React 19 (Expo SDK 53), so it is intentionally **not** wired.
Until you add a verifier (a dev build with a custom reCAPTCHA modal, or migrate
auth to `@react-native-firebase`), mobile `requestOtp` returns a graceful
validation error — Firestore **data reads still work**. For end-to-end auth
testing today, use the **web app**.

---

## 9. Dependencies — ALREADY DONE

`firebase` is already added to both `apps/web` and `apps/mobile`. A fresh
`pnpm install` after cloning pulls everything. (`firebase` remains an optional
peer dependency of `@vroom/api`, so mock-only consumers like `apps/admin` do
not bundle it.)

---

## 10. Local Emulator (Recommended for Development)

```bash
firebase emulators:start --only auth,firestore,functions
```

Point the SDK at the emulator by calling `connectAuthEmulator` and
`connectFirestoreEmulator` before any other Firebase calls:

```ts
import { connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';
import { getFirebaseApp, getAuthInstance, getDb } from '@vroom/api/firebase';

if (import.meta.env.DEV) {
  const app = getFirebaseApp(fbConfig);
  connectAuthEmulator(getAuthInstance(app), 'http://localhost:9099');
  connectFirestoreEmulator(getDb(app), 'localhost', 8080);
}
```

---

## Architecture Notes

### Phone Auth Verifier Wiring

The `getPhoneVerifier` option is a factory (not a singleton) so the verifier
can be re-created if a reCAPTCHA challenge expires between calls. It is called
once per `requestOtp` invocation.

If `getPhoneVerifier` is not provided, `requestOtp` returns a typed
`validation` `ApiError` with a clear setup message — no crash, no console
error.

### Status Machine

Trip and delivery status progression (`matching -> driver_assigned -> ...`) is
driven entirely by the Cloud Functions in `firebase/functions/`. The client
only reads documents. The React Query hooks (`useTrip`, `useDelivery`) poll
via `getDoc` at the configured stale time (default: 10 s for active trips).

### Geo / Places

The `geo.autocomplete` and `geo.reverseGeocode` methods return a deterministic
stub list in this adapter (Tashkent-area places). In production, proxy Google
Places API calls through a Cloud Function to keep the API key server-side.
Replace only `createGeoClient` in `packages/api/src/firebase/geoClient.ts` —
no consumer changes required.

### Swapping Back

To revert to the mock (or HTTP) client, change the factory call in the app's
API provider. No hooks, stores, or UI components change — they depend only on
the `ApiClient` interface.
