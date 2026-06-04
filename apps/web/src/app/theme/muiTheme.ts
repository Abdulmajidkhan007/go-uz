import { createTheme } from '@mui/material/styles';
import type { SemanticColors } from '@vroom/theme';
import { palette, radius, typography } from '@vroom/theme';

export function buildMuiTheme(colors: SemanticColors, mode: 'light' | 'dark') {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: colors.brand,
        contrastText: colors.brandContrast,
        light: palette.primary[300],
        dark: palette.primary[700],
      },
      secondary: {
        main: colors.accent,
        contrastText: colors.accentContrast,
        light: palette.accent[200],
        dark: palette.accent[600],
      },
      background: {
        default: colors.background,
        paper: colors.surface,
      },
      text: {
        primary: colors.textPrimary,
        secondary: colors.textSecondary,
      },
      divider: colors.border,
      error: {
        main: palette.semantic.error.main,
        light: palette.semantic.error.light,
        dark: palette.semantic.error.dark,
        contrastText: palette.semantic.error.contrast,
      },
      warning: {
        main: palette.semantic.warning.main,
        light: palette.semantic.warning.light,
        dark: palette.semantic.warning.dark,
        contrastText: palette.semantic.warning.contrast,
      },
      success: {
        main: palette.semantic.success.main,
        light: palette.semantic.success.light,
        dark: palette.semantic.success.dark,
        contrastText: palette.semantic.success.contrast,
      },
      info: {
        main: palette.semantic.info.main,
        light: palette.semantic.info.light,
        dark: palette.semantic.info.dark,
        contrastText: palette.semantic.info.contrast,
      },
    },
    typography: {
      fontFamily: typography.fontFamilies.sans,
      h1: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: Number(typography.fontWeight.bold),
        lineHeight: typography.lineHeight.snug,
      },
      h2: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: Number(typography.fontWeight.semibold),
        lineHeight: typography.lineHeight.snug,
      },
      h3: {
        fontSize: typography.fontSize.xl,
        fontWeight: Number(typography.fontWeight.semibold),
        lineHeight: typography.lineHeight.snug,
      },
      h4: {
        fontSize: typography.fontSize.lg,
        fontWeight: Number(typography.fontWeight.semibold),
        lineHeight: typography.lineHeight.snug,
      },
      body1: {
        fontSize: typography.fontSize.base,
        fontWeight: Number(typography.fontWeight.regular),
        lineHeight: typography.lineHeight.normal,
      },
      body2: {
        fontSize: typography.fontSize.sm,
        fontWeight: Number(typography.fontWeight.regular),
        lineHeight: typography.lineHeight.normal,
      },
      caption: {
        fontSize: typography.fontSize.xs,
        lineHeight: typography.lineHeight.normal,
      },
      button: {
        fontSize: typography.fontSize.base,
        fontWeight: Number(typography.fontWeight.semibold),
        textTransform: 'none',
      },
    },
    shape: {
      borderRadius: radius.md,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: radius.xl,
            textTransform: 'none',
            fontWeight: Number(typography.fontWeight.semibold),
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
          },
          sizeLarge: {
            padding: '12px 24px',
            fontSize: typography.fontSize.base,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: radius.lg,
            boxShadow: mode === 'light'
              ? '0 1px 3px rgba(14,14,20,0.08), 0 1px 2px rgba(14,14,20,0.06)'
              : '0 1px 3px rgba(0,0,0,0.3)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: radius.md,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: radius.xl,
            fontWeight: Number(typography.fontWeight.medium),
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: radius.lg,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRadius: 0,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: radius.md,
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: colors.background,
          },
        },
      },
    },
  });
}
