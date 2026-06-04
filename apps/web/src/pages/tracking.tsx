/**
 * Live tracking — rides and deliveries. The order kind comes from the
 * `?kind=` query param; the id is the route param.
 */
import React from 'react';
import { Button, Card, CardContent, Chip, Container, Stack, Typography } from '@mui/material';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { DeliveryId, Driver, TripId } from '@vroom/types';
import {
  driverSummary,
  getDeliveryStatusPresentation,
  getTripStatusPresentation,
} from '@vroom/ui';
import { lightTheme, darkTheme } from '@vroom/theme';
import { useApi } from '../app/providers/api';
import { useUiStore } from '../stores/uiStore';
import { paths } from '../router/paths';
import { LoadingState, ErrorState } from '../components/States';
import { MapPanel } from '../components/MapPanel';

export function TrackingPage(): React.JSX.Element {
  const navigate = useNavigate();
  const params = useParams();
  const [search] = useSearchParams();
  const kind = search.get('kind') === 'delivery' ? 'delivery' : 'ride';
  const orderId = params.orderId ?? '';
  const scheme = useUiStore((s) => s.colorScheme);
  const colors = scheme === 'dark' ? darkTheme : lightTheme;
  const { useTrip, useDelivery, useCancelTrip, useCancelDelivery } = useApi();

  // Hooks must run unconditionally; the inactive one is fed a null id.
  const trip = useTrip(kind === 'ride' && orderId ? (orderId as TripId) : null);
  const delivery = useDelivery(kind === 'delivery' && orderId ? (orderId as DeliveryId) : null);
  const cancelTrip = useCancelTrip();
  const cancelDelivery = useCancelDelivery();

  const onDone = (): void => navigate(paths.app.home);

  if (kind === 'ride') {
    if (trip.isPending) return <LoadingState />;
    if (trip.isError || !trip.data) return <ErrorState onRetry={() => trip.refetch()} />;
    const { status } = trip.data;
    const p = getTripStatusPresentation(status, colors);
    const driver: Driver | undefined =
      status.kind === 'driver_assigned' || status.kind === 'arriving' || status.kind === 'in_progress'
        ? status.driver
        : undefined;
    const done = status.kind === 'completed';
    const terminal = done || status.kind === 'cancelled';
    return (
      <Container maxWidth="sm">
        <Stack spacing={2}>
          <MapPanel markers={trip.data.route ?? []} height={260} />
          <Chip label={p.label} sx={{ alignSelf: 'flex-start', bgcolor: `${p.color}22` }} />
          {driver ? (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary">Your driver</Typography>
                <Typography fontWeight={700}>{driverSummary(driver)}</Typography>
              </CardContent>
            </Card>
          ) : null}
          {done ? (
            <Button variant="contained" onClick={onDone}>Done</Button>
          ) : (
            <Button
              color="error"
              variant="outlined"
              disabled={terminal || cancelTrip.isPending}
              onClick={() => cancelTrip.mutate({ tripId: orderId as TripId, reason: 'changed_plans' })}
            >
              Cancel ride
            </Button>
          )}
        </Stack>
      </Container>
    );
  }

  if (delivery.isPending) return <LoadingState />;
  if (delivery.isError || !delivery.data) return <ErrorState onRetry={() => delivery.refetch()} />;
  const { status } = delivery.data;
  const p = getDeliveryStatusPresentation(status, colors);
  const courier: Driver | undefined = 'courier' in status ? status.courier : undefined;
  const done = status.kind === 'delivered';
  const terminal = done || status.kind === 'cancelled' || status.kind === 'returned';
  return (
    <Container maxWidth="sm">
      <Stack spacing={2}>
        <MapPanel markers={[delivery.data.pickup.geo, delivery.data.dropoff.geo]} height={260} />
        <Chip label={p.label} sx={{ alignSelf: 'flex-start', bgcolor: `${p.color}22` }} />
        {courier ? (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="body2" color="text.secondary">Your courier</Typography>
              <Typography fontWeight={700}>{driverSummary(courier)}</Typography>
            </CardContent>
          </Card>
        ) : null}
        {done ? (
          <Button variant="contained" onClick={onDone}>Done</Button>
        ) : (
          <Button
            color="error"
            variant="outlined"
            disabled={terminal || cancelDelivery.isPending}
            onClick={() => cancelDelivery.mutate({ deliveryId: orderId as DeliveryId, reason: 'changed_plans' })}
          >
            Cancel delivery
          </Button>
        )}
      </Stack>
    </Container>
  );
}
