import type { TicketId, UserId, OrderId, IsoDateTime } from './common.js';

// ---------------------------------------------------------------------------
// Ticket metadata types
// ---------------------------------------------------------------------------

export type TicketStatus =
  | 'open'
  | 'pending_user'
  | 'pending_agent'
  | 'resolved'
  | 'closed';

export type TicketCategory =
  | 'lost_item'
  | 'payment_issue'
  | 'order_not_found'
  | 'driver_behavior'
  | 'app_bug'
  | 'other';

// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------

export interface TicketMessage {
  readonly id: string;
  readonly from: 'user' | 'agent';
  readonly body: string;
  readonly at: IsoDateTime;
}

export interface SupportTicket {
  readonly id: TicketId;
  readonly userId: UserId;
  /** The order this ticket is about, if applicable. */
  readonly orderId?: OrderId;
  readonly subject: string;
  readonly category: TicketCategory;
  readonly status: TicketStatus;
  readonly messages: readonly TicketMessage[];
  readonly createdAt: IsoDateTime;
}
