/**
 * @file useStepper.ts
 * Multi-step flow state machine for booking wizards (ride, delivery).
 *
 * Steps are indexed 0..count-1. The hook enforces boundaries — you cannot
 * navigate below 0 or above count-1. `goTo` clamps silently so callers do
 * not need guards.
 *
 * `progress` is a 0–1 float suitable for driving a progress bar:
 *   progress = step / (count - 1)   (0 on first step, 1 on last)
 */
import { useState, useCallback, useMemo } from 'react';

export interface UseStepperOptions {
  /** Total number of steps. Must be >= 1. */
  readonly count: number;
  /** Step index to start on (default: 0). */
  readonly initialStep?: number;
}

export interface UseStepperReturn {
  /** Zero-based index of the current step. */
  readonly step: number;
  /** Total number of steps. */
  readonly count: number;
  /** Advance to the next step. No-op on the last step. */
  readonly next: () => void;
  /** Go back to the previous step. No-op on the first step. */
  readonly prev: () => void;
  /** Jump to a specific step index. Clamped to [0, count-1]. */
  readonly goTo: (index: number) => void;
  /** True when on the first step (step === 0). */
  readonly isFirst: boolean;
  /** True when on the last step (step === count - 1). */
  readonly isLast: boolean;
  /** Completion fraction in [0, 1]. 0 = first step, 1 = last step. */
  readonly progress: number;
  /** Reset to the initial step. */
  readonly reset: () => void;
}

/**
 * State machine for multi-step booking flows.
 *
 * @example
 * const stepper = useStepper({ count: 4 });
 * // stepper.step    → current step index
 * // stepper.next()  → advance
 * // stepper.isLast  → hide the "Next" button, show "Confirm"
 */
export function useStepper(options: UseStepperOptions): UseStepperReturn {
  const { count, initialStep = 0 } = options;

  if (count < 1) {
    throw new Error('useStepper: count must be >= 1');
  }

  const clamp = (n: number): number => Math.max(0, Math.min(count - 1, n));

  const [step, setStep] = useState<number>(clamp(initialStep));

  const next = useCallback(() => {
    setStep((s) => clamp(s + 1));
  }, [count]); // eslint-disable-line react-hooks/exhaustive-deps

  const prev = useCallback(() => {
    setStep((s) => clamp(s - 1));
  }, []); // clamp(s-1) with count is safe — count never decreases below 1

  const goTo = useCallback(
    (index: number) => {
      setStep(clamp(index));
    },
    [count], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const reset = useCallback(() => {
    setStep(clamp(initialStep));
  }, [initialStep, count]); // eslint-disable-line react-hooks/exhaustive-deps

  const derived = useMemo(() => {
    const isFirst = step === 0;
    const isLast = step === count - 1;
    const progress = count === 1 ? 1 : step / (count - 1);
    return { isFirst, isLast, progress };
  }, [step, count]);

  return { step, count, next, prev, goTo, reset, ...derived };
}
