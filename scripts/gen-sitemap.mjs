// Generates public/sitemap.xml and public/robots.txt from the route data.
// Runs automatically before `npm run build` via the "prebuild" script.
//
// The URL list must stay in lockstep with the prerendered route set in
// src/router.tsx: the same static routes, one entry per brand and one per
// product. The /404 route is deliberately excluded — it is prerendered (and
// mirrored to dist/404.html for Apache) but marked noindex, so it never belongs
// in a sitemap.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(resolve(root, p), 'utf8');
const fail = (msg) => {
  console.error(`gen-sitemap: ${msg}`);
  process.exit(1);
};

const SITE_URL = (read('src/lib/site.ts').match(/SITE_URL\s*=\s*'([^']+)'/)?.[1] ?? '')
  .replace(/\/$/, '');
if (!SITE_URL) fail('could not read SITE_URL from src/lib/site.ts');

// Brand slugs — top-level `slug:` fields of the BRANDS entries.
const brandSlugs = [...read('src/data/brands.ts').matchAll(/^ {4}slug: '([^']+)',$/gm)].map(
  (m) => m[1],
);
if (brandSlugs.length === 0) fail('no brand slugs found in src/data/brands.ts');

// Product pages — every PRODUCTS entry starts with `slug:` immediately followed
// by `brandSlug:`, which keeps the pair unambiguous (category taxonomies also
// use a `slug:` field, and must not be matched here).
const products = [
  ...read('src/data/products.ts').matchAll(/^ {4}slug: '([^']+)',\n {4}brandSlug: '([^']+)',$/gm),
].map((m) => ({ slug: m[1], brandSlug: m[2] }));
if (products.length === 0) fail('no products found in src/data/products.ts');

const unknownBrand = products.find((p) => !brandSlugs.includes(p.brandSlug));
if (unknownBrand) fail(`product "${unknownBrand.slug}" references unknown brand "${unknownBrand.brandSlug}"`);

const KEYPAD_DESIGNER = '/brands/black-nova/keypad-designer';
const staticRoutes = ['/', '/brands', KEYPAD_DESIGNER, '/lit-home', '/about', '/contact'];
const urls = [
  ...staticRoutes,
  ...brandSlugs.map((s) => `/brands/${s}`),
  ...products.map((p) => `/brands/${p.brandSlug}/${p.slug}`),
];

const duplicate = urls.find((u, i) => urls.indexOf(u) !== i);
if (duplicate) fail(`duplicate URL generated: ${duplicate}`);

const today = new Date().toISOString().slice(0, 10);
const body = urls
  .map(
    (u) =>
      `  <url>\n    <loc>${SITE_URL}${u}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n  </url>`,
  )
  .join('\n');

writeFileSync(
  resolve(root, 'public/sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
);

writeFileSync(
  resolve(root, 'public/robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
);

console.log(
  `sitemap.xml: ${urls.length} URLs (${brandSlugs.length} brands · ${products.length} products) · robots.txt written (${SITE_URL})`,
);
