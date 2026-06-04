/**
 * Firebase Firestore implementation of SupportApi.
 *
 * Paths:
 *   tickets/{ticketId}  — ticket document with embedded `messages` array.
 *
 * Messages are stored as an array field on the ticket document rather than
 * a subcollection, keeping reads cheap (one document fetch).
 */
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  Timestamp,
} from 'firebase/firestore';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { createId } from '@vroom/utils';
import type { TicketId } from '@vroom/types';
import type { SupportApi } from '../endpoints/support.js';
import { unauthorizedError } from '../errors.js';
import { err } from '@vroom/utils';
import { fbGuard } from './errors.js';
import { COLLECTIONS, docToTicket } from './mappers.js';

export function createSupportClient(auth: Auth, db: Firestore): SupportApi {
  function requireUid(): string | null {
    return auth.currentUser?.uid ?? null;
  }

  return {
    async listTickets() {
      const uid = requireUid();
      if (uid === null) return err(unauthorizedError('Not authenticated'));

      return fbGuard(async () => {
        const q = query(
          collection(db, COLLECTIONS.tickets),
          where('userId', '==', uid),
        );
        const snap = await getDocs(q);
        return snap.docs.map((d) => docToTicket(d.id, d.data()));
      });
    },

    async createTicket(req) {
      const uid = requireUid();
      if (uid === null) return err(unauthorizedError('Not authenticated'));

      return fbGuard(async () => {
        const id = createId('tkt') as TicketId;
        const now = Timestamp.now();
        const firstMessage = {
          id: createId('msg'),
          from: 'user',
          body: req.body,
          at: now,
        };

        const ticketData: Record<string, unknown> = {
          userId: uid,
          subject: req.subject,
          category: req.category,
          status: 'open',
          messages: [firstMessage],
          createdAt: now,
          ...(req.orderId !== undefined ? { orderId: req.orderId } : {}),
        };

        await setDoc(doc(db, COLLECTIONS.tickets, id), ticketData);
        return docToTicket(id, ticketData);
      });
    },

    async postMessage(req) {
      const uid = requireUid();
      if (uid === null) return err(unauthorizedError('Not authenticated'));

      return fbGuard(async () => {
        const ticketRef = doc(db, COLLECTIONS.tickets, req.ticketId);
        const snap = await getDoc(ticketRef);
        if (!snap.exists()) {
          throw Object.assign(new Error(`Ticket ${req.ticketId} not found`), {
            code: 'not-found',
          });
        }
        const data = snap.data();
        if (data['userId'] !== uid) {
          throw Object.assign(new Error('Insufficient permissions'), {
            code: 'permission-denied',
          });
        }

        const now = Timestamp.now();
        const newMessage = {
          id: createId('msg'),
          from: 'user',
          body: req.body,
          at: now,
        };

        await updateDoc(ticketRef, {
          status: 'pending_agent',
          messages: arrayUnion(newMessage),
        });

        // Build the updated ticket locally to avoid a second read.
        const updatedData = {
          ...data,
          status: 'pending_agent',
          messages: [
            ...(Array.isArray(data['messages']) ? data['messages'] : []),
            newMessage,
          ],
        };

        return docToTicket(snap.id, updatedData);
      });
    },
  };
}
