/**
 * Activity: order history list + order detail.
 */
import React from 'react';
import {
  Card,
  CardContent,
  Chip,
  Container,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useApi } from '../app/providers/api';
import { paths } from '../router/paths';
import { LoadingState, ErrorState, EmptyState } from '../components/States';

export function HistoryPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { useOrders } = useApi();
  const orders = useOrders();

  if (orders.isPending) return <LoadingState />;
  if (orders.isError) return <ErrorState message="Couldn't load your history." onRetry={() => orders.refetch()} />;
  if (orders.data.items.length === 0) {
    return <EmptyState title="No trips yet" caption="Your rides and deliveries will appear here." />;
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Activity
      </Typography>
      <Card variant="outlined">
        <List>
          {orders.data.items.map((o) => (
            <ListItemButton key={o.id} onClick={() => navigate(paths.app.orderDetail(o.id))}>
              <ListItemText primary={o.kind === 'ride' ? 'Ride' : 'Delivery'} secondary={o.refId} />
              <Chip size="small" label={o.state} />
            </ListItemButton>
          ))}
        </List>
      </Card>
    </Container>
  );
}

export function OrderDetailPage(): React.JSX.Element {
  const params = useParams();
  const orderId = params.orderId ?? '';
  return (
    <Container maxWidth="sm">
      <Stack spacing={2}>
        <Typography variant="h4" fontWeight={700}>
          Order details
        </Typography>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="body2" color="text.secondary">Order</Typography>
            <Typography>{orderId}</Typography>
          </CardContent>
        </Card>
        <Typography color="text.secondary">
          Receipts and the full payment breakdown render here once the order completes.
        </Typography>
      </Stack>
    </Container>
  );
}
