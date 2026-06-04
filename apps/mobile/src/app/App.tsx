/**
 * App root.
 *
 * Provider order (outer -> inner):
 *   GestureHandlerRootView   gesture/bottom-sheet support
 *   SafeAreaProvider         insets
 *   QueryClientProvider      server/cache state (React Query)
 *   ThemeProvider            design tokens + scheme
 *   ApiProvider              typed API hooks
 *   NavigationContainer      themed + deep-linking
 */
import React from 'react';
import { View } from 'react-native';
import { registerRootComponent } from 'expo';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  type Theme,
} from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiProvider } from './providers/ApiContext';
import { ThemeProvider, useTheme } from './providers/ThemeContext';
import { useAuthStore } from '../stores/authStore';
import { RootNavigator } from '../navigation';
import { linking } from '../navigation/linking';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false },
  },
});

function NavigationRoot(): React.JSX.Element {
  const { colors, scheme } = useTheme();
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme: Theme = {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.brand,
      background: colors.background,
      card: colors.surface,
      text: colors.textPrimary,
      border: colors.border,
    },
  };

  // Wait for the persisted session to hydrate before deciding Auth vs App,
  // so we don't flash the sign-in screen for an already-authenticated user.
  if (!isHydrated) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <NavigationContainer theme={navTheme} linking={linking}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <ApiProvider>
              <NavigationRoot />
            </ApiProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

registerRootComponent(App);
