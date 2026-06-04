/**
 * @file useBoolean.ts
 * Stable boolean state with named transition functions.
 * A thin specialisation of useState that avoids inline callback allocations
 * at call sites and makes intent explicit (setTrue / setFalse vs. setValue(x)).
 */
import { useState, useCallback } from 'react';

export interface UseBooleanReturn {
  /** Current boolean value. */
  readonly value: boolean;
  /** Set value to true. */
  readonly setTrue: () => void;
  /** Set value to false. */
  readonly setFalse: () => void;
  /** Flip the current value. */
  readonly toggle: () => void;
  /** Directly set an arbitrary boolean. */
  readonly setValue: (next: boolean) => void;
}

/**
 * Boolean state with ergonomic named setters.
 *
 * @example
 * const { value: loading, setTrue: startLoading, setFalse: stopLoading } = useBoolean(false);
 */
export function useBoolean(initialValue: boolean = false): UseBooleanReturn {
  const [value, setValueRaw] = useState<boolean>(initialValue);

  const setTrue = useCallback(() => setValueRaw(true), []);
  const setFalse = useCallback(() => setValueRaw(false), []);
  const toggle = useCallback(() => setValueRaw((v) => !v), []);
  const setValue = useCallback((next: boolean) => setValueRaw(next), []);

  return { value, setTrue, setFalse, toggle, setValue };
}
