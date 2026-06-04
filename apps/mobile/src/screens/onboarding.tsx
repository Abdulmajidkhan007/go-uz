/**
 * Onboarding: service intro + permission priming.
 * Reachable on first run; kept lightweight and skippable.
 */
import React, { useState } from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getCurrentLocation } from '../lib/location';
import type { OnboardingStackParamList } from '../navigation/types';
import { AppText, Button, Screen } from '../components/ui';

type Props<S extends keyof OnboardingStackParamList> = NativeStackScreenProps<
  OnboardingStackParamList,
  S
>;

export function ServiceIntroScreen({ navigation }: Props<'ServiceIntro'>): React.JSX.Element {
  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', gap: 12 }}>
        <AppText variant="display">Welcome to Vroom</AppText>
        <AppText variant="subtitle" muted>
          Book rides and send parcels in a few taps. Live tracking, transparent pricing.
        </AppText>
      </View>
      <Button label="Continue" onPress={() => navigation.navigate('Permissions')} />
    </Screen>
  );
}

export function PermissionsScreen(_props: Props<'Permissions'>): React.JSX.Element {
  const [granted, setGranted] = useState<boolean | null>(null);

  async function onAllow(): Promise<void> {
    const result = await getCurrentLocation();
    setGranted(result.granted);
  }

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', gap: 12 }}>
        <AppText variant="title">Enable location</AppText>
        <AppText variant="subtitle" muted>
          We use your location to set your pickup point and find nearby drivers.
        </AppText>
        {granted === false ? (
          <AppText variant="caption" muted>
            Location is off — you can still search addresses manually.
          </AppText>
        ) : null}
      </View>
      <Button label="Allow location" onPress={onAllow} />
    </Screen>
  );
}
