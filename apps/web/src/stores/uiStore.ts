import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ColorScheme } from '@vroom/theme';

interface UiState {
  colorScheme: ColorScheme;
  sidebarCollapsed: boolean;
  toggleColorScheme: () => void;
  setColorScheme: (scheme: ColorScheme) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      colorScheme: 'light',
      sidebarCollapsed: false,
      toggleColorScheme: () =>
        set({ colorScheme: get().colorScheme === 'light' ? 'dark' : 'light' }),
      setColorScheme: (scheme) => set({ colorScheme: scheme }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
    }),
    {
      name: 'vroom-ui',
      partialize: (state) => ({
        colorScheme: state.colorScheme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    },
  ),
);
