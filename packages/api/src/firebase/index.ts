/**
 * Firebase backend adapter for @vroom/api.
 *
 * Imported via the `"./firebase"` subpath export — NOT re-exported from the
 * package root (`src/index.ts`) so that mock/http consumers do not pull the
 * Firebase SDK into their bundles.
 *
 * Usage:
 * ```ts
 * import { createFirebaseApiClient } from '@vroom/api/firebase';
 * import { loadFirebaseConfig } from '@vroom/config';
 *
 * const fbConfig = loadFirebaseConfig(import.meta.env)!;
 * const api = createFirebaseApiClient(fbConfig, {
 *   getPhoneVerifier: () =>
 *     new RecaptchaVerifier(getAuth(), 'recaptcha-container', { size: 'invisible' }),
 * });
 * ```
 *
 * See /home/user/go-uz/docs/backend-firebase.md for full setup instructions.
 */
import type { ApplicationVerifier } from 'firebase/auth';
import type { FirebaseConfig } from '@vroom/config';
import type { ApiClient } from '../client.js';
import { getFirebaseApp, getDb, getAuthInstance } from './firebaseApp.js';
import { createAuthClient } from './authClient.js';
import { createUserClient } from './userClient.js';
import { createRideClient } from './rideClient.js';
import { createDeliveryClient } from './deliveryClient.js';
import { createOrdersClient } from './ordersClient.js';
import { createPaymentsClient } from './paymentsClient.js';
import { createPromosClient } from './promosClient.js';
import { createSupportClient } from './supportClient.js';
import { createNotificationsClient } from './notificationsClient.js';
import { createGeoClient } from './geoClient.js';

// ---------------------------------------------------------------------------
// FirebaseClientOptions
// ---------------------------------------------------------------------------

/**
 * Optional configuration for the Firebase ApiClient.
 *
 * ### `getPhoneVerifier`
 * A factory that returns an `ApplicationVerifier` (typically `RecaptchaVerifier`
 * on web). Called once per `requestOtp` invocation.
 *
 * **Web setup:**
 * ```ts
 * import { RecaptchaVerifier, getAuth } from 'firebase/auth';
 *
 * const auth = getAuth();
 * const options: FirebaseClientOptions = {
 *   getPhoneVerifier: () =>
 *     new RecaptchaVerifier(auth, 'recaptcha-container', {
 *       size: 'invisible',
 *       callback: () => { /* reCAPTCHA solved *\/ },
 *     }),
 * };
 * ```
 *
 * **React Native setup:**
 * Use `expo-firebase-recaptcha` or a custom `ApplicationVerifier` adapter.
 * The interface is identical; only the constructor differs.
 *
 * If `getPhoneVerifier` is omitted, `requestOtp` returns a `validation` ApiError
 * with a clear explanation — no crash, no thrown exception.
 */
export interface FirebaseClientOptions {
  /**
   * Factory that returns an `ApplicationVerifier` (e.g. `RecaptchaVerifier`).
   * The factory is called once per `requestOtp` call so the verifier can be
   * re-created if needed (e.g. after a reCAPTCHA challenge expires).
   */
  readonly getPhoneVerifier?: () => ApplicationVerifier;
}

// ---------------------------------------------------------------------------
// createFirebaseApiClient
// ---------------------------------------------------------------------------

/**
 * Creates an `ApiClient` backed by Firebase Auth + Firestore.
 *
 * Calling this multiple times with the same `config.projectId` is safe —
 * the underlying Firebase app is a singleton keyed by `projectId`.
 *
 * @param config  Firebase web app configuration (from `loadFirebaseConfig` in @vroom/config).
 * @param opts    Optional platform hooks (phone verifier, etc.).
 * @returns       A fully typed `ApiClient` — drop-in replacement for `createApiClient`.
 */
export function createFirebaseApiClient(
  config: FirebaseConfig,
  opts?: FirebaseClientOptions,
): ApiClient {
  const app = getFirebaseApp(config);
  const db = getDb(app);
  const auth = getAuthInstance(app);

  return {
    auth: createAuthClient(auth, opts?.getPhoneVerifier),
    user: createUserClient(auth, db),
    ride: createRideClient(auth, db),
    delivery: createDeliveryClient(auth, db),
    orders: createOrdersClient(auth, db),
    payments: createPaymentsClient(auth, db),
    promos: createPromosClient(db),
    support: createSupportClient(auth, db),
    notifications: createNotificationsClient(auth, db),
    geo: createGeoClient(db),
  };
}

// ---------------------------------------------------------------------------
// Re-export types that callers need to import from this subpath
// ---------------------------------------------------------------------------

export type { FirebaseConfig } from '@vroom/config';
export type { ApplicationVerifier } from 'firebase/auth';

// Firebase app/auth/db accessors — apps need these to build a phone verifier
// (e.g. `new RecaptchaVerifier(getAuthInstance(getFirebaseApp(config)), ...)`)
// bound to the SAME app instance the adapter uses, and to connect emulators.
export { getFirebaseApp, getDb, getAuthInstance } from './firebaseApp.js';
