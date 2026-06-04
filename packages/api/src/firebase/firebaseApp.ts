/**
 * Firebase app singleton.
 *
 * Uses getApps()/getApp() to guard against double-initialisation in hot-reload
 * environments (Vite HMR, Next.js dev). Keyed by projectId so multiple
 * Firebase projects can coexist (e.g. staging + prod) in the same runtime.
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import type { FirebaseConfig } from '@vroom/config';

// ---------------------------------------------------------------------------
// Internal app registry — keyed by projectId
// ---------------------------------------------------------------------------

const _appRegistry = new Map<string, FirebaseApp>();

// ---------------------------------------------------------------------------
// getFirebaseApp
// ---------------------------------------------------------------------------

/**
 * Returns (or initialises) the Firebase app for the given config.
 * Safe to call multiple times — subsequent calls return the cached app.
 */
export function getFirebaseApp(config: FirebaseConfig): FirebaseApp {
  const cached = _appRegistry.get(config.projectId);
  if (cached !== undefined) return cached;

  // Check if Firebase already initialised this project under any name.
  const existingApps = getApps();
  const existing = existingApps.find((a) => a.options.projectId === config.projectId);
  if (existing !== undefined) {
    _appRegistry.set(config.projectId, existing);
    return existing;
  }

  // Build the Firebase config object, omitting undefined optional keys so
  // exactOptionalPropertyTypes is satisfied.
  const fbConfig = {
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    appId: config.appId,
    ...(config.storageBucket !== undefined ? { storageBucket: config.storageBucket } : {}),
    ...(config.messagingSenderId !== undefined
      ? { messagingSenderId: config.messagingSenderId }
      : {}),
  };

  const app = initializeApp(fbConfig, config.projectId);
  _appRegistry.set(config.projectId, app);
  return app;
}

// ---------------------------------------------------------------------------
// Convenience accessors
// ---------------------------------------------------------------------------

/** Returns the Firestore instance for the given app. */
export function getDb(app: FirebaseApp): Firestore {
  return getFirestore(app);
}

/** Returns the Auth instance for the given app. */
export function getAuthInstance(app: FirebaseApp): Auth {
  return getAuth(app);
}

// ---------------------------------------------------------------------------
// Re-export for consumers who already hold an app reference
// ---------------------------------------------------------------------------

export { getApp };
