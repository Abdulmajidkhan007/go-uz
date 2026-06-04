/**
 * @file logo.ts
 * Inline SVG string exports for the Vroom brand mark and wordmark.
 *
 * Design notes
 * ------------
 * The logomark is an original geometric device: a bold forward-motion arc
 * composed of two concentric quarter-circles that form a stylised route chevron.
 * The open tail suggests speed and direction; the closed head implies arrival.
 * Colours reference the Vroom primary indigo (#5a35f0) and accent amber (#ffb300).
 *
 * These are raw SVG strings — no JSX, no React, no DOM references. Consumers
 * convert them to the appropriate format per platform:
 *   Web:    dangerouslySetInnerHTML, <img src="data:image/svg+xml,..."> , or
 *           inlined by a bundler SVG loader.
 *   Mobile: react-native-svg's SvgXml / SvgUri, or expo-svg.
 *
 * The strings are valid standalone SVG documents (self-contained viewBox,
 * no external references) so they also work as static file exports.
 *
 * Brand colours (for reference — import from @vroom/theme for live tokens):
 *   Primary indigo 500 : #5a35f0
 *   Primary indigo 400 : #7c5dfa
 *   Accent amber 400   : #ffb300
 *   Neutral 0 (white)  : #ffffff
 */

// ---------------------------------------------------------------------------
// Logomark — geometric motion arc device (32 × 32)
//
// Construction:
//   Outer arc:  quarter-circle, radius 14, stroke 4px, indigo-500
//   Inner arc:  quarter-circle, radius  8, stroke 4px, amber-400
//   Both arcs pivot on the same bottom-right origin, sweeping from 6 o'clock
//   up and to the right — evoking a route being plotted forward.
//   A small filled indigo circle caps the arc tip as a destination pin.
// ---------------------------------------------------------------------------
export const logoMarkSvg: string = `<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 32 32"
  width="32"
  height="32"
  role="img"
  aria-label="Vroom logomark"
  fill="none"
>
  <!-- Outer route arc: indigo primary -->
  <path
    d="M 24 28 A 14 14 0 0 0 10 14"
    stroke="#5a35f0"
    stroke-width="4"
    stroke-linecap="round"
  />
  <!-- Inner route arc: accent amber -->
  <path
    d="M 24 28 A 8 8 0 0 0 16 20"
    stroke="#ffb300"
    stroke-width="4"
    stroke-linecap="round"
  />
  <!-- Destination pin cap: indigo -->
  <circle cx="10" cy="14" r="3" fill="#5a35f0" />
  <!-- Speed dot: amber -->
  <circle cx="16" cy="20" r="2" fill="#ffb300" />
</svg>`;

// ---------------------------------------------------------------------------
// Wordmark — logotype "Vroom" with the logomark device inline (160 × 40)
//
// Uses system-safe geometric sans-serif (letter-spacing tightened for premium
// feel). The leading "V" is replaced by the motion arc to create a monogram.
// ---------------------------------------------------------------------------
export const logoWordmarkSvg: string = `<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 160 40"
  width="160"
  height="40"
  role="img"
  aria-label="Vroom"
  fill="none"
>
  <!-- Compact logomark device (24 × 24, vertically centred) -->
  <g transform="translate(0, 8) scale(0.75)">
    <path
      d="M 24 28 A 14 14 0 0 0 10 14"
      stroke="#5a35f0"
      stroke-width="4"
      stroke-linecap="round"
    />
    <path
      d="M 24 28 A 8 8 0 0 0 16 20"
      stroke="#ffb300"
      stroke-width="4"
      stroke-linecap="round"
    />
    <circle cx="10" cy="14" r="3" fill="#5a35f0" />
    <circle cx="16" cy="20" r="2" fill="#ffb300" />
  </g>
  <!-- Wordmark text — using SVG text with system font fallback -->
  <text
    x="30"
    y="27"
    font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif"
    font-size="22"
    font-weight="700"
    letter-spacing="-0.5"
    fill="#22222e"
  >room</text>
  <!-- Stylised "V" as the motion arc monogram above the text baseline -->
  <text
    x="30"
    y="27"
    font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif"
    font-size="22"
    font-weight="700"
    letter-spacing="-0.5"
    fill="#5a35f0"
  >V</text>
  <text
    x="44"
    y="27"
    font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif"
    font-size="22"
    font-weight="700"
    letter-spacing="-0.5"
    fill="#22222e"
  >room</text>
</svg>`;

/**
 * Brand colour reference — quick lookup without importing @vroom/theme.
 * For full token access (scales, semantic roles) use @vroom/theme instead.
 */
export const brandColors = {
  /** Primary brand indigo — main CTA fill */
  primary: '#5a35f0',
  /** Primary indigo, lighter — dark-mode CTA */
  primaryLight: '#7c5dfa',
  /** Accent amber — highlights and secondary CTAs */
  accent: '#ffb300',
  /** Near-black — wordmark text on light backgrounds */
  ink: '#22222e',
  /** White — wordmark / icon on dark or brand fills */
  white: '#ffffff',
} as const;

export type BrandColors = typeof brandColors;
