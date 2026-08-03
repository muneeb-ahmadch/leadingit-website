/**
 * Shared srcset math for the derivatives `scripts/build-images.mjs` writes
 * into `public/`, extracted out of `ResponsiveImage` so the `<picture>` it
 * renders and the `<link rel="preload">` `Seo.tsx` emits for the same image
 * are built from **one** function, not two hand-kept copies. A preload whose
 * URL doesn't byte-for-byte match what the `<picture>` element later requests
 * is worse than no preload — it double-fetches and Chrome warns — so this
 * file is the single source of truth for the naming convention documented in
 * `ResponsiveImage.tsx`'s header.
 */
import manifest from './image-manifest.generated.json';

export type ManifestEntry = { widths: number[]; height: number };
const MANIFEST = manifest as Record<string, ManifestEntry>;

/**
 * Throws — not a silent guess — exactly like `ResponsiveImage` used to inline.
 * Both the `<picture>` render path and the preload-link path call this, so an
 * asset missing from the manifest still fails the build no matter which path
 * reaches it first.
 */
export function getManifestEntry(src: string): ManifestEntry {
  const entry = MANIFEST[src];
  if (!entry) {
    throw new Error(
      `"${src}" is not in image-manifest.generated.json — run ` +
        `"node scripts/build-images.mjs" against raw/ and commit the regenerated manifest.`,
    );
  }
  return entry;
}

/** Exported so a caller that needs one specific derivative URL (`Seo.tsx`'s
 * preload-`href` fallback for browsers that ignore `imagesrcset`) can name it
 * without re-deriving the naming convention itself. */
export function withSuffix(src: string, width: number, largest: number, ext: 'avif' | 'webp') {
  const base = src.replace(/\.[a-z0-9]+$/i, '');
  return width === largest ? `${base}.${ext}` : `${base}-${width}.${ext}`;
}

export type SrcSet = { srcSet: string; largest: number; height: number; widths: number[] };

/** Builds the exact `srcset` string `ResponsiveImage` puts on its `<source>` for `ext`. */
export function buildSrcSet(src: string, ext: 'avif' | 'webp'): SrcSet {
  const { widths, height } = getManifestEntry(src);
  const largest = widths[widths.length - 1];
  const srcSet = widths.map((w) => `${withSuffix(src, w, largest, ext)} ${w}w`).join(', ');
  return { srcSet, largest, height, widths };
}

/**
 * Lighthouse's default mobile emulation profile — `formFactor: 'mobile'`,
 * `screenEmulation: { width: 412, deviceScaleFactor: 1.75 }` — is both this
 * project's graded CI budget and a reasonable stand-in for the mid-range
 * Android hardware common in the Dubai/Karachi audience. `buildLcpImagePreload()`
 * uses it to pick a single preload width via the same "smallest candidate
 * whose pixel width covers the viewport" density-selection rule `sizes`/
 * `srcset` itself uses.
 */
const PRELOAD_VIEWPORT_WIDTH = 412;
const PRELOAD_DEVICE_SCALE_FACTOR = 1.75;

export type LcpImagePreload = { href: string; type: 'image/avif' };

/**
 * The single `<link rel="preload" as="image">` target for a page's LCP
 * candidate — called by the *page* (`Home.tsx`, `BrandPage.tsx`, etc.), not
 * by `Seo.tsx`, so `Seo.tsx` never has to statically import this module (and
 * with it the ~260-entry image manifest): every current caller already
 * imports `ResponsiveImage`/this module to render the image itself, so the
 * manifest is already part of that page's chunk, and `Seo.tsx` — loaded on
 * every route, including the dozen-plus text-only ones with no `lcpImage` at
 * all — stays free of it. Moving this computation into `Seo.tsx` was tried
 * first and measured to add the whole manifest to `Seo.tsx`'s shared chunk;
 * see `docs/12-PROVENANCE/phase5-cwv-fixes.md`, "fix 2".
 *
 * **This deliberately preloads one fixed URL, computed by the density-based
 * `srcset` selection rule at a mobile viewport, rather than handing the
 * browser the full `imagesrcset`/`imagesizes` and letting *it* choose.** That
 * responsive form was tried first too and measured to regress LCP: Chrome
 * fetched the preload's `imagesrcset`-selected candidate **and** a second,
 * different-width AVIF for the `<picture>` element itself — two files instead
 * of one. See the same provenance entry.
 *
 * Requires `sizes`'s mobile-resolved (i.e. last, unconditional) branch to be
 * exactly `100vw` — true of every current caller — and throws rather than
 * silently mis-preloading if a future caller's mobile sizing differs.
 */
export function buildLcpImagePreload(src: string, sizes: string): LcpImagePreload {
  const mobileBranch = sizes.split(',').pop()?.trim();
  if (mobileBranch !== '100vw') {
    throw new Error(
      `buildLcpImagePreload: "${src}" has sizes="${sizes}", whose mobile-resolved branch is ` +
        `"${mobileBranch}", not "100vw" — the fixed-width preload heuristic only holds for a ` +
        `100vw mobile fallback. Extend it before adding this call site.`,
    );
  }
  const { widths, largest } = buildSrcSet(src, 'avif');
  const needed = PRELOAD_VIEWPORT_WIDTH * PRELOAD_DEVICE_SCALE_FACTOR;
  const width = widths.find((w) => w >= needed) ?? largest;
  return { href: withSuffix(src, width, largest, 'avif'), type: 'image/avif' };
}
