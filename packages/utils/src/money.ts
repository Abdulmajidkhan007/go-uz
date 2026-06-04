import type { Money, CurrencyCode } from '@vroom/types';

/**
 * How many minor units make up one major unit for each supported currency.
 * Mirrors CURRENCY_MINOR_UNITS in @vroom/constants — kept here to avoid a
 * circular dependency (utils -> constants -> types -> utils).
 */
const MINOR_UNITS: Readonly<Record<CurrencyCode, number>> = {
  UZS: 1,
  USD: 100,
  EUR: 100,
} as const;

// ---------------------------------------------------------------------------
// Money helpers — all operate on minor units
// ---------------------------------------------------------------------------

/**
 * Formats a Money value for display.
 *
 * Uses the standard `Intl.NumberFormat` API, which is available in all
 * ES2020+ environments (browser, Node, React Native's Hermes).
 *
 * @param money  - The value to format (amount in minor units).
 * @param locale - BCP-47 locale tag, e.g. "uz-UZ", "en-US".
 * @returns A locale-aware string such as "12 500 UZS" or "$125.00".
 */
export function formatMoney(money: Money, locale: string): string {
  const divisor = MINOR_UNITS[money.currency];
  const major = money.amount / divisor;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: money.currency,
    minimumFractionDigits: divisor === 1 ? 0 : 2,
    maximumFractionDigits: divisor === 1 ? 0 : 2,
  }).format(major);
}

/**
 * Adds two Money values.
 * Throws if the currencies do not match — mixing currencies is a logic error.
 */
export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(
      `Cannot add ${a.currency} and ${b.currency} — currencies must match`,
    );
  }
  return { amount: a.amount + b.amount, currency: a.currency };
}

/**
 * Multiplies a Money value by a scalar factor.
 * The result is floored to avoid fractional minor units.
 *
 * @param money  - The base amount in minor units.
 * @param factor - A multiplier, e.g. 1.5 for 150% or 0.9 for a 10% reduction.
 */
export function multiplyMoney(money: Money, factor: number): Money {
  return { amount: Math.floor(money.amount * factor), currency: money.currency };
}

/**
 * Applies a percentage discount or increase to a Money value.
 *
 * @param money      - The base amount in minor units.
 * @param percent    - Percentage to apply, e.g. 15 = 15%. May exceed 100.
 * @param mode       - 'discount' subtracts the percentage; 'increase' adds it.
 * @returns          - New Money with the result floored to whole minor units.
 */
export function applyPercent(
  money: Money,
  percent: number,
  mode: 'discount' | 'increase' = 'discount',
): Money {
  const delta = Math.floor((money.amount * percent) / 100);
  const amount = mode === 'discount' ? money.amount - delta : money.amount + delta;
  return { amount, currency: money.currency };
}

/**
 * Returns `true` when `a` is greater than `b`.
 * Throws if currencies differ.
 */
export function isGreaterThan(a: Money, b: Money): boolean {
  if (a.currency !== b.currency) {
    throw new Error(`Cannot compare ${a.currency} and ${b.currency}`);
  }
  return a.amount > b.amount;
}

/**
 * Constructs a zero-value Money for a given currency.
 */
export function zeroMoney(currency: CurrencyCode): Money {
  return { amount: 0, currency };
}
