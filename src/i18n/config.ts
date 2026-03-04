export const locales = ['en', 'fr'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇨🇦',
  fr: '🇨🇦',
};

// Locale detection settings
export const localeDetection = {
  // Cookie name for storing user's locale preference
  cookieName: 'NEXT_LOCALE',
  // Header to check for locale
  headerName: 'Accept-Language',
};
