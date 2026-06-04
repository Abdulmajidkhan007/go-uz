/**
 * @file index.ts
 * Barrel export for @vroom/theme — platform-agnostic design tokens.
 *
 * Consumption paths
 * -----------------
 * Web (Tailwind):
 *   import { palette, spacing, radius, typography, lightTheme, darkTheme }
 *     from '@vroom/theme';
 *   // In tailwind.config.ts:
 *   //   theme.extend.colors   ← palette.primary, palette.accent, palette.neutral
 *   //   theme.extend.spacing  ← spacing
 *   //   theme.extend.borderRadius ← radius
 *   //   theme.extend.fontSize ← typography.fontSize
 *   //   theme.extend.fontFamily ← typography.fontFamilies
 *   // Semantic roles can be emitted as CSS custom properties at build time.
 *
 * Mobile (React Native StyleSheet):
 *   import { lightTheme, darkTheme, spacing, radius, typography }
 *     from '@vroom/theme';
 *   // Pass the chosen SemanticColors object into a ThemeContext; components
 *   // read role names (e.g. theme.brand) rather than raw hex.
 *   // Numeric spacing / radius values drop straight into StyleSheet.create.
 *
 * No platform-specific imports exist anywhere in this package.
 */

// --- Palette ---
export { palette } from './palette.js';
export type { Palette } from './palette.js';

// --- Spacing, radius, z-index ---
export { spacing, radius, zIndex } from './spacing.js';
export type { Spacing, Radius, ZIndex } from './spacing.js';

// --- Typography ---
export { fontFamilies, fontSize, fontWeight, lineHeight, textStyles, typography } from './typography.js';
export type { Typography } from './typography.js';

// --- Semantic / role-based theme maps ---
export { lightTheme, darkTheme, themes } from './semantic.js';
export type { SemanticColors, ColorScheme } from './semantic.js';

// --- Composite type: the full set of tokens one component package may need ---
/**
 * ThemeTokens bundles every static token collection so downstream packages
 * can type a single prop rather than importing each piece individually.
 *
 * @example
 * ```ts
 * import type { ThemeTokens } from '@vroom/theme';
 * function applyTheme(tokens: ThemeTokens): void { ... }
 * ```
 */
export type ThemeTokens = {
  readonly palette: import('./palette.js').Palette;
  readonly spacing: import('./spacing.js').Spacing;
  readonly radius: import('./spacing.js').Radius;
  readonly zIndex: import('./spacing.js').ZIndex;
  readonly typography: import('./typography.js').Typography;
  readonly colors: import('./semantic.js').SemanticColors;
};
