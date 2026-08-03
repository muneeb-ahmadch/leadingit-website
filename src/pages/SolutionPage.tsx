import { Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SOLUTION_BY_SLUG, type Solution } from '@/data/solutions';
import { BRAND_BY_SLUG } from '@/data/brands';
import { PRODUCT_BY_SLUG } from '@/data/products';
import { Reveal } from '@/components/primitives/Reveal';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { InternalLinks, type InternalLink } from '@/components/InternalLinks';
import { AnswerSections, FaqBlock } from '@/components/AnswerBlocks';
import { EnquiryCta } from '@/components/EnquiryCta';
import { ResponsiveImage } from '@/components/media/ResponsiveImage';
import { buildLcpImagePreload } from '@/components/media/imageSrcSet';
import { altFor } from '@/components/media/altText';
import { Seo } from '@/seo/Seo';
import { href } from '@/seo/paths';
import { solutionMeta } from '@/seo/meta';
import { solutionCrumbs } from '@/seo/breadcrumbs';
import { buildService } from '@/seo/jsonld/service';
import { buildWebPage } from '@/seo/jsonld/webpage';
import { buildBreadcrumbList } from '@/seo/jsonld/breadcrumbList';
import { buildFaqPage } from '@/seo/jsonld/faqPage';
import { breadcrumbNodeId } from '@/seo/jsonld/ids';

/**
 * `/solutions/<slug>/` — the reusable solution template.
 *
 * One template, six eventual pages, zero page-specific branches: everything that
 * differs lives in the record in `src/data/solutions.ts`. Structurally it is the
 * brand hub of the category axis and follows the same shape on purpose — hero,
 * body, cross-links, conversion — so a visitor and a crawler meet one site
 * rather than two.
 *
 * ## JSON-LD
 *
 * `Service` + `WebPage` + `BreadcrumbList` + `FAQPage`. `Service` is this
 * template's reason to exist as a distinct type: it is one named offering with
 * `provider` pointing at the sitewide `Organization`, which is exactly what a
 * category page is and what a `CollectionPage` is not. `areaServed` is the UAE
 * and Pakistan **as strings, never as `Place` nodes** — Pakistan is a supply
 * relationship and must never be markup implying premises there
 * (`_CONVENTIONS.md` §2, `docs/05` §5). No `offers`, no `priceRange`, no
 * `aggregateRating`, no `review`: none of them has a real source, and the site's
 * rule is that an absent property is safe and a fabricated one is a liability.
 *
 * The visible breadcrumb and `BreadcrumbList` are built from the one `Crumb[]`
 * that `solutionCrumbs()` returns, so they cannot disagree.
 */

/** `areaServed` for every solution. Country/emirate level only — see the header. */
const SERVICE_AREA_SERVED = ['Dubai', 'United Arab Emirates', 'Pakistan'];

/**
 * Resolve a `relatedProductPaths` entry into a real catalogue record.
 *
 * Throws rather than skipping. A typo in a path would otherwise silently drop an
 * internal link — the failure mode that costs nothing at build time and quietly
 * removes a page from the internal link graph. The same reasoning as
 * `ResponsiveImage`'s missing-asset throw: a broken reference is a build error,
 * not a rendering nuance.
 */
function relatedProductLink(path: string): InternalLink {
  const [, , brandSlug, productSlug] = path.split('/');
  const brand = brandSlug ? BRAND_BY_SLUG[brandSlug] : undefined;
  const product = productSlug ? PRODUCT_BY_SLUG[productSlug] : undefined;
  if (!brand || !product || product.brandSlug !== brand.slug) {
    throw new Error(
      `SolutionPage: relatedProductPaths entry "${path}" does not resolve to a product in ` +
        `src/data/products.ts. Fix the path in src/data/solutions.ts — a solution page must not ` +
        `link a route that does not exist.`,
    );
  }
  return {
    to: path,
    // `<brand> <model>` — the anchor a model-number query matches, and it reads
    // correctly out of context.
    label: `${brand.name} ${product.name}`,
    hint: product.collection,
  };
}

function SolutionTemplate({ solution }: { solution: Solution }) {
  const { t } = useTranslation();
  const meta = solutionMeta(solution);
  const crumbs = solutionCrumbs(solution.name, solution.slug);

  // Cross-axis linking (`_CONVENTIONS.md` §8): a solution page links the brand
  // hubs that serve it, a few of the specific products it is built from, and
  // back up to its own index.
  const brandLinks: InternalLink[] = solution.relatedBrandSlugs.flatMap((slug) => {
    const brand = BRAND_BY_SLUG[slug];
    return brand ? [{ to: `/brands/${brand.slug}`, label: brand.name, hint: brand.tagline }] : [];
  });
  const productLinks: InternalLink[] = solution.relatedProductPaths.map(relatedProductLink);
  const upLinks: InternalLink[] = [
    { to: '/solutions', label: t('solutions.backToIndex'), hint: t('solutions.backToIndexHint') },
    {
      to: '/brands',
      label: t('internalLinks.browseAllBrands'),
      hint: t('internalLinks.browseAllBrandsHint'),
    },
    { to: '/contact', label: t('nav.contact'), hint: t('contact.title') },
  ];

  return (
    <>
      <Seo
        meta={meta}
        jsonLd={[
          buildWebPage({
            path: meta.path,
            name: meta.title,
            description: meta.description,
            breadcrumbId: breadcrumbNodeId(meta.path),
            primaryImage: solution.hero,
          }),
          buildService({
            path: meta.path,
            name: `${solution.name} design and installation in Dubai`,
            description: meta.description,
            areaServed: SERVICE_AREA_SERVED,
            serviceType: solution.serviceType,
          }),
          buildBreadcrumbList(crumbs, meta.path),
          buildFaqPage(solution.faq, meta.path),
        ]}
        // Matches the hero `ResponsiveImage priority` below (`src`, `sizes`).
        lcpImage={buildLcpImagePreload(solution.hero, '100vw')}
      />

      {/* hero — this route's LCP candidate: exactly one fetchpriority="high". */}
      <section className="relative h-[70svh] min-h-[520px] overflow-hidden grain">
        <ResponsiveImage
          src={solution.hero}
          alt={altFor(solution.hero)}
          sizes="100vw"
          className="absolute inset-0 h-full w-full object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/70 to-ink-950/40" />
        <div className="relative h-full container-luxe flex flex-col justify-end pb-16">
          <Reveal>
            <Breadcrumbs crumbs={crumbs} className="mb-6" />
            <Eyebrow>{t('solutions.pageEyebrow')}</Eyebrow>
          </Reveal>
          <Reveal delay={0.15}>
            <h1 className="mt-6 font-serif text-display max-w-4xl">{solution.h1}</h1>
          </Reveal>
        </div>
      </section>

      <section className="container-luxe pt-16">
        <Reveal>
          <p className="text-xl leading-relaxed text-bone-300 max-w-3xl">{solution.intro}</p>
        </Reveal>
        {/* First-viewport conversion path (`_CONVENTIONS.md` §7). */}
        <Reveal delay={0.1}>
          <EnquiryCta
            title={t('solutions.pageCtaTitle')}
            prefill={solution.whatsappPrefill}
            className="mt-12 max-w-3xl"
          />
        </Reveal>
      </section>

      <AnswerSections sections={solution.sections} />

      <section className="container-luxe py-16">
        <Reveal>
          <div className="border-t border-gold/20 pt-10">
            <InternalLinks title={t('solutions.relatedBrands')} links={brandLinks} />
          </div>
        </Reveal>
      </section>

      <section className="container-luxe pb-16">
        <Reveal>
          <div className="border-t border-gold/20 pt-10">
            <InternalLinks title={t('solutions.relatedProducts')} links={productLinks} />
          </div>
        </Reveal>
      </section>

      <FaqBlock faq={solution.faq} />

      <section className="container-luxe pb-16">
        <Reveal>
          <EnquiryCta title={t('solutions.faqCtaTitle')} prefill={solution.whatsappPrefill} />
        </Reveal>
      </section>

      <section className="container-luxe pb-32">
        <Reveal>
          <div className="border-t border-gold/20 pt-10">
            <InternalLinks title={t('solutions.crossAxisTitle')} links={upLinks} />
          </div>
        </Reveal>
      </section>
    </>
  );
}

export function SolutionPage() {
  const { slug = '' } = useParams();
  const solution = SOLUTION_BY_SLUG[slug];

  // Same guard as `BrandPage`: an unknown slug reached through client-side
  // navigation lands on the parent index rather than a blank template. Every
  // prerendered path comes from the manifest, so this never fires at build time.
  if (!solution) return <Navigate to={href('/solutions')} replace />;

  return <SolutionTemplate solution={solution} />;
}
