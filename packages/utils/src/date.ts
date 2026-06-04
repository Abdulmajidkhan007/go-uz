import type { IsoDateTime } from '@vroom/types';

// ---------------------------------------------------------------------------
// Date / time helpers — deterministic wrappers around Date
// ---------------------------------------------------------------------------

/**
 * Returns the current UTC instant as an IsoDateTime brand.
 * Inject in tests by mocking `Date.now` rather than this function directly.
 */
export function nowIso(): IsoDateTime {
  return new Date().toISOString() as IsoDateTime;
}

/**
 * Parses an IsoDateTime to a plain `Date` object.
 */
export function parseIso(iso: IsoDateTime): Date {
  return new Date(iso);
}

/**
 * Returns `true` when the given IsoDateTime is in the past relative to now.
 */
export function isExpired(iso: IsoDateTime): boolean {
  return Date.now() > new Date(iso).getTime();
}

/**
 * Returns the number of milliseconds remaining until the given instant.
 * Returns 0 if the instant is already in the past.
 */
export function msUntil(iso: IsoDateTime): number {
  return Math.max(0, new Date(iso).getTime() - Date.now());
}

/**
 * Formats an IsoDateTime as a locale-aware relative string ("3 min ago",
 * "in 2 hours") using `Intl.RelativeTimeFormat`.
 *
 * Available in all ES2020+ environments including Hermes on React Native.
 *
 * @param iso    - The reference timestamp.
 * @param locale - BCP-47 locale tag, e.g. "en-US".
 * @param now    - Override "now" for testing; defaults to `Date.now()`.
 */
export function formatRelative(
  iso: IsoDateTime,
  locale: string,
  now: number = Date.now(),
): string {
  const diffMs = new Date(iso).getTime() - now;
  const absDiffMs = Math.abs(diffMs);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (absDiffMs < 60_000) {
    return rtf.format(Math.round(diffMs / 1_000), 'second');
  }
  if (absDiffMs < 3_600_000) {
    return rtf.format(Math.round(diffMs / 60_000), 'minute');
  }
  if (absDiffMs < 86_400_000) {
    return rtf.format(Math.round(diffMs / 3_600_000), 'hour');
  }
  return rtf.format(Math.round(diffMs / 86_400_000), 'day');
}

/**
 * Formats an IsoDateTime as a short date string ("DD MMM YYYY") for receipts
 * and history lists.
 *
 * @param iso    - The timestamp to format.
 * @param locale - BCP-47 locale tag.
 */
export function formatShortDate(iso: IsoDateTime, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

/**
 * Formats an IsoDateTime as a short time string ("HH:MM") for timelines.
 *
 * @param iso    - The timestamp to format.
 * @param locale - BCP-47 locale tag.
 */
export function formatTime(iso: IsoDateTime, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));
}
