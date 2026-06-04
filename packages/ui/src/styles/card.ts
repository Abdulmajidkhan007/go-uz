/**
 * @file card.ts
 * Token-driven style descriptor for the Card primitive.
 *
 * Cards are the primary content container in Vroom — ride summaries, delivery
 * cards, driver profiles, payment method rows. The elevated variant is used
 * for floating overlays such as the "Your ride" summary card at the bottom of
 * the map screen.
 */

import type { SemanticColors } from '@vroom/theme';
import { radius, spacing } from '@vroom/theme';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/** Shadow intensity level; 0 = no shadow, 1 = subtle, 2 = prominent. */
export type ShadowLevel = 0 | 1 | 2;

export interface CardDescriptor {
  /** Surface fill color. */
  readonly backgroundColor: string;
  /** Border / separator color. */
  readonly borderColor: string;
  /** Corner radius in pixels / dp. */
  readonly radius: number;
  /** Inner content padding in pixels / dp (same on all sides). */
  readonly padding: number;
  /**
   * Shadow intensity level (0–2). Consumers map this to their shadow system:
   *   RN:   elevation (Android) or shadowRadius (iOS)
   *   Web:  box-shadow preset or MUI `elevation` prop
   */
  readonly shadowLevel: ShadowLevel;
  /** Border width in pixels / dp (0 when no border). */
  readonly borderWidth: number;
}

// ---------------------------------------------------------------------------
// Descriptor factory
// ---------------------------------------------------------------------------

/**
 * Returns a plain token object describing a card surface.
 *
 * @param theme    - The active SemanticColors map (light or dark).
 * @param elevated - When true, uses the elevated surface color and a stronger
 *                   shadow — appropriate for floating cards and bottom-sheet
 *                   content areas.
 *
 * @example
 * const d = getCardDescriptor(lightTheme, true);
 * // RN: { backgroundColor: d.backgroundColor, elevation: d.shadowLevel * 4 }
 * // Web: <Paper elevation={d.shadowLevel * 4} sx={{ borderRadius: d.radius }} />
 */
export function getCardDescriptor(
  theme: SemanticColors,
  elevated: boolean = false,
): CardDescriptor {
  if (elevated) {
    return {
      backgroundColor: theme.surfaceElevated,
      borderColor: theme.border,
      radius: radius.lg,
      padding: spacing['2xl'],
      shadowLevel: 2,
      borderWidth: 0,
    };
  }

  return {
    backgroundColor: theme.surface,
    borderColor: theme.border,
    radius: radius.md,
    padding: spacing.lg,
    shadowLevel: 1,
    borderWidth: 1,
  };
}
