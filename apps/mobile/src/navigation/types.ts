/**
 * Typed navigation param lists for every stack and tab in the app.
 * All navigation props and useNavigation hooks reference these types.
 */
import type { TripId, DeliveryId } from '@vroom/types';

// ---------------------------------------------------------------------------
// Auth stack
// ---------------------------------------------------------------------------

export type AuthStackParamList = {
  Welcome: undefined;
  PhoneEntry: undefined;
  OtpVerify: { phone: string; challengeId: string };
  ProfileSetup: undefined;
};

// ---------------------------------------------------------------------------
// Onboarding stack
// ---------------------------------------------------------------------------

export type OnboardingStackParamList = {
  ServiceIntro: undefined;
  Permissions: undefined;
};

// ---------------------------------------------------------------------------
// Home tab stack
// ---------------------------------------------------------------------------

export type HomeStackParamList = {
  Home: undefined;
  SetDestination: { mode: 'ride' | 'delivery' };
  ChooseVehicle: undefined;
  ConfirmRide: undefined;
  Searching: { tripId: TripId };
  LiveTracking: { kind: 'ride'; tripId: TripId } | { kind: 'delivery'; deliveryId: DeliveryId };
  // Delivery sub-flow
  ParcelDetails: undefined;
  PickupDropoff: undefined;
  ConfirmDelivery: undefined;
};

// ---------------------------------------------------------------------------
// Activity tab stack
// ---------------------------------------------------------------------------

export type ActivityStackParamList = {
  History: undefined;
  OrderDetail: { orderId: string; kind: 'ride' | 'delivery'; refId: string };
};

// ---------------------------------------------------------------------------
// Payments tab stack
// ---------------------------------------------------------------------------

export type PaymentsStackParamList = {
  Methods: undefined;
  AddCard: undefined;
  Wallet: undefined;
  Promos: undefined;
};

// ---------------------------------------------------------------------------
// Profile tab stack
// ---------------------------------------------------------------------------

export type ProfileStackParamList = {
  Profile: undefined;
  Addresses: undefined;
  Settings: undefined;
  Tickets: undefined;
  TicketThread: { ticketId: string };
  NewTicket: undefined;
  FAQ: undefined;
};

// ---------------------------------------------------------------------------
// Bottom tabs
// ---------------------------------------------------------------------------

export type AppTabParamList = {
  HomeTab: undefined;
  ActivityTab: undefined;
  PaymentsTab: undefined;
  ProfileTab: undefined;
};

// ---------------------------------------------------------------------------
// Root navigator
// ---------------------------------------------------------------------------

export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  App: undefined;
};
