import type { User, Address, AddressLabel } from '@vroom/types';

// ---------------------------------------------------------------------------
// User contracts
// ---------------------------------------------------------------------------

/** GET /me — response is User directly */
export type GetMeRes = User;

/** GET /addresses */
export interface ListAddressesRes {
  readonly addresses: readonly Address[];
}

/** POST /addresses — body */
export interface SaveAddressReq {
  readonly label: AddressLabel;
  readonly formatted: string;
  readonly geo: { readonly lat: number; readonly lng: number };
  readonly placeId?: string;
  readonly notes?: string;
}

/** POST /addresses — response */
export type SaveAddressRes = Address;

/** DELETE /addresses/:id — response */
export interface DeleteAddressRes {
  readonly deleted: boolean;
}
