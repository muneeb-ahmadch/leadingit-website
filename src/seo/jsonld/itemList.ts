import type { Brand } from '@/data/brands';
import type { Product } from '@/data/products';
import { absoluteUrl } from '@/lib/site';
import type { JsonLdNode } from './types';
import { pageUrl } from './ids';
import type { WebPageInput } from './webpage';
import { buildWebPage } from './webpage';

export type ItemListEntry = {
  name: string;
  /** Site-relative page path (no trailing slash needed — `pageUrl()` adds it). */
  url: string;
  image?: string;
};

/**
 * Only ever assert a first-party image in JSON-LD — the same rule
 * `src/seo/meta.ts`'s `ownImage()` applies to `og:image` (a site-relative path
 * is genuinely ours; anything else is not) mirrored here rather than
 * reinvented. Unlike `ownImage()`, there is no "fall back to a default": a
 * `ListItem` with no `image` is a valid, safe entry; a stock photo (several
 * `Brand.heroImage` values in `src/data/brands.ts` are still Unsplash
 * hotlinks — docs/OPEN-QUESTIONS.md #4) asserted, machine-readably, as a
 * photograph of the Crestron/Blustream/Basalte/JVC entity is not — that is
 * fabricating a value to fill a schema property, which CLAUDE.md forbids
 * outright. An absent `image` is safe; a borrowed one is a liability.
 */
function firstPartyImage(src: string | undefined): string | undefined {
  return src && src.startsWith('/') ? src : undefined;
}

/**
 * Generic `ItemList` node. Returns `null` for an empty list rather than
 * emitting `itemListElement: []` — an empty list is a Rich Results warning
 * waiting to happen, and every current caller has a real, non-empty set of
 * entries anyway.
 *
 * `entry.url` is run through `pageUrl()`, not `absoluteUrl()`, so every
 * `ListItem.url` carries the same trailing slash as its page's own canonical
 * URL (docs/05-URL-TAXONOMY.md §1) — `image` stays on `absoluteUrl()` since a
 * file must never gain a trailing slash.
 */
export function buildItemList(id: string, entries: ItemListEntry[], name?: string): JsonLdNode | null {
  if (entries.length === 0) return null;

  return {
    '@type': 'ItemList',
    '@id': id,
    ...(name ? { name } : {}),
    numberOfItems: entries.length,
    itemListElement: entries.map((entry, i) => {
      const image = firstPartyImage(entry.image);
      return {
        '@type': 'ListItem',
        position: i + 1,
        name: entry.name,
        url: pageUrl(entry.url),
        ...(image ? { image: absoluteUrl(image) } : {}),
      };
    }),
  };
}

/** `ItemList` of every brand hub, for the `/brands/` index page. */
export function buildBrandsItemList(brands: Brand[]): JsonLdNode | null {
  return buildItemList(
    `${pageUrl('/brands')}#brand-list`,
    brands.map((brand) => ({ name: brand.name, url: `/brands/${brand.slug}`, image: brand.heroImage })),
    'Brands distributed by Leading IT',
  );
}

/**
 * `ItemList` of a single brand's product and range pages, for that brand's
 * hub page. Pass every entry from `productsForBrand(brand.slug)` — ranges are
 * included here by URL/name only (an `ItemList` entry is not a `Product`
 * claim), even though their own pages must not carry `Product` JSON-LD.
 */
export function buildBrandProductsItemList(brand: Brand, products: Product[]): JsonLdNode | null {
  return buildItemList(
    `${pageUrl(`/brands/${brand.slug}`)}#product-list`,
    products.map((product) => ({
      name: product.name,
      url: `/brands/${brand.slug}/${product.slug}`,
      image: product.hero,
    })),
    `${brand.name} products`,
  );
}

/**
 * `CollectionPage` node for `/brands/`, brand hubs and range pages
 * (`blustream/{dante,wireless-byod,video-over-ip}`,
 * `uandksound/{reference-series,m8-series,m6-series,s-series,e-series,m-series}`).
 * Thin wrapper over `webpage.ts`'s generic builder with `type: 'CollectionPage'`
 * fixed, plus an optional `mainEntity` link to an `ItemList` node.
 *
 * Range pages today have no child SKU records to list (each range entry in
 * `src/data/products.ts` describes itself directly; there is no nested array
 * of individual models) — call this with `itemListId` omitted for those pages.
 * A bare `CollectionPage` with no `mainEntity` is valid schema.org; it is not
 * a substitute ItemList of fabricated child items.
 */
export function buildCollectionPage(
  input: Omit<WebPageInput, 'type'>,
  itemListId?: string,
): JsonLdNode {
  const node = buildWebPage({ ...input, type: 'CollectionPage' });
  if (itemListId) node.mainEntity = { '@id': itemListId };
  return node;
}
