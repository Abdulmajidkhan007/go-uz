import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Session, User } from '@vroom/types';
import { zustandStorage } from '../lib/storage';

interface AuthState {
  session: Session | null;
  user: User | null;
  isHydrated: boolean;
}

interface AuthActions {
  setSession: (session: Session) => void;
  setUser: (user: User) => void;
  signOut: () => void;
  setHydrated: () => void;
}

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      session: null,
      user: null,
      isHydrated: false,

      setSession: (session) => set({ session }),
      setUser: (user) => set({ user }),
      signOut: () => set({ session: null, user: null }),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'vroom-auth',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({ session: state.session, user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
