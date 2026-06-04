/**
 * Latency simulation helpers.
 *
 * - `simulateLatency` adds realistic async delay for mock endpoints.
 * - `withFailureInjection` is a deterministic failure toggle (default off)
 *   useful for exercising error states in Storybook / integration tests without
 *   randomness.
 */
import { err } from '@vroom/utils';
import type { ApiError } from '../errors.js';
import { serverError } from '../errors.js';
import type { Result } from '@vroom/utils';

// ---------------------------------------------------------------------------
// Latency
// ---------------------------------------------------------------------------

/** Default simulated network round-trip in milliseconds. */
const DEFAULT_LATENCY_MS = 400;

/**
 * Waits for the given number of milliseconds.
 * Defaults to a realistic mock API latency of 400 ms.
 */
export function simulateLatency(ms: number = DEFAULT_LATENCY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Failure injection — deterministic, not random
// ---------------------------------------------------------------------------

let _failureEnabled = false;
let _failureCallCount = 0;

/**
 * Enable or disable failure injection globally.
 * When enabled, `checkFailureInjection` will return an error every
 * `everyN`th call (default: every 3rd call).
 */
export function setFailureInjection(enabled: boolean): void {
  _failureEnabled = enabled;
  _failureCallCount = 0;
}

/**
 * Returns true when the current call should be injected as a failure.
 * Deterministic: fails on the `everyN`th call in sequence.
 */
export function shouldInjectFailure(everyN: number = 3): boolean {
  if (!_failureEnabled) return false;
  _failureCallCount += 1;
  return _failureCallCount % everyN === 0;
}

/**
 * Convenience wrapper: runs `simulateLatency`, then either returns the
 * provided result or—when failure injection is active—an injected server
 * error.
 *
 * Usage in mock methods:
 * ```ts
 * return withLatencyAndFailure(ok(data));
 * ```
 */
export async function withLatencyAndFailure<T>(
  result: Result<T, ApiError>,
  latencyMs?: number,
): Promise<Result<T, ApiError>> {
  await simulateLatency(latencyMs);
  if (shouldInjectFailure()) {
    return err(serverError('Injected mock failure for testing'));
  }
  return result;
}
