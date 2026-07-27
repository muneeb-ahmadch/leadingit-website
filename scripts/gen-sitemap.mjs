// Generates public/sitemap.xml and public/robots.txt from the route data.
// Runs automatically before `npm run build` via the "prebuild" script.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(resolve(root, p), 'utf8');

const SITE_URL = (read('src/lib/site.ts').match(/SITE_URL\s*=\s*'([^']+)'/)?.[1] ?? '')
  .replace(/\/$/, '');

// Brand slugs
const brandSlugs = [...read('src/data/brands.ts').matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1]);

// Product slug + brandSlug pairs (they alternate in object-literal order)
const productsSrc = read('src/data/products.ts');
const slugs = [...productsSrc.matchAll(/(?:^|\s)slug:\s*'([^']+)'/g)].map((m) => m[1]);
const brandRefs = [...productsSrc.matchAll(/brandSlug:\s*'([^']+)'/g)].map((m) => m[1]);
const products = slugs.map((slug, i) => ({ slug, brandSlug: brandRefs[i] })).filter((p) => p.brandSlug);

const staticRoutes = ['/', '/brands', '/brands/black-nova/keypad-designer', '/lit-home', '/about', '/contact'];
const urls = [
  ...staticRoutes,
  ...brandSlugs.map((s) => `/brands/${s}`),
  ...products.map((p) => `/brands/${p.brandSlug}/${p.slug}`),
];

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

console.log(`sitemap.xml: ${urls.length} URLs · robots.txt written (${SITE_URL})`);
