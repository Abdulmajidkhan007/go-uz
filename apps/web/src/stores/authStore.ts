import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session, User } from '@vroom/types';

interface AuthState {
  session: Session | null;
  user: User | null;
  setSession: (session: Session) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      user: null,
      setSession: (session: Session) => set({ session }),
      setUser: (user: User) => set({ user }),
      clearAuth: () => set({ session: null, user: null }),
      isAuthenticated: () => get().session !== null,
    }),
    {
      name: 'vroom-auth',
      partialize: (state) => ({
        session: state.session,
        user: state.user,
      }),
    },
  ),
);
