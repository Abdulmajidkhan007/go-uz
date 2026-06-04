import type { PromoId, Money, IsoDateTime } from './common.js';
import type { ServiceType } from './fare.js';

// ---------------------------------------------------------------------------
// Promo status
// ---------------------------------------------------------------------------

export type PromoStatus = 'active' | 'expired' | 'exhausted' | 'revoked';

// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------

export interface Promo {
  readonly id: PromoId;
  readonly code: string;
  readonly kind: 'percent' | 'fixed';
  /**
   * For `kind='percent'`: a value between 0 and 100 (e.g. 15 = 15% off).
   * For `kind='fixed'`: an amount in minor units using the checkout currency.
   */
  readonly value: number;
  readonly validFrom: IsoDateTime;
  readonly validTo: IsoDateTime;
  /** Minimum order spend required to apply this promo (minor units). */
  readonly minSpend?: Money;
  readonly appliesTo: readonly ServiceType[];
  readonly status: PromoStatus;
}

/** The result of applying a promo code to a cart or quote. */
export interface PromoApplication {
  readonly promoId: PromoId;
  /** Computed discount in minor units. */
  readonly discount: Money;
  /** Order total after the discount. */
  readonly finalAmount: Money;
}
