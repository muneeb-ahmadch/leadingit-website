import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';

export type Locale = 'en' | 'ar' | 'ur';

export const SUPPORTED_LOCALES: Locale[] = ['en', 'ar', 'ur'];
export const ENABLED_LOCALES: Locale[] = ['en']; // ar + ur wired but content deferred
export const RTL_LOCALES: Locale[] = ['ar', 'ur'];

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
