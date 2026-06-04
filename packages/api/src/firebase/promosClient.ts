/**
 * Firebase Firestore implementation of PromosApi.
 *
 * Paths:
 *   promos (collection) — documents have: code, kind, value, validFrom,
 *     validTo, appliesTo, status, [minSpend].
 *
 * Clients have READ-ONLY access to promos (see firestore.rules).
 * `validate` queries promos where code == req.code.
 * `apply` computes the PromoApplication locally after a validate.
 */
import {
  collection,
  query,
  where,
  limit,
  getDocs,
} from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import type { PromosApi } from '../endpoints/promos.js';
import { notFoundError, validationError } from '../errors.js';
import { err } from '@vroom/utils';
import { fbGuard } from './errors.js';
import { COLLECTIONS, docToPromo } from './mappers.js';

export function createPromosClient(db: Firestore): PromosApi {
  return {
    async validatePromo(req) {
      return fbGuard(async () => {
        const q = query(
          collection(db, COLLECTIONS.promos),
          where('code', '==', req.code),
          limit(1),
        );
        const snap = await getDocs(q);
        if (snap.empty) {
          throw Object.assign(new Error(`Promo code '${req.code}' not found`), {
            code: 'not-found',
          });
        }
        const d = snap.docs[0]!;
        return docToPromo(d.id, d.data());
      });
    },

    async applyPromo(req) {
      return fbGuard(async () => {
        const q = query(
          collection(db, COLLECTIONS.promos),
          where('code', '==', req.code),
          where('status', '==', 'active'),
          limit(1),
        );
        const snap = await getDocs(q);
        if (snap.empty) {
          throw Object.assign(
            new Error(`Promo code '${req.code}' not found or inactive`),
            { code: 'not-found' },
          );
        }
        const d = snap.docs[0]!;
        const promo = docToPromo(d.id, d.data());

        if (!promo.appliesTo.includes(req.serviceType)) {
          throw Object.assign(
            new Error(`Promo '${req.code}' does not apply to ${req.serviceType}`),
            { code: 'invalid-argument' },
          );
        }

        if (
          promo.minSpend !== undefined &&
          req.amount.amount < promo.minSpend.amount
        ) {
          throw Object.assign(
            new Error(`Minimum spend of ${promo.minSpend.amount} required`),
            { code: 'invalid-argument' },
          );
        }

        const discountAmount =
          promo.kind === 'percent'
            ? Math.floor((req.amount.amount * promo.value) / 100)
            : Math.min(promo.value, req.amount.amount);

        return {
          promoId: promo.id,
          discount: { amount: discountAmount, currency: req.amount.currency },
          finalAmount: { amount: req.amount.amount - discountAmount, currency: req.amount.currency },
        };
      });
    },
  };
}
