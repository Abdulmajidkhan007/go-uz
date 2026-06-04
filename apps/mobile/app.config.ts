import type { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Vroom',
  slug: 'vroom',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  scheme: 'vroom',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#5a35f0',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#5a35f0',
    },
    package: 'com.vroom.app',
    versionCode: 1,
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY ?? '',
      },
    },
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [
          {
            scheme: 'vroom',
          },
          {
            scheme: 'https',
            host: 'app.vroom.uz',
            pathPrefix: '/order',
          },
          {
            scheme: 'https',
            host: 'app.vroom.uz',
            pathPrefix: '/track',
          },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
  ios: {
    bundleIdentifier: 'com.vroom.app',
    supportsTablet: false,
    config: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY ?? '',
    },
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'Vroom needs your location to find nearby drivers and set your pickup point.',
      NSLocationAlwaysAndWhenInUseUsageDescription:
        'Vroom needs your location to track active rides.',
    },
  },
  extra: {
    EXPO_PUBLIC_VROOM_API_MODE: process.env.EXPO_PUBLIC_VROOM_API_MODE ?? 'mock',
    EXPO_PUBLIC_VROOM_API_BASE_URL: process.env.EXPO_PUBLIC_VROOM_API_BASE_URL,
  },
  plugins: [
    'expo-location',
    'expo-secure-store',
    [
      'expo-build-properties',
      {
        android: {
          compileSdkVersion: 35,
          targetSdkVersion: 35,
          minSdkVersion: 24,
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: false,
  },
});
