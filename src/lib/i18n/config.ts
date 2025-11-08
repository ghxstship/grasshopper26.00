/**
 * Internationalization Configuration
 * Supports multiple languages with RTL support
 */

export const i18nConfig = {
  defaultLocale: 'en',
  locales: ['en', 'es', 'fr', 'de', 'ja', 'ar', 'he'] as const,
  
  // Locale metadata
  localeMetadata: {
    en: { 
      direction: 'ltr' as const, 
      name: 'English',
      flag: '🇺🇸',
    },
    es: { 
      direction: 'ltr' as const, 
      name: 'Español',
      flag: '🇪🇸',
    },
    fr: { 
      direction: 'ltr' as const, 
      name: 'Français',
      flag: '🇫🇷',
    },
    de: { 
      direction: 'ltr' as const, 
      name: 'Deutsch',
      flag: '🇩🇪',
    },
    ja: { 
      direction: 'ltr' as const, 
      name: '日本語',
      flag: '🇯🇵',
    },
    ar: { 
      direction: 'rtl' as const, 
      name: 'العربية',
      flag: '🇸🇦',
    },
    he: { 
      direction: 'rtl' as const, 
      name: 'עברית',
      flag: '🇮🇱',
    },
  },
} as const;

export type Locale = typeof i18nConfig.locales[number];
export type LocaleMetadata = typeof i18nConfig.localeMetadata;
