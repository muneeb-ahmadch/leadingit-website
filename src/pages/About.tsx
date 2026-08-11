import { useTranslation } from 'react-i18next';
import { Reveal } from '@/components/primitives/Reveal';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { EnquiryCta } from '@/components/EnquiryCta';
import { PageHero, PAGE_HERO_SIZES } from '@/components/PageHero';
import { buildLcpImagePreload } from '@/components/media/imageSrcSet';
import { SITE_PREFILLS } from '@/lib/prefill';
import { Seo } from '@/seo/Seo';
import { aboutMeta } from '@/seo/meta';
import { simplePageCrumbs } from '@/seo/breadcrumbs';
import { buildWebPage } from '@/seo/jsonld/webpage';
import { buildBreadcrumbList } from '@/seo/jsonld/breadcrumbList';
import { breadcrumbNodeId } from '@/seo/jsonld/ids';

const TEAM = [
  { name: 'Jonathan', roleKey: 'about.roleManagingDirector' },
  { name: 'Mihajlo', roleKey: 'about.roleDirectorEngineering' },
  { name: 'Liaquat', roleKey: 'about.roleTerritoryDirector' },
];

/**
 * Hero photograph: a black-on-black macro of a U&K Sound in-wall driver — real
 * manufacturer/dealer-sourced photography
 * (`docs/12-PROVENANCE/image-url-map.md`), decorative here (`alt=""`;
 * `altFor()` resolves it to `''` on its own, as an un-viewed single-owner
 * lifestyle frame).
 *
 * Deliberately a component and not a room. **No photograph of Leading IT's
 * premises, showroom, team or completed work exists** (`docs/OPEN-QUESTIONS.md`
 * #11), and an About page is exactly where a stock interior would be read as
 * "this is our office" or "this is our project". A hardware macro claims
 * nothing about us; it is atmosphere, and it is honest atmosphere. Replace it
 * with real first-party photography the day OQ #11 is resolved — that is an
 * upgrade, not a rewrite: swap the constant.
 */
const HERO_IMAGE = '/products/uandksound/e-detail.jpg';

export function About() {
  const { t } = useTranslation();
  const meta = aboutMeta();
  const crumbs = simplePageCrumbs(t('nav.about'), meta.path);

  return (
    <>
      <Seo
        meta={meta}
        jsonLd={[
          buildWebPage({
            path: meta.path,
            name: meta.title,
            type: 'AboutPage',
            description: meta.description,
            breadcrumbId: breadcrumbNodeId(meta.path),
          }),
          buildBreadcrumbList(crumbs, meta.path),
        ]}
        // Matches the `PageHero` band below (`src`, `sizes`) — the only image
        // on this route.
        lcpImage={buildLcpImagePreload(HERO_IMAGE, PAGE_HERO_SIZES)}
      />

      {/* hero */}
      <PageHero image={HERO_IMAGE}>
        <Reveal>
          <Breadcrumbs crumbs={crumbs} className="mb-8" />
          <Eyebrow>{t('about.eyebrow')}</Eyebrow>
          <h1 className="mt-5 font-serif text-display max-w-4xl">{t('about.title')}</h1>
        </Reveal>
      </PageHero>

      {/* Lead and the first-viewport conversion path (`_CONVENTIONS.md` §7),
          on solid ink directly under the band — never over the photograph. */}
      <section className="container-luxe pt-14 pb-24">
        <Reveal>
          <p className="text-lg leading-relaxed text-bone-300 max-w-3xl">
            {t('about.lead')}
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <EnquiryCta
            title={t('about.heroCtaTitle')}
            prefill={SITE_PREFILLS.about}
            className="mt-14 max-w-3xl"
          />
        </Reveal>
      </section>

      {/*
       * stats — THREE-CARD GRID REMOVED 2026-08-01 (Phase 4).
       *
       * This was the genuine three-card cliché on this page, and it is the one
       * `docs/02-DESIGN-SOURCE-OF-TRUTH.md` obliges removing. Three bordered
       * tiles, each a big gold numeral over an uppercase label: "01 Dubai
       * showroom", "09 Premium brands represented", "02 Regions served: Gulf
       * and Pakistan".
       *
       * Two of the three were also weak on their own merits, which is why this
       * is a deletion rather than a re-presentation:
       *   - "02 Regions served: Gulf and Pakistan" is the exact framing QA
       *     flagged in `docs/OPEN-QUESTIONS.md` #13 — a stat block beside the
       *     Dubai showroom is where a reader looks for offices, and we have one
       *     office. Removing it does NOT resolve #13; the footer's bare
       *     "UAE · Pakistan" pair is still live and still Muneeb's call.
       *   - "09 Premium brands represented" hard-codes a count that goes stale
       *     the moment a brand is added or dropped, and it was a literal string,
       *     not derived from `BRANDS.length`.
       *
       * The `about.stat*` keys are gone from `src/locales/en.json` too, and
       * that is load-bearing rather than tidiness: `checkBrandCountMatchesManifest()`
       * in `scripts/validate-seo.mjs` treats a declared brand-count stat as a
       * promise that the page renders it, and asserts — when no stat is declared —
       * that no bare "<number> brands" claim appears here at all. Leaving the
       * keys behind would fail the build; re-adding a hand-typed total later
       * will too, which is the point.
       */}

      {/* team */}
      <section className="bg-ink-900 py-28">
        <div className="container-luxe">
          <Reveal>
            <Eyebrow>{t('about.teamEyebrow')}</Eyebrow>
            <h2 className="mt-4 font-serif text-hero max-w-2xl">{t('about.teamTitle')}</h2>
          </Reveal>

          {/*
           * THREE-CARD GRID REMOVED 2026-08-01 (Phase 4). This was About's
           * second `md:grid-cols-3` card grid; `docs/02-DESIGN-SOURCE-OF-TRUTH.md`
           * says "grids", plural, and this page had exactly two.
           *
           * The names and roles STAY. Muneeb confirmed consent from all three
           * named individuals on 2026-08-01 (`docs/00-CONTEXT.md` §4), which is
           * what closed the Phase 4 exit criterion holding this page back.
           *
           * What went with the grid is the **fake portrait**: an `aspect-[4/5]`
           * tile rendering the person's first initial in 7xl gold under a
           * comment reading "swap for a portrait in build phase". This IS the
           * build phase, no portraits exist, and OQ #11 (showroom photography)
           * is unresolved — so that placeholder would have shipped indefinitely
           * while looking deliberate. A monogram standing in for a photograph of
           * a real, named person is the kind of placeholder CLAUDE.md rule 3
           * exists to keep out of committed code.
           *
           * Reinstate portraits as real images the day a shoot happens: add them
           * through the image pipeline with `ResponsiveImage` + `altFor(src)`,
           * never as a hand-written alt string.
           */}
          {/*
           * `Reveal` renders a `motion.div` and takes `className`, so it IS the
           * single wrapper div here. That matters: HTML allows exactly ONE level
           * of `<div>` between `<dl>` and its `<dt>`/`<dd>` children. Wrapping a
           * `<div>` inside `<Reveal>` would nest them two deep and produce
           * invalid markup — so do not add a wrapper element back in.
           */}
          <dl className="mt-14 max-w-3xl">
            {TEAM.map((m, i) => (
              <Reveal
                key={m.name}
                delay={i * 0.08}
                className={`pt-8 border-t border-white/5${i === 0 ? '' : ' mt-8'}`}
              >
                <dt className="font-serif text-3xl">{m.name}</dt>
                <dd className="mt-2 text-sm uppercase tracking-luxe text-bone-500">
                  {t(m.roleKey)}
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* cta */}
      <section className="container-luxe py-32">
        <Reveal>
          <div className="relative border border-white/5 bg-ink-900 p-12 md:p-20 overflow-hidden">
            <div className="absolute inset-0 bg-warm-radial opacity-50" />
            <div className="relative max-w-2xl">
              <h2 className="font-serif text-hero">{t('about.ctaTitle')}</h2>
              <p className="mt-6 text-lg leading-relaxed text-bone-300">{t('about.ctaBody')}</p>
              {/* Second placement (`_CONVENTIONS.md` §7), inside the panel this
                  page already ends with. It replaces a lone `ButtonLink` to
                  /contact — the form path only — with both paths. The panel's
                  own h2 stays where it is; `EnquiryCta` adds no heading of its
                  own, so the outline is unchanged. */}
              <EnquiryCta
                title={t('about.ctaAsk')}
                prefill={SITE_PREFILLS.about}
                className="mt-10"
              />
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
