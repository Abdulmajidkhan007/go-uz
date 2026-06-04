import { envSchema } from './env.js';
import type { ApiMode } from './env.js';

// ---------------------------------------------------------------------------
// AppConfig shape
// ---------------------------------------------------------------------------

export interface AppConfig {
  /** Controls whether the API client uses real HTTP or the mock layer. */
  readonly apiMode: ApiMode;
  /**
   * Base URL for the Vroom backend.
   * Always present when apiMode is 'http'; undefined in mock mode.
   */
  readonly apiBaseUrl?: string;
}

// ---------------------------------------------------------------------------
// loadConfig
// ---------------------------------------------------------------------------

/**
 * Parse and validate raw environment variables into a typed `AppConfig`.
 *
 * Pass the platform's env object directly — do not read `process.env` here
 * so this function stays platform-agnostic:
 *
 * ```ts
 * // Expo (app/_layout.tsx or app.config.ts)
 * loadConfig({
 *   VROOM_API_MODE: process.env.EXPO_PUBLIC_VROOM_API_MODE,
 *   VROOM_API_BASE_URL: process.env.EXPO_PUBLIC_VROOM_API_BASE_URL,
 * });
 *
 * // Vite (src/main.ts)
 * loadConfig({
 *   VROOM_API_MODE: import.meta.env.VROOM_API_MODE,
 *   VROOM_API_BASE_URL: import.meta.env.VROOM_API_BASE_URL,
 * });
 * ```
 *
 * @throws {Error} When a variable is present but fails validation (e.g. bad URL).
 */
export function loadConfig(rawEnv: Record<string, string | undefined>): AppConfig {
  const result = envSchema.safeParse(rawEnv);

  if (!result.success) {
    const messages = result.error.issues
      .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`[vroom/config] Invalid environment configuration:\n${messages}`);
  }

  const { VROOM_API_MODE, VROOM_API_BASE_URL } = result.data;

  if (VROOM_API_MODE === 'http' && VROOM_API_BASE_URL === undefined) {
    throw new Error(
      '[vroom/config] VROOM_API_BASE_URL is required when VROOM_API_MODE is "http".',
    );
  }

  // Build result without setting optional property to `undefined` explicitly,
  // which is required by exactOptionalPropertyTypes.
  const config: AppConfig = VROOM_API_BASE_URL !== undefined
    ? { apiMode: VROOM_API_MODE, apiBaseUrl: VROOM_API_BASE_URL }
    : { apiMode: VROOM_API_MODE };

  return config;
}

// ---------------------------------------------------------------------------
// defaultConfig — safe fallback for tests and Storybook
// ---------------------------------------------------------------------------

/**
 * A ready-to-use config that targets the mock layer.
 * Import this in unit tests or Storybook instead of calling `loadConfig`.
 */
export const defaultConfig: AppConfig = {
  apiMode: 'mock',
} as const;
