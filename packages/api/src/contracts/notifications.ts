import type { Notification, NotificationId, Paginated } from '@vroom/types';

// ---------------------------------------------------------------------------
// Notifications contracts
// ---------------------------------------------------------------------------

export interface ListNotificationsReq {
  readonly cursor?: string;
}

export type ListNotificationsRes = Paginated<Notification>;

export interface MarkReadReq {
  readonly ids: readonly NotificationId[];
}

export interface MarkReadRes {
  readonly updated: number;
}
