// ---------------------------------------------------------------------------
// Locales supported by the platform
// ---------------------------------------------------------------------------

export type SupportedLocale = 'uz' | 'ru' | 'en';

/** All locales the platform ships with. */
export const LOCALES = ['uz', 'ru', 'en'] as const satisfies readonly SupportedLocale[];

/** Default locale used when the user has no preference set. */
export const DEFAULT_LOCALE: SupportedLocale = 'uz';

/** BCP-47 locale tags for use with Intl APIs. */
export const LOCALE_BCP47: Readonly<Record<SupportedLocale, string>> = {
  uz: 'uz-UZ',
  ru: 'ru-RU',
  en: 'en-US',
} as const;
