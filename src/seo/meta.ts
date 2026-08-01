/**
 * Pure metadata builders — one per route template.
 *
 * Hard constraints on this file, do not relax them:
 *
 * 1. **No `@/data/*` value imports.** Page components import these builders, so
 *    anything this module pulls in ships to the browser. `Brand` and `Product`
 *    arrive as `import type` (erased at compile time); the *records* are passed
 *    in by whoever already loaded them.
 * 2. **No import from `./routes`.** The dependency runs the other way: the route
 *    manifest calls these builders, never the reverse. (`./paths` is fine — it
 *    is a zero-import string module, deliberately the browser-safe half.)
 * 3. **No `<meta name="keywords">`.** It has had zero ranking value since 2009
 *    and publishes the target-query list to competitors. The keyword map lives
 *    in `docs/04-KEYWORD-MAP.md` and stays there.
 *
 * Copy rules baked into the wording below:
 *
 * - **Dealer claims are gated.** Never "authorized dealer" / "authorised
 *   distributor" for any brand until written per-brand confirmation exists
 *   (`docs/OPEN-QUESTIONS.md` #3). Neutral supply/installation wording only.
 * - **Pakistan is never a place.** It appears as distribution/supply intent
 *   ("for the UAE and Pakistan"), never as an address, a city or a local claim.
 *   Dubai is the only physical location (`docs/05-URL-TAXONOMY.md` §5).
 * - **Brand display names come from `brand.name`.** "Black Nova" is two words;
 *   the uandksound display name is unresolved (`docs/05` §3b), so no variant is
 *   hardcoded here.
 *
 * Length budget: every title is ≤ TITLE_MAX_LENGTH and every description sits
 * inside [DESCRIPTION_MIN_LENGTH, DESCRIPTION_MAX_LENGTH]. The formulas are
 * built so the *worst case over the real catalog* fits — nothing is truncated.
 * `assertManifest()` in `./routes` enforces this across all routes at build
 * time and fails the build loudly if a formula or a data change breaks it.
 */
import type { Brand } from '@/data/brands';
import type { Product } from '@/data/products';
import type { Solution } from '@/data/solutions';
import { SITE_NAME } from '@/lib/site';
import { KEYPAD_DESIGNER_PATH } from './paths';
import { isRangeProduct } from './ranges';

export type PageMeta = {
  /** Full `<title>` text, site-name suffix already applied where one is used. */
  title: string;
  description: string;
  /** Site-relative canonical path, no trailing slash except the root. */
  path: string;
  /** Site-relative or absolute social-share image. */
  ogImage?: string;
  ogType?: 'website' | 'article';
};

/** SERP truncation budget. Titles longer than this get rewritten by Google. */
export const TITLE_MAX_LENGTH = 60;
/** Descriptions above this are cut mid-sentence in the SERP snippet. */
export const DESCRIPTION_MAX_LENGTH = 155;
/** Below this a description is too thin to earn the snippet at all. */
export const DESCRIPTION_MIN_LENGTH = 70;

/** Sitewide fallback share image (created in Phase 2, `plans/phase-2-seo-engine.md`). */
export const DEFAULT_OG_IMAGE = '/og-default.jpg';

/**
 * Only ever advertise an image we host. Several brand records still carry
 * remote prototype hero URLs; an `og:image` on a third-party CDN breaks the
 * share card the moment that host changes, so those fall back to the default
 * until the Phase 3 image pipeline lands real assets.
 */
function ownImage(src: string | undefined): string {
  return src && src.startsWith('/') ? src : DEFAULT_OG_IMAGE;
}

/**
 * The supply sentence used on every product and range page. Neutral wording
 * (OQ #3), Dubai as the only place, Pakistan as supply intent. 70 characters.
 */
const PRODUCT_SUPPLY_SENTENCE = `Supplied and installed by ${SITE_NAME}, Dubai, for the UAE and Pakistan.`;

/**
 * Same claim for a whole range. 76 characters — deliberately close to the
 * product sentence's 70. The earlier 87-char phrasing pushed the longest range
 * description (`black-nova/black-jack`) to 156, one over the cap, and
 * `assertManifest()` broke the build rather than let it truncate in the SERP.
 */
const RANGE_SUPPLY_SENTENCE = `Supplied as a complete range by ${SITE_NAME}, Dubai, for the UAE and Pakistan.`;

/** Same claim for a brand hub. 72 characters. */
const BRAND_SUPPLY_SENTENCE = `Supplied and installed by ${SITE_NAME} in Dubai, for the UAE and Pakistan.`;

export function homeMeta(): PageMeta {
  return {
    // 50 chars. Pairs the generic-sounding brand string with "Automation" and
    // "Dubai" — brand-name defence needs both (docs/04 §8, N1).
    title: `${SITE_NAME} — Premium Automation Distributor, Dubai`,
    // 128 chars.
    description: `${SITE_NAME} is a Dubai-based distributor of premium home, cinema and industrial automation, supplied across the UAE and Pakistan.`,
    path: '/',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
  };
}

export function brandsIndexMeta(): PageMeta {
  return {
    // 53 chars.
    title: `Automation & Cinema Brands We Distribute | ${SITE_NAME}`,
    // 141 chars. Deliberately an open list ("and more") rather than a count or a
    // full enumeration, so adding a brand never makes this sentence false.
    description: `Automation, cinema and AV brands distributed by ${SITE_NAME} in Dubai: Crestron, Basalte, Black Nova, Marantz, Denon, JVC, Polk Audio and more.`,
    path: '/brands',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
  };
}

/**
 * Brand hub. Title formula: `<brand> in Dubai — Supplied & Installed by
 * Leading IT` — 46 chars of fixture plus the brand name; the longest of the
 * nine names is 10 chars ("Black Nova", "Polk Audio"), so the worst case is 56.
 */
export function brandMeta(brand: Brand): PageMeta {
  return {
    title: `${brand.name} in Dubai — Supplied & Installed by ${SITE_NAME}`,
    // `<brand> — <tagline> <supply sentence>`. Every tagline in the catalog is a
    // complete sentence ending in a full stop, so this reads as prose. Worst
    // case is Basalte at 136 chars; shortest is UandKSound at 105.
    description: `${brand.name} — ${brand.tagline} ${BRAND_SUPPLY_SENTENCE}`,
    path: `/brands/${brand.slug}`,
    ogImage: ownImage(brand.heroImage),
    ogType: 'website',
  };
}

/**
 * Product and range pages share one builder — the range variant differs only in
 * the description, which must not read as if a single unit is on sale.
 *
 * Title: `<brand> <model>` plus ` | Leading IT Dubai` (19 chars). The model
 * designation leads, because model-number queries are what this template wins
 * (docs/04 §6, M1). The product's `collection` (its human-readable type) is
 * appended *only* when the whole title still fits the 60-char budget — that is
 * a conditional inclusion, never a truncation, so no title is ever cut
 * mid-word. Longest `<brand> <model>` in the catalog is "Polk Audio Signature
 * Elite ES60" at 31 chars, so the fallback form peaks at 50.
 */
export function productMeta(product: Product, brand: Brand): PageMeta {
  const base = `${brand.name} ${product.name}`;
  const suffix = ` | ${SITE_NAME} Dubai`;
  const withType = `${base} — ${product.collection}`;
  const title =
    withType.length + suffix.length <= TITLE_MAX_LENGTH
      ? `${withType}${suffix}`
      : `${base}${suffix}`;

  const isRange = isRangeProduct(product.brandSlug, product.slug);
  // Worst case over the catalog: 139 chars (product) / 146 chars (range).
  const description = isRange
    ? `${base} — ${product.collection}. ${RANGE_SUPPLY_SENTENCE}`
    : `${base} — ${product.collection}. ${PRODUCT_SUPPLY_SENTENCE}`;

  return {
    title,
    description,
    path: `/brands/${product.brandSlug}/${product.slug}`,
    ogImage: ownImage(product.hero),
    ogType: 'website',
  };
}

/**
 * Solution index. The plural is the whole point of this page: `docs/04` §4 (C1)
 * targets the list phrasings ("home automation companies dubai", "av integration
 * companies dubai") that map badly onto any single service page, so no
 * single-solution head phrasing ("home cinema installation dubai") appears in
 * this title or description — that belongs to `/solutions/home-cinema/`.
 */
export function solutionsIndexMeta(): PageMeta {
  return {
    // 55 chars. Distinct from `brandsIndexMeta()`'s "Automation & Cinema Brands
    // We Distribute" — the two pages carry the two different axes and must not
    // collide on either the title or the description uniqueness assertion.
    title: `Automation, Cinema & AV Solutions in Dubai | ${SITE_NAME}`,
    // 150 chars. Names the five categories that have a page emitting HTML today.
    // It widened from three on 2026-08-01 with `docs/00-CONTEXT.md` §4's Muneeb
    // confirmations (`docs/OPEN-QUESTIONS.md` #25/#26/#27), not on style grounds.
    // Industrial automation is confirmed scope (§1) but has no page and is not
    // buildable on today's evidence (OQ #23), so it is not named in a snippet
    // that would rank for a URL that does not exist.
    description: `${SITE_NAME} designs, supplies and installs home cinema, whole-home control, lighting, multi-room audio and hospitality automation in Dubai and the UAE.`,
    path: '/solutions',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
  };
}

/**
 * Solution page.
 *
 * Title formula: `<name> Installation in Dubai | Leading IT` — 35 chars of
 * fixture plus the solution's display name. The five live routes run from "Home
 * Cinema" (46 chars total) to "Hospitality Automation" (57). **A name over 25
 * chars overflows the 60-char budget**, at which point `assertManifest()` breaks
 * the build rather than let Google rewrite the title — change the formula or the
 * name, never truncate. This is also why the hospitality record is named
 * "Hospitality Automation" and not "Hospitality": the bare noun would title the
 * page "Hospitality Installation in Dubai", which nobody types.
 *
 * Description: the approved solution supply sentence (`_CONVENTIONS.md` §1)
 * followed by one detail sentence from the record. Neutral wording only — no
 * dealer or distributor authorisation phrasing, on any solution page, for any
 * brand (`docs/OPEN-QUESTIONS.md` #3). Worst case over the record set today is
 * 150 chars (`lighting-control` and `whole-home-control`), against a 155 ceiling;
 * the record's `metaDetail` is what a new solution has to keep inside the
 * remaining budget, and each record comments how much that is.
 */
export function solutionMeta(solution: Solution): PageMeta {
  return {
    title: `${solution.name} Installation in Dubai | ${SITE_NAME}`,
    description: `${SITE_NAME} designs, supplies and installs ${solution.supplySubject} in Dubai. ${solution.metaDetail}`,
    path: `/solutions/${solution.slug}`,
    ogImage: ownImage(solution.hero),
    ogType: 'website',
  };
}

export function keypadDesignerMeta(): PageMeta {
  return {
    // 53 chars. "configurator" and "designer" are both in the query set
    // (docs/04 §7, X2); the tool is genuinely free and on-site, so the claim
    // is defensible.
    title: 'Black Nova Keypad Designer — Free Online Configurator',
    // 139 chars. Describes only what the tool actually does today.
    description:
      'Design a Black Nova keypad online — choose the ALBA, ARIA, ANY, AXES or Black Jack collection, layout, finish, engraving and RGB backlight.',
    path: KEYPAD_DESIGNER_PATH,
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
  };
}

export function litHomeMeta(): PageMeta {
  return {
    // 49 chars — no site-name suffix; adding one would overflow and the page is
    // its own branded entity anyway.
    title: 'LIT Home — One Interface for the Entire Residence',
    // 146 chars.
    description: `LIT Home is ${SITE_NAME}’s own control interface: lighting, climate, shading, audio, cinema and security in a single surface. Explore the live demo.`,
    path: '/lit-home',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
  };
}

export function aboutMeta(): PageMeta {
  return {
    // 46 chars.
    title: `About ${SITE_NAME} — Engineers, Not a Sales Team`,
    // 140 chars. The "60+ years of experience" line from the prototype is
    // deliberately dropped — it is unconfirmed (OQ #12) and an unverified claim
    // must not ship in a snippet.
    description: `${SITE_NAME} is a team of automation engineers in Dubai who help clients select, procure and integrate premium control, cinema and AV systems.`,
    path: '/about',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
  };
}

export function contactMeta(): PageMeta {
  return {
    // 52 chars. Names the two conversion channels, which are the point of the
    // page (email + WhatsApp).
    title: `Contact ${SITE_NAME} — WhatsApp or Email Our Engineers`,
    // 146 chars.
    description: `Tell ${SITE_NAME} about the residence, development or installation you have in mind. Our engineers reply personally by email or WhatsApp from Dubai.`,
    path: '/contact',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
  };
}

/**
 * The 404 template. Prerendered and `noindex` — it is excluded from the sitemap
 * by `indexable: false` in the route manifest, but it still needs a real title
 * and description because `/404/` is a crawlable 200.
 */
export function notFoundMeta(): PageMeta {
  return {
    // 27 chars.
    title: `Page Not Found — ${SITE_NAME}`,
    // 114 chars.
    description: `The page you were looking for is not here. Browse the brands ${SITE_NAME} distributes, or contact the team in Dubai.`,
    path: '/404',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
  };
}
