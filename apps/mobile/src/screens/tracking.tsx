/**
 * Live tracking — one screen for both rides and deliveries (discriminated by
 * route param `kind`). Polls the order via React Query until a terminal state.
 */
import React from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Driver } from '@vroom/types';
import {
  driverSummary,
  getDeliveryStatusPresentation,
  getTripStatusPresentation,
} from '@vroom/ui';
import { useApi } from '../app/providers/ApiContext';
import { useTheme } from '../app/providers/ThemeContext';
import type { HomeStackParamList } from '../navigation/types';
import { AppText, Button, Card, ErrorState, LoadingState, Screen } from '../components/ui';

type Props = NativeStackScreenProps<HomeStackParamList, 'LiveTracking'>;

export function LiveTrackingScreen({ navigation, route }: Props): React.JSX.Element {
  if (route.params.kind === 'ride') {
    return <RideTracking tripId={route.params.tripId} onDone={() => navigation.navigate('Home')} />;
  }
  return (
    <DeliveryTracking deliveryId={route.params.deliveryId} onDone={() => navigation.navigate('Home')} />
  );
}

function RideTracking({
  tripId,
  onDone,
}: {
  tripId: HomeStackParamList['Searching']['tripId'];
  onDone: () => void;
}): React.JSX.Element {
  const { colors } = useTheme();
  const { useTrip, useCancelTrip } = useApi();
  const trip = useTrip(tripId);
  const cancel = useCancelTrip();

  if (trip.isPending) return <Screen><LoadingState /></Screen>;
  if (trip.isError || !trip.data) {
    return <Screen><ErrorState onRetry={() => trip.refetch()} /></Screen>;
  }

  const { status } = trip.data;
  const presentation = getTripStatusPresentation(status, colors);
  const driver: Driver | undefined =
    status.kind === 'driver_assigned' ||
    status.kind === 'arriving' ||
    status.kind === 'in_progress'
      ? status.driver
      : undefined;
  const terminal = status.kind === 'completed' || status.kind === 'cancelled';

  return (
    <Screen scroll>
      <MapPlaceholder />
      <StatusBadge label={presentation.label} color={presentation.color} />
      {driver ? (
        <Card>
          <AppText variant="caption" muted>Your driver</AppText>
          <AppText variant="subtitle">{driverSummary(driver)}</AppText>
        </Card>
      ) : null}
      {status.kind === 'completed' ? (
        <Button label="Done" onPress={onDone} />
      ) : (
        <Button
          label="Cancel ride"
          variant="danger"
          loading={cancel.isPending}
          disabled={terminal}
          onPress={() => cancel.mutate({ tripId, reason: 'changed_plans' })}
        />
      )}
    </Screen>
  );
}

function DeliveryTracking({
  deliveryId,
  onDone,
}: {
  deliveryId: Extract<HomeStackParamList['LiveTracking'], { kind: 'delivery' }>['deliveryId'];
  onDone: () => void;
}): React.JSX.Element {
  const { colors } = useTheme();
  const { useDelivery, useCancelDelivery } = useApi();
  const delivery = useDelivery(deliveryId);
  const cancel = useCancelDelivery();

  if (delivery.isPending) return <Screen><LoadingState /></Screen>;
  if (delivery.isError || !delivery.data) {
    return <Screen><ErrorState onRetry={() => delivery.refetch()} /></Screen>;
  }

  const { status } = delivery.data;
  const presentation = getDeliveryStatusPresentation(status, colors);
  const courier: Driver | undefined = 'courier' in status ? status.courier : undefined;
  const terminal =
    status.kind === 'delivered' || status.kind === 'cancelled' || status.kind === 'returned';

  return (
    <Screen scroll>
      <MapPlaceholder />
      <StatusBadge label={presentation.label} color={presentation.color} />
      {courier ? (
        <Card>
          <AppText variant="caption" muted>Your courier</AppText>
          <AppText variant="subtitle">{driverSummary(courier)}</AppText>
        </Card>
      ) : null}
      {status.kind === 'delivered' ? (
        <Button label="Done" onPress={onDone} />
      ) : (
        <Button
          label="Cancel delivery"
          variant="danger"
          loading={cancel.isPending}
          disabled={terminal}
          onPress={() => cancel.mutate({ deliveryId, reason: 'changed_plans' })}
        />
      )}
    </Screen>
  );
}

function MapPlaceholder(): React.JSX.Element {
  const { colors } = useTheme();
  return (
    <View
      style={{
        height: 220,
        borderRadius: 16,
        backgroundColor: colors.surfaceElevated,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AppText variant="caption" muted>Live route</AppText>
    </View>
  );
}

function StatusBadge({ label, color }: { label: string; color: string }): React.JSX.Element {
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: `${color}22`,
      }}
    >
      <AppText variant="caption">{label}</AppText>
    </View>
  );
}
