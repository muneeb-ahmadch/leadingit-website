import { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { PRODUCT_BY_SLUG } from '@/data/products';
import { BRAND_BY_SLUG } from '@/data/brands';
import { Reveal } from '@/components/primitives/Reveal';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { ButtonLink } from '@/components/primitives/Button';
import { useHydrated } from '@/lib/hydration';
import { useSeo } from '@/lib/useSeo';
import { SITE_NAME, absoluteUrl } from '@/lib/site';

const SECTIONS = [
  { id: 'overview', i18nKey: 'product.navOverview' },
  { id: 'design', i18nKey: 'product.navDesign' },
  { id: 'finishes', i18nKey: 'product.navFinishes' },
  { id: 'specs', i18nKey: 'product.navSpecs' },
  { id: 'in-use', i18nKey: 'product.navInUse' },
];

export function ProductPage() {
  const { slug = '', productSlug = '' } = useParams();
  const { t } = useTranslation();
  const product = PRODUCT_BY_SLUG[productSlug];
  const brand = BRAND_BY_SLUG[slug];
  const [finishId, setFinishId] = useState(product?.finishes[0]?.id ?? '');
  // The product shot is part of the prerendered HTML, so it ships fully
  // visible; the cross-fade only applies to finish swaps after hydration.
  const hydrated = useHydrated();

  const path = `/brands/${slug}/${productSlug}`;
  const seoName = product && brand ? `${brand.name} ${product.name}` : SITE_NAME;
  const seoDesc = product?.metaDescription ?? product?.description ?? '';
  useSeo({
    title: product && brand ? `${seoName} — ${product.collection}` : SITE_NAME,
    description: seoDesc,
    path,
    image: product?.hero,
    type: 'product',
    keywords: product?.keywords?.join(', '),
    jsonLd:
      product && brand
        ? [
            {
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: seoName,
              description: seoDesc,
              image: absoluteUrl(product.hero),
              category: product.collection,
              url: absoluteUrl(path),
              brand: { '@type': 'Brand', name: brand.name },
              offers: {
                '@type': 'Offer',
                availability: 'https://schema.org/InStock',
                priceCurrency: 'AED',
                seller: { '@type': 'Organization', name: SITE_NAME },
              },
            },
            {
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Brands', item: absoluteUrl('/brands') },
                { '@type': 'ListItem', position: 2, name: brand.name, item: absoluteUrl(`/brands/${brand.slug}`) },
                { '@type': 'ListItem', position: 3, name: product.name, item: absoluteUrl(path) },
              ],
            },
          ]
        : undefined,
  });

  if (!product || !brand) return <Navigate to="/brands" replace />;

  const activeFinish = product.finishes.find((f) => f.id === finishId) ?? product.finishes[0];

  return (
    <>
      {/* hero */}
      <section className="relative pt-32 pb-12 container-luxe">
        <Reveal>
          <div className="flex items-center gap-3 text-xs uppercase tracking-luxe text-bone-500">
            <a href="/brands" className="hover:text-gold">Brands</a>
            <span>·</span>
            <a href={`/brands/${brand.slug}`} className="hover:text-gold">{brand.name}</a>
          </div>
        </Reveal>
        <div className="grid lg:grid-cols-[1fr_1fr] gap-12 items-center mt-10">
          <div>
            <Reveal>
              <Eyebrow>{product.collection}</Eyebrow>
              <h1 className="mt-5 font-serif text-display">{product.name}</h1>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-6 text-xl text-bone-300 max-w-xl">{product.tagline}</p>
            </Reveal>
          </div>
          <Reveal delay={0.25}>
            <div className="relative aspect-square bg-ink-900 overflow-hidden">
              <div className="absolute inset-0 bg-warm-radial opacity-70" />
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeFinish.id}
                  src={activeFinish.productImage}
                  alt={`${product.name} in ${activeFinish.name}`}
                  initial={hydrated ? { opacity: 0, scale: 1.04 } : false}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 h-full w-full object-contain p-10 md:p-16"
                />
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </section>

      {/* sticky section nav */}
      <nav className="sticky top-16 z-30 bg-ink-950/85 backdrop-blur-md border-y border-white/5">
        <div className="container-luxe flex gap-8 overflow-x-auto py-4">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="shrink-0 text-xs uppercase tracking-luxe text-bone-500 hover:text-gold transition-colors"
            >
              {t(s.i18nKey)}
            </a>
          ))}
        </div>
      </nav>

      {/* overview */}
      <section id="overview" className="container-luxe py-24 grid lg:grid-cols-[1fr_2fr] gap-12">
        <Reveal><Eyebrow>{t('product.navOverview')}</Eyebrow></Reveal>
        <Reveal delay={0.15}>
          <p className="font-serif text-3xl leading-snug text-bone-100 max-w-3xl">{product.description}</p>
        </Reveal>
      </section>

      {/* finishes */}
      <section id="finishes" className="bg-ink-900 py-24">
        <div className="container-luxe">
          <Reveal>
            <Eyebrow>{t('product.navFinishes')}</Eyebrow>
            <h2 className="mt-4 font-serif text-hero">{t('product.finishesTitle')}</h2>
          </Reveal>
          <div className="mt-12 grid md:grid-cols-[1fr_2fr] gap-12 items-center">
            <div className="flex flex-col gap-3">
              {product.finishes.map((f) => {
                const active = f.id === finishId;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFinishId(f.id)}
                    className={`flex items-center gap-4 px-4 py-3 border transition-all duration-500
                      ${active ? 'border-gold bg-ink-800' : 'border-white/5 hover:border-white/20'}`}
                  >
                    <span
                      className="block w-10 h-10 rounded-full border border-white/10"
                      style={{ background: f.swatch }}
                    />
                    <div className="text-start">
                      <div className={`text-sm uppercase tracking-luxe ${active ? 'text-gold' : 'text-bone-300'}`}>
                        {f.name}
                      </div>
                      <div className="text-xs text-bone-500 font-mono mt-0.5">{f.id}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="relative aspect-[5/4] bg-ink-950 overflow-hidden">
              <div className="absolute inset-0 bg-warm-radial opacity-70" />
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeFinish.id}
                  src={activeFinish.productImage}
                  alt={activeFinish.name}
                  initial={hydrated ? { opacity: 0, scale: 1.04 } : false}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 h-full w-full object-contain p-10 md:p-16"
                />
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* specs */}
      <section id="specs" className="container-luxe py-24">
        <Reveal>
          <Eyebrow>{t('product.navSpecs')}</Eyebrow>
          <h2 className="mt-4 font-serif text-hero">{t('product.specsTitle')}</h2>
        </Reveal>
        <div className="mt-12 grid md:grid-cols-3 gap-8">
          {product.specs.map((g, i) => (
            <Reveal key={g.label} delay={i * 0.08}>
              <div className="border-t border-gold/30 pt-6">
                <div className="eyebrow mb-5">{g.label}</div>
                <dl className="space-y-3 font-mono text-sm">
                  {g.rows.map((row) => (
                    <div key={row.name} className="flex justify-between gap-6 border-b border-white/5 pb-3">
                      <dt className="text-bone-500">{row.name}</dt>
                      <dd className="text-bone-100 text-end">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* in use */}
      <section id="in-use" className="container-luxe pb-32">
        <Reveal>
          <Eyebrow>{t('product.navInUse')}</Eyebrow>
          <h2 className="mt-4 font-serif text-hero">{t('product.inUseTitle')}</h2>
        </Reveal>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {product.inUse.map((src, i) => {
            const isRender = /\/products\/.*\.(png|webp)$/i.test(src);
            return (
              <Reveal key={src} delay={i * 0.08}>
                <div className="relative aspect-[4/5] bg-ink-900 overflow-hidden">
                  {isRender && <div className="absolute inset-0 bg-warm-radial opacity-70" />}
                  <img
                    src={src}
                    alt=""
                    className={`relative h-full w-full ${isRender ? 'object-contain p-8' : 'object-cover'}`}
                    loading="lazy"
                  />
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* design your keypad (Black Nova) */}
      {brand.slug === 'black-nova' && (
        <section className="container-luxe pb-16">
          <Reveal>
            <div className="relative overflow-hidden border border-gold/20 bg-ink-900">
              <div className="absolute inset-0 bg-warm-radial opacity-70" />
              <div className="relative p-10 md:p-14 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                <div>
                  <Eyebrow>{t('designer.entryEyebrow')}</Eyebrow>
                  <h3 className="mt-4 font-serif text-3xl max-w-xl">{t('designer.productCta', { name: product.name })}</h3>
                </div>
                <ButtonLink to={`/brands/${brand.slug}/keypad-designer?c=${product.slug}`}>{t('designer.entryCta')}</ButtonLink>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* inquire */}
      <section className="container-luxe pb-32">
        <Reveal>
          <div className="border-t border-gold/20 pt-10 flex flex-col md:flex-row gap-6 md:items-center justify-between">
            <div>
              <Eyebrow>Next step</Eyebrow>
              <h3 className="mt-3 font-serif text-3xl">{t('product.ctaInquire')}</h3>
            </div>
            <ButtonLink to="/brands">{t('common.inquire')}</ButtonLink>
          </div>
        </Reveal>
      </section>
    </>
  );
}
