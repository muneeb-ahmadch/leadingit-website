// Small, dependency-free HTML/JSON-LD extraction helpers shared by
// scripts/validate-seo.mjs and scripts/gen-schema-vocab-subset.mjs.
//
// Deliberately regex-based, not a DOM parser: the project rule (package.json)
// is "no new dependencies", and the documents here are build output we
// control (vite-react-ssg + react-helmet-async), not arbitrary third-party
// HTML — the shapes handled below are exhaustive for what this codebase
// actually emits, not a general-purpose HTML parser.
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

/** Every `*.html` file under `dir`, sorted, absolute paths. */
export function walkHtmlFiles(dir) {
  const out = [];
  (function walk(current) {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith('.html')) out.push(full);
    }
  })(dir);
  out.sort();
  return out;
}

export function readText(path) {
  return readFileSync(path, 'utf8');
}

/**
 * The site path a file represents, `vite-react-ssg`'s `dirStyle: 'nested'`
 * convention: `dist/index.html` -> `/`, `dist/a/b/index.html` -> `/a/b/`.
 *
 * `dist/404.html` is a special case, not a route of its own: `onFinished` in
 * `src/main.tsx` byte-copies `404/index.html` to `404.html` so Apache's
 * `ErrorDocument 404 /404.html` directive has a real file to serve; it is a
 * deployment artefact, not a second crawlable URL, so `isMirror` is `true` and
 * callers exempt it from the self-referencing-canonical rule (it intentionally
 * carries the *same* canonical as `/404/`).
 */
export function urlPathForFile(distDir, filePath) {
  const rel = relative(distDir, filePath).split(sep).join('/');
  if (rel === '404.html') return { path: '/404/', isMirror: true };
  if (rel === 'index.html') return { path: '/', isMirror: false };
  if (rel.endsWith('/index.html')) {
    return { path: `/${rel.slice(0, -'index.html'.length)}`, isMirror: false };
  }
  // Anything else is a shape this codebase has never emitted; surface it
  // rather than guess.
  return { path: null, isMirror: false, unexpectedShape: rel };
}

/** Parse a tag's attributes into a plain object, quote-style agnostic. */
export function parseAttrs(tagSource) {
  const attrs = {};
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)')/g;
  let m;
  while ((m = re.exec(tagSource))) {
    attrs[m[1]] = m[3] !== undefined ? m[3] : m[4];
  }
  return attrs;
}

/** Every void `<tagName ...>` element, in document order. */
export function findVoidTags(html, tagName) {
  const re = new RegExp(`<${tagName}\\b[^>]*>`, 'gi');
  const out = [];
  let m;
  while ((m = re.exec(html))) out.push({ raw: m[0], attrs: parseAttrs(m[0]), index: m.index });
  return out;
}

/** Every `<tagName ...>...</tagName>` element (non-greedy), in document order. */
export function findElements(html, tagName) {
  const re = new RegExp(`<${tagName}\\b([^>]*)>([\\s\\S]*?)<\\/${tagName}>`, 'gi');
  const out = [];
  let m;
  while ((m = re.exec(html))) {
    out.push({ raw: m[0], attrs: parseAttrs(m[1]), inner: m[2], index: m.index });
  }
  return out;
}

/** Strip nested tags, leaving only text content. */
export function stripTags(s) {
  return s.replace(/<[^>]*>/g, '');
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'" };

/** Decode the handful of entities React/helmet actually emit (no full HTML5 entity table). */
export function decodeEntities(s) {
  return s
    .replace(/&(amp|lt|gt|quot|apos|#39);/g, (_, name) => ENTITIES[name])
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
}

export function textOf(inner) {
  return decodeEntities(stripTags(inner)).replace(/\s+/g, ' ').trim();
}

/** Every `<script type="application/ld+json">` block's raw JSON text. */
export function extractJsonLdBlocks(html) {
  const re =
    /<script\b(?=[^>]*\btype\s*=\s*["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/gi;
  const out = [];
  let m;
  while ((m = re.exec(html))) out.push(m[1]);
  return out;
}

/** The visible breadcrumb `<nav aria-label="Breadcrumb">...</nav>` block, if any. */
export function extractBreadcrumbNav(html) {
  const re = /<nav\b(?=[^>]*\baria-label\s*=\s*["']breadcrumb["'])[^>]*>([\s\S]*?)<\/nav>/i;
  const m = re.exec(html);
  return m ? m[1] : null;
}

/**
 * The visible breadcrumb trail from a `<nav aria-label="Breadcrumb">` inner
 * block: one `{ name, isLink, href? }` per `<li>`, in document order. `isLink`
 * is `false` for the current-page entry, which `src/components/Breadcrumbs.tsx`
 * renders as `<span aria-current="page">` rather than a link — it carries no
 * `href`. `href` is the raw attribute value (entities undecoded — callers
 * comparing it against a URL should run it through `decodeEntities()` first,
 * same as `name` already is via `textOf()`).
 */
export function parseVisibleBreadcrumbs(navInner) {
  return findElements(navInner, 'li').map(({ inner }) => {
    const withoutSeparator = inner.replace(/<span[^>]*aria-hidden="true"[^>]*>[\s\S]*?<\/span>/i, '');
    const link = findElements(withoutSeparator, 'a')[0];
    if (link) return { name: textOf(link.inner), isLink: true, href: link.attrs.href ?? '' };
    const span = findElements(withoutSeparator, 'span')[0];
    return { name: textOf(span ? span.inner : withoutSeparator), isLink: false };
  });
}
