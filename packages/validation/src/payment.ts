import { z } from 'zod';
import { SERVICE_TYPES } from '@vroom/constants';

// ---------------------------------------------------------------------------
// Luhn-lenient card number
// ---------------------------------------------------------------------------

/**
 * Accepts 13–19 digit card numbers (spaces and dashes stripped before check).
 * "Luhn-lenient" means we validate length and digit-only format; full Luhn
 * algorithm is enforced server-side to avoid false rejections on test cards.
 */
const cardNumberSchema = z
  .string()
  .trim()
  .transform((val) => val.replace(/[\s-]/g, ''))
  .pipe(
    z
      .string()
      .regex(/^\d{13,19}$/, 'Card number must be 13–19 digits'),
  );

// ---------------------------------------------------------------------------
// Expiry — MM/YY
// ---------------------------------------------------------------------------

const cardExpirySchema = z
  .string()
  .trim()
  .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Expiry must be in MM/YY format');

// ---------------------------------------------------------------------------
// CVC
// ---------------------------------------------------------------------------

const cvcSchema = z
  .string()
  .trim()
  .regex(/^\d{3,4}$/, 'CVC must be 3 or 4 digits');

// ---------------------------------------------------------------------------
// Add card
// ---------------------------------------------------------------------------

export const addCardSchema = z.object({
  number: cardNumberSchema,
  expiry: cardExpirySchema,
  cvc: cvcSchema,
  holderName: z
    .string()
    .trim()
    .min(2, 'Cardholder name must be at least 2 characters')
    .max(64, 'Cardholder name must be 64 characters or fewer'),
});

export type AddCardInput = z.infer<typeof addCardSchema>;

// ---------------------------------------------------------------------------
// Apply promo code
// ---------------------------------------------------------------------------

export const applyPromoSchema = z.object({
  /** The promo/voucher code string entered by the user. */
  code: z
    .string()
    .trim()
    .min(1, 'Promo code is required')
    .max(32, 'Promo code must be 32 characters or fewer')
    .regex(/^[A-Z0-9_-]+$/i, 'Promo code contains invalid characters'),
  /** The service the promo is being applied to. */
  serviceType: z.enum(SERVICE_TYPES),
  /** Order subtotal in minor units (used for server-side discount calculation). */
  amount: z
    .number()
    .int('Amount must be a whole number of minor units')
    .nonnegative('Amount must be zero or positive'),
});

export type ApplyPromoInput = z.infer<typeof applyPromoSchema>;
