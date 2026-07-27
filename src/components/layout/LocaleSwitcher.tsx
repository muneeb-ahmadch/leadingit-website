import { useTranslation } from 'react-i18next';
import { applyLocaleToDocument, ENABLED_LOCALES, SUPPORTED_LOCALES, type Locale } from '@/i18n';

const LABELS: Record<Locale, { native: string; latin: string }> = {
  en: { native: 'English', latin: 'EN' },
  ar: { native: 'العربية', latin: 'AR' },
  ur: { native: 'اردو', latin: 'UR' },
};

export function LocaleSwitcher() {
  const { i18n, t } = useTranslation();
  const current = (i18n.language as Locale) ?? 'en';

  const setLocale = (loc: Locale) => {
    if (!ENABLED_LOCALES.includes(loc)) return;
    void i18n.changeLanguage(loc);
    applyLocaleToDocument(loc);
  };

  return (
    <ul className="space-y-3">
      {SUPPORTED_LOCALES.map((loc) => {
        const enabled = ENABLED_LOCALES.includes(loc);
        const active = loc === current;
        return (
          <li key={loc}>
            <button
              onClick={() => setLocale(loc)}
              disabled={!enabled}
              className={`flex items-center gap-3 text-sm transition-colors
                ${active ? 'text-gold' : enabled ? 'text-bone-100 hover:text-gold' : 'text-bone-500/40 cursor-not-allowed'}`}
            >
              <span className="font-mono text-xs w-6">{LABELS[loc].latin}</span>
              <span className={loc === 'ar' ? 'font-arabic' : loc === 'ur' ? 'font-urdu' : ''}>
                {LABELS[loc].native}
              </span>
              {!enabled && (
                <span className="text-[10px] uppercase tracking-luxe text-bone-500/50 ms-2">
                  {t('footer.comingSoon')}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
