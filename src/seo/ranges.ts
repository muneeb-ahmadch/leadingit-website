/**
 * Product records that describe a RANGE — a family of models sold as one line —
 * rather than a single purchasable SKU.
 *
 * Why this distinction is data and not a per-page judgement call: a range page
 * has no single model, no single MPN and no single offer, so it must never
 * receive `Product` JSON-LD. It gets `CollectionPage` + `ItemList` instead (see
 * `.claude/skills/schema-jsonld/SKILL.md`). Emitting `Product` on a range is a
 * structured-data violation the Rich Results Test flags, and it is exactly the
 * kind of thing that silently regresses when a new range is added, so the nine
 * routes are enumerated here once and both the metadata layer and the schema
 * layer read the same list.
 *
 * It lives in its own data-free module (no `@/data/*` import) so that a page
 * component, the metadata builders and the route manifest can all ask the
 * question without pulling the 3,500-line product catalog into their chunk.
 *
 * Keys are `<brandSlug>/<productSlug>` — the same pair that forms the URL, so a
 * key is checkable against `docs/05-URL-TAXONOMY.md` by eye.
 *
 * To add a range: add its `<brandSlug>/<productSlug>` key here. Nothing else.
 */
export const RANGE_ROUTE_KEYS: readonly string[] = [
  // Basalte's Aalto is a speaker *collection*, not a model: its own spec table
  // is a `Range` table listing four form factors (in-wall, on-wall, freestanding,
  // soundbars) plus a separate flagship, `Aalto F5`. That is the identical shape
  // to `blustream/dante` below — those two records are the only ones in the
  // catalog carrying a `label: 'Range'` spec group. It was emitting `Product`
  // JSON-LD for a family with no single model, MPN or offer until a QA audit
  // caught it.
  'basalte/aalto',
  // Blustream sells these three as ranges of encoders/decoders/matrices, not as
  // one orderable unit — the records' own spec tables are "Range" tables.
  'blustream/dante',
  'blustream/wireless-byod',
  'blustream/video-over-ip',
  // Four of the five Black Nova pages are collections, not models. The
  // manufacturer's own pages carry a "<COLLECTION> | Product Layouts" section
  // (ALBA 2/4/6/8/M1, ARIA M1/12/Slider, AXES TT/9/CH/DR/KN/N3, Black Jack
  // 2/4/6/8/M1 × ROUND/SQUARE), and its downloads layer publishes 37 separate
  // per-model datasheets with distinct dimensions, weights, button counts and
  // finish sets. One `Product` node cannot honestly describe 17 ALBA models.
  // No order code, SKU or MPN is published anywhere on blacknova.co, so there
  // is nothing to identify a single unit with either.
  //
  // `any` is deliberately NOT here: it is the one Black Nova page with no
  // layouts section on the manufacturer's site and a single spec set, so it is
  // a genuine single product and keeps its `Product` node.
  'black-nova/alba',
  'black-nova/aria',
  'black-nova/axes',
  'black-nova/black-jack',
  // Every uandksound entry is a loudspeaker series; individual models within a
  // series are not catalogued as separate routes.
  'uandksound/reference-series',
  'uandksound/m8-series',
  'uandksound/m6-series',
  'uandksound/s-series',
  'uandksound/e-series',
  'uandksound/m-series',
];

const RANGE_ROUTE_SET: ReadonlySet<string> = new Set(RANGE_ROUTE_KEYS);

/** The manifest/registry key for a product route. */
export function rangeKey(brandSlug: string, productSlug: string): string {
  return `${brandSlug}/${productSlug}`;
}

/**
 * True when `/brands/<brandSlug>/<productSlug>/` is a range page. Callers must
 * use this instead of guessing from the slug — `m8-series` and `reserve-r700`
 * are not distinguishable by shape.
 */
export function isRangeProduct(brandSlug: string, productSlug: string): boolean {
  return RANGE_ROUTE_SET.has(rangeKey(brandSlug, productSlug));
}
