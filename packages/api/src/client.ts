import type { AuthApi } from './endpoints/auth.js';
import type { UserApi } from './endpoints/user.js';
import type { RideApi } from './endpoints/ride.js';
import type { DeliveryApi } from './endpoints/delivery.js';
import type { OrdersApi } from './endpoints/orders.js';
import type { PaymentsApi } from './endpoints/payments.js';
import type { PromosApi } from './endpoints/promos.js';
import type { SupportApi } from './endpoints/support.js';
import type { NotificationsApi } from './endpoints/notifications.js';
import type { GeoApi } from './endpoints/geo.js';
import { createMockClient } from './mock/mockClient.js';
import { createHttpClient } from './http/httpClient.js';

// ---------------------------------------------------------------------------
// ApiClient — the single interface apps depend on.
//
// Apps depend ONLY on this interface + the query hooks.
// Swapping mock->real touches only `createApiClient` config; no consumer
// changes required.
// ---------------------------------------------------------------------------

export interface ApiClient {
  readonly auth: AuthApi;
  readonly user: UserApi;
  readonly ride: RideApi;
  readonly delivery: DeliveryApi;
  readonly orders: OrdersApi;
  readonly payments: PaymentsApi;
  readonly promos: PromosApi;
  readonly support: SupportApi;
  readonly notifications: NotificationsApi;
  readonly geo: GeoApi;
}

// ---------------------------------------------------------------------------
// Factory config
// ---------------------------------------------------------------------------

export interface ApiClientConfig {
  readonly mode: 'mock' | 'http';
  /** Required when mode='http'. Ignored for 'mock'. */
  readonly baseUrl?: string;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createApiClient(cfg: ApiClientConfig): ApiClient {
  if (cfg.mode === 'mock') {
    return createMockClient();
  }
  return createHttpClient(cfg.baseUrl ?? '');
}
