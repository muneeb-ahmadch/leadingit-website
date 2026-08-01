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
 * ## `LocalBusiness` is absent, and that is the point of the page
 *
 * `src/seo/jsonld/localBusiness.ts` exports `NAP_CONFIRMED = false` and
 * `buildLocalBusiness()` returns `null` while it is. **This page does not call
 * it, does not import it, and must not flip it.** `docs/OPEN-QUESTIONS.md` #1
 * (the registered address in trade-licence format) and #8 (opening hours) are
 * both unanswered, so every property the node needs would have to be invented.
 * Two separate failures follow from emitting it half-populated: Google treats a
 * missing `address`/`geo`/`openingHours` as a *warning*, and this project's gate
 * is zero errors **and** zero warnings; and a guessed NAP propagates into
 * third-party citations that then have to be corrected one at a time.
 *
 * **To turn it on when #1 and #8 land** — one line here, after a real `DubaiNap`
 * value exists in the NAP constants file and `NAP_CONFIRMED` has been flipped in
 * `localBusiness.ts`: add `buildLocalBusiness(DUBAI_NAP)` to the `jsonLd` array
 * below. `<Seo>` drops a `null` node silently, so the call is safe to add before
 * the flag moves, and `Organization.location` gains `SHOWROOM_DUBAI_ID` in the
 * same change. Nothing else on this page depends on it.
 *
 * So the emitted graph is `WebPage` + `BreadcrumbList` + `FAQPage` (plus the
 * sitewide `Organization` and `WebSite` that `<Seo>` prepends). No
 * `PostalAddress`, no `GeoCoordinates`, no `openingHoursSpecification`, no
 * `hasMap`, no `priceRange`, no `aggregateRating`, no `review` — none of them
 * has a source, and an absent property is safe where a fabricated one is a
 * liability.
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
          // TODO(OQ #1, OQ #8): buildLocalBusiness(DUBAI_NAP) goes here — see
          // the header. Do not add it before the address and the hours exist.
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
