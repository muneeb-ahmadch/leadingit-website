/**
 * The one head component. Every route renders exactly one `<Seo>`, and `<Seo>`
 * is the only place in the app allowed to write to `<head>`.
 *
 * ## Why this exists at all
 *
 * The head used to be a client-only `useEffect` (`src/lib/useSeo.ts`, deleted
 * with this change) that mutated `document.head` after hydration. Effects do
 * not run during the `vite-react-ssg` prerender, so *none* of the 116 static
 * pages carried a title, description, canonical, Open Graph tag or JSON-LD —
 * the entire SEO surface only existed for clients that execute JavaScript, and
 * AI answer engines largely do not. `<Head>` (vite-react-ssg's re-export of
 * react-helmet-async) is serialised into the prerendered HTML at build time, so
 * everything below is present with JavaScript disabled.
 *
 * ## Rules baked in here, do not relax them
 *
 * - **`meta.title` is emitted verbatim.** The builders in `./meta` already
 *   applied the site-name suffix where one belongs (and deliberately omitted it
 *   where it would overflow the 60-char budget). Appending anything here would
 *   silently break every length assertion in `./routes`.
 * - **Canonicals go through `pageUrl()`**, never `absoluteUrl()` — absolute,
 *   apex (no `www`), `https`, trailing slash (`docs/05-URL-TAXONOMY.md` §1).
 *   That rule is implemented once, in `./jsonld/ids`, and is not restated here.
 * - **Exactly one `<script type="application/ld+json">` per page**, containing
 *   one `@context` and one `@graph` whose nodes cross-reference each other by
 *   `@id`. Callers pass nodes, not a graph — `buildGraph()` is called here so a
 *   page physically cannot emit two script tags.
 * - **No `<meta name="keywords">`.** Dropped deliberately (see `./meta`); it has
 *   no ranking value and publishes the target-query list to competitors.
 */
import { Head } from 'vite-react-ssg';
import { ENABLED_LOCALES, type Locale } from '@/lib/locales';
import { SITE_NAME, absoluteUrl } from '@/lib/site';
import type { LcpImagePreload } from '@/components/media/imageSrcSet';
import { DEFAULT_OG_IMAGE, type PageMeta } from './meta';
import { buildGraph } from './jsonld/graph';
import { buildOrganization } from './jsonld/organization';
import { buildWebSite } from './jsonld/website';
import { buildLocalBusiness } from './jsonld/localBusiness';
// Tiny constant (one address), not a catalog — the manifest-import warning in
// `imagePreloadLink()`'s comment does not apply at this size.
import { DUBAI_NAP } from '@/data/nap';
import { pageUrl } from './jsonld/ids';
import { CRITICAL_FONT_PRELOADS } from './criticalFonts';
import type { JsonLdNode } from './jsonld/types';

/**
 * `<link>` descriptors handed to `<Head>` through its `link` prop rather than as
 * JSX children, for one specific reason: react-helmet-async maps *child* element
 * props through React's camelCase attribute names, so `<link hrefLang="en">`
 * serialises as `hrefLang="en"` in the static HTML. HTML parses that correctly
 * (attribute names are ASCII case-insensitive), but the emitted markup should
 * read `hreflang="en"` — the prop path passes keys through verbatim and does.
 *
 * Consequence to respect: helmet merges children over props per tag type, so a
 * `<link>` element added as a child of `<Head>` below would replace this whole
 * array. **All `<link>` tags for a page belong in `buildLinks()`.**
 *
 * The same verbatim-keys behaviour is why the preload descriptors below
 * (`FontPreloadLink`, `ImagePreloadLink`) also go through this array rather
 * than JSX children: `fetchpriority` is the real HTML attribute name (no
 * internal capital), and a JSX prop would camelCase it (`fetchPriority`) and
 * silently fail to preload anything.
 */
type HeadLink = { rel: 'canonical' | 'alternate'; href: string; hreflang?: string };

type FontPreloadLink = {
  rel: 'preload';
  as: 'font';
  href: string;
  type: 'font/woff2';
  crossorigin: 'anonymous';
};

type ImagePreloadLink = {
  rel: 'preload';
  as: 'image';
  href: string;
  type: 'image/avif';
  fetchpriority: 'high';
};

/** One `<link rel="preload" as="font">` per `CRITICAL_FONT_PRELOADS` entry, every page.
 * Fonts are same-origin, but a `<link as="font">` preload is fetched in CORS mode
 * regardless (the Fetch spec treats fonts as always-CORS) — omitting `crossorigin`
 * makes the browser fetch the font *twice*: once for the preload, uncredentialled,
 * and again for the real `@font-face` load, because the two requests don't share a
 * cache entry without a matching mode. */
function fontPreloadLinks(): FontPreloadLink[] {
  return CRITICAL_FONT_PRELOADS.map((f) => ({
    rel: 'preload',
    as: 'font',
    href: f.href,
    type: f.type,
    crossorigin: 'anonymous',
  }));
}

/**
 * Turns the already-computed `LcpImagePreload` (`src/components/media/
 * imageSrcSet.ts`'s `buildLcpImagePreload()`) into the `<link>` descriptor.
 * The computation itself lives in that module, called by the *page*, not
 * here — `Seo.tsx` renders on every route, including the dozen-plus
 * text-only ones with no `lcpImage` at all, and that module's manifest
 * import is ~260 entries. Computing it here once measured as adding the
 * whole manifest to this file's shared chunk, loaded on every navigation
 * regardless of whether that page even has an `lcpImage`
 * (`docs/12-PROVENANCE/phase5-cwv-fixes.md`, "fix 2").
 */
function imagePreloadLink(preload: LcpImagePreload): ImagePreloadLink {
  return { rel: 'preload', as: 'image', href: preload.href, type: preload.type, fetchpriority: 'high' };
}

/**
 * The locale served at the unprefixed path, and the target of `x-default`.
 * `ENABLED_LOCALES` is EN-only today (`src/lib/locales.ts`).
 */
const DEFAULT_LOCALE: Locale = 'en';

/** Open Graph wants `language_TERRITORY`. Per-locale values arrive with `/ar/` and `/ur/`. */
const OG_LOCALE = 'en_US';

/**
 * Canonical URL for `path` in `locale`. The default locale is served at the
 * bare path; every other locale is a `/{locale}/` path prefix (the locked
 * i18n URL shape — `docs/05-URL-TAXONOMY.md`). Enabling `ar` or `ur` in
 * `ENABLED_LOCALES` is therefore the *only* edit hreflang needs.
 */
function localeUrl(locale: Locale, path: string): string {
  if (locale === DEFAULT_LOCALE) return pageUrl(path);
  return pageUrl(path === '/' ? `/${locale}` : `/${locale}${path}`);
}

/**
 * Self-referencing `hreflang` set: one tag per enabled locale plus `x-default`
 * pointing at the default locale. With one enabled locale that is two tags, both
 * pointing at this page — which is correct and required, not redundant: an
 * `en` + `x-default` pair on a single-language site is what tells Google the set
 * is complete rather than missing.
 */
function alternateLinks(path: string): HeadLink[] {
  const perLocale = ENABLED_LOCALES.map(
    (locale): HeadLink => ({ rel: 'alternate', hreflang: locale, href: localeUrl(locale, path) }),
  );
  return [
    ...perLocale,
    { rel: 'alternate', hreflang: 'x-default', href: localeUrl(DEFAULT_LOCALE, path) },
  ];
}

/**
 * A literal `</script>` inside a JSON string value would end the script element
 * early, so every `<` is replaced with its JSON unicode escape. `<` only ever
 * occurs inside string literals in this payload, so the result is still valid
 * JSON and parses to an identical object — this is the standard defence for
 * inline JSON-LD, not a cosmetic touch.
 */
function serialiseJsonLd(graph: unknown): string {
  return JSON.stringify(graph).replace(/</g, '\\u003c');
}

export type SeoProps = {
  /** The route's `PageMeta`, straight from its builder in `./meta`. */
  meta: PageMeta;
  /**
   * Nodes for this page's single `@graph`. Falsy entries are dropped by
   * `buildGraph()`, so a conditional builder result (`buildBreadcrumbList()`
   * returning `null` on the home page, `buildProduct()` refusing a range) can be
   * passed inline without an `if` at the call site.
   */
  jsonLd?: Array<JsonLdNode | null | undefined | false>;
  /** `/404` only. Emits `noindex,follow` and suppresses the hreflang set. */
  noindex?: boolean;
  /**
   * Set only by the page that renders this route's single `<ResponsiveImage
   * priority>` — i.e. the one with a real above-the-fold hero photograph, not
   * every route (`/trade/`, `/about/`, `/lit-home/` and others are
   * legitimately text-only heroes; `docs/12-PROVENANCE/phase5-cwv-fixes.md`
   * "fix 3" is the audit of which routes that is). Build with
   * `buildLcpImagePreload(src, sizes)` (`@/components/media/imageSrcSet`)
   * called with the copy-identical `src`/`sizes` the page's own
   * `ResponsiveImage priority` call uses — computed at the call site, not in
   * here, so this file never has to import the image manifest (see
   * `imagePreloadLink()` below for why that matters).
   */
  lcpImage?: LcpImagePreload;
};

export function Seo({ meta, jsonLd, noindex = false, lcpImage }: SeoProps) {
  const canonical = pageUrl(meta.path);
  const image = absoluteUrl(meta.ogImage ?? DEFAULT_OG_IMAGE);

  // A noindexed URL keeps its self-referencing canonical (harmless, and it still
  // consolidates any stray inbound link), but advertises no hreflang alternates:
  // an alternate set is a claim about indexable equivalents, and this page is not
  // one.
  const links: Array<HeadLink | FontPreloadLink | ImagePreloadLink> = [
    { rel: 'canonical', href: canonical },
    ...(noindex ? [] : alternateLinks(meta.path)),
    // Preloads first in document order matter less than that they exist ahead
    // of the render-blocking stylesheet finishing — helmet emits `<head>`
    // children in array order, and canonical/hreflang cost nothing to move
    // ahead of. Fonts are sitewide; the image preload is per-page and absent
    // on every text-only hero.
    ...fontPreloadLinks(),
    ...(lcpImage ? [imagePreloadLink(lcpImage)] : []),
  ];

  // Every page's graph opens with the sitewide identity nodes, so each page is
  // self-describing when read in isolation. That is the normal case for us, not
  // an edge case: Google's Rich Results Test evaluates a single page, and AI
  // answer engines — a first-class channel for this project — routinely ingest
  // one URL without ever fetching the home page. Without these, `WebPage
  // .isPartOf` and `WebSite.publisher` on 113 pages pointed at nodes defined
  // nowhere in the document. `buildGraph()` de-duplicates by `@id`, so a page
  // that also builds them explicitly stays correct.
  //
  // A page passing no nodes at all (the 404 template) still emits no script.
  //
  // The Dubai showroom LocalBusiness node joined the sitewide prepend on
  // 2026-08-05, the day the NAP was confirmed (OQ #1/#2/#8): Organization
  // .location references it on every page, so the node must be present on
  // every page — a dangling `@id` reference is malformed. It also makes each
  // page self-describing for local queries, same rationale as the other two.
  const graph =
    jsonLd && jsonLd.length > 0
      ? buildGraph([buildOrganization(), buildWebSite(), buildLocalBusiness(DUBAI_NAP), ...jsonLd])
      : null;

  return (
    <Head link={links}>
      <title>{meta.title}</title>
      {/* The encoding declaration lives here, not in `index.html`. helmet's block
          is spliced in immediately after `<head>`, so a template-level `<meta
          charset>` would sit a couple of kilobytes into the document — outside
          the first 1024 bytes, which is the only window a parser looks in.
          Emitted from here it follows the title, ~100 bytes in. */}
      <meta charSet="UTF-8" />
      <meta name="description" content={meta.description} />
      {noindex && <meta name="robots" content="noindex,follow" />}

      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:type" content={meta.ogType ?? 'website'} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={OG_LOCALE} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={image} />

      {graph && (
        <script type="application/ld+json">{serialiseJsonLd(graph)}</script>
      )}
    </Head>
  );
}
