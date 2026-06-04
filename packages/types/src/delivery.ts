import type { DeliveryId, UserId, PaymentId, Money, IsoDateTime } from './common.js';
import type { Address } from './address.js';
import type { Driver } from './vehicle.js';
import type { TimelineEntry } from './trip.js';

// ---------------------------------------------------------------------------
// Parcel
// ---------------------------------------------------------------------------

export type ParcelSizeClass = 's' | 'm' | 'l' | 'xl';

export interface Parcel {
  readonly sizeClass: ParcelSizeClass;
  readonly weightKg?: number;
  readonly fragile: boolean;
  readonly description: string;
}

// ---------------------------------------------------------------------------
// Proof of delivery
// ---------------------------------------------------------------------------

export interface ProofOfDelivery {
  readonly photoUrl?: string;
  readonly signatureUrl?: string;
  readonly note?: string;
  readonly at: IsoDateTime;
}

// ---------------------------------------------------------------------------
// DeliveryStatus — discriminated union
// ---------------------------------------------------------------------------

export type DeliveryStatusCreated = { readonly kind: 'created' };
export type DeliveryStatusCourierSearch = { readonly kind: 'courier_search' };

export interface DeliveryStatusCourierAssigned {
  readonly kind: 'courier_assigned';
  readonly courier: Driver;
}

export interface DeliveryStatusPickupEnroute {
  readonly kind: 'pickup_enroute';
  readonly courier: Driver;
}

export interface DeliveryStatusPickedUp {
  readonly kind: 'picked_up';
  readonly courier: Driver;
}

export interface DeliveryStatusDropoffEnroute {
  readonly kind: 'dropoff_enroute';
  readonly courier: Driver;
}

export interface DeliveryStatusDelivered {
  readonly kind: 'delivered';
  readonly courier: Driver;
}

export interface DeliveryStatusCancelled {
  readonly kind: 'cancelled';
  readonly reason: string;
}

export interface DeliveryStatusFailedDelivery {
  readonly kind: 'failed_delivery';
  readonly reason: string;
}

export interface DeliveryStatusReturning {
  readonly kind: 'returning';
  readonly courier: Driver;
}

export interface DeliveryStatusReturned {
  readonly kind: 'returned';
  readonly courier: Driver;
}

export type DeliveryStatus =
  | DeliveryStatusCreated
  | DeliveryStatusCourierSearch
  | DeliveryStatusCourierAssigned
  | DeliveryStatusPickupEnroute
  | DeliveryStatusPickedUp
  | DeliveryStatusDropoffEnroute
  | DeliveryStatusDelivered
  | DeliveryStatusCancelled
  | DeliveryStatusFailedDelivery
  | DeliveryStatusReturning
  | DeliveryStatusReturned;

// ---------------------------------------------------------------------------
// Delivery entity
// ---------------------------------------------------------------------------

export interface DeliveryRecipient {
  readonly name: string;
  readonly phone: string;
}

export interface Delivery {
  readonly id: DeliveryId;
  readonly senderId: UserId;
  readonly pickup: Address;
  readonly dropoff: Address;
  readonly recipient: DeliveryRecipient;
  readonly parcel: Parcel;
  readonly fare: Money;
  readonly status: DeliveryStatus;
  readonly proofOfDelivery?: ProofOfDelivery;
  readonly timeline: readonly TimelineEntry[];
  readonly paymentId?: PaymentId;
}
