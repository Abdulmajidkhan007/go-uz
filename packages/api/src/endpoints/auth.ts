import type {
  RequestOtpReq,
  RequestOtpRes,
  VerifyOtpReq,
  VerifyOtpRes,
  RefreshReq,
  RefreshRes,
} from '../contracts/auth.js';
import type { ApiResult } from '../errors.js';

export interface AuthApi {
  requestOtp(req: RequestOtpReq): ApiResult<RequestOtpRes>;
  verifyOtp(req: VerifyOtpReq): ApiResult<VerifyOtpRes>;
  refresh(req: RefreshReq): ApiResult<RefreshRes>;
  signOut(): ApiResult<void>;
}
