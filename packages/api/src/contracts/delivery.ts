import type {
  GeoPoint,
  FareQuote,
  Delivery,
  DeliveryId,
  PaymentMethodId,
  Parcel,
  DeliveryRecipient,
} from '@vroom/types';

// ---------------------------------------------------------------------------
// Delivery contracts
// ---------------------------------------------------------------------------

export interface DeliveryQuoteReq {
  readonly pickup: GeoPoint;
  readonly dropoff: GeoPoint;
  readonly parcel: Pick<Parcel, 'sizeClass' | 'weightKg' | 'fragile'>;
}

export type DeliveryQuoteRes = FareQuote;

export interface CreateDeliveryReq {
  readonly quoteId: string;
  readonly recipient: DeliveryRecipient;
  readonly parcel: Parcel;
  readonly paymentMethodId: PaymentMethodId;
  readonly promoCode?: string;
}

export type CreateDeliveryRes = Delivery;

export interface GetDeliveryReq {
  readonly deliveryId: DeliveryId;
}

export type GetDeliveryRes = Delivery;

export interface CancelDeliveryReq {
  readonly deliveryId: DeliveryId;
  readonly reason: string;
}

export type CancelDeliveryRes = Delivery;
