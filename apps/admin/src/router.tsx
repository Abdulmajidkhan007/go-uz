/**
 * Admin route tree. The /login screen is public; everything else requires a
 * session and renders inside AdminShell.
 */
import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { paths } from './paths';
import { useAdminStore } from './store';
import { AdminShell } from './components/AdminShell';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { OrdersPage, OrderDetailPage } from './pages/Orders';
import { TicketsPage } from './pages/Tickets';

function RequireAuth(): React.JSX.Element {
  const session = useAdminStore((s) => s.session);
  return session ? <Outlet /> : <Navigate to={paths.login} replace />;
}

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to={paths.dashboard} replace /> },
  { path: paths.login, element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AdminShell />,
        children: [
          { path: paths.dashboard, element: <DashboardPage /> },
          { path: paths.orders, element: <OrdersPage /> },
          { path: paths.orderDetailPattern, element: <OrderDetailPage /> },
          { path: paths.tickets, element: <TicketsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to={paths.dashboard} replace /> },
]);
