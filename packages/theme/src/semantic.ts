/**
 * @file semantic.ts
 * Role-based colour maps for Vroom light and dark themes.
 *
 * Design intent
 * -------------
 * Components should NEVER reference raw palette hex values directly.
 * They consume semantic roles (e.g. `theme.background`, `theme.brand`) so
 * that toggling between light and dark is a single object swap.
 *
 * Consumption paths
 * -----------------
 * Web:    expose via CSS custom properties (--vroom-background, …) generated
 *         from this map at build time, or via a React context.
 * Mobile: pass the chosen object into a React Native ThemeContext / Tamagui /
 *         StyleSheet factory — no platform imports needed here.
 *
 * Role glossary
 * -------------
 * background      — root page / screen fill
 * surface         — cards, list rows, input backgrounds
 * surfaceElevated — floating cards, modals, bottom-sheets
 * textPrimary     — primary readable content
 * textSecondary   — supporting / meta text
 * textInverse     — text on brand / accent filled surfaces
 * border          — dividers, input outlines
 * brand           — primary brand fill (buttons, tabs, active indicators)
 * brandContrast   — text / icon ON a brand-filled surface
 * accent          — CTA highlights, badges, focus rings
 * accentContrast  — text / icon ON an accent-filled surface
 * overlay         — scrim behind modals / sheets (includes alpha)
 * statusActive    — in-progress / live state indicator
 * statusSuccess   — positive outcome
 * statusError     — negative / destructive state
 */

import { palette } from './palette.js';

// ---------------------------------------------------------------------------
// Shared semantic type
// ---------------------------------------------------------------------------
export interface SemanticColors {
  background:      string;
  surface:         string;
  surfaceElevated: string;
  textPrimary:     string;
  textSecondary:   string;
  textInverse:     string;
  border:          string;
  brand:           string;
  brandContrast:   string;
  accent:          string;
  accentContrast:  string;
  overlay:         string;
  statusActive:    string;
  statusSuccess:   string;
  statusError:     string;
}

// ---------------------------------------------------------------------------
// Light theme
// ---------------------------------------------------------------------------
export const lightTheme: SemanticColors = {
  background:      palette.neutral[50],      // #f7f7fb — warm off-white
  surface:         palette.neutral[0],       // #ffffff — clean card surface
  surfaceElevated: palette.neutral[0],       // #ffffff — modals same as surface in light
  textPrimary:     palette.neutral[900],     // #22222e — near-black
  textSecondary:   palette.neutral[600],     // #6e6e88 — muted descriptor text
  textInverse:     palette.neutral[0],       // #ffffff — text on brand fills
  border:          palette.neutral[200],     // #dcdce8 — subtle separator
  brand:           palette.primary[500],     // #5a35f0 — electric indigo CTA
  brandContrast:   palette.neutral[0],       // #ffffff — on brand surface
  accent:          palette.accent[400],      // #ffb300 — vivid amber CTA accent
  accentContrast:  palette.neutral[1000],    // #0e0e14 — dark text on amber
  overlay:         '#0e0e1480',              // neutral-1000 @ 50 % alpha
  statusActive:    palette.primary[400],     // #7c5dfa — in-progress trip/delivery
  statusSuccess:   palette.semantic.success.main,  // #12a454
  statusError:     palette.semantic.error.main,    // #ef4444
} as const;

// ---------------------------------------------------------------------------
// Dark theme
// ---------------------------------------------------------------------------
export const darkTheme: SemanticColors = {
  background:      palette.neutral[1000],    // #0e0e14 — deep near-black
  surface:         palette.neutral[900],     // #22222e — elevated surface
  surfaceElevated: palette.neutral[800],     // #38384e — floating layer (modal, sheet)
  textPrimary:     palette.neutral[50],      // #f7f7fb — near-white for legibility
  textSecondary:   palette.neutral[400],     // #a8a8bc — subdued on dark
  textInverse:     palette.neutral[1000],    // #0e0e14 — text on light/brand surfaces
  border:          palette.neutral[700],     // #52526a — visible but not loud
  brand:           palette.primary[400],     // #7c5dfa — slightly lighter for dark bg contrast
  brandContrast:   palette.neutral[0],       // #ffffff — on brand surface
  accent:          palette.accent[400],      // #ffb300 — amber pops on dark
  accentContrast:  palette.neutral[1000],    // #0e0e14 — dark text on amber
  overlay:         '#0e0e14b3',              // neutral-1000 @ 70 % alpha
  statusActive:    palette.primary[300],     // #a08dff — lighter indigo for dark bg
  statusSuccess:   palette.semantic.success.main,
  statusError:     palette.semantic.error.main,
} as const;

/** Union of all valid colour scheme identifiers. */
export type ColorScheme = 'light' | 'dark';

/** Look up the correct semantic map by scheme name. */
export const themes: Record<ColorScheme, SemanticColors> = {
  light: lightTheme,
  dark:  darkTheme,
} as const;
