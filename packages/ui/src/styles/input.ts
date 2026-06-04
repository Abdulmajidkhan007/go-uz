/**
 * @file input.ts
 * Token-driven style descriptor for the TextInput primitive.
 *
 * Inputs appear in:
 * - Ride/delivery booking forms (destination, notes)
 * - Place autocomplete (search bar with debounced query)
 * - Auth screens (phone, OTP)
 * - Profile edit
 *
 * The `state` discriminant drives color changes; the platform layer applies
 * these tokens to borders, backgrounds, and label colors.
 */

import type { SemanticColors } from '@vroom/theme';
import { radius, spacing } from '@vroom/theme';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type InputState = 'default' | 'focused' | 'error' | 'disabled';

export interface InputDescriptor {
  /** Background fill of the input field. */
  readonly backgroundColor: string;
  /** Border / outline color. */
  readonly borderColor: string;
  /** Border width in pixels / dp. */
  readonly borderWidth: number;
  /** Corner radius in pixels / dp. */
  readonly radius: number;
  /** Horizontal inner padding in pixels / dp. */
  readonly paddingX: number;
  /** Vertical inner padding in pixels / dp. */
  readonly paddingY: number;
  /** Color for the typed text / value. */
  readonly textColor: string;
  /** Color for placeholder text. */
  readonly placeholderColor: string;
  /** Color for the field label above the input. */
  readonly labelColor: string;
  /** When true the platform should prevent interaction (pointer-events: none / editable={false}). */
  readonly isDisabled: boolean;
}

// ---------------------------------------------------------------------------
// Descriptor factory
// ---------------------------------------------------------------------------

/**
 * Returns a plain token object describing an input field's visual state.
 *
 * @param theme - The active SemanticColors map (light or dark).
 * @param state - The current interaction / validation state of the input.
 *
 * @example
 * const d = getInputDescriptor(lightTheme, 'focused');
 * // RN: <TextInput style={{ borderColor: d.borderColor, borderWidth: d.borderWidth }} />
 * // Web: <TextField sx={{ '& .MuiOutlinedInput-root': { borderColor: d.borderColor } }} />
 */
export function getInputDescriptor(
  theme: SemanticColors,
  state: InputState,
): InputDescriptor {
  const base = {
    radius: radius.sm,
    paddingX: spacing.md,
    paddingY: spacing.sm,
    textColor: theme.textPrimary,
    placeholderColor: theme.textSecondary,
    isDisabled: false,
  };

  switch (state) {
    case 'default':
      return {
        ...base,
        backgroundColor: theme.surface,
        borderColor: theme.border,
        borderWidth: 1,
        labelColor: theme.textSecondary,
      };

    case 'focused':
      return {
        ...base,
        backgroundColor: theme.surface,
        borderColor: theme.brand,
        borderWidth: 2,
        labelColor: theme.brand,
      };

    case 'error':
      return {
        ...base,
        backgroundColor: theme.surface,
        borderColor: theme.statusError,
        borderWidth: 2,
        labelColor: theme.statusError,
      };

    case 'disabled':
      return {
        ...base,
        backgroundColor: theme.background,
        borderColor: theme.border,
        borderWidth: 1,
        textColor: theme.textSecondary,
        placeholderColor: theme.textSecondary,
        labelColor: theme.textSecondary,
        isDisabled: true,
      };
  }
}
