import { z } from 'zod';
import { geoPointSchema } from './ride.js';
import { phoneSchema } from './auth.js';

// ---------------------------------------------------------------------------
// Address label — mirrors AddressLabel from @vroom/types without importing it
// ---------------------------------------------------------------------------

const ADDRESS_LABELS = ['home', 'work', 'custom'] as const;

// ---------------------------------------------------------------------------
// Save address
// ---------------------------------------------------------------------------

export const saveAddressSchema = z.object({
  label: z.enum(ADDRESS_LABELS),
  /** Human-readable single-line address string (e.g. returned by geocoder). */
  formatted: z
    .string()
    .trim()
    .min(1, 'Address is required')
    .max(256, 'Address must be 256 characters or fewer'),
  geo: geoPointSchema,
  notes: z
    .string()
    .trim()
    .max(140, 'Notes must be 140 characters or fewer')
    .optional(),
});

export type SaveAddressInput = z.infer<typeof saveAddressSchema>;

// ---------------------------------------------------------------------------
// Update profile
// ---------------------------------------------------------------------------

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, 'Display name is required')
    .max(80, 'Display name must be 80 characters or fewer')
    .optional(),
  email: z.email('Must be a valid email address').optional(),
  phone: phoneSchema.optional(),
  avatarUrl: z
    .string()
    .trim()
    .url('Must be a valid URL')
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
