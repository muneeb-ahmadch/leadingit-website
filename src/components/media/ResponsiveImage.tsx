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
 * `widths` must be the exact widths the pipeline produced for this asset,
 * ascending, with the last entry equal to the image's real (capped) intrinsic
 * width — that largest entry maps to the unsuffixed `.avif`/`.webp` file, every
 * smaller one maps to the `-{w}` suffixed file. Passing a width the pipeline
 * did not emit will 404 that `<source>` candidate; there is no runtime
 * fallback for a mismatch, by design, so it fails loudly during development.
 */
type Props = {
  /** Path to the raster fallback, e.g. `/products/uandksound/cinema-theatre.jpg`. */
  src: string;
  /** Ascending widths this exact asset was generated at (see doc comment above). */
  widths: number[];
  /** Real intrinsic height at `widths[widths.length - 1]`, for the CLS box. */
  height: number;
  alt: string;
  /** `sizes` attribute — required whenever `widths` has more than one entry. */
  sizes?: string;
  className?: string;
  /** Marks this as the page's LCP image: fetchpriority=high + eager + sync decode. */
  priority?: boolean;
};

function withSuffix(src: string, width: number, largest: number, ext: 'avif' | 'webp') {
  const base = src.replace(/\.[a-z0-9]+$/i, '');
  return width === largest ? `${base}.${ext}` : `${base}-${width}.${ext}`;
}

export function ResponsiveImage({ src, widths, height, alt, sizes, className, priority = false }: Props) {
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
