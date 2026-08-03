import { Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BRAND_PAKISTAN_BY_SLUG, type BrandPakistanPage } from '@/data/brandPakistan';
import { BRAND_BY_SLUG } from '@/data/brands';
import { Reveal } from '@/components/primitives/Reveal';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { InternalLinks, type InternalLink } from '@/components/InternalLinks';
import { AnswerSections, FaqBlock } from '@/components/AnswerBlocks';
import { EnquiryCta } from '@/components/EnquiryCta';
import { Seo } from '@/seo/Seo';
import { href } from '@/seo/paths';
import { brandPakistanMeta } from '@/seo/meta';
import { brandPakistanCrumbs } from '@/seo/breadcrumbs';
import { buildWebPage } from '@/seo/jsonld/webpage';
import { buildService } from '@/seo/jsonld/service';
import { buildBreadcrumbList } from '@/seo/jsonld/breadcrumbList';
import { buildFaqPage } from '@/seo/jsonld/faqPage';
import { breadcrumbNodeId } from '@/seo/jsonld/ids';

/**
 * `/brands/<brand>/pakistan/` — the non-local Pakistan distribution-coverage
 * template (`docs/05-URL-TAXONOMY.md` §6). Copy lives in
 * `src/data/brandPakistan.ts`; this file renders it and decides nothing about
 * content.
 *
 * ## What this template must never grow
 *
 * `_CONVENTIONS.md` §2 and `docs/05` §5a: **country level only.** No city, no
 * address, no map, no "near you", no opening hours, no second phone number, and
 * no `LocalBusiness`, `Place` or `PostalAddress` node — `NAP_CONFIRMED` is
 * `false` and Dubai is the only physical premises this business has, ever.
 * There is deliberately no data field on `BrandPakistanPage` that a city could
 * be threaded through, and the breadcrumb's last crumb is a fixed country label
 * from `en.json` rather than anything interpolated per page. A page of this type
 * that acquires city-level intent is a doorway page, and the remedy is deletion.
 *
 * ## JSON-LD
 *
 * `WebPage` + `Service` + `BreadcrumbList` + `FAQPage`, plus the sitewide
 * `Organization` and `WebSite` that `<Seo>` prepends. The `Service` node is what
 * carries this page's actual claim in machine-readable form — supply,
 * commissioning and warranty handling, `provider` pointing at the sitewide
 * `Organization` by `@id` — and its `areaServed` is **plain strings, never
 * `Place` nodes**: Pakistan here is a supply relationship, not premises.
 *
 * Absent on purpose, in addition to the place types above: no `offers`, no
 * `priceSpecification`, no `availability`, no `Product` node. Neither page
 * publishes a price, a stock position or a lead time, so nothing may assert one
 * in markup either — that is the same claim with a machine reading it.
 *
 * ## No hero image
 *
 * Text-only, like `/trade/`, `/brands/` and `/locations/dubai/`. No first-party
 * image depicts cross-border supply, and `ResponsiveImage` throws at build time
 * on an asset outside the generated manifest, so there is nothing to reach for
 * — which is the correct outcome. A stock photograph of a warehouse or a city
 * would be a claim about premises rather than decoration.
 */

/**
 * `areaServed` on the `Service` node. **Country level, and this array is the
 * reason to keep it a named constant**: it is the one place a city could be
 * added by accident, so it sits here where a reviewer reads it rather than
 * inline in a builder call. Dubai names the base the service is delivered from;
 * Pakistan names the market it is delivered to. Nothing else may be added.
 */
const SERVICE_AREA_SERVED = ['Pakistan', 'Dubai', 'United Arab Emirates'];

function BrandPakistanTemplate({ page }: { page: BrandPakistanPage }) {
  const { t } = useTranslation();
  const meta = brandPakistanMeta(page);
  const crumbs = brandPakistanCrumbs(page.brandName, page.brandSlug, t('pakistan.crumb'));

  // Split the body so the second CTA lands directly beneath the warranty
  // answer, which is where the reader who came for that question stops
  // (`_CONVENTIONS.md` §7, and both briefs say so explicitly). Found by `id`
  // rather than by index, and a miss throws rather than silently putting every
  // remaining section after the CTA — the same reasoning as `Trade`'s
  // part-number split.
  const splitAt = page.sections.findIndex((section) => section.id === page.warrantySectionId);
  if (splitAt === -1) {
    throw new Error(
      `BrandPakistan: warrantySectionId "${page.warrantySectionId}" matches no section for ` +
        `"${page.brandSlug}" in src/data/brandPakistan.ts — the warranty CTA has nothing to sit ` +
        `under. Fix the id.`,
    );
  }
  const beforeCta = page.sections.slice(0, splitAt + 1);
  const afterCta = page.sections.slice(splitAt + 1);

  // Hub and spoke (`_CONVENTIONS.md` §8): up to the parent hub, sideways to the
  // siblings the record names, and out to `/trade/` and `/contact/`. Every
  // destination emits HTML today. The parent hub is listed once here and once
  // in the breadcrumb, and is excluded from `relatedBrandSlugs` so it cannot
  // appear twice in the same block.
  const parentBrand = BRAND_BY_SLUG[page.brandSlug];
  const siblingLinks: InternalLink[] = page.relatedBrandSlugs.flatMap((slug) => {
    const brand = BRAND_BY_SLUG[slug];
    return brand ? [{ to: `/brands/${brand.slug}`, label: brand.name, hint: brand.tagline }] : [];
  });
  const nextLinks: InternalLink[] = [
    ...(parentBrand
      ? [
          {
            to: `/brands/${parentBrand.slug}`,
            label: t('pakistan.parentHubLink', { brand: parentBrand.name }),
            hint: parentBrand.tagline,
          },
        ]
      : []),
    { to: '/trade', label: t('trade.footerLink'), hint: t('trade.eyebrow') },
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
          }),
          buildService({
            path: meta.path,
            name: t('pakistan.serviceName', { brand: page.brandName }),
            description: meta.description,
            areaServed: SERVICE_AREA_SERVED,
            serviceType: t('pakistan.serviceType'),
          }),
          buildBreadcrumbList(crumbs, meta.path),
          buildFaqPage(page.faq, meta.path),
        ]}
      />

      <section className="relative pt-44 pb-16 container-luxe">
        <Reveal>
          <Breadcrumbs crumbs={crumbs} className="mb-8" />
          <Eyebrow>{t('pakistan.eyebrow')}</Eyebrow>
          <h1 className="mt-5 font-serif text-display max-w-4xl">{page.h1}</h1>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mt-8 text-lg leading-relaxed text-bone-300 max-w-2xl">{page.intro}</p>
        </Reveal>
        {/* First-viewport conversion path (`_CONVENTIONS.md` §7). */}
        <Reveal delay={0.25}>
          <EnquiryCta
            title={t('pakistan.heroCtaTitle', { brand: page.brandName })}
            prefill={page.whatsappPrefill}
            className="mt-14 max-w-3xl"
          />
        </Reveal>
      </section>

      <AnswerSections sections={beforeCta} />

      {/* Second placement, directly beneath the warranty answer. */}
      <section className="container-luxe pb-16">
        <Reveal>
          <EnquiryCta title={t('pakistan.warrantyCtaTitle')} prefill={page.secondaryPrefill} />
        </Reveal>
      </section>

      <AnswerSections sections={afterCta} />

      <section className="container-luxe py-16">
        <Reveal>
          <div className="border-t border-gold/20 pt-10">
            <InternalLinks
              title={t('pakistan.siblingsTitle', { brand: page.brandName })}
              links={siblingLinks}
            />
          </div>
        </Reveal>
      </section>

      <FaqBlock faq={page.faq} />

      {/* Third placement (`_CONVENTIONS.md` §7). */}
      <section className="container-luxe pb-16">
        <Reveal>
          <EnquiryCta title={t('pakistan.faqCtaTitle')} prefill={page.whatsappPrefill} />
        </Reveal>
      </section>

      <section className="container-luxe pb-32">
        <Reveal>
          <div className="border-t border-gold/20 pt-10">
            <InternalLinks title={t('solutions.crossAxisTitle')} links={nextLinks} />
          </div>
        </Reveal>
      </section>
    </>
  );
}

export function BrandPakistan() {
  const { slug = '' } = useParams();
  const page = BRAND_PAKISTAN_BY_SLUG[slug];

  // Same guard as `BrandPage` and `SolutionPage`: a brand with no PK page,
  // reached through client-side navigation, lands on the brands index rather
  // than a blank template. Every prerendered path comes from the manifest, so
  // this never fires at build time.
  if (!page) return <Navigate to={href('/brands')} replace />;

  return <BrandPakistanTemplate page={page} />;
}
