import type { ListOrdersReq, ListOrdersRes } from '../contracts/orders.js';
import type { ApiResult } from '../errors.js';

export interface OrdersApi {
  listOrders(req: ListOrdersReq): ApiResult<ListOrdersRes>;
}
