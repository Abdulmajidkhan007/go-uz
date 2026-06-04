import { z } from 'zod';

// ---------------------------------------------------------------------------
// API mode
// ---------------------------------------------------------------------------

/**
 * Controls whether the shared API client uses real HTTP calls or the built-in
 * mock layer. Defaults to 'mock' so that local dev works without a backend.
 */
export const API_MODES = ['mock', 'http'] as const;

export type ApiMode = (typeof API_MODES)[number];

// ---------------------------------------------------------------------------
// Environment variable schema
// ---------------------------------------------------------------------------

/**
 * Zod schema for the shared environment variables consumed by this package.
 *
 * Apps inject these via their own env mechanism:
 *   - Expo: EXPO_PUBLIC_VROOM_API_MODE
 *   - Vite: import.meta.env.VROOM_API_MODE
 *
 * The `rawEnv` passed to `loadConfig` should already have the appropriate
 * prefix stripped so the keys here are bare (VROOM_API_MODE, etc.).
 */
export const envSchema = z.object({
  /**
   * Whether to use the built-in mock layer ('mock') or real HTTP ('http').
   * Defaults to 'mock' when the variable is absent or empty.
   */
  VROOM_API_MODE: z
    .enum(API_MODES)
    .default('mock'),

  /**
   * Base URL for the Vroom backend, e.g. "https://api.vroom.uz".
   * Required when VROOM_API_MODE is 'http'; ignored in mock mode.
   */
  VROOM_API_BASE_URL: z
    .string()
    .trim()
    .url('VROOM_API_BASE_URL must be a valid URL')
    .optional(),
});

export type EnvInput = z.infer<typeof envSchema>;

// ---------------------------------------------------------------------------
// Firebase environment schema (optional backend)
// ---------------------------------------------------------------------------

/**
 * Standard Firebase web-config fields, supplied via env when using the
 * Firebase backend (`@vroom/api/firebase`). All optional at the schema level;
 * `loadFirebaseConfig` returns null unless the required fields are present.
 */
export const firebaseEnvSchema = z.object({
  VROOM_FIREBASE_API_KEY: z.string().trim().min(1).optional(),
  VROOM_FIREBASE_AUTH_DOMAIN: z.string().trim().min(1).optional(),
  VROOM_FIREBASE_PROJECT_ID: z.string().trim().min(1).optional(),
  VROOM_FIREBASE_APP_ID: z.string().trim().min(1).optional(),
  VROOM_FIREBASE_STORAGE_BUCKET: z.string().trim().min(1).optional(),
  VROOM_FIREBASE_MESSAGING_SENDER_ID: z.string().trim().min(1).optional(),
});

export type FirebaseEnvInput = z.infer<typeof firebaseEnvSchema>;
