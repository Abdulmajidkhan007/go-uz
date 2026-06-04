/**
 * Pure conversion functions between Firestore document data and domain entities.
 *
 * Rules:
 * - Every mapper receives a plain `Record<string, unknown>` (DocumentData) so
 *   the caller doesn't have to cast.
 * - Firestore `Timestamp` values are converted to IsoDateTime strings.
 * - Brand casts (`as UserId`, etc.) happen here — never in the calling code.
 * - Optional fields are only set when the source value is present, satisfying
 *   `exactOptionalPropertyTypes`.
 * - Collection name constants live here to keep them in one place.
 */
import { Timestamp } from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import type {
  UserId,
  AddressId,
  TripId,
  DeliveryId,
  OrderId,
  PaymentId,
  PaymentMethodId,
  PromoId,
  TicketId,
  NotificationId,
  VehicleId,
  DriverId,
  QuoteId,
  IsoDateTime,
  User,
  Address,
  Trip,
  TripStatus,
  Delivery,
  DeliveryStatus,
  Order,
  Payment,
  PaymentState,
  PaymentMethod,
  Promo,
  PromoStatus,
  SupportTicket,
  TicketStatus,
  TicketCategory,
  TicketMessage,
  Notification,
  NotificationType,
  Wallet,
  WalletTxn,
  FareQuote,
  TimelineEntry,
  GeoPoint,
  Money,
  CurrencyCode,
  VehicleClass,
  OrderKind,
  OrderState,
  Driver,
  Vehicle,
  ParcelSizeClass,
  AddressLabel,
  UserStatus,
} from '@vroom/types';

// ---------------------------------------------------------------------------
// Collection names — single source of truth
// ---------------------------------------------------------------------------

export const COLLECTIONS = {
  users: 'users',
  trips: 'trips',
  deliveries: 'deliveries',
  orders: 'orders',
  payments: 'payments',
  quotes: 'quotes',
  promos: 'promos',
  tickets: 'tickets',
  notifications: 'notifications',
  places: 'places',
  // Subcollections (used as path segments)
  addresses: 'addresses',
  paymentMethods: 'paymentMethods',
  wallet: 'wallet',
} as const;

// ---------------------------------------------------------------------------
// Timestamp <-> IsoDateTime
// ---------------------------------------------------------------------------

export function tsToIso(value: unknown): IsoDateTime {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString() as IsoDateTime;
  }
  if (typeof value === 'string') return value as IsoDateTime;
  return new Date().toISOString() as IsoDateTime;
}

export function isoToTs(iso: IsoDateTime): Timestamp {
  return Timestamp.fromDate(new Date(iso));
}

// ---------------------------------------------------------------------------
// Primitive helpers
// ---------------------------------------------------------------------------

function asString(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}

function asNumber(v: unknown, fallback = 0): number {
  return typeof v === 'number' ? v : fallback;
}

function asBoolean(v: unknown, fallback = false): boolean {
  return typeof v === 'boolean' ? v : fallback;
}

function asGeoPoint(v: unknown): GeoPoint {
  if (v !== null && typeof v === 'object') {
    const obj = v as Record<string, unknown>;
    return { lat: asNumber(obj['lat']), lng: asNumber(obj['lng']) };
  }
  return { lat: 0, lng: 0 };
}

function asMoney(v: unknown): Money {
  if (v !== null && typeof v === 'object') {
    const obj = v as Record<string, unknown>;
    return {
      amount: asNumber(obj['amount']),
      currency: asString(obj['currency'], 'UZS') as CurrencyCode,
    };
  }
  return { amount: 0, currency: 'UZS' };
}

function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

// ---------------------------------------------------------------------------
// User mapper
// ---------------------------------------------------------------------------

export function docToUser(id: string, data: DocumentData): User {
  const base: User = {
    id: id as UserId,
    phone: asString(data['phone']),
    displayName: asString(data['displayName'], 'User'),
    role: (data['role'] === 'courier-customer' ? 'courier-customer' : 'rider') as
      | 'rider'
      | 'courier-customer',
    createdAt: tsToIso(data['createdAt']),
    status: asString(data['status'], 'active') as UserStatus,
  };
  return {
    ...base,
    ...(typeof data['email'] === 'string' ? { email: data['email'] } : {}),
    ...(typeof data['avatarUrl'] === 'string' ? { avatarUrl: data['avatarUrl'] } : {}),
    ...(typeof data['defaultPaymentMethodId'] === 'string'
      ? { defaultPaymentMethodId: data['defaultPaymentMethodId'] as PaymentMethodId }
      : {}),
  };
}

// ---------------------------------------------------------------------------
// Address mapper
// ---------------------------------------------------------------------------

export function docToAddress(id: string, userId: string, data: DocumentData): Address {
  const base: Address = {
    id: id as AddressId,
    userId: userId as UserId,
    label: asString(data['label'], 'custom') as AddressLabel,
    formatted: asString(data['formatted']),
    geo: asGeoPoint(data['geo']),
  };
  return {
    ...base,
    ...(typeof data['placeId'] === 'string' ? { placeId: data['placeId'] } : {}),
    ...(typeof data['notes'] === 'string' ? { notes: data['notes'] } : {}),
  };
}

export function addressToDoc(userId: string, address: Omit<Address, 'id' | 'userId'>): DocumentData {
  const base: DocumentData = {
    userId,
    label: address.label,
    formatted: address.formatted,
    geo: address.geo,
  };
  return {
    ...base,
    ...(address.placeId !== undefined ? { placeId: address.placeId } : {}),
    ...(address.notes !== undefined ? { notes: address.notes } : {}),
  };
}

// ---------------------------------------------------------------------------
// Driver / Vehicle helpers (for embedded objects)
// ---------------------------------------------------------------------------

function asDriver(v: unknown): Driver {
  const obj = (v !== null && typeof v === 'object' ? v : {}) as Record<string, unknown>;
  const base: Driver = {
    id: asString(obj['id']) as DriverId,
    displayName: asString(obj['displayName'], 'Driver'),
    rating: asNumber(obj['rating'], 4.8),
    vehicleId: asString(obj['vehicleId']) as VehicleId,
    phoneMasked: asString(obj['phoneMasked'], '+998 ** *** 00'),
  };
  return {
    ...base,
    ...(typeof obj['avatarUrl'] === 'string' ? { avatarUrl: obj['avatarUrl'] } : {}),
  };
}

function asVehicle(v: unknown): Vehicle {
  const obj = (v !== null && typeof v === 'object' ? v : {}) as Record<string, unknown>;
  const base: Vehicle = {
    id: asString(obj['id']) as VehicleId,
    class: asString(obj['class'], 'economy') as VehicleClass,
    plate: asString(obj['plate']),
    model: asString(obj['model'], 'Vehicle'),
    color: asString(obj['color'], 'white'),
    capacity: asNumber(obj['capacity'], 4),
  };
  return {
    ...base,
    ...(typeof obj['etaMinutes'] === 'number' ? { etaMinutes: obj['etaMinutes'] } : {}),
  };
}

// ---------------------------------------------------------------------------
// Trip mapper
// ---------------------------------------------------------------------------

function asTripStatus(v: unknown): TripStatus {
  const obj = (v !== null && typeof v === 'object' ? v : {}) as Record<string, unknown>;
  const kind = asString(obj['kind'], 'requested');
  switch (kind) {
    case 'requested': return { kind: 'requested' };
    case 'matching': return { kind: 'matching' };
    case 'no_drivers': return { kind: 'no_drivers' };
    case 'driver_assigned':
      return { kind: 'driver_assigned', driver: asDriver(obj['driver']), vehicle: asVehicle(obj['vehicle']) };
    case 'arriving':
      return { kind: 'arriving', driver: asDriver(obj['driver']), vehicle: asVehicle(obj['vehicle']) };
    case 'in_progress':
      return { kind: 'in_progress', driver: asDriver(obj['driver']), vehicle: asVehicle(obj['vehicle']) };
    case 'completed': return { kind: 'completed' };
    case 'cancelled':
      return {
        kind: 'cancelled',
        cancelledBy: asString(obj['cancelledBy'], 'system') as 'rider' | 'driver' | 'system',
        reason: asString(obj['reason']),
      };
    default: return { kind: 'requested' };
  }
}

function asTimeline(v: unknown): readonly TimelineEntry[] {
  return asArray(v).map((entry) => {
    const obj = (entry !== null && typeof entry === 'object' ? entry : {}) as Record<string, unknown>;
    return { status: asString(obj['status']), at: tsToIso(obj['at']) };
  });
}

export function docToTrip(id: string, data: DocumentData): Trip {
  const base: Trip = {
    id: id as TripId,
    riderId: asString(data['riderId']) as UserId,
    pickup: asGeoPoint(data['pickup']),
    dropoff: asGeoPoint(data['dropoff']),
    fare: asMoney(data['fare']),
    status: asTripStatus(data['status']),
    timeline: asTimeline(data['timeline']),
    createdAt: tsToIso(data['createdAt']),
  };
  return {
    ...base,
    ...(Array.isArray(data['stops']) ? { stops: (data['stops'] as unknown[]).map(asGeoPoint) } : {}),
    ...(Array.isArray(data['route']) ? { route: (data['route'] as unknown[]).map(asGeoPoint) } : {}),
    ...(typeof data['paymentId'] === 'string' ? { paymentId: data['paymentId'] as PaymentId } : {}),
  };
}

// ---------------------------------------------------------------------------
// Delivery mapper
// ---------------------------------------------------------------------------

function asDeliveryStatus(v: unknown): DeliveryStatus {
  const obj = (v !== null && typeof v === 'object' ? v : {}) as Record<string, unknown>;
  const kind = asString(obj['kind'], 'created');
  switch (kind) {
    case 'created': return { kind: 'created' };
    case 'courier_search': return { kind: 'courier_search' };
    case 'courier_assigned': return { kind: 'courier_assigned', courier: asDriver(obj['courier']) };
    case 'pickup_enroute': return { kind: 'pickup_enroute', courier: asDriver(obj['courier']) };
    case 'picked_up': return { kind: 'picked_up', courier: asDriver(obj['courier']) };
    case 'dropoff_enroute': return { kind: 'dropoff_enroute', courier: asDriver(obj['courier']) };
    case 'delivered': return { kind: 'delivered', courier: asDriver(obj['courier']) };
    case 'cancelled': return { kind: 'cancelled', reason: asString(obj['reason']) };
    case 'failed_delivery': return { kind: 'failed_delivery', reason: asString(obj['reason']) };
    case 'returning': return { kind: 'returning', courier: asDriver(obj['courier']) };
    case 'returned': return { kind: 'returned', courier: asDriver(obj['courier']) };
    default: return { kind: 'created' };
  }
}

export function docToDelivery(id: string, data: DocumentData): Delivery {
  const pickupData = (data['pickup'] !== null && typeof data['pickup'] === 'object'
    ? data['pickup']
    : {}) as Record<string, unknown>;
  const dropoffData = (data['dropoff'] !== null && typeof data['dropoff'] === 'object'
    ? data['dropoff']
    : {}) as Record<string, unknown>;

  const parcelData = (data['parcel'] !== null && typeof data['parcel'] === 'object'
    ? data['parcel']
    : {}) as Record<string, unknown>;

  const recipientData = (data['recipient'] !== null && typeof data['recipient'] === 'object'
    ? data['recipient']
    : {}) as Record<string, unknown>;

  const pickup = docToAddress(
    asString(pickupData['id']),
    asString(data['senderId']),
    pickupData,
  );
  const dropoff = docToAddress(
    asString(dropoffData['id']),
    asString(data['senderId']),
    dropoffData,
  );

  const parcelBase = {
    sizeClass: asString(parcelData['sizeClass'], 's') as ParcelSizeClass,
    fragile: asBoolean(parcelData['fragile']),
    description: asString(parcelData['description']),
  };
  const parcel = typeof parcelData['weightKg'] === 'number'
    ? { ...parcelBase, weightKg: parcelData['weightKg'] as number }
    : parcelBase;

  const base: Delivery = {
    id: id as DeliveryId,
    senderId: asString(data['senderId']) as UserId,
    pickup,
    dropoff,
    recipient: {
      name: asString(recipientData['name']),
      phone: asString(recipientData['phone']),
    },
    parcel,
    fare: asMoney(data['fare']),
    status: asDeliveryStatus(data['status']),
    timeline: asTimeline(data['timeline']),
  };

  const proofData = data['proofOfDelivery'];
  const proof =
    proofData !== null && proofData !== undefined && typeof proofData === 'object'
      ? (proofData as Record<string, unknown>)
      : null;

  return {
    ...base,
    ...(typeof data['paymentId'] === 'string' ? { paymentId: data['paymentId'] as PaymentId } : {}),
    ...(proof !== null
      ? {
          proofOfDelivery: {
            at: tsToIso(proof['at']),
            ...(typeof proof['photoUrl'] === 'string' ? { photoUrl: proof['photoUrl'] } : {}),
            ...(typeof proof['signatureUrl'] === 'string' ? { signatureUrl: proof['signatureUrl'] } : {}),
            ...(typeof proof['note'] === 'string' ? { note: proof['note'] } : {}),
          },
        }
      : {}),
  };
}

// ---------------------------------------------------------------------------
// Order mapper
// ---------------------------------------------------------------------------

export function docToOrder(id: string, data: DocumentData): Order {
  return {
    id: id as OrderId,
    kind: asString(data['kind'], 'ride') as OrderKind,
    refId: asString(data['refId']),
    state: asString(data['state'], 'placed') as OrderState,
    userId: asString(data['userId']) as UserId,
    createdAt: tsToIso(data['createdAt']),
  };
}

// ---------------------------------------------------------------------------
// Payment mapper
// ---------------------------------------------------------------------------

function asPaymentState(v: unknown): PaymentState {
  const obj = (v !== null && typeof v === 'object' ? v : {}) as Record<string, unknown>;
  const kind = asString(obj['kind'], 'pending');
  switch (kind) {
    case 'pending': return { kind: 'pending' };
    case 'authorized': return { kind: 'authorized' };
    case 'captured': return { kind: 'captured' };
    case 'settled': return { kind: 'settled' };
    case 'refund_pending': return { kind: 'refund_pending' };
    case 'refunded': return { kind: 'refunded' };
    case 'failed': return { kind: 'failed', failureReason: asString(obj['failureReason']) };
    default: return { kind: 'pending' };
  }
}

export function docToPayment(id: string, data: DocumentData): Payment {
  const base: Payment = {
    id: id as PaymentId,
    orderId: asString(data['orderId']) as OrderId,
    methodId: asString(data['methodId']) as PaymentMethodId,
    amount: asMoney(data['amount']),
    state: asPaymentState(data['state']),
  };
  return {
    ...base,
    ...(typeof data['receiptUrl'] === 'string' ? { receiptUrl: data['receiptUrl'] } : {}),
  };
}

// ---------------------------------------------------------------------------
// PaymentMethod mapper
// ---------------------------------------------------------------------------

export function docToPaymentMethod(id: string, data: DocumentData): PaymentMethod {
  const base: PaymentMethod = {
    id: id as PaymentMethodId,
    type: asString(data['type'], 'cash') as 'card' | 'wallet' | 'cash',
    isDefault: asBoolean(data['isDefault']),
  };
  return {
    ...base,
    ...(typeof data['brand'] === 'string' ? { brand: data['brand'] } : {}),
    ...(typeof data['last4'] === 'string' ? { last4: data['last4'] } : {}),
    ...(typeof data['expiry'] === 'string' ? { expiry: data['expiry'] } : {}),
  };
}

// ---------------------------------------------------------------------------
// Wallet mapper
// ---------------------------------------------------------------------------

export function docToWallet(userId: string, data: DocumentData): Wallet {
  const txns = asArray(data['transactions']).map((t) => {
    const obj = (t !== null && typeof t === 'object' ? t : {}) as Record<string, unknown>;
    const base: WalletTxn = {
      id: asString(obj['id']),
      amount: asMoney(obj['amount']),
      kind: asString(obj['kind'], 'topup') as 'topup' | 'charge' | 'refund',
      at: tsToIso(obj['at']),
    };
    return typeof obj['memo'] === 'string' ? { ...base, memo: obj['memo'] } : base;
  });
  return {
    userId: userId as UserId,
    balance: asMoney(data['balance']),
    transactions: txns,
  };
}

// ---------------------------------------------------------------------------
// Promo mapper
// ---------------------------------------------------------------------------

export function docToPromo(id: string, data: DocumentData): Promo {
  const base: Promo = {
    id: id as PromoId,
    code: asString(data['code']),
    kind: asString(data['kind'], 'percent') as 'percent' | 'fixed',
    value: asNumber(data['value']),
    validFrom: tsToIso(data['validFrom']),
    validTo: tsToIso(data['validTo']),
    appliesTo: asArray(data['appliesTo']).map((s) => asString(s)) as ('ride' | 'delivery')[],
    status: asString(data['status'], 'active') as PromoStatus,
  };
  const minSpendData = data['minSpend'];
  return minSpendData !== undefined && minSpendData !== null
    ? { ...base, minSpend: asMoney(minSpendData) }
    : base;
}

// ---------------------------------------------------------------------------
// SupportTicket mapper
// ---------------------------------------------------------------------------

export function docToTicket(id: string, data: DocumentData): SupportTicket {
  const messages: readonly TicketMessage[] = asArray(data['messages']).map((m) => {
    const obj = (m !== null && typeof m === 'object' ? m : {}) as Record<string, unknown>;
    return {
      id: asString(obj['id']),
      from: asString(obj['from'], 'user') as 'user' | 'agent',
      body: asString(obj['body']),
      at: tsToIso(obj['at']),
    };
  });

  const base: SupportTicket = {
    id: id as TicketId,
    userId: asString(data['userId']) as UserId,
    subject: asString(data['subject']),
    category: asString(data['category'], 'other') as TicketCategory,
    status: asString(data['status'], 'open') as TicketStatus,
    messages,
    createdAt: tsToIso(data['createdAt']),
  };
  return typeof data['orderId'] === 'string'
    ? { ...base, orderId: data['orderId'] as OrderId }
    : base;
}

// ---------------------------------------------------------------------------
// Notification mapper
// ---------------------------------------------------------------------------

export function docToNotification(id: string, data: DocumentData): Notification {
  const base: Notification = {
    id: id as NotificationId,
    userId: asString(data['userId']) as UserId,
    type: asString(data['type'], 'system') as NotificationType,
    title: asString(data['title']),
    body: asString(data['body']),
    createdAt: tsToIso(data['createdAt']),
  };
  return {
    ...base,
    ...(data['data'] !== undefined && data['data'] !== null && typeof data['data'] === 'object'
      ? { data: data['data'] as Record<string, unknown> }
      : {}),
    ...(typeof data['readAt'] === 'string' || data['readAt'] instanceof Timestamp
      ? { readAt: tsToIso(data['readAt']) }
      : {}),
  };
}

// ---------------------------------------------------------------------------
// FareQuote mapper (stored in `quotes` collection)
// ---------------------------------------------------------------------------

export function docToFareQuote(id: string, data: DocumentData): FareQuote {
  return {
    id: id as QuoteId,
    serviceType: asString(data['serviceType'], 'ride') as 'ride' | 'delivery',
    pickup: asGeoPoint(data['pickup']),
    dropoff: asGeoPoint(data['dropoff']),
    vehicleClass: asString(data['vehicleClass'], 'economy') as VehicleClass,
    estimate: asMoney(data['estimate']),
    surgeMultiplier: asNumber(data['surgeMultiplier'], 1),
    distanceMeters: asNumber(data['distanceMeters']),
    durationSeconds: asNumber(data['durationSeconds']),
    expiresAt: tsToIso(data['expiresAt']),
  };
}
