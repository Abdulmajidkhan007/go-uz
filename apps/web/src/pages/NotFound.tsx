import React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { paths } from '../router/paths';

export function NotFoundPage(): React.JSX.Element {
  const navigate = useNavigate();
  return (
    <Box sx={{ minHeight: '60dvh', display: 'grid', placeItems: 'center' }}>
      <Stack spacing={2} alignItems="center">
        <Typography variant="h3" fontWeight={800}>
          404
        </Typography>
        <Typography color="text.secondary">This page doesn't exist.</Typography>
        <Button variant="contained" onClick={() => navigate(paths.app.home)}>
          Go home
        </Button>
      </Stack>
    </Box>
  );
}
