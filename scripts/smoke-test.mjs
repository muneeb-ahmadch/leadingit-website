#!/usr/bin/env node
/**
 * Post-deploy smoke test — the last step of every deploy, run against the LIVE
 * origin. It answers one question: did this upload leave a working site behind?
 *
 * It deliberately tests behaviour that only exists on the server and can never
 * be proven from `dist/`: that Apache reads the .htaccess at all, that PHP
 * executes, that the redirects fire, that the security headers survive
 * Cloudflare, and that the 404 is a real 404 rather than a 200 with a 404 page.
 *
 * `--origin` bypasses Cloudflare when you need to know whether a fault is the
 * host or the edge; run it both ways after a cache purge and compare.
 *
 * Usage:
 *   node scripts/smoke-test.mjs --base https://leadingit.me
 *   node scripts/smoke-test.mjs --base https://leadingit.me --origin 1.2.3.4
 *   node scripts/smoke-test.mjs --base http://127.0.0.1:8080 --local
 *
 * Exit code is non-zero if any REQUIRED check fails — wire it into the deploy so
 * a bad upload is loud, not discovered by a customer.
 */

const argv = process.argv.slice(2);
const arg = (name, fallback = null) =>
  argv.includes(name) ? argv[argv.indexOf(name) + 1] : fallback;

const base = (arg('--base') || 'https://leadingit.me').replace(/\/$/, '');
const originIp = arg('--origin');
const localMode = argv.includes('--local'); // static server: skip Apache/PHP checks
const timeoutMs = Number(arg('--timeout', '20000'));

const checks = [];

/**
 * Fetch without following redirects, so a 301 can be asserted as a 301 rather
 * than silently resolving to its destination — the single most common way a
 * redirect test passes while the redirect is broken.
 */
// HostGator fronts this account with a bot check that answers cookie-less
// clients with `409` and a body of
//   <script>document.cookie = "humans_NNNNN=1"; document.location.reload(true)</script>
// instead of passing the request to PHP. A browser runs that script, sets the
// cookie and reloads, so real visitors never see it — but `fetch` does not, so
// the first live deploy reported the contact endpoint as broken when it was
// fine. Confirmed by hand: replaying with the cookie gives 405 on GET and a
// correct JSON body on POST.
//
// The cookie name carries an account-specific number, so it is parsed out of the
// challenge rather than hardcoded, and the request is replayed once. Anything
// still failing after that is a real failure.
let humansCookie = null;

async function req(path, { method = 'GET', headers = {}, follow = false, body } = {}) {
  const url = path.startsWith('http') ? path : base + path;

  const send = async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'User-Agent': 'leadingit-smoke-test',
          ...(humansCookie ? { Cookie: humansCookie } : {}),
          ...headers,
        },
        redirect: follow ? 'follow' : 'manual',
        signal: controller.signal,
        body,
      });
      const text = await res.text().catch(() => '');
      return { status: res.status, headers: res.headers, body: text, url };
    } finally {
      clearTimeout(timer);
    }
  };

  let res = await send();
  const challenge = res.body.match(/document\.cookie\s*=\s*"(humans_\d+=[^"]*)"/i);
  if (challenge && !humansCookie) {
    humansCookie = challenge[1];
    res = await send();
  }
  return res;
}

function record(name, ok, detail, { required = true, skipped = false } = {}) {
  checks.push({ name, ok, detail, required, skipped });
}

async function run(name, fn, { required = true, skip = false, skipReason = '' } = {}) {
  if (skip) return record(name, true, skipReason, { required, skipped: true });
  try {
    const [ok, detail] = await fn();
    record(name, ok, detail, { required });
  } catch (e) {
    record(name, false, `threw: ${e.message}`, { required });
  }
}

// ------------------------------------------------------------ content
await run('homepage 200 with a real h1', async () => {
  const r = await req('/');
  const h1 = r.body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const text = h1 ? h1[1].replace(/<[^>]+>/g, '').trim() : '';
  return [r.status === 200 && text.length > 0, `${r.status}, h1="${text.slice(0, 60)}"`];
});

await run('homepage carries JSON-LD', async () => {
  const r = await req('/');
  // Attribute-order-agnostic on purpose: react-helmet emits
  // `<script data-rh="true" type="application/ld+json">`, and a regex that
  // assumed `<script type=...>` reported the homepage as having NO structured
  // data at all. A pattern that only matches the shape you expected is how the
  // Phase 6 supply-sentence defect survived verification.
  const m = r.body.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!m) return [false, 'no ld+json block'];
  try {
    const g = JSON.parse(m[1]);
    const types = (g['@graph'] || []).map((n) => n['@type']).flat();
    return [types.length > 0, `@graph: ${types.join(', ')}`];
  } catch (e) {
    return [false, `ld+json did not parse: ${e.message}`];
  }
});

for (const [label, path] of [
  ['brand page', '/brands/basalte/'],
  ['product page', '/brands/basalte/miro/'],
  ['contact page', '/contact/'],
  ['Dubai location page', '/locations/dubai/'],
]) {
  await run(`${label} 200 (${path})`, async () => {
    const r = await req(path);
    return [r.status === 200 && /<h1/i.test(r.body), `${r.status}`];
  });
}

await run('sitemap.xml served as XML', async () => {
  const r = await req('/sitemap.xml');
  const locs = (r.body.match(/<loc>/g) || []).length;
  return [r.status === 200 && locs > 0, `${r.status}, ${locs} <loc> entries`];
});

await run('robots.txt names the sitemap', async () => {
  const r = await req('/robots.txt');
  return [r.status === 200 && /Sitemap:/i.test(r.body), `${r.status}`];
});

// A 404 page served with a 200 is an indexable soft-404 on every missing URL.
await run('unknown URL returns a REAL 404 status', async () => {
  const r = await req('/this-route-does-not-exist-smoke-test/');
  return [r.status === 404, `${r.status}`];
});

// --------------------------------------------------- Apache / PHP behaviour
await run('http:// redirects to https (301)', async () => {
  const r = await req(base.replace(/^https:/, 'http:') + '/');
  return [[301, 302, 308].includes(r.status), `${r.status} -> ${r.headers.get('location') || '(none)'}`];
}, { skip: localMode, skipReason: 'needs Apache' });

await run('www redirects to apex (301, single hop)', async () => {
  const r = await req(base.replace('https://', 'https://www.') + '/');
  const loc = r.headers.get('location') || '';
  return [r.status === 301 && /^https:\/\/leadingit\.me\//.test(loc), `${r.status} -> ${loc}`];
}, { skip: localMode, skipReason: 'needs Apache' });

// The addon-domain duplicate-content guard. What matters is that the site is not
// SERVED at a second hostname; how that is achieved is not the assertion.
//
// Confirmed 2026-08-06: leadingit.me's docroot is /home4/maisa/leadingit.me,
// BESIDE public_html rather than inside it, so this path should simply 404 —
// the duplicate never existed. An earlier version of this check demanded a 301
// and would have failed the deploy on the healthiest possible answer. 301 is
// also fine (the .htaccess host rule catches it if the layout ever changes).
// Only a 200 is a failure, and only then does it warrant investigation.
await run('site is NOT served at the addon-domain path', async () => {
  const r = await req('https://missmaisa.com/leadingit.me/');
  const loc = r.headers.get('location') || '';
  const verdict = r.status === 200
    ? 'SERVING A DUPLICATE — the whole site is reachable at a second hostname'
    : r.status === 404 ? '404 — docroot sits beside public_html, no duplicate exists'
    : `${r.status}${loc ? ' -> ' + loc : ''}`;
  return [r.status !== 200, verdict];
}, { skip: localMode, skipReason: 'needs Apache' });

await run('a retired route still 301s', async () => {
  const r = await req('/brands/uandksound/s-series/');
  return [r.status === 301, `${r.status} -> ${r.headers.get('location') || '(none)'}`];
}, { skip: localMode, skipReason: 'needs Apache' });

// The legacy WordPress URLs break the instant this build's .htaccess replaces
// WordPress's own, so the cutover deploy is the one that has to prove them.
for (const [from, to] of [
  ['/products/', 'https://leadingit.me/brands/'],
  ['/locations-2/', 'https://leadingit.me/locations/dubai/'],
  ['/main-under-upgrade/', 'https://leadingit.me/'],
]) {
  await run(`legacy WordPress URL 301s (${from})`, async () => {
    const r = await req(from);
    const loc = r.headers.get('location') || '';
    return [r.status === 301 && loc === to, `${r.status} -> ${loc || '(none)'} (want ${to})`];
  }, { skip: localMode, skipReason: 'needs Apache' });
}

await run('dotfiles blocked', async () => {
  const blocked = await req('/.env');
  return [[403, 404].includes(blocked.status), `/.env -> ${blocked.status}`];
}, { skip: localMode, skipReason: 'needs Apache' });

// Probes a FILE path, never the directory. The first live deploy failed this
// check against a server that was in fact healthy: `/.well-known/` returns 403
// from `Options -Indexes` — directory listing is off sitewide — which is
// indistinguishable from the dotfile deny by status code alone. Only the
// directory ever 403s; paths inside it answered 404, meaning they are reachable.
//
// AutoSSL writes a file to /.well-known/acme-challenge/<token> and fetches it,
// so a file path is what actually has to be reachable. 404 (absent) is the
// healthy answer when no challenge is in flight; 403 means the exemption really
// is broken and the certificate will fail to renew.
await run('/.well-known/ file path reachable, not dotfile-denied (AutoSSL)', async () => {
  const r = await req('/.well-known/acme-challenge/smoke-test-probe');
  return [
    r.status !== 403,
    `${r.status}${r.status === 403 ? ' — exemption broken, certs will fail to renew' : ' (404 = reachable, no challenge in flight)'}`,
  ];
}, { skip: localMode, skipReason: 'needs Apache' });

// --------------------------------------------------------- indexability
// A staging robots.txt or a stray noindex reaching production is the most
// expensive silent launch failure there is, and every other check here passes
// happily while it happens. Nothing in the pipeline asserted this before.
await run('robots.txt does not blanket-disallow crawling', async () => {
  const r = await req('/robots.txt');
  const blanket = r.body
    .split(/\n\s*\n/)
    .some((b) => /user-agent:\s*\*/i.test(b) && /^\s*disallow:\s*\/\s*$/im.test(b));
  return [r.status === 200 && !blanket, blanket ? 'User-agent: * has Disallow: / — SITE WOULD BE DEINDEXED' : 'no blanket disallow'];
});

await run('homepage is indexable (no noindex meta or header)', async () => {
  const r = await req('/');
  const header = r.headers.get('x-robots-tag') || '';
  const meta = r.body.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i);
  const metaVal = meta ? meta[1] : '';
  const bad = /noindex/i.test(header) || /noindex/i.test(metaVal);
  return [!bad, `meta="${metaVal || '(none)'}" X-Robots-Tag="${header || '(none)'}"`];
});

await run('homepage canonical points at the live apex', async () => {
  const r = await req('/');
  const m = r.body.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
  const href = m ? m[1] : '';
  return [href === 'https://leadingit.me/', `canonical="${href || '(none)'}"`];
});

// The single best proof that PHP executes at all AND that the endpoint is
// reachable: it is POST-only, so a GET must answer 405 with Allow: POST. It
// costs nothing, sends no mail, and consumes no rate-limit slot.
await run('PHP alive: GET /api/contact.php -> 405 Allow: POST', async () => {
  const r = await req('/api/contact.php');
  let status = null;
  try { status = JSON.parse(r.body).status; } catch { /* body checked below */ }
  return [
    r.status === 405 && status === 'method_not_allowed',
    `${r.status}, allow="${r.headers.get('allow') || ''}", status=${status ?? 'NON-JSON BODY'}`,
  ];
}, { skip: localMode, skipReason: 'needs PHP' });

// A misconfigured server env file answers 500 server_error here. That is the
// most likely first-deploy failure and it must be caught before anyone
// announces the site, not by the first customer who tries to enquire.
await run('endpoint config resolves (not 500 server_error)', async () => {
  const r = await req('/api/contact.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  let status = null;
  try { status = JSON.parse(r.body).status; } catch { /* handled */ }
  if (status === 'server_error') {
    return [false, '500 server_error — the env file outside the web root is missing or incomplete'];
  }
  return [status === 'invalid', `${r.status} status=${status ?? 'NON-JSON BODY'} (expected 400 invalid)`];
}, { skip: localMode, skipReason: 'needs PHP' });

// --------------------------------------------------------------- headers
await run('security headers present on HTML', async () => {
  const r = await req('/');
  const missing = ['content-security-policy', 'x-content-type-options', 'referrer-policy']
    .filter((h) => !r.headers.get(h));
  return [missing.length === 0, missing.length ? `missing: ${missing.join(', ')}` : 'all present'];
}, { skip: localMode, skipReason: 'needs Apache' });

await run('hashed assets are immutably cacheable', async () => {
  const home = await req('/');
  const m = home.body.match(/\/assets\/[A-Za-z0-9._-]+\.(?:js|css)/);
  if (!m) return [false, 'no hashed asset referenced on the homepage'];
  const r = await req(m[0]);
  const cc = r.headers.get('cache-control') || '';
  return [r.status === 200 && /immutable/.test(cc), `${m[0]} -> ${r.status}, cache-control="${cc}"`];
}, { skip: localMode, skipReason: 'needs Apache' });

await run('HTML is not cached immutably', async () => {
  const r = await req('/');
  const cc = r.headers.get('cache-control') || '';
  return [!/immutable/.test(cc), `cache-control="${cc}"`];
}, { skip: localMode, skipReason: 'needs Apache' });

// ------------------------------------------------------ edge vs origin
await run('served through Cloudflare', async () => {
  const r = await req('/');
  const cf = r.headers.get('cf-cache-status');
  const server = r.headers.get('server') || '';
  return [Boolean(cf) || /cloudflare/i.test(server), `cf-cache-status=${cf ?? '(none)'} server=${server}`];
}, { required: false, skip: localMode, skipReason: 'needs Cloudflare' });

if (originIp) {
  await run(`origin reachable directly at ${originIp}`, async () => {
    const r = await fetch(`https://${originIp}/`, {
      headers: { Host: 'leadingit.me' },
    }).then((x) => ({ status: x.status })).catch((e) => ({ status: `error: ${e.message}` }));
    return [r.status === 200, String(r.status)];
  }, { required: false });
}

// ---------------------------------------------------------------- report
console.log(`\nsmoke-test against ${base}${localMode ? '  [--local: Apache/PHP checks skipped]' : ''}\n`);
for (const c of checks) {
  const tag = c.skipped ? 'SKIP' : c.ok ? 'PASS' : c.required ? 'FAIL' : 'WARN';
  console.log(`  ${tag}  ${c.name.padEnd(56)}${c.detail ? '  ' + c.detail : ''}`);
}
const hard = checks.filter((c) => !c.ok && c.required && !c.skipped);
const soft = checks.filter((c) => !c.ok && !c.required && !c.skipped);
console.log(
  `\n${checks.length} checks — ${hard.length} failure(s), ${soft.length} warning(s), ` +
  `${checks.filter((c) => c.skipped).length} skipped`
);
// A green --local run skips half the suite, including every check that only the
// real server can answer. Saying so prevents it being quoted as deploy evidence.
if (localMode) {
  console.log(
    `\n--local skipped ${checks.filter((c) => c.skipped).length} of ${checks.length} checks, ` +
    'including every Apache, PHP and Cloudflare assertion.\n' +
    'A green run here is NOT deploy verification — only a run against the live origin is.'
  );
}
if (hard.length) console.log('\nDEPLOY IS NOT HEALTHY — roll back or fix before announcing.\n');
process.exit(hard.length ? 1 : 0);
