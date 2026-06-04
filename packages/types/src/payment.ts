import type {
  PaymentId,
  PaymentMethodId,
  UserId,
  OrderId,
  Money,
  IsoDateTime,
} from './common.js';

// ---------------------------------------------------------------------------
// Payment method
// ---------------------------------------------------------------------------

export interface PaymentMethod {
  readonly id: PaymentMethodId;
  readonly type: 'card' | 'wallet' | 'cash';
  /** Card network brand, e.g. "Visa", "Mastercard", "Humo". */
  readonly brand?: string;
  readonly last4?: string;
  readonly isDefault: boolean;
  /** Card expiry in "MM/YY" format; only present for card-type methods. */
  readonly expiry?: string;
}

// ---------------------------------------------------------------------------
// PaymentState — discriminated union
// ---------------------------------------------------------------------------

export type PaymentStatePending = { readonly kind: 'pending' };
export type PaymentStateAuthorized = { readonly kind: 'authorized' };
export type PaymentStateCaptured = { readonly kind: 'captured' };
export type PaymentStateSettled = { readonly kind: 'settled' };
export type PaymentStateRefundPending = { readonly kind: 'refund_pending' };
export type PaymentStateRefunded = { readonly kind: 'refunded' };

export interface PaymentStateFailed {
  readonly kind: 'failed';
  readonly failureReason: string;
}

export type PaymentState =
  | PaymentStatePending
  | PaymentStateAuthorized
  | PaymentStateCaptured
  | PaymentStateSettled
  | PaymentStateFailed
  | PaymentStateRefundPending
  | PaymentStateRefunded;

// ---------------------------------------------------------------------------
// Payment entity
// ---------------------------------------------------------------------------

export interface Payment {
  readonly id: PaymentId;
  readonly orderId: OrderId;
  readonly methodId: PaymentMethodId;
  readonly amount: Money;
  readonly state: PaymentState;
  readonly receiptUrl?: string;
}

// ---------------------------------------------------------------------------
// Wallet
// ---------------------------------------------------------------------------

export interface WalletTxn {
  readonly id: string;
  readonly amount: Money;
  readonly kind: 'topup' | 'charge' | 'refund';
  readonly at: IsoDateTime;
  readonly memo?: string;
}

export interface Wallet {
  readonly userId: UserId;
  readonly balance: Money;
  readonly transactions: readonly WalletTxn[];
}
