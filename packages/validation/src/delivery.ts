import { z } from 'zod';
import { phoneSchema } from './auth.js';
import { geoPointSchema } from './ride.js';

// ---------------------------------------------------------------------------
// Parcel size classes — defined inline (not in constants) so this package
// stays in sync with @vroom/types ParcelSizeClass without importing types.
// The literal union matches ParcelSizeClass exactly.
// ---------------------------------------------------------------------------

const PARCEL_SIZE_CLASSES = ['s', 'm', 'l', 'xl'] as const;

export const parcelSchema = z.object({
  sizeClass: z.enum(PARCEL_SIZE_CLASSES),
  /** Gross weight in kilograms; must be a positive number when supplied. */
  weightKg: z.number().positive('Weight must be a positive number').optional(),
  fragile: z.boolean(),
  description: z.string().trim().min(1, 'Description is required'),
});

export type ParcelInput = z.infer<typeof parcelSchema>;

// ---------------------------------------------------------------------------
// Recipient
// ---------------------------------------------------------------------------

export const recipientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Recipient name is required')
    .max(80, 'Recipient name must be 80 characters or fewer'),
  phone: phoneSchema,
});

export type RecipientInput = z.infer<typeof recipientSchema>;

// ---------------------------------------------------------------------------
// Delivery quote
// ---------------------------------------------------------------------------

export const deliveryQuoteSchema = z.object({
  pickup: geoPointSchema,
  dropoff: geoPointSchema,
  parcel: parcelSchema,
});

export type DeliveryQuoteInput = z.infer<typeof deliveryQuoteSchema>;

// ---------------------------------------------------------------------------
// Create delivery
// ---------------------------------------------------------------------------

export const createDeliverySchema = z.object({
  /** The quote ID returned by the delivery-quote endpoint. */
  quoteId: z.string().min(1, 'quoteId is required'),
  recipient: recipientSchema,
  parcel: parcelSchema,
  paymentMethodId: z.string().min(1, 'paymentMethodId is required'),
  promoCode: z.string().trim().min(1).optional(),
});

export type CreateDeliveryInput = z.infer<typeof createDeliverySchema>;
