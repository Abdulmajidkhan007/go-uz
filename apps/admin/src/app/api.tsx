/**
 * Admin API provider — same typed client + React Query hooks as the consumer
 * apps, pointed at the same backend via env config.
 */
import React, { createContext, useContext } from 'react';
import { createApiClient, createApiHooks } from '@vroom/api';
import type { ApiClient, ApiHooks } from '@vroom/api';
import { loadConfig } from '@vroom/config';

const rawEnv: Record<string, string | undefined> = {
  VROOM_API_MODE: import.meta.env.VITE_VROOM_API_MODE ?? 'mock',
  VROOM_API_BASE_URL: import.meta.env.VITE_VROOM_API_BASE_URL,
};

const appConfig = loadConfig(rawEnv);

export const apiClient: ApiClient = createApiClient({
  mode: appConfig.apiMode,
  ...(appConfig.apiBaseUrl !== undefined ? { baseUrl: appConfig.apiBaseUrl } : {}),
});

const apiHooks: ApiHooks = createApiHooks(apiClient);

const ApiContext = createContext<ApiHooks | null>(null);

export function ApiProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <ApiContext.Provider value={apiHooks}>{children}</ApiContext.Provider>;
}

export function useApi(): ApiHooks {
  const ctx = useContext(ApiContext);
  if (ctx === null) throw new Error('useApi must be used within ApiProvider');
  return ctx;
}
