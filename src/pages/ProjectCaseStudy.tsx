import { Reveal } from '@/components/primitives/Reveal';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { InternalLinks, type InternalLink } from '@/components/InternalLinks';
import { AnswerSections } from '@/components/AnswerBlocks';
import { EnquiryCta } from '@/components/EnquiryCta';
import { ResponsiveImage } from '@/components/media/ResponsiveImage';
import { altFor } from '@/components/media/altText';
import type { SolutionSection } from '@/data/solutions';
import type { Crumb } from '@/seo/breadcrumbs';

/**
 * `/projects/<slug>/` — the case-study template. **BUILT AND DELIBERATELY NOT
 * ROUTED.**
 *
 * `plans/phase-4-page-build.md` asks for this template to exist with no
 * instances, and its exit criterion is explicit: the route "is built as a
 * template only and is not linked or reachable from navigation, sitemap, or any
 * other page, until real photography exists". So this file compiles, is
 * type-checked by `npm run lint`, and is reachable from nowhere.
 *
 * ## Why it is not routed
 *
 * `docs/00-CONTEXT.md` §4: **no usable project photography exists.** A
 * case-study page is a photography format — it is the one template whose whole
 * value is showing the room. Shipping it with stock imagery or without images
 * would either fabricate the work or advertise an empty portfolio, and
 * `docs/05-URL-TAXONOMY.md` §2 lists `/projects/` and `/projects/<slug>/` as
 * **Reserved — disabled** for exactly that reason.
 *
 * Being unrouted is not the same as being unfinished. The gap is assets and
 * client consent, not code.
 *
 * ## Enabling it later — five steps, in this order
 *
 * 1. Add a `CaseStudy` record type + array in `src/data/projects.ts`.
 * 2. Add `projectsIndexMeta()` / `projectMeta(project)` to `src/seo/meta.ts`,
 *    each commented with its worst-case character count (title ≤ 60,
 *    description 70–155 — `assertManifest()` fails the build otherwise).
 * 3. Add `/projects` to `STATIC_ROUTES` and a `projectRoutes()` async generator
 *    in `src/seo/routes.ts`. **Use `await import()` for the data module** — the
 *    bundle rule in that file's header is load-bearing.
 * 4. Add both patterns to `src/router.tsx`, with `getStaticPaths` behind the
 *    `import.meta.env.SSR` ternary.
 * 5. **Only then** link it, from `/about/` and the footer. Author the link in
 *    the same change that makes the route return 200 — `_CONVENTIONS.md` §8.
 *
 * ## Claims this template must never carry
 *
 * Client names, project counts, values, testimonials, `aggregateRating`, or a
 * `review` node — all listed in `_CONVENTIONS.md` §4 as claims that do not exist
 * yet. A case study naming a client also needs that client's written consent,
 * which is a separate question from photography. Consent is per-project and is
 * not covered by the About-page consent Muneeb gave on 2026-08-01.
 */

export type CaseStudyImage = {
  /** Site-relative path to a committed derivative. Must exist in the image manifest. */
  readonly src: string;
  /** Optional caption. NEVER an alt string — alt comes from `altFor(src)`. */
  readonly caption?: string;
};

export type CaseStudy = {
  readonly slug: string;
  readonly h1: string;
  /** Building type + emirate. Never a client name without written consent. */
  readonly context: string;
  readonly intro: string;
  /**
   * Question-shaped H2 blocks, same AEO shape as solutions (`_CONVENTIONS.md`
   * §6). Reuses `SolutionSection` rather than declaring a parallel type: the
   * shape is identical, and a second near-identical type is how two templates
   * drift into rendering the same content differently.
   */
  sections: SolutionSection[];
  /** Brand hubs and solution pages this project drew on. */
  relatedLinks: InternalLink[];
  /** Empty until real photography exists — the reason this template is unrouted. */
  readonly images: readonly CaseStudyImage[];
  /** The ask, in this project's own words — heading of the enquiry block. */
  readonly enquiryTitle: string;
  /** One plain-text first-person sentence naming this project. Never hand-encoded. */
  readonly enquiryPrefill: string;
  /** Heading for the related-links nav, which is also its accessible name. */
  readonly relatedLinksTitle: string;
};

export function ProjectCaseStudy({ project, crumbs }: { project: CaseStudy; crumbs: Crumb[] }) {
  return (
    <>
      {/*
       * No `<Seo>` here on purpose. This template has no meta builder and no
       * manifest entry yet, and inventing a canonical for a route that emits no
       * HTML would put a URL into the head layer that the sitemap, the router
       * and the validation harness all disagree about. Wire `<Seo>` in step 2
       * above, alongside the meta builder.
       */}
      <section className="relative pt-44 pb-20 container-luxe">
        <Reveal>
          <Breadcrumbs crumbs={crumbs} className="mb-8" />
          <Eyebrow>{project.context}</Eyebrow>
          <h1 className="mt-5 font-serif text-display max-w-4xl">{project.h1}</h1>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mt-10 text-lg leading-relaxed text-bone-300 max-w-3xl">{project.intro}</p>
        </Reveal>
      </section>

      {project.images.length > 0 && (
        <section className="container-luxe pb-20">
          <div className="grid gap-px bg-white/5 border border-white/5 md:grid-cols-2">
            {project.images.map((image, i) => (
              <Reveal key={image.src} delay={i * 0.06}>
                <figure className="bg-ink-900">
                  <div className="aspect-[4/3] overflow-hidden">
                    {/*
                     * `altFor(src)` takes ONLY the src, deliberately. Do not add a
                     * brand or product parameter: passing them is precisely what
                     * let a caller assert a product into a shared photograph, and
                     * one lifestyle image once shipped five mutually exclusive
                     * series claims because of it.
                     */}
                    <ResponsiveImage
                      src={image.src}
                      alt={altFor(image.src)}
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {image.caption && (
                    <figcaption className="px-7 py-5 text-sm text-bone-500 leading-relaxed">
                      {image.caption}
                    </figcaption>
                  )}
                </figure>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <AnswerSections sections={project.sections} />

      <InternalLinks title={project.relatedLinksTitle} links={project.relatedLinks} />

      <EnquiryCta title={project.enquiryTitle} prefill={project.enquiryPrefill} />
    </>
  );
}
