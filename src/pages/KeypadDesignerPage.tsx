import { useTranslation } from 'react-i18next';
import { Reveal } from '@/components/primitives/Reveal';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { KeypadDesigner } from '@/features/keypadDesigner/KeypadDesigner';
import { useSeo } from '@/lib/useSeo';
import { SITE_NAME, absoluteUrl } from '@/lib/site';

export function KeypadDesignerPage() {
  const { t } = useTranslation();
  const path = '/brands/black-nova/keypad-designer';
  useSeo({
    title: t('designer.seoTitle'),
    description: t('designer.seoDescription'),
    path,
    keywords:
      'design Black Nova keypad, Black Nova keypad configurator, custom keypad UAE, custom keypad Pakistan, ALBA keypad designer, Black Nova Dubai',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: t('designer.seoTitle'),
      description: t('designer.seoDescription'),
      url: absoluteUrl(path),
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: absoluteUrl('/') },
      about: { '@type': 'Brand', name: 'Black Nova' },
    },
  });

  return (
    <>
      {/* hero */}
      <section className="relative pt-40 pb-14 container-luxe">
        <Reveal>
          <div className="flex items-center gap-3 text-xs uppercase tracking-luxe text-bone-500">
            <a href="/brands" className="hover:text-gold">Brands</a>
            <span>·</span>
            <a href="/brands/black-nova" className="hover:text-gold">Black Nova</a>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <Eyebrow>{t('designer.entryEyebrow')}</Eyebrow>
          <h1 className="mt-5 font-serif text-display max-w-4xl">{t('designer.heroTitle')}</h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-bone-300">{t('designer.heroBody')}</p>
        </Reveal>
      </section>

      {/* designer */}
      <section className="container-luxe pb-32">
        <KeypadDesigner />
      </section>
    </>
  );
}
