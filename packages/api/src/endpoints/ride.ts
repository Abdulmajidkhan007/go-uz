import type {
  RideQuoteReq,
  RideQuoteRes,
  RequestRideReq,
  RequestRideRes,
  GetTripReq,
  GetTripRes,
  CancelTripReq,
  CancelTripRes,
} from '../contracts/ride.js';
import type { ApiResult } from '../errors.js';

export interface RideApi {
  getRideQuote(req: RideQuoteReq): ApiResult<RideQuoteRes>;
  requestRide(req: RequestRideReq): ApiResult<RequestRideRes>;
  getTrip(req: GetTripReq): ApiResult<GetTripRes>;
  cancelTrip(req: CancelTripReq): ApiResult<CancelTripRes>;
}
