import type { TicketCategory, TicketStatus } from '@vroom/types';

// ---------------------------------------------------------------------------
// Support ticket constants
// ---------------------------------------------------------------------------

/** All ticket categories users can select when opening a ticket. */
export const TICKET_CATEGORIES = [
  'lost_item',
  'payment_issue',
  'order_not_found',
  'driver_behavior',
  'app_bug',
  'other',
] as const satisfies readonly TicketCategory[];

/** Human-readable labels for ticket categories. */
export const TICKET_CATEGORY_LABELS: Readonly<Record<TicketCategory, string>> = {
  lost_item: 'Lost Item',
  payment_issue: 'Payment Issue',
  order_not_found: 'Order Not Found',
  driver_behavior: 'Driver Behavior',
  app_bug: 'App Bug',
  other: 'Other',
} as const;

/** Human-readable labels for ticket statuses. */
export const TICKET_STATUS_LABELS: Readonly<Record<TicketStatus, string>> = {
  open: 'Open',
  pending_user: 'Pending Your Reply',
  pending_agent: 'Pending Agent',
  resolved: 'Resolved',
  closed: 'Closed',
} as const;
