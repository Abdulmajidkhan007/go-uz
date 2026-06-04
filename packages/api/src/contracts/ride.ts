import type { GeoPoint, VehicleClass, FareQuote, Trip, TripId, PaymentMethodId } from '@vroom/types';

// ---------------------------------------------------------------------------
// Ride contracts
// ---------------------------------------------------------------------------

export interface RideQuoteReq {
  readonly pickup: GeoPoint;
  readonly dropoff: GeoPoint;
  readonly vehicleClass: VehicleClass;
}

export type RideQuoteRes = FareQuote;

export interface RequestRideReq {
  readonly quoteId: string;
  readonly paymentMethodId: PaymentMethodId;
  readonly promoCode?: string;
}

export type RequestRideRes = Trip;

export interface GetTripReq {
  readonly tripId: TripId;
}

export type GetTripRes = Trip;

export interface CancelTripReq {
  readonly tripId: TripId;
  readonly reason: string;
}

export type CancelTripRes = Trip;
