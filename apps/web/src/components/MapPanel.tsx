/**
 * MapPanel — Google Maps (JS) panel for the web app.
 *
 * Reads the key from VITE_GOOGLE_MAPS_KEY. When the key is absent it renders a
 * styled fallback so local dev and CI builds work without Google billing.
 */
import React from 'react';
import { Box, Typography } from '@mui/material';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import type { GeoPoint } from '@vroom/types';
import { MAP_DEFAULTS } from '@vroom/constants';

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY as string | undefined;

export interface MapPanelProps {
  /** Optional camera center; defaults to the shared MAP_DEFAULTS center. */
  center?: GeoPoint;
  /** Pins to render. */
  markers?: readonly GeoPoint[];
  zoom?: number;
  height?: number | string;
}

export function MapPanel({
  center = MAP_DEFAULTS.center,
  markers = [],
  zoom = MAP_DEFAULTS.zoom,
  height = '100%',
}: MapPanelProps): React.JSX.Element {
  if (!GOOGLE_MAPS_KEY) {
    return (
      <Box
        sx={{
          height,
          minHeight: 220,
          borderRadius: 3,
          bgcolor: 'action.hover',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Typography color="text.secondary">
          Map — set VITE_GOOGLE_MAPS_KEY to enable
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height, minHeight: 220, borderRadius: 3, overflow: 'hidden' }}>
      <APIProvider apiKey={GOOGLE_MAPS_KEY}>
        <Map
          defaultCenter={{ lat: center.lat, lng: center.lng }}
          defaultZoom={zoom}
          gestureHandling="greedy"
          disableDefaultUI
          style={{ width: '100%', height: '100%' }}
        >
          {markers.map((m, i) => (
            <Marker key={`${m.lat},${m.lng},${i}`} position={{ lat: m.lat, lng: m.lng }} />
          ))}
        </Map>
      </APIProvider>
    </Box>
  );
}
