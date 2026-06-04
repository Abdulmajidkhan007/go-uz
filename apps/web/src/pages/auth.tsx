/**
 * Auth pages: Welcome -> Phone -> OTP. Mock backend accepts any E.164 phone
 * and any 6-digit code (demo: 000000).
 */
import React, { useState } from 'react';
import { Box, Button, Container, Stack, TextField, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { phoneSchema } from '@vroom/validation';
import { apiClient } from '../app/providers/api';
import { useAuthStore } from '../stores/authStore';
import { paths } from '../router/paths';

const OTP_PATTERN = /^\d{6}$/;

export function WelcomePage(): React.JSX.Element {
  const navigate = useNavigate();
  return (
    <Box sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', p: 3 }}>
      <Container maxWidth="sm">
        <Stack spacing={3}>
          <Typography variant="h2" fontWeight={800} color="primary">
            Vroom
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Rides and parcel delivery — one app to move people and things across the city.
          </Typography>
          <Button size="large" variant="contained" onClick={() => navigate(paths.auth.phone)}>
            Get started
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}

export function PhonePage(): React.JSX.Element {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('+998');
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(): Promise<void> {
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
      navigate(paths.auth.otp, { state: { phone: parsed.data, challengeId: res.value.challengeId } });
    } else {
      setError('Could not send the code. Try again.');
    }
  }

  return (
    <Box sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', p: 3 }}>
      <Container maxWidth="xs">
        <Stack spacing={2}>
          <Typography variant="h4" fontWeight={700}>
            What's your number?
          </Typography>
          <TextField
            label="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={Boolean(error)}
            helperText={error ?? "We'll text you a 6-digit code."}
            autoFocus
          />
          <Button size="large" variant="contained" disabled={submitting} onClick={onSubmit}>
            Send code
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}

export function OtpPage(): React.JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? null) as { phone?: string; challengeId?: string } | null;
  const setSession = useAuthStore((s) => s.setSession);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  async function onVerify(): Promise<void> {
    if (!state?.challengeId) {
      navigate(paths.auth.phone, { replace: true });
      return;
    }
    if (!OTP_PATTERN.test(code)) {
      setError('Enter the 6-digit code.');
      return;
    }
    setError(undefined);
    setSubmitting(true);
    const res = await apiClient.auth.verifyOtp({ challengeId: state.challengeId, code });
    setSubmitting(false);
    if (res.ok) {
      setSession(res.value);
      navigate(paths.app.home, { replace: true });
    } else {
      setError('That code is incorrect. Try again.');
    }
  }

  return (
    <Box sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', p: 3 }}>
      <Container maxWidth="xs">
        <Stack spacing={2}>
          <Typography variant="h4" fontWeight={700}>
            Enter your code
          </Typography>
          <Typography color="text.secondary">
            {state?.phone ? `Sent to ${state.phone}. ` : ''}Demo code: 000000
          </Typography>
          <TextField
            label="Verification code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            error={Boolean(error)}
            helperText={error}
            inputProps={{ maxLength: 6, inputMode: 'numeric' }}
            autoFocus
          />
          <Button size="large" variant="contained" disabled={submitting} onClick={onVerify}>
            Verify
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
