import { Reveal } from '@/components/primitives/Reveal';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { InternalLinks, type InternalLink } from '@/components/InternalLinks';
import { EnquiryCta } from '@/components/EnquiryCta';
import { href } from '@/seo/paths';
import type { Crumb } from '@/seo/breadcrumbs';

/**
 * `/journal/` — the journal index template. **BUILT AND DELIBERATELY NOT
 * ROUTED**, for a different reason than `ProjectCaseStudy.tsx`.
 *
 * ## Why this one is held
 *
 * `plans/phase-4-page-build.md` asks for "Journal index template + instance",
 * and `docs/05-URL-TAXONOMY.md` §2 lists `/journal/` as Live at launch. But
 * Phase 4 authors **no posts** — the journal clusters (J1–J9 in
 * `docs/04-KEYWORD-MAP.md`) are later content work. An index page listing zero
 * articles is thin content on an indexable URL, and a launch-gate audit would
 * flag it as exactly that.
 *
 * So the template exists and the route does not. This is the orchestrator's
 * judgement call, taken 2026-08-01, **flagged to Muneeb rather than made
 * silently**, and it is consistent with existing policy — `src/seo/routes.ts`'s
 * header already says routes that do not emit HTML are deliberately absent from
 * the manifest and that adding them later is purely additive.
 *
 * **If Muneeb rules that `/journal/` ships empty, this is a wiring job, not a
 * build job** — steps 2–5 below, with `posts: []`. If he rules it waits for
 * posts, this file simply stays here until they exist. Either way nothing is
 * rebuilt.
 *
 * ## Enabling it — same five steps as the case-study template
 *
 * 1. `src/data/journal.ts` with a `JournalPost` record type + array.
 * 2. `journalIndexMeta()` / `articleMeta(post)` in `src/seo/meta.ts`, each
 *    commented with its worst-case character count (title ≤ 60, description
 *    70–155 — `assertManifest()` fails the build otherwise).
 * 3. `/journal` into `STATIC_ROUTES`, plus a `journalRoutes()` async generator
 *    using `await import()` — never a top-level data import in that file.
 * 4. Both patterns into `src/router.tsx`, `getStaticPaths` behind the
 *    `import.meta.env.SSR` ternary.
 * 5. **Then** link it. `_CONVENTIONS.md` §8 puts journal links in the footer and
 *    on relevant brand hubs — and `/brands/<brand>/pakistan/` pages are linked
 *    from journal posts and their parent hub *only*, never global navigation.
 *
 * `Article` JSON-LD belongs on the post template, not here; this page gets
 * `CollectionPage` + `ItemList` + `BreadcrumbList`, like `/brands/` and
 * `/solutions/`. The builder already exists in `src/seo/jsonld/article.ts`.
 *
 * ## What a post must never contain
 *
 * The dealer-wording rule (`_CONVENTIONS.md` §1) applies to journal prose
 * exactly as it does to a brand hub — a post is not a softer surface. No
 * pricing, no unverified counts, no Pakistani city framing, and no
 * near-paraphrase of a manufacturer's own article.
 */

export type JournalPost = {
  readonly slug: string;
  readonly title: string;
  /** One-sentence standing answer — the extractable line for answer engines. */
  readonly summary: string;
  /**
   * Cluster label from `docs/04-KEYWORD-MAP.md` (J1–J9), e.g. "Choosing a system".
   * A grouping label, never a date — `docs/05` §1 bans dates in journal URLs so
   * posts can be refreshed without a redirect, and a visible date undoes that.
   */
  readonly cluster: string;
};

export function JournalIndex({
  posts,
  crumbs,
  intro,
  emptyState,
  relatedLinks,
  relatedLinksTitle,
  enquiryTitle,
  enquiryPrefill,
}: {
  posts: JournalPost[];
  crumbs: Crumb[];
  intro: string;
  /**
   * Shown when there are no posts. Its existence is not permission to ship the
   * route empty — see the header. It exists so that a future filtered view
   * cannot render a bare page with nothing in it.
   */
  emptyState: string;
  relatedLinks: InternalLink[];
  relatedLinksTitle: string;
  enquiryTitle: string;
  enquiryPrefill: string;
}) {
  return (
    <>
      {/*
       * No `<Seo>`: no meta builder and no manifest entry exist for this route
       * yet, and minting a canonical for a URL that emits no HTML would put the
       * head layer, the sitemap and the router into disagreement. Wire it in
       * step 2 above.
       */}
      <section className="relative pt-44 pb-16 container-luxe">
        <Reveal>
          <Breadcrumbs crumbs={crumbs} className="mb-8" />
          <Eyebrow>Journal</Eyebrow>
          <h1 className="mt-5 font-serif text-display max-w-4xl">
            Notes on automation, cinema and control
          </h1>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mt-10 text-lg leading-relaxed text-bone-300 max-w-3xl">{intro}</p>
        </Reveal>
      </section>

      <section className="container-luxe pb-24">
        {posts.length === 0 ? (
          <Reveal>
            <p className="text-bone-500 leading-relaxed max-w-2xl">{emptyState}</p>
          </Reveal>
        ) : (
          <ul className="max-w-4xl">
            {/*
             * `<Reveal>` goes INSIDE the `<li>`, never around it. `<ul>` may
             * only contain `<li>`, `<script>` and `<template>`, and `Reveal`
             * renders a `motion.div` — so wrapping the `<li>` produces
             * `<ul><div><li>`, which is invalid and which some screen readers
             * respond to by dropping the list semantics entirely. (The mirror
             * of the `<dl>` rule on the About page, where `Reveal` IS the one
             * permitted wrapper. The difference is that `<dl>` allows a single
             * `<div>` child and `<ul>` allows none.)
             */}
            {posts.map((post, i) => (
              <li
                key={post.slug}
                className={`pt-8 border-t border-white/5${i === 0 ? '' : ' mt-8'}`}
              >
                <Reveal delay={i * 0.06}>
                  <div className="eyebrow">{post.cluster}</div>
                  <h2 className="mt-3 font-serif text-3xl">
                    <a
                      href={href(`/journal/${post.slug}`)}
                      className="hover:text-gold transition-colors"
                    >
                      {post.title}
                    </a>
                  </h2>
                  <p className="mt-3 text-bone-500 leading-relaxed max-w-2xl">{post.summary}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </section>

      <InternalLinks title={relatedLinksTitle} links={relatedLinks} />

      <EnquiryCta title={enquiryTitle} prefill={enquiryPrefill} />
    </>
  );
}
