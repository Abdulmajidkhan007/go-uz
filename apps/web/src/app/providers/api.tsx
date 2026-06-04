/**
 * API provider — builds the typed client + React Query hooks from env config
 * once, and exposes the hooks through context.
 *
 * Backend selection (env-only, no code changes needed):
 *   - If the VITE_VROOM_FIREBASE_* vars are present → real Firebase backend.
 *   - Otherwise → the VROOM_API_MODE client (mock by default, or http).
 */
import React, { createContext, useContext } from 'react';
import { createApiClient, createApiHooks } from '@vroom/api';
import type { ApiClient, ApiHooks } from '@vroom/api';
import { createFirebaseApiClient, getFirebaseApp, getAuthInstance } from '@vroom/api/firebase';
import { RecaptchaVerifier } from 'firebase/auth';
import { loadConfig, loadFirebaseConfig } from '@vroom/config';

const firebaseConfig = loadFirebaseConfig({
  VROOM_FIREBASE_API_KEY: import.meta.env.VITE_VROOM_FIREBASE_API_KEY,
  VROOM_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_VROOM_FIREBASE_AUTH_DOMAIN,
  VROOM_FIREBASE_PROJECT_ID: import.meta.env.VITE_VROOM_FIREBASE_PROJECT_ID,
  VROOM_FIREBASE_APP_ID: import.meta.env.VITE_VROOM_FIREBASE_APP_ID,
  VROOM_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_VROOM_FIREBASE_STORAGE_BUCKET,
  VROOM_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_VROOM_FIREBASE_MESSAGING_SENDER_ID,
});

function buildClient(): ApiClient {
  if (firebaseConfig) {
    const app = getFirebaseApp(firebaseConfig);
    return createFirebaseApiClient(firebaseConfig, {
      getPhoneVerifier: () =>
        new RecaptchaVerifier(getAuthInstance(app), 'recaptcha-container', {
          size: 'invisible',
        }),
    });
  }

  const appConfig = loadConfig({
    VROOM_API_MODE: import.meta.env.VITE_VROOM_API_MODE ?? 'mock',
    VROOM_API_BASE_URL: import.meta.env.VITE_VROOM_API_BASE_URL,
  });

  return createApiClient({
    mode: appConfig.apiMode,
    ...(appConfig.apiBaseUrl !== undefined ? { baseUrl: appConfig.apiBaseUrl } : {}),
  });
}

export const apiClient: ApiClient = buildClient();

const apiHooks: ApiHooks = createApiHooks(apiClient);

const ApiContext = createContext<ApiHooks | null>(null);

export function ApiProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <ApiContext.Provider value={apiHooks}>{children}</ApiContext.Provider>;
}

export function useApi(): ApiHooks {
  const ctx = useContext(ApiContext);
  if (ctx === null) throw new Error('useApi must be used within ApiProvider');
  return ctx;
}
