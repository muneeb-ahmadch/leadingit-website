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
  // Blustream sells these three as ranges of encoders/decoders/matrices, not as
  // one orderable unit — the records' own spec tables are "Range" tables.
  'blustream/dante',
  'blustream/wireless-byod',
  'blustream/video-over-ip',
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
