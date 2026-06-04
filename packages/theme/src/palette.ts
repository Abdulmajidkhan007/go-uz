/**
 * @file palette.ts
 * Raw colour scales for the Vroom design system.
 *
 * Consumption paths
 * -----------------
 * Web (Tailwind):   import { palette } from '@vroom/theme' and spread into
 *                   `theme.extend.colors` inside tailwind.config.ts.
 * Mobile (RN):      import individual hex strings directly; TypeScript narrows
 *                   them to string literals so StyleSheet.create stays typed.
 *
 * Do NOT reference DOM, React Native, or any UI framework here.
 * All values are plain hex strings (`#rrggbb` or `#rrggbbaa`).
 */

// ---------------------------------------------------------------------------
// Primary — Deep Electric Indigo/Violet
// Confident, premium, trustworthy. Vibrant at mid-range; rich at the dark end.
// ---------------------------------------------------------------------------
const primary = {
  /** #f0eeff */  50:  '#f0eeff',
  /** #ddd8ff */  100: '#ddd8ff',
  /** #c2b8ff */  200: '#c2b8ff',
  /** #a08dff */  300: '#a08dff',
  /** #7c5dfa */  400: '#7c5dfa',
  /** #5a35f0 */  500: '#5a35f0',
  /** #4620d6 */  600: '#4620d6',
  /** #3714b0 */  700: '#3714b0',
  /** #28108a */  800: '#28108a',
  /** #1a0b62 */  900: '#1a0b62',
} as const;

// ---------------------------------------------------------------------------
// Accent — Vivid Electric Amber / Saffron
// Used for CTAs, highlights, and interactive affordances. Pairs well with the
// indigo primary while maintaining WCAG AA on dark surfaces.
// ---------------------------------------------------------------------------
const accent = {
  /** #fff8eb */  50:  '#fff8eb',
  /** #ffefc2 */  100: '#ffefc2',
  /** #ffdf85 */  200: '#ffdf85',
  /** #ffc940 */  300: '#ffc940',
  /** #ffb300 */  400: '#ffb300',
  /** #e69500 */  500: '#e69500',
  /** #b37200 */  600: '#b37200',
  /** #7d5000 */  700: '#7d5000',
  /** #4a3000 */  800: '#4a3000',
  /** #251800 */  900: '#251800',
} as const;

// ---------------------------------------------------------------------------
// Neutral / Gray — True neutral, slight cool undertone to complement indigo.
// Scale 0 (white) → 1000 (near-black). Odd steps enable fine-grained
// contrast tuning without relying on opacity hacks.
// ---------------------------------------------------------------------------
const neutral = {
  /** #ffffff */     0:    '#ffffff',
  /** #f7f7fb */    50:   '#f7f7fb',
  /** #eeeef6 */   100:   '#eeeef6',
  /** #dcdce8 */   200:   '#dcdce8',
  /** #c4c4d4 */   300:   '#c4c4d4',
  /** #a8a8bc */   400:   '#a8a8bc',
  /** #8c8ca4 */   500:   '#8c8ca4',
  /** #6e6e88 */   600:   '#6e6e88',
  /** #52526a */   700:   '#52526a',
  /** #38384e */   800:   '#38384e',
  /** #22222e */   900:   '#22222e',
  /** #0e0e14 */  1000:   '#0e0e14',
} as const;

// ---------------------------------------------------------------------------
// Semantic status colours
// Each status has: main (brand expression), light (tinted bg), dark (pressed
// / text on light), contrast (text ON the main swatch — always passes AA).
// ---------------------------------------------------------------------------
const semantic = {
  success: {
    main:     '#12a454',
    light:    '#d5f5e3',
    dark:     '#0a6e38',
    contrast: '#ffffff',
  },
  warning: {
    main:     '#f59e0b',
    light:    '#fef3c7',
    dark:     '#92400e',
    contrast: '#0e0e14',
  },
  error: {
    main:     '#ef4444',
    light:    '#fee2e2',
    dark:     '#991b1b',
    contrast: '#ffffff',
  },
  info: {
    main:     '#3b82f6',
    light:    '#dbeafe',
    dark:     '#1e40af',
    contrast: '#ffffff',
  },
} as const;

export const palette = {
  primary,
  accent,
  neutral,
  semantic,
} as const;

export type Palette = typeof palette;
