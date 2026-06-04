/**
 * ApiContext — exposes the createApiHooks result to the component tree.
 * The hooks factory is created once in bootstrap.ts and provided here.
 */
import React, { createContext, useContext } from 'react';
import type { ApiHooks } from '@vroom/api';
import { apiHooks } from '../bootstrap';

const ApiContext = createContext<ApiHooks | null>(null);

export function ApiProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <ApiContext.Provider value={apiHooks}>{children}</ApiContext.Provider>;
}

export function useApi(): ApiHooks {
  const ctx = useContext(ApiContext);
  if (ctx === null) {
    throw new Error('useApi must be used within ApiProvider');
  }
  return ctx;
}
