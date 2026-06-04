/**
 * @file useControllableState.ts
 * Controlled / uncontrolled state pattern.
 *
 * When a `value` prop is provided the component is "controlled" — external
 * state owns the value and the hook notifies via `onChange`. When `value` is
 * omitted the hook owns the state internally (uncontrolled), using
 * `defaultValue` as the initial value.
 *
 * This mirrors the pattern used by Radix UI, Headless UI, and React Aria so
 * that any primitive built on top feels idiomatic to React consumers.
 */
import { useState, useCallback, useRef } from 'react';

export interface UseControllableStateOptions<T> {
  /** Externally controlled value. When provided the component is controlled. */
  readonly value?: T;
  /** Initial value for uncontrolled mode. */
  readonly defaultValue?: T;
  /** Called when the value changes. Required in controlled mode. */
  readonly onChange?: (value: T) => void;
}

export type UseControllableStateReturn<T> = [
  /** The current value (internal or external). */
  value: T | undefined,
  /** Setter that updates internal state and calls onChange. */
  setValue: (value: T) => void,
];

/**
 * Unified controlled / uncontrolled state for UI primitives.
 *
 * @example
 * // Uncontrolled — the hook owns the state
 * const [value, setValue] = useControllableState({ defaultValue: false });
 *
 * // Controlled — external state owns the value
 * const [value, setValue] = useControllableState({ value: props.checked, onChange: props.onCheckedChange });
 */
export function useControllableState<T>(
  options: UseControllableStateOptions<T>,
): UseControllableStateReturn<T> {
  const { value: controlledValue, defaultValue, onChange } = options;

  const isControlled = controlledValue !== undefined;

  // Internal state used only in uncontrolled mode.
  const [internalValue, setInternalValue] = useState<T | undefined>(defaultValue);

  // Keep a ref to onChange so the setter callback doesn't need to be
  // recreated every render when onChange identity changes (common in inline
  // arrow functions).
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) {
        setInternalValue(next);
      }
      onChangeRef.current?.(next);
    },
    [isControlled],
  );

  const value = isControlled ? controlledValue : internalValue;

  return [value, setValue];
}
