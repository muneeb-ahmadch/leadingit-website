/**
 * Product records that describe a RANGE — a family of models sold as one line —
 * rather than a single purchasable SKU.
 *
 * Why this distinction is data and not a per-page judgement call: a range page
 * has no single model, no single MPN and no single offer, so it must never
 * receive `Product` JSON-LD. It gets `CollectionPage` + `ItemList` instead (see
 * `.claude/skills/schema-jsonld/SKILL.md`). Emitting `Product` on a range is a
 * structured-data violation the Rich Results Test flags, and it is exactly the
 * kind of thing that silently regresses when a new range is added, so the range
 * routes are enumerated here once and both the metadata layer and the schema
 * layer read the same list. Deliberately no count is stated in this comment —
 * the list grows and shrinks (see the S Series retirement below) and a stated
 * count goes stale silently; `RANGE_ROUTE_KEYS.length` is the only truth.
 *
 * It lives in its own data-free module (no `@/data/*` import) so that a page
 * component, the metadata builders and the route manifest can all ask the
 * question without pulling the 3,500-line product catalog into their chunk.
 *
 * Keys are `<brandSlug>/<productSlug>` — the same pair that forms the URL, so a
 * key is checkable against `docs/05-URL-TAXONOMY.md` by eye.
 *
 * To add a range: add its `<brandSlug>/<productSlug>` key here. Nothing else.
 * To retire one: the product record in `src/data/products.ts` and the key here
 * must go in the same change — `assertManifest()` in `./routes.ts` fails the
 * build on a key that names no product route, and (in the other direction) on a
 * family-labelled product that is not registered here.
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
  // Two in-wall speakers, not one: the record's own description calls Plano "a
  // unique collection", and its Models spec group lists Plano R3 (compact,
  // surround duty) and Plano R5 (reference, front stage) — different drivers,
  // different roles. It was shipping one Product node for both.
  'basalte/plano',
  // Every uandksound entry is a loudspeaker series; individual models within a
  // series are not catalogued as separate routes.
  //
  // `uandksound/s-series` was removed on 2026-07-31: all three models (S6 I,
  // S6 II, S1200 I) are listed under Discontinued Products on the manufacturer's
  // own site and the series is absent from its live collections tree, so the
  // route was retired (Muneeb, OQ #21) and 301s to /brands/uandksound/ in
  // public/.htaccess. Do not re-add without a live model at source.
  //
  // `uandksound/m-series` STAYS. It was reviewed in the same pass and is
  // deliberately retained: M4500D is still current, so the page presents one
  // current model while remaining a series-level range route. A range with a
  // single surviving member is still a range — it must not be "tidied" into a
  // Product node, because the series is the thing being sold and the record has
  // no single MPN or offer.
  'uandksound/reference-series',
  'uandksound/m8-series',
  'uandksound/m6-series',
  'uandksound/e-series',
  'uandksound/m-series',
];

const RANGE_ROUTE_SET: ReadonlySet<string> = new Set(RANGE_ROUTE_KEYS);

/**
 * Spec-group labels that mean "this record describes more than one model".
 *
 * The catalog announces a family in its own spec table, but it does not use one
 * word for it — `Range`, `Models`, `Layouts` and `Variants` are all in use. The
 * first version of the build guard matched only `range`, which is why it caught
 * `basalte/aalto` and would have caught none of the four Black Nova collections
 * it was written in response to, and missed `basalte/plano` entirely.
 *
 * Match here is a *question*, not a verdict: a record carrying one of these
 * labels must be resolved either into `RANGE_ROUTE_KEYS` or into
 * `SINGLE_PRODUCT_ACKNOWLEDGED` below. An unresolved record fails the build.
 */
export const FAMILY_SPEC_LABELS: readonly string[] = [
  'range',
  'models',
  'layouts',
  'variants',
  'series',
  'collection',
  'configurations',
  'editions',
];

/**
 * Records that look like a family by the test above but are genuinely one
 * product, each with the reason it is not a range. This exists so the guard
 * cannot be silenced by quietly widening a regex: opting out is an explicit,
 * reviewable line of code with a justification attached.
 *
 * The distinction being drawn: a **model** is a different product (Plano R3 and
 * Plano R5 are two speakers with different drivers and roles). A **variant** is
 * the same product in another form.
 */
export const SINGLE_PRODUCT_ACKNOWLEDGED: Readonly<Record<string, string>> = {
  // One iPad mount. "Eve" and "Eve Curve" are the same product wall-mounted or
  // freestanding — a mounting option, not a second model. The page is written
  // and titled as one product, and the Variants row is a spec detail.
  'basalte/eve': 'Eve and Eve Curve are mounting variants of one product, not distinct models.',
};

/** True when `label` announces that a record covers more than one model. */
export function isFamilySpecLabel(label: string): boolean {
  return FAMILY_SPEC_LABELS.includes(label.trim().toLowerCase());
}

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
