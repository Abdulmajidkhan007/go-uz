/**
 * Firebase -> ApiError mapping.
 *
 * Every method in the Firebase adapter wraps its calls with `fbGuard`, which
 * catches anything thrown and converts it to the appropriate ApiError variant.
 * The firebase/app `FirebaseError` carries a `code` string like
 * "auth/user-not-found" or "permission-denied". We pattern-match on the code
 * and fall back to `unknownError` for codes we haven't explicitly handled.
 *
 * Note: the shared `ApiError` union has no `timeout` member — Firebase SDK
 * handles retries internally, so we surface those as `network`.
 */
import { FirebaseError } from 'firebase/app';
import type { Result } from '@vroom/utils';
import { err, ok } from '@vroom/utils';
import type { ApiError } from '../errors.js';
import {
  unauthorizedError,
  notFoundError,
  networkError,
  validationError,
  conflictError,
  serverError,
  unknownError,
} from '../errors.js';

// ---------------------------------------------------------------------------
// Code -> ApiError mapping
// ---------------------------------------------------------------------------

function firebaseCodeToApiError(code: string, message: string): ApiError {
  // Auth errors
  if (
    code === 'auth/invalid-verification-code' ||
    code === 'auth/code-expired' ||
    code === 'auth/missing-verification-code'
  ) {
    return validationError('Invalid or expired OTP code', { code: [message] });
  }
  if (
    code === 'auth/invalid-phone-number' ||
    code === 'auth/missing-phone-number'
  ) {
    return validationError('Invalid phone number', { phone: [message] });
  }
  if (
    code === 'auth/user-not-found' ||
    code === 'auth/wrong-password' ||
    code === 'auth/user-disabled'
  ) {
    return unauthorizedError(message);
  }
  if (
    code === 'auth/id-token-expired' ||
    code === 'auth/session-cookie-expired' ||
    code === 'auth/invalid-id-token' ||
    code === 'auth/invalid-user-token'
  ) {
    return unauthorizedError('Session expired — please sign in again');
  }
  if (code === 'auth/too-many-requests') {
    return conflictError('Too many requests — please wait before retrying');
  }
  if (code === 'auth/requires-recent-login') {
    return unauthorizedError('Re-authentication required');
  }

  // Firestore permission / not-found
  if (code === 'permission-denied' || code === 'firestore/permission-denied') {
    return unauthorizedError('Insufficient permissions');
  }
  if (
    code === 'not-found' ||
    code === 'firestore/not-found' ||
    code === 'auth/user-not-found'
  ) {
    return notFoundError(message);
  }
  if (code === 'already-exists' || code === 'firestore/already-exists') {
    return conflictError(message);
  }
  if (code === 'invalid-argument' || code === 'firestore/invalid-argument') {
    return validationError(message);
  }
  if (
    code === 'aborted' ||
    code === 'firestore/aborted' ||
    code === 'failed-precondition' ||
    code === 'firestore/failed-precondition'
  ) {
    return conflictError(message);
  }

  // Network / availability
  if (
    code === 'unavailable' ||
    code === 'firestore/unavailable' ||
    code === 'network-request-failed' ||
    code === 'auth/network-request-failed'
  ) {
    return networkError('Network error — check your connection', { code });
  }
  if (code === 'deadline-exceeded' || code === 'firestore/deadline-exceeded') {
    return networkError('Request timed out', { code });
  }

  // Server errors
  if (
    code === 'internal' ||
    code === 'firestore/internal' ||
    code === 'data-loss' ||
    code === 'firestore/data-loss'
  ) {
    return serverError(message);
  }

  return unknownError(message, { code });
}

// ---------------------------------------------------------------------------
// Guard wrapper
// ---------------------------------------------------------------------------

/**
 * Wraps an async Firebase operation so that:
 *   - `FirebaseError` is mapped to the appropriate `ApiError` variant.
 *   - Any other thrown value becomes an `unknownError`.
 *   - The method NEVER throws — it always returns `Result<T, ApiError>`.
 */
export async function fbGuard<T>(
  fn: () => Promise<T>,
): Promise<Result<T, ApiError>> {
  try {
    const value = await fn();
    return ok(value);
  } catch (thrown: unknown) {
    if (thrown instanceof FirebaseError) {
      return err(firebaseCodeToApiError(thrown.code, thrown.message));
    }
    if (thrown instanceof Error) {
      return err(unknownError(thrown.message, { name: thrown.name }));
    }
    return err(unknownError('An unexpected error occurred', { thrown }));
  }
}
