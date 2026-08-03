import { useTranslation } from 'react-i18next';
import { href } from '@/seo/paths';
import { LocaleSwitcher } from './LocaleSwitcher';

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="relative mt-32 border-t border-white/5 bg-ink-900">
      <div className="container-luxe py-20 grid gap-16 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <div className="font-serif text-3xl tracking-wider2">
            Leading <span className="text-gold">IT</span>
          </div>
          <p className="mt-6 max-w-md text-bone-500 leading-relaxed">{t('footer.tagline')}</p>
        </div>

        <div>
          <div className="eyebrow mb-5">Portfolio</div>
          <ul className="space-y-3 text-bone-300">
            <li><a href={href('/brands')} className="hover:text-gold transition-colors">Architectural Interfaces</a></li>
            <li><a href={href('/brands')} className="hover:text-gold transition-colors">Cinema &amp; AV</a></li>
            {/*
             * Descriptive anchor, never "Solutions" alone — _CONVENTIONS.md §8
             * bans generic anchor text, and the footer is a sitewide link so its
             * anchor is the one repeated most.
             */}
            <li><a href={href('/solutions')} className="hover:text-gold transition-colors">Automation Solutions</a></li>
            <li><a href={href('/lit-home')} className="hover:text-gold transition-colors">LIT Home</a></li>
          </ul>
        </div>

        {/*
         * `/locations/dubai/` is required to be linked sitewide from the footer
         * (`_CONVENTIONS.md` §8, `docs/05-URL-TAXONOMY.md` §12), and the footer
         * is the link that repeats on every page — so its anchor text is the one
         * that matters most and is descriptive, never a bare city name.
         */}
        <div>
          <div className="eyebrow mb-5">{t('footer.companyLabel')}</div>
          <ul className="space-y-3 text-bone-300">
            <li>
              <a href={href('/locations/dubai')} className="hover:text-gold transition-colors">
                {t('locations.footerLink')}
              </a>
            </li>
            {/* `/trade/` is required in the footer as well (`_CONVENTIONS.md`
                §8): the trade audience must be able to reach its page without
                depending on the consumer navigation path. */}
            <li>
              <a href={href('/trade')} className="hover:text-gold transition-colors">
                {t('trade.footerLink')}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <div className="eyebrow mb-5">{t('footer.languageLabel')}</div>
          <LocaleSwitcher />
        </div>
      </div>

      <div className="border-t border-white/5">
        {/*
         * `text-bone-500`, NOT `text-bone-500/70` — WCAG 2.2 SC 1.4.3 (AA).
         *
         * The /70 variant composites to #77746d on ink-900 and measures
         * **4.04:1** against a 4.5:1 requirement. `text-xs` is far below the
         * 18pt / 14pt-bold "large text" threshold, so 3:1 does not apply. This
         * line is in the footer of all 122 pages, which made it the single
         * highest-reach contrast failure on the site.
         *
         * Fixed by dropping the alpha rather than touching a token: bare
         * bone.500 is **7.08:1** on ink-900 and is already the sitewide default
         * for muted text. The Direction B palette is LOCKED and is unchanged by
         * this — same token, full opacity.
         *
         * Do not reintroduce an opacity modifier on this element. Every
         * bone.500/NN variant below /90 fails 4.5:1 on all three ink grounds.
         */}
        <div className="container-luxe py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-bone-500 tracking-wider2 uppercase">
          <span>{t('footer.rights', { year: new Date().getFullYear() })}</span>
          <span>UAE · Pakistan</span>
        </div>
      </div>
    </footer>
  );
}
