/**
 * Support tickets queue.
 */
import React from 'react';
import { Box, Card, Chip, Stack, Typography } from '@mui/material';
import { useApi } from '../app/api';
import { LoadingState, ErrorState, EmptyState } from '../components/States';

export function TicketsPage(): React.JSX.Element {
  const { useTickets } = useApi();
  const tickets = useTickets();

  if (tickets.isPending) return <LoadingState />;
  if (tickets.isError) return <ErrorState onRetry={() => tickets.refetch()} />;
  if (tickets.data.length === 0) return <EmptyState title="No open tickets" />;

  return (
    <Stack spacing={2}>
      <Typography variant="h4" fontWeight={700}>
        Support
      </Typography>
      <Card variant="outlined">
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
              <th>Subject</th>
              <th>Category</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tickets.data.map((t) => (
              <tr key={t.id}>
                <td>{t.subject}</td>
                <td>{t.category}</td>
                <td>
                  <Chip size="small" label={t.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </Box>
      </Card>
    </Stack>
  );
}
