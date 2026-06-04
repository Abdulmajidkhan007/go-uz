/**
 * @file index.ts — presentation layer
 * Pure formatters that bridge domain models to display strings.
 *
 * Rules
 * -----
 * - No React; no platform imports. These are plain functions.
 * - Reuse @vroom/utils for money, geo, and date formatting — do not duplicate.
 * - All functions are pure and deterministic given the same inputs.
 * - Locale is always an explicit parameter (BCP-47 tag) so server and client
 *   can produce identical output without relying on browser/device locale.
 *
 * These are consumed by hooks (e.g. to derive display strings from domain data)
 * and by server-side renderers alike.
 */

import type { FareQuote, Driver, Address } from '@vroom/types';
import { formatMoney } from '@vroom/utils';

// ---------------------------------------------------------------------------
// Fare / quote
// ---------------------------------------------------------------------------

/**
 * Formats a `FareQuote` estimate for display on a ride/delivery selection card.
 *
 * Shows the formatted price. When the surge multiplier is above 1.0 a surge
 * indicator suffix is appended so riders are never surprised.
 *
 * @param quote  - The fare quote to format.
 * @param locale - BCP-47 locale tag, e.g. "en-US", "uz-UZ".
 * @returns A display string such as "12 500 UZS" or "12 500 UZS ⚡ 1.5×".
 *
 * @example
 * formatFareLine(quote, 'uz-UZ') // '12 500 UZS'
 * formatFareLine(surgingQuote, 'uz-UZ') // '18 750 UZS  1.5x'
 */
export function formatFareLine(quote: FareQuote, locale: string): string {
  const price = formatMoney(quote.estimate, locale);
  if (quote.surgeMultiplier > 1) {
    return `${price}  ${quote.surgeMultiplier.toFixed(1)}x`;
  }
  return price;
}

// ---------------------------------------------------------------------------
// ETA
// ---------------------------------------------------------------------------

/**
 * Formats a duration in seconds to a human-readable ETA string.
 *
 * - < 60 s   → "Less than a minute"
 * - < 3600 s → "N min" (rounded to nearest minute)
 * - >= 3600 s → "Nh Nm" (hours and minutes)
 *
 * @param seconds - Duration in seconds (e.g. from `FareQuote.durationSeconds`
 *                  or a live ETA feed).
 * @returns A display string suitable for showing next to a driver pin or route
 *          summary.
 *
 * @example
 * formatEta(45)   // 'Less than a minute'
 * formatEta(320)  // '5 min'
 * formatEta(3900) // '1h 5min'
 */
export function formatEta(seconds: number): string {
  if (seconds < 60) return 'Less than a minute';

  const totalMinutes = Math.round(seconds / 60);
  if (totalMinutes < 60) return `${totalMinutes} min`;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}min`;
}

// ---------------------------------------------------------------------------
// Driver
// ---------------------------------------------------------------------------

/**
 * Produces a compact one-line summary of a driver for display in a ride card
 * or push notification body.
 *
 * Format: "{displayName} · ★{rating} · {phoneMasked}"
 *
 * @param driver - The `Driver` domain object.
 * @returns A display string, e.g. "Ali K. · ★4.9 · +998 ** *** 67".
 *
 * @example
 * driverSummary(driver) // 'Ali K. · ★4.9 · +998 ** *** 67'
 */
export function driverSummary(driver: Driver): string {
  const rating = driver.rating.toFixed(1);
  return `${driver.displayName} · ★${rating} · ${driver.phoneMasked}`;
}

// ---------------------------------------------------------------------------
// Address
// ---------------------------------------------------------------------------

/**
 * Produces a shortened address string for map pins and list rows where space
 * is constrained.
 *
 * When the address has a `notes` field (e.g. apartment number), it is appended
 * after a comma. The result is always ≤ ~60 characters; longer formatted
 * strings are truncated with an ellipsis.
 *
 * @param address - The `Address` domain object.
 * @returns A compact display string, e.g. "Amir Temur ko'chasi, 15" or
 *          "Chilonzor, 9-kvartal, kv. 42".
 *
 * @example
 * addressShort(homeAddress)  // 'Yunusobod 19-daha'
 * addressShort(workAddress)  // 'Amir Temur ko\'chasi, 10, of. 305'
 */
export function addressShort(address: Address): string {
  const MAX = 60;
  const base = address.formatted;
  const full = address.notes ? `${base}, ${address.notes}` : base;

  if (full.length <= MAX) return full;

  // Truncate to MAX chars with ellipsis
  return `${full.slice(0, MAX - 1)}…`;
}
