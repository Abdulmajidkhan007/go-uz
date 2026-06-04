/**
 * Bootstrap — wires up the API client from environment config.
 * Called once at app startup before rendering.
 */
import { loadConfig } from '@vroom/config';
import { createApiClient } from '@vroom/api';
import { createApiHooks } from '@vroom/api';
import type { ApiClient } from '@vroom/api';
import type { ApiHooks } from '@vroom/api';

const rawEnv: Record<string, string | undefined> = {
  VROOM_API_MODE: process.env['EXPO_PUBLIC_VROOM_API_MODE'] ?? 'mock',
  VROOM_API_BASE_URL: process.env['EXPO_PUBLIC_VROOM_API_BASE_URL'],
};

const appConfig = loadConfig(rawEnv);

export const apiClient: ApiClient = createApiClient({
  mode: appConfig.apiMode,
  ...(appConfig.apiBaseUrl !== undefined ? { baseUrl: appConfig.apiBaseUrl } : {}),
});

export const apiHooks: ApiHooks = createApiHooks(apiClient);
