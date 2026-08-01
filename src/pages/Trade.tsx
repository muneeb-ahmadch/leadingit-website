import { useTranslation } from 'react-i18next';
import { BRANDS } from '@/data/brands';
import { TRADE } from '@/data/trade';
import { Reveal } from '@/components/primitives/Reveal';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { InternalLinks, type InternalLink } from '@/components/InternalLinks';
import { AnswerSections, FaqBlock } from '@/components/AnswerBlocks';
import { EnquiryCta } from '@/components/EnquiryCta';
import { Seo } from '@/seo/Seo';
import { tradeMeta } from '@/seo/meta';
import { simplePageCrumbs } from '@/seo/breadcrumbs';
import { buildWebPage } from '@/seo/jsonld/webpage';
import { buildService } from '@/seo/jsonld/service';
import { buildBreadcrumbList } from '@/seo/jsonld/breadcrumbList';
import { buildFaqPage } from '@/seo/jsonld/faqPage';
import { breadcrumbNodeId } from '@/seo/jsonld/ids';

/**
 * `/trade/` — the integrator page. Copy lives in `src/data/trade.ts`; this file
 * renders it and decides nothing about content.
 *
 * ## The conversion path leads, and it leads with the part number
 *
 * `_CONVENTIONS.md` §7: consumer pages open with room + city, trade pages open
 * with part number + quantity. So the first-viewport CTA carries the
 * part-number prefill (the one whose trailing colon invites a pasted list), and
 * a second CTA is rendered **immediately after the stock-and-lead-time
 * section** rather than at the foot of the page, because that block is the
 * highest-converting one on the page for T2 intent. The split point is found by
 * the section's `id`, not by an index, so re-ordering the record cannot silently
 * move the CTA to the wrong block.
 *
 * There is deliberately **no part-number search field**. No inventory feed
 * exists behind one, and a search box that returns nothing is worse than a clear
 * instruction — the page says so in as many words.
 *
 * ## JSON-LD
 *
 * `WebPage` + `Service` + `BreadcrumbList` + `FAQPage`. The `Service` node is
 * scoped to exactly what the copy claims — Crestron programming and
 * commissioning support on systems Leading IT supplies — with `provider`
 * pointing at the sitewide `Organization`. `areaServed` is plain strings, never
 * `Place` nodes: Pakistan is a supply relationship, not premises.
 *
 * **No `offers`, no `priceSpecification`, no `availability`, no `InStock`.**
 * Availability is confirmed per enquiry (`docs/OPEN-QUESTIONS.md` #3/T2), and a
 * schema `availability` value is an unmaintainable claim in machine-readable
 * form — exactly the claim the visible copy refuses to make.
 */

/** `areaServed` for the commissioning `Service`. Country/emirate level only. */
const SERVICE_AREA_SERVED = ['Dubai', 'United Arab Emirates', 'Pakistan'];

export function Trade() {
  const { t } = useTranslation();
  const meta = tradeMeta();
  const crumbs = simplePageCrumbs(t('trade.crumb'), meta.path);

  // Split the body so the part-number CTA lands directly beneath its own
  // section. `findIndex` returning -1 would put every section after the CTA, so
  // it fails loudly instead — the same reasoning as `SolutionPage`'s
  // unresolvable-path throw: a silently misplaced conversion block is the defect
  // nothing else in the build would notice.
  const splitAt = TRADE.sections.findIndex(
    (section) => section.id === TRADE.partNumberSectionId,
  );
  if (splitAt === -1) {
    throw new Error(
      `Trade: partNumberSectionId "${TRADE.partNumberSectionId}" matches no section in ` +
        `src/data/trade.ts — the part-number CTA has nothing to sit under. Fix the id.`,
    );
  }
  const beforeCta = TRADE.sections.slice(0, splitAt + 1);
  const afterCta = TRADE.sections.slice(splitAt + 1);

  // All nine hubs, derived from `BRANDS` rather than hand-listed, so a brand
  // added to the catalogue cannot go missing from the trade page and a brand
  // removed cannot leave a dead link behind (`_CONVENTIONS.md` §8).
  const brandLinks: InternalLink[] = BRANDS.map((brand) => ({
    to: `/brands/${brand.slug}`,
    label: brand.name,
    hint: brand.tagline,
  }));

  const nextLinks: InternalLink[] = [
    { to: '/contact', label: t('nav.contact'), hint: t('contact.title') },
    {
      to: '/locations/dubai',
      label: t('locations.footerLink'),
      hint: t('locations.eyebrow'),
    },
    {
      to: '/solutions',
      label: t('solutions.backToIndex'),
      hint: t('solutions.backToIndexHint'),
    },
    // PENDING ROUTE — the brief also links `/brands/crestron/pakistan/`,
    // `/solutions/industrial-automation/` and journal J7 from this page. None of
    // the three emits HTML today, so none is anchored (`_CONVENTIONS.md` §8: a
    // live link to a 404 is worse than no link). They land here when they ship.
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
            name: 'Crestron programming and commissioning support for integrators',
            description:
              'Crestron programming and commissioning support from Leading IT in Dubai, on the ' +
              'systems it supplies, with KNX and DALI commissioning. Scope agreed per project.',
            areaServed: SERVICE_AREA_SERVED,
            serviceType: 'AV and automation programming and commissioning support',
          }),
          buildBreadcrumbList(crumbs, meta.path),
          buildFaqPage(TRADE.faq, meta.path),
        ]}
      />

      {/* Text-only hero, like `/solutions/` and `/brands/`: no photograph on
          this site depicts trade supply, and an unrelated warehouse interior
          would be a claim about premises rather than decoration. */}
      <section className="relative pt-44 pb-16 container-luxe">
        <Reveal>
          <Breadcrumbs crumbs={crumbs} className="mb-8" />
          <Eyebrow>{t('trade.eyebrow')}</Eyebrow>
          <h1 className="mt-5 font-serif text-display max-w-4xl">{TRADE.h1}</h1>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mt-8 text-lg leading-relaxed text-bone-300 max-w-2xl">{TRADE.intro}</p>
        </Reveal>
        {/* First viewport, part-number prefill — the trade path leads. */}
        <Reveal delay={0.25}>
          <EnquiryCta
            title={t('trade.partNumberCtaTitle')}
            prefill={TRADE.whatsappPrefill}
            className="mt-14 max-w-3xl"
          />
        </Reveal>
      </section>

      <AnswerSections sections={beforeCta} />

      {/* The page's conversion engine, directly beneath the part-number block. */}
      <section className="container-luxe pb-16">
        <Reveal>
          <EnquiryCta title={t('trade.sendListCtaTitle')} prefill={TRADE.whatsappPrefill} />
        </Reveal>
      </section>

      <AnswerSections sections={afterCta} />

      <section className="container-luxe py-16">
        <Reveal>
          <div className="border-t border-gold/20 pt-10">
            <InternalLinks title={t('trade.brandsTitle')} links={brandLinks} />
          </div>
        </Reveal>
      </section>

      <FaqBlock faq={TRADE.faq} />

      {/* Third placement, account-opening prefill (`_CONVENTIONS.md` §7). */}
      <section className="container-luxe pb-16">
        <Reveal>
          <EnquiryCta title={t('trade.accountCtaTitle')} prefill={TRADE.accountPrefill} />
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
