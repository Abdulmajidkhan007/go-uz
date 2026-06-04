/**
 * ID generation helpers.
 *
 * Uses `crypto.randomUUID()` which is available in:
 *   - Node 14.17+
 *   - All modern browsers (Chromium 92+, Firefox 95+, Safari 15.4+)
 *   - React Native via the Hermes engine (Expo SDK 47+) — Hermes ships its
 *     own polyfill via `expo-crypto` but the global is present in RN 0.70+.
 *
 * Falls back to a `Math.random`-based generator only when the native
 * implementation is absent. Flag this for the mobile agent if additional
 * polyfilling is needed on older RN targets.
 */

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback: RFC-4122 v4 UUID using Math.random
  // NOT cryptographically secure — use only when crypto is unavailable.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generates a unique prefixed ID string.
 *
 * The returned string is structurally branded as a plain `string` so it can
 * be cast to any of the branded ID types (UserId, TripId, etc.) at the
 * boundary where the ID is first created (typically a mock factory or API
 * response mapper). The prefix aids debugging and log readability.
 *
 * @param prefix - A short domain prefix, e.g. "usr", "trp", "ord".
 * @returns A string like "usr_550e8400-e29b-41d4-a716-446655440000".
 *
 * @example
 * ```ts
 * const userId = createId('usr') as UserId;
 * const tripId = createId('trp') as TripId;
 * ```
 */
export function createId(prefix: string): string {
  return `${prefix}_${generateUUID()}`;
}
