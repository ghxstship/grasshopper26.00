/**
 * Internationalization Configuration
 * Multi-language support with RTL handling
 */

export const i18nConfig = {
  defaultLocale: 'en',
  locales: ['en', 'es', 'fr', 'de', 'ja', 'ar', 'he', 'zh', 'pt', 'it'],
  
  // Locale metadata
  localeMetadata: {
    en: { 
      direction: 'ltr', 
      name: 'English',
      nativeName: 'English',
    },
    es: { 
      direction: 'ltr', 
      name: 'Spanish',
      nativeName: 'Español',
    },
    fr: { 
      direction: 'ltr', 
      name: 'French',
      nativeName: 'Français',
    },
    de: { 
      direction: 'ltr', 
      name: 'German',
      nativeName: 'Deutsch',
    },
    ja: { 
      direction: 'ltr', 
      name: 'Japanese',
      nativeName: '日本語',
    },
    ar: { 
      direction: 'rtl', 
      name: 'Arabic',
      nativeName: 'العربية',
    },
    he: { 
      direction: 'rtl', 
      name: 'Hebrew',
      nativeName: 'עברית',
    },
    zh: { 
      direction: 'ltr', 
      name: 'Chinese',
      nativeName: '中文',
    },
    pt: { 
      direction: 'ltr', 
      name: 'Portuguese',
      nativeName: 'Português',
    },
    it: { 
      direction: 'ltr', 
      name: 'Italian',
      nativeName: 'Italiano',
    },
  },
} as const;

export type Locale = typeof i18nConfig.locales[number];
export type LocaleMetadata = typeof i18nConfig.localeMetadata;
