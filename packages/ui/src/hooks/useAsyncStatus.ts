/**
 * @file useAsyncStatus.ts
 * Derives a single view-state discriminant from React Query-style async inputs.
 *
 * Architecture contract
 * ---------------------
 * Every data-fetching screen in the app switches on one of five states:
 *   idle     — query not yet triggered (e.g. before the user types)
 *   loading  — request in flight with no prior data
 *   empty    — request succeeded but the result set is empty
 *   error    — request failed
 *   success  — request succeeded with non-empty data
 *
 * Callers import `AsyncStatus` and switch exhaustively on it so the compiler
 * guarantees every branch is handled.
 *
 * @example
 * const status = useAsyncStatus({ isPending, isError, data: trips, isEmpty: trips.length === 0 });
 * if (status === 'loading') return <Skeleton />;
 * if (status === 'error')   return <ErrorView />;
 * if (status === 'empty')   return <EmptyState />;
 * // status === 'success' — render the list
 */

/** The five mutually exclusive view states every async screen can be in. */
export type AsyncStatus = 'idle' | 'loading' | 'empty' | 'error' | 'success';

export interface UseAsyncStatusOptions {
  /**
   * True while the request is in flight (maps to React Query's `isPending`).
   * When true and there is no cached data the hook returns 'loading'.
   */
  readonly isPending: boolean;
  /** True when the most recent request ended in an error. */
  readonly isError: boolean;
  /**
   * The resolved data value. The hook uses this to distinguish 'empty' from
   * 'success'. Pass `undefined` or `null` when data has not yet arrived.
   */
  readonly data: unknown;
  /**
   * Override the emptiness check. When omitted the hook considers arrays with
   * length 0 as empty and any other truthy data value as success.
   */
  readonly isEmpty?: boolean;
  /**
   * When true the query has not been triggered yet (e.g. `enabled: false` in
   * React Query). The hook returns 'idle' regardless of other flags.
   * Defaults to false.
   */
  readonly isIdle?: boolean;
}

/**
 * Derives a single `AsyncStatus` discriminant from React Query-ish flags.
 * No hook state is allocated — this is a pure derivation on every render.
 *
 * Priority order (first match wins):
 * 1. isIdle   → 'idle'
 * 2. isPending AND no data → 'loading'
 * 3. isError  → 'error'
 * 4. isEmpty  → 'empty'
 * 5. default  → 'success'
 */
export function useAsyncStatus(options: UseAsyncStatusOptions): AsyncStatus {
  const { isPending, isError, data, isEmpty, isIdle = false } = options;

  if (isIdle) return 'idle';

  // Still loading with no cached data to show
  if (isPending && data === undefined || isPending && data === null) return 'loading';

  if (isError) return 'error';

  // Derive emptiness: explicit override wins, then array-length check, then
  // treat any non-null/undefined data as non-empty (success).
  if (data !== undefined && data !== null) {
    const effectivelyEmpty =
      isEmpty !== undefined
        ? isEmpty
        : Array.isArray(data) && data.length === 0;

    return effectivelyEmpty ? 'empty' : 'success';
  }

  // isPending with stale data — treat as success (background refresh)
  if (isPending) return 'loading';

  // No data, no error, not pending — idle-like fallback
  return 'idle';
}
