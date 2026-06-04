/**
 * Operator login — reuses the mock auth (phone + 6-digit OTP, demo 000000).
 */
import React, { useState } from 'react';
import { Box, Button, Container, Stack, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { phoneSchema } from '@vroom/validation';
import { apiClient } from '../app/api';
import { useAdminStore } from '../store';
import { paths } from '../paths';

const OTP_PATTERN = /^\d{6}$/;

export function LoginPage(): React.JSX.Element {
  const navigate = useNavigate();
  const setSession = useAdminStore((s) => s.setSession);
  const [phone, setPhone] = useState('+998');
  const [code, setCode] = useState('');
  const [challengeId, setChallengeId] = useState<string>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function onSendCode(): Promise<void> {
    const parsed = phoneSchema.safeParse(phone);
    if (!parsed.success) {
      setError('Enter a valid phone number.');
      return;
    }
    setError(undefined);
    setBusy(true);
    const res = await apiClient.auth.requestOtp({ phone: parsed.data });
    setBusy(false);
    if (res.ok) setChallengeId(res.value.challengeId);
    else setError('Could not send the code.');
  }

  async function onVerify(): Promise<void> {
    if (!challengeId || !OTP_PATTERN.test(code)) {
      setError('Enter the 6-digit code.');
      return;
    }
    setError(undefined);
    setBusy(true);
    const res = await apiClient.auth.verifyOtp({ challengeId, code });
    setBusy(false);
    if (res.ok) {
      setSession(res.value);
      navigate(paths.dashboard, { replace: true });
    } else {
      setError('That code is incorrect.');
    }
  }

  return (
    <Box sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', p: 3 }}>
      <Container maxWidth="xs">
        <Stack spacing={2}>
          <Typography variant="h4" fontWeight={800} color="primary">
            Vroom Admin
          </Typography>
          <TextField label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={Boolean(challengeId)} />
          {challengeId ? (
            <TextField
              label="Code (demo: 000000)"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputProps={{ maxLength: 6, inputMode: 'numeric' }}
              autoFocus
            />
          ) : null}
          {error ? <Typography color="error">{error}</Typography> : null}
          {challengeId ? (
            <Button size="large" variant="contained" disabled={busy} onClick={onVerify}>
              Sign in
            </Button>
          ) : (
            <Button size="large" variant="contained" disabled={busy} onClick={onSendCode}>
              Send code
            </Button>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
