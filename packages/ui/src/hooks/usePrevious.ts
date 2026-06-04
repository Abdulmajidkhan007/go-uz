/**
 * @file usePrevious.ts
 * Returns the value from the previous render.
 *
 * The returned value is `undefined` on the first render because there is no
 * prior render to reference. Callers should guard against this when the
 * previous value is required to be defined.
 *
 * Common use cases:
 * - Detecting direction of change (e.g. animating a step forward vs. backward).
 * - Comparing previous vs. current trip status to trigger a toast.
 * - Running a side-effect only when a specific field changes.
 *
 * @example
 * const prevStatus = usePrevious(trip.status.kind);
 * useEffect(() => {
 *   if (prevStatus === 'arriving' && trip.status.kind === 'in_progress') {
 *     showToast('Your ride has started');
 *   }
 * }, [trip.status.kind, prevStatus]);
 */
import { useEffect, useRef } from 'react';

/**
 * Returns the value of `value` from the previous render, or `undefined` on
 * the first render.
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  // Update the ref after every render so callers receive the previous value
  // during the current render, not the current value.
  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}
