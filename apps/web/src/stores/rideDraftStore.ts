import { create } from 'zustand';
import type { GeoPoint, VehicleClass, PaymentMethodId } from '@vroom/types';

interface PlaceOption {
  placeId: string;
  label: string;
  geo: GeoPoint;
}

interface RideDraftState {
  pickup: PlaceOption | null;
  dropoff: PlaceOption | null;
  vehicleClass: VehicleClass | null;
  paymentMethodId: PaymentMethodId | null;
  promoCode: string;
  notes: string;
  quoteId: string | null;
  activeTripId: string | null;
  setPickup: (place: PlaceOption | null) => void;
  setDropoff: (place: PlaceOption | null) => void;
  setVehicleClass: (cls: VehicleClass | null) => void;
  setPaymentMethodId: (id: PaymentMethodId | null) => void;
  setPromoCode: (code: string) => void;
  setNotes: (notes: string) => void;
  setQuoteId: (id: string | null) => void;
  setActiveTripId: (id: string | null) => void;
  reset: () => void;
}

const initialState = {
  pickup: null,
  dropoff: null,
  vehicleClass: null,
  paymentMethodId: null,
  promoCode: '',
  notes: '',
  quoteId: null,
  activeTripId: null,
};

export const useRideDraftStore = create<RideDraftState>()((set) => ({
  ...initialState,
  setPickup: (place) => set({ pickup: place }),
  setDropoff: (place) => set({ dropoff: place }),
  setVehicleClass: (cls) => set({ vehicleClass: cls }),
  setPaymentMethodId: (id) => set({ paymentMethodId: id }),
  setPromoCode: (code) => set({ promoCode: code }),
  setNotes: (notes) => set({ notes }),
  setQuoteId: (id) => set({ quoteId: id }),
  setActiveTripId: (id) => set({ activeTripId: id }),
  reset: () => set(initialState),
}));
