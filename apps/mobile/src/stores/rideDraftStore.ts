/**
 * rideDraftStore — ephemeral state for the ride booking wizard.
 * Cleared when a ride is confirmed or cancelled.
 */
import { create } from 'zustand';
import type { GeoPoint, VehicleClass, PaymentMethodId, QuoteId } from '@vroom/types';

interface RideDraftState {
  pickup: GeoPoint | null;
  dropoff: GeoPoint | null;
  pickupLabel: string;
  dropoffLabel: string;
  vehicleClass: VehicleClass;
  promoCode: string;
  paymentMethodId: PaymentMethodId | null;
  quoteId: QuoteId | null;
  notes: string;
}

interface RideDraftActions {
  setPickup: (point: GeoPoint, label: string) => void;
  setDropoff: (point: GeoPoint, label: string) => void;
  setVehicleClass: (cls: VehicleClass) => void;
  setPromoCode: (code: string) => void;
  setPaymentMethodId: (id: PaymentMethodId) => void;
  setQuoteId: (id: QuoteId) => void;
  setNotes: (notes: string) => void;
  reset: () => void;
}

const INITIAL: RideDraftState = {
  pickup: null,
  dropoff: null,
  pickupLabel: '',
  dropoffLabel: '',
  vehicleClass: 'economy',
  promoCode: '',
  paymentMethodId: null,
  quoteId: null,
  notes: '',
};

export const useRideDraftStore = create<RideDraftState & RideDraftActions>()((set) => ({
  ...INITIAL,

  setPickup: (point, label) => set({ pickup: point, pickupLabel: label }),
  setDropoff: (point, label) => set({ dropoff: point, dropoffLabel: label }),
  setVehicleClass: (vehicleClass) => set({ vehicleClass }),
  setPromoCode: (promoCode) => set({ promoCode }),
  setPaymentMethodId: (paymentMethodId) => set({ paymentMethodId }),
  setQuoteId: (quoteId) => set({ quoteId }),
  setNotes: (notes) => set({ notes }),
  reset: () => set(INITIAL),
}));
