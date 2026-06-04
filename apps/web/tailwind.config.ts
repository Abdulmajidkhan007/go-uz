import type { Config } from 'tailwindcss';
import { palette, spacing, radius, typography } from '../../packages/theme/src/index.js';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: palette.primary,
        accent: palette.accent,
        neutral: palette.neutral,
        success: palette.semantic.success,
        warning: palette.semantic.warning,
        error: palette.semantic.error,
        info: palette.semantic.info,
      },
      spacing: {
        xs: `${spacing.xs}px`,
        sm: `${spacing.sm}px`,
        md: `${spacing.md}px`,
        lg: `${spacing.lg}px`,
        xl: `${spacing.xl}px`,
        '2xl': `${spacing['2xl']}px`,
        '3xl': `${spacing['3xl']}px`,
        '4xl': `${spacing['4xl']}px`,
        '5xl': `${spacing['5xl']}px`,
        '6xl': `${spacing['6xl']}px`,
      },
      borderRadius: {
        sm: `${radius.sm}px`,
        md: `${radius.md}px`,
        lg: `${radius.lg}px`,
        xl: `${radius.xl}px`,
        full: `${radius.full}px`,
      },
      fontFamily: {
        sans: typography.fontFamilies.sans.split(', '),
        mono: typography.fontFamilies.mono.split(', '),
      },
      fontSize: {
        '2xs': [`${typography.fontSize['2xs']}px`, { lineHeight: '1.4' }],
        xs: [`${typography.fontSize.xs}px`, { lineHeight: '1.4' }],
        sm: [`${typography.fontSize.sm}px`, { lineHeight: '1.45' }],
        base: [`${typography.fontSize.base}px`, { lineHeight: '1.45' }],
        lg: [`${typography.fontSize.lg}px`, { lineHeight: '1.45' }],
        xl: [`${typography.fontSize.xl}px`, { lineHeight: '1.25' }],
        '2xl': [`${typography.fontSize['2xl']}px`, { lineHeight: '1.25' }],
        '3xl': [`${typography.fontSize['3xl']}px`, { lineHeight: '1.15' }],
        '4xl': [`${typography.fontSize['4xl']}px`, { lineHeight: '1.15' }],
        '5xl': [`${typography.fontSize['5xl']}px`, { lineHeight: '1.1' }],
      },
    },
  },
  plugins: [],
};

export default config;
