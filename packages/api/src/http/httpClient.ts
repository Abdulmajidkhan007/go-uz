/**
 * Typed fetch-based HTTP client stub.
 *
 * All methods are fully typed to the ApiClient interface.
 * Each method body calls the shared `request<T>()` helper which handles:
 *   - timeout (10 s default)
 *   - non-2xx → ApiError mapping
 *   - JSON parsing to the contract types
 *
 * Method bodies call `notImplemented()` which throws a 'not implemented' error.
 * When a real backend exists, replace `notImplemented()` calls with the actual
 * `request<T>(...)` invocations — no consumer code changes required.
 */
import { ok, err } from '@vroom/utils';
import type { ApiClient } from '../client.js';
import type { ApiError, ApiResult } from '../errors.js';
import {
  networkError,
  timeoutError,
  unauthorizedError,
  validationError,
  notFoundError,
  conflictError,
  serverError,
  unknownError,
} from '../errors.js';

// ---------------------------------------------------------------------------
// Shared request helper
// ---------------------------------------------------------------------------

const DEFAULT_TIMEOUT_MS = 10_000;

interface RequestOptions {
  readonly method?: string;
  readonly body?: unknown;
  readonly timeoutMs?: number;
  readonly headers?: Record<string, string>;
}

async function request<T>(
  url: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, timeoutMs = DEFAULT_TIMEOUT_MS, headers = {} } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    const bodyStr = body !== undefined ? JSON.stringify(body) : null;
    const fetchInit: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...headers,
      },
      signal: controller.signal,
    };
    if (bodyStr !== null) {
      fetchInit.body = bodyStr;
    }
    response = await fetch(url, fetchInit);
  } catch (e: unknown) {
    clearTimeout(timer);
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw timeoutError(`Request to ${url} timed out after ${timeoutMs}ms`);
    }
    throw networkError(
      e instanceof Error ? e.message : 'Network request failed',
      e,
    );
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      // ignore parse error; payload stays null
    }
    throw mapHttpError(response.status, payload);
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json() as Promise<T>;
}

function mapHttpError(status: number, payload: unknown): ApiError {
  if (status === 401) {
    return unauthorizedError('Unauthorized', payload);
  }
  if (status === 404) {
    return notFoundError('Resource not found', payload);
  }
  if (status === 409) {
    return conflictError('Conflict', payload);
  }
  if (status === 422 || status === 400) {
    const details =
      typeof payload === 'object' && payload !== null && 'errors' in payload
        ? (payload as Record<string, Record<string, string[]>>)['errors']
        : undefined;
    return validationError('Validation failed', details as Record<string, string[]> | undefined);
  }
  if (status >= 500) {
    return serverError(`Server error ${status}`, payload);
  }
  return unknownError(`Unexpected status ${status}`, payload);
}

// ---------------------------------------------------------------------------
// Typed request wrapper that returns ApiResult<T>
// ---------------------------------------------------------------------------

async function apiRequest<T>(
  url: string,
  options?: RequestOptions,
): ApiResult<T> {
  try {
    const data = await request<T>(url, options);
    return ok(data);
  } catch (e: unknown) {
    if (
      typeof e === 'object' &&
      e !== null &&
      'kind' in e &&
      typeof (e as Record<string, unknown>)['kind'] === 'string'
    ) {
      return err(e as ApiError);
    }
    return err(unknownError(e instanceof Error ? e.message : 'Unknown error', e));
  }
}

// ---------------------------------------------------------------------------
// Not-implemented sentinel
// ---------------------------------------------------------------------------

function notImplemented(method: string): never {
  throw new Error(`HTTP client method not implemented: ${method}`);
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createHttpClient(baseUrl: string): ApiClient {
  const url = (path: string) => `${baseUrl}${path}`;

  return {
    auth: {
      requestOtp(req) {
        return apiRequest(url('/auth/otp/request'), { method: 'POST', body: req });
      },
      verifyOtp(req) {
        return apiRequest(url('/auth/otp/verify'), { method: 'POST', body: req });
      },
      refresh(req) {
        return apiRequest(url('/auth/refresh'), { method: 'POST', body: req });
      },
      signOut() {
        return apiRequest(url('/auth/sign-out'), { method: 'POST' });
      },
    },

    user: {
      getMe() {
        return apiRequest(url('/me'));
      },
      listAddresses() {
        return apiRequest(url('/addresses'));
      },
      saveAddress(req) {
        return apiRequest(url('/addresses'), { method: 'POST', body: req });
      },
      deleteAddress(id) {
        return apiRequest(url(`/addresses/${id}`), { method: 'DELETE' });
      },
    },

    ride: {
      getRideQuote(req) {
        return apiRequest(url('/rides/quote'), { method: 'POST', body: req });
      },
      requestRide(req) {
        return apiRequest(url('/rides'), { method: 'POST', body: req });
      },
      getTrip(req) {
        return apiRequest(url(`/rides/${req.tripId}`));
      },
      cancelTrip(req) {
        return apiRequest(url(`/rides/${req.tripId}/cancel`), { method: 'POST', body: { reason: req.reason } });
      },
    },

    delivery: {
      getDeliveryQuote(req) {
        return apiRequest(url('/deliveries/quote'), { method: 'POST', body: req });
      },
      createDelivery(req) {
        return apiRequest(url('/deliveries'), { method: 'POST', body: req });
      },
      getDelivery(req) {
        return apiRequest(url(`/deliveries/${req.deliveryId}`));
      },
      cancelDelivery(req) {
        return apiRequest(url(`/deliveries/${req.deliveryId}/cancel`), { method: 'POST', body: { reason: req.reason } });
      },
    },

    orders: {
      listOrders(req) {
        const params = new URLSearchParams();
        if (req.kind !== undefined) params.set('kind', req.kind);
        if (req.cursor !== undefined) params.set('cursor', req.cursor);
        const qs = params.toString();
        return apiRequest(url(`/orders${qs ? `?${qs}` : ''}`));
      },
    },

    payments: {
      listPaymentMethods() {
        return apiRequest(url('/payment-methods'));
      },
      addPaymentMethod(req) {
        return apiRequest(url('/payment-methods'), { method: 'POST', body: req });
      },
      deletePaymentMethod(id) {
        return apiRequest(url(`/payment-methods/${id}`), { method: 'DELETE' });
      },
      getPayment(req) {
        return apiRequest(url(`/payments/${req.paymentId}`));
      },
      getWallet() {
        return apiRequest(url('/wallet'));
      },
    },

    promos: {
      applyPromo(req) {
        return apiRequest(url('/promos/apply'), { method: 'POST', body: req });
      },
      validatePromo(req) {
        return apiRequest(url(`/promos/${req.code}`));
      },
    },

    support: {
      listTickets() {
        return apiRequest(url('/support/tickets'));
      },
      createTicket(req) {
        return apiRequest(url('/support/tickets'), { method: 'POST', body: req });
      },
      postMessage(req) {
        const { ticketId, ...body } = req;
        return apiRequest(url(`/support/tickets/${ticketId}/messages`), { method: 'POST', body });
      },
    },

    notifications: {
      listNotifications(req) {
        const params = new URLSearchParams();
        if (req.cursor !== undefined) params.set('cursor', req.cursor);
        const qs = params.toString();
        return apiRequest(url(`/notifications${qs ? `?${qs}` : ''}`));
      },
      markRead(req) {
        return apiRequest(url('/notifications/mark-read'), { method: 'POST', body: req });
      },
    },

    geo: {
      autocomplete(req) {
        const params = new URLSearchParams({ q: req.query });
        if (req.near !== undefined) {
          params.set('lat', String(req.near.lat));
          params.set('lng', String(req.near.lng));
        }
        return apiRequest(url(`/geo/autocomplete?${params.toString()}`));
      },
      reverseGeocode(req) {
        const params = new URLSearchParams({
          lat: String(req.point.lat),
          lng: String(req.point.lng),
        });
        return apiRequest(url(`/geo/reverse?${params.toString()}`));
      },
    },
  };

  // Silence unused variable warning — notImplemented is retained for future use
  void notImplemented;
}
