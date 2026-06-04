/**
 * Profile & settings: profile summary, saved addresses, settings.
 */
import React from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useApi } from '../app/providers/ApiContext';
import { useTheme } from '../app/providers/ThemeContext';
import { useAuthStore } from '../stores/authStore';
import type { ProfileStackParamList } from '../navigation/types';
import {
  AppText,
  Button,
  Card,
  EmptyState,
  ErrorState,
  ListRow,
  LoadingState,
  Screen,
} from '../components/ui';

type Props<S extends keyof ProfileStackParamList> = NativeStackScreenProps<
  ProfileStackParamList,
  S
>;

export function ProfileScreen({ navigation }: Props<'Profile'>): React.JSX.Element {
  const { useMe } = useApi();
  const me = useMe();

  return (
    <Screen scroll>
      {me.isPending ? <LoadingState /> : null}
      {me.isError ? <ErrorState onRetry={() => me.refetch()} /> : null}
      {me.data ? (
        <Card>
          <AppText variant="title">{me.data.displayName}</AppText>
          <AppText variant="caption" muted>{me.data.phone}</AppText>
        </Card>
      ) : null}
      <ListRow title="Saved addresses" onPress={() => navigation.navigate('Addresses')} />
      <ListRow title="Settings" onPress={() => navigation.navigate('Settings')} />
      <ListRow title="Help & support" onPress={() => navigation.navigate('Tickets')} />
      <ListRow title="FAQ" onPress={() => navigation.navigate('FAQ')} />
    </Screen>
  );
}

export function AddressesScreen(_props: Props<'Addresses'>): React.JSX.Element {
  const { useAddresses } = useApi();
  const addresses = useAddresses();

  if (addresses.isPending) return <Screen><LoadingState /></Screen>;
  if (addresses.isError) return <Screen><ErrorState onRetry={() => addresses.refetch()} /></Screen>;
  if (addresses.data.addresses.length === 0) {
    return <Screen><EmptyState title="No saved places" caption="Add home and work for faster booking." /></Screen>;
  }

  return (
    <Screen scroll>
      <AppText variant="title">Saved places</AppText>
      {addresses.data.addresses.map((a) => (
        <ListRow key={a.id} title={a.label} subtitle={a.formatted} />
      ))}
    </Screen>
  );
}

export function SettingsScreen(_props: Props<'Settings'>): React.JSX.Element {
  const { scheme, toggleScheme } = useTheme();
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <Screen scroll>
      <AppText variant="title">Settings</AppText>
      <View style={{ gap: 4 }}>
        <ListRow title="Theme" trailing={scheme === 'dark' ? 'Dark' : 'Light'} onPress={toggleScheme} />
        <ListRow title="Language" trailing="English" />
        <ListRow title="Notifications" trailing="On" />
        <ListRow title="Privacy" />
        <ListRow title="Legal" />
      </View>
      <Button label="Sign out" variant="danger" onPress={signOut} />
    </Screen>
  );
}
