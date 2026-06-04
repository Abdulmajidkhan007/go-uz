import type { OrderId, UserId, IsoDateTime } from './common.js';

// ---------------------------------------------------------------------------
// Order kind & state
// ---------------------------------------------------------------------------

export type OrderKind = 'ride' | 'delivery';

export type OrderState =
  | 'draft'
  | 'quoted'
  | 'placed'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'failed';

// ---------------------------------------------------------------------------
// Entity
// ---------------------------------------------------------------------------

/**
 * Lightweight envelope that correlates a user action (ride or delivery) with
 * its domain entity. `refId` points to either a TripId or DeliveryId
 * depending on `kind`.
 */
export interface Order {
  readonly id: OrderId;
  readonly kind: OrderKind;
  /** Foreign key: TripId (kind='ride') or DeliveryId (kind='delivery'). */
  readonly refId: string;
  readonly state: OrderState;
  readonly userId: UserId;
  readonly createdAt: IsoDateTime;
}
