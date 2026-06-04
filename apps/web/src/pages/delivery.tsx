/**
 * Delivery pages: Parcel -> Route -> Confirm.
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
import type { GeoPoint, Parcel, ParcelSizeClass } from '@vroom/types';
import { formatFareLine } from '@vroom/ui';
import { useApi } from '../app/providers/api';
import { useDeliveryDraftStore } from '../stores/deliveryDraftStore';
import { paths } from '../router/paths';
import { LoadingState, ErrorState } from '../components/States';

const SIZES: ReadonlyArray<{ value: ParcelSizeClass; label: string }> = [
  { value: 's', label: 'Small' },
  { value: 'm', label: 'Medium' },
  { value: 'l', label: 'Large' },
  { value: 'xl', label: 'XL' },
];
const TASHKENT: GeoPoint = { lat: 41.2995, lng: 69.2401 };

export function ParcelPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { parcelSizeClass, parcelDescription, setParcelSizeClass, setParcelDescription } =
    useDeliveryDraftStore();

  return (
    <Container maxWidth="sm">
      <Stack spacing={2}>
        <Typography variant="h4" fontWeight={700}>
          What are you sending?
        </Typography>
        <ToggleButtonGroup
          exclusive
          fullWidth
          value={parcelSizeClass}
          onChange={(_e, v: ParcelSizeClass | null) => v && setParcelSizeClass(v)}
        >
          {SIZES.map((s) => (
            <ToggleButton key={s.value} value={s.value}>
              {s.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <TextField
          label="Description"
          value={parcelDescription}
          onChange={(e) => setParcelDescription(e.target.value)}
          placeholder="e.g. Documents, food, electronics"
        />
        <Button size="large" variant="contained" onClick={() => navigate(paths.app.delivery.route)}>
          Continue
        </Button>
      </Stack>
    </Container>
  );
}

export function RoutePage(): React.JSX.Element {
  const navigate = useNavigate();
  const store = useDeliveryDraftStore();
  const [pickup, setPickupText] = useState('My location');
  const [dropoff, setDropoffText] = useState('');

  function onContinue(): void {
    store.setPickup({ placeId: 'pickup', label: pickup || 'My location', geo: TASHKENT });
    store.setDropoff({
      placeId: 'dropoff',
      label: dropoff || 'Drop-off',
      geo: { lat: TASHKENT.lat + 0.05, lng: TASHKENT.lng - 0.02 },
    });
    navigate(paths.app.delivery.confirm);
  }

  return (
    <Container maxWidth="sm">
      <Stack spacing={2}>
        <Typography variant="h4" fontWeight={700}>
          Pickup & drop-off
        </Typography>
        <TextField label="Pickup" value={pickup} onChange={(e) => setPickupText(e.target.value)} />
        <TextField label="Drop-off" value={dropoff} onChange={(e) => setDropoffText(e.target.value)} />
        <TextField
          label="Recipient name"
          value={store.recipientName}
          onChange={(e) => store.setRecipientName(e.target.value)}
        />
        <TextField
          label="Recipient phone"
          value={store.recipientPhone}
          onChange={(e) => store.setRecipientPhone(e.target.value)}
        />
        <Button size="large" variant="contained" disabled={dropoff.trim().length === 0} onClick={onContinue}>
          Continue
        </Button>
      </Stack>
    </Container>
  );
}

export function ConfirmDeliveryPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { useDeliveryQuote, useCreateDelivery, usePaymentMethods } = useApi();
  const store = useDeliveryDraftStore();
  const methods = usePaymentMethods();
  const createDelivery = useCreateDelivery();
  const [error, setError] = useState<string>();

  const quote = useDeliveryQuote(
    store.pickup && store.dropoff
      ? {
          pickup: store.pickup.geo,
          dropoff: store.dropoff.geo,
          parcel: { sizeClass: store.parcelSizeClass, fragile: false, weightKg: store.parcelWeightKg },
        }
      : null,
  );

  const defaultMethod = methods.data?.find((m) => m.isDefault) ?? methods.data?.[0];

  function onConfirm(): void {
    if (!quote.data || !defaultMethod) return;
    const parcel: Parcel = {
      sizeClass: store.parcelSizeClass,
      fragile: false,
      description: store.parcelDescription || 'Parcel',
      weightKg: store.parcelWeightKg,
    };
    setError(undefined);
    createDelivery.mutate(
      {
        quoteId: quote.data.id,
        recipient: { name: store.recipientName || 'Recipient', phone: store.recipientPhone || '+998000000000' },
        parcel,
        paymentMethodId: defaultMethod.id,
      },
      {
        onSuccess: (delivery) => {
          const id = delivery.id;
          store.reset();
          navigate(`${paths.app.track(id)}?kind=delivery`);
        },
        onError: () => setError('We could not create your delivery. Please try again.'),
      },
    );
  }

  return (
    <Container maxWidth="sm">
      <Stack spacing={2}>
        <Typography variant="h4" fontWeight={700}>
          Confirm delivery
        </Typography>
        {quote.isPending ? <LoadingState label="Estimating price…" /> : null}
        {quote.isError ? <ErrorState message="Couldn't estimate the price." onRetry={() => quote.refetch()} /> : null}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Price
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {quote.data ? formatFareLine(quote.data, 'en') : '—'}
            </Typography>
          </CardContent>
        </Card>
        {error ? <Typography color="error">{error}</Typography> : null}
        <Button
          size="large"
          variant="contained"
          disabled={!quote.data || !defaultMethod || createDelivery.isPending}
          onClick={onConfirm}
        >
          Send parcel
        </Button>
      </Stack>
    </Container>
  );
}
