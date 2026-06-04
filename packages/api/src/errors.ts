import type { Result } from '@vroom/utils';

// ---------------------------------------------------------------------------
// ApiError — discriminated union by kind
// ---------------------------------------------------------------------------

export interface ApiErrorNetwork {
  readonly kind: 'network';
  readonly message: string;
  readonly details?: unknown;
}

export interface ApiErrorTimeout {
  readonly kind: 'timeout';
  readonly message: string;
  readonly details?: unknown;
}

export interface ApiErrorUnauthorized {
  readonly kind: 'unauthorized';
  readonly message: string;
  readonly details?: unknown;
}

export interface ApiErrorValidation {
  readonly kind: 'validation';
  readonly message: string;
  /** Field-level validation failures keyed by field path. */
  readonly details?: Record<string, string[]>;
}

export interface ApiErrorNotFound {
  readonly kind: 'not_found';
  readonly message: string;
  readonly details?: unknown;
}

export interface ApiErrorConflict {
  readonly kind: 'conflict';
  readonly message: string;
  readonly details?: unknown;
}

export interface ApiErrorServer {
  readonly kind: 'server';
  readonly message: string;
  readonly details?: unknown;
}

export interface ApiErrorUnknown {
  readonly kind: 'unknown';
  readonly message: string;
  readonly details?: unknown;
}

export type ApiError =
  | ApiErrorNetwork
  | ApiErrorTimeout
  | ApiErrorUnauthorized
  | ApiErrorValidation
  | ApiErrorNotFound
  | ApiErrorConflict
  | ApiErrorServer
  | ApiErrorUnknown;

// ---------------------------------------------------------------------------
// Helper constructors
// With exactOptionalPropertyTypes we must not set optional keys to undefined.
// Use conditional spread to omit the key when the value is absent.
// ---------------------------------------------------------------------------

export function networkError(message: string, details?: unknown): ApiErrorNetwork {
  return details !== undefined
    ? { kind: 'network', message, details }
    : { kind: 'network', message };
}

export function timeoutError(message: string, details?: unknown): ApiErrorTimeout {
  return details !== undefined
    ? { kind: 'timeout', message, details }
    : { kind: 'timeout', message };
}

export function unauthorizedError(message: string, details?: unknown): ApiErrorUnauthorized {
  return details !== undefined
    ? { kind: 'unauthorized', message, details }
    : { kind: 'unauthorized', message };
}

export function validationError(
  message: string,
  details?: Record<string, string[]>,
): ApiErrorValidation {
  return details !== undefined
    ? { kind: 'validation', message, details }
    : { kind: 'validation', message };
}

export function notFoundError(message: string, details?: unknown): ApiErrorNotFound {
  return details !== undefined
    ? { kind: 'not_found', message, details }
    : { kind: 'not_found', message };
}

export function conflictError(message: string, details?: unknown): ApiErrorConflict {
  return details !== undefined
    ? { kind: 'conflict', message, details }
    : { kind: 'conflict', message };
}

export function serverError(message: string, details?: unknown): ApiErrorServer {
  return details !== undefined
    ? { kind: 'server', message, details }
    : { kind: 'server', message };
}

export function unknownError(message: string, details?: unknown): ApiErrorUnknown {
  return details !== undefined
    ? { kind: 'unknown', message, details }
    : { kind: 'unknown', message };
}

// ---------------------------------------------------------------------------
// ApiResult convenience alias
// ---------------------------------------------------------------------------

/** Every API endpoint method returns this. */
export type ApiResult<T> = Promise<Result<T, ApiError>>;
