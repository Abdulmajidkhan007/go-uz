import type { CurrencyCode } from '@vroom/types';

// ---------------------------------------------------------------------------
// Currency
// ---------------------------------------------------------------------------

/** All currencies the platform accepts. */
export const SUPPORTED_CURRENCIES = ['UZS', 'USD', 'EUR'] as const satisfies readonly CurrencyCode[];

/** The platform's default settlement currency. */
export const DEFAULT_CURRENCY: CurrencyCode = 'UZS';

/** Minor-unit multipliers: how many minor units make one major unit. */
export const CURRENCY_MINOR_UNITS: Readonly<Record<CurrencyCode, number>> = {
  UZS: 1,   // Uzbekistani sum has no widely-used sub-unit; 1 UZS = 1 tiyin but tiyin is not in circulation
  USD: 100,  // cents
  EUR: 100,  // euro cents
} as const;
