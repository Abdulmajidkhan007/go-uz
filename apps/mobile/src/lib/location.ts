/**
 * Location helper (bare React Native CLI).
 *
 * Backed by @react-native-community/geolocation. Requires native setup:
 *   - Android: ACCESS_FINE_LOCATION in AndroidManifest (autolinked module).
 *   - iOS: NSLocationWhenInUseUsageDescription in Info.plist + pod install.
 * See docs/mobile-rn-cli-migration.md.
 */
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import type { GeoPoint } from '@vroom/types';

export interface LocationResult {
  granted: boolean;
  point?: GeoPoint;
}

async function ensurePermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    return status === PermissionsAndroid.RESULTS.GRANTED;
  }
  // iOS: prompt via the native module.
  return new Promise((resolve) => {
    Geolocation.requestAuthorization(
      () => resolve(true),
      () => resolve(false),
    );
  });
}

export async function getCurrentLocation(): Promise<LocationResult> {
  const granted = await ensurePermission();
  if (!granted) return { granted: false };

  return new Promise((resolve) => {
    Geolocation.getCurrentPosition(
      (position) =>
        resolve({
          granted: true,
          point: { lat: position.coords.latitude, lng: position.coords.longitude },
        }),
      // Permission granted but the fix failed (timeout / no signal): still
      // report granted so the UI can proceed without coordinates.
      () => resolve({ granted: true }),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  });
}
