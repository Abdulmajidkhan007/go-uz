/**
 * Web app entry. Mounts the provider tree + router into #root.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AppProviders } from './providers/AppProviders';
import { router } from '../router/routes';

function App(): React.JSX.Element {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}

export function renderApp(): void {
  const container = document.getElementById('root');
  if (!container) throw new Error('Root element #root not found');
  createRoot(container).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
