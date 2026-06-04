/**
 * @file index.ts
 * Barrel export for @vroom/ui style descriptor functions.
 *
 * These are token-driven descriptor functions — they take a SemanticColors
 * theme (from @vroom/theme) plus optional variant/size parameters and return
 * plain data objects (colors, spacing numbers, radius, fontWeight values).
 *
 * They are NOT StyleSheet objects, className strings, or sx props.
 * Platform layers (mobile RN, web MUI/Tailwind) map these tokens to their
 * own style systems.
 */

// Button
export type { ButtonVariant, ButtonSize, ButtonDescriptor } from './button.js';
export { getButtonDescriptor } from './button.js';

// Card
export type { ShadowLevel, CardDescriptor } from './card.js';
export { getCardDescriptor } from './card.js';

// Input
export type { InputState, InputDescriptor } from './input.js';
export { getInputDescriptor } from './input.js';

// Badge / Status presentations
export type { StatusTone, StatusPresentation } from './badge.js';
export {
  getTripStatusPresentation,
  getDeliveryStatusPresentation,
  getPaymentStatePresentation,
  getOrderStatePresentation,
} from './badge.js';

// Sheet / Drawer
export type { SheetHandleDescriptor, SheetDescriptor } from './sheet.js';
export { getSheetDescriptor } from './sheet.js';
