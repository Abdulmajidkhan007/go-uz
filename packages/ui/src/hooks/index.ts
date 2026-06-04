/**
 * @file index.ts
 * Barrel export for @vroom/ui headless hooks.
 *
 * All hooks are platform-agnostic React hooks that contain logic only —
 * no rendering, no platform-specific imports. Mobile (React Native) and
 * web (Next.js / Vite) both consume these identically.
 */

// Disclosure — sheets, dialogs, drawers
export type { UseDisclosureReturn, UseDisclosureOptions } from './useDisclosure.js';
export { useDisclosure } from './useDisclosure.js';

// Controllable state — controlled / uncontrolled pattern
export type { UseControllableStateOptions, UseControllableStateReturn } from './useControllableState.js';
export { useControllableState } from './useControllableState.js';

// Toggle / boolean helpers
export type { UseToggleReturn } from './useToggle.js';
export { useToggle } from './useToggle.js';

export type { UseBooleanReturn } from './useBoolean.js';
export { useBoolean } from './useBoolean.js';

// Multi-step flow state machine (booking wizards)
export type { UseStepperOptions, UseStepperReturn } from './useStepper.js';
export { useStepper } from './useStepper.js';

// Debounced value (place autocomplete)
export { useDebouncedValue } from './useDebouncedValue.js';

// Async view-state machine
export type { AsyncStatus, UseAsyncStatusOptions } from './useAsyncStatus.js';
export { useAsyncStatus } from './useAsyncStatus.js';

// Safe declarative interval (tracking screens)
export { useInterval } from './useInterval.js';

// Previous value
export { usePrevious } from './usePrevious.js';
