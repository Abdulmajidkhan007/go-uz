/**
 * Firebase Firestore implementation of NotificationsApi.
 *
 * Paths:
 *   notifications/{id}  — notification documents (userId, type, title, body, createdAt, [readAt])
 *
 * Pagination: cursor-based using the last document ID from the previous page,
 * resolved via getDoc + startAfter (same pattern as ordersClient).
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
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { NotificationId } from '@vroom/types';
import type { NotificationsApi } from '../endpoints/notifications.js';
import { unauthorizedError } from '../errors.js';
import { err } from '@vroom/utils';
import { fbGuard } from './errors.js';
import { COLLECTIONS, docToNotification } from './mappers.js';

const PAGE_SIZE = 20;

export function createNotificationsClient(auth: Auth, db: Firestore): NotificationsApi {
  function requireUid(): string | null {
    return auth.currentUser?.uid ?? null;
  }

  return {
    async listNotifications(req) {
      const uid = requireUid();
      if (uid === null) return err(unauthorizedError('Not authenticated'));

      return fbGuard(async () => {
        const colRef = collection(db, COLLECTIONS.notifications);

        const constraints: Parameters<typeof query>[1][] = [
          where('userId', '==', uid),
          orderBy('createdAt', 'desc'),
          limit(PAGE_SIZE + 1),
        ];

        if (req.cursor !== undefined) {
          const cursorSnap = await getDoc(doc(db, COLLECTIONS.notifications, req.cursor));
          if (cursorSnap.exists()) {
            constraints.push(startAfter(cursorSnap));
          }
        }

        const q = query(colRef, ...constraints);
        const snap = await getDocs(q);
        const allDocs = snap.docs;
        const hasMore = allDocs.length > PAGE_SIZE;
        const pageDocs = hasMore ? allDocs.slice(0, PAGE_SIZE) : allDocs;

        const items = pageDocs.map((d) => docToNotification(d.id, d.data()));
        const lastDoc = pageDocs[pageDocs.length - 1];

        if (hasMore && lastDoc !== undefined) {
          return { items, nextCursor: lastDoc.id };
        }
        return { items };
      });
    },

    async markRead(req) {
      const uid = requireUid();
      if (uid === null) return err(unauthorizedError('Not authenticated'));

      return fbGuard(async () => {
        const now = Timestamp.now();
        const batch = writeBatch(db);
        let updated = 0;

        for (const id of req.ids as readonly NotificationId[]) {
          const docRef = doc(db, COLLECTIONS.notifications, id);
          // We batch-update without checking ownership here; Firestore rules
          // enforce that users can only write their own notification docs.
          batch.update(docRef, { readAt: now });
          updated += 1;
        }

        if (updated > 0) {
          await batch.commit();
        }

        return { updated };
      });
    },
  };
}
