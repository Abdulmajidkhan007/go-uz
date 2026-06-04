import { create } from 'zustand';
import type { GeoPoint, ParcelSizeClass, PaymentMethodId } from '@vroom/types';

interface PlaceOption {
  placeId: string;
  label: string;
  geo: GeoPoint;
}

interface DeliveryDraftState {
  pickup: PlaceOption | null;
  dropoff: PlaceOption | null;
  parcelDescription: string;
  parcelSizeClass: ParcelSizeClass;
  parcelWeightKg: number;
  recipientName: string;
  recipientPhone: string;
  recipientNotes: string;
  paymentMethodId: PaymentMethodId | null;
  quoteId: string | null;
  activeDeliveryId: string | null;
  setPickup: (place: PlaceOption | null) => void;
  setDropoff: (place: PlaceOption | null) => void;
  setParcelDescription: (desc: string) => void;
  setParcelSizeClass: (cls: ParcelSizeClass) => void;
  setParcelWeightKg: (weight: number) => void;
  setRecipientName: (name: string) => void;
  setRecipientPhone: (phone: string) => void;
  setRecipientNotes: (notes: string) => void;
  setPaymentMethodId: (id: PaymentMethodId | null) => void;
  setQuoteId: (id: string | null) => void;
  setActiveDeliveryId: (id: string | null) => void;
  reset: () => void;
}

const initialState = {
  pickup: null,
  dropoff: null,
  parcelDescription: '',
  parcelSizeClass: 'm' as ParcelSizeClass,
  parcelWeightKg: 1,
  recipientName: '',
  recipientPhone: '',
  recipientNotes: '',
  paymentMethodId: null,
  quoteId: null,
  activeDeliveryId: null,
};

export const useDeliveryDraftStore = create<DeliveryDraftState>()((set) => ({
  ...initialState,
  setPickup: (place) => set({ pickup: place }),
  setDropoff: (place) => set({ dropoff: place }),
  setParcelDescription: (desc) => set({ parcelDescription: desc }),
  setParcelSizeClass: (cls) => set({ parcelSizeClass: cls }),
  setParcelWeightKg: (weight) => set({ parcelWeightKg: weight }),
  setRecipientName: (name) => set({ recipientName: name }),
  setRecipientPhone: (phone) => set({ recipientPhone: phone }),
  setRecipientNotes: (notes) => set({ recipientNotes: notes }),
  setPaymentMethodId: (id) => set({ paymentMethodId: id }),
  setQuoteId: (id) => set({ quoteId: id }),
  setActiveDeliveryId: (id) => set({ activeDeliveryId: id }),
  reset: () => set(initialState),
}));
