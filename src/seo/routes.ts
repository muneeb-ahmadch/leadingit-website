/**
 * The route manifest — the single source of truth for every URL the site emits.
 *
 * Three consumers, no fourth:
 *   1. `scripts/gen-sitemap.mjs` (Node, prebuild) — sitemap.xml + robots.txt.
 *   2. `src/router.tsx`'s `getStaticPaths` — which files the prerender writes.
 *   3. The Phase 2 validation harness.
 * All three run in Node only. Page components must NOT import this module; they
 * import `./meta` and are handed their own record. Adding a fourth consumer is
 * how a route list drifts.
 *
 * The router reaches this module through an `import.meta.env.SSR`-guarded
 * dynamic `import()`, never a top-level one — a static import here is what put
 * the whole manifest in the browser entry chunk once already.
 *
 * ## Bundle rule (Phase 1 spent real effort on this — do not regress it)
 *
 * `src/data/products.ts` is ~3,500 lines. It must never reach the browser entry
 * chunk just so the build can enumerate URLs. Therefore:
 *   - the static route table below is a plain literal with no data import;
 *   - brand/product routes come from async functions that `await import()` the
 *     catalog, so Rollup keeps it in the split chunk the product pages already
 *     load;
 *   - nothing at this module's top level touches `@/data/*` at runtime — the
 *     `Brand`/`Product` imports are `import type` and are erased.
 * `getStaticPaths` only ever runs in Node during the prerender, so the dynamic
 * imports cost nothing at runtime.
 *
 * ## Scope
 *
 * This manifest describes routes that emit HTML **today**. `docs/05-URL-TAXONOMY.md`
 * locks several paths that are not built yet (`/journal/*`, the sixth solution
 * slug `industrial-automation`, and the disabled `/projects/*`). They are
 * deliberately absent: a sitemap entry for a URL that 404s is worse than no
 * entry. Adding them later is purely additive.
 *
 * `/brands/crestron/pakistan/` and `/brands/marantz/pakistan/` joined in Phase 4
 * once `docs/OPEN-QUESTIONS.md` #24 supplied the operational facts §6's content
 * gate requires. **Those two are the whole launch set** — see the cap comment on
 * `BRAND_PAKISTAN_PAGES` in `src/data/brandPakistan.ts`; adding the other seven
 * from the same template is the doorway pattern §6 exists to refuse.
 *
 * `/solutions/` and `/solutions/home-cinema/` joined in Phase 4. Five of the six
 * locked solution slugs are still unwritten and stay out until their page exists;
 * `shading` is not one of them — `/solutions/shading/` was retired 2026-07-31 and
 * 301s to `/solutions/` from `public/.htaccess`, so it must never re-enter this
 * manifest (`docs/05` §14).
 */
import type { Brand } from '@/data/brands';
import type { BrandPakistanPage } from '@/data/brandPakistan';
import type { Product } from '@/data/products';
import type { Solution } from '@/data/solutions';
import {
  DESCRIPTION_MAX_LENGTH,
  DESCRIPTION_MIN_LENGTH,
  TITLE_MAX_LENGTH,
  aboutMeta,
  brandMeta,
  brandPakistanMeta,
  brandsIndexMeta,
  contactMeta,
  homeMeta,
  keypadDesignerMeta,
  litHomeMeta,
  locationDubaiMeta,
  notFoundMeta,
  productMeta,
  solutionMeta,
  solutionsIndexMeta,
  tradeMeta,
  type PageMeta,
} from './meta';
import { KEYPAD_DESIGNER_PATH } from './paths';
import {
  RANGE_ROUTE_KEYS,
  SINGLE_PRODUCT_ACKNOWLEDGED,
  isFamilySpecLabel,
  isRangeProduct,
  rangeKey,
} from './ranges';

export type RouteKind =
  | 'home'
  | 'brands-index'
  | 'brand'
  | 'brand-pakistan'
  | 'product'
  | 'range'
  | 'solutions-index'
  | 'solution'
  | 'location'
  | 'trade'
  | 'tool'
  | 'lit-home'
  | 'about'
  | 'contact'
  | 'not-found';

export type RouteEntry = {
  /** Site-relative, lowercase, no trailing slash except the root `'/'`. */
  readonly path: string;
  readonly kind: RouteKind;
  /**
   * `false` only for `/404`, which is prerendered (Apache needs a real file for
   * `ErrorDocument`) and `noindex`, and must never enter the sitemap.
   */
  readonly indexable: boolean;
  readonly meta: PageMeta;
  /** Present on brand hubs, product/range pages and brand-scoped tools. */
  readonly brandSlug?: string;
  /** Present on product/range pages only. */
  readonly productSlug?: string;
};

/**
 * Words reserved inside the `/brands/<brand>/` namespace — `docs/05-URL-TAXONOMY.md`
 * §3d. A product using one of these as its slug would silently shadow a real
 * page (a product slugged `keypad-designer` takes out the configurator with no
 * error anywhere), so the manifest build fails on collision instead.
 *
 * **New reserved words go in this one list and nowhere else.**
 */
export const RESERVED_BRAND_CHILD_SLUGS: readonly string[] = [
  'pakistan',
  'keypad-designer',
  'dubai',
  'uae',
  'pk',
  'support',
  'downloads',
  'contact',
  'trade',
];

/**
 * Lowercase, hyphen-separated, at most three segments, no trailing slash, no
 * extension, no query — the formatting rules from `docs/05` §1 expressed as a
 * pattern so a typo cannot reach the sitemap.
 */
const PATH_PATTERN = /^\/[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*){0,2}$/;

/** Routes that need no catalog data. Order here is the order in the sitemap. */
export const STATIC_ROUTES: readonly RouteEntry[] = [
  { path: '/', kind: 'home', indexable: true, meta: homeMeta() },
  { path: '/brands', kind: 'brands-index', indexable: true, meta: brandsIndexMeta() },
  { path: '/solutions', kind: 'solutions-index', indexable: true, meta: solutionsIndexMeta() },
  {
    path: KEYPAD_DESIGNER_PATH,
    kind: 'tool',
    indexable: true,
    meta: keypadDesignerMeta(),
    brandSlug: 'black-nova',
  },
  // The one location page (`docs/05-URL-TAXONOMY.md` §5). `/locations/` itself
  // is not a route: there is no index while there is one premises, and
  // `public/.htaccess` 301s it here so a truncated URL never 404s. No other
  // `/locations/<city>/` may ever be added — see §5a.
  { path: '/locations/dubai', kind: 'location', indexable: true, meta: locationDubaiMeta() },
  // One page for T1, T2 and T3 (`docs/04-KEYWORD-MAP.md` §5). It is also the
  // single target of nine brand-hub links (`docs/05-URL-TAXONOMY.md` §12), which
  // is a structural reason not to split it into three thin pages later.
  { path: '/trade', kind: 'trade', indexable: true, meta: tradeMeta() },
  { path: '/lit-home', kind: 'lit-home', indexable: true, meta: litHomeMeta() },
  { path: '/about', kind: 'about', indexable: true, meta: aboutMeta() },
  { path: '/contact', kind: 'contact', indexable: true, meta: contactMeta() },
  { path: '/404', kind: 'not-found', indexable: false, meta: notFoundMeta() },
];

/** One prefix so every manifest failure is greppable in CI output. */
function manifestError(message: string): Error {
  return new Error(`route manifest: ${message}`);
}

async function loadBrands(): Promise<Brand[]> {
  const { BRANDS } = await import('@/data/brands');
  return BRANDS;
}

async function loadProducts(): Promise<Product[]> {
  const { PRODUCTS } = await import('@/data/products');
  return PRODUCTS;
}

async function loadSolutions(): Promise<Solution[]> {
  const { SOLUTIONS } = await import('@/data/solutions');
  return SOLUTIONS;
}

async function loadBrandPakistanPages(): Promise<BrandPakistanPage[]> {
  const { BRAND_PAKISTAN_PAGES } = await import('@/data/brandPakistan');
  return BRAND_PAKISTAN_PAGES;
}

/**
 * Retired route, permanently. `/solutions/shading/` was dropped on 2026-07-31
 * (`docs/OPEN-QUESTIONS.md` #22) because no shading product exists in the
 * catalogue, and `public/.htaccess` 301s it to `/solutions/`. Re-adding the
 * record would publish a URL that Apache redirects away from — a self-inflicted
 * redirect loop in the sitemap — so it fails the build here instead of being
 * caught in review. The retirement is reversible; reversing it means removing
 * this guard deliberately, with the redirect, in one change (`docs/05` §14).
 */
const RETIRED_SOLUTION_SLUGS: readonly string[] = ['shading'];

/** One entry per brand hub. */
export async function brandRoutes(): Promise<RouteEntry[]> {
  const brands = await loadBrands();
  return brands.map(
    (brand): RouteEntry => ({
      path: `/brands/${brand.slug}`,
      kind: 'brand',
      indexable: true,
      meta: brandMeta(brand),
      brandSlug: brand.slug,
    }),
  );
}

/**
 * One entry per `/brands/<brand>/pakistan/` page — the non-local
 * distribution-coverage template (`docs/05-URL-TAXONOMY.md` §6).
 *
 * Two records today, and §6 caps the launch set there. The parent brand must
 * exist, because the page's breadcrumb, its title and its whole cross-link
 * block are built from the brand hub: a PK page for a brand with no hub would
 * be an orphan whose breadcrumb points at a 404.
 *
 * `'pakistan'` is in `RESERVED_BRAND_CHILD_SLUGS` above, so `productRoutes()`
 * already refuses to author a product at any of these paths — the two route
 * families can never write the same file.
 */
export async function brandPakistanRoutes(): Promise<RouteEntry[]> {
  const [brands, pages] = await Promise.all([loadBrands(), loadBrandPakistanPages()]);
  const brandSlugs = new Set(brands.map((brand) => brand.slug));

  return pages.map((page): RouteEntry => {
    if (!brandSlugs.has(page.brandSlug)) {
      throw manifestError(
        `brand-pakistan page references unknown brand "${page.brandSlug}" — every ` +
          `/brands/<brand>/pakistan/ page needs a parent hub that returns 200, because its ` +
          `breadcrumb and cross-links are built from it. Fix the brandSlug in ` +
          `src/data/brandPakistan.ts, or add the brand to src/data/brands.ts.`,
      );
    }
    return {
      path: `/brands/${page.brandSlug}/pakistan`,
      kind: 'brand-pakistan',
      indexable: true,
      meta: brandPakistanMeta(page),
      brandSlug: page.brandSlug,
    };
  });
}

/**
 * One entry per solution page. Six slugs are locked in `docs/05-URL-TAXONOMY.md`
 * §2; only the records actually authored in `src/data/solutions.ts` get a route,
 * because a route in this manifest is a promise that the URL returns 200 and
 * enters the sitemap.
 */
export async function solutionRoutes(): Promise<RouteEntry[]> {
  const solutions = await loadSolutions();
  return solutions.map((solution): RouteEntry => {
    if (RETIRED_SOLUTION_SLUGS.includes(solution.slug)) {
      throw manifestError(
        `solution "${solution.slug}" is a retired route (docs/05-URL-TAXONOMY.md §14) — ` +
          `public/.htaccess 301s /solutions/${solution.slug}/ to /solutions/, so publishing it ` +
          `here would put a redirected URL in the sitemap. Remove the record from ` +
          `src/data/solutions.ts, or reverse the retirement and the redirect together.`,
      );
    }
    return {
      path: `/solutions/${solution.slug}`,
      kind: 'solution',
      indexable: true,
      meta: solutionMeta(solution),
    };
  });
}

/**
 * One entry per product route. `kind` is `'range'` for the nine records that
 * describe a family rather than a SKU (see `./ranges`) — those must never
 * receive `Product` JSON-LD.
 */
export async function productRoutes(): Promise<RouteEntry[]> {
  const [brands, products] = await Promise.all([loadBrands(), loadProducts()]);
  const brandBySlug = new Map(brands.map((brand) => [brand.slug, brand]));

  return products.map((product): RouteEntry => {
    const brand = brandBySlug.get(product.brandSlug);
    if (!brand) {
      throw manifestError(
        `product "${product.slug}" references unknown brand "${product.brandSlug}" — ` +
          `add the brand to src/data/brands.ts or correct the brandSlug`,
      );
    }
    if (RESERVED_BRAND_CHILD_SLUGS.includes(product.slug)) {
      throw manifestError(
        `product "${product.brandSlug}/${product.slug}" uses the reserved child slug ` +
          `"${product.slug}". Reserved words in the /brands/<brand>/ namespace ` +
          `(docs/05-URL-TAXONOMY.md §3d) are: ${RESERVED_BRAND_CHILD_SLUGS.join(', ')}. ` +
          `Rename the product slug — a collision here silently shadows a real page.`,
      );
    }
    // Derived range signal, checked against the hand-maintained registry.
    //
    // `./ranges` is an allow-list, and `assertManifest()` only validates it in
    // one direction: it catches a key that names no product. Nothing caught the
    // opposite and more dangerous case — a product that IS a range but was never
    // added to the list, which then ships `Product` JSON-LD for a family with no
    // single model, MPN or offer. A QA audit found exactly that on
    // `basalte/aalto`, which had been emitting Product markup while declaring a
    // `Range` spec table listing four form factors and a separate flagship.
    //
    // A `Range`-labelled spec group is the catalog's own way of saying "this
    // record describes a family". Treat it as authoritative and fail the build
    // when it disagrees with the registry, so the next range that gets authored
    // cannot silently skip registration. This asserts one direction only: a
    // range need not carry a `Range` spec group (the six uandksound series do
    // not), it just may not carry one while going unregistered.
    const familyLabel = product.specs.find((group) => isFamilySpecLabel(group.label))?.label;
    const key = rangeKey(product.brandSlug, product.slug);
    if (
      familyLabel &&
      !isRangeProduct(product.brandSlug, product.slug) &&
      !(key in SINGLE_PRODUCT_ACKNOWLEDGED)
    ) {
      throw manifestError(
        `product "${key}" declares a "${familyLabel}" spec group — the catalog's own way of ` +
          `saying this record covers more than one model — but it is neither registered in ` +
          `RANGE_ROUTE_KEYS nor listed in SINGLE_PRODUCT_ACKNOWLEDGED (both in ` +
          `src/seo/ranges.ts). Left unresolved it publishes a family of models to Google as one ` +
          `purchasable SKU. Either add it to RANGE_ROUTE_KEYS, or add it to ` +
          `SINGLE_PRODUCT_ACKNOWLEDGED with the reason it really is a single product.`,
      );
    }

    return {
      path: `/brands/${product.brandSlug}/${product.slug}`,
      kind: isRangeProduct(product.brandSlug, product.slug) ? 'range' : 'product',
      indexable: true,
      meta: productMeta(product, brand),
      brandSlug: product.brandSlug,
      productSlug: product.slug,
    };
  });
}

/**
 * Every invariant that must hold across the whole manifest. It runs inside
 * `allRoutes()`, so both consumers (prerender and sitemap) inherit it and there
 * is no way to build the site around it.
 *
 * Throws rather than warns: a duplicate URL, an overflowing title or a
 * duplicated meta description is a defect that must break the build, not appear
 * in a log nobody reads.
 */
export function assertManifest(entries: readonly RouteEntry[]): void {
  const seenPath = new Set<string>();
  const titleOwner = new Map<string, string>();
  const descriptionOwner = new Map<string, string>();

  // Every declared range key must name a product route that actually exists.
  // Without this, a typo in `./ranges` (`uandksound/m8series`) fails silently in
  // the worst possible direction: the route stays `kind: 'product'`, the page
  // receives `Product` JSON-LD, and a product range is published to Google as a
  // purchasable SKU. Nothing else in the build would notice.
  const productRouteKeys = new Set(
    entries
      .filter((entry) => entry.brandSlug && entry.productSlug)
      .map((entry) => rangeKey(entry.brandSlug!, entry.productSlug!)),
  );
  const orphanedRangeKeys = RANGE_ROUTE_KEYS.filter((key) => !productRouteKeys.has(key));
  if (orphanedRangeKeys.length > 0) {
    throw manifestError(
      `src/seo/ranges.ts declares ${orphanedRangeKeys.length} range key(s) with no matching ` +
        `product route: ${orphanedRangeKeys.join(', ')}. A range key that matches nothing ` +
        `silently leaves that page typed as a product, which ships Product JSON-LD for a ` +
        `range. Fix the key or remove it.`,
    );
  }

  for (const entry of entries) {
    const { path, meta } = entry;

    if (path !== '/' && !PATH_PATTERN.test(path)) {
      throw manifestError(
        `"${path}" is not a legal path — lowercase, hyphen-separated, at most three ` +
          `segments, leading slash, no trailing slash (docs/05-URL-TAXONOMY.md §1)`,
      );
    }
    if (seenPath.has(path)) throw manifestError(`duplicate path "${path}"`);
    seenPath.add(path);

    if (meta.path !== path) {
      throw manifestError(`"${path}" carries metadata for a different path ("${meta.path}")`);
    }

    if (meta.title.length === 0) throw manifestError(`"${path}" has an empty title`);
    if (meta.title.length > TITLE_MAX_LENGTH) {
      throw manifestError(
        `"${path}" title is ${meta.title.length} chars (max ${TITLE_MAX_LENGTH}): ` +
          `"${meta.title}" — change the formula in src/seo/meta.ts, never truncate`,
      );
    }
    const titleTwin = titleOwner.get(meta.title);
    if (titleTwin) {
      throw manifestError(`"${path}" and "${titleTwin}" share the title "${meta.title}"`);
    }
    titleOwner.set(meta.title, path);

    if (meta.description.length > DESCRIPTION_MAX_LENGTH) {
      throw manifestError(
        `"${path}" description is ${meta.description.length} chars ` +
          `(max ${DESCRIPTION_MAX_LENGTH}): "${meta.description}"`,
      );
    }
    if (meta.description.length < DESCRIPTION_MIN_LENGTH) {
      throw manifestError(
        `"${path}" description is ${meta.description.length} chars ` +
          `(min ${DESCRIPTION_MIN_LENGTH}): "${meta.description}"`,
      );
    }
    const descriptionTwin = descriptionOwner.get(meta.description);
    if (descriptionTwin) {
      throw manifestError(`"${path}" and "${descriptionTwin}" share a meta description`);
    }
    descriptionOwner.set(meta.description, path);
  }
}

let manifest: Promise<RouteEntry[]> | null = null;

async function buildManifest(): Promise<RouteEntry[]> {
  const entries = [
    ...STATIC_ROUTES,
    ...(await brandRoutes()),
    ...(await productRoutes()),
    ...(await brandPakistanRoutes()),
    ...(await solutionRoutes()),
  ];
  assertManifest(entries);
  return entries;
}

/**
 * The whole manifest, validated. Memoised because both `getStaticPaths` calls
 * and the sitemap generator ask for it within one process.
 */
export function allRoutes(): Promise<RouteEntry[]> {
  if (!manifest) manifest = buildManifest();
  return manifest;
}

/** Everything that belongs in sitemap.xml: indexable routes only, so no `/404`. */
export async function sitemapRoutes(): Promise<RouteEntry[]> {
  return (await allRoutes()).filter((route) => route.indexable);
}

/** Solution page paths for the router's `getStaticPaths`. */
export async function solutionPaths(): Promise<string[]> {
  return (await allRoutes()).filter((route) => route.kind === 'solution').map((route) => route.path);
}

/** Brand hub paths for the router's `getStaticPaths`. */
export async function brandPaths(): Promise<string[]> {
  return (await allRoutes()).filter((route) => route.kind === 'brand').map((route) => route.path);
}

/**
 * `/brands/<brand>/pakistan/` paths for the router's `getStaticPaths`.
 *
 * Its route pattern (`/brands/:slug/pakistan`) has a static last segment, which
 * React Router ranks above `/brands/:slug/:productSlug`, so the two never
 * compete for the same file — the same mechanism that keeps the keypad designer
 * out of the product template.
 */
export async function brandPakistanPaths(): Promise<string[]> {
  return (await allRoutes())
    .filter((route) => route.kind === 'brand-pakistan')
    .map((route) => route.path);
}

/**
 * Product and range paths for the router's `getStaticPaths`.
 *
 * The keypad designer is filtered out explicitly: it is a static route that
 * wins over `/brands/:slug/:productSlug`, and emitting it from both route
 * records would have two of them writing the same file. The reserved-slug guard
 * in `productRoutes()` already makes that collision impossible — this filter is
 * belt-and-braces, and both stay.
 */
export async function productPaths(): Promise<string[]> {
  return (await allRoutes())
    .filter((route) => route.kind === 'product' || route.kind === 'range')
    .map((route) => route.path)
    .filter((path) => path !== KEYPAD_DESIGNER_PATH);
}
