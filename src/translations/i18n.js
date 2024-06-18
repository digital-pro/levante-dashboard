import { createI18n } from 'vue-i18n';
import { enTranslations, enUSTranslations, esTranslations, esCOTranslations, deTranslations } from './exports';

export const languageOptions = {
  'en-US': { translations: enUSTranslations, language: 'English (United States)', code: 'usa' },
  en: { translations: enTranslations, language: 'English (United Kingdom)', code: 'gb' },
  es: { translations: esTranslations, language: 'Español (Spain)', code: 'es' },
  'es-CO': { translations: esCOTranslations, language: 'Español (América Latina)', code: 'col' },
  de: { translations: deTranslations, language: 'Deutsch', code: 'de' },
};
export let browserLocale = window.navigator.language;

const getLocale = (locale) => {
  if (Object.keys(languageOptions).includes(locale)) {
    console.log('Locale found in languageOptions: ', locale);
    return locale;
  } else if (locale.includes('es')) {
    console.log('Spanish dialect not supported, using default es.');
    return 'es';
  } else if (locale.includes('de')) {
    console.log('German dialect not supported, using default de.');
    return 'de';
  } else {
    console.log('Language not supported, using default en-US.');
    return 'en-US';
  }
};

const getFallbackLocale = (locale) => {
  if (locale.includes('es')) {
    console.log('Setting fallback local to es');
    return 'es';
  } else if (locale.includes('de')) {
    console.log('Setting fallback local to de');
    return 'de';
  } else {
    console.log('Setting fallback local to en-US');
    return 'en-US';
  }
};

export const i18n = createI18n({
  locale: getLocale(browserLocale),
  fallbackLocale: getFallbackLocale(browserLocale),
  messages: {
    en: enUSTranslations,
    'en-US': enUSTranslations,
    es: esTranslations,
    'es-CO': esCOTranslations,
    de: deTranslations,
  },
  legacy: false,
  globalInjection: true,
});
