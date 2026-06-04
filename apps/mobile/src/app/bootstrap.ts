/**
 * Bootstrap — wires up the API client from environment config.
 * Called once at app startup before rendering.
 *
 * Backend selection (env-only):
 *   - If EXPO_PUBLIC_VROOM_FIREBASE_* vars are present → real Firebase backend.
 *   - Otherwise → the EXPO_PUBLIC_VROOM_API_MODE client (mock by default).
 *
 * NOTE: Firebase phone-auth on React Native needs an ApplicationVerifier
 * (e.g. a dev build with a reCAPTCHA modal or @react-native-firebase). Until
 * one is wired, requestOtp returns a graceful validation error — data reads
 * still work. See docs/backend-firebase.md. For end-to-end auth testing today,
 * use the web app.
 */
import { loadConfig, loadFirebaseConfig } from '@vroom/config';
import { createApiClient, createApiHooks } from '@vroom/api';
import type { ApiClient, ApiHooks } from '@vroom/api';
import { createFirebaseApiClient } from '@vroom/api/firebase';

const firebaseConfig = loadFirebaseConfig({
  VROOM_FIREBASE_API_KEY: process.env['EXPO_PUBLIC_VROOM_FIREBASE_API_KEY'],
  VROOM_FIREBASE_AUTH_DOMAIN: process.env['EXPO_PUBLIC_VROOM_FIREBASE_AUTH_DOMAIN'],
  VROOM_FIREBASE_PROJECT_ID: process.env['EXPO_PUBLIC_VROOM_FIREBASE_PROJECT_ID'],
  VROOM_FIREBASE_APP_ID: process.env['EXPO_PUBLIC_VROOM_FIREBASE_APP_ID'],
  VROOM_FIREBASE_STORAGE_BUCKET: process.env['EXPO_PUBLIC_VROOM_FIREBASE_STORAGE_BUCKET'],
  VROOM_FIREBASE_MESSAGING_SENDER_ID: process.env['EXPO_PUBLIC_VROOM_FIREBASE_MESSAGING_SENDER_ID'],
});

function buildClient(): ApiClient {
  if (firebaseConfig) {
    return createFirebaseApiClient(firebaseConfig);
  }

  const appConfig = loadConfig({
    VROOM_API_MODE: process.env['EXPO_PUBLIC_VROOM_API_MODE'] ?? 'mock',
    VROOM_API_BASE_URL: process.env['EXPO_PUBLIC_VROOM_API_BASE_URL'],
  });

  return createApiClient({
    mode: appConfig.apiMode,
    ...(appConfig.apiBaseUrl !== undefined ? { baseUrl: appConfig.apiBaseUrl } : {}),
  });
}

export const apiClient: ApiClient = buildClient();

export const apiHooks: ApiHooks = createApiHooks(apiClient);
