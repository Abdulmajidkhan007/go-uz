import type { PaymentMethod, Payment, PaymentId, Wallet } from '@vroom/types';

// ---------------------------------------------------------------------------
// Payments contracts
// ---------------------------------------------------------------------------

/** GET /payment-methods */
export type ListPaymentMethodsRes = readonly PaymentMethod[];

/** POST /payment-methods */
export interface AddPaymentMethodReq {
  readonly type: 'card' | 'wallet' | 'cash';
  readonly brand?: string;
  readonly last4?: string;
  readonly expiry?: string;
  /** Card tokenization token from payment provider. */
  readonly token?: string;
}

export type AddPaymentMethodRes = PaymentMethod;

/** DELETE /payment-methods/:id */
export interface DeletePaymentMethodRes {
  readonly deleted: boolean;
}

/** GET /payments/:id */
export interface GetPaymentReq {
  readonly paymentId: PaymentId;
}

export type GetPaymentRes = Payment;

/** GET /wallet */
export type GetWalletRes = Wallet;
