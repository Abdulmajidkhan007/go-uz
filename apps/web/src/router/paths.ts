/**
 * Typed route path constants + builders. Never hand-write route strings.
 */
export const paths = {
  welcome: '/welcome',
  auth: { phone: '/auth/phone', otp: '/auth/otp', setup: '/auth/setup' },
  app: {
    root: '/app',
    home: '/app/home',
    ride: {
      destination: '/app/ride/destination',
      vehicle: '/app/ride/vehicle',
      confirm: '/app/ride/confirm',
      searching: '/app/ride/searching',
    },
    delivery: {
      parcel: '/app/delivery/parcel',
      route: '/app/delivery/route',
      confirm: '/app/delivery/confirm',
    },
    track: (orderId: string) => `/app/track/${orderId}`,
    trackPattern: '/app/track/:orderId',
    activity: '/app/activity',
    orderDetail: (orderId: string) => `/app/activity/${orderId}`,
    orderDetailPattern: '/app/activity/:orderId',
    payments: { root: '/app/payments', wallet: '/app/payments/wallet', promos: '/app/payments/promos', addCard: '/app/payments/add-card' },
    profile: { root: '/app/profile', addresses: '/app/profile/addresses', settings: '/app/profile/settings' },
    support: { tickets: '/app/support/tickets', newTicket: '/app/support/tickets/new', faq: '/app/support/faq' },
  },
} as const;
