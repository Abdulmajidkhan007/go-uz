/**
 * Dashboard — operational metrics derived from the orders feed.
 */
import React from 'react';
import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { Order, OrderState } from '@vroom/types';
import { useApi } from '../app/api';
import { paths } from '../paths';
import { LoadingState, ErrorState } from '../components/States';

function Stat({ label, value }: { label: string; value: number | string }): React.JSX.Element {
  return (
    <Card variant="outlined" sx={{ flex: 1, minWidth: 160 }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4" fontWeight={800}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

const ACTIVE: ReadonlyArray<OrderState> = ['placed', 'active', 'quoted'];

export function DashboardPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { useOrders } = useApi();
  const orders = useOrders();

  if (orders.isPending) return <LoadingState />;
  if (orders.isError) return <ErrorState onRetry={() => orders.refetch()} />;

  const items = orders.data.items;
  const count = (pred: (o: Order) => boolean): number => items.filter(pred).length;
  const recent = items.slice(0, 8);

  return (
    <Stack spacing={3}>
      <Typography variant="h4" fontWeight={700}>
        Dashboard
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Stat label="Total orders" value={items.length} />
        <Stat label="Active" value={count((o) => ACTIVE.includes(o.state))} />
        <Stat label="Completed" value={count((o) => o.state === 'completed')} />
        <Stat label="Cancelled / failed" value={count((o) => o.state === 'cancelled' || o.state === 'failed')} />
      </Box>

      <Typography variant="h6">Recent orders</Typography>
      <Card variant="outlined">
        <Box sx={{ overflowX: 'auto' }}>
          <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', '& td, & th': { textAlign: 'left', p: 1.5, borderBottom: 1, borderColor: 'divider' } }}>
            <thead>
              <tr>
                <th>Ref</th>
                <th>Kind</th>
                <th>State</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => (
                <Box component="tr" key={o.id} sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }} onClick={() => navigate(paths.orderDetail(o.id))}>
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
    </Stack>
  );
}
