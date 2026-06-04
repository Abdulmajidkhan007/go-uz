/**
 * Ride booking flow: SetDestination -> ChooseVehicle -> ConfirmRide -> Searching.
 * Wired to the mock API via React Query hooks; draft state lives in Zustand.
 */
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { GeoPoint, VehicleClass } from '@vroom/types';
import { VEHICLE_CLASS_LABELS } from '@vroom/constants';
import { formatFareLine } from '@vroom/ui';
import { useApi } from '../app/providers/ApiContext';
import { useTheme } from '../app/providers/ThemeContext';
import { useRideDraftStore } from '../stores/rideDraftStore';
import type { HomeStackParamList } from '../navigation/types';
import {
  AppText,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  LoadingState,
  Screen,
} from '../components/ui';

type Props<S extends keyof HomeStackParamList> = NativeStackScreenProps<HomeStackParamList, S>;

const RIDE_CLASSES: readonly VehicleClass[] = ['economy', 'comfort', 'xl'];
const TASHKENT: GeoPoint = { lat: 41.2995, lng: 69.2401 };

export function SetDestinationScreen({ navigation }: Props<'SetDestination'>): React.JSX.Element {
  const setPickup = useRideDraftStore((s) => s.setPickup);
  const setDropoff = useRideDraftStore((s) => s.setDropoff);
  const [pickup, setPickupText] = useState('My location');
  const [dropoff, setDropoffText] = useState('');

  function onContinue(): void {
    // Demo geocoding: a real build resolves these via apiClient.geo.autocomplete.
    setPickup(TASHKENT, pickup || 'My location');
    setDropoff({ lat: TASHKENT.lat + 0.04, lng: TASHKENT.lng + 0.03 }, dropoff || 'Destination');
    navigation.navigate('ChooseVehicle');
  }

  return (
    <Screen scroll>
      <AppText variant="title">Where to?</AppText>
      <Field label="Pickup" value={pickup} onChangeText={setPickupText} />
      <Field label="Destination" value={dropoff} onChangeText={setDropoffText} autoFocus placeholder="Search destination" />
      <Button label="Continue" onPress={onContinue} disabled={dropoff.trim().length === 0} />
    </Screen>
  );
}

export function ChooseVehicleScreen({ navigation }: Props<'ChooseVehicle'>): React.JSX.Element {
  const { colors } = useTheme();
  const { useRideQuote } = useApi();
  const draft = useRideDraftStore();
  const setVehicleClass = useRideDraftStore((s) => s.setVehicleClass);
  const setQuoteId = useRideDraftStore((s) => s.setQuoteId);

  const quote = useRideQuote(
    draft.pickup && draft.dropoff
      ? { pickup: draft.pickup, dropoff: draft.dropoff, vehicleClass: draft.vehicleClass }
      : null,
  );

  function onConfirm(): void {
    if (quote.data) {
      setQuoteId(quote.data.id);
      navigation.navigate('ConfirmRide');
    }
  }

  return (
    <Screen scroll>
      <AppText variant="title">Choose a ride</AppText>
      <View style={{ gap: 10 }}>
        {RIDE_CLASSES.map((cls) => {
          const selected = cls === draft.vehicleClass;
          return (
            <Pressable
              key={cls}
              onPress={() => setVehicleClass(cls)}
              style={{
                borderWidth: selected ? 2 : 1,
                borderColor: selected ? colors.brand : colors.border,
                borderRadius: 14,
                padding: 16,
                backgroundColor: colors.surface,
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <AppText variant="subtitle">{VEHICLE_CLASS_LABELS[cls]}</AppText>
              {selected && quote.data ? (
                <AppText variant="subtitle">{formatFareLine(quote.data, 'en')}</AppText>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {quote.isPending ? <LoadingState label="Estimating fare…" /> : null}
      {quote.isError ? <ErrorState message="Couldn't estimate the fare." onRetry={() => quote.refetch()} /> : null}

      <Card>
        <AppText variant="caption" muted>
          Fare estimate
        </AppText>
        <AppText variant="title">{quote.data ? formatFareLine(quote.data, 'en') : '—'}</AppText>
      </Card>

      <Button label="Confirm pickup" onPress={onConfirm} disabled={!quote.data} loading={quote.isFetching && !quote.data} />
    </Screen>
  );
}

export function ConfirmRideScreen({ navigation }: Props<'ConfirmRide'>): React.JSX.Element {
  const { usePaymentMethods, useRequestRide } = useApi();
  const draft = useRideDraftStore();
  const reset = useRideDraftStore((s) => s.reset);
  const setPromoCode = useRideDraftStore((s) => s.setPromoCode);
  const methods = usePaymentMethods();
  const requestRide = useRequestRide();
  const [error, setError] = useState<string>();

  const defaultMethod = methods.data?.find((m) => m.isDefault) ?? methods.data?.[0];

  function onBook(): void {
    if (!draft.quoteId || !defaultMethod) return;
    setError(undefined);
    requestRide.mutate(
      {
        quoteId: draft.quoteId,
        paymentMethodId: defaultMethod.id,
        ...(draft.promoCode ? { promoCode: draft.promoCode } : {}),
      },
      {
        onSuccess: (trip) => {
          const tripId = trip.id;
          reset();
          navigation.navigate('Searching', { tripId });
        },
        onError: () => setError('We could not book your ride. Please try again.'),
      },
    );
  }

  return (
    <Screen scroll>
      <AppText variant="title">Confirm your ride</AppText>

      <Card>
        <AppText variant="caption" muted>
          Route
        </AppText>
        <AppText variant="body">{draft.pickupLabel} → {draft.dropoffLabel}</AppText>
      </Card>

      <Card>
        <AppText variant="caption" muted>
          Payment
        </AppText>
        <AppText variant="body">
          {defaultMethod
            ? defaultMethod.type === 'card'
              ? `Card ·· ${defaultMethod.last4 ?? ''}`
              : defaultMethod.type
            : 'No payment method'}
        </AppText>
      </Card>

      <Field
        label="Promo code (optional)"
        value={draft.promoCode}
        onChangeText={setPromoCode}
        autoCapitalize="characters"
      />

      {error ? <AppText variant="caption" muted>{error}</AppText> : null}

      <Button
        label="Book ride"
        onPress={onBook}
        loading={requestRide.isPending}
        disabled={!draft.quoteId || !defaultMethod}
      />
    </Screen>
  );
}

export function SearchingScreen({ navigation, route }: Props<'Searching'>): React.JSX.Element {
  const { tripId } = route.params;
  const { useTrip } = useApi();
  const trip = useTrip(tripId);

  if (trip.isPending) return <Screen><LoadingState label="Finding your driver…" /></Screen>;
  if (trip.isError || !trip.data) {
    return (
      <Screen>
        <ErrorState message="Lost connection to your trip." onRetry={() => trip.refetch()} />
      </Screen>
    );
  }

  const status = trip.data.status.kind;
  const matched = status !== 'requested' && status !== 'matching' && status !== 'no_drivers';

  if (status === 'no_drivers') {
    return (
      <Screen>
        <EmptyState
          title="No drivers available"
          caption="Please try again in a moment."
          cta="Back home"
          onCta={() => navigation.navigate('Home')}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', gap: 16 }}>
        {!matched ? <LoadingState label="Matching you with a nearby driver…" /> : null}
        {matched ? (
          <>
            <AppText variant="title" center>
              Driver on the way
            </AppText>
            <Button
              label="Track your ride"
              onPress={() => navigation.navigate('LiveTracking', { kind: 'ride', tripId })}
            />
          </>
        ) : null}
      </View>
    </Screen>
  );
}
