import React, { useMemo } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lightTheme, darkTheme } from '@vroom/theme';
import { buildMuiTheme } from './muiTheme';
import { useAdminStore } from '../store';
import { ApiProvider } from './api';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false } },
});

export function AppProviders({ children }: { children: React.ReactNode }): React.JSX.Element {
  const scheme = useAdminStore((s) => s.colorScheme);
  const theme = useMemo(() => buildMuiTheme(scheme === 'dark' ? darkTheme : lightTheme, scheme), [scheme]);
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ApiProvider>{children}</ApiProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
