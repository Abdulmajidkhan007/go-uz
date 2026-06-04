import type { SupportTicket, TicketCategory, OrderId } from '@vroom/types';

// ---------------------------------------------------------------------------
// Support contracts
// ---------------------------------------------------------------------------

/** GET /support/tickets */
export type ListTicketsRes = readonly SupportTicket[];

/** POST /support/tickets */
export interface CreateTicketReq {
  readonly subject: string;
  readonly category: TicketCategory;
  readonly orderId?: OrderId;
  readonly body: string;
}

export type CreateTicketRes = SupportTicket;

/** POST /support/tickets/:id/messages */
export interface PostMessageReq {
  readonly ticketId: string;
  readonly body: string;
}

export type PostMessageRes = SupportTicket;
