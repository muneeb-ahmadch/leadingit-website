import { useTranslation } from 'react-i18next';
import { SOLUTIONS, SOLUTIONS_INDEX } from '@/data/solutions';
import { Reveal } from '@/components/primitives/Reveal';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { InternalLinks, type InternalLink } from '@/components/InternalLinks';
import { AnswerSections, FaqBlock } from '@/components/AnswerBlocks';
import { EnquiryCta } from '@/components/EnquiryCta';
import { Seo } from '@/seo/Seo';
import { solutionsIndexMeta } from '@/seo/meta';
import { simplePageCrumbs } from '@/seo/breadcrumbs';
import { buildBreadcrumbList } from '@/seo/jsonld/breadcrumbList';
import { buildCollectionPage, buildSolutionsItemList } from '@/seo/jsonld/itemList';
import { buildFaqPage } from '@/seo/jsonld/faqPage';
import { breadcrumbNodeId, pageUrl } from '@/seo/jsonld/ids';

/**
 * `/solutions/` — the category axis's hub.
 *
 * Two jobs (`docs/10-CONTENT-BRIEFS/solutions.md`): win the plural and list
 * phrasings that map badly onto any single service page, and distribute link
 * equity to its children. Structurally it is the `/brands/` index of the other
 * axis, and it is deliberately built the same way — `CollectionPage` +
 * `ItemList` + `BreadcrumbList`, with the copy in a data record rather than in
 * this file.
 *
 * ## Two things about this page that look like omissions and are not
 *
 * 1. **It links five children, not six.** The routing table and the `ItemList`
 *    are both built from the same `SOLUTIONS` array as the visible link list, so
 *    the three can never disagree about what exists. The sixth locked slug
 *    (`docs/05-URL-TAXONOMY.md` §2), `/solutions/industrial-automation/`, has no
 *    page and is not buildable on today's evidence (`docs/OPEN-QUESTIONS.md`
 *    #23), and `_CONVENTIONS.md` §8 forbids linking a route that does not return
 *    200 — a live link to a 404 is worse than no link. `/trade/`,
 *    `/locations/dubai/` and `/journal/` are unlinked for the same reason.
 * 2. **There is no shading entry, anywhere.** `/solutions/shading/` was retired
 *    (`docs/OPEN-QUESTIONS.md` #22) and 301s *to this page*. Being a redirect
 *    target does not entitle this page to shading queries, so there is no tile,
 *    no row, no FAQ and no "motorised blinds" line here — deliberately
 *    (`docs/04` §10.10).
 *
 * No `Service` node: each child carries its own, and duplicating them on the
 * parent creates competing nodes for one offering.
 */
export function SolutionsIndex() {
  const { t } = useTranslation();
  const meta = solutionsIndexMeta();
  const crumbs = simplePageCrumbs(t('nav.solutions'), meta.path);
  // Same `@id` `buildSolutionsItemList()` mints — derived once so
  // `CollectionPage.mainEntity` cannot drift from the node it names.
  const solutionListId = `${pageUrl(meta.path)}#solution-list`;

  // Anchor text is the child page's own h1: descriptive, specific, and it reads
  // correctly out of context, which is what both a crawler and a screen-reader
  // user get (`_CONVENTIONS.md` §8 — never "learn more").
  const solutionLinks: InternalLink[] = SOLUTIONS.map((solution) => ({
    to: `/solutions/${solution.slug}`,
    label: solution.h1,
    hint: solution.serviceType,
  }));

  const crossAxisLinks: InternalLink[] = [
    {
      to: '/brands',
      label: t('internalLinks.browseAllBrands'),
      hint: t('internalLinks.browseAllBrandsHint'),
    },
    { to: '/lit-home', label: t('nav.litHome'), hint: t('litHome.title') },
    { to: '/contact', label: t('nav.contact'), hint: t('contact.title') },
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
            },
            SOLUTIONS.length > 0 ? solutionListId : undefined,
          ),
          buildSolutionsItemList(SOLUTIONS),
          buildBreadcrumbList(crumbs, meta.path),
          buildFaqPage(SOLUTIONS_INDEX.faq, meta.path),
        ]}
      />

      {/* hero — text only, like /brands/: no photograph on this site depicts
          "automation in general", and an unrelated interior would be decoration
          claiming to be evidence. */}
      <section className="relative pt-44 pb-16 container-luxe">
        <Reveal>
          <Breadcrumbs crumbs={crumbs} className="mb-8" />
          <Eyebrow>{t('solutions.indexEyebrow')}</Eyebrow>
          <h1 className="mt-5 font-serif text-display max-w-4xl">{SOLUTIONS_INDEX.h1}</h1>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mt-8 text-lg leading-relaxed text-bone-300 max-w-2xl">
            {SOLUTIONS_INDEX.intro}
          </p>
        </Reveal>
        {/* First-viewport conversion path (`_CONVENTIONS.md` §7). */}
        <Reveal delay={0.25}>
          <EnquiryCta
            title={t('solutions.indexCtaTitle')}
            prefill={SOLUTIONS_INDEX.whatsappPrefill}
            className="mt-14 max-w-3xl"
          />
        </Reveal>
      </section>

      <AnswerSections sections={SOLUTIONS_INDEX.sections} />

      {/* The children that exist, as a list. The routing table above answers
          "which of these is my project"; this answers "what is published", and
          both read the one `SOLUTIONS` array. */}
      <section className="container-luxe py-16">
        <Reveal>
          <div className="border-t border-gold/20 pt-10">
            <InternalLinks title={t('solutions.publishedTitle')} links={solutionLinks} />
          </div>
        </Reveal>
      </section>

      <FaqBlock faq={SOLUTIONS_INDEX.faq} />

      <section className="container-luxe pb-16">
        <Reveal>
          <EnquiryCta
            title={t('solutions.faqCtaTitle')}
            prefill={SOLUTIONS_INDEX.whatsappPrefill}
          />
        </Reveal>
      </section>

      <section className="container-luxe pb-32">
        <Reveal>
          <div className="border-t border-gold/20 pt-10">
            <InternalLinks title={t('solutions.crossAxisTitle')} links={crossAxisLinks} />
          </div>
        </Reveal>
      </section>
    </>
  );
}
