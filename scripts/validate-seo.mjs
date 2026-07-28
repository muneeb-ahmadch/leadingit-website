#!/usr/bin/env node
// The Phase 2 SEO/structured-data gate. Runs against an already-built dist/
// (run "npm run build" first — this script does not build). No new
// dependencies: HTML/JSON-LD parsing is the small regex-based toolkit in
// scripts/lib/, and TypeScript single-sources-of-truth (src/seo/ranges.ts,
// src/seo/jsonld/localBusiness.ts, src/seo/meta.ts, src/seo/routes.ts) are
// loaded live through Vite's SSR module runner (scripts/lib/vite-ssr.mjs) —
// the same trick scripts/gen-sitemap.mjs already uses — so nothing here is a
// second, hand-copied list that can drift from the code it's checking.
//
// What this script proves, and what it doesn't: see docs/11-SEO-VALIDATION.md.
// In short — this is a permanent, CI-enforced local approximation of "Rich
// Results Test + schema.org validator, zero errors, zero warnings". It is not
// those tools; neither has a public API, and the site has no public URL yet.
//
// Exit code: 0 only if there are zero errors AND zero warnings. A handful of
// checks below are reported as a distinct, non-blocking "ACKNOWLEDGED GAPS"
// section instead — see the comment on `gap()` for exactly why, and
// docs/11-SEO-VALIDATION.md for the full reasoning.
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, relative, resolve } from 'node:path';
import {
  decodeEntities,
  extractBreadcrumbNav,
  findElements,
  findVoidTags,
  parseVisibleBreadcrumbs,
  readText,
  textOf,
} from './lib/html.mjs';
import { analyzeGraph, collectPages } from './lib/jsonld-scan.mjs';
import { withViteSsr } from './lib/vite-ssr.mjs';
import { checkGoogleRichResults } from './lib/google-rich-results.mjs';
import { AI_CRAWLERS } from './lib/ai-crawlers.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');
const distDir = resolve(repoRoot, 'dist');
const subsetFile = resolve(here, 'schema-vocab-subset.json');

const errors = [];
const warnings = [];
const gaps = [];

function error(rule, file, message) {
  errors.push({ rule, file, message });
}
/** A warning ALSO fails the build — the phase gate is zero errors AND zero warnings. */
function warn(rule, file, message) {
  warnings.push({ rule, file, message });
}
/**
 * A documented, non-blocking finding: a place where this project's own
 * anti-fabrication rule (CLAUDE.md — never invent a value to satisfy a schema
 * property; an absent property is safe, a fabricated one is a liability)
 * overrides what Google's structured-data guidance would otherwise require or
 * recommend. Printed loudly every run, never silently dropped, never
 * contributing to the exit code. docs/11-SEO-VALIDATION.md is the full
 * accounting of every entry this produces.
 */
function gap(rule, file, message) {
  gaps.push({ rule, file, message });
}

function fail(message) {
  console.error(`validate-seo: ${message}`);
  process.exit(1);
}

if (!existsSync(distDir)) fail('dist/ not found — run "npm run build" first.');
if (!existsSync(subsetFile)) {
  fail(
    'scripts/schema-vocab-subset.json not found — run "npm run gen:schema-vocab" once ' +
      '(needs network) to derive it, then commit the file.',
  );
}
const subset = JSON.parse(readText(subsetFile));

const ref = await withViteSsr(repoRoot, async (load) => {
  const [routesMod, rangesMod, localBusinessMod, metaMod, idsMod, siteMod] = await Promise.all([
    load('/src/seo/routes.ts'),
    load('/src/seo/ranges.ts'),
    load('/src/seo/jsonld/localBusiness.ts'),
    load('/src/seo/meta.ts'),
    load('/src/seo/jsonld/ids.ts'),
    load('/src/lib/site.ts'),
  ]);
  return {
    routes: await routesMod.allRoutes(),
    RANGE_ROUTE_KEYS: rangesMod.RANGE_ROUTE_KEYS,
    NAP_CONFIRMED: localBusinessMod.NAP_CONFIRMED,
    TITLE_MAX_LENGTH: metaMod.TITLE_MAX_LENGTH,
    DESCRIPTION_MIN_LENGTH: metaMod.DESCRIPTION_MIN_LENGTH,
    DESCRIPTION_MAX_LENGTH: metaMod.DESCRIPTION_MAX_LENGTH,
    ORG_ID: idsMod.ORG_ID,
    WEBSITE_ID: idsMod.WEBSITE_ID,
    SITE_URL: siteMod.SITE_URL,
  };
});

const pages = collectPages(distDir);
if (pages.length === 0) fail('dist/ contains no HTML files.');

const manifestByPath = new Map(ref.routes.map((route) => [route.path === '/' ? '/' : `${route.path}/`, route]));
const rangeUrlPaths = new Set(ref.RANGE_ROUTE_KEYS.map((key) => `/brands/${key}/`));

const titleOwners = new Map(); // title text -> file[]
const descriptionOwners = new Map();
const allTypedOccurrences = []; // { type, node, file, urlPath }

function relFileOf(page) {
  return relative(repoRoot, page.file);
}

/**
 * The text a reader (or Google's spam-policy reviewer) actually sees: `<head>`
 * is dropped, `<script>`/`<style>` contents are dropped (a JSON-LD payload or
 * a stylesheet is not "visible copy"), remaining tags are stripped and
 * entities decoded. Shared by every check below that scans for claims in
 * prose rather than in structured data or markup attributes.
 */
function visibleBodyText(html) {
  const bodyMatch = /<body[^>]*>([\s\S]*)<\/body>/i.exec(html);
  const body = bodyMatch ? bodyMatch[1] : html;
  const withoutEmbedded = body
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ');
  return textOf(withoutEmbedded);
}

/** Resolves a site-relative `href` (e.g. `/brands/marantz/`) against `ref.SITE_URL`
 * so it can be compared, byte-for-byte, against a `BreadcrumbList` `item` URL —
 * both of which are absolute. Already-absolute hrefs pass through unchanged. */
function resolveSiteHref(href) {
  if (/^https?:\/\//i.test(href)) return href;
  return `${ref.SITE_URL}${href.startsWith('/') ? href : `/${href}`}`;
}

// ---------------------------------------------------------------- per-page --

function checkTitle(page, relFile) {
  const titles = findElements(page.html, 'title');
  if (titles.length !== 1) {
    error('title-count', relFile, `expected exactly one <title>, found ${titles.length}.`);
  }
  for (const t of titles) {
    const text = textOf(t.inner);
    if (text.length === 0) error('title-empty', relFile, 'title is empty.');
    if (text.length > ref.TITLE_MAX_LENGTH) {
      error('title-length', relFile, `title is ${text.length} chars (max ${ref.TITLE_MAX_LENGTH}): "${text}"`);
    }
    if (!page.isMirror) {
      if (!titleOwners.has(text)) titleOwners.set(text, []);
      titleOwners.get(text).push(relFile);
    }
  }
}

function checkDescription(page, relFile) {
  const metas = findVoidTags(page.html, 'meta').filter((m) => m.attrs.name === 'description');
  if (metas.length !== 1) {
    error('description-count', relFile, `expected exactly one <meta name="description">, found ${metas.length}.`);
  }
  for (const m of metas) {
    const text = decodeEntities(m.attrs.content ?? '');
    if (text.length < ref.DESCRIPTION_MIN_LENGTH || text.length > ref.DESCRIPTION_MAX_LENGTH) {
      error(
        'description-length',
        relFile,
        `description is ${text.length} chars (expected ${ref.DESCRIPTION_MIN_LENGTH}-${ref.DESCRIPTION_MAX_LENGTH}): "${text}"`,
      );
    }
    if (!page.isMirror) {
      if (!descriptionOwners.has(text)) descriptionOwners.set(text, []);
      descriptionOwners.get(text).push(relFile);
    }
  }
}

function checkCanonical(page, relFile) {
  const links = findVoidTags(page.html, 'link').filter((l) => l.attrs.rel === 'canonical');
  if (links.length !== 1) {
    error('canonical-count', relFile, `expected exactly one <link rel="canonical">, found ${links.length}.`);
    return;
  }
  const href = links[0].attrs.href ?? '';
  if (!href.startsWith(`${ref.SITE_URL}/`)) {
    error('canonical-absolute', relFile, `canonical "${href}" is not an absolute apex URL under ${ref.SITE_URL}.`);
    return;
  }
  if (href.includes('://www.')) {
    error('canonical-apex', relFile, `canonical "${href}" uses a www subdomain — apex only.`);
  }
  if (!href.endsWith('/')) {
    error('canonical-trailing-slash', relFile, `canonical "${href}" has no trailing slash.`);
  }
  const hrefPath = href.slice(ref.SITE_URL.length) || '/';
  const expectedPath = page.isMirror ? '/404/' : page.urlPath;
  if (hrefPath !== expectedPath) {
    const mirrorNote = page.isMirror
      ? ' (dist/404.html is an intentional byte-mirror of 404/index.html for Apache\'s ErrorDocument directive — its canonical is expected to equal /404/, not /404.html)'
      : '';
    error(
      'canonical-self-reference',
      relFile,
      `canonical points at "${hrefPath}" but this file's own path is "${expectedPath}"${mirrorNote}.`,
    );
  }
}

function checkHreflang(page, relFile, indexable) {
  const alternates = findVoidTags(page.html, 'link').filter((l) => l.attrs.rel === 'alternate');
  const hreflangs = alternates.map((a) => a.attrs.hreflang).filter(Boolean);
  if (indexable) {
    if (!hreflangs.includes('en')) error('hreflang', relFile, 'indexable page is missing hreflang="en".');
    if (!hreflangs.includes('x-default')) {
      error('hreflang', relFile, 'indexable page is missing hreflang="x-default".');
    }
  } else if (hreflangs.length > 0) {
    error(
      'hreflang',
      relFile,
      `non-indexable page carries hreflang alternates [${hreflangs.join(', ')}] — it should carry none.`,
    );
  }
}

function checkH1(page, relFile) {
  const h1s = findElements(page.html, 'h1');
  if (h1s.length !== 1) {
    error('h1-count', relFile, `expected exactly one <h1>, found ${h1s.length}.`);
    return;
  }
  if (textOf(h1s[0].inner).length === 0) error('h1-empty', relFile, 'h1 is empty.');
}

/**
 * "A logical h2/h3 outline" (a stated Phase 2 exit criterion) expressed as a
 * defensible, mechanical definition — the minimum a real outline requires,
 * checked in actual document order across all six levels:
 *
 *   1. the first heading on the page is the h1 (nothing outranks it);
 *   2. no heading is empty, at any level (an empty h1 is already caught by
 *      `checkH1`; this extends the same rule to h2–h6);
 *   3. no level is skipped going deeper (h2 -> h4 with no h3 between is
 *      invalid; h4 -> h2 -> h3, moving back up then down one level at a
 *      time, is a normal, valid outline and must not be flagged).
 *
 * `checkH1` already asserts exactly one h1 exists at all; this function does
 * not repeat that count check, only the ordering/emptiness/skip rules above.
 */
function checkHeadingOutline(page, relFile) {
  const headings = [];
  for (let level = 1; level <= 6; level += 1) {
    for (const h of findElements(page.html, `h${level}`)) {
      headings.push({ level, text: textOf(h.inner), index: h.index });
    }
  }
  if (headings.length === 0) return; // checkH1 already reports the missing h1.
  headings.sort((a, b) => a.index - b.index);

  if (headings[0].level !== 1) {
    error(
      'heading-outline',
      relFile,
      `the first heading on the page is h${headings[0].level} ("${headings[0].text}"), not h1 — the page must open with its h1.`,
    );
  }

  let previousLevel = null;
  for (const h of headings) {
    if (h.level > 1 && h.text.length === 0) {
      error('heading-outline', relFile, `h${h.level} is empty.`);
    }
    if (previousLevel !== null && h.level > previousLevel + 1) {
      error(
        'heading-outline',
        relFile,
        `heading level jumps from h${previousLevel} to h${h.level} ("${h.text}") with no h${previousLevel + 1} between them — no level may be skipped.`,
      );
    }
    previousLevel = h.level;
  }
}

function checkNoindex(page, relFile, indexable) {
  const robotsMetas = findVoidTags(page.html, 'meta').filter((m) => m.attrs.name === 'robots');
  const hasNoindex = robotsMetas.some((m) => (m.attrs.content ?? '').toLowerCase().includes('noindex'));
  if (!indexable && !hasNoindex) {
    error('noindex', relFile, 'non-indexable page is missing <meta name="robots" content="noindex,...">.');
  }
  if (indexable && hasNoindex) {
    error('noindex', relFile, 'indexable page unexpectedly carries a noindex robots meta tag.');
  }
}

function checkNoKeywords(page, relFile) {
  if (findVoidTags(page.html, 'meta').some((m) => m.attrs.name === 'keywords')) {
    error('no-keywords', relFile, '<meta name="keywords"> was reintroduced — deliberately dropped (src/seo/meta.ts).');
  }
}

function checkJsonLdShape(page, relFile, indexable) {
  const blocks = page.blocks;
  if (indexable && blocks.length !== 1) {
    error(
      'jsonld-count',
      relFile,
      `expected exactly one <script type="application/ld+json"> on this indexable page, found ${blocks.length}.`,
    );
  }
  if (!indexable && blocks.length !== 0) {
    error(
      'jsonld-count',
      relFile,
      `expected zero <script type="application/ld+json"> blocks on this non-indexable page, found ${blocks.length}.`,
    );
  }

  for (const block of blocks) {
    if (block.parseError) {
      error('jsonld-parse', relFile, `JSON.parse failed: ${block.parseError}`);
      continue;
    }
    const parsed = block.parsed;
    const keys = Object.keys(parsed);
    if (!(keys.length === 2 && keys.includes('@context') && keys.includes('@graph'))) {
      error(
        'jsonld-shape',
        relFile,
        `expected exactly the two top-level keys "@context" and "@graph", found [${keys.join(', ')}].`,
      );
    }
    if (parsed['@context'] !== 'https://schema.org') {
      error('jsonld-context', relFile, `@context is "${parsed['@context']}", expected "https://schema.org".`);
    }
    if (!Array.isArray(parsed['@graph'])) {
      error('jsonld-graph', relFile, '@graph is not an array.');
      continue;
    }

    const { definedIds, bareReferences, typedNodes, topLevelIdCounts } = analyzeGraph(parsed['@graph']);

    for (const [id, count] of topLevelIdCounts) {
      if (count > 1) {
        error(
          'jsonld-duplicate-id',
          relFile,
          `@id "${id}" is used by ${count} top-level @graph nodes — two contradictory definitions of one entity.`,
        );
      }
    }
    for (const bareRef of bareReferences) {
      if (!definedIds.has(bareRef.id)) {
        error(
          'jsonld-dangling-id',
          relFile,
          `"${bareRef.id}" is referenced as a bare { "@id": ... } but no node in this page's own @graph defines it.`,
        );
      }
    }
    for (const t of typedNodes) {
      allTypedOccurrences.push({ type: t.type, node: t.node, file: relFile, urlPath: page.urlPath });
    }
  }
}

function checkBreadcrumbParity(page, relFile) {
  const navInner = extractBreadcrumbNav(page.html);
  let bcNode = null;
  for (const block of page.blocks) {
    if (!block.parsed || !Array.isArray(block.parsed['@graph'])) continue;
    const found = block.parsed['@graph'].find((n) => n && n['@type'] === 'BreadcrumbList');
    if (found) bcNode = found;
  }

  if (!navInner && !bcNode) return; // neither present — fine (home page, etc.)
  if (navInner && !bcNode) {
    error('breadcrumb-parity', relFile, 'a visible breadcrumb nav is rendered, but no BreadcrumbList JSON-LD node was found.');
    return;
  }
  if (!navInner && bcNode) {
    error(
      'breadcrumb-parity',
      relFile,
      'a BreadcrumbList JSON-LD node exists, but no visible <nav aria-label="Breadcrumb"> was found in the rendered HTML.',
    );
    return;
  }

  const visible = parseVisibleBreadcrumbs(navInner);
  const items = [...(bcNode.itemListElement ?? [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const jsonNames = items.map((item) => item.name);
  const visibleNames = visible.map((v) => v.name);

  const matches = visibleNames.length === jsonNames.length && visibleNames.every((n, i) => n === jsonNames[i]);
  if (!matches) {
    error(
      'breadcrumb-parity',
      relFile,
      `visible breadcrumb [${visibleNames.join(' > ')}] does not match BreadcrumbList [${jsonNames.join(' > ')}].`,
    );
  }

  // Name parity alone does not satisfy the exit criterion ("match exactly") —
  // it previously let every crumb link to the wrong (non-canonical) URL while
  // its name matched perfectly. Compare each linked crumb's resolved href
  // against its BreadcrumbList `item` URL, one-for-one by position. Only
  // meaningful when the two arrays are the same length; a length mismatch is
  // already reported above and would misalign the indices here.
  if (visible.length === items.length) {
    visible.forEach((crumb, i) => {
      if (!crumb.isLink) return; // the current-page crumb carries no href to compare.
      const resolvedHref = resolveSiteHref(decodeEntities(crumb.href ?? ''));
      const jsonUrl = items[i].item;
      if (resolvedHref !== jsonUrl) {
        error(
          'breadcrumb-parity',
          relFile,
          `breadcrumb #${i + 1} ("${crumb.name}") links to "${resolvedHref}" but its BreadcrumbList item URL is "${jsonUrl}" — the visible breadcrumb and the JSON-LD must match exactly, not just by name.`,
        );
      }
    });
  }

  const last = visible[visible.length - 1];
  if (last?.isLink) {
    error('breadcrumb-parity', relFile, `the last breadcrumb ("${last.name}") is rendered as a link — the current page must not link to itself.`);
  }
}

// -------------------------------------------------------------- site-wide --

function checkTitleUniqueness() {
  for (const [text, files] of titleOwners) {
    if (files.length > 1) {
      error('title-unique', files.join(', '), `title "${text}" is shared by ${files.length} pages.`);
    }
  }
}

function checkDescriptionUniqueness() {
  for (const [text, files] of descriptionOwners) {
    if (files.length > 1) {
      error('description-unique', files.join(', '), `description "${text}" is shared by ${files.length} pages.`);
    }
  }
}

function forbiddenKeyValueScan(value, cb) {
  if (Array.isArray(value)) {
    value.forEach((v) => forbiddenKeyValueScan(v, cb));
    return;
  }
  if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      cb(k, v);
      forbiddenKeyValueScan(v, cb);
    }
  }
}

function checkNoPricing() {
  const FORBIDDEN_KEYS = ['offers', 'price', 'pricecurrency', 'availability'];
  for (const page of pages) {
    const relFile = relFileOf(page);
    for (const block of page.blocks) {
      if (!block.parsed) continue;
      forbiddenKeyValueScan(block.parsed, (k, v) => {
        if (FORBIDDEN_KEYS.includes(k.toLowerCase())) {
          error(
            'no-pricing',
            relFile,
            `forbidden JSON-LD property "${k}" found — offers/price/priceCurrency/availability stay out until a pricing stance is user-approved.`,
          );
        }
        if (typeof v === 'string' && /instock/i.test(v)) {
          error('no-pricing', relFile, `forbidden value containing "InStock" found: "${v}".`);
        }
      });
    }
  }
}

/**
 * Only ever assert a first-party image in JSON-LD, sitewide, regardless of
 * which builder emitted it. `src/seo/jsonld/itemList.ts`'s `firstPartyImage()`
 * fixed the one live defect an audit found (Unsplash stock photos asserted,
 * machine-readably, as the Crestron/Blustream/Basalte/JVC `Brand` entity's own
 * photograph) — but that was a per-builder fix. `src/seo/jsonld/product.ts`,
 * for one, builds `Product.image` straight through `absoluteUrl()` with no
 * such guard at all; it is first-party today only because every current
 * catalog record happens to use a first-party `hero`/`finishes[].productImage`
 * (docs/OPEN-QUESTIONS.md #4 tracks the ones that are still Unsplash — those
 * are used for `inUse` galleries only, never `hero`/`finishes`, today). That
 * is a fact about the current data, not a guarantee the code enforces. This
 * check is the sitewide regression gate that guarantee is missing: it inspects
 * every typed JSON-LD node this site emits, not just the ones a specific
 * builder happens to gate.
 *
 * `ImageObject.url`/`.contentUrl` is scoped to `@type: 'ImageObject'` only
 * (the shape `webpage.ts`'s `primaryImageOfPage` emits) — `url` is far too
 * common a property name on unrelated types (`WebPage.url`, `Organization.url`,
 * `Product.url`, …) to treat generically as an image assertion.
 */
const IMAGE_BEARING_PROPS = ['image', 'logo', 'thumbnailUrl', 'screenshot'];

function checkOnlyFirstPartyImages() {
  for (const o of allTypedOccurrences) {
    const props = o.type === 'ImageObject' ? ['url', 'contentUrl'] : IMAGE_BEARING_PROPS;
    for (const prop of props) {
      const raw = o.node[prop];
      if (raw === undefined) continue;
      const values = Array.isArray(raw) ? raw : [raw];
      for (const value of values) {
        if (typeof value !== 'string') continue;
        if (!value.startsWith(`${ref.SITE_URL}/`)) {
          error(
            'non-first-party-image',
            o.file,
            `${o.type}.${prop} is "${value}" — not a first-party URL under ${ref.SITE_URL}. JSON-LD may never ` +
              'assert a non-first-party photograph as depicting an entity; omit the property instead of pointing ' +
              'it at a stock/hotlinked image.',
          );
        }
      }
    }
  }
}

function checkNoRangeProduct() {
  for (const o of allTypedOccurrences) {
    if (o.type === 'Product' && rangeUrlPaths.has(o.urlPath)) {
      error(
        'range-no-product',
        o.file,
        `range page "${o.urlPath}" (declared in src/seo/ranges.ts) carries a Product JSON-LD node — ranges must use CollectionPage/ItemList only, never Product.`,
      );
    }
  }
}

function checkNoPakistanPlace() {
  const PLACE_TYPES = ['PostalAddress', 'GeoCoordinates', 'Place', 'LocalBusiness'];
  for (const o of allTypedOccurrences) {
    if (!PLACE_TYPES.includes(o.type)) continue;
    if (o.type === 'PostalAddress' && !ref.NAP_CONFIRMED) {
      error(
        'no-pakistan-place',
        o.file,
        'a PostalAddress node exists in JSON-LD, but NAP_CONFIRMED is still false in src/seo/jsonld/localBusiness.ts — no PostalAddress may be emitted until the NAP is confirmed.',
      );
      continue;
    }
    const json = JSON.stringify(o.node);
    if (/pakistan|karachi|lahore|islamabad/i.test(json)) {
      error(
        'no-pakistan-place',
        o.file,
        `a ${o.type} node references Pakistan or a Pakistani city — LocalBusiness/address/geo must be Dubai-only, ever.`,
      );
    }
  }
}

/**
 * `checkNoPakistanPlace()` above only inspects typed JSON-LD nodes — it has
 * zero coverage of visible body copy, even though the site's loudest
 * prohibition (CLAUDE.md: "No Karachi GBP/address/location page ever") is
 * about exactly that surface. A bare mention of "Pakistan" is legitimate
 * supply/distribution-intent copy used throughout this site's real,
 * user-approved wording ("for the UAE and Pakistan") — it is never flagged
 * here. Naming an actual Pakistani *city*, or linking to a location-shaped
 * path for one, has no legitimate use on this site at all, ever, so any
 * occurrence is an error with no allow-list.
 */
const PAKISTAN_CITY_PATTERN = /\b(karachi|lahore|islamabad|rawalpindi|faisalabad|peshawar|multan|quetta)\b/gi;
const PAKISTAN_CITY_TEST = /\b(karachi|lahore|islamabad|rawalpindi|faisalabad|peshawar|multan|quetta)\b/i;
const PAKISTAN_LOCATION_PATH = /\/locations?\/(karachi|lahore|islamabad|rawalpindi|faisalabad|peshawar|multan|quetta)\b/i;

function checkNoPakistanPlaceInBodyCopy() {
  for (const page of pages) {
    const relFile = relFileOf(page);
    const text = visibleBodyText(page.html);
    const found = new Set([...text.matchAll(PAKISTAN_CITY_PATTERN)].map((m) => m[0].toLowerCase()));
    for (const city of found) {
      error(
        'no-pakistan-place-body',
        relFile,
        `visible body copy names the Pakistani city "${city}" — Dubai is this site's only physical location, ever (CLAUDE.md); Pakistan may appear only as country-level supply/distribution intent, never a named city, address or premises.`,
      );
    }

    for (const a of findVoidTags(page.html, 'a')) {
      const href = a.attrs.href ?? '';
      if (PAKISTAN_CITY_TEST.test(href) || PAKISTAN_LOCATION_PATH.test(href)) {
        error(
          'no-pakistan-place-body',
          relFile,
          `an <a href="${href}"> references a Pakistani city/location path — no such page exists in src/seo/routes.ts and none may ever be linked.`,
        );
      }
    }
  }
}

/** A PK-country-code telephone is a legal JSON-LD value (`ContactPoint.telephone`,
 * `LocalBusiness.telephone`, etc.) — nothing about its shape is wrong, so no
 * generic check anywhere else catches it. Dubai-only means every telephone
 * this site ever emits must be the UAE (+971) number.
 */
function checkNoPakistanPhone() {
  for (const o of allTypedOccurrences) {
    const tel = o.node.telephone;
    if (typeof tel !== 'string') continue;
    const digits = tel.replace(/[^\d+]/g, '');
    if (!digits.startsWith('+971')) {
      error(
        'no-pakistan-phone',
        o.file,
        `"${o.type}.telephone" is "${tel}" — every telephone number this site emits in JSON-LD must be a +971 (UAE, Dubai-only) number; CLAUDE.md forbids a Pakistan contact point, ever.`,
      );
    }
  }
}

/**
 * Dealer/distributor-authorisation wording is gated behind written, per-brand
 * confirmation (docs/OPEN-QUESTIONS.md #3) — expressed as a qualifier+role
 * pattern rather than a hand-typed literal list, so "official dealer",
 * "authorised reseller", "exclusive distributor", "sole distributor",
 * "certified partner" and "official partner" are all caught by the same rule
 * that catches "authorized dealer", not four more entries someone has to
 * remember to add.
 */
const DEALER_CLAIM_PATTERN = /\b(authorized|authorised|official|exclusive|sole|certified|appointed|approved)\s+(dealer|distributor|reseller|partner)s?\b/gi;

function checkNoDealerClaims() {
  for (const page of pages) {
    const found = new Set([...page.html.matchAll(DEALER_CLAIM_PATTERN)].map((m) => m[0].toLowerCase()));
    for (const phrase of found) {
      error(
        'dealer-claim',
        relFileOf(page),
        `found the gated phrase "${phrase}" in emitted HTML — dealer authorisation wording is gated on docs/OPEN-QUESTIONS.md #3 until written per-brand confirmation exists.`,
      );
    }
  }
}

/**
 * The shape of an unverifiable superlative claim — not its truth (unscriptable),
 * but the pattern CLAUDE.md's "every on-site claim must be defensible" rule is
 * actually about: a specific year/experience count, an installation/project/
 * client count, or any award claim. docs/OPEN-QUESTIONS.md #12 is the real,
 * tracked example (the prototype's "60+ years of combined experience" line
 * that must not ship without confirmation). A hit here is not proof a claim is
 * false — it is proof it is *unsourced in this codebase*; fix it by sourcing
 * the claim and adding an exact-text entry to `CLAIM_ALLOWLIST` below, citing
 * where it was confirmed. Never by loosening a pattern.
 */
const EXPERIENCE_CLAIM_PATTERN = /\b[\d,]+\+?\s*years?\s+(of\s+)?experience\b/gi;
const COUNT_CLAIM_PATTERN =
  /\b[\d,]+\+?\s*(installations?|projects?|systems?|clients?|homes?|customers?)\b\s+(completed|delivered|installed|served|finished|executed|and counting|to date|worldwide)\b/gi;
const AWARD_CLAIM_PATTERN = /\b(award-winning|awards?|winner of|awarded)\b/gi;
const CLAIM_PATTERNS = [EXPERIENCE_CLAIM_PATTERN, COUNT_CLAIM_PATTERN, AWARD_CLAIM_PATTERN];

/**
 * Claims that ARE sourced and confirmed — empty today, since none is.
 * `{ phrase, ref }`: `phrase` must equal the exact matched claim text
 * (case-sensitive, as it appears on the page) and `ref` must cite a
 * `docs/OPEN-QUESTIONS.md #<n>` entry or `CLAUDE.md`. An entry that doesn't
 * exactly match what is actually on the page does not suppress anything —
 * a rewritten claim must be re-confirmed, not grandfathered in by a stale
 * allow-list line.
 */
const CLAIM_ALLOWLIST = [];

function checkNoUnverifiableClaims() {
  for (const page of pages) {
    const relFile = relFileOf(page);
    const text = visibleBodyText(page.html);
    for (const pattern of CLAIM_PATTERNS) {
      for (const m of text.matchAll(pattern)) {
        const claim = m[0];
        const allowed = CLAIM_ALLOWLIST.some((entry) => entry.phrase === claim);
        if (!allowed) {
          error(
            'unverifiable-claim',
            relFile,
            `found an unsourced award/experience/count claim "${claim}" in visible copy — CLAUDE.md requires every ` +
              'on-site claim to be defensible before it ships. Remove it, or (once a real source exists) add an ' +
              'exact-text entry citing docs/OPEN-QUESTIONS.md/CLAUDE.md to CLAIM_ALLOWLIST in scripts/validate-seo.mjs.',
          );
        }
      }
    }
  }
}

function checkVocabulary() {
  for (const o of allTypedOccurrences) {
    const typeEntry = subset.types[o.type];
    if (!typeEntry) {
      error(
        'vocab-type',
        o.file,
        `@type "${o.type}" is not in the committed schema.org vocab subset (scripts/schema-vocab-subset.json). ` +
          'If this is a genuinely new type, run "npm run gen:schema-vocab" (needs network) and commit the ' +
          'result; otherwise this looks like a typo.',
      );
      continue;
    }
    for (const key of Object.keys(o.node)) {
      if (key === '@type' || key === '@id') continue;
      if (!typeEntry.properties.includes(key)) {
        error(
          'vocab-property',
          o.file,
          `property "${key}" on @type "${o.type}" is not in the committed schema.org vocab subset for that ` +
            'type. Regenerate via "npm run gen:schema-vocab" if intentional, else check for a typo.',
        );
      }
    }
  }
}

/**
 * The block of directives following a `User-agent: <agent>` line, up to the
 * next blank line or end of file — the standard robots.txt grouping this
 * generator (`scripts/gen-sitemap.mjs`) always produces. Returns `null` if no
 * group for `agent` exists at all.
 */
function robotsGroupFor(text, agent) {
  const escaped = agent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`User-agent:\\s*${escaped}\\s*\\n([\\s\\S]*?)(?:\\n\\s*\\n|$)`, 'i');
  const m = re.exec(text);
  return m ? m[1] : null;
}

/**
 * Neither exit criterion 3 ("robots.txt allows AI crawlers") nor 4 (sitemap
 * correctness) had any regression gate at all before this — a `dist/`
 * replaced wholesale with `Disallow: /` passed a green build. `AI_CRAWLERS` is
 * imported from `scripts/lib/ai-crawlers.mjs`, the same list
 * `scripts/gen-sitemap.mjs` writes from, so this can never drift into a
 * second, hand-typed copy of the crawler list.
 */
function checkRobotsTxt() {
  const path = resolve(distDir, 'robots.txt');
  if (!existsSync(path)) {
    error('robots-txt', 'dist/robots.txt', 'file not found in dist/ — every build must ship a robots.txt.');
    return;
  }
  const text = readText(path);

  for (const agent of [...AI_CRAWLERS, '*']) {
    const group = robotsGroupFor(text, agent);
    if (group === null) {
      error(
        'robots-txt',
        'dist/robots.txt',
        `no "User-agent: ${agent}" group found — every crawler in scripts/lib/ai-crawlers.mjs, plus the wildcard "*", must have its own group.`,
      );
      continue;
    }
    if (!/^Allow:\s*\/\s*$/im.test(group)) {
      error('robots-txt', 'dist/robots.txt', `"User-agent: ${agent}" group does not grant "Allow: /".`);
    }
    if (/^Disallow:\s*\/\s*$/im.test(group)) {
      error(
        'robots-txt',
        'dist/robots.txt',
        `"User-agent: ${agent}" group contains a blanket "Disallow: /" — this would block the entire site from this crawler.`,
      );
    }
  }

  const expectedSitemapLine = `Sitemap: ${ref.SITE_URL}/sitemap.xml`;
  if (!text.includes(expectedSitemapLine)) {
    error('robots-txt', 'dist/robots.txt', `missing "${expectedSitemapLine}".`);
  }
}

/**
 * Ties every `<loc>` in `dist/sitemap.xml` to `src/seo/routes.ts`'s manifest —
 * the same living source of truth every other check in this file reads —
 * rather than merely checking the file is present. Catches both directions:
 * a bogus/foreign URL that shouldn't be there, and a real indexable route
 * that's silently missing.
 */
function checkSitemapXml() {
  const path = resolve(distDir, 'sitemap.xml');
  if (!existsSync(path)) {
    error('sitemap-xml', 'dist/sitemap.xml', 'file not found in dist/ — every build must ship a sitemap.xml.');
    return;
  }
  const text = readText(path);
  if (!/<urlset\b/.test(text)) {
    error('sitemap-xml', 'dist/sitemap.xml', 'missing an <urlset> root element — this is not a sitemap.');
    return;
  }

  const locs = [...text.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => decodeEntities(m[1]));
  if (locs.length === 0) {
    error('sitemap-xml', 'dist/sitemap.xml', 'contains zero <loc> entries.');
    return;
  }

  for (const loc of locs) {
    if (!loc.startsWith(`${ref.SITE_URL}/`)) {
      error(
        'sitemap-xml',
        'dist/sitemap.xml',
        `<loc>${loc}</loc> is not an absolute URL under ${ref.SITE_URL} — every sitemap entry must be a real, first-party site URL.`,
      );
    }
  }

  const expectedPaths = new Set(
    ref.routes.filter((route) => route.indexable).map((route) => (route.path === '/' ? '/' : `${route.path}/`)),
  );
  const sitemapPaths = new Set(
    locs.filter((loc) => loc.startsWith(ref.SITE_URL)).map((loc) => loc.slice(ref.SITE_URL.length) || '/'),
  );

  for (const path of expectedPaths) {
    if (!sitemapPaths.has(path)) {
      error('sitemap-xml', 'dist/sitemap.xml', `indexable route "${path}" (src/seo/routes.ts) is missing from the sitemap.`);
    }
  }
  for (const path of sitemapPaths) {
    if (!expectedPaths.has(path)) {
      error(
        'sitemap-xml',
        'dist/sitemap.xml',
        `sitemap contains "${path}", which is not an indexable route in src/seo/routes.ts's manifest.`,
      );
    }
  }
}

// ------------------------------------------------------------------- main --

let orphanCount = 0;
for (const page of pages) {
  if (page.unexpectedShape) {
    error(
      'file-shape',
      relFileOf(page),
      `unexpected dist file shape "${page.unexpectedShape}" — urlPathForFile() in scripts/lib/html.mjs doesn't recognise this; extend it or find out why the build emitted it.`,
    );
    orphanCount += 1;
    continue;
  }

  const relFile = relFileOf(page);
  const manifestEntry = manifestByPath.get(page.urlPath);
  if (!manifestEntry && !page.isMirror) {
    error(
      'route-manifest',
      relFile,
      `dist/ emits "${page.urlPath}" but src/seo/routes.ts's manifest declares no such route — an orphan page, or the manifest is stale.`,
    );
  }
  const indexable = manifestEntry ? manifestEntry.indexable : true;

  checkTitle(page, relFile);
  checkDescription(page, relFile);
  checkCanonical(page, relFile);
  checkHreflang(page, relFile, indexable);
  checkH1(page, relFile);
  checkHeadingOutline(page, relFile);
  checkNoindex(page, relFile, indexable);
  checkNoKeywords(page, relFile);
  checkJsonLdShape(page, relFile, indexable);
  checkBreadcrumbParity(page, relFile);
}

for (const [manifestPath] of manifestByPath) {
  const found = pages.some((page) => page.urlPath === manifestPath && !page.unexpectedShape);
  if (!found) {
    error('route-manifest', '(no file)', `route manifest declares "${manifestPath}" but no dist/ file was found for it.`);
  }
}

checkTitleUniqueness();
checkDescriptionUniqueness();
checkNoPricing();
checkOnlyFirstPartyImages();
checkNoRangeProduct();
checkNoPakistanPlace();
checkNoPakistanPlaceInBodyCopy();
checkNoPakistanPhone();
checkNoDealerClaims();
checkNoUnverifiableClaims();
checkVocabulary();
checkGoogleRichResults(allTypedOccurrences, ref, { error, warn, gap });
checkRobotsTxt();
checkSitemapXml();

// ---------------------------------------------------------------- report --

if (gaps.length > 0) {
  console.log('\n=== ACKNOWLEDGED GAPS — documented, non-blocking (see docs/11-SEO-VALIDATION.md) ===');
  for (const g of gaps) console.log(`  [${g.rule}] ${g.file}: ${g.message}`);
}
if (warnings.length > 0) {
  console.log(`\n=== WARNINGS (${warnings.length}) — the phase gate is zero errors AND zero warnings; these fail the build ===`);
  for (const w of warnings) console.log(`  [${w.rule}] ${w.file}: ${w.message}`);
}
if (errors.length > 0) {
  console.log(`\n=== ERRORS (${errors.length}) ===`);
  for (const e of errors) console.log(`  [${e.rule}] ${e.file}: ${e.message}`);
}

console.log(
  `\nvalidate-seo: ${pages.length} files checked, ${orphanCount} unrecognised, ` +
    `${errors.length} error(s), ${warnings.length} warning(s), ${gaps.length} acknowledged gap(s).`,
);

if (errors.length + warnings.length > 0) {
  console.log('FAIL');
  process.exit(1);
}
console.log('PASS');
