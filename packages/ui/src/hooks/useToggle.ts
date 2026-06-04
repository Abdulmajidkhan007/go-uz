/**
 * @file useToggle.ts
 * Minimal toggle hook. Wraps a boolean state with a single stable `toggle`
 * function and an optional explicit setter for driven state.
 *
 * When you only need to flip something — a filter chip, a checkbox, a
 * show/hide control — prefer useToggle over useBoolean for its narrower API.
 */
import { useState, useCallback } from 'react';

export interface UseToggleReturn {
  /** Current value. */
  readonly on: boolean;
  /** Flip the current value. */
  readonly toggle: () => void;
  /** Force the value to true. */
  readonly turnOn: () => void;
  /** Force the value to false. */
  readonly turnOff: () => void;
}

/**
 * @example
 * const { on, toggle } = useToggle(false);
 * // <Switch value={on} onValueChange={toggle} />
 */
export function useToggle(initialValue: boolean = false): UseToggleReturn {
  const [on, setOn] = useState<boolean>(initialValue);

  const toggle = useCallback(() => setOn((v) => !v), []);
  const turnOn = useCallback(() => setOn(true), []);
  const turnOff = useCallback(() => setOn(false), []);

  return { on, toggle, turnOn, turnOff };
}
