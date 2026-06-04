import { z } from 'zod';
import { TICKET_CATEGORIES } from '@vroom/constants';

// ---------------------------------------------------------------------------
// Create support ticket
// ---------------------------------------------------------------------------

export const createTicketSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(4, 'Subject must be at least 4 characters')
    .max(120, 'Subject must be 120 characters or fewer'),
  category: z.enum(TICKET_CATEGORIES),
  /** The order this ticket relates to, if applicable. */
  orderId: z.string().min(1).optional(),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be 2000 characters or fewer'),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;

// ---------------------------------------------------------------------------
// Post message to existing ticket thread
// ---------------------------------------------------------------------------

export const postMessageSchema = z.object({
  body: z.string().trim().min(1, 'Message body is required'),
});

export type PostMessageInput = z.infer<typeof postMessageSchema>;
