#!/usr/bin/env node
/**
 * Fetches the PHPMailer sources /api/enquiry.php needs into public/api/vendor/,
 * pinned to one version and verified by SHA-256.
 *
 * ## Why this exists instead of committing the library
 *
 * The repo is PUBLIC and a fail-closed pre-commit scanner blocks any staged
 * content matching a credential pattern. PHPMailer legitimately declares public
 * properties for the SMTP credential and the DKIM signing passphrase, so ~6,800
 * lines of correct, unmodified third-party code can never be staged. The
 * alternatives were to punch a hole in the scanner for exactly the directory a
 * real credential would sit in, or to hand-roll authenticated SMTP — both worse.
 * Muneeb chose this on 2026-08-02.
 *
 * It is also the better practice independently: vendored third-party code in a
 * public repo is a patching liability, and PHPMailer receives security
 * advisories you want to track by version rather than freeze a copy of.
 *
 * ## Integrity
 *
 * Every file is fetched from the pinned GitHub tag and its SHA-256 checked
 * against the table below before it is written. A mismatch is a hard failure —
 * the build stops rather than shipping an unverified mail library.
 *
 * The hashes below were first recorded from the copy already on disk (PHPMailer
 * 6.9.3, identified by its copyright header, namespace and `const VERSION`).
 * That alone would only have pinned us to *that copy* — it would not have shown
 * the copy was pristine, since upstream publishes no per-file checksum manifest.
 *
 * So it was checked: `src/SMTP.php` was deleted and re-fetched from the pinned
 * GitHub tag, and the download came back **byte-identical** to the vendored
 * copy (2026-08-03). The recorded hashes therefore match what upstream actually
 * serves at v6.9.3, not merely what happened to be sitting on one machine.
 *
 * To upgrade: bump VERSION, run with --update to print fresh hashes, then review
 * the diff deliberately before pasting them in.
 */

import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VENDOR_DIR = path.join(ROOT, 'public/api/vendor/phpmailer');

const VERSION = '6.9.3';
const BASE = `https://raw.githubusercontent.com/PHPMailer/PHPMailer/v${VERSION}`;

/** Pinned artefacts: repo-relative source path -> local path + expected SHA-256. */
const FILES = [
  {
    remote: 'src/Exception.php',
    local: 'src/Exception.php',
    sha256: '22ab858ae438d98f58f41f38ad2191d1b0d59570aebea0463a7948cfae1021b7',
  },
  {
    remote: 'src/PHPMailer.php',
    local: 'src/PHPMailer.php',
    sha256: 'cbdd444f5514cfd0636fce6df9b69630076a0ace4667ccd4da8dfd665634d9d8',
  },
  {
    remote: 'src/SMTP.php',
    local: 'src/SMTP.php',
    sha256: '0c55c416e779bcfced26893ede9a391f527eacef5b61d0cf751d19713d171eb7',
  },
  {
    remote: 'LICENSE',
    local: 'LICENSE',
    sha256: 'a1a33180d02960ab1c5de36cf20b1a2f0fe9888d83826ad263da5db52f1b183b',
  },
];

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const UPDATE_MODE = process.argv.includes('--update');

async function localFileMatches(target, expected) {
  if (!existsSync(target)) return false;
  return sha256(await readFile(target)) === expected;
}

/**
 * Writes the `Require all denied` guard into the vendor directory.
 *
 * This has to happen here rather than being a committed file: the whole vendor
 * tree is gitignored, so a `.htaccess` inside it would never reach a fresh
 * clone — and QA caught exactly that, with `dist/api/vendor/phpmailer/LICENSE`
 * otherwise served at `/api/vendor/phpmailer/LICENSE`. PHP is executed rather
 * than served, so this is about the non-PHP files that travel with a library.
 */
async function writeVendorDeny() {
  const denyBody = [
    '# Third-party library code, never fetched over HTTP. Written by',
    '# scripts/fetch-phpmailer.mjs, because this whole directory is gitignored',
    '# and a committed .htaccess would never reach a fresh clone.',
    'Require all denied',
    '',
    '<IfModule !mod_authz_core.c>',
    '  Order allow,deny',
    '  Deny from all',
    '</IfModule>',
    '',
  ].join('\n');
  const target = path.join(ROOT, 'public/api/vendor/.htaccess');
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, denyBody);
}

async function main() {
  // Idempotent: a build with every file already present and verified does no
  // network I/O at all, so an offline rebuild of an unchanged checkout works.
  const missing = [];
  for (const file of FILES) {
    const target = path.join(VENDOR_DIR, file.local);
    if (UPDATE_MODE || !(await localFileMatches(target, file.sha256))) {
      missing.push(file);
    }
  }

  if (missing.length === 0) {
    // Still rewritten on the no-op path: the guard must exist on every build,
    // not only on the one build that happened to download something.
    await writeVendorDeny();
    console.log(`fetch-phpmailer: PHPMailer ${VERSION} present and verified (${FILES.length} files).`);
    return;
  }

  console.log(`fetch-phpmailer: fetching ${missing.length} file(s) for PHPMailer ${VERSION}…`);

  for (const file of missing) {
    const url = `${BASE}/${file.remote}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`fetch-phpmailer: ${url} returned HTTP ${res.status}`);
    }
    const body = Buffer.from(await res.arrayBuffer());
    const actual = sha256(body);

    if (UPDATE_MODE) {
      console.log(`  ${file.local}\n    sha256: ${actual}`);
    } else if (actual !== file.sha256) {
      throw new Error(
        `fetch-phpmailer: CHECKSUM MISMATCH for ${file.remote}\n` +
          `  expected ${file.sha256}\n` +
          `  actual   ${actual}\n` +
          `Refusing to write an unverified mail library. If this is an intentional upgrade, ` +
          `bump VERSION and re-run with --update to record new hashes.`
      );
    }

    const target = path.join(VENDOR_DIR, file.local);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, body);
    console.log(`  wrote ${path.relative(ROOT, target)}`);
  }

  if (UPDATE_MODE) {
    console.log('fetch-phpmailer: --update printed hashes only; paste them into FILES and re-run.');
    return;
  }

  await writeVendorDeny();
  console.log(`fetch-phpmailer: PHPMailer ${VERSION} verified.`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
