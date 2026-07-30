/**
 * URL-shape rules that are safe to ship to the browser.
 *
 * `./routes.ts` is the route *manifest*: it enumerates the whole catalog and
 * must never reach the entry chunk. This module is its opposite — pure string
 * rules and one path constant, **zero imports**, so the router, every component
 * and every page can import it for free.
 *
 * ## The trailing-slash convention (docs/05-URL-TAXONOMY.md §1/§4)
 *
 * One route, two deliberately different representations:
 *
 * - **Internal form, no trailing slash** — `/brands/marantz`. What the manifest
 *   stores, what `PageMeta.path` and `Crumb.path` carry, and the form React
 *   Router's route patterns are declared in (`/brands/:slug`). It is a matching
 *   key, never a rendered value.
 * - **Rendered form, trailing slash** — `/brands/marantz/`. What every
 *   `<a href>` / `<Link to>` on the site emits, what `pageUrl()` in
 *   `./jsonld/ids.ts` builds canonicals and JSON-LD `url`/`item` values from,
 *   and what `sitemap.xml` lists.
 *
 * The two must never appear in the same role. Apache's `mod_dir DirectorySlash`
 * 301s the slashless form to the slashed one, so an anchor rendered in the
 * internal form turns every internal click into a redirect hop, wastes crawl
 * budget on ~2,000 needless 301s, and makes the visible breadcrumb trail
 * disagree with the `BreadcrumbList` URLs it exists to mirror.
 *
 * **The rule: anything that ends up in a `to`/`href` attribute goes through
 * `href()`.** Nothing anywhere else adds or strips a trailing slash by hand.
 */

/**
 * A last segment that looks like a filename (`/og-default.jpg`,
 * `/sitemap.xml`). Those are static assets served by Apache as files — adding a
 * trailing slash to one produces a 404, so `href()` leaves them alone.
 */
const FILE_SEGMENT = /\.[a-z0-9]+$/i;

/** Where the query string or fragment starts, if there is one. */
const QUERY_OR_HASH = /[?#]/;

/**
 * Render a site-relative path as the canonical, trailing-slash URL an anchor
 * should point at. The single conversion point between the two forms above.
 *
 * Idempotent (`href(href(x)) === href(x)`), and a no-op for anything that is not
 * a site-relative route path: absolute and protocol-relative URLs, `mailto:` and
 * `tel:`, bare `#fragment` links, and asset paths. A query string or fragment is
 * preserved after the slash — `/contact?m=1` becomes `/contact/?m=1`, because
 * the slash belongs to the path, not to the URL as a whole.
 */
export function href(to: string): string {
  if (!to.startsWith('/') || to.startsWith('//')) return to;

  const split = to.search(QUERY_OR_HASH);
  const path = split === -1 ? to : to.slice(0, split);
  const suffix = split === -1 ? '' : to.slice(split);

  if (path.endsWith('/') || FILE_SEGMENT.test(path)) return to;
  return `${path}/${suffix}`;
}

/**
 * Static tool route inside the Black Nova brand namespace, in internal form.
 *
 * It lives here rather than in the manifest because `src/router.tsx` needs it to
 * declare the route, and the router must not import the manifest. React Router
 * ranks static segments above dynamic ones, so it always wins over
 * `/brands/:slug/:productSlug`; `RESERVED_BRAND_CHILD_SLUGS` in `./routes.ts`
 * additionally reserves `keypad-designer`, so no product can ever be authored at
 * the same path.
 */
export const KEYPAD_DESIGNER_PATH = '/brands/black-nova/keypad-designer';
