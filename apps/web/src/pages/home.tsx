/**
 * Home — map panel + booking panel. Entry point to ride and delivery flows.
 */
import React from 'react';
import { Box, Button, Card, CardActionArea, CardContent, Stack, Typography } from '@mui/material';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../app/providers/api';
import { paths } from '../router/paths';
import { MapPanel } from '../components/MapPanel';

export function HomePage(): React.JSX.Element {
  const navigate = useNavigate();
  const { useMe } = useApi();
  const me = useMe();
  const greeting = me.data ? `Hi, ${me.data.displayName.split(' ')[0]}` : 'Where to?';

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 3,
        gridTemplateColumns: { xs: '1fr', md: '1fr 360px' },
        alignItems: 'start',
      }}
    >
      <Box sx={{ minHeight: { xs: 220, md: 520 } }}>
        <MapPanel height="100%" />
      </Box>

      <Stack spacing={2}>
        <Typography variant="h5" fontWeight={700}>
          {greeting}
        </Typography>

        <Card variant="outlined">
          <CardActionArea onClick={() => navigate(paths.app.ride.destination)}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <DirectionsCarRoundedIcon color="primary" />
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Ride
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Get there fast
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </CardActionArea>
        </Card>

        <Card variant="outlined">
          <CardActionArea onClick={() => navigate(paths.app.delivery.parcel)}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <LocalShippingRoundedIcon color="primary" />
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Delivery
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Send a parcel
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </CardActionArea>
        </Card>

        <Button variant="text" onClick={() => navigate(paths.app.activity)}>
          View activity
        </Button>
      </Stack>
    </Box>
  );
}
