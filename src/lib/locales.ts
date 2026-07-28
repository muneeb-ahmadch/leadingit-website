/**
 * Locale enablement — single source of truth.
 *
 * Deliberately dependency-free (no i18next/react) so `vite.config.ts` can
 * import it directly at build-config time to compute the `__RTL_FONTS_ENABLED__`
 * compile-time flag (see vite.config.ts + src/main.tsx) that keeps the Arabic/
 * Urdu font payload out of the bundle while those locales are disabled.
 * `src/i18n.ts` re-exports everything here for app code.
 */
export type Locale = 'en' | 'ar' | 'ur';

export const SUPPORTED_LOCALES: Locale[] = ['en', 'ar', 'ur'];
export const ENABLED_LOCALES: Locale[] = ['en']; // ar + ur wired but content deferred
export const RTL_LOCALES: Locale[] = ['ar', 'ur'];
