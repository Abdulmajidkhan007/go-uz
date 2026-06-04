/**
 * Ride booking pages: Destination -> Vehicle -> Confirm -> Searching.
 */
import React, { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { GeoPoint, TripId, VehicleClass } from '@vroom/types';
import { VEHICLE_CLASS_LABELS } from '@vroom/constants';
import { formatFareLine } from '@vroom/ui';
import { useApi } from '../app/providers/api';
import { useRideDraftStore } from '../stores/rideDraftStore';
import { paths } from '../router/paths';
import { LoadingState, ErrorState } from '../components/States';

const RIDE_CLASSES: readonly VehicleClass[] = ['economy', 'comfort', 'xl'];
const TASHKENT: GeoPoint = { lat: 41.2995, lng: 69.2401 };

export function DestinationPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { setPickup, setDropoff, setVehicleClass } = useRideDraftStore();
  const [pickup, setPickupText] = useState('My location');
  const [dropoff, setDropoffText] = useState('');

  function onContinue(): void {
    setPickup({ placeId: 'pickup', label: pickup || 'My location', geo: TASHKENT });
    setDropoff({
      placeId: 'dropoff',
      label: dropoff || 'Destination',
      geo: { lat: TASHKENT.lat + 0.04, lng: TASHKENT.lng + 0.03 },
    });
    setVehicleClass('economy');
    navigate(paths.app.ride.vehicle);
  }

  return (
    <Container maxWidth="sm">
      <Stack spacing={2}>
        <Typography variant="h4" fontWeight={700}>
          Where to?
        </Typography>
        <TextField label="Pickup" value={pickup} onChange={(e) => setPickupText(e.target.value)} />
        <TextField
          label="Destination"
          value={dropoff}
          onChange={(e) => setDropoffText(e.target.value)}
          autoFocus
        />
        <Button size="large" variant="contained" disabled={dropoff.trim().length === 0} onClick={onContinue}>
          Continue
        </Button>
      </Stack>
    </Container>
  );
}

export function VehiclePage(): React.JSX.Element {
  const navigate = useNavigate();
  const { useRideQuote } = useApi();
  const draft = useRideDraftStore();
  const setVehicleClass = useRideDraftStore((s) => s.setVehicleClass);
  const setQuoteId = useRideDraftStore((s) => s.setQuoteId);
  const vehicleClass = draft.vehicleClass ?? 'economy';

  const quote = useRideQuote(
    draft.pickup && draft.dropoff
      ? { pickup: draft.pickup.geo, dropoff: draft.dropoff.geo, vehicleClass }
      : null,
  );

  function onConfirm(): void {
    if (quote.data) {
      setQuoteId(quote.data.id);
      navigate(paths.app.ride.confirm);
    }
  }

  return (
    <Container maxWidth="sm">
      <Stack spacing={2}>
        <Typography variant="h4" fontWeight={700}>
          Choose a ride
        </Typography>
        <ToggleButtonGroup
          exclusive
          fullWidth
          value={vehicleClass}
          onChange={(_e, v: VehicleClass | null) => v && setVehicleClass(v)}
        >
          {RIDE_CLASSES.map((cls) => (
            <ToggleButton key={cls} value={cls}>
              {VEHICLE_CLASS_LABELS[cls]}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {quote.isPending ? <LoadingState label="Estimating fare…" /> : null}
        {quote.isError ? <ErrorState message="Couldn't estimate the fare." onRetry={() => quote.refetch()} /> : null}

        <Card variant="outlined">
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Fare estimate
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {quote.data ? formatFareLine(quote.data, 'en') : '—'}
            </Typography>
          </CardContent>
        </Card>

        <Button size="large" variant="contained" disabled={!quote.data} onClick={onConfirm}>
          Confirm pickup
        </Button>
      </Stack>
    </Container>
  );
}

export function ConfirmRidePage(): React.JSX.Element {
  const navigate = useNavigate();
  const { usePaymentMethods, useRequestRide } = useApi();
  const draft = useRideDraftStore();
  const setActiveTripId = useRideDraftStore((s) => s.setActiveTripId);
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
          setActiveTripId(trip.id);
          navigate(paths.app.ride.searching);
        },
        onError: () => setError('We could not book your ride. Please try again.'),
      },
    );
  }

  return (
    <Container maxWidth="sm">
      <Stack spacing={2}>
        <Typography variant="h4" fontWeight={700}>
          Confirm your ride
        </Typography>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Route
            </Typography>
            <Typography>
              {draft.pickup?.label} → {draft.dropoff?.label}
            </Typography>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Payment
            </Typography>
            <Typography>
              {defaultMethod
                ? defaultMethod.type === 'card'
                  ? `Card ·· ${defaultMethod.last4 ?? ''}`
                  : defaultMethod.type
                : 'No payment method'}
            </Typography>
          </CardContent>
        </Card>
        {error ? <Typography color="error">{error}</Typography> : null}
        <Button
          size="large"
          variant="contained"
          disabled={!draft.quoteId || !defaultMethod || requestRide.isPending}
          onClick={onBook}
        >
          Book ride
        </Button>
      </Stack>
    </Container>
  );
}

export function SearchingPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { useTrip } = useApi();
  const activeTripId = useRideDraftStore((s) => s.activeTripId);
  const reset = useRideDraftStore((s) => s.reset);
  const trip = useTrip(activeTripId ? (activeTripId as TripId) : null);

  if (!activeTripId) return <ErrorState message="No active ride." onRetry={() => navigate(paths.app.home)} />;
  if (trip.isPending) return <LoadingState label="Finding your driver…" />;
  if (trip.isError || !trip.data) return <ErrorState onRetry={() => trip.refetch()} />;

  const status = trip.data.status.kind;
  const matched = status !== 'requested' && status !== 'matching' && status !== 'no_drivers';

  return (
    <Container maxWidth="sm">
      <Stack spacing={2} alignItems="center" sx={{ py: 6 }}>
        {!matched ? <LoadingState label="Matching you with a nearby driver…" /> : null}
        {matched ? (
          <>
            <Typography variant="h5" fontWeight={700}>
              Driver on the way
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                const id = activeTripId;
                reset();
                navigate(`${paths.app.track(id)}?kind=ride`);
              }}
            >
              Track your ride
            </Button>
          </>
        ) : null}
      </Stack>
    </Container>
  );
}
