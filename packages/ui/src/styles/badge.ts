/**
 * @file badge.ts
 * Domain status → semantic color + label presentation descriptors.
 *
 * These functions bridge the domain layer (@vroom/types discriminated unions)
 * to the display layer. Each returns a `StatusPresentation` that any platform
 * can render — a colored badge chip on mobile, a MUI Chip on web, etc.
 *
 * Design intent
 * -------------
 * - The `tone` field is the semantic intent: 'active' (brand color, in-progress),
 *   'success' (positive outcome), 'error' (negative / destructive),
 *   'neutral' (terminal but neither good nor bad — e.g. 'cancelled').
 * - The `color` field is the resolved hex/rgba string from the theme, ready to
 *   apply to a chip background or text.
 * - The `label` comes from @vroom/constants label maps — single source of truth.
 *
 * No platform-specific imports; no React; pure functions.
 */

import type { SemanticColors } from '@vroom/theme';
import type {
  TripStatus,
  DeliveryStatus,
  PaymentState,
  OrderState,
} from '@vroom/types';
import {
  TRIP_STATUS_LABELS,
  DELIVERY_STATUS_LABELS,
  PAYMENT_STATE_LABELS,
  ORDER_STATE_LABELS,
} from '@vroom/constants';

// ---------------------------------------------------------------------------
// Shared return type
// ---------------------------------------------------------------------------

/** Semantic intent for a status badge. */
export type StatusTone = 'active' | 'success' | 'error' | 'neutral';

export interface StatusPresentation {
  /** Human-readable label from the constants label map. */
  readonly label: string;
  /** Resolved semantic color string from the active theme. */
  readonly color: string;
  /** Semantic intent; consumers use this for accessible aria-labels or icons. */
  readonly tone: StatusTone;
}

// ---------------------------------------------------------------------------
// TripStatus presentation
// ---------------------------------------------------------------------------

/**
 * Maps a `TripStatus` discriminated union to a display-ready presentation.
 *
 * @param status - The current `TripStatus` union value.
 * @param theme  - The active SemanticColors map.
 *
 * @example
 * const p = getTripStatusPresentation(trip.status, lightTheme);
 * // <Badge style={{ backgroundColor: p.color }} label={p.label} />
 */
export function getTripStatusPresentation(
  status: TripStatus,
  theme: SemanticColors,
): StatusPresentation {
  const label = TRIP_STATUS_LABELS[status.kind];

  switch (status.kind) {
    case 'requested':
    case 'matching':
    case 'driver_assigned':
    case 'arriving':
    case 'in_progress':
      return { label, color: theme.statusActive, tone: 'active' };

    case 'completed':
      return { label, color: theme.statusSuccess, tone: 'success' };

    case 'cancelled':
    case 'no_drivers':
      return { label, color: theme.textSecondary, tone: 'neutral' };
  }
}

// ---------------------------------------------------------------------------
// DeliveryStatus presentation
// ---------------------------------------------------------------------------

/**
 * Maps a `DeliveryStatus` discriminated union to a display-ready presentation.
 *
 * @param status - The current `DeliveryStatus` union value.
 * @param theme  - The active SemanticColors map.
 */
export function getDeliveryStatusPresentation(
  status: DeliveryStatus,
  theme: SemanticColors,
): StatusPresentation {
  const label = DELIVERY_STATUS_LABELS[status.kind];

  switch (status.kind) {
    case 'created':
    case 'courier_search':
    case 'courier_assigned':
    case 'pickup_enroute':
    case 'picked_up':
    case 'dropoff_enroute':
      return { label, color: theme.statusActive, tone: 'active' };

    case 'delivered':
      return { label, color: theme.statusSuccess, tone: 'success' };

    case 'failed_delivery':
      return { label, color: theme.statusError, tone: 'error' };

    case 'cancelled':
    case 'returning':
    case 'returned':
      return { label, color: theme.textSecondary, tone: 'neutral' };
  }
}

// ---------------------------------------------------------------------------
// PaymentState presentation
// ---------------------------------------------------------------------------

/**
 * Maps a `PaymentState` discriminated union to a display-ready presentation.
 *
 * @param state - The current `PaymentState` union value.
 * @param theme - The active SemanticColors map.
 */
export function getPaymentStatePresentation(
  state: PaymentState,
  theme: SemanticColors,
): StatusPresentation {
  const label = PAYMENT_STATE_LABELS[state.kind];

  switch (state.kind) {
    case 'pending':
    case 'authorized':
      return { label, color: theme.statusActive, tone: 'active' };

    case 'captured':
    case 'settled':
    case 'refunded':
      return { label, color: theme.statusSuccess, tone: 'success' };

    case 'failed':
      return { label, color: theme.statusError, tone: 'error' };

    case 'refund_pending':
      return { label, color: theme.textSecondary, tone: 'neutral' };
  }
}

// ---------------------------------------------------------------------------
// OrderState presentation
// ---------------------------------------------------------------------------

/**
 * Maps an `OrderState` string literal to a display-ready presentation.
 * OrderState is a plain union (not discriminated) — we switch on the value
 * directly.
 *
 * @param state - The current `OrderState` value.
 * @param theme - The active SemanticColors map.
 */
export function getOrderStatePresentation(
  state: OrderState,
  theme: SemanticColors,
): StatusPresentation {
  const label = ORDER_STATE_LABELS[state];

  switch (state) {
    case 'draft':
    case 'quoted':
      return { label, color: theme.textSecondary, tone: 'neutral' };

    case 'placed':
    case 'active':
      return { label, color: theme.statusActive, tone: 'active' };

    case 'completed':
      return { label, color: theme.statusSuccess, tone: 'success' };

    case 'cancelled':
      return { label, color: theme.textSecondary, tone: 'neutral' };

    case 'failed':
      return { label, color: theme.statusError, tone: 'error' };
  }
}
