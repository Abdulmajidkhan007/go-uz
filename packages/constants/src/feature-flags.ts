// ---------------------------------------------------------------------------
// Feature flags
// ---------------------------------------------------------------------------

/**
 * Static default values for feature flags.
 * In production these should be overridden by a remote config provider.
 * All values must be serialisable (boolean | string | number) so they can be
 * stored in any remote config backend without platform coupling.
 */
export const FEATURE_FLAGS = {
  /** Enable the multi-stop trip feature in the ride flow. */
  MULTI_STOP_TRIPS: false,
  /** Enable the in-app wallet top-up flow. */
  WALLET_TOPUP: true,
  /** Enable scheduled rides (book in advance). */
  SCHEDULED_RIDES: false,
  /** Enable promo-code entry at checkout. */
  PROMO_CODES: true,
  /** Enable live driver-tracking map on the trip screen. */
  LIVE_TRACKING_MAP: true,
  /** Enable delivery photo proof collection. */
  DELIVERY_PHOTO_PROOF: true,
  /** Show the support chat widget. */
  SUPPORT_CHAT: true,
  /** Enable push-notification opt-in prompts. */
  PUSH_NOTIFICATIONS: true,
  /** Enable courier-van vehicle class option. */
  COURIER_VAN: false,
} as const;

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;
export type FeatureFlagValue = (typeof FEATURE_FLAGS)[FeatureFlagKey];
