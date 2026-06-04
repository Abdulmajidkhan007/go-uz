/**
 * @file useInterval.ts
 * Declarative, safe wrapper around `setInterval`.
 *
 * Design notes
 * ------------
 * - The callback ref pattern ensures the latest closure is always used without
 *   the interval being torn down and recreated on every render.
 * - Passing `null` as the delay pauses the interval without unmounting the
 *   hook, which is useful for tracking screens that need to stop polling when
 *   the trip is completed.
 * - The interval is always cleared on unmount.
 *
 * @example
 * // Poll driver location every 5 seconds while trip is active.
 * useInterval(refetchLocation, tripIsActive ? 5_000 : null);
 */
import { useEffect, useRef } from 'react';

/**
 * Run `callback` on a repeating interval of `delay` milliseconds.
 *
 * @param callback - The function to call on each tick. Identity may change
 *                   between renders; the latest version is always used.
 * @param delay    - Interval duration in milliseconds, or `null` to pause.
 */
export function useInterval(
  callback: () => void,
  delay: number | null,
): void {
  const savedCallback = useRef<() => void>(callback);

  // Keep the ref up-to-date on every render so stale closures are never called.
  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    if (delay === null) return;

    const id = setInterval(() => {
      savedCallback.current();
    }, delay);

    return () => {
      clearInterval(id);
    };
  }, [delay]);
}
