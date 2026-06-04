// ---------------------------------------------------------------------------
// Navigation / deep-link constants
// ---------------------------------------------------------------------------

/** Deep-link URI scheme used in mobile universal links and app links. */
export const DEEP_LINK_SCHEME = 'vroom' as const;

/** Root path for the web application. */
export const WEB_BASE_PATH = '/app' as const;

/**
 * Named deep-link path segments. Combine with DEEP_LINK_SCHEME to form full
 * URIs, e.g. `vroom://trip/123`.
 */
export const DEEP_LINK_PATHS = {
  TRIP: 'trip',
  DELIVERY: 'delivery',
  ORDER: 'order',
  PAYMENT: 'payment',
  PROMO: 'promo',
  SUPPORT_TICKET: 'support/ticket',
  PROFILE: 'profile',
  WALLET: 'wallet',
} as const;

export type DeepLinkPath = (typeof DEEP_LINK_PATHS)[keyof typeof DEEP_LINK_PATHS];
