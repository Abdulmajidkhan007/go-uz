/**
 * deliveryDraftStore — ephemeral state for the delivery booking wizard.
 */
import { create } from 'zustand';
import type { GeoPoint, PaymentMethodId, QuoteId } from '@vroom/types';
import type { ParcelInput, RecipientInput } from '@vroom/validation';

interface DeliveryDraftState {
  parcel: ParcelInput | null;
  recipient: RecipientInput | null;
  pickup: GeoPoint | null;
  dropoff: GeoPoint | null;
  pickupLabel: string;
  dropoffLabel: string;
  paymentMethodId: PaymentMethodId | null;
  quoteId: QuoteId | null;
  promoCode: string;
}

interface DeliveryDraftActions {
  setParcel: (parcel: ParcelInput) => void;
  setRecipient: (recipient: RecipientInput) => void;
  setPickup: (point: GeoPoint, label: string) => void;
  setDropoff: (point: GeoPoint, label: string) => void;
  setPaymentMethodId: (id: PaymentMethodId) => void;
  setQuoteId: (id: QuoteId) => void;
  setPromoCode: (code: string) => void;
  reset: () => void;
}

const INITIAL: DeliveryDraftState = {
  parcel: null,
  recipient: null,
  pickup: null,
  dropoff: null,
  pickupLabel: '',
  dropoffLabel: '',
  paymentMethodId: null,
  quoteId: null,
  promoCode: '',
};

export const useDeliveryDraftStore = create<DeliveryDraftState & DeliveryDraftActions>()(
  (set) => ({
    ...INITIAL,

    setParcel: (parcel) => set({ parcel }),
    setRecipient: (recipient) => set({ recipient }),
    setPickup: (point, label) => set({ pickup: point, pickupLabel: label }),
    setDropoff: (point, label) => set({ dropoff: point, dropoffLabel: label }),
    setPaymentMethodId: (paymentMethodId) => set({ paymentMethodId }),
    setQuoteId: (quoteId) => set({ quoteId }),
    setPromoCode: (promoCode) => set({ promoCode }),
    reset: () => set(INITIAL),
  }),
);
