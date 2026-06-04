/**
 * Deterministic seed fixtures.
 * All IDs are static strings — never randomised — so tests and Storybook get
 * stable snapshots.  Tashkent area coords: lat ~41.31, lng ~69.28.
 */
import type {
  User,
  Session,
  Address,
  PlaceSuggestion,
  Vehicle,
  Driver,
  FareQuote,
  Trip,
  Delivery,
  Order,
  PaymentMethod,
  Payment,
  Wallet,
  WalletTxn,
  Promo,
  SupportTicket,
  Notification,
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
} from '@vroom/types';

// ---------------------------------------------------------------------------
// ID constants — branded casts at fixture boundaries
// ---------------------------------------------------------------------------

export const DEMO_USER_ID = 'usr_demo-0001' as UserId;
export const DEMO_SESSION: Session = {
  accessToken: 'mock-access-token-demo',
  refreshToken: 'mock-refresh-token-demo',
  userId: DEMO_USER_ID,
  expiresAt: '2099-01-01T00:00:00.000Z' as IsoDateTime,
};

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

export const demoUser: User = {
  id: DEMO_USER_ID,
  phone: '+998901234567',
  email: 'demo@vroom.uz',
  displayName: 'Alibek Tashkentov',
  role: 'rider',
  defaultPaymentMethodId: 'pm_card-0001' as PaymentMethodId,
  createdAt: '2024-01-15T08:00:00.000Z' as IsoDateTime,
  status: 'active',
};

// ---------------------------------------------------------------------------
// Addresses — around Tashkent
// ---------------------------------------------------------------------------

export const demoAddresses: readonly Address[] = [
  {
    id: 'addr_home-0001' as AddressId,
    userId: DEMO_USER_ID,
    label: 'home',
    formatted: 'Yunusabad, 19-kvartal, Tashkent',
    geo: { lat: 41.3565, lng: 69.2845 },
    placeId: 'place_yunusabad_19kv',
    notes: 'Blue gate, 3rd floor',
  },
  {
    id: 'addr_work-0002' as AddressId,
    userId: DEMO_USER_ID,
    label: 'work',
    formatted: 'IT Park, Amir Temur ko\'chasi 108, Tashkent',
    geo: { lat: 41.3123, lng: 69.2792 },
    placeId: 'place_it_park',
  },
  {
    id: 'addr_custom-0003' as AddressId,
    userId: DEMO_USER_ID,
    label: 'custom',
    formatted: 'Chorsu Bazaar, Old City, Tashkent',
    geo: { lat: 41.3264, lng: 69.2356 },
    placeId: 'place_chorsu',
    notes: 'Main entrance near Chorsu metro',
  },
];

// ---------------------------------------------------------------------------
// Payment methods
// ---------------------------------------------------------------------------

export const demoPaymentMethods: readonly PaymentMethod[] = [
  {
    id: 'pm_card-0001' as PaymentMethodId,
    type: 'card',
    brand: 'Uzcard',
    last4: '4242',
    isDefault: true,
    expiry: '12/27',
  },
  {
    id: 'pm_card-0002' as PaymentMethodId,
    type: 'card',
    brand: 'Humo',
    last4: '8800',
    isDefault: false,
    expiry: '06/26',
  },
  {
    id: 'pm_wallet-0003' as PaymentMethodId,
    type: 'wallet',
    isDefault: false,
  },
  {
    id: 'pm_cash-0004' as PaymentMethodId,
    type: 'cash',
    isDefault: false,
  },
];

// ---------------------------------------------------------------------------
// Wallet
// ---------------------------------------------------------------------------

const walletTxns: readonly WalletTxn[] = [
  {
    id: 'wtx_001',
    amount: { amount: 50_000_00, currency: 'UZS' },
    kind: 'topup',
    at: '2024-05-01T10:00:00.000Z' as IsoDateTime,
    memo: 'Top-up via Uzcard',
  },
  {
    id: 'wtx_002',
    amount: { amount: 18_000_00, currency: 'UZS' },
    kind: 'charge',
    at: '2024-05-03T14:22:00.000Z' as IsoDateTime,
    memo: 'Ride #trp_hist-0001',
  },
  {
    id: 'wtx_003',
    amount: { amount: 5_000_00, currency: 'UZS' },
    kind: 'refund',
    at: '2024-05-10T09:11:00.000Z' as IsoDateTime,
    memo: 'Cancelled delivery refund',
  },
];

export const demoWallet: Wallet = {
  userId: DEMO_USER_ID,
  balance: { amount: 37_000_00, currency: 'UZS' },
  transactions: walletTxns,
};

// ---------------------------------------------------------------------------
// Vehicles & drivers
// ---------------------------------------------------------------------------

export const demoVehicles: Record<string, Vehicle> = {
  economy: {
    id: 'veh_eco-0001' as VehicleId,
    class: 'economy',
    plate: '01 A 777 AA',
    model: 'Chevrolet Spark',
    color: 'White',
    capacity: 4,
    etaMinutes: 3,
  },
  comfort: {
    id: 'veh_com-0001' as VehicleId,
    class: 'comfort',
    plate: '01 B 888 BB',
    model: 'Chevrolet Malibu',
    color: 'Black',
    capacity: 4,
    etaMinutes: 5,
  },
  xl: {
    id: 'veh_xl-0001' as VehicleId,
    class: 'xl',
    plate: '01 C 999 CC',
    model: 'Kia Carnival',
    color: 'Silver',
    capacity: 7,
    etaMinutes: 7,
  },
  courier_bike: {
    id: 'veh_bike-0001' as VehicleId,
    class: 'courier_bike',
    plate: 'B 12345',
    model: 'Honda CB125',
    color: 'Red',
    capacity: 1,
    etaMinutes: 4,
  },
  courier_van: {
    id: 'veh_van-0001' as VehicleId,
    class: 'courier_van',
    plate: '01 D 444 DD',
    model: 'Chevrolet Damas',
    color: 'Yellow',
    capacity: 3,
    etaMinutes: 6,
  },
};

export const demoDrivers: Record<string, Driver> = {
  economy: {
    id: 'drv_eco-0001' as DriverId,
    displayName: 'Jasur Mirzaev',
    rating: 4.87,
    vehicleId: 'veh_eco-0001' as VehicleId,
    phoneMasked: '+998 ** *** 91',
  },
  comfort: {
    id: 'drv_com-0001' as DriverId,
    displayName: 'Bobur Yusupov',
    rating: 4.94,
    vehicleId: 'veh_com-0001' as VehicleId,
    phoneMasked: '+998 ** *** 44',
  },
  xl: {
    id: 'drv_xl-0001' as DriverId,
    displayName: 'Kamol Rakhimov',
    rating: 4.79,
    vehicleId: 'veh_xl-0001' as VehicleId,
    phoneMasked: '+998 ** *** 77',
  },
  courier_bike: {
    id: 'drv_bike-0001' as DriverId,
    displayName: 'Sherzod Tursunov',
    rating: 4.91,
    vehicleId: 'veh_bike-0001' as VehicleId,
    phoneMasked: '+998 ** *** 55',
  },
  courier_van: {
    id: 'drv_van-0001' as DriverId,
    displayName: 'Ulugbek Nazarov',
    rating: 4.83,
    vehicleId: 'veh_van-0001' as VehicleId,
    phoneMasked: '+998 ** *** 22',
  },
};

// ---------------------------------------------------------------------------
// Fare quotes (static reference quotes for history display)
// ---------------------------------------------------------------------------

export const demoFareQuotes: Record<string, FareQuote> = {
  economy: {
    id: 'qid_eco-0001' as QuoteId,
    serviceType: 'ride',
    pickup: { lat: 41.3565, lng: 69.2845 },
    dropoff: { lat: 41.3123, lng: 69.2792 },
    vehicleClass: 'economy',
    estimate: { amount: 18_000_00, currency: 'UZS' },
    surgeMultiplier: 1.0,
    distanceMeters: 5_800,
    durationSeconds: 960,
    expiresAt: '2099-01-01T00:00:00.000Z' as IsoDateTime,
  },
  comfort: {
    id: 'qid_com-0001' as QuoteId,
    serviceType: 'ride',
    pickup: { lat: 41.3565, lng: 69.2845 },
    dropoff: { lat: 41.3123, lng: 69.2792 },
    vehicleClass: 'comfort',
    estimate: { amount: 28_000_00, currency: 'UZS' },
    surgeMultiplier: 1.0,
    distanceMeters: 5_800,
    durationSeconds: 900,
    expiresAt: '2099-01-01T00:00:00.000Z' as IsoDateTime,
  },
  courier_bike: {
    id: 'qid_bike-0001' as QuoteId,
    serviceType: 'delivery',
    pickup: { lat: 41.3264, lng: 69.2356 },
    dropoff: { lat: 41.3123, lng: 69.2792 },
    vehicleClass: 'courier_bike',
    estimate: { amount: 15_000_00, currency: 'UZS' },
    surgeMultiplier: 1.0,
    distanceMeters: 3_200,
    durationSeconds: 600,
    expiresAt: '2099-01-01T00:00:00.000Z' as IsoDateTime,
  },
};

// ---------------------------------------------------------------------------
// Historical trips
// ---------------------------------------------------------------------------

export const demoTrips: readonly Trip[] = [
  {
    id: 'trp_hist-0001' as TripId,
    riderId: DEMO_USER_ID,
    pickup: { lat: 41.3565, lng: 69.2845 },
    dropoff: { lat: 41.3123, lng: 69.2792 },
    fare: { amount: 18_000_00, currency: 'UZS' },
    status: { kind: 'completed' },
    timeline: [
      { status: 'requested', at: '2024-05-03T14:00:00.000Z' as IsoDateTime },
      { status: 'driver_assigned', at: '2024-05-03T14:02:00.000Z' as IsoDateTime },
      { status: 'in_progress', at: '2024-05-03T14:08:00.000Z' as IsoDateTime },
      { status: 'completed', at: '2024-05-03T14:24:00.000Z' as IsoDateTime },
    ],
    paymentId: 'pay_hist-0001' as PaymentId,
    createdAt: '2024-05-03T14:00:00.000Z' as IsoDateTime,
  },
  {
    id: 'trp_hist-0002' as TripId,
    riderId: DEMO_USER_ID,
    pickup: { lat: 41.3123, lng: 69.2792 },
    dropoff: { lat: 41.3264, lng: 69.2356 },
    fare: { amount: 24_000_00, currency: 'UZS' },
    status: { kind: 'cancelled', cancelledBy: 'rider', reason: 'Changed plans' },
    timeline: [
      { status: 'requested', at: '2024-05-10T09:00:00.000Z' as IsoDateTime },
      { status: 'cancelled', at: '2024-05-10T09:03:00.000Z' as IsoDateTime },
    ],
    createdAt: '2024-05-10T09:00:00.000Z' as IsoDateTime,
  },
];

// ---------------------------------------------------------------------------
// Historical deliveries
// ---------------------------------------------------------------------------

export const demoDeliveries: readonly Delivery[] = [
  {
    id: 'dlv_hist-0001' as DeliveryId,
    senderId: DEMO_USER_ID,
    pickup: demoAddresses[0] as Address,
    dropoff: demoAddresses[1] as Address,
    recipient: { name: 'Sarvar Hamidov', phone: '+998977654321' },
    parcel: { sizeClass: 's', weightKg: 0.5, fragile: false, description: 'Documents' },
    fare: { amount: 15_000_00, currency: 'UZS' },
    status: { kind: 'delivered', courier: demoDrivers['courier_bike'] as Driver },
    proofOfDelivery: {
      note: 'Left with receptionist',
      at: '2024-05-05T11:45:00.000Z' as IsoDateTime,
    },
    timeline: [
      { status: 'created', at: '2024-05-05T11:00:00.000Z' as IsoDateTime },
      { status: 'courier_search', at: '2024-05-05T11:01:00.000Z' as IsoDateTime },
      { status: 'courier_assigned', at: '2024-05-05T11:04:00.000Z' as IsoDateTime },
      { status: 'picked_up', at: '2024-05-05T11:20:00.000Z' as IsoDateTime },
      { status: 'delivered', at: '2024-05-05T11:45:00.000Z' as IsoDateTime },
    ],
    paymentId: 'pay_hist-0002' as PaymentId,
  },
];

// ---------------------------------------------------------------------------
// Orders (history envelope)
// ---------------------------------------------------------------------------

export const demoOrders: readonly Order[] = [
  {
    id: 'ord_hist-0001' as OrderId,
    kind: 'ride',
    refId: 'trp_hist-0001',
    state: 'completed',
    userId: DEMO_USER_ID,
    createdAt: '2024-05-03T14:00:00.000Z' as IsoDateTime,
  },
  {
    id: 'ord_hist-0002' as OrderId,
    kind: 'ride',
    refId: 'trp_hist-0002',
    state: 'cancelled',
    userId: DEMO_USER_ID,
    createdAt: '2024-05-10T09:00:00.000Z' as IsoDateTime,
  },
  {
    id: 'ord_hist-0003' as OrderId,
    kind: 'delivery',
    refId: 'dlv_hist-0001',
    state: 'completed',
    userId: DEMO_USER_ID,
    createdAt: '2024-05-05T11:00:00.000Z' as IsoDateTime,
  },
];

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------

export const demoPayments: readonly Payment[] = [
  {
    id: 'pay_hist-0001' as PaymentId,
    orderId: 'ord_hist-0001' as OrderId,
    methodId: 'pm_card-0001' as PaymentMethodId,
    amount: { amount: 18_000_00, currency: 'UZS' },
    state: { kind: 'settled' },
    receiptUrl: 'https://receipts.vroom.uz/pay_hist-0001',
  },
  {
    id: 'pay_hist-0002' as PaymentId,
    orderId: 'ord_hist-0003' as OrderId,
    methodId: 'pm_wallet-0003' as PaymentMethodId,
    amount: { amount: 15_000_00, currency: 'UZS' },
    state: { kind: 'settled' },
    receiptUrl: 'https://receipts.vroom.uz/pay_hist-0002',
  },
];

// ---------------------------------------------------------------------------
// Promos
// ---------------------------------------------------------------------------

export const demoPromos: readonly Promo[] = [
  {
    id: 'prm_001' as PromoId,
    code: 'VROOM20',
    kind: 'percent',
    value: 20,
    validFrom: '2024-01-01T00:00:00.000Z' as IsoDateTime,
    validTo: '2099-12-31T23:59:59.000Z' as IsoDateTime,
    appliesTo: ['ride', 'delivery'],
    status: 'active',
  },
  {
    id: 'prm_002' as PromoId,
    code: 'FIRST5K',
    kind: 'fixed',
    value: 5_000_00,
    validFrom: '2024-01-01T00:00:00.000Z' as IsoDateTime,
    validTo: '2099-12-31T23:59:59.000Z' as IsoDateTime,
    minSpend: { amount: 10_000_00, currency: 'UZS' },
    appliesTo: ['ride'],
    status: 'active',
  },
];

// ---------------------------------------------------------------------------
// Support tickets
// ---------------------------------------------------------------------------

export const demoTickets: readonly SupportTicket[] = [
  {
    id: 'tkt_001' as TicketId,
    userId: DEMO_USER_ID,
    orderId: 'ord_hist-0002' as OrderId,
    subject: 'Charged for cancelled trip',
    category: 'payment_issue',
    status: 'resolved',
    messages: [
      {
        id: 'msg_001',
        from: 'user',
        body: 'I was charged despite cancelling within 2 minutes.',
        at: '2024-05-10T09:10:00.000Z' as IsoDateTime,
      },
      {
        id: 'msg_002',
        from: 'agent',
        body: 'We have reviewed and issued a full refund. It will appear in 1-3 business days.',
        at: '2024-05-10T10:30:00.000Z' as IsoDateTime,
      },
    ],
    createdAt: '2024-05-10T09:10:00.000Z' as IsoDateTime,
  },
];

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export const demoNotifications: readonly Notification[] = [
  {
    id: 'ntf_001' as NotificationId,
    userId: DEMO_USER_ID,
    type: 'promo',
    title: 'Get 20% off your next ride',
    body: 'Use code VROOM20 to save on your next trip. Valid this week only!',
    data: { code: 'VROOM20', serviceType: 'ride' },
    createdAt: '2024-05-12T09:00:00.000Z' as IsoDateTime,
  },
  {
    id: 'ntf_002' as NotificationId,
    userId: DEMO_USER_ID,
    type: 'payment',
    title: 'Payment received',
    body: 'Your payment of 18,000 UZS for trip on May 3 has been processed.',
    data: { paymentId: 'pay_hist-0001' },
    readAt: '2024-05-03T14:30:00.000Z' as IsoDateTime,
    createdAt: '2024-05-03T14:25:00.000Z' as IsoDateTime,
  },
  {
    id: 'ntf_003' as NotificationId,
    userId: DEMO_USER_ID,
    type: 'support',
    title: 'Ticket resolved',
    body: 'Your support ticket about the cancelled trip has been resolved.',
    data: { ticketId: 'tkt_001' },
    readAt: '2024-05-10T11:00:00.000Z' as IsoDateTime,
    createdAt: '2024-05-10T10:31:00.000Z' as IsoDateTime,
  },
];

// ---------------------------------------------------------------------------
// Place suggestions (autocomplete examples)
// ---------------------------------------------------------------------------

export const demoPlaceSuggestions: readonly PlaceSuggestion[] = [
  {
    placeId: 'place_it_park',
    primaryText: 'IT Park Tashkent',
    secondaryText: 'Amir Temur ko\'chasi, 108, Tashkent',
    geo: { lat: 41.3123, lng: 69.2792 },
  },
  {
    placeId: 'place_national_library',
    primaryText: 'National Library of Uzbekistan',
    secondaryText: 'Olmazor, Tashkent',
    geo: { lat: 41.3019, lng: 69.2458 },
  },
  {
    placeId: 'place_tashkent_city',
    primaryText: 'Tashkent City Mall',
    secondaryText: 'Islam Karimov ko\'chasi, Tashkent',
    geo: { lat: 41.3002, lng: 69.2847 },
  },
  {
    placeId: 'place_airport',
    primaryText: 'Tashkent International Airport',
    secondaryText: 'Yuqori Chirchiq, Tashkent',
    geo: { lat: 41.2577, lng: 69.2812 },
  },
];
