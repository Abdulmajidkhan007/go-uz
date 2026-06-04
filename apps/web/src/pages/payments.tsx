/**
 * Payments & wallet: methods, add card, wallet, promos.
 */
import React, { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  Container,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { formatMoney } from '@vroom/utils';
import { useApi } from '../app/providers/api';
import { paths } from '../router/paths';
import { LoadingState, ErrorState, EmptyState } from '../components/States';

export function PaymentsPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { usePaymentMethods } = useApi();
  const methods = usePaymentMethods();

  return (
    <Container maxWidth="sm">
      <Stack spacing={2}>
        <Typography variant="h4" fontWeight={700}>
          Payment methods
        </Typography>
        {methods.isPending ? <LoadingState /> : null}
        {methods.isError ? <ErrorState onRetry={() => methods.refetch()} /> : null}
        {methods.data?.map((m) => (
          <Card key={m.id} variant="outlined">
            <CardContent>
              <Typography fontWeight={700}>
                {m.type === 'card' ? `Card ·· ${m.last4 ?? ''}` : m.type === 'wallet' ? 'Vroom wallet' : 'Cash'}
              </Typography>
              {m.isDefault ? (
                <Typography variant="body2" color="text.secondary">
                  Default
                </Typography>
              ) : null}
            </CardContent>
          </Card>
        ))}
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => navigate(paths.app.payments.addCard)}>
            Add card
          </Button>
          <Button variant="text" onClick={() => navigate(paths.app.payments.wallet)}>
            Wallet
          </Button>
          <Button variant="text" onClick={() => navigate(paths.app.payments.promos)}>
            Promos
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}

export function AddCardPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { useAddPaymentMethod } = useApi();
  const addCard = useAddPaymentMethod();
  const [last4, setLast4] = useState('');
  const [expiry, setExpiry] = useState('');

  function onSave(): void {
    addCard.mutate(
      { type: 'card', brand: 'visa', last4: last4 || '4242', expiry: expiry || '12/28', token: 'tok_demo' },
      { onSuccess: () => navigate(paths.app.payments.root) },
    );
  }

  return (
    <Container maxWidth="xs">
      <Stack spacing={2}>
        <Typography variant="h4" fontWeight={700}>
          Add a card
        </Typography>
        <TextField label="Card number (last 4)" value={last4} onChange={(e) => setLast4(e.target.value)} inputProps={{ maxLength: 4 }} />
        <TextField label="Expiry (MM/YY)" value={expiry} onChange={(e) => setExpiry(e.target.value)} inputProps={{ maxLength: 5 }} />
        <Button variant="contained" disabled={addCard.isPending} onClick={onSave}>
          Save card
        </Button>
      </Stack>
    </Container>
  );
}

export function WalletPage(): React.JSX.Element {
  const { useWallet } = useApi();
  const wallet = useWallet();

  if (wallet.isPending) return <LoadingState />;
  if (wallet.isError || !wallet.data) return <ErrorState onRetry={() => wallet.refetch()} />;

  return (
    <Container maxWidth="sm">
      <Stack spacing={2}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Balance
            </Typography>
            <Typography variant="h3" fontWeight={800}>
              {formatMoney(wallet.data.balance, 'en')}
            </Typography>
          </CardContent>
        </Card>
        <Typography variant="h6">Transactions</Typography>
        {wallet.data.transactions.length === 0 ? (
          <EmptyState title="No transactions yet" />
        ) : (
          <Card variant="outlined">
            <List>
              {wallet.data.transactions.map((t) => (
                <ListItem key={t.id} secondaryAction={<Typography>{formatMoney(t.amount, 'en')}</Typography>}>
                  <ListItemText primary={t.memo ?? t.kind} secondary={t.kind} />
                </ListItem>
              ))}
            </List>
          </Card>
        )}
      </Stack>
    </Container>
  );
}

export function PromosPage(): React.JSX.Element {
  const { useValidatePromo } = useApi();
  const [code, setCode] = useState('');
  const promo = useValidatePromo(code.trim().length >= 3 ? code.trim().toUpperCase() : null);

  return (
    <Container maxWidth="xs">
      <Stack spacing={2}>
        <Typography variant="h4" fontWeight={700}>
          Promo codes
        </Typography>
        <TextField label="Enter a code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
        {promo.isFetching ? <LoadingState label="Checking…" /> : null}
        {promo.data ? (
          <Card variant="outlined">
            <CardContent>
              <Typography fontWeight={700}>{promo.data.code}</Typography>
              <Typography variant="body2" color="text.secondary">
                {promo.data.kind === 'percent' ? `${promo.data.value}% off` : 'Fixed discount'} · {promo.data.status}
              </Typography>
            </CardContent>
          </Card>
        ) : null}
        {promo.isError && code.trim().length >= 3 ? (
          <Typography color="text.secondary">That code isn't valid.</Typography>
        ) : null}
      </Stack>
    </Container>
  );
}
