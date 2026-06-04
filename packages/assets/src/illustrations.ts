/**
 * @file illustrations.ts
 * Platform-neutral illustration registry for the Vroom design system.
 *
 * Purpose
 * -------
 * This registry acts as a typed contract between the shared design system
 * and each platform app. It defines canonical keys and human-readable metadata
 * for every illustration the product uses, but deliberately stores NO binary
 * data here — keeping this package lightweight and free of platform concerns.
 *
 * How to add real assets
 * ----------------------
 * 1. Drop raster PNGs / WebPs or Lottie JSON files into the consuming app's
 *    own asset directory (e.g. apps/mobile/assets/, apps/web/public/).
 * 2. Create a platform resolver in the app that maps IllustrationId → the
 *    platform-appropriate import or require() call:
 *
 *    // apps/mobile/src/assets/illustrationResolver.ts
 *    import type { IllustrationId } from '@vroom/assets';
 *    const resolverMap: Record<IllustrationId, ReturnType<typeof require>> = {
 *      emptyTrips:        require('../images/empty-trips.png'),
 *      emptyDeliveries:   require('../images/empty-deliveries.png'),
 *      // …
 *    };
 *
 *    // apps/web/src/assets/illustrationResolver.ts
 *    import type { IllustrationId } from '@vroom/assets';
 *    const resolverMap: Record<IllustrationId, string> = {
 *      emptyTrips:        '/illustrations/empty-trips.svg',
 *      emptyDeliveries:   '/illustrations/empty-deliveries.svg',
 *      // …
 *    };
 *
 * 3. Lottie animations follow the same pattern — resolve to the JSON module
 *    or URL at the app layer, keep the key and descriptor here.
 *
 * No react-native, no DOM, no MUI, no binary data in this file.
 */

// ---------------------------------------------------------------------------
// Illustration descriptor — metadata attached to every registered illustration
// ---------------------------------------------------------------------------

/**
 * Describes one illustration in the registry.
 *
 * @property id  - The canonical key used by app resolvers.
 * @property alt - Accessible alt-text / aria-label for the illustration.
 *                 Kept here so both web and mobile use identical copy.
 * @property category - Logical grouping for tooling and documentation.
 * @property hasLottie - Whether an animated Lottie version is planned/available.
 *                       Purely informational; resolvers decide what to load.
 */
export interface IllustrationDescriptor {
  readonly id: IllustrationId;
  readonly alt: string;
  readonly category: 'empty-state' | 'onboarding' | 'status';
  readonly hasLottie: boolean;
}

// ---------------------------------------------------------------------------
// Canonical illustration keys
// ---------------------------------------------------------------------------

/**
 * Every illustration key in the Vroom product.
 * Extend this union as new screens are designed — resolvers will get a
 * compile-time error for any unhandled key.
 */
export type IllustrationId =
  | 'emptyTrips'
  | 'emptyDeliveries'
  | 'emptyWallet'
  | 'noResults'
  | 'onboardingMap'
  | 'onboardingDelivery'
  | 'success'
  | 'error';

// ---------------------------------------------------------------------------
// Registry — one descriptor per key
// ---------------------------------------------------------------------------

/**
 * The full illustration registry.
 *
 * @example
 * ```ts
 * import { illustrations } from '@vroom/assets';
 * const desc = illustrations.emptyTrips;
 * console.log(desc.alt); // "No trips yet"
 * ```
 */
export const illustrations: Record<IllustrationId, IllustrationDescriptor> = {
  emptyTrips: {
    id:        'emptyTrips',
    alt:       'No trips yet',
    category:  'empty-state',
    hasLottie: false,
  },
  emptyDeliveries: {
    id:        'emptyDeliveries',
    alt:       'No deliveries yet',
    category:  'empty-state',
    hasLottie: false,
  },
  emptyWallet: {
    id:        'emptyWallet',
    alt:       'Your wallet is empty',
    category:  'empty-state',
    hasLottie: false,
  },
  noResults: {
    id:        'noResults',
    alt:       'No results found',
    category:  'empty-state',
    hasLottie: false,
  },
  onboardingMap: {
    id:        'onboardingMap',
    alt:       'Ride anywhere with Vroom',
    category:  'onboarding',
    hasLottie: true,
  },
  onboardingDelivery: {
    id:        'onboardingDelivery',
    alt:       'Deliver anything, fast',
    category:  'onboarding',
    hasLottie: true,
  },
  success: {
    id:        'success',
    alt:       'All done!',
    category:  'status',
    hasLottie: true,
  },
  error: {
    id:        'error',
    alt:       'Something went wrong',
    category:  'status',
    hasLottie: false,
  },
} as const;

/**
 * Typed array of all illustration descriptors — useful for documentation
 * generation and Storybook enumeration.
 */
export const illustrationList: ReadonlyArray<IllustrationDescriptor> =
  Object.values(illustrations);
