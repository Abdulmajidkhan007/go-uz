/**
 * Firebase Firestore implementation of OrdersApi.
 *
 * Paths:
 *   orders/{orderId}  — order documents (kind, refId, state, userId, createdAt)
 *
 * Pagination: cursor-based using Firestore `startAfter` with a document snapshot.
 * The cursor is the last document ID from the previous page.
 */
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { OrdersApi } from '../endpoints/orders.js';
import { unauthorizedError } from '../errors.js';
import { err } from '@vroom/utils';
import { fbGuard } from './errors.js';
import { COLLECTIONS, docToOrder } from './mappers.js';

const PAGE_SIZE = 10;

export function createOrdersClient(auth: Auth, db: Firestore): OrdersApi {
  function requireUid(): string | null {
    return auth.currentUser?.uid ?? null;
  }

  return {
    async listOrders(req) {
      const uid = requireUid();
      if (uid === null) return err(unauthorizedError('Not authenticated'));

      return fbGuard(async () => {
        const colRef = collection(db, COLLECTIONS.orders);

        // Build base constraints
        const constraints: Parameters<typeof query>[1][] = [
          where('userId', '==', uid),
          orderBy('createdAt', 'desc'),
          limit(PAGE_SIZE + 1), // fetch one extra to detect hasMore
        ];

        if (req.kind !== undefined) {
          constraints.unshift(where('kind', '==', req.kind));
        }

        // Resolve cursor document if provided
        if (req.cursor !== undefined) {
          const cursorSnap = await getDoc(doc(db, COLLECTIONS.orders, req.cursor));
          if (cursorSnap.exists()) {
            constraints.push(startAfter(cursorSnap));
          }
        }

        const q = query(colRef, ...constraints);
        const snap = await getDocs(q);
        const allDocs = snap.docs;
        const hasMore = allDocs.length > PAGE_SIZE;
        const pageDocs = hasMore ? allDocs.slice(0, PAGE_SIZE) : allDocs;

        const items = pageDocs.map((d) => docToOrder(d.id, d.data()));
        const lastDoc = pageDocs[pageDocs.length - 1];

        if (hasMore && lastDoc !== undefined) {
          return { items, nextCursor: lastDoc.id };
        }
        return { items };
      });
    },
  };
}
