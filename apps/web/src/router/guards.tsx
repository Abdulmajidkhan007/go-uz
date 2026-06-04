/**
 * Route guards. RequireAuth protects the /app subtree; RedirectIfAuthed keeps
 * signed-in users out of the auth/welcome screens.
 */
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { paths } from './paths';

export function RequireAuth(): React.JSX.Element {
  const session = useAuthStore((s) => s.session);
  return session ? <Outlet /> : <Navigate to={paths.welcome} replace />;
}

export function RedirectIfAuthed(): React.JSX.Element {
  const session = useAuthStore((s) => s.session);
  return session ? <Navigate to={paths.app.home} replace /> : <Outlet />;
}
