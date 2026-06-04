import type {
  AutocompleteReq,
  AutocompleteRes,
  ReverseGeocodeReq,
  ReverseGeocodeRes,
} from '../contracts/geo.js';
import type { ApiResult } from '../errors.js';

export interface GeoApi {
  autocomplete(req: AutocompleteReq): ApiResult<AutocompleteRes>;
  reverseGeocode(req: ReverseGeocodeReq): ApiResult<ReverseGeocodeRes>;
}
