import type { Brand } from '@/data/brands';
import type { Product } from '@/data/products';
import { absoluteUrl } from '@/lib/site';
import { isRangeProduct } from '../ranges';
import type { JsonLdNode } from './types';
import { brandId, pageUrl, productId } from './ids';

/**
 * `Product` JSON-LD for a single SKU page (`/brands/<brand>/<product>/`).
 *
 * Returns `null` for range/collection entries — ranges are not purchasable
 * SKUs and must not receive `Product` markup; use `itemList.ts`'s
 * `buildCollectionPage` for those pages instead. The range/SKU distinction is
 * NOT a field on `Product` (the type has none): it is decided by the
 * `<brandSlug>/<productSlug>` registry in `src/seo/ranges.ts`
 * (`isRangeProduct()`), which is also what `src/seo/meta.ts` reads — one
 * source of truth for both layers, not a per-builder guess. This check is a
 * defence-in-depth guard: the calling page is expected to branch on
 * `isRangeProduct()` *before* deciding which builder to call at all, but the
 * guard means a caller that forgets cannot accidentally ship a range as a
 * `Product`.
 *
 * Deliberately omitted, always:
 * - `offers` — no user-approved pricing stance exists yet (CLAUDE.md,
 *   docs/OPEN-QUESTIONS.md). Never default to a price or `InStock`.
 * - `sku` / `mpn` / `gtin` — no record in `src/data/products.ts` carries a
 *   manufacturer part number today. Never synthesise one from the slug.
 * - Any "authorized dealer" wording — `brand`/`manufacturer` here name the
 *   entity only; the authorisation claim itself is gated on
 *   docs/OPEN-QUESTIONS.md #3.
 */
export function buildProduct(product: Product, brand: Brand): JsonLdNode | null {
  if (isRangeProduct(product.brandSlug, product.slug)) {
    console.warn(
      `[seo/jsonld/product] buildProduct() called for range "${product.brandSlug}/${product.slug}" — ` +
        'ranges are not Products; use itemList.ts buildCollectionPage() for this page instead.',
    );
    return null;
  }

  const images = Array.from(
    new Set([product.hero, ...product.finishes.map((finish) => finish.productImage)].filter(Boolean)),
  ).map((src) => absoluteUrl(src));

  const additionalProperty = product.specs.flatMap((group) =>
    group.rows.map((row) => ({
      '@type': 'PropertyValue',
      name: `${group.label}: ${row.name}`,
      value: row.value,
    })),
  );

  const node: JsonLdNode = {
    '@type': 'Product',
    '@id': productId(product.brandSlug, product.slug),
    name: product.name,
    description: product.metaDescription ?? product.description,
    image: images,
    url: pageUrl(`/brands/${product.brandSlug}/${product.slug}`),
    category: product.collection,
    brand: { '@id': brandId(brand.slug) },
    // A distinct inline stub, not a reference to the Brand node: schema.org's
    // `Brand` type is an `Intangible`, not an `Organization`, so pointing
    // `manufacturer` (range `Organization`) at the same `@id` as `brand`
    // (range `Organization | Brand`) would be a type mismatch. The brand's
    // trade name doubles as the manufacturer name here — no separate legal
    // manufacturer entity is confirmed, and none is claimed.
    manufacturer: { '@type': 'Organization', name: brand.name },
  };

  if (product.finishes.length > 0) {
    node.color = product.finishes.map((finish) => finish.name);
  }
  if (additionalProperty.length > 0) {
    node.additionalProperty = additionalProperty;
  }

  return node;
}
