import type { NotificationId, UserId, IsoDateTime } from './common.js';

// ---------------------------------------------------------------------------
// Notification type
// ---------------------------------------------------------------------------

export type NotificationType =
  | 'trip_update'
  | 'delivery_update'
  | 'promo'
  | 'payment'
  | 'support'
  | 'system';

// ---------------------------------------------------------------------------
// Entity
// ---------------------------------------------------------------------------

export interface Notification {
  readonly id: NotificationId;
  readonly userId: UserId;
  readonly type: NotificationType;
  readonly title: string;
  readonly body: string;
  /** Arbitrary key-value payload for deep-link routing or display logic. */
  readonly data?: Record<string, unknown>;
  /** Set when the user has read the notification; absent otherwise. */
  readonly readAt?: IsoDateTime;
  readonly createdAt: IsoDateTime;
}
