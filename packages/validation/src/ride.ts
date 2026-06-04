import { z } from 'zod';
import { VEHICLE_CLASSES } from '@vroom/constants';

// ---------------------------------------------------------------------------
// Shared geo primitive
// ---------------------------------------------------------------------------

export const geoPointSchema = z.object({
  lat: z
    .number()
    .gte(-90, 'Latitude must be between -90 and 90')
    .lte(90, 'Latitude must be between -90 and 90'),
  lng: z
    .number()
    .gte(-180, 'Longitude must be between -180 and 180')
    .lte(180, 'Longitude must be between -180 and 180'),
});

export type GeoPointInput = z.infer<typeof geoPointSchema>;

// ---------------------------------------------------------------------------
// Ride quote
// ---------------------------------------------------------------------------

export const rideQuoteSchema = z.object({
  pickup: geoPointSchema,
  dropoff: geoPointSchema,
  /** Zero or more intermediate stops, ordered. */
  stops: z.array(geoPointSchema).optional(),
  vehicleClass: z.enum(VEHICLE_CLASSES),
});

export type RideQuoteInput = z.infer<typeof rideQuoteSchema>;

// ---------------------------------------------------------------------------
// Request ride
// ---------------------------------------------------------------------------

export const requestRideSchema = z.object({
  /** The quote ID returned by the quote endpoint; must not be expired. */
  quoteId: z.string().min(1, 'quoteId is required'),
  paymentMethodId: z.string().min(1, 'paymentMethodId is required'),
  promoCode: z.string().trim().min(1).optional(),
});

export type RequestRideInput = z.infer<typeof requestRideSchema>;
