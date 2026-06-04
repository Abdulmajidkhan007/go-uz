import type { UserId, PaymentMethodId, IsoDateTime } from './common.js';

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

export type UserStatus = 'active' | 'suspended' | 'pending_verification';

// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------

export interface User {
  readonly id: UserId;
  /** E.164 formatted phone number, e.g. "+998901234567". */
  readonly phone: string;
  readonly email?: string;
  readonly displayName: string;
  readonly avatarUrl?: string;
  /** The role the user primarily operates as in this session. */
  readonly role: 'rider' | 'courier-customer';
  readonly defaultPaymentMethodId?: PaymentMethodId;
  readonly createdAt: IsoDateTime;
  readonly status: UserStatus;
}

export interface Session {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly userId: UserId;
  readonly expiresAt: IsoDateTime;
}
