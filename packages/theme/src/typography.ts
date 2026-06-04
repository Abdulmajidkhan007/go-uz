/**
 * @file typography.ts
 * Type scale and text-style tokens for the Vroom design system.
 *
 * Consumption paths
 * -----------------
 * Web (Tailwind):   spread `fontFamilies` into `theme.extend.fontFamily`,
 *                   `fontSize` into `theme.extend.fontSize`. Named text styles
 *                   can be composed into a Tailwind plugin or CSS custom props.
 * Mobile (RN):      pass token values directly to `StyleSheet.create` — RN
 *                   accepts numeric font sizes and string font families.
 *
 * Font stacks use system fonts only; no proprietary or hosted typefaces are
 * referenced here, keeping the package free of network or licensing concerns.
 */

// ---------------------------------------------------------------------------
// Font families — system stacks, cross-platform safe
// ---------------------------------------------------------------------------
export const fontFamilies = {
  /**
   * Primary UI font. Uses platform-native sans-serif:
   * - iOS/macOS: SF Pro Text → Helvetica Neue
   * - Android:   Google Sans → Roboto
   * - Web:       system-ui fallback chain
   */
  sans: [
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(', '),

  /**
   * Monospace for amounts, codes, OTPs.
   * - iOS/macOS: SF Mono → Courier New
   * - Android:   Roboto Mono → monospace
   * - Web:       ui-monospace fallback chain
   */
  mono: [
    'ui-monospace',
    '"SF Mono"',
    '"Roboto Mono"',
    '"Courier New"',
    'monospace',
  ].join(', '),
} as const;

// ---------------------------------------------------------------------------
// Font size scale — sp/px values on a modular type scale (base 16)
// ---------------------------------------------------------------------------
export const fontSize = {
  /** 11 sp — legal / meta text */          '2xs': 11,
  /** 12 sp — captions, timestamps */        xs:  12,
  /** 14 sp — secondary body, labels */      sm:  14,
  /** 16 sp — primary body */               base: 16,
  /** 18 sp — lead / featured body */        lg:  18,
  /** 20 sp — subheading */                  xl:  20,
  /** 24 sp — heading 2 */                  '2xl': 24,
  /** 28 sp — heading 1 */                  '3xl': 28,
  /** 36 sp — display small */              '4xl': 36,
  /** 48 sp — display large */              '5xl': 48,
} as const;

// ---------------------------------------------------------------------------
// Font weight — numeric values; RN and CSS both accept them.
// ---------------------------------------------------------------------------
export const fontWeight = {
  regular:   '400',
  medium:    '500',
  semibold:  '600',
  bold:      '700',
  extrabold: '800',
} as const;

// ---------------------------------------------------------------------------
// Line height — unitless multipliers.
// RN treats these as multipliers × fontSize; CSS uses them as-is (unitless).
// ---------------------------------------------------------------------------
export const lineHeight = {
  tight:  1.15,
  snug:   1.25,
  normal: 1.45,
  relaxed: 1.6,
} as const;

// ---------------------------------------------------------------------------
// Named text styles — composite tokens consumed directly by components.
// Each object is a self-contained style descriptor; consumers spread or map
// into their style system (Tailwind classes, RN StyleSheet, CSS-in-JS).
// ---------------------------------------------------------------------------
export const textStyles = {
  displayLg: {
    fontSize:   fontSize['5xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    fontFamily: fontFamilies.sans,
  },
  displaySm: {
    fontSize:   fontSize['4xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    fontFamily: fontFamilies.sans,
  },
  h1: {
    fontSize:   fontSize['3xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.snug,
    fontFamily: fontFamilies.sans,
  },
  h2: {
    fontSize:   fontSize['2xl'],
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.snug,
    fontFamily: fontFamilies.sans,
  },
  h3: {
    fontSize:   fontSize.xl,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.snug,
    fontFamily: fontFamilies.sans,
  },
  body: {
    fontSize:   fontSize.base,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.normal,
    fontFamily: fontFamilies.sans,
  },
  bodyMd: {
    fontSize:   fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.normal,
    fontFamily: fontFamilies.sans,
  },
  caption: {
    fontSize:   fontSize.xs,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.normal,
    fontFamily: fontFamilies.sans,
  },
  button: {
    fontSize:   fontSize.base,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.tight,
    fontFamily: fontFamilies.sans,
  },
  buttonSm: {
    fontSize:   fontSize.sm,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.tight,
    fontFamily: fontFamilies.sans,
  },
  mono: {
    fontSize:   fontSize.base,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.normal,
    fontFamily: fontFamilies.mono,
  },
} as const;

export const typography = {
  fontFamilies,
  fontSize,
  fontWeight,
  lineHeight,
  textStyles,
} as const;

export type Typography = typeof typography;
