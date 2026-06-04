/**
 * Orders — full order list with state filtering.
 */
import React, { useState } from 'react';
import {
  Box,
  Card,
  Chip,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import type { OrderKind } from '@vroom/types';
import { useApi } from '../app/api';
import { paths } from '../paths';
import { LoadingState, ErrorState, EmptyState } from '../components/States';

type Filter = 'all' | OrderKind;

export function OrdersPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { useOrders } = useApi();
  const orders = useOrders();
  const [filter, setFilter] = useState<Filter>('all');

  if (orders.isPending) return <LoadingState />;
  if (orders.isError) return <ErrorState onRetry={() => orders.refetch()} />;

  const items = orders.data.items.filter((o) => filter === 'all' || o.kind === filter);

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Typography variant="h4" fontWeight={700}>
          Orders
        </Typography>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={filter}
          onChange={(_e, v: Filter | null) => v && setFilter(v)}
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="ride">Rides</ToggleButton>
          <ToggleButton value="delivery">Deliveries</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {items.length === 0 ? (
        <EmptyState title="No orders" />
      ) : (
        <Card variant="outlined">
          <Box sx={{ overflowX: 'auto' }}>
            <Box
              component="table"
              sx={{
                width: '100%',
                borderCollapse: 'collapse',
                '& td, & th': { textAlign: 'left', p: 1.5, borderBottom: 1, borderColor: 'divider' },
              }}
            >
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Kind</th>
                  <th>State</th>
                </tr>
              </thead>
              <tbody>
                {items.map((o) => (
                  <Box
                    component="tr"
                    key={o.id}
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                    onClick={() => navigate(paths.orderDetail(o.id))}
                  >
                    <td>{o.refId}</td>
                    <td>{o.kind}</td>
                    <td>
                      <Chip size="small" label={o.state} />
                    </td>
                  </Box>
                ))}
              </tbody>
            </Box>
          </Box>
        </Card>
      )}
    </Stack>
  );
}

export function OrderDetailPage(): React.JSX.Element {
  const params = useParams();
  const orderId = params.orderId ?? '';
  const { useOrders } = useApi();
  const orders = useOrders();
  const order = orders.data?.items.find((o) => o.id === orderId);

  if (orders.isPending) return <LoadingState />;
  if (!order) return <ErrorState message="Order not found." />;

  return (
    <Stack spacing={2}>
      <Typography variant="h4" fontWeight={700}>
        Order {order.refId}
      </Typography>
      <Card variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Typography>
            <b>ID:</b> {order.id}
          </Typography>
          <Typography>
            <b>Kind:</b> {order.kind}
          </Typography>
          <Typography>
            <b>State:</b> <Chip size="small" label={order.state} />
          </Typography>
          <Typography>
            <b>Created:</b> {order.createdAt}
          </Typography>
        </Stack>
      </Card>
    </Stack>
  );
}
