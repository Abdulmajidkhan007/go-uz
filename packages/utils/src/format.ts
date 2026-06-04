/**
 * String formatting utilities.
 * All functions are pure and have no side effects.
 */

// ---------------------------------------------------------------------------
// Phone masking
// ---------------------------------------------------------------------------

/**
 * Masks the middle digits of an E.164 phone number for display.
 *
 * The first 4 and last 2 digits are preserved; everything in between is
 * replaced with asterisks. Works for both local and international formats.
 *
 * @example
 * maskPhone('+998901234567') // '+998 ** *** 67'
 * maskPhone('998901234567')  // '9989 ** *** 67'
 */
export function maskPhone(phone: string): string {
  // Strip non-digit characters for counting, then apply mask on original
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 7) return phone; // too short to meaningfully mask

  const prefix = phone.slice(0, 4);
  const suffix = phone.slice(-2);
  const masked = ' ** *** ';
  return `${prefix}${masked}${suffix}`;
}

// ---------------------------------------------------------------------------
// Text truncation
// ---------------------------------------------------------------------------

/**
 * Truncates a string to `maxLength` characters, appending an ellipsis when
 * truncation occurs. Returns the original string if it fits.
 *
 * @param text      - The source string.
 * @param maxLength - Maximum number of characters (including the ellipsis).
 * @param ellipsis  - The suffix to append; defaults to "…" (U+2026).
 */
export function truncate(
  text: string,
  maxLength: number,
  ellipsis: string = '…',
): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - ellipsis.length) + ellipsis;
}

// ---------------------------------------------------------------------------
// Initials
// ---------------------------------------------------------------------------

/**
 * Derives up to two initials from a display name.
 * Splits on whitespace and takes the first character of up to two parts.
 *
 * @example
 * initials('Ali Karimov') // 'AK'
 * initials('Dilnoza')     // 'D'
 * initials('')            // ''
 */
export function initials(displayName: string): string {
  return displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

// ---------------------------------------------------------------------------
// Misc
// ---------------------------------------------------------------------------

/**
 * Capitalises the first letter of a string and lower-cases the rest.
 */
export function capitalize(text: string): string {
  if (text.length === 0) return text;
  return text[0]!.toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Converts a snake_case or kebab-case string to Title Case.
 *
 * @example
 * toTitleCase('driver_assigned') // 'Driver Assigned'
 * toTitleCase('in-progress')     // 'In Progress'
 */
export function toTitleCase(text: string): string {
  return text
    .replace(/[_-]/g, ' ')
    .split(' ')
    .map(capitalize)
    .join(' ');
}
