import type {
  ListNotificationsReq,
  ListNotificationsRes,
  MarkReadReq,
  MarkReadRes,
} from '../contracts/notifications.js';
import type { ApiResult } from '../errors.js';

export interface NotificationsApi {
  listNotifications(req: ListNotificationsReq): ApiResult<ListNotificationsRes>;
  markRead(req: MarkReadReq): ApiResult<MarkReadRes>;
}
