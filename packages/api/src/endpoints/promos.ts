import type {
  ApplyPromoReq,
  ApplyPromoRes,
  ValidatePromoReq,
  ValidatePromoRes,
} from '../contracts/promos.js';
import type { ApiResult } from '../errors.js';

export interface PromosApi {
  applyPromo(req: ApplyPromoReq): ApiResult<ApplyPromoRes>;
  validatePromo(req: ValidatePromoReq): ApiResult<ValidatePromoRes>;
}
