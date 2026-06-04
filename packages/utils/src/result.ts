/**
 * Result<T, E> — explicit success/failure without exceptions.
 *
 * The type mirrors the shape in @vroom/types/common so both packages share
 * the same structural contract. Helpers live here; the plain type alias lives
 * in types so entities can reference it without depending on utils.
 */

export type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

// ---------------------------------------------------------------------------
// Constructors
// ---------------------------------------------------------------------------

/** Wraps a value in a successful Result. */
export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

/** Wraps an error in a failed Result. */
export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

// ---------------------------------------------------------------------------
// Narrowing guards
// ---------------------------------------------------------------------------

/** Returns `true` and narrows to the success branch. */
export function isOk<T, E>(result: Result<T, E>): result is { ok: true; value: T } {
  return result.ok;
}

/** Returns `true` and narrows to the failure branch. */
export function isErr<T, E>(result: Result<T, E>): result is { ok: false; error: E } {
  return !result.ok;
}

// ---------------------------------------------------------------------------
// Transformers
// ---------------------------------------------------------------------------

/**
 * Applies `fn` to the value if the result is successful; returns a new
 * Result with the mapped value. Errors are forwarded unchanged.
 */
export function map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  return result.ok ? ok(fn(result.value)) : result;
}

/**
 * Applies `fn` to the error if the result is failed; returns a new
 * Result with the mapped error. Successes are forwarded unchanged.
 */
export function mapErr<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> {
  return result.ok ? result : err(fn(result.error));
}

/**
 * Chains a Result-returning function onto a successful Result.
 * Short-circuits on failure.
 */
export function flatMap<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>,
): Result<U, E> {
  return result.ok ? fn(result.value) : result;
}

/**
 * Extracts the value or returns the provided default on failure.
 */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  return result.ok ? result.value : defaultValue;
}
