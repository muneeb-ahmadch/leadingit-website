/**
 * Per-template breadcrumb trails. Pure, no data imports — callers pass the
 * strings they already have (brand name/slug, product name/slug) from
 * whichever record they loaded.
 *
 * This is the single source of truth for both the visible breadcrumb UI and
 * `BreadcrumbList` JSON-LD (`src/seo/jsonld/breadcrumbList.ts`): a page
 * renders its breadcrumb nav by mapping over the same `Crumb[]` it hands to
 * `buildBreadcrumbList()`. That is the whole point — the UI and the schema
 * cannot drift apart if they are never built from two separate arrays.
 *
 * The last crumb is the current page. `buildBreadcrumbList()` includes it
 * with a real, self-referencing `item` URL (Google's accepted pattern); the
 * UI layer renders that same last entry as plain, non-link text instead of an
 * `<a>`/`<Link>` — never link a breadcrumb to the page the user is already on.
 *
 * `path` is a site-relative router path in the **internal form** — no trailing
 * slash (`src/seo/paths.ts`). It is never rendered as-is: `buildBreadcrumbList()`
 * turns it into an absolute `item` URL with `pageUrl()`, and `<Breadcrumbs>`
 * turns it into an anchor with `href()`. Both add the same trailing slash, which
 * is why the visible trail and the JSON-LD agree URL-for-URL as well as
 * name-for-name.
 */
import { KEYPAD_DESIGNER_PATH } from './paths';

export type Crumb = { name: string; path: string };

const HOME: Crumb = { name: 'Home', path: '/' };
const BRANDS: Crumb = { name: 'Brands', path: '/brands' };
const SOLUTIONS: Crumb = { name: 'Solutions', path: '/solutions' };
const BLACK_NOVA: Crumb = { name: 'Black Nova', path: '/brands/black-nova' };

/** Home → Brands → {brand.name}. */
export function brandHubCrumbs(brandName: string, brandSlug: string): Crumb[] {
  return [HOME, BRANDS, { name: brandName, path: `/brands/${brandSlug}` }];
}

/**
 * Home → Brands → {brand.name} → {product.name}. Used for both real product
 * pages and range pages (`blustream/dante`, `uandksound/reference-series`,
 * etc.) — the breadcrumb trail is identical either way; only the JSON-LD node
 * type for the page itself differs (Product vs CollectionPage, see
 * `src/seo/jsonld/product.ts` / `itemList.ts`).
 */
export function productCrumbs(
  brandName: string,
  brandSlug: string,
  productName: string,
  productSlug: string,
): Crumb[] {
  return [
    HOME,
    BRANDS,
    { name: brandName, path: `/brands/${brandSlug}` },
    { name: productName, path: `/brands/${brandSlug}/${productSlug}` },
  ];
}

/**
 * Home → Solutions → {solution.name}. The middle crumb is the real
 * `/solutions/` index page, not a synthetic label — it returns 200 and carries
 * the category-level intent (`docs/05-URL-TAXONOMY.md` §2a).
 */
export function solutionCrumbs(solutionName: string, solutionSlug: string): Crumb[] {
  return [HOME, SOLUTIONS, { name: solutionName, path: `/solutions/${solutionSlug}` }];
}

/**
 * Home → Brands → {brand.name} → Pakistan, for `/brands/<brand>/pakistan/`.
 *
 * The last crumb is the **country**, never a city — `docs/05-URL-TAXONOMY.md`
 * §5a/§6 and gate 4 of the §6 content test. The name is passed in by the caller
 * from `en.json`, and there is no parameter here a city could be threaded
 * through: the trail is brand + one fixed label.
 */
export function brandPakistanCrumbs(
  brandName: string,
  brandSlug: string,
  countryLabel: string,
): Crumb[] {
  return [
    HOME,
    BRANDS,
    { name: brandName, path: `/brands/${brandSlug}` },
    { name: countryLabel, path: `/brands/${brandSlug}/pakistan` },
  ];
}

/** Home → Brands → Black Nova → Keypad Designer. */
export function keypadDesignerCrumbs(): Crumb[] {
  return [HOME, BRANDS, BLACK_NOVA, { name: 'Keypad Designer', path: KEYPAD_DESIGNER_PATH }];
}

/**
 * Home → {page}. Used for `/lit-home`, `/about`, `/contact` and any other
 * flat top-level page.
 */
export function simplePageCrumbs(pageName: string, path: string): Crumb[] {
  return [HOME, { name: pageName, path }];
}

/**
 * Home has no breadcrumb at all — do not call any of the above for `/`, and
 * do not emit a single-item `BreadcrumbList` for it.
 * `buildBreadcrumbList()` in `src/seo/jsonld/breadcrumbList.ts` also refuses
 * (returns `null`) for fewer than 2 crumbs as a second line of defence.
 */
