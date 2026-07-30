/**
 * Renders a `<picture>` sourced from the derivatives `scripts/build-images.mjs`
 * writes into `public/`: an AVIF source, a WebP source, and a raster `<img>`
 * fallback — always with explicit `width`/`height` (CLS) and, for the single
 * LCP candidate on a page, `fetchpriority="high"` + eager loading.
 *
 * On-disk convention this component assumes (documented alongside the
 * generator in `scripts/build-images.mjs`), for a `src` of `/products/x/y.jpg`:
 *   /products/x/y.jpg          -- compressed raster fallback (`<img src>`)
 *   /products/x/y.avif         -- AVIF at the asset's largest emitted width
 *   /products/x/y.webp         -- WebP at the asset's largest emitted width
 *   /products/x/y-{w}.avif     -- smaller AVIF variant at width `w`
 *   /products/x/y-{w}.webp     -- smaller WebP variant at width `w`
 *
 * Intrinsic `width`/`height` and the exact srcset `widths` ladder are never
 * hand-typed by callers — they are read from `image-manifest.generated.json`,
 * which `scripts/build-images.mjs` emits and commits alongside the derivatives
 * themselves (`raw/` does not exist in CI, so this file is the only source of
 * truth there). An asset missing from the manifest is a build-time throw, not
 * a silent guess: guessing dimensions is exactly the CLS bug this component
 * exists to prevent.
 */
import manifest from './image-manifest.generated.json';

type ManifestEntry = { widths: number[]; height: number };
const MANIFEST = manifest as Record<string, ManifestEntry>;

type Props = {
  /** Path to the raster fallback, e.g. `/products/uandksound/cinema-theatre.jpg`. */
  src: string;
  alt: string;
  /** `sizes` attribute — required whenever the asset has more than one emitted width. */
  sizes?: string;
  className?: string;
  /** Marks this as the page's LCP image: fetchpriority=high + eager + sync decode. */
  priority?: boolean;
};

function withSuffix(src: string, width: number, largest: number, ext: 'avif' | 'webp') {
  const base = src.replace(/\.[a-z0-9]+$/i, '');
  return width === largest ? `${base}.${ext}` : `${base}-${width}.${ext}`;
}

export function ResponsiveImage({ src, alt, sizes, className, priority = false }: Props) {
  const entry = MANIFEST[src];
  if (!entry) {
    throw new Error(
      `ResponsiveImage: "${src}" is not in image-manifest.generated.json — run ` +
        `"node scripts/build-images.mjs" against raw/ and commit the regenerated manifest.`,
    );
  }
  const { widths, height } = entry;
  if (widths.length > 1 && !sizes) {
    throw new Error(`ResponsiveImage: "${src}" has ${widths.length} widths and needs a "sizes" prop.`);
  }
  const largest = widths[widths.length - 1];
  const avifSrcSet = widths.map((w) => `${withSuffix(src, w, largest, 'avif')} ${w}w`).join(', ');
  const webpSrcSet = widths.map((w) => `${withSuffix(src, w, largest, 'webp')} ${w}w`).join(', ');

  return (
    <picture>
      <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} />
      <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
      <img
        src={src}
        width={largest}
        height={height}
        alt={alt}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : undefined}
      />
    </picture>
  );
}
