import React from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';

export function LoadingState({ label = 'Loading…' }: { label?: string }): React.JSX.Element {
  return (
    <Box sx={{ display: 'grid', placeItems: 'center', gap: 2, py: 8 }}>
      <CircularProgress />
      <Typography color="text.secondary">{label}</Typography>
    </Box>
  );
}

export function ErrorState({ message = 'Something went wrong.', onRetry }: { message?: string; onRetry?: () => void }): React.JSX.Element {
  return (
    <Box sx={{ display: 'grid', placeItems: 'center', gap: 2, py: 8, textAlign: 'center' }}>
      <Typography>{message}</Typography>
      {onRetry ? <Button variant="outlined" onClick={onRetry}>Try again</Button> : null}
    </Box>
  );
}

export function EmptyState({ title, caption }: { title: string; caption?: string }): React.JSX.Element {
  return (
    <Box sx={{ display: 'grid', placeItems: 'center', gap: 1, py: 8, textAlign: 'center' }}>
      <Typography variant="h6">{title}</Typography>
      {caption ? <Typography color="text.secondary">{caption}</Typography> : null}
    </Box>
  );
}
