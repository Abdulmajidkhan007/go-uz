import { createTheme, type Theme } from '@mui/material/styles';
import { palette, radius, typography } from '@vroom/theme';
import type { SemanticColors } from '@vroom/theme';

/** Builds an MUI theme from the shared Vroom design tokens. */
export function buildMuiTheme(colors: SemanticColors, mode: 'light' | 'dark'): Theme {
  return createTheme({
    palette: {
      mode,
      primary: { main: colors.brand, contrastText: colors.brandContrast },
      secondary: { main: colors.accent, contrastText: colors.accentContrast },
      background: { default: colors.background, paper: colors.surface },
      text: { primary: colors.textPrimary, secondary: colors.textSecondary },
      divider: colors.border,
      error: { main: palette.semantic.error.main },
      warning: { main: palette.semantic.warning.main },
      success: { main: palette.semantic.success.main },
      info: { main: palette.semantic.info.main },
    },
    typography: { fontFamily: typography.fontFamilies.sans },
    shape: { borderRadius: radius.md },
    components: {
      MuiButton: { styleOverrides: { root: { textTransform: 'none', boxShadow: 'none' } } },
      MuiAppBar: { defaultProps: { elevation: 0, color: 'inherit' } },
    },
  });
}
