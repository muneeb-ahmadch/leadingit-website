import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';

export type { Locale } from './lib/locales';
export { SUPPORTED_LOCALES, ENABLED_LOCALES, RTL_LOCALES } from './lib/locales';
import { RTL_LOCALES, type Locale } from './lib/locales';

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en } },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export function applyLocaleToDocument(locale: Locale) {
  const html = document.documentElement;
  html.lang = locale;
  html.dir = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';
}

export default i18n;
