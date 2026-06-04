/**
 * ThemeContext — exposes design tokens + color scheme toggle.
 * Backed by uiStore so it survives navigation re-renders.
 */
import React, { createContext, useContext } from 'react';
import { lightTheme, darkTheme, spacing, radius, typography } from '@vroom/theme';
import type { SemanticColors, ColorScheme } from '@vroom/theme';
import { useUiStore } from '../../stores/uiStore';

export interface ThemeContextValue {
  colors: SemanticColors;
  scheme: ColorScheme;
  toggleScheme: () => void;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const scheme = useUiStore((s) => s.colorScheme);
  const toggleScheme = useUiStore((s) => s.toggleColorScheme);

  const colors = scheme === 'dark' ? darkTheme : lightTheme;

  const value: ThemeContextValue = {
    colors,
    scheme,
    toggleScheme,
    spacing,
    radius,
    typography,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx === null) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
