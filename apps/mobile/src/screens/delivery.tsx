/**
 * Delivery booking flow: ParcelDetails -> PickupDropoff -> ConfirmDelivery.
 */
import React, { useState } from 'react';
import { Pressable, Switch, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { GeoPoint, Parcel, ParcelSizeClass } from '@vroom/types';
import { formatFareLine } from '@vroom/ui';
import { useApi } from '../app/providers/ApiContext';
import { useTheme } from '../app/providers/ThemeContext';
import { useDeliveryDraftStore } from '../stores/deliveryDraftStore';
import type { HomeStackParamList } from '../navigation/types';
import {
  AppText,
  Button,
  Card,
  ErrorState,
  Field,
  LoadingState,
  Screen,
} from '../components/ui';

type Props<S extends keyof HomeStackParamList> = NativeStackScreenProps<HomeStackParamList, S>;

const SIZES: ReadonlyArray<{ value: ParcelSizeClass; label: string }> = [
  { value: 's', label: 'Small' },
  { value: 'm', label: 'Medium' },
  { value: 'l', label: 'Large' },
  { value: 'xl', label: 'Extra large' },
];
const TASHKENT: GeoPoint = { lat: 41.2995, lng: 69.2401 };

export function ParcelDetailsScreen({ navigation }: Props<'ParcelDetails'>): React.JSX.Element {
  const { colors } = useTheme();
  const setParcel = useDeliveryDraftStore((s) => s.setParcel);
  const [size, setSize] = useState<ParcelSizeClass>('m');
  const [fragile, setFragile] = useState(false);
  const [description, setDescription] = useState('');

  function onContinue(): void {
    setParcel({ sizeClass: size, fragile, description: description || 'Parcel' });
    navigation.navigate('PickupDropoff');
  }

  return (
    <Screen scroll>
      <AppText variant="title">What are you sending?</AppText>

      <AppText variant="caption" muted>Parcel size</AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {SIZES.map((s) => {
          const selected = s.value === size;
          return (
            <Pressable
              key={s.value}
              onPress={() => setSize(s.value)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 999,
                borderWidth: selected ? 2 : 1,
                borderColor: selected ? colors.brand : colors.border,
                backgroundColor: colors.surface,
              }}
            >
              <AppText variant="body">{s.label}</AppText>
            </Pressable>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <AppText variant="subtitle">Fragile</AppText>
        <Switch value={fragile} onValueChange={setFragile} />
      </View>

      <Field
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="e.g. Documents, food, electronics"
      />

      <Button label="Continue" onPress={onContinue} />
    </Screen>
  );
}

export function PickupDropoffScreen({ navigation }: Props<'PickupDropoff'>): React.JSX.Element {
  const setPickup = useDeliveryDraftStore((s) => s.setPickup);
  const setDropoff = useDeliveryDraftStore((s) => s.setDropoff);
  const setRecipient = useDeliveryDraftStore((s) => s.setRecipient);
  const [pickup, setPickupText] = useState('My location');
  const [dropoff, setDropoffText] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+998');

  function onContinue(): void {
    setPickup(TASHKENT, pickup || 'My location');
    setDropoff({ lat: TASHKENT.lat + 0.05, lng: TASHKENT.lng - 0.02 }, dropoff || 'Drop-off');
    setRecipient({ name: name || 'Recipient', phone });
    navigation.navigate('ConfirmDelivery');
  }

  return (
    <Screen scroll>
      <AppText variant="title">Pickup & drop-off</AppText>
      <Field label="Pickup" value={pickup} onChangeText={setPickupText} />
      <Field label="Drop-off" value={dropoff} onChangeText={setDropoffText} placeholder="Where is it going?" />
      <Field label="Recipient name" value={name} onChangeText={setName} />
      <Field label="Recipient phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Button label="Continue" onPress={onContinue} disabled={dropoff.trim().length === 0} />
    </Screen>
  );
}

export function ConfirmDeliveryScreen({ navigation }: Props<'ConfirmDelivery'>): React.JSX.Element {
  const { useDeliveryQuote, useCreateDelivery, usePaymentMethods } = useApi();
  const draft = useDeliveryDraftStore();
  const reset = useDeliveryDraftStore((s) => s.reset);
  const methods = usePaymentMethods();
  const createDelivery = useCreateDelivery();
  const [error, setError] = useState<string>();

  const quote = useDeliveryQuote(
    draft.pickup && draft.dropoff && draft.parcel
      ? {
          pickup: draft.pickup,
          dropoff: draft.dropoff,
          parcel: {
            sizeClass: draft.parcel.sizeClass,
            fragile: draft.parcel.fragile,
            ...(draft.parcel.weightKg !== undefined ? { weightKg: draft.parcel.weightKg } : {}),
          },
        }
      : null,
  );

  const defaultMethod = methods.data?.find((m) => m.isDefault) ?? methods.data?.[0];

  function onConfirm(): void {
    if (!quote.data || !draft.parcel || !draft.recipient || !defaultMethod) return;
    const parcel: Parcel = {
      sizeClass: draft.parcel.sizeClass,
      fragile: draft.parcel.fragile,
      description: draft.parcel.description,
      ...(draft.parcel.weightKg !== undefined ? { weightKg: draft.parcel.weightKg } : {}),
    };
    setError(undefined);
    createDelivery.mutate(
      {
        quoteId: quote.data.id,
        recipient: { name: draft.recipient.name, phone: draft.recipient.phone },
        parcel,
        paymentMethodId: defaultMethod.id,
        ...(draft.promoCode ? { promoCode: draft.promoCode } : {}),
      },
      {
        onSuccess: (delivery) => {
          const deliveryId = delivery.id;
          reset();
          navigation.navigate('LiveTracking', { kind: 'delivery', deliveryId });
        },
        onError: () => setError('We could not create your delivery. Please try again.'),
      },
    );
  }

  return (
    <Screen scroll>
      <AppText variant="title">Confirm delivery</AppText>

      <Card>
        <AppText variant="caption" muted>To</AppText>
        <AppText variant="body">{draft.recipient?.name} · {draft.recipient?.phone}</AppText>
      </Card>

      {quote.isPending ? <LoadingState label="Estimating price…" /> : null}
      {quote.isError ? <ErrorState message="Couldn't estimate the price." onRetry={() => quote.refetch()} /> : null}

      <Card>
        <AppText variant="caption" muted>Price</AppText>
        <AppText variant="title">{quote.data ? formatFareLine(quote.data, 'en') : '—'}</AppText>
      </Card>

      {error ? <AppText variant="caption" muted>{error}</AppText> : null}

      <Button
        label="Send parcel"
        onPress={onConfirm}
        loading={createDelivery.isPending}
        disabled={!quote.data || !defaultMethod}
      />
    </Screen>
  );
}
