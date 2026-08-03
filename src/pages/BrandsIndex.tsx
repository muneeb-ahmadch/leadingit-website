import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BRANDS, type BrandCategory } from '@/data/brands';
import { Reveal } from '@/components/primitives/Reveal';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { EnquiryCta } from '@/components/EnquiryCta';
import { ResponsiveImage } from '@/components/media/ResponsiveImage';
import { buildLcpImagePreload } from '@/components/media/imageSrcSet';
import { SITE_PREFILLS } from '@/lib/prefill';
import { Seo } from '@/seo/Seo';
import { href } from '@/seo/paths';
import { brandsIndexMeta } from '@/seo/meta';
import { simplePageCrumbs } from '@/seo/breadcrumbs';
import { buildBreadcrumbList } from '@/seo/jsonld/breadcrumbList';
import { buildBrandsItemList, buildCollectionPage } from '@/seo/jsonld/itemList';
import { breadcrumbNodeId, pageUrl } from '@/seo/jsonld/ids';

const CATEGORIES: { id: BrandCategory; titleKey: string }[] = [
  { id: 'interfaces', titleKey: 'brands.categoryInterfaces' },
  { id: 'cinema', titleKey: 'brands.categoryCinema' },
];

export function BrandsIndex() {
  const { t } = useTranslation();
  const meta = brandsIndexMeta();
  const crumbs = simplePageCrumbs(t('nav.brands'), meta.path);
  // The `ItemList` `@id` is minted inside `buildBrandsItemList()`; the
  // `CollectionPage` has to point `mainEntity` at the same string, so it is
  // derived once here rather than retyped.
  const brandListId = `${pageUrl(meta.path)}#brand-list`;

  // The first tile of the first non-empty category is this route's LCP
  // candidate (see the comment inside the `CATEGORIES.map()` below, which
  // reads this same derivation) — computed once here so the `<Seo lcpImage>`
  // preload and the tile's own `priority` prop cannot name two different
  // brands.
  const lcpCategoryId = CATEGORIES.find((c) => BRANDS.some((b) => b.category === c.id))?.id;
  const lcpBrand = lcpCategoryId ? BRANDS.find((b) => b.category === lcpCategoryId) : undefined;

  return (
    <>
      <Seo
        meta={meta}
        jsonLd={[
          buildCollectionPage(
            {
              path: meta.path,
              name: meta.title,
              description: meta.description,
              breadcrumbId: breadcrumbNodeId(meta.path),
            },
            brandListId,
          ),
          buildBrandsItemList(BRANDS),
          buildBreadcrumbList(crumbs, meta.path),
        ]}
        lcpImage={
          lcpBrand
            ? buildLcpImagePreload(
                lcpBrand.heroImage,
                '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw',
              )
            : undefined
        }
      />

      {/* hero */}
      <section className="relative pt-44 pb-24 container-luxe">
        <Reveal>
          <Breadcrumbs crumbs={crumbs} className="mb-8" />
          <Eyebrow>{t('brands.indexEyebrow')}</Eyebrow>
          <h1 className="mt-5 font-serif text-display">{t('brands.indexTitle')}</h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-8 text-lg leading-relaxed text-bone-300 max-w-2xl">
            {t('brands.indexSub')}
          </p>
        </Reveal>
        {/* First-viewport conversion path (`_CONVENTIONS.md` §7). */}
        <Reveal delay={0.3}>
          <EnquiryCta
            title={t('brands.indexCtaTitle')}
            prefill={SITE_PREFILLS.brands}
            className="mt-14 max-w-3xl"
          />
        </Reveal>
      </section>

      {/* category groups */}
      {CATEGORIES.map((cat) => {
        const items = BRANDS.filter((b) => b.category === cat.id);
        // The first tile of the first non-empty group is the only image above the
        // fold, so it is this route's LCP candidate — and the only one on the page
        // allowed to be eager + fetchpriority="high". Same derivation the
        // `<Seo lcpImage>` preload above uses (`lcpCategoryId`), so the two can't
        // name different brands.
        const isLcpGroup = lcpCategoryId === cat.id;
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
                    to={href(`/brands/${b.slug}`)}
                    className="group relative block bg-ink-900 aspect-[4/5] overflow-hidden"
                  >
                    {/* Decorative: this sits at 40% opacity behind the tile's own
                        text, inside a link whose visible label is already the
                        brand name — captioning it would only repeat that name to
                        a screen reader. */}
                    <ResponsiveImage
                      src={b.heroImage}
                      alt=""
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="absolute inset-0 h-full w-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-1000 ease-out-luxe"
                      priority={isLcpGroup && i === 0}
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

      {/* Second placement, below both category grids — the two brand walls are
          the body of this page, so this is the "after the main body" position.
          No FAQ block here, so two placements, not a padded third. */}
      <section className="container-luxe pb-32">
        <Reveal>
          <EnquiryCta title={t('brands.indexFootCtaTitle')} prefill={SITE_PREFILLS.brands} />
        </Reveal>
      </section>
    </>
  );
}
