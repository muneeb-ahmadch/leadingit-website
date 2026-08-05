import { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { PRODUCT_BY_SLUG, productsForBrand } from '@/data/products';
import { BRAND_BY_SLUG } from '@/data/brands';
import { Reveal } from '@/components/primitives/Reveal';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { ButtonLink } from '@/components/primitives/Button';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { InternalLinks, type InternalLink } from '@/components/InternalLinks';
import { EnquiryCta } from '@/components/EnquiryCta';
import { ResponsiveImage } from '@/components/media/ResponsiveImage';
import { buildLcpImagePreload } from '@/components/media/imageSrcSet';
import { altFor } from '@/components/media/altText';
import { useHydrated } from '@/lib/hydration';
import { productPrefill } from '@/lib/prefill';
import { Seo } from '@/seo/Seo';
import { KEYPAD_DESIGNER_PATH, href } from '@/seo/paths';
import { productMeta } from '@/seo/meta';
import { productCrumbs } from '@/seo/breadcrumbs';
import { isRangeProduct } from '@/seo/ranges';
import { buildProduct } from '@/seo/jsonld/product';
import { buildWebPage } from '@/seo/jsonld/webpage';
import { buildCollectionPage } from '@/seo/jsonld/itemList';
import { buildBreadcrumbList } from '@/seo/jsonld/breadcrumbList';
import { breadcrumbNodeId } from '@/seo/jsonld/ids';

/**
 * Every entry here MUST have a matching `<section id="...">` rendered below.
 * A `design` entry sat in this list from the start with no section to match it,
 * so 98 of 124 routes shipped a sticky-nav control that did nothing when
 * clicked — the exact thing the `hasInUse` comment below says must never ship.
 * It was invisible to every check that asked "does the link exist?" instead of
 * "does its target exist?". If you add one, render the section in the same
 * change; never close the gap with an empty section.
 */
const SECTIONS = [
  { id: 'overview', i18nKey: 'product.navOverview' },
  { id: 'finishes', i18nKey: 'product.navFinishes' },
  { id: 'specs', i18nKey: 'product.navSpecs' },
  { id: 'in-use', i18nKey: 'product.navInUse' },
];

/**
 * How many sibling products a product page links to. Enough to move a visitor
 * (and crawl equity) sideways through the brand's catalog; few enough that a
 * 26-product brand like Crestron does not turn every product page into a link
 * farm. The brand hub link below carries the rest.
 */
const RELATED_PRODUCT_LIMIT = 6;

export function ProductPage() {
  const { slug = '', productSlug = '' } = useParams();
  const { t } = useTranslation();
  const product = PRODUCT_BY_SLUG[productSlug];
  const brand = BRAND_BY_SLUG[slug];
  const [finishId, setFinishId] = useState(product?.finishes[0]?.id ?? '');
  // The product shot is part of the prerendered HTML, so it ships fully
  // visible; the cross-fade only applies to finish swaps after hydration.
  const hydrated = useHydrated();

  if (!product || !brand) return <Navigate to={href('/brands')} replace />;

  const activeFinish = product.finishes.find((f) => f.id === finishId) ?? product.finishes[0];
  // Some products have no "in use" imagery — e.g. JVC and the Crestron equipment-
  // rack placeholder have no official install photography at all
  // (docs/12-PROVENANCE/image-url-map.md). Both the section and its sticky-nav
  // link are dropped rather than rendering an empty gallery frame or a dead anchor.
  const hasInUse = product.inUse.length > 0;
  const sections = hasInUse ? SECTIONS : SECTIONS.filter((s) => s.id !== 'in-use');

  const meta = productMeta(product, brand);
  const crumbs = productCrumbs(brand.name, brand.slug, product.name, product.slug);
  /**
   * One prefill for both conversion blocks on this route, generated from the
   * record rather than typed here (`src/lib/prefill.ts`) — a model name written
   * out by hand on 98 pages is 98 chances to drift from `products.ts`. It leads
   * with the part number and ends with `Quantity: ` because model-number queries
   * are trade intent (`_CONVENTIONS.md` §7).
   */
  const prefill = productPrefill(product, brand.name);
  /**
   * Nine of these routes describe a product RANGE, not a purchasable SKU
   * (`src/seo/ranges.ts`). A range has no single model, MPN or offer, so it must
   * never carry `Product` markup — it gets `CollectionPage` instead. The branch
   * is made here, on the registry, rather than guessed from the slug;
   * `buildProduct()` independently refuses a range as a second line of defence.
   */
  const isRange = isRangeProduct(product.brandSlug, product.slug);
  // Only assert an image this site actually hosts (docs/OPEN-QUESTIONS.md #4 —
  // several records still carry remote prototype URLs).
  const hostedHero = product.hero.startsWith('/') ? product.hero : undefined;
  const pageNodeInput = {
    path: meta.path,
    name: meta.title,
    description: meta.description,
    breadcrumbId: breadcrumbNodeId(meta.path),
    primaryImage: hostedHero,
  };

  // Sideways links through the brand's catalog: same category first (the closest
  // real relationship in the data), then the rest of the brand, then the hub.
  const siblings = productsForBrand(brand.slug).filter((p) => p.slug !== product.slug);
  const sameCategory = product.category
    ? siblings.filter((p) => p.category === product.category)
    : [];
  const sameCategorySlugs = new Set(sameCategory.map((p) => p.slug));
  const related = [...sameCategory, ...siblings.filter((p) => !sameCategorySlugs.has(p.slug))];
  const relatedLinks: InternalLink[] = [
    ...related.slice(0, RELATED_PRODUCT_LIMIT).map(
      (p): InternalLink => ({
        to: `/brands/${brand.slug}/${p.slug}`,
        // `<brand> <model>` is the anchor a model-number query matches, and it
        // reads correctly out of context.
        label: `${brand.name} ${p.name}`,
        hint: p.collection,
      }),
    ),
    {
      to: `/brands/${brand.slug}`,
      label: t('internalLinks.allBrandProducts', { brand: brand.name }),
      hint: t('internalLinks.allBrandProductsHint'),
    },
  ];

  return (
    <>
      <Seo
        meta={meta}
        jsonLd={[
          isRange ? buildCollectionPage(pageNodeInput) : buildWebPage(pageNodeInput),
          isRange ? null : buildProduct(product, brand),
          buildBreadcrumbList(crumbs, meta.path),
        ]}
        // `activeFinish` starts as `product.finishes[0]` (the `useState`
        // initialiser above), which is exactly what the prerender and first
        // paint both ship — matches the hero `ResponsiveImage priority` below.
        lcpImage={buildLcpImagePreload(activeFinish.productImage, '(min-width: 1024px) 50vw, 100vw')}
      />

      {/* hero */}
      <section className="relative pt-32 pb-12 container-luxe">
        <Reveal>
          <Breadcrumbs crumbs={crumbs} />
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
                <motion.div
                  key={activeFinish.id}
                  initial={hydrated ? { opacity: 0, scale: 1.04 } : false}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0"
                >
                  {/* This is the page's LCP candidate on all 99 product routes:
                      exactly one fetchpriority="high" image per page. */}
                  <ResponsiveImage
                    src={activeFinish.productImage}
                    alt={altFor(activeFinish.productImage)}
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="h-full w-full object-contain p-10 md:p-16"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </section>

      {/*
       * The page's first conversion block (`_CONVENTIONS.md` §7), directly
       * under the hero rather than inside the hero's text column.
       *
       * That distinction is load-bearing on this template. The hero is a
       * two-column grid that stacks on mobile as [text, product shot], and the
       * product shot is this route's LCP element on all 98 pages — the one
       * image carrying `priority` and the one named in the `<Seo lcpImage>`
       * preload above. A block placed in the text column would sit *between*
       * the copy and that image on every small viewport, pushing the preloaded
       * LCP candidate out of the first screen and re-deciding LCP on a template
       * that was measured to budget in Phase 5. Below the hero it changes
       * nothing above it: the image keeps its position, and on desktop the
       * block is still the first thing after the hero and above the first h2.
       */}
      <section className="container-luxe pb-14">
        <Reveal>
          <EnquiryCta
            title={t('product.ctaQuoteTitle', { name: product.name })}
            prefill={prefill}
            className="max-w-3xl"
            placement="product-detail"
            brand={brand.name}
            product={product.name}
          />
        </Reveal>
      </section>

      {/* sticky section nav */}
      <nav className="sticky top-16 z-30 bg-ink-950/85 backdrop-blur-md border-y border-white/5">
        <div className="container-luxe flex gap-8 overflow-x-auto py-4">
          {sections.map((s) => (
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
                <motion.div
                  key={activeFinish.id}
                  initial={hydrated ? { opacity: 0, scale: 1.04 } : false}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0"
                >
                  {/* Below the fold — never priority; the hero above already
                      claims this page's one fetchpriority="high". */}
                  <ResponsiveImage
                    src={activeFinish.productImage}
                    alt={altFor(activeFinish.productImage)}
                    sizes="(min-width: 768px) 66vw, 100vw"
                    className="h-full w-full object-contain p-10 md:p-16"
                  />
                </motion.div>
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
      {hasInUse && (
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
                    <ResponsiveImage
                      src={src}
                      alt={altFor(src)}
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className={`relative h-full w-full ${isRender ? 'object-contain p-8' : 'object-cover'}`}
                    />
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>
      )}

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
                <ButtonLink to={`${KEYPAD_DESIGNER_PATH}?c=${product.slug}`}>{t('designer.entryCta')}</ButtonLink>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* cross-links into the rest of the brand's catalog */}
      <section className="container-luxe pb-20">
        <Reveal>
          <div className="border-t border-gold/20 pt-10">
            <InternalLinks
              title={t('internalLinks.moreFromBrand', { brand: brand.name })}
              links={relatedLinks}
            />
          </div>
        </Reveal>
      </section>

      {/* Second placement, after the body and the sideways links
          (`_CONVENTIONS.md` §7 — this template renders no FAQ block, so two
          placements, not a padded third). It replaces a single-channel block
          that offered only "Inquire" pointing back at /brands: a dead end that
          gave neither of the two paths every page owes a visitor, and whose
          eyebrow was a hardcoded English literal. */}
      <section className="container-luxe pb-32">
        <Reveal>
          <EnquiryCta
            title={t('product.ctaSpecTitle', { name: product.name })}
            prefill={prefill}
            placement="product-detail"
            brand={brand.name}
            product={product.name}
          />
        </Reveal>
      </section>
    </>
  );
}
