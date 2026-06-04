/**
 * Route tree (createBrowserRouter). Mirrors the mobile navigation map and the
 * paths in ./paths.ts. Auth screens sit behind RedirectIfAuthed; the /app
 * subtree behind RequireAuth + AppShell.
 */
import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { paths } from './paths';
import { RequireAuth, RedirectIfAuthed } from './guards';
import { AppShell } from '../components/AppShell';
import { WelcomePage, PhonePage, OtpPage } from '../pages/auth';
import { HomePage } from '../pages/home';
import { DestinationPage, VehiclePage, ConfirmRidePage, SearchingPage } from '../pages/ride';
import { ParcelPage, RoutePage, ConfirmDeliveryPage } from '../pages/delivery';
import { TrackingPage } from '../pages/tracking';
import { HistoryPage, OrderDetailPage } from '../pages/activity';
import { PaymentsPage, AddCardPage, WalletPage, PromosPage } from '../pages/payments';
import { ProfilePage, AddressesPage, SettingsPage } from '../pages/profile';
import { TicketsPage, NewTicketPage, FaqPage } from '../pages/support';
import { NotFoundPage } from '../pages/NotFound';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to={paths.app.home} replace /> },
  {
    element: <RedirectIfAuthed />,
    children: [
      { path: paths.welcome, element: <WelcomePage /> },
      { path: paths.auth.phone, element: <PhonePage /> },
      { path: paths.auth.otp, element: <OtpPage /> },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: paths.app.root,
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to={paths.app.home} replace /> },
          { path: paths.app.home, element: <HomePage /> },
          { path: paths.app.ride.destination, element: <DestinationPage /> },
          { path: paths.app.ride.vehicle, element: <VehiclePage /> },
          { path: paths.app.ride.confirm, element: <ConfirmRidePage /> },
          { path: paths.app.ride.searching, element: <SearchingPage /> },
          { path: paths.app.delivery.parcel, element: <ParcelPage /> },
          { path: paths.app.delivery.route, element: <RoutePage /> },
          { path: paths.app.delivery.confirm, element: <ConfirmDeliveryPage /> },
          { path: paths.app.trackPattern, element: <TrackingPage /> },
          { path: paths.app.activity, element: <HistoryPage /> },
          { path: paths.app.orderDetailPattern, element: <OrderDetailPage /> },
          { path: paths.app.payments.root, element: <PaymentsPage /> },
          { path: paths.app.payments.addCard, element: <AddCardPage /> },
          { path: paths.app.payments.wallet, element: <WalletPage /> },
          { path: paths.app.payments.promos, element: <PromosPage /> },
          { path: paths.app.profile.root, element: <ProfilePage /> },
          { path: paths.app.profile.addresses, element: <AddressesPage /> },
          { path: paths.app.profile.settings, element: <SettingsPage /> },
          { path: paths.app.support.tickets, element: <TicketsPage /> },
          { path: paths.app.support.newTicket, element: <NewTicketPage /> },
          { path: paths.app.support.faq, element: <FaqPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
