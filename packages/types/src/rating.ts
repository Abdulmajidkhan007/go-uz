import type { OrderId } from './common.js';

// ---------------------------------------------------------------------------
// Rating score — literal union prevents values outside 1-5
// ---------------------------------------------------------------------------

export type RatingScore = 1 | 2 | 3 | 4 | 5;

// ---------------------------------------------------------------------------
// Entity
// ---------------------------------------------------------------------------

export interface Rating {
  readonly id: string;
  readonly orderId: OrderId;
  readonly score: RatingScore;
  readonly comment?: string;
  /** Predefined tag labels chosen by the user, e.g. "clean car", "on time". */
  readonly tags?: readonly string[];
}
