/**
 * Authentication & onboarding screens.
 * Phone -> OTP -> session. Mock backend accepts any E.164 phone and any
 * 6-digit code (demo: 000000).
 */
import React, { useState } from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { phoneSchema } from '@vroom/validation';

const OTP_PATTERN = /^\d{6}$/;
import { apiClient } from '../app/bootstrap';
import { useAuthStore } from '../stores/authStore';
import type { AuthStackParamList } from '../navigation/types';
import { AppText, Button, Field, Screen } from '../components/ui';

type Props<S extends keyof AuthStackParamList> = NativeStackScreenProps<AuthStackParamList, S>;

export function WelcomeScreen({ navigation }: Props<'Welcome'>): React.JSX.Element {
  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', gap: 12 }}>
        <AppText variant="display">Vroom</AppText>
        <AppText variant="subtitle" muted>
          Rides and parcel delivery — one app to move people and things across the city.
        </AppText>
      </View>
      <View style={{ gap: 12 }}>
        <Button label="Get started" onPress={() => navigation.navigate('PhoneEntry')} />
      </View>
    </Screen>
  );
}

export function PhoneEntryScreen({ navigation }: Props<'PhoneEntry'>): React.JSX.Element {
  const [phone, setPhone] = useState('+998');
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  async function onContinue(): Promise<void> {
    const parsed = phoneSchema.safeParse(phone);
    if (!parsed.success) {
      setError('Enter a valid phone number.');
      return;
    }
    setError(undefined);
    setSubmitting(true);
    const res = await apiClient.auth.requestOtp({ phone: parsed.data });
    setSubmitting(false);
    if (res.ok) {
      navigation.navigate('OtpVerify', { phone: parsed.data, challengeId: res.value.challengeId });
    } else {
      setError('Could not send the code. Try again.');
    }
  }

  return (
    <Screen scroll>
      <AppText variant="title">What's your number?</AppText>
      <AppText variant="caption" muted>
        We'll text you a 6-digit verification code.
      </AppText>
      <Field
        label="Phone number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        autoFocus
        error={error}
      />
      <Button label="Send code" loading={submitting} onPress={onContinue} />
    </Screen>
  );
}

export function OtpVerifyScreen({ navigation, route }: Props<'OtpVerify'>): React.JSX.Element {
  const { phone, challengeId } = route.params;
  const setSession = useAuthStore((s) => s.setSession);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  async function onVerify(): Promise<void> {
    if (!OTP_PATTERN.test(code)) {
      setError('Enter the 6-digit code.');
      return;
    }
    setError(undefined);
    setSubmitting(true);
    const res = await apiClient.auth.verifyOtp({ challengeId, code });
    setSubmitting(false);
    if (res.ok) {
      // Setting the session flips RootNavigator to the authenticated stack.
      setSession(res.value);
    } else {
      setError('That code is incorrect. Try again.');
    }
  }

  return (
    <Screen scroll>
      <AppText variant="title">Enter your code</AppText>
      <AppText variant="caption" muted>
        Sent to {phone}. Demo code: 000000
      </AppText>
      <Field
        label="Verification code"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        maxLength={6}
        autoFocus
        error={error}
      />
      <Button label="Verify" loading={submitting} onPress={onVerify} />
      <Button label="Use a different number" variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  );
}

export function ProfileSetupScreen({ navigation }: Props<'ProfileSetup'>): React.JSX.Element {
  const [name, setName] = useState('');
  return (
    <Screen scroll>
      <AppText variant="title">Tell us your name</AppText>
      <AppText variant="caption" muted>
        This is how drivers and couriers will see you.
      </AppText>
      <Field label="Full name" value={name} onChangeText={setName} autoFocus />
      <Button label="Continue" onPress={() => navigation.goBack()} />
    </Screen>
  );
}
