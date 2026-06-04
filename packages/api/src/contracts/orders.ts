import type { Order, OrderKind, Paginated } from '@vroom/types';

// ---------------------------------------------------------------------------
// Orders contracts
// ---------------------------------------------------------------------------

export interface ListOrdersReq {
  readonly kind?: OrderKind;
  readonly cursor?: string;
}

export type ListOrdersRes = Paginated<Order>;
