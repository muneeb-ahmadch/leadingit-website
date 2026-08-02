// Generates public/sitemap.xml and public/robots.txt from the typed route
// manifest (src/seo/routes.ts). Runs automatically before `npm run build` via
// the "prebuild" script. Both outputs are gitignored — they are build artefacts.
//
// This script used to regex-scrape src/data/*.ts, which made it a second source
// of truth that would drift from the router. It now loads the same manifest the
// router's getStaticPaths uses, so the sitemap cannot disagree with the set of
// files the prerender writes. Every structural invariant — duplicate paths,
// unknown brand references, reserved-slug collisions, title/description limits
// — is enforced inside the manifest itself and throws from `sitemapRoutes()`,
// so it is inherited here rather than reimplemented.
//
// The manifest is TypeScript and uses the `@` alias, so it is loaded through
// Vite's own SSR module runner: that resolves the alias and transpiles TS for
// free, with no new dependency (Vite is already a devDependency). A dev server
// in middlewareMode binds no port and, with the watcher off, exits cleanly.
//
// The /404 route is deliberately excluded — it is prerendered (and mirrored to
// dist/404.html for Apache) but marked noindex, so it never belongs in a
// sitemap. It carries `indexable: false` in the manifest; nothing here needs to
// know its path.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createServer } from 'vite';
import { AI_CRAWLERS } from './lib/ai-crawlers.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// AI/answer-engine crawlers are explicitly allowed (user-ratified: being cited
// is a first-class channel). /api/ is reserved for the Phase 5 PHP endpoint.
// The list itself lives in scripts/lib/ai-crawlers.mjs — shared with
// scripts/validate-seo.mjs so the generated robots.txt and the harness that
// checks it can never silently disagree.

function fail(message) {
  console.error(`gen-sitemap: ${message}`);
  process.exit(1);
}

const server = await createServer({
  root,
  // No port is bound and no HTML is served. The file watcher would otherwise
  // keep the process alive after the files are written.
  server: { middlewareMode: true, hmr: false, watch: null },
  appType: 'custom',
  // The manifest imports nothing from node_modules, so there is nothing to
  // pre-bundle — skipping discovery keeps prebuild from crawling the whole app.
  optimizeDeps: { noDiscovery: true, include: [] },
  logLevel: 'error',
});

let routes;
let siteUrl;
try {
  ({ SITE_URL: siteUrl } = await server.ssrLoadModule('/src/lib/site.ts'));
  const { sitemapRoutes } = await server.ssrLoadModule('/src/seo/routes.ts');
  routes = await sitemapRoutes();
} catch (error) {
  await server.close();
  // Manifest assertions throw with a named, actionable message — surface it
  // verbatim and break the build. A wrong sitemap must never be a warning.
  fail(error instanceof Error ? error.message : String(error));
}
await server.close();

siteUrl = (siteUrl ?? '').replace(/\/$/, '');
if (!siteUrl) fail('SITE_URL is empty in src/lib/site.ts');
if (!siteUrl.startsWith('https://')) {
  fail(`SITE_URL must be an absolute https origin, got "${siteUrl}"`);
}

const count = (kind) => routes.filter((route) => route.kind === kind).length;
const rangeCount = count('range');
const brandCount = count('brand');
const productCount = count('product') + rangeCount;
if (brandCount === 0) fail('the manifest produced no brand routes');
if (productCount === 0) fail('the manifest produced no product routes');

// Canonical URLs carry a trailing slash (docs/05 taxonomy; Apache DirectorySlash
// 301s the bare form) — the root is already '/'. No <lastmod> (a build-time
// stamp is not truthful per-URL) and no <changefreq>/<priority> (ignored by
// Google, noise for everyone else).
const canonical = (path) => (path === '/' ? `${siteUrl}/` : `${siteUrl}${path}/`);
const urls = routes.map((route) => canonical(route.path));

const duplicate = urls.find((url, i) => urls.indexOf(url) !== i);
if (duplicate) fail(`duplicate URL generated: ${duplicate}`);

const body = urls.map((url) => `  <url>\n    <loc>${url}</loc>\n  </url>`).join('\n');
writeFileSync(
  resolve(root, 'public/sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
);

const robots = [
  // Each named group repeats `Disallow: /api/`. robots.txt groups are NOT
  // inherited: a crawler that matches its own User-agent line obeys only that
  // group and ignores `User-agent: *` entirely. So without this line every one
  // of these eight crawlers was explicitly permitted to crawl the POST-only
  // contact endpoint, which the wildcard group had disallowed since Phase 2.
  ...AI_CRAWLERS.flatMap((ua) => [`User-agent: ${ua}`, 'Allow: /', 'Disallow: /api/', '']),
  'User-agent: *',
  'Allow: /',
  'Disallow: /api/',
  '',
  `Sitemap: ${siteUrl}/sitemap.xml`,
  '',
].join('\n');
writeFileSync(resolve(root, 'public/robots.txt'), robots);

console.log(
  `sitemap.xml: ${urls.length} URLs (${brandCount} brands · ${productCount} products, ` +
    `${rangeCount} of them ranges) · robots.txt written (${siteUrl})`,
);
