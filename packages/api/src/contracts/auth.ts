import type { Session } from '@vroom/types';

// ---------------------------------------------------------------------------
// Auth contracts
// ---------------------------------------------------------------------------

export interface RequestOtpReq {
  readonly phone: string;
}

export interface RequestOtpRes {
  readonly challengeId: string;
}

export interface VerifyOtpReq {
  readonly challengeId: string;
  readonly code: string;
}

export type VerifyOtpRes = Session;

export interface RefreshReq {
  readonly refreshToken: string;
}

export type RefreshRes = Session;
