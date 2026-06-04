/**
 * @file sheet.ts
 * Token-driven style descriptor for the BottomSheet / Drawer primitive.
 *
 * Bottom sheets appear throughout the Vroom app:
 * - Ride booking flow steps
 * - Driver information panel
 * - Delivery tracking details
 * - Payment method selection
 * - Confirmation dialogs
 *
 * The descriptor covers the sheet container, the drag handle, and the
 * scrim overlay behind the sheet.
 */

import type { SemanticColors } from '@vroom/theme';
import { radius, spacing, zIndex } from '@vroom/theme';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface SheetHandleDescriptor {
  /** Handle bar fill color. */
  readonly color: string;
  /** Handle bar width in pixels / dp. */
  readonly width: number;
  /** Handle bar height in pixels / dp. */
  readonly height: number;
  /** Handle bar corner radius (fully rounded). */
  readonly radius: number;
}

export interface SheetDescriptor {
  /** Sheet surface background color. */
  readonly backgroundColor: string;
  /** Top-edge corner radius for the sheet container. */
  readonly topRadius: number;
  /** Inner content padding in pixels / dp. */
  readonly contentPadding: number;
  /** Drag handle descriptor. */
  readonly handle: SheetHandleDescriptor;
  /** Scrim / overlay color behind the sheet (includes alpha). */
  readonly overlayColor: string;
  /** Z-index for the sheet container (above dropdowns, below modals). */
  readonly zIndex: number;
  /** Z-index for the scrim overlay (just below the sheet). */
  readonly overlayZIndex: number;
}

// ---------------------------------------------------------------------------
// Descriptor factory
// ---------------------------------------------------------------------------

/**
 * Returns a plain token object describing a bottom sheet or drawer.
 *
 * @param theme - The active SemanticColors map (light or dark).
 *
 * @example
 * const d = getSheetDescriptor(lightTheme);
 * // RN (react-native-bottom-sheet):
 * //   backgroundStyle={{ backgroundColor: d.backgroundColor }}
 * //   handleIndicatorStyle={{ backgroundColor: d.handle.color }}
 * // Web (MUI Drawer):
 * //   PaperProps={{ sx: { borderRadius: `${d.topRadius}px ${d.topRadius}px 0 0` } }}
 */
export function getSheetDescriptor(theme: SemanticColors): SheetDescriptor {
  return {
    backgroundColor: theme.surfaceElevated,
    topRadius: radius.lg,
    contentPadding: spacing.lg,
    handle: {
      color: theme.border,
      width: 40,
      height: 4,
      radius: radius.full,
    },
    overlayColor: theme.overlay,
    zIndex: zIndex.sheet,
    overlayZIndex: zIndex.sheet - 1,
  };
}
