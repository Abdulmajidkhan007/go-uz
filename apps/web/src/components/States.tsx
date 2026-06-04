/**
 * Universal data-state views for the web app: loading / error / empty.
 */
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

export function ErrorState({
  message = 'Something went wrong.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}): React.JSX.Element {
  return (
    <Box sx={{ display: 'grid', placeItems: 'center', gap: 2, py: 8, textAlign: 'center' }}>
      <Typography>{message}</Typography>
      {onRetry ? (
        <Button variant="outlined" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </Box>
  );
}

export function EmptyState({
  title,
  caption,
  cta,
  onCta,
}: {
  title: string;
  caption?: string;
  cta?: string;
  onCta?: () => void;
}): React.JSX.Element {
  return (
    <Box sx={{ display: 'grid', placeItems: 'center', gap: 2, py: 8, textAlign: 'center' }}>
      <Typography variant="h6">{title}</Typography>
      {caption ? <Typography color="text.secondary">{caption}</Typography> : null}
      {cta && onCta ? (
        <Button variant="contained" onClick={onCta}>
          {cta}
        </Button>
      ) : null}
    </Box>
  );
}
