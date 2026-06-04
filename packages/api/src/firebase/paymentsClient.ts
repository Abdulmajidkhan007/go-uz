/**
 * Firebase Firestore implementation of PaymentsApi.
 *
 * Paths:
 *   users/{uid}/paymentMethods/{id}  — payment method subcollection
 *   payments/{paymentId}             — payment documents
 *   users/{uid}/wallet               — wallet document (single doc, not a collection)
 */
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { createId } from '@vroom/utils';
import type { PaymentMethodId } from '@vroom/types';
import type { PaymentsApi } from '../endpoints/payments.js';
import { unauthorizedError, notFoundError } from '../errors.js';
import { err } from '@vroom/utils';
import { fbGuard } from './errors.js';
import {
  COLLECTIONS,
  docToPaymentMethod,
  docToPayment,
  docToWallet,
} from './mappers.js';

export function createPaymentsClient(auth: Auth, db: Firestore): PaymentsApi {
  function requireUid(): string | null {
    return auth.currentUser?.uid ?? null;
  }

  return {
    async listPaymentMethods() {
      const uid = requireUid();
      if (uid === null) return err(unauthorizedError('Not authenticated'));

      return fbGuard(async () => {
        const colRef = collection(db, COLLECTIONS.users, uid, COLLECTIONS.paymentMethods);
        const snap = await getDocs(colRef);
        return snap.docs.map((d) => docToPaymentMethod(d.id, d.data()));
      });
    },

    async addPaymentMethod(req) {
      const uid = requireUid();
      if (uid === null) return err(unauthorizedError('Not authenticated'));

      return fbGuard(async () => {
        const id = createId('pm') as PaymentMethodId;
        const colRef = collection(db, COLLECTIONS.users, uid, COLLECTIONS.paymentMethods);
        const docRef = doc(colRef, id);

        const data: Record<string, unknown> = {
          type: req.type,
          isDefault: false,
          ...(req.brand !== undefined ? { brand: req.brand } : {}),
          ...(req.last4 !== undefined ? { last4: req.last4 } : {}),
          ...(req.expiry !== undefined ? { expiry: req.expiry } : {}),
          // Note: token is NOT stored in Firestore — it's a one-time payment
          // provider token and should be tokenized server-side in production.
        };

        await setDoc(docRef, data);
        return docToPaymentMethod(id, data);
      });
    },

    async deletePaymentMethod(id) {
      const uid = requireUid();
      if (uid === null) return err(unauthorizedError('Not authenticated'));

      return fbGuard(async () => {
        const docRef = doc(db, COLLECTIONS.users, uid, COLLECTIONS.paymentMethods, id);
        const snap = await getDoc(docRef);
        if (!snap.exists()) {
          throw Object.assign(new Error(`Payment method ${id} not found`), {
            code: 'not-found',
          });
        }
        await deleteDoc(docRef);
        return { deleted: true };
      });
    },

    async getPayment(req) {
      const uid = requireUid();
      if (uid === null) return err(unauthorizedError('Not authenticated'));

      return fbGuard(async () => {
        const snap = await getDoc(doc(db, COLLECTIONS.payments, req.paymentId));
        if (!snap.exists()) {
          throw Object.assign(new Error(`Payment ${req.paymentId} not found`), {
            code: 'not-found',
          });
        }
        return docToPayment(snap.id, snap.data());
      });
    },

    async getWallet() {
      const uid = requireUid();
      if (uid === null) return err(unauthorizedError('Not authenticated'));

      return fbGuard(async () => {
        const walletRef = doc(db, COLLECTIONS.users, uid, COLLECTIONS.wallet, 'default');
        const snap = await getDoc(walletRef);
        if (!snap.exists()) {
          // Return an empty wallet rather than a 404 — callers expect a Wallet.
          return {
            userId: uid as import('@vroom/types').UserId,
            balance: { amount: 0, currency: 'UZS' as import('@vroom/types').CurrencyCode },
            transactions: [],
          };
        }
        return docToWallet(uid, snap.data());
      });
    },
  };
}
