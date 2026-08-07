#!/usr/bin/env node
// Build-time image pipeline: raw/ originals -> optimised AVIF + WebP + a
// compressed raster fallback, written into public/ at the exact path shape
// src/data/{products,brands}.ts already reference (the `bn()`/`cr()`/`uk()`
// helpers and the literal `/brands/<file>` paths).
//
// Never touches src/data/products.ts or src/data/brands.ts — this script only
// reads raw/ and writes public/. It has zero network calls (sharp/libvips do
// all encoding locally), so it is safe to run in CI, but nothing in `npm run
// build` invokes it: raw/ is gitignored and does not exist in a fresh CI
// checkout, so the derivatives this script produces must be committed ahead
// of time. Run it locally after raw/ changes, review the diff, commit.
//
// Idempotent: a sha1 content-hash cache (public/.image-pipeline-cache.json,
// gitignored) skips any input whose bytes have not changed since the last run.
//
// On-disk convention every consumer (scripts/build-images.mjs itself and
// src/components/media/ResponsiveImage.tsx) relies on, per processed raster
// image `name.ext`:
//   name.ext    -- compressed raster fallback (same format as source), the
//                  largest emitted size (`capWidth`). This is the literal path
//                  src/data/*.ts already hardcodes, so existing plain <img>
//                  consumers keep working unmodified.
//   name.avif   -- AVIF at capWidth (the "1x" / default modern-format source)
//   name.webp   -- WebP at capWidth
//   name-{w}.avif / name-{w}.webp -- smaller AVIF/WebP variants for srcset,
//                  one per breakpoint in RESPONSIVE_WIDTHS strictly below
//                  capWidth. Never generated above the source's native width
//                  (no upscaling).
// SVGs are copied through unmodified (already tiny, vector, no re-encode win).
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const TARGETS = [
  { src: path.join(ROOT, 'raw/products'), dest: path.join(ROOT, 'public/products') },
  { src: path.join(ROOT, 'raw/brands'), dest: path.join(ROOT, 'public/brands') },
];

// Deliberately NOT inside public/. Everything under public/ is copied verbatim
// into dist/ and uploaded, so this build cache was shipping 63 KB of local build
// state to the production web root on every deploy. It was never exposed — the
// `.htaccess` dotfile deny catches it by basename — but a build cache has no
// business in a web root at all. Kept at the repo root (gitignored) rather than
// under node_modules/ so it survives `npm ci` and the pipeline stays incremental.
const CACHE_PATH = path.join(ROOT, '.image-pipeline-cache.json');
// Committed dimensions manifest — the single source of truth
// `src/components/media/ResponsiveImage.tsx` reads at render time (both SSG
// build and hydration) for intrinsic `width`/`height` and the srcset `widths`
// ladder, keyed by the exact public path callers already hardcode in
// `src/data/products.ts` / `src/data/brands.ts` (e.g.
// `/products/marantz/lifestyle/cinema-50-credenza.jpg`). Unlike the
// content-hash cache above, this MUST be committed: `raw/` does not exist in
// a fresh CI checkout, so nothing else could ever regenerate it there.
const MANIFEST_PATH = path.join(ROOT, 'src/components/media/image-manifest.generated.json');
// Bump whenever the encode recipe (quality ladders, width cap, budget bytes,
// PNG/AVIF/WebP options) changes, so the content-hash cache below correctly
// treats every existing output as stale and re-encodes it — an unchanged raw
// file must not silently keep an output built under an old, looser recipe.
const PIPELINE_VERSION = 2;

const RASTER_EXT = new Set(['.png', '.jpg', '.jpeg']);
const PASSTHROUGH_EXT = new Set(['.svg']);

// Keep this in sync with the identical constant documented in
// src/components/media/ResponsiveImage.tsx — callers of that component pass
// the exact widths they know this script produced for a given asset.
export const RESPONSIVE_WIDTHS = [480, 960, 1600];
const MAX_WIDTH = 1600; // global cap: no emitted file is ever wider than this.

// Fixed-quality options for the synthetic decorative asset only (see
// buildSyntheticAssets below) — every real raw/ source goes through the
// budget-checked ladder in encodeUnderBudget() instead.
const AVIF_OPTS = { quality: 55, effort: 4 };
const WEBP_OPTS = { quality: 72, effort: 4 };
const JPEG_OPTS = { quality: 76, mozjpeg: true };

// Hard budget (docs/13-IMAGE-BUDGET.md / CLAUDE.md): no single deployed image
// may exceed 250 KB. A handful of high-detail sources (brushed-metal finish
// macros especially) do not hit that at the standard quality/width above, so
// every encode is budget-checked and, if it overshoots, retried down a
// quality ladder and then a width ladder until it fits — never shipped over
// budget silently. Any image that still cannot fit at the quality/width floor
// is recorded in stats.overBudget for the budget report to surface honestly.
// 240,000 decimal bytes, not 250 * 1024 (256,000): "KB" in the budget doc is
// ambiguous between decimal and binary kilobytes, so this enforces the
// stricter decimal reading with headroom to spare, rather than shipping a
// file that passes one definition of "250 KB" and fails the other.
const BUDGET_BYTES = 240_000;
const QUALITY_LADDERS = {
  avif: [55, 45, 38, 32, 26],
  webp: [72, 62, 52, 44, 36],
  jpeg: [76, 68, 58, 48, 40],
  png: [82, 72, 62, 52, 42],
};
const WIDTH_LADDER_FACTORS = [1, 0.8, 0.65, 0.5];

/**
 * Encodes `srcPath` at `width` in `format`, walking the quality ladder and
 * then the width ladder until the buffer fits BUDGET_BYTES (or the ladders
 * are exhausted, in which case the smallest/lowest-quality attempt ships and
 * is flagged). Returns { buffer, width, quality, overBudget }.
 */
async function encodeUnderBudget(srcPath, width, format, overBudgetLog, label) {
  const ladder = QUALITY_LADDERS[format];
  let best = null;

  for (const factor of WIDTH_LADDER_FACTORS) {
    const w = Math.max(1, Math.round(width * factor));
    for (const quality of ladder) {
      const pipeline = sharp(srcPath).resize({ width: w, withoutEnlargement: true });
      let buffer;
      if (format === 'avif') buffer = await pipeline.avif({ quality, effort: 4 }).toBuffer();
      else if (format === 'webp') buffer = await pipeline.webp({ quality, effort: 4 }).toBuffer();
      else if (format === 'jpeg') buffer = await pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();
      else buffer = await pipeline.png({ compressionLevel: 9, palette: true, quality, effort: 10 }).toBuffer();

      if (!best || buffer.length < best.buffer.length) best = { buffer, width: w, quality };
      if (buffer.length <= BUDGET_BYTES) {
        return { ...best, overBudget: false };
      }
    }
  }

  overBudgetLog.push({ label, format, bytes: best.buffer.length, width: best.width });
  return { ...best, overBudget: true };
}

async function loadCache() {
  try {
    return JSON.parse(await fs.readFile(CACHE_PATH, 'utf8'));
  } catch {
    return {};
  }
}

async function saveCache(cache) {
  await fs.mkdir(path.dirname(CACHE_PATH), { recursive: true });
  await fs.writeFile(CACHE_PATH, JSON.stringify(cache, null, 2) + '\n');
}

async function loadManifest() {
  try {
    return JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf8'));
  } catch {
    return {};
  }
}

async function saveManifest(manifest) {
  await fs.mkdir(path.dirname(MANIFEST_PATH), { recursive: true });
  const sorted = Object.fromEntries(Object.keys(manifest).sort().map((k) => [k, manifest[k]]));
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(sorted, null, 2) + '\n');
}

/** Public URL path (e.g. `/products/marantz/lifestyle/cinema-50-credenza.jpg`)
 * for a file written to `destDir/filename`, matching the literal strings
 * `src/data/products.ts` / `src/data/brands.ts` already hardcode. */
function toPublicPath(destDir, filename) {
  const rel = path.relative(path.join(ROOT, 'public'), destDir).split(path.sep).join('/');
  return `/${rel ? `${rel}/` : ''}${filename}`;
}

/** Metadata-only (no re-encode) height lookup, used to backfill the manifest
 * for assets the content-hash cache is skipping this run. */
async function capHeightFor(srcPath, capWidth) {
  const meta = await sharp(srcPath).metadata();
  const srcWidth = meta.width ?? capWidth;
  const srcHeight = meta.height ?? capWidth;
  return Math.round((srcHeight * capWidth) / srcWidth);
}

async function sha1(filePath) {
  const buf = await fs.readFile(filePath);
  return crypto.createHash('sha1').update(buf).digest('hex');
}

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else {
      yield full;
    }
  }
}

function widthsBelow(capWidth) {
  return RESPONSIVE_WIDTHS.filter((w) => w < capWidth);
}

async function processRaster(srcPath, destDir, base, ext, cache, stats, manifest) {
  const relKey = path.relative(ROOT, srcPath);
  const hash = await sha1(srcPath);
  const cacheEntry = cache[relKey];
  const publicPath = toPublicPath(destDir, `${base}${ext}`);

  if (cacheEntry && cacheEntry.hash === hash && cacheEntry.version === PIPELINE_VERSION) {
    stats.skipped++;
    // Backfill the manifest for assets whose encode is being skipped but that
    // predate the manifest (or a prior run's cache entry lacks capHeight) —
    // a cheap metadata-only read, never a re-encode.
    if (!manifest[publicPath]) {
      const capHeight = cacheEntry.capHeight ?? (await capHeightFor(srcPath, cacheEntry.capWidth));
      cacheEntry.capHeight = capHeight;
      manifest[publicPath] = { widths: cacheEntry.widths, height: capHeight };
    }
    return;
  }

  const meta = await sharp(srcPath).metadata();
  const srcWidth = meta.width ?? MAX_WIDTH;
  const srcHeight = meta.height ?? MAX_WIDTH;
  const capWidth = Math.min(srcWidth, MAX_WIDTH);
  const capHeight = Math.round((srcHeight * capWidth) / srcWidth);
  const fallbackFormat = ext === '.png' ? 'png' : 'jpeg';

  await fs.mkdir(destDir, { recursive: true });

  const jobs = [];
  for (const w of widthsBelow(capWidth)) {
    jobs.push({ width: w, format: 'avif', destPath: path.join(destDir, `${base}-${w}.avif`) });
    jobs.push({ width: w, format: 'webp', destPath: path.join(destDir, `${base}-${w}.webp`) });
  }
  // Default / largest (capWidth) modern-format pair — unsuffixed.
  jobs.push({ width: capWidth, format: 'avif', destPath: path.join(destDir, `${base}.avif`) });
  jobs.push({ width: capWidth, format: 'webp', destPath: path.join(destDir, `${base}.webp`) });
  // Raster fallback at the exact hardcoded path (same extension as source).
  jobs.push({ width: capWidth, format: fallbackFormat, destPath: path.join(destDir, `${base}${ext}`) });

  let totalBytes = 0;
  for (const job of jobs) {
    const label = path.relative(ROOT, job.destPath);
    const { buffer, overBudget } = await encodeUnderBudget(srcPath, job.width, job.format, stats.overBudget, label);
    await fs.writeFile(job.destPath, buffer);
    totalBytes += buffer.length;
    if (overBudget) stats.overBudgetCount++;
  }

  const widths = [...widthsBelow(capWidth), capWidth];
  cache[relKey] = { hash, version: PIPELINE_VERSION, capWidth, capHeight, widths };
  manifest[publicPath] = { widths, height: capHeight };
  stats.processed++;
  stats.bytesOut += totalBytes;
}

async function processSvg(srcPath, destDir, filename, cache, stats) {
  const relKey = path.relative(ROOT, srcPath);
  const hash = await sha1(srcPath);
  if (cache[relKey]?.hash === hash && cache[relKey]?.version === PIPELINE_VERSION) {
    stats.skipped++;
    return;
  }
  await fs.mkdir(destDir, { recursive: true });
  const destPath = path.join(destDir, filename);
  await fs.copyFile(srcPath, destPath);
  const { size } = await fs.stat(destPath);
  cache[relKey] = { hash, version: PIPELINE_VERSION, copied: true };
  stats.processed++;
  stats.bytesOut += size;
}

// Small synthetic decorative asset for the LIT Home demo's "Now Playing" tile
// (src/features/litHome/data.ts NOW_PLAYING.artUrl — explicitly documented in
// that file as display-only UI chrome, not real device/album data). Generated
// procedurally so it needs no sourced photography: a soft warm-gold radial
// gradient matching the site's dark-luxury palette, 480x480, well under budget.
async function buildSyntheticAssets(cache, stats, manifest) {
  const destDir = path.join(ROOT, 'public/lithome');
  const relKey = 'synthetic:now-playing-art';
  const recipeHash = 'gold-radial-v1';
  const size = 480;
  manifest[toPublicPath(destDir, 'now-playing-art.jpg')] = { widths: [size], height: size };
  if (cache[relKey]?.hash === recipeHash) {
    stats.skipped++;
    return;
  }
  await fs.mkdir(destDir, { recursive: true });
  const svg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <defs>
        <radialGradient id="g" cx="35%" cy="30%" r="80%">
          <stop offset="0%" stop-color="#3a3226"/>
          <stop offset="45%" stop-color="#211c16"/>
          <stop offset="100%" stop-color="#0b0a08"/>
        </radialGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#g)"/>
      <circle cx="168" cy="144" r="70" fill="none" stroke="#c9a961" stroke-opacity="0.35" stroke-width="2"/>
    </svg>`,
  );
  const base = sharp(svg);
  const outputs = [
    base.clone().avif(AVIF_OPTS).toFile(path.join(destDir, 'now-playing-art.avif')),
    base.clone().webp(WEBP_OPTS).toFile(path.join(destDir, 'now-playing-art.webp')),
    base.clone().jpeg(JPEG_OPTS).toFile(path.join(destDir, 'now-playing-art.jpg')),
  ];
  const results = await Promise.all(outputs);
  cache[relKey] = { hash: recipeHash };
  stats.processed++;
  stats.bytesOut += results.reduce((sum, r) => sum + (r?.size ?? 0), 0);
}

async function main() {
  const cache = await loadCache();
  const manifest = await loadManifest();
  const stats = { processed: 0, skipped: 0, bytesOut: 0, overBudget: [], overBudgetCount: 0 };

  for (const { src, dest } of TARGETS) {
    try {
      await fs.access(src);
    } catch {
      console.warn(`[build-images] skipping missing source dir: ${path.relative(ROOT, src)}`);
      continue;
    }
    for await (const filePath of walk(src)) {
      const rel = path.relative(src, filePath);
      const destDir = path.join(dest, path.dirname(rel));
      const ext = path.extname(filePath).toLowerCase();
      const base = path.basename(filePath, ext);
      const filename = path.basename(filePath);

      if (RASTER_EXT.has(ext)) {
        await processRaster(filePath, destDir, base, ext, cache, stats, manifest);
      } else if (PASSTHROUGH_EXT.has(ext)) {
        await processSvg(filePath, destDir, filename, cache, stats);
      } else {
        console.warn(`[build-images] skipping unrecognised file type: ${rel}`);
      }
    }
  }

  await buildSyntheticAssets(cache, stats, manifest);
  await saveCache(cache);
  await saveManifest(manifest);

  console.log(
    `[build-images] processed ${stats.processed}, skipped ${stats.skipped} (unchanged), ` +
      `${(stats.bytesOut / 1024 / 1024).toFixed(2)} MB written this run.`,
  );

  if (stats.overBudget.length > 0) {
    console.warn(
      `[build-images] WARNING: ${stats.overBudget.length} output(s) still exceed the 250 KB budget ` +
        `after the full quality/width ladder — flagging for docs/13-IMAGE-BUDGET.md, not failing the build:`,
    );
    for (const item of stats.overBudget) {
      console.warn(`  ${item.label} (${item.format}) -> ${(item.bytes / 1024).toFixed(1)} KB @ ${item.width}px`);
    }
  } else {
    console.log('[build-images] every emitted file is within the 250 KB budget.');
  }
}

main().catch((err) => {
  console.error('[build-images] failed:', err);
  process.exitCode = 1;
});
