/**
 * MapPanel — Google Maps (react-native-maps) for the mobile app.
 *
 * The Android/iOS Google Maps key is injected natively (see the native map
 * setup in docs/mobile-rn-cli-migration.md) and exposed to JS via
 * react-native-config (GOOGLE_MAPS_KEY). When unset we render a themed fallback
 * so the app still runs without a key.
 */
import React from 'react';
import { View } from 'react-native';
import Config from 'react-native-config';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import type { GeoPoint } from '@vroom/types';
import { MAP_DEFAULTS } from '@vroom/constants';
import { useTheme } from '../app/providers/ThemeContext';
import { AppText } from './ui';

const HAS_KEY = Boolean(Config.GOOGLE_MAPS_KEY);

export function MapPanel({
  center = MAP_DEFAULTS.center,
  markers = [],
  height = 220,
  fill = false,
}: {
  center?: GeoPoint;
  markers?: readonly GeoPoint[];
  height?: number;
  /** Fill the parent flex container instead of using a fixed height. */
  fill?: boolean;
}): React.JSX.Element {
  const { colors } = useTheme();
  const sizeStyle = fill ? { flex: 1 } : { height };

  if (!HAS_KEY) {
    return (
      <View
        style={{
          ...sizeStyle,
          backgroundColor: colors.surfaceElevated,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AppText variant="caption" muted>
          Map — set GOOGLE_MAPS_KEY
        </AppText>
      </View>
    );
  }

  return (
    <View style={{ ...sizeStyle, borderRadius: fill ? 0 : 16, overflow: 'hidden' }}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: center.lat,
          longitude: center.lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {markers.map((m, i) => (
          <Marker key={`${m.lat},${m.lng},${i}`} coordinate={{ latitude: m.lat, longitude: m.lng }} />
        ))}
      </MapView>
    </View>
  );
}
