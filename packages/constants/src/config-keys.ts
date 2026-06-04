// ---------------------------------------------------------------------------
// Environment / runtime config key names
// ---------------------------------------------------------------------------

/**
 * Well-known configuration key names used to look up runtime values.
 * Centralising these prevents typos and enables IDE auto-complete.
 */
export const CONFIG_KEYS = {
  API_BASE_URL: 'VROOM_API_BASE_URL',
  API_TIMEOUT_MS: 'VROOM_API_TIMEOUT_MS',
  MAPS_API_KEY: 'VROOM_MAPS_API_KEY',
  SENTRY_DSN: 'VROOM_SENTRY_DSN',
  APP_ENV: 'VROOM_APP_ENV',
  WEBSOCKET_URL: 'VROOM_WEBSOCKET_URL',
  FEATURE_FLAGS_URL: 'VROOM_FEATURE_FLAGS_URL',
} as const;

export type ConfigKey = (typeof CONFIG_KEYS)[keyof typeof CONFIG_KEYS];
