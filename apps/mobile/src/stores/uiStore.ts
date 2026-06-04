/**
 * uiStore — view/UI state (color scheme, etc).
 * Not persisted; resets on app restart.
 */
import { create } from 'zustand';
import type { ColorScheme } from '@vroom/theme';

interface UiState {
  colorScheme: ColorScheme;
}

interface UiActions {
  toggleColorScheme: () => void;
  setColorScheme: (scheme: ColorScheme) => void;
}

export type UiStore = UiState & UiActions;

export const useUiStore = create<UiStore>()((set) => ({
  colorScheme: 'light',

  toggleColorScheme: () =>
    set((s) => ({ colorScheme: s.colorScheme === 'light' ? 'dark' : 'light' })),

  setColorScheme: (scheme) => set({ colorScheme: scheme }),
}));
