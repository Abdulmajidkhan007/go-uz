import type {
  DeliveryQuoteReq,
  DeliveryQuoteRes,
  CreateDeliveryReq,
  CreateDeliveryRes,
  GetDeliveryReq,
  GetDeliveryRes,
  CancelDeliveryReq,
  CancelDeliveryRes,
} from '../contracts/delivery.js';
import type { ApiResult } from '../errors.js';

export interface DeliveryApi {
  getDeliveryQuote(req: DeliveryQuoteReq): ApiResult<DeliveryQuoteRes>;
  createDelivery(req: CreateDeliveryReq): ApiResult<CreateDeliveryRes>;
  getDelivery(req: GetDeliveryReq): ApiResult<GetDeliveryRes>;
  cancelDelivery(req: CancelDeliveryReq): ApiResult<CancelDeliveryRes>;
}
