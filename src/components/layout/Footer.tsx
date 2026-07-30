import { useTranslation } from 'react-i18next';
import { href } from '@/seo/paths';
import { LocaleSwitcher } from './LocaleSwitcher';

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="relative mt-32 border-t border-white/5 bg-ink-900">
      <div className="container-luxe py-20 grid gap-16 md:grid-cols-[1.5fr_1fr_1fr]">
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
            <li><a href={href('/lit-home')} className="hover:text-gold transition-colors">LIT Home</a></li>
          </ul>
        </div>

        <div>
          <div className="eyebrow mb-5">{t('footer.languageLabel')}</div>
          <LocaleSwitcher />
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="container-luxe py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-bone-500/70 tracking-wider2 uppercase">
          <span>{t('footer.rights', { year: new Date().getFullYear() })}</span>
          <span>UAE · Pakistan</span>
        </div>
      </div>
    </footer>
  );
}
