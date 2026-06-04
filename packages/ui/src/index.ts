/**
 * @file index.ts
 * Public API barrel for @vroom/ui — platform-agnostic UI primitives.
 *
 * Architecture
 * ------------
 * This package ships three layers:
 *
 * 1. hooks/   — Headless React hooks (logic only, no rendering).
 *               Mobile (RN) and web both consume these identically.
 *
 * 2. styles/  — Token-driven descriptor functions that return plain objects of
 *               design tokens (colors, spacing numbers, radius, fontWeight).
 *               NOT StyleSheet objects, className strings, or sx props.
 *               Platform layers map these tokens to their own style systems.
 *
 * 3. presentation/ — Pure domain→display formatters. No React; no platform
 *               imports. Reuse @vroom/utils; never duplicate money/geo logic.
 *
 * Hard constraints
 * ----------------
 * - No react-native, react-dom, or @mui/* imports anywhere in this package.
 * - react (core hooks only) is a peerDependency — not bundled.
 * - Strict TypeScript throughout; no `any`, no unchecked casts.
 */

// ── Hooks ────────────────────────────────────────────────────────────────────
export type {
  UseDisclosureReturn,
  UseDisclosureOptions,
} from './hooks/index.js';
export { useDisclosure } from './hooks/index.js';

export type {
  UseControllableStateOptions,
  UseControllableStateReturn,
} from './hooks/index.js';
export { useControllableState } from './hooks/index.js';

export type { UseToggleReturn } from './hooks/index.js';
export { useToggle } from './hooks/index.js';

export type { UseBooleanReturn } from './hooks/index.js';
export { useBoolean } from './hooks/index.js';

export type { UseStepperOptions, UseStepperReturn } from './hooks/index.js';
export { useStepper } from './hooks/index.js';

export { useDebouncedValue } from './hooks/index.js';

export type { AsyncStatus, UseAsyncStatusOptions } from './hooks/index.js';
export { useAsyncStatus } from './hooks/index.js';

export { useInterval } from './hooks/index.js';
export { usePrevious } from './hooks/index.js';

// ── Style descriptors ────────────────────────────────────────────────────────
export type {
  ButtonVariant,
  ButtonSize,
  ButtonDescriptor,
} from './styles/index.js';
export { getButtonDescriptor } from './styles/index.js';

export type { ShadowLevel, CardDescriptor } from './styles/index.js';
export { getCardDescriptor } from './styles/index.js';

export type { InputState, InputDescriptor } from './styles/index.js';
export { getInputDescriptor } from './styles/index.js';

export type {
  StatusTone,
  StatusPresentation,
} from './styles/index.js';
export {
  getTripStatusPresentation,
  getDeliveryStatusPresentation,
  getPaymentStatePresentation,
  getOrderStatePresentation,
} from './styles/index.js';

export type {
  SheetHandleDescriptor,
  SheetDescriptor,
} from './styles/index.js';
export { getSheetDescriptor } from './styles/index.js';

// ── Presentation formatters ───────────────────────────────────────────────────
export {
  formatFareLine,
  formatEta,
  driverSummary,
  addressShort,
} from './presentation/index.js';
