import { useTranslation } from 'react-i18next';
import { DUBAI_LOCATION } from '@/data/locationDubai';
import { Reveal } from '@/components/primitives/Reveal';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { InternalLinks, type InternalLink } from '@/components/InternalLinks';
import { AnswerSections, FaqBlock } from '@/components/AnswerBlocks';
import { EnquiryCta } from '@/components/EnquiryCta';
import { Seo } from '@/seo/Seo';
import { locationDubaiMeta } from '@/seo/meta';
import { simplePageCrumbs } from '@/seo/breadcrumbs';
import { buildWebPage } from '@/seo/jsonld/webpage';
import { buildBreadcrumbList } from '@/seo/jsonld/breadcrumbList';
import { buildFaqPage } from '@/seo/jsonld/faqPage';
import { breadcrumbNodeId } from '@/seo/jsonld/ids';

/**
 * `/locations/dubai/` — the only location page this site will ever carry
 * (`docs/05-URL-TAXONOMY.md` §5). Copy lives in `src/data/locationDubai.ts`;
 * this file renders it and decides nothing about content.
 *
 * ## `LocalBusiness` arrives via `<Seo>`, not from this page
 *
 * The NAP was confirmed 2026-08-05 (OQ #1/#2/#8) and `<Seo>` now prepends
 * `buildLocalBusiness(DUBAI_NAP)` to every page's graph alongside Organization
 * and WebSite — so this page's own `jsonLd` array stays exactly as it was, and
 * adding the node here again would only be deduplicated away. The emitted graph
 * is `WebPage` + `BreadcrumbList` + `FAQPage` + the three sitewide identity
 * nodes. Still absent because still unsourced: `openingHoursSpecification`
 * (appointment-only policy, no honest day/time string), `hasMap`, `priceRange`,
 * `aggregateRating`, `review`.
 *
 * ## Two rendering decisions worth not re-deriving
 *
 * 1. **Text-only hero, like `/solutions/` and `/brands/`.** There is no showroom
 *    photography (`docs/OPEN-QUESTIONS.md` #11) and stock imagery of somebody
 *    else's showroom on a location page is a claim about a room, not decoration.
 *    `ResponsiveImage` would also throw on an asset that is not in
 *    `image-manifest.generated.json`, so there is nothing to reach for anyway.
 * 2. **A two-crumb trail, Home → Dubai.** `/locations/` is not a page — it 301s
 *    here (`docs/05` §2a) — so a middle crumb would put a redirect in both the
 *    visible trail and `BreadcrumbList`, and would point at this very page. Two
 *    crumbs is the honest hierarchy, and `simplePageCrumbs()` is the same helper
 *    `/about/` and `/contact/` use.
 */
export function LocationDubai() {
  const { t } = useTranslation();
  const meta = locationDubaiMeta();
  const crumbs = simplePageCrumbs(t('locations.dubaiCrumb'), meta.path);

  // Every destination here emits HTML today (`_CONVENTIONS.md` §8). The brief
  // also lists `/solutions/home-cinema/` and `/solutions/whole-home-control/`
  // as inbound links from those pages; the index covers the outbound direction.
  const links: InternalLink[] = [
    { to: '/contact', label: t('nav.contact'), hint: t('contact.title') },
    {
      to: '/brands',
      label: t('internalLinks.browseAllBrands'),
      hint: t('internalLinks.browseAllBrandsHint'),
    },
    {
      to: '/solutions',
      label: t('solutions.backToIndex'),
      hint: t('solutions.backToIndexHint'),
    },
    { to: '/lit-home', label: t('nav.litHome'), hint: t('litHome.title') },
    { to: '/trade', label: t('trade.footerLink'), hint: t('trade.eyebrow') },
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
          buildBreadcrumbList(crumbs, meta.path),
          buildFaqPage(DUBAI_LOCATION.faq, meta.path),
        ]}
      />

      <section className="relative pt-44 pb-16 container-luxe">
        <Reveal>
          <Breadcrumbs crumbs={crumbs} className="mb-8" />
          <Eyebrow>{t('locations.eyebrow')}</Eyebrow>
          <h1 className="mt-5 font-serif text-display max-w-4xl">{DUBAI_LOCATION.h1}</h1>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mt-8 text-lg leading-relaxed text-bone-300 max-w-2xl">
            {DUBAI_LOCATION.intro}
          </p>
        </Reveal>
        {/* First-viewport conversion path (`_CONVENTIONS.md` §7). A visit
            enquiry needs a reply rather than a form, so the email address sits
            inside this block as well — `EnquiryCta` renders it. */}
        <Reveal delay={0.25}>
          <EnquiryCta
            title={t('locations.visitCtaTitle')}
            prefill={DUBAI_LOCATION.whatsappPrefill}
            className="mt-14 max-w-3xl"
          />
        </Reveal>
      </section>

      <AnswerSections sections={DUBAI_LOCATION.sections} />

      {/* The second prefill: a project conversation rather than a visit. */}
      <section className="container-luxe pb-16">
        <Reveal>
          <EnquiryCta
            title={t('locations.projectCtaTitle')}
            prefill={DUBAI_LOCATION.projectPrefill}
          />
        </Reveal>
      </section>

      <FaqBlock faq={DUBAI_LOCATION.faq} />

      <section className="container-luxe pb-16">
        <Reveal>
          <EnquiryCta
            title={t('locations.faqCtaTitle')}
            prefill={DUBAI_LOCATION.whatsappPrefill}
          />
        </Reveal>
      </section>

      <section className="container-luxe pb-32">
        <Reveal>
          <div className="border-t border-gold/20 pt-10">
            <InternalLinks title={t('solutions.crossAxisTitle')} links={links} />
          </div>
        </Reveal>
      </section>
    </>
  );
}
