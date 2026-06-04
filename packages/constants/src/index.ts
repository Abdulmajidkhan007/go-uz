// Vehicle classes
export {
  VEHICLE_CLASSES,
  VEHICLE_CLASS_LABELS,
} from './vehicles.js';

// Service types
export {
  SERVICE_TYPES,
  SERVICE_TYPE_LABELS,
} from './services.js';

// Currency
export {
  SUPPORTED_CURRENCIES,
  DEFAULT_CURRENCY,
  CURRENCY_MINOR_UNITS,
} from './currency.js';

// Locales
export type { SupportedLocale } from './locales.js';
export {
  LOCALES,
  DEFAULT_LOCALE,
  LOCALE_BCP47,
} from './locales.js';

// Orders
export {
  ORDER_STATES,
  ORDER_STATE_LABELS,
  ORDER_KINDS,
} from './orders.js';

// Support
export {
  TICKET_CATEGORIES,
  TICKET_CATEGORY_LABELS,
  TICKET_STATUS_LABELS,
} from './support.js';

// Config keys
export type { ConfigKey } from './config-keys.js';
export { CONFIG_KEYS } from './config-keys.js';

// Feature flags
export type { FeatureFlagKey, FeatureFlagValue } from './feature-flags.js';
export { FEATURE_FLAGS } from './feature-flags.js';

// Navigation / deep-links
export type { DeepLinkPath } from './navigation.js';
export { DEEP_LINK_SCHEME, WEB_BASE_PATH, DEEP_LINK_PATHS } from './navigation.js';

// Status labels
export {
  TRIP_STATUS_LABELS,
  DELIVERY_STATUS_LABELS,
  PAYMENT_STATE_LABELS,
  USER_STATUS_LABELS,
} from './statuses.js';

// Maps
export { MAP_DEFAULTS } from './maps.js';
