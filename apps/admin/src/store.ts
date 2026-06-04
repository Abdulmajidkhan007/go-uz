/**
 * Minimal admin session + UI store (persisted to localStorage).
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session } from '@vroom/types';
import type { ColorScheme } from '@vroom/theme';

interface AdminState {
  session: Session | null;
  colorScheme: ColorScheme;
  setSession: (session: Session) => void;
  signOut: () => void;
  toggleColorScheme: () => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      session: null,
      colorScheme: 'light',
      setSession: (session) => set({ session }),
      signOut: () => set({ session: null }),
      toggleColorScheme: () => set({ colorScheme: get().colorScheme === 'light' ? 'dark' : 'light' }),
    }),
    { name: 'vroom-admin' },
  ),
);
