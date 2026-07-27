import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BRANDS, type BrandCategory } from '@/data/brands';
import { Reveal } from '@/components/primitives/Reveal';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { ArrowRight } from 'lucide-react';
import { useSeo } from '@/lib/useSeo';

const CATEGORIES: { id: BrandCategory; titleKey: string }[] = [
  { id: 'interfaces', titleKey: 'brands.categoryInterfaces' },
  { id: 'cinema', titleKey: 'brands.categoryCinema' },
];

export function BrandsIndex() {
  const { t } = useTranslation();
  useSeo({
    title: 'Brands We Represent — Premium Automation, Cinema & AV',
    description:
      'The brands distributed by Leading IT across the Gulf and Pakistan: Crestron, Blustream, Basalte, BlackNova, Marantz, Denon, U&K Sound, Polk Audio and JVC.',
    path: '/brands',
    keywords:
      'Crestron, Basalte, Marantz, Denon, Polk Audio, JVC, BlackNova, Blustream, automation brands Pakistan UAE',
  });

  return (
    <>
      {/* hero */}
      <section className="relative pt-44 pb-24 container-luxe">
        <Reveal>
          <Eyebrow>{t('brands.indexEyebrow')}</Eyebrow>
          <h1 className="mt-5 font-serif text-display">{t('brands.indexTitle')}</h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-8 text-lg leading-relaxed text-bone-300 max-w-2xl">
            {t('brands.indexSub')}
          </p>
        </Reveal>
      </section>

      {/* category groups */}
      {CATEGORIES.map((cat) => {
        const items = BRANDS.filter((b) => b.category === cat.id);
        return (
          <section key={cat.id} className="container-luxe pb-24">
            <Reveal>
              <div className="flex items-end justify-between mb-10">
                <div>
                  <Eyebrow>{t('brands.indexEyebrow')}</Eyebrow>
                  <h2 className="mt-4 font-serif text-hero">{t(cat.titleKey)}</h2>
                </div>
                <span className="hidden md:block text-xs font-mono text-bone-500">
                  {String(items.length).padStart(2, '0')} brands
                </span>
              </div>
            </Reveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 border border-white/5">
              {items.map((b, i) => (
                <Reveal key={b.slug} delay={i * 0.06}>
                  <Link
                    to={`/brands/${b.slug}`}
                    className="group relative block bg-ink-900 aspect-[4/5] overflow-hidden"
                  >
                    <img
                      src={b.heroImage}
                      alt={b.name}
                      className="absolute inset-0 h-full w-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-1000 ease-out-luxe"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
                    <div className="relative h-full p-8 flex flex-col justify-end">
                      <div className="eyebrow">{cat.id === 'interfaces' ? 'Architectural' : 'Cinema'}</div>
                      <div className="mt-3 font-serif text-3xl tracking-wider2 group-hover:text-gold transition-colors duration-500">
                        {b.wordmark}
                      </div>
                      <div className="mt-2 text-bone-300">{b.tagline}</div>
                      <div className="mt-6 flex items-center gap-2 text-sm uppercase tracking-luxe text-gold opacity-70 group-hover:opacity-100 transition-opacity">
                        <span>{t('brands.explore')}</span>
                        <ArrowRight size={14} className="transition-transform duration-500 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180" />
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
