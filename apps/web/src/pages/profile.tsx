/**
 * Profile & settings.
 */
import React from 'react';
import {
  Button,
  Card,
  CardContent,
  Container,
  List,
  ListItem,
  ListItemText,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../app/providers/api';
import { useAuthStore } from '../stores/authStore';
import { useUiStore } from '../stores/uiStore';
import { paths } from '../router/paths';
import { LoadingState, ErrorState, EmptyState } from '../components/States';

export function ProfilePage(): React.JSX.Element {
  const navigate = useNavigate();
  const { useMe } = useApi();
  const me = useMe();

  return (
    <Container maxWidth="sm">
      <Stack spacing={2}>
        {me.isPending ? <LoadingState /> : null}
        {me.isError ? <ErrorState onRetry={() => me.refetch()} /> : null}
        {me.data ? (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h5" fontWeight={700}>
                {me.data.displayName}
              </Typography>
              <Typography color="text.secondary">{me.data.phone}</Typography>
            </CardContent>
          </Card>
        ) : null}
        <Card variant="outlined">
          <List>
            <ListItem component="button" onClick={() => navigate(paths.app.profile.addresses)}>
              <ListItemText primary="Saved places" />
            </ListItem>
            <ListItem component="button" onClick={() => navigate(paths.app.profile.settings)}>
              <ListItemText primary="Settings" />
            </ListItem>
            <ListItem component="button" onClick={() => navigate(paths.app.support.tickets)}>
              <ListItemText primary="Help & support" />
            </ListItem>
          </List>
        </Card>
      </Stack>
    </Container>
  );
}

export function AddressesPage(): React.JSX.Element {
  const { useAddresses } = useApi();
  const addresses = useAddresses();

  if (addresses.isPending) return <LoadingState />;
  if (addresses.isError) return <ErrorState onRetry={() => addresses.refetch()} />;
  if (addresses.data.addresses.length === 0) {
    return <EmptyState title="No saved places" caption="Add home and work for faster booking." />;
  }

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Saved places
      </Typography>
      <Card variant="outlined">
        <List>
          {addresses.data.addresses.map((a) => (
            <ListItem key={a.id}>
              <ListItemText primary={a.label} secondary={a.formatted} />
            </ListItem>
          ))}
        </List>
      </Card>
    </Container>
  );
}

export function SettingsPage(): React.JSX.Element {
  const scheme = useUiStore((s) => s.colorScheme);
  const toggleScheme = useUiStore((s) => s.toggleColorScheme);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return (
    <Container maxWidth="sm">
      <Stack spacing={2}>
        <Typography variant="h4" fontWeight={700}>
          Settings
        </Typography>
        <Card variant="outlined">
          <List>
            <ListItem secondaryAction={<Switch checked={scheme === 'dark'} onChange={toggleScheme} />}>
              <ListItemText primary="Dark theme" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Language" secondary="English" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Notifications" secondary="On" />
            </ListItem>
          </List>
        </Card>
        <Button color="error" variant="outlined" onClick={clearAuth}>
          Sign out
        </Button>
      </Stack>
    </Container>
  );
}
