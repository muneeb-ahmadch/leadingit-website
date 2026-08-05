#!/usr/bin/env node
/**
 * Fail-closed gate between `dist/` and the server.
 *
 * `npm run build` proves the site COMPILES and `validate:seo` proves the markup
 * and structured data are right. Neither proves the directory is safe to upload:
 * that it carries the PHP endpoint and its fetched vendor tree, that the build
 * artefacts the postbuild step is supposed to remove are gone and the one it must
 * NOT remove is still there, that the two public keys really are baked in, and
 * that nothing credential-shaped is about to be published to a live host.
 *
 * Every check here exists because getting it wrong is either invisible until a
 * visitor hits it or expensive to undo. Run it before every upload; it exits
 * non-zero on the first category that fails, and the deploy must stop.
 *
 * Usage: node scripts/predeploy-verify.mjs [--dist dist]
 */

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const argv = process.argv.slice(2);
const distDir = resolve(argv.includes('--dist') ? argv[argv.indexOf('--dist') + 1] : 'dist');
const publicApiDir = resolve('public/api');

/** Budgets are the ones locked in CLAUDE.md, not invented here. */
const MAX_IMAGE_BYTES = 250 * 1024;
const MAX_SITE_BYTES = 800 * 1024 * 1024;
const EXPECTED_ROUTE_COUNT = 124; // 124 routes + 404.html = 125 emitted files

/** Public by design — both are client-side values and belong in the build. */
const GA4_MEASUREMENT_ID = 'G-G9GQ6YZNYV';
const TURNSTILE_SITE_KEY = '0x4AAAAAAEHAKltFGPHTvMqV';

const results = [];
let failed = false;

function check(category, label, ok, detail = '') {
  results.push({ category, label, ok, detail });
  if (!ok) failed = true;
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

if (!existsSync(distDir)) {
  console.error(`predeploy-verify: ${distDir} does not exist — run \`npm run build\` first.`);
  process.exit(1);
}

const files = walk(distDir);
const rel = (f) => relative(distDir, f);

// ---------------------------------------------------------------- 1. shape
const htmlFiles = files.filter((f) => f.endsWith('.html'));
check('shape', `${EXPECTED_ROUTE_COUNT} routes + 404 emitted`,
  htmlFiles.length === EXPECTED_ROUTE_COUNT + 1,
  `${htmlFiles.length} .html files (expected ${EXPECTED_ROUTE_COUNT + 1})`);

for (const required of ['index.html', '404.html', '.htaccess', 'sitemap.xml', 'robots.txt']) {
  check('shape', `${required} present`, existsSync(join(distDir, required)));
}

// ------------------------------------------------------- 2. build artefacts
// postbuild deletes dist/.vite/ but must NOT sweep the static loader manifest,
// which is fetched client-side at runtime. Both directions are checked because
// each has been got wrong once.
check('artefacts', 'dist/.vite removed by postbuild', !existsSync(join(distDir, '.vite')));

const loaderManifests = files.filter((f) => /static-loader-data-manifest-[^/]*\.json$/.test(f));
check('artefacts', 'static-loader-data-manifest survives postbuild',
  loaderManifests.length >= 1,
  `${loaderManifests.length} found — it is fetched at runtime and must ship`);

// ------------------------------------------------------- 3. the PHP endpoint
// public/api/vendor/ is gitignored: prebuild fetches PHPMailer, SHA-verified.
// A CI runner that skipped prebuild produces a dist that 500s on first enquiry.
const requiredApi = [
  'api/contact.php', 'api/config.php',
  'api/lib/Env.php', 'api/lib/Mailer.php', 'api/lib/RateLimiter.php',
  'api/lib/Spam.php', 'api/lib/Storage.php', 'api/lib/Turnstile.php',
  'api/vendor/phpmailer/src/PHPMailer.php', 'api/vendor/phpmailer/src/SMTP.php',
  'api/vendor/phpmailer/src/Exception.php',
  'api/lib/.htaccess', 'api/vendor/.htaccess',
];
for (const f of requiredApi) {
  check('endpoint', `${f} present`, existsSync(join(distDir, f)));
}

// A dist built before the last edit to the endpoint would silently deploy the
// old code. Compare content, not timestamps.
const digest = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
let stale = [];
for (const f of requiredApi) {
  const source = join(publicApiDir, f.replace(/^api\//, ''));
  const built = join(distDir, f);
  if (existsSync(source) && existsSync(built) && digest(source) !== digest(built)) {
    stale.push(f);
  }
}
check('endpoint', 'built endpoint matches public/api (not a stale build)',
  stale.length === 0, stale.length ? `stale: ${stale.join(', ')}` : '');

// No populated env file may ever be inside the deployed tree — the endpoint
// resolves its config from OUTSIDE the web root, on purpose.
const envInDist = files.filter((f) => /(^|\/)\.env($|\.)/.test(rel(f)));
check('endpoint', 'no .env file inside the deployed tree', envInDist.length === 0,
  envInDist.map(rel).join(', '));

// ------------------------------------------------- 4. public keys baked in
// Both are build-time constants. If either is missing the feature is silently
// dead on a live site: no analytics at all, or a contact form that cannot solve
// its own challenge.
const jsBlob = files.filter((f) => f.endsWith('.js')).map((f) => readFileSync(f, 'utf8')).join('\n');
check('keys', 'GA4 measurement ID baked into the bundle', jsBlob.includes(GA4_MEASUREMENT_ID));
check('keys', 'Turnstile site key baked into the bundle', jsBlob.includes(TURNSTILE_SITE_KEY));

// ------------------------------------------------------------ 5. leak sweep
// The repo is public and so is the destination. Server-side values live only in
// the env file outside the web root; none may ride along in dist/.
const serverOnlyKeys = ['SMTP_AUTH_TOKEN', 'SMTP_USER', 'SMTP_HOST', 'TURNSTILE_VERIFY_TOKEN', 'CONTACT_TO_EMAIL'];
const leaks = [];
for (const f of files) {
  if (!/\.(html|js|css|json|txt|xml|php)$/.test(f)) continue;
  const body = readFileSync(f, 'utf8');
  for (const key of serverOnlyKeys) {
    // The key NAME appears legitimately in config.php (it reads it). A populated
    // assignment is what must never ship.
    const assigned = new RegExp(`${key}\\s*=\\s*\\S+`);
    if (assigned.test(body) && !rel(f).startsWith('api/')) leaks.push(`${rel(f)} :: ${key}`);
  }
}
check('leak', 'no server-side value assigned anywhere in dist', leaks.length === 0, leaks.join(', '));

// ------------------------------------------------------------- 6. budgets
const imageFiles = files.filter((f) => /\.(avif|webp|jpe?g|png|gif|svg)$/i.test(f));
const oversized = imageFiles
  .map((f) => ({ f, size: statSync(f).size }))
  .filter((x) => x.size > MAX_IMAGE_BYTES)
  .sort((a, b) => b.size - a.size);
check('budget', `no image over ${MAX_IMAGE_BYTES / 1024} KB`, oversized.length === 0,
  oversized.slice(0, 5).map((x) => `${rel(x.f)} ${(x.size / 1024).toFixed(0)}KB`).join(', '));

const totalBytes = files.reduce((n, f) => n + statSync(f).size, 0);
check('budget', `site under ${MAX_SITE_BYTES / 1024 / 1024} MB`, totalBytes <= MAX_SITE_BYTES,
  `${(totalBytes / 1024 / 1024).toFixed(1)} MB`);

// ------------------------------------------------- 7. .htaccess essentials
// These three have each been called out as must-not-regress. A deploy that
// drops them breaks TLS provisioning, republishes retired URLs, or lets the
// addon-domain path serve a duplicate of the whole site.
const htaccess = readFileSync(join(distDir, '.htaccess'), 'utf8');
check('htaccess', '/.well-known/ exempted from the dotfile block',
  /RewriteCond\s+%\{REQUEST_URI\}\s+!\^\/\\\.well-known\//.test(htaccess));
check('htaccess', 'host canonicalisation to leadingit.me present',
  /RewriteCond\s+%\{HTTP_HOST\}\s+!\^leadingit\\\.me\$/.test(htaccess));
check('htaccess', 'retired-route 301 block present',
  (htaccess.match(/\[R=301,L,QSA\]/g) || []).length >= 3);
check('htaccess', 'CSP header present', /Content-Security-Policy/.test(htaccess));

// ---------------------------------------------------------------- report
const pad = (s, n) => String(s).padEnd(n);
let lastCategory = '';
for (const r of results) {
  if (r.category !== lastCategory) {
    console.log(`\n${r.category.toUpperCase()}`);
    lastCategory = r.category;
  }
  console.log(`  ${r.ok ? 'PASS' : 'FAIL'}  ${pad(r.label, 52)}${r.detail ? '  ' + r.detail : ''}`);
}

const failures = results.filter((r) => !r.ok);
console.log(
  `\npredeploy-verify: ${results.length} checks, ${failures.length} failure(s) — ` +
  `${failed ? 'DO NOT DEPLOY' : 'SAFE TO UPLOAD'}`
);
process.exit(failed ? 1 : 0);
