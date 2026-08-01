import { Navigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BRANDS, BRAND_BY_SLUG } from '@/data/brands';
import { SOLUTIONS } from '@/data/solutions';
import { productsForBrand, CATEGORIES_BY_BRAND } from '@/data/products';
import type { Product } from '@/data/products';
import { Reveal } from '@/components/primitives/Reveal';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { ButtonLink } from '@/components/primitives/Button';
import { ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { InternalLinks, type InternalLink } from '@/components/InternalLinks';
import { ResponsiveImage } from '@/components/media/ResponsiveImage';
import { altFor } from '@/components/media/altText';
import { Seo } from '@/seo/Seo';
import { KEYPAD_DESIGNER_PATH, href } from '@/seo/paths';
import { brandMeta } from '@/seo/meta';
import { brandHubCrumbs } from '@/seo/breadcrumbs';
import { buildBrand } from '@/seo/jsonld/brand';
import { buildBreadcrumbList } from '@/seo/jsonld/breadcrumbList';
import { buildBrandProductsItemList, buildCollectionPage } from '@/seo/jsonld/itemList';
import { breadcrumbNodeId, pageUrl } from '@/seo/jsonld/ids';

/**
 * The render illustrating the keypad-designer CTA on the Black Nova hub. It is
 * also one of the ALBA product's gallery images, so its alt is resolved through
 * `altFor()` like every other content image — one file, one description.
 */
const BLACK_NOVA_DESIGNER_IMAGE = '/products/black-nova/alba-design.png';

function ProductCard({ brandSlug, product, delay }: { brandSlug: string; product: Product; delay: number }) {
  const { t } = useTranslation();
  const isRender = product.hero.startsWith('/products/');
  return (
    <Reveal delay={delay}>
      <Link
        to={href(`/brands/${brandSlug}/${product.slug}`)}
        className="group block bg-ink-800/60 border border-white/5 hover:border-gold/30 transition-all duration-700"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-ink-900">
          {isRender && <div className="absolute inset-0 bg-warm-radial opacity-60" />}
          <ResponsiveImage
            src={product.hero}
            alt={altFor(product.hero)}
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className={`relative h-full w-full opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000 ease-out-luxe ${
              isRender ? 'object-contain p-8' : 'object-cover'
            }`}
          />
        </div>
        <div className="p-6">
          <div className="eyebrow">{product.collection}</div>
          <div className="mt-2 font-serif text-2xl group-hover:text-gold transition-colors">{product.name}</div>
          <div className="mt-1 text-bone-500">{product.tagline}</div>
          <div className="mt-5 flex items-center gap-2 text-sm uppercase tracking-luxe text-gold opacity-70 group-hover:opacity-100 transition-opacity">
            <span>{t('brands.explore')}</span>
            <ArrowRight size={14} className="transition-transform duration-500 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180" />
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

export function BrandPage() {
  const { slug = '' } = useParams();
  const { t } = useTranslation();
  const brand = BRAND_BY_SLUG[slug];

  if (!brand) return <Navigate to={href('/brands')} replace />;

  const products = productsForBrand(brand.slug);
  const categories = CATEGORIES_BY_BRAND[brand.slug];
  const heroIsRender = brand.heroImage.startsWith('/products/');

  const meta = brandMeta(brand);
  const crumbs = brandHubCrumbs(brand.name, brand.slug);
  // Same `@id` `buildBrandProductsItemList()` mints, derived once so the
  // `CollectionPage.mainEntity` reference cannot drift from the node it names.
  const productListId = `${pageUrl(meta.path)}#product-list`;

  // Cross-axis, brand → solution (`_CONVENTIONS.md` §8 requires it in both
  // directions; the solution → brand half lives in `SolutionPage.tsx`).
  //
  // **Derived from `SOLUTIONS`, never hand-maintained.** A second brand→solution
  // map would drift the first time a solution's `relatedBrandSlugs` changed, and
  // it would drift silently — the page would simply stop linking, which nothing
  // in the build would notice. Reading the same array the other direction reads
  // makes the two physically incapable of disagreeing, and a solution that has
  // not shipped cannot appear here because it is not in the array.
  const solutionLinks: InternalLink[] = SOLUTIONS.filter((solution) =>
    solution.relatedBrandSlugs.includes(brand.slug),
  ).map((solution) => ({
    to: `/solutions/${solution.slug}`,
    label: solution.name,
    hint: solution.serviceType,
  }));

  // `_CONVENTIONS.md` §8 / `docs/05-URL-TAXONOMY.md` §12: **every** brand hub
  // links `/trade/` with descriptive anchor text. Nine hubs, one target — which
  // is also why `/trade/` is one page rather than three cluster pages. The
  // anchor names the destination and the brand, so it reads correctly out of
  // context for both a crawler and a screen-reader user.
  const tradeLinks: InternalLink[] = [
    {
      to: '/trade',
      label: t('trade.brandHubLink'),
      hint: t('trade.eyebrow'),
    },
  ];

  // Hub-and-spoke: this brand hub links sideways to its siblings and up to the
  // brands index. Anchor text is the brand's own name, which is what a visitor
  // and a crawler both need to predict the destination.
  const siblingBrandLinks: InternalLink[] = [
    ...BRANDS.filter((other) => other.slug !== brand.slug).map(
      (other): InternalLink => ({
        to: `/brands/${other.slug}`,
        label: other.name,
        hint: other.tagline,
      }),
    ),
    {
      to: '/brands',
      label: t('internalLinks.browseAllBrands'),
      hint: t('internalLinks.browseAllBrandsHint'),
    },
  ];

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
              // Only ever claim an image we host. Several brand records still
              // carry remote prototype hero URLs (docs/OPEN-QUESTIONS.md #4) and
              // `primaryImageOfPage` should not point at a third-party CDN.
              primaryImage: heroIsRender ? brand.heroImage : undefined,
            },
            products.length > 0 ? productListId : undefined,
          ),
          buildBrand(brand),
          buildBrandProductsItemList(brand, products),
          buildBreadcrumbList(crumbs, meta.path),
        ]}
      />

      {/* hero — this brand hub's LCP candidate: exactly one fetchpriority="high" per page. */}
      <section className="relative h-[80svh] min-h-[560px] overflow-hidden grain">
        {heroIsRender && <div className="absolute inset-0 bg-warm-radial opacity-80" />}
        <ResponsiveImage
          src={brand.heroImage}
          alt={altFor(brand.heroImage)}
          sizes="100vw"
          className={`absolute inset-0 h-full w-full ${heroIsRender ? 'object-contain p-10 md:p-20 lg:pb-40' : 'object-cover'}`}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-ink-950/30" />
        <div className="relative h-full container-luxe flex flex-col justify-end pb-20">
          <Reveal>
            <Breadcrumbs crumbs={crumbs} className="mb-6" />
            <Eyebrow>{brand.category === 'interfaces' ? 'Architectural Interfaces' : 'Cinema & AV'}</Eyebrow>
          </Reveal>
          <Reveal delay={0.15}>
            <h1 className="mt-6 font-serif text-display tracking-wider2">{brand.wordmark}</h1>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="mt-6 max-w-2xl text-xl text-bone-300">{brand.tagline}</p>
          </Reveal>
        </div>
      </section>

      {/* story */}
      <section className="container-luxe py-28 grid lg:grid-cols-[1fr_2fr] gap-12">
        <Reveal>
          <Eyebrow>The brand</Eyebrow>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="font-serif text-3xl leading-snug max-w-3xl text-bone-100">
            {brand.story}
          </p>
        </Reveal>
      </section>

      {/* product range */}
      {products.length > 0 ? (
        categories ? (
          /* categorised catalog (large ranges, e.g. Crestron) */
          <section className="container-luxe pb-28">
            <Reveal>
              <div className="mb-16 max-w-3xl">
                <Eyebrow>Product range</Eyebrow>
                <h2 className="mt-4 font-serif text-hero">{t('brands.viewProducts')}</h2>
              </div>
            </Reveal>
            <div className="space-y-24">
              {categories.map((cat) => {
                const items = products.filter((p) => p.category === cat.slug);
                if (items.length === 0) return null;
                return (
                  <div key={cat.slug} id={cat.slug} className="scroll-mt-24">
                    <Reveal>
                      <div className="border-t border-gold/20 pt-8 mb-10 grid lg:grid-cols-[1fr_1.4fr] gap-4 lg:gap-12 lg:items-end">
                        <h3 className="font-serif text-hero text-bone-100">{cat.label}</h3>
                        <p className="text-bone-400 leading-relaxed lg:pb-1">{cat.blurb}</p>
                      </div>
                    </Reveal>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {items.map((p, i) => (
                        <ProductCard key={p.slug} brandSlug={brand.slug} product={p} delay={i * 0.06} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          <section className="container-luxe pb-28">
            <Reveal>
              <div className="flex items-end justify-between mb-10">
                <div>
                  <Eyebrow>Product range</Eyebrow>
                  <h2 className="mt-4 font-serif text-hero">{t('brands.viewProducts')}</h2>
                </div>
              </div>
            </Reveal>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((p, i) => (
                <ProductCard key={p.slug} brandSlug={brand.slug} product={p} delay={i * 0.08} />
              ))}
            </div>
          </section>
        )
      ) : (
        <section className="container-luxe pb-28">
          <Reveal>
            <div className="border border-white/5 p-10 bg-ink-900 text-bone-500">
              Product catalog from {brand.name} is being curated. Inquire below to discuss specifications, configurations and lead times.
            </div>
          </Reveal>
        </section>
      )}

      {/* keypad designer (Black Nova only) */}
      {brand.slug === 'black-nova' && (
        <section className="bg-ink-900 py-24 grain">
          <div className="container-luxe">
            <Reveal>
              <div className="relative overflow-hidden border border-gold/20 bg-ink-950/60">
                <div className="absolute inset-0 bg-warm-radial opacity-70" />
                <div className="relative grid lg:grid-cols-[1.3fr_1fr] gap-12 p-10 md:p-16 items-center">
                  <div>
                    <Eyebrow>{t('designer.entryEyebrow')}</Eyebrow>
                    <h2 className="mt-5 font-serif text-hero">{t('designer.entryTitle')}</h2>
                    <p className="mt-6 max-w-xl text-lg leading-relaxed text-bone-300">
                      {t('designer.entryBody')}
                    </p>
                    <div className="mt-9">
                      <ButtonLink to={KEYPAD_DESIGNER_PATH}>{t('designer.entryCta')}</ButtonLink>
                    </div>
                  </div>
                  <div className="relative aspect-square hidden lg:block">
                    <ResponsiveImage
                      src={BLACK_NOVA_DESIGNER_IMAGE}
                      alt={altFor(BLACK_NOVA_DESIGNER_IMAGE)}
                      sizes="50vw"
                      className="absolute inset-0 h-full w-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* cross-axis: the solutions this brand is specified into */}
      {solutionLinks.length > 0 && (
        <section className="container-luxe pb-24">
          <Reveal>
            <div className="border-t border-gold/20 pt-10">
              <InternalLinks
                title={t('internalLinks.solutionsUsingBrand', { brand: brand.name })}
                links={solutionLinks}
              />
            </div>
          </Reveal>
        </section>
      )}

      {/* the trade path — on every hub, never conditional */}
      <section className="container-luxe pb-24">
        <Reveal>
          <div className="border-t border-gold/20 pt-10">
            <InternalLinks
              title={t('trade.brandHubTitle', { brand: brand.name })}
              links={tradeLinks}
            />
          </div>
        </Reveal>
      </section>

      {/* cross-links to the rest of the portfolio */}
      <section className="container-luxe pb-24">
        <Reveal>
          <div className="border-t border-gold/20 pt-10">
            <InternalLinks title={t('internalLinks.otherBrands')} links={siblingBrandLinks} />
          </div>
        </Reveal>
      </section>

      {/* inquire */}
      <section className="container-luxe pb-32 pt-4">
        <Reveal>
          <div className="border-t border-gold/20 pt-10 flex flex-col md:flex-row gap-6 md:items-center justify-between">
            <div>
              <Eyebrow>Begin a project</Eyebrow>
              <h3 className="mt-3 font-serif text-3xl">{t('brands.inquireBrand', { brand: brand.name })}</h3>
            </div>
            <ButtonLink to="/brands">{t('common.inquire')}</ButtonLink>
          </div>
        </Reveal>
      </section>
    </>
  );
}
