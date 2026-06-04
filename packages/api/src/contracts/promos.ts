import type { ServiceType, Money, Promo, PromoApplication } from '@vroom/types';

// ---------------------------------------------------------------------------
// Promos contracts
// ---------------------------------------------------------------------------

export interface ApplyPromoReq {
  readonly code: string;
  readonly serviceType: ServiceType;
  readonly amount: Money;
}

export type ApplyPromoRes = PromoApplication;

export interface ValidatePromoReq {
  readonly code: string;
}

export type ValidatePromoRes = Promo;
