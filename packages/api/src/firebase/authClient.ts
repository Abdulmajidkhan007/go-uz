/**
 * Firebase Auth implementation of AuthApi.
 *
 * Phone-auth flow:
 * 1. `requestOtp` calls `signInWithPhoneNumber(auth, phone, verifier)`.
 *    The verifier is provided by the platform (e.g. RecaptchaVerifier on web).
 *    The returned `ConfirmationResult` is stored in a module-level Map keyed
 *    by a generated `challengeId`; that ID is returned to the caller.
 * 2. `verifyOtp` looks up the ConfirmationResult and calls `.confirm(code)`.
 *    On success it extracts the ID token + refreshToken and builds a `Session`.
 * 3. `refresh` calls `getIdToken(true)` to force a token refresh via Firebase.
 * 4. `signOut` calls Firebase `signOut`.
 *
 * Verifier wiring:
 *   Pass `options.getPhoneVerifier` returning an `ApplicationVerifier` (e.g.
 *   `new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' })`).
 *   If no verifier is provided, `requestOtp` returns a `validation` ApiError
 *   explaining that setup is required.
 *
 * NOTE: In a React Native context, use `getReactNativePersistence` + a custom
 * verifier from `expo-firebase-recaptcha` or a similar package; the interface
 * is identical.
 */
import {
  signInWithPhoneNumber,
  signOut as fbSignOut,
  getIdToken,
} from 'firebase/auth';
import type { Auth, ConfirmationResult, ApplicationVerifier } from 'firebase/auth';
import { createId } from '@vroom/utils';
import type { IsoDateTime, UserId } from '@vroom/types';
import type { AuthApi } from '../endpoints/auth.js';
import type { ApiResult } from '../errors.js';
import { validationError, unauthorizedError, notFoundError } from '../errors.js';
import { err, ok } from '@vroom/utils';
import { fbGuard } from './errors.js';

// ---------------------------------------------------------------------------
// In-process confirmation result store
// ---------------------------------------------------------------------------

/** challengeId -> ConfirmationResult */
const _pendingConfirmations = new Map<string, ConfirmationResult>();

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createAuthClient(
  auth: Auth,
  getPhoneVerifier?: () => ApplicationVerifier,
): AuthApi {
  return {
    async requestOtp(req): ApiResult<{ readonly challengeId: string }> {
      if (!req.phone.startsWith('+')) {
        return err(
          validationError('Phone must be in E.164 format (e.g. +998901234567)', {
            phone: ['Must start with +'],
          }),
        );
      }

      if (getPhoneVerifier === undefined) {
        return err(
          validationError(
            'Phone authentication requires an ApplicationVerifier. ' +
              'Pass `getPhoneVerifier` in FirebaseClientOptions. ' +
              'On web: new RecaptchaVerifier(auth, "recaptcha-container", { size: "invisible" }). ' +
              'On React Native: use expo-firebase-recaptcha or a custom provider.',
          ),
        );
      }

      const verifier = getPhoneVerifier();

      return fbGuard(async () => {
        const confirmation = await signInWithPhoneNumber(auth, req.phone, verifier);
        const challengeId = createId('chg');
        _pendingConfirmations.set(challengeId, confirmation);
        return { challengeId };
      });
    },

    async verifyOtp(req): ApiResult<import('../contracts/auth.js').VerifyOtpRes> {
      const confirmation = _pendingConfirmations.get(req.challengeId);
      if (confirmation === undefined) {
        return err(
          notFoundError(
            `No pending OTP challenge found for challengeId "${req.challengeId}". ` +
              'Call requestOtp first.',
          ),
        );
      }

      return fbGuard(async () => {
        const credential = await confirmation.confirm(req.code);
        const firebaseUser = credential.user;

        // Clean up — a confirmation can only be used once.
        _pendingConfirmations.delete(req.challengeId);

        const accessToken = await getIdToken(firebaseUser);
        const refreshToken = firebaseUser.refreshToken;

        // Firebase tokens expire in 1 hour by default.
        const expiresAt = new Date(Date.now() + 3_600_000).toISOString() as IsoDateTime;

        return {
          accessToken,
          refreshToken,
          userId: firebaseUser.uid as UserId,
          expiresAt,
        };
      });
    },

    async refresh(req): ApiResult<import('../contracts/auth.js').RefreshRes> {
      if (!req.refreshToken) {
        return err(unauthorizedError('Missing refresh token'));
      }

      const firebaseUser = auth.currentUser;
      if (firebaseUser === null) {
        return err(unauthorizedError('No authenticated user — please sign in again'));
      }

      return fbGuard(async () => {
        // Force-refresh: ignores cached token.
        const accessToken = await getIdToken(firebaseUser, /* forceRefresh */ true);
        const expiresAt = new Date(Date.now() + 3_600_000).toISOString() as IsoDateTime;
        return {
          accessToken,
          refreshToken: firebaseUser.refreshToken,
          userId: firebaseUser.uid as UserId,
          expiresAt,
        };
      });
    },

    async signOut(): ApiResult<void> {
      return fbGuard(() => fbSignOut(auth));
    },
  };
}
