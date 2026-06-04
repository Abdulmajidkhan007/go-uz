import type { OrderState, OrderKind } from '@vroom/types';

// ---------------------------------------------------------------------------
// Order states & kinds
// ---------------------------------------------------------------------------

/** All order lifecycle states in progression order. */
export const ORDER_STATES = [
  'draft',
  'quoted',
  'placed',
  'active',
  'completed',
  'cancelled',
  'failed',
] as const satisfies readonly OrderState[];

/** Human-readable labels for each order state. */
export const ORDER_STATE_LABELS: Readonly<Record<OrderState, string>> = {
  draft: 'Draft',
  quoted: 'Quoted',
  placed: 'Placed',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
  failed: 'Failed',
} as const;

/** All order kinds. */
export const ORDER_KINDS = ['ride', 'delivery'] as const satisfies readonly OrderKind[];
