import { z } from 'zod';

// ---------------------------------------------------------------------------
// Phone
// ---------------------------------------------------------------------------

/**
 * Lenient E.164-ish schema for Uzbekistan numbers.
 * Accepts:
 *   +998XXXXXXXXX  (13 chars, E.164 canonical)
 *   998XXXXXXXXX   (12 chars, without leading +)
 *   0XXXXXXXXX     (10 chars, local format)
 * The server normalises to E.164 before storage.
 */
export const phoneSchema = z
  .string()
  .trim()
  .regex(
    /^(\+998|998|0)\d{9}$/,
    'Phone must be a valid Uzbekistan number (e.g. +998901234567)',
  );

export type PhoneInput = z.infer<typeof phoneSchema>;

// ---------------------------------------------------------------------------
// Auth flows
// ---------------------------------------------------------------------------

export const requestOtpSchema = z.object({
  phone: phoneSchema,
});

export type RequestOtpInput = z.infer<typeof requestOtpSchema>;

export const verifyOtpSchema = z.object({
  /** The opaque challenge ID returned by the requestOtp endpoint. */
  challengeId: z.string().min(1, 'challengeId is required'),
  /** Exactly 6 decimal digits. */
  code: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits'),
});

export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

export const profileSetupSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, 'Display name is required')
    .max(80, 'Display name must be 80 characters or fewer'),
  email: z.email('Must be a valid email address').optional(),
});

export type ProfileSetupInput = z.infer<typeof profileSetupSchema>;
