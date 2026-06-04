import type { AddressId } from '@vroom/types';
import type {
  GetMeRes,
  ListAddressesRes,
  SaveAddressReq,
  SaveAddressRes,
  DeleteAddressRes,
} from '../contracts/user.js';
import type { ApiResult } from '../errors.js';

export interface UserApi {
  getMe(): ApiResult<GetMeRes>;
  listAddresses(): ApiResult<ListAddressesRes>;
  saveAddress(req: SaveAddressReq): ApiResult<SaveAddressRes>;
  deleteAddress(id: AddressId): ApiResult<DeleteAddressRes>;
}
