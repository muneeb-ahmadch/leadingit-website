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

function checkNoDealerClaims() {
  const PHRASES = ['authorized dealer', 'authorised dealer', 'authorized distributor', 'authorised distributor'];
  for (const page of pages) {
    const lower = page.html.toLowerCase();
    for (const phrase of PHRASES) {
      if (lower.includes(phrase)) {
        error(
          'dealer-claim',
          relFileOf(page),
          `found the gated phrase "${phrase}" in emitted HTML — dealer authorisation wording is gated on docs/OPEN-QUESTIONS.md #3 until written per-brand confirmation exists.`,
        );
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
checkNoRangeProduct();
checkNoPakistanPlace();
checkNoDealerClaims();
checkVocabulary();
checkGoogleRichResults(allTypedOccurrences, ref, { error, warn, gap });

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
