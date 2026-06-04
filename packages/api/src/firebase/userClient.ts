/**
 * Firebase Firestore implementation of UserApi.
 *
 * Paths:
 *   users/{uid}                     — user profile document
 *   users/{uid}/addresses/{addrId}  — address subcollection
 */
import {
  doc,
  getDoc,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { createId } from '@vroom/utils';
import type { AddressId } from '@vroom/types';
import type { UserApi } from '../endpoints/user.js';
import { unauthorizedError, notFoundError } from '../errors.js';
import { err, ok } from '@vroom/utils';
import { fbGuard } from './errors.js';
import { COLLECTIONS, docToUser, docToAddress, addressToDoc } from './mappers.js';

export function createUserClient(auth: Auth, db: Firestore): UserApi {
  function requireUid(): string | null {
    return auth.currentUser?.uid ?? null;
  }

  return {
    async getMe() {
      const uid = requireUid();
      if (uid === null) return err(unauthorizedError('Not authenticated'));

      return fbGuard(async () => {
        const snap = await getDoc(doc(db, COLLECTIONS.users, uid));
        if (!snap.exists()) {
          // Auto-create a minimal profile from the Firebase Auth user.
          const fbUser = auth.currentUser!;
          const now = new Date().toISOString();
          const profile = {
            phone: fbUser.phoneNumber ?? '',
            displayName: fbUser.displayName ?? 'User',
            role: 'rider',
            createdAt: now,
            status: 'active',
          };
          await setDoc(doc(db, COLLECTIONS.users, uid), profile);
          return docToUser(uid, profile);
        }
        return docToUser(snap.id, snap.data());
      });
    },

    async listAddresses() {
      const uid = requireUid();
      if (uid === null) return err(unauthorizedError('Not authenticated'));

      return fbGuard(async () => {
        const colRef = collection(db, COLLECTIONS.users, uid, COLLECTIONS.addresses);
        const snap = await getDocs(colRef);
        const addresses = snap.docs.map((d) => docToAddress(d.id, uid, d.data()));
        return { addresses };
      });
    },

    async saveAddress(req) {
      const uid = requireUid();
      if (uid === null) return err(unauthorizedError('Not authenticated'));

      return fbGuard(async () => {
        const id = createId('addr') as AddressId;
        const colRef = collection(db, COLLECTIONS.users, uid, COLLECTIONS.addresses);
        const docRef = doc(colRef, id);
        const data = addressToDoc(uid, req);
        await setDoc(docRef, data);
        return docToAddress(id, uid, data);
      });
    },

    async deleteAddress(id) {
      const uid = requireUid();
      if (uid === null) return err(unauthorizedError('Not authenticated'));

      return fbGuard(async () => {
        const docRef = doc(db, COLLECTIONS.users, uid, COLLECTIONS.addresses, id);
        const snap = await getDoc(docRef);
        if (!snap.exists()) {
          throw Object.assign(new Error(`Address ${id} not found`), {
            code: 'not-found',
          });
        }
        await deleteDoc(docRef);
        return { deleted: true };
      });
    },
  };
}
