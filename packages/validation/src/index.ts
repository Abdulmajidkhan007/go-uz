// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export {
  phoneSchema,
  requestOtpSchema,
  verifyOtpSchema,
  profileSetupSchema,
} from './auth.js';
export type {
  PhoneInput,
  RequestOtpInput,
  VerifyOtpInput,
  ProfileSetupInput,
} from './auth.js';

// ---------------------------------------------------------------------------
// Ride
// ---------------------------------------------------------------------------
export {
  geoPointSchema,
  rideQuoteSchema,
  requestRideSchema,
} from './ride.js';
export type {
  GeoPointInput,
  RideQuoteInput,
  RequestRideInput,
} from './ride.js';

// ---------------------------------------------------------------------------
// Delivery
// ---------------------------------------------------------------------------
export {
  parcelSchema,
  recipientSchema,
  deliveryQuoteSchema,
  createDeliverySchema,
} from './delivery.js';
export type {
  ParcelInput,
  RecipientInput,
  DeliveryQuoteInput,
  CreateDeliveryInput,
} from './delivery.js';

// ---------------------------------------------------------------------------
// Payment
// ---------------------------------------------------------------------------
export {
  addCardSchema,
  applyPromoSchema,
} from './payment.js';
export type {
  AddCardInput,
  ApplyPromoInput,
} from './payment.js';

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------
export {
  saveAddressSchema,
  updateProfileSchema,
} from './profile.js';
export type {
  SaveAddressInput,
  UpdateProfileInput,
} from './profile.js';

// ---------------------------------------------------------------------------
// Support
// ---------------------------------------------------------------------------
export {
  createTicketSchema,
  postMessageSchema,
} from './support.js';
export type {
  CreateTicketInput,
  PostMessageInput,
} from './support.js';
