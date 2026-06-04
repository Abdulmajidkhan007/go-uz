/**
 * @file button.ts
 * Token-driven style descriptor for the Button primitive.
 *
 * `getButtonDescriptor` returns a plain object of design tokens — raw color
 * strings, numeric spacing, radius, and font-weight values. It is NOT a
 * StyleSheet, className string, or sx object. Platform layers map these tokens
 * to their own style system:
 *
 *   Mobile (RN):  StyleSheet.create({ root: { backgroundColor: d.backgroundColor, … } })
 *   Web (MUI):    <Button sx={{ bgcolor: d.backgroundColor, px: d.paddingX / 8, … }} />
 *   Web (TW):     apply Tailwind classes keyed from a token→class map
 */

import type { SemanticColors } from '@vroom/theme';
import { radius, spacing } from '@vroom/theme';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonDescriptor {
  /** Background fill of the button surface. */
  readonly backgroundColor: string;
  /** Color of the button label text. */
  readonly textColor: string;
  /** Border color (transparent when no border is needed). */
  readonly borderColor: string;
  /** Horizontal inner padding in logical pixels / dp. */
  readonly paddingX: number;
  /** Vertical inner padding in logical pixels / dp. */
  readonly paddingY: number;
  /** Border radius in pixels / dp. */
  readonly radius: number;
  /** CSS/RN font-weight string (e.g. '600'). */
  readonly fontWeight: string;
  /**
   * Opacity to apply on press/hover to indicate interaction.
   * Consumers multiply the element opacity by this value while the pressed
   * state is active.
   */
  readonly opacityPressed: number;
  /** Border width in pixels / dp (0 when no border). */
  readonly borderWidth: number;
}

// ---------------------------------------------------------------------------
// Size tokens
// ---------------------------------------------------------------------------

interface SizeTokens {
  readonly paddingX: number;
  readonly paddingY: number;
}

const SIZE_TOKENS: Readonly<Record<ButtonSize, SizeTokens>> = {
  sm: { paddingX: spacing.md, paddingY: spacing.xs },
  md: { paddingX: spacing.lg, paddingY: spacing.sm },
  lg: { paddingX: spacing.xl, paddingY: spacing.md },
};

// ---------------------------------------------------------------------------
// Descriptor factory
// ---------------------------------------------------------------------------

/**
 * Returns a plain token object describing the visual style of a button.
 *
 * @param theme   - The active SemanticColors map (light or dark).
 * @param variant - Button intent variant.
 * @param size    - Button size.
 *
 * @example
 * const d = getButtonDescriptor(lightTheme, 'primary', 'md');
 * // RN: StyleSheet.create({ btn: { backgroundColor: d.backgroundColor, borderRadius: d.radius } })
 * // Web: <button style={{ background: d.backgroundColor, borderRadius: d.radius }} />
 */
export function getButtonDescriptor(
  theme: SemanticColors,
  variant: ButtonVariant,
  size: ButtonSize,
): ButtonDescriptor {
  const { paddingX, paddingY } = SIZE_TOKENS[size];

  switch (variant) {
    case 'primary':
      return {
        backgroundColor: theme.brand,
        textColor: theme.brandContrast,
        borderColor: 'transparent',
        borderWidth: 0,
        paddingX,
        paddingY,
        radius: radius.xl,
        fontWeight: '600',
        opacityPressed: 0.85,
      };

    case 'secondary':
      return {
        backgroundColor: 'transparent',
        textColor: theme.brand,
        borderColor: theme.brand,
        borderWidth: 1.5,
        paddingX,
        paddingY,
        radius: radius.xl,
        fontWeight: '600',
        opacityPressed: 0.75,
      };

    case 'ghost':
      return {
        backgroundColor: 'transparent',
        textColor: theme.textPrimary,
        borderColor: 'transparent',
        borderWidth: 0,
        paddingX,
        paddingY,
        radius: radius.xl,
        fontWeight: '500',
        opacityPressed: 0.6,
      };

    case 'danger':
      return {
        backgroundColor: theme.statusError,
        textColor: '#ffffff',
        borderColor: 'transparent',
        borderWidth: 0,
        paddingX,
        paddingY,
        radius: radius.xl,
        fontWeight: '600',
        opacityPressed: 0.85,
      };
  }
}
