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
  'api/enquiry.php', 'api/config.php',
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

// The digest check above only covers 13 PHP files, so a dist/ built five commits
// ago passed all 32 checks as long as the endpoint had not changed since. This
// catches general staleness: if any deployable source is newer than the emitted
// homepage, the build does not represent the working tree.
const indexHtml = join(distDir, 'index.html');
if (existsSync(indexHtml)) {
  const builtAt = statSync(indexHtml).mtimeMs;
  const sourceRoots = ['src', 'public', 'scripts', 'package.json', 'vite.config.ts', 'index.html'];
  let newest = { file: null, mtime: 0 };
  for (const root of sourceRoots) {
    const abs = resolve(root);
    if (!existsSync(abs)) continue;
    const candidates = statSync(abs).isDirectory() ? walk(abs) : [abs];
    for (const c of candidates) {
      // node_modules and the vendor tree are not authored here.
      if (c.includes('node_modules') || c.includes('/api/vendor/')) continue;
      const m = statSync(c).mtimeMs;
      if (m > newest.mtime) newest = { file: relative(process.cwd(), c), mtime: m };
    }
  }
  check('artefacts', 'dist is newer than every deployable source file',
    newest.mtime <= builtAt,
    newest.mtime > builtAt ? `${newest.file} is newer than dist/index.html — rebuild` : '');
}

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

// The strongest available check, and the only one with a realistic failing input:
// take the ACTUAL values from the local .env and prove none of them appears
// anywhere in dist/. It catches a bundler inlining a value with no key name
// attached, which the name=value scan below cannot see. Values are compared,
// never printed — a failure reports the file and the key name only.
const localEnvPath = resolve('.env');
let envValues = [];
if (existsSync(localEnvPath)) {
  envValues = readFileSync(localEnvPath, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const i = line.indexOf('=');
      return { key: line.slice(0, i).trim(), value: line.slice(i + 1).trim().replace(/^["']|["']$/g, '') };
    })
    // Short values would false-positive on ordinary prose; a real credential is long.
    .filter((e) => e.value.length >= 8);
}

const leaks = [];
for (const f of files) {
  if (!/\.(html|js|css|json|txt|xml|php|map)$/.test(f)) continue;
  const body = readFileSync(f, 'utf8');
  const isApi = rel(f).startsWith('api/');

  for (const key of serverOnlyKeys) {
    // config.php legitimately names these keys in order to read them; what it
    // must never contain is a populated assignment. Checked in api/ too — the
    // previous version exempted the entire directory, which is exactly where a
    // real credential would be pasted by hand on the server.
    const assigned = new RegExp(`${key}\\s*=\\s*['"\`]?[^\\s'"\`,;)]{4,}`);
    if (assigned.test(body)) leaks.push(`${rel(f)} :: ${key} (assigned)`);
  }

  for (const { key, value } of envValues) {
    if (body.includes(value)) leaks.push(`${rel(f)} :: value of ${key} present verbatim`);
  }
  if (isApi) continue; // avoids double-reporting the same file below
}
check('leak', 'no server-side value anywhere in dist (incl. api/)', leaks.length === 0, leaks.join(', '));
check('leak', `local .env values available to compare against (${envValues.length})`,
  !existsSync(localEnvPath) || envValues.length > 0,
  existsSync(localEnvPath) ? '' : 'no local .env — value comparison skipped, name scan only');

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

// ------------------------------------------------------- 8. indexability
// Nothing in the pipeline previously checked that the site being deployed is
// allowed to be indexed. A staging robots.txt or a stray noindex reaching
// production is the single most expensive silent launch failure available, and
// it looks identical to a healthy deploy in every other check here.
const robots = readFileSync(join(distDir, 'robots.txt'), 'utf8');
const blanketDisallow = robots
  .split(/\n\s*\n/)
  .some((block) => /user-agent:\s*\*/i.test(block) && /^\s*disallow:\s*\/\s*$/im.test(block));
check('indexable', 'robots.txt does not blanket-disallow crawling', !blanketDisallow,
  blanketDisallow ? 'User-agent: * has Disallow: / — the site would be deindexed' : '');
check('indexable', 'robots.txt declares the sitemap', /^\s*sitemap:\s*https:\/\//im.test(robots));

// /404/ is noindex by design; every other emitted route must be indexable.
const noindexed = [];
for (const f of htmlFiles) {
  const r = rel(f);
  if (r === '404.html' || r.startsWith('404/')) continue;
  const body = readFileSync(f, 'utf8');
  // Attribute-order agnostic: the emitted tag is `<meta data-rh="true" name="robots" ...>`,
  // and a pattern anchored on `<meta name=` silently matches nothing.
  const m = body.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i);
  if (m && /noindex/i.test(m[1])) noindexed.push(r);
}
check('indexable', 'no indexable route carries a noindex robots meta',
  noindexed.length === 0,
  noindexed.length ? `${noindexed.length} route(s): ${noindexed.slice(0, 5).join(', ')}` : '');

const noindexHeader = /X-Robots-Tag[^\n]*noindex/i.test(htaccess);
check('indexable', '.htaccess sets no sitewide X-Robots-Tag noindex', !noindexHeader);

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
