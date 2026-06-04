/**
 * Home — map-first entry point with the ride/delivery service switcher.
 */
import React from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useApi } from '../app/providers/ApiContext';
import { useTheme } from '../app/providers/ThemeContext';
import type { HomeStackParamList } from '../navigation/types';
import { AppText, Card, Screen } from '../components/ui';
import { MapPanel } from '../components/MapPanel';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props): React.JSX.Element {
  const { colors } = useTheme();
  const { useMe } = useApi();
  const me = useMe();
  const greeting = me.data ? `Hi, ${me.data.displayName.split(' ')[0]}` : 'Where to?';

  return (
    <Screen padded={false}>
      {/* Map */}
      <MapPanel fill />

      {/* Service sheet */}
      <View
        style={{
          backgroundColor: colors.background,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          marginTop: -24,
          padding: 20,
          gap: 16,
        }}
      >
        <AppText variant="title">{greeting}</AppText>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Card
            style={{ flex: 1 }}
            onPress={() => navigation.navigate('SetDestination', { mode: 'ride' })}
          >
            <AppText variant="subtitle">Ride</AppText>
            <AppText variant="caption" muted>
              Get there fast
            </AppText>
          </Card>
          <Card
            style={{ flex: 1 }}
            onPress={() => navigation.navigate('ParcelDetails')}
          >
            <AppText variant="subtitle">Delivery</AppText>
            <AppText variant="caption" muted>
              Send a parcel
            </AppText>
          </Card>
        </View>
      </View>
    </Screen>
  );
}
