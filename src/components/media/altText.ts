/**
 * One image file, one alt string.
 *
 * Every template that renders a content image resolves its alt through
 * `altFor(src)`, so the same file can never carry two different — and therefore
 * at least one false — descriptions on two different pages. That was the defect
 * this file previously created: `inUseAlt()` appended "in use." to whichever
 * product page happened to be rendering, so a single shared cinema photograph
 * shipped five mutually exclusive series claims.
 *
 * ONE DOCUMENTED EXCEPTION, so the invariant above is not read as stronger than
 * it is: `src/pages/BrandsIndex.tsx` hardcodes `alt=""` on the nine brand tiles
 * instead of calling `altFor()`. Nine files therefore carry two different alt
 * strings — a curated caption everywhere else, empty on `/brands/`. That is
 * accessibility-correct rather than a bug: each tile image sits at 40% opacity
 * behind text inside a link whose accessible name is already the brand name, and
 * captioning a decorative background would just repeat it to a screen reader.
 * It is recorded here because QA found the two files each documenting the
 * opposite rule with no pointer between them (Phase 7 pre-launch crawl,
 * FINDING 8-2). If a "decorative context" override is ever added to this module,
 * that exception collapses back into the invariant.
 *
 * The governing rule is `docs/12-PROVENANCE/image-url-map.md:86` and `:375-378`:
 * **an image must not carry alt text implying a product is shown unless we have
 * verified that it is.** Resolution order, most specific first:
 *
 *  1. `DRAFTED_ALT` — the 14 photographs someone individually opened and
 *     captioned in `image-url-map.md`. Verified by inspection, so it always
 *     wins, and it describes the frame rather than the page it sits on.
 *  2. `DECORATIVE_ONLY` — inspected, no product identifiable in frame → `''`.
 *  3. **Shared assets** — any file referenced by more than one product record in
 *     `src/data/products.ts`. The sharing set is computed from the data at
 *     module init (`SHARED`, below), never hand-listed, so it cannot drift when
 *     a product gains or loses a gallery image. A shared file gets `''`: we
 *     cannot name a product without asserting it is in a frame we have not
 *     checked, and we will not invent a room, material or location we cannot
 *     see. `image-url-map.md:86-88` already prescribes exactly this for
 *     `cinema-theatre.jpg`, `fibonacci-scene.jpg` and `deseo-sfeer.jpg`.
 *  4. **Single-owner product imagery** — a render (`.png`/`.webp` cutout, or a
 *     Blustream `-tile.jpg`), or the one product's own hero/finish photograph.
 *     Naming here is verified by construction: the asset *is* that product, shot
 *     for it. Caption = brand + model (+ finish) + what the thing is, the last
 *     taken from the product's verified `collection` field.
 *  5. `CURATED` — brand-hub photography that no product record owns, each
 *     personally viewed and captioned to what is in frame.
 *  6. Anything else — including a single-owner lifestyle photograph we have not
 *     individually viewed — gets `''`. Generic and true beats specific and
 *     unverifiable; an empty alt makes no claim at all.
 *
 * Consequence worth knowing: a "See it in use" gallery can legitimately render
 * images with `alt=""`. That is the honest outcome for a photograph we have not
 * verified, not an oversight.
 */
import { PRODUCTS, type Product } from '@/data/products';
import { BRAND_BY_SLUG } from '@/data/brands';

/** Verbatim from docs/12-PROVENANCE/image-url-map.md ("Drafted alt text" column/rows). */
const DRAFTED_ALT: Record<string, string> = {
  '/products/marantz/lifestyle/cinema-50-credenza.jpg':
    'Marantz AV receiver in Silver-Gold on a dark ribbed-timber credenza in a minimal interior.',
  '/products/marantz/lifestyle/cinema-50-black-credenza.jpg':
    'Black Marantz Cinema 50 AV receiver on a ribbed-timber credenza, its display reading Blu-ray.',
  '/products/marantz/lifestyle/cinema-50-oak-sideboard.jpg':
    'Marantz AV receiver in Silver-Gold on an oak sideboard below a wall-mounted screen.',
  '/products/denon/lifestyle/avr-x3800h-scene.jpg':
    'Black Denon AVR-X3800H receiver in a walnut media console below a wall-mounted TV, with on-wall speakers and subwoofers in a living room.',
  '/products/denon/lifestyle/avr-x3800h-scene-angle.jpg':
    'Denon AVR-X3800H on an oak sideboard in a bright open-plan living room with in-ceiling speakers and folding glass doors.',
  '/products/denon/lifestyle/avr-x3800h-console-detail.jpg':
    'Close view of a Denon AVR-X3800H on an oak sideboard, its display reading IMAX DTS:X, below a wall-mounted TV.',
  '/products/polk-audio/lifestyle/reserve-home-theatre-insitu.jpg':
    'Two black Polk Reserve tower speakers and a Polk centre channel around a wall-mounted TV in a white family room.',
  '/products/polk-audio/lifestyle/reserve-r700-black-interior.jpg':
    'Black Polk Reserve tower speaker with its grille off, beside a raffia-fronted cabinet on a terrazzo floor.',
  '/products/polk-audio/lifestyle/reserve-r700-walnut-interior.jpg':
    'Polk Reserve tower speaker in walnut with grille fitted, against a taupe plaster wall beside a linen-fronted cabinet.',
  '/products/crestron/lifestyle/horizon-keypad-bedroom-brass.jpg':
    'Brushed-brass Crestron Horizon keypad with scene buttons, beside a softly lit bedroom at dusk.',
  '/products/crestron/lifestyle/horizon-keypad-kitchen-glass-black.jpg':
    'Black glass Crestron Horizon keypad on a mosaic-tiled wall in a bright kitchen, with lighting, climate and shade buttons.',
  '/products/crestron/lifestyle/horizon-keypad-white-backlit.jpg':
    'White Crestron Horizon keypad on a plaster wall, its scene and volume buttons backlit in magenta.',
  '/products/crestron/lifestyle/horizon-keypad-bathroom.jpg':
    'Crestron Horizon keypad in brushed black on a concrete wall, controlling temperature in a contemporary bathroom.',
  '/products/basalte/deseo-hero.jpg':
    'Basalte Deseo thermostat in bronze, flush-mounted on a walnut wall and showing 19.5 °C, lit by a shaft of daylight.',
};

/**
 * Confirmed decorative — inspected and no product is identifiable in frame
 * (docs/12-PROVENANCE/image-url-map.md Part 4, `auro-sfeer.jpg`). Never
 * caption these as if a product were shown.
 */
const DECORATIVE_ONLY = new Set<string>(['/products/basalte/auro-sfeer.jpg']);

/**
 * Brand-hub photography owned by no product record — each personally viewed and
 * captioned to what is actually in frame (no invented specifics beyond what is
 * visible). Brand heroes that *are* a product asset (Blustream Dante, Black Nova
 * ALBA, JVC DLA-NZ900) are deliberately absent: they resolve through the
 * product-derived caption in step 4, so the brand hub and the product page
 * describe the same file identically.
 */
const CURATED: Record<string, string> = {
  '/brands/marantz.jpg': 'Marantz stereo amplifier on a wooden sideboard in a warmly lit living room.',
  '/brands/denon.jpg': 'Stacked black Denon components beside a turntable and floor-standing speakers on a wooden cabinet.',
  '/brands/uandksound-hero.jpg': 'Private home cinema with tiered seating, a starlit ceiling and a large screen.',
  '/brands/polk-audio-hero.jpg': 'Polk Audio speaker and turntable on a wooden cabinet in a bright living room.',
};

/** A cutout render or white-background tile — the asset literally is the product. */
const isRenderPath = (src: string) => /\.(png|webp)$/i.test(src) || /-tile\.jpg$/i.test(src);

type Owner = { product: Product; brandName: string };

/**
 * `src` → the product records that reference it (hero, finish images, gallery).
 * Built once from the catalog so "is this image shared?" is answered by the data
 * itself rather than by a list someone has to remember to update.
 */
const OWNERS: Map<string, Owner[]> = (() => {
  const map = new Map<string, Owner[]>();
  const add = (src: string, product: Product, brandName: string) => {
    const existing = map.get(src);
    if (existing) {
      if (!existing.some((o) => o.product.slug === product.slug)) existing.push({ product, brandName });
      return;
    }
    map.set(src, [{ product, brandName }]);
  };
  for (const product of PRODUCTS) {
    // The catalog stores a brand *slug*; the brand's display name comes from the
    // one place that owns it, so an alt can never disagree with a page heading.
    const brandName = BRAND_BY_SLUG[product.brandSlug]?.name ?? product.brandSlug;
    add(product.hero, product, brandName);
    for (const finish of product.finishes) add(finish.productImage, product, brandName);
    for (const src of product.inUse) add(src, product, brandName);
  }
  return map;
})();

/** True when more than one product record uses this file — nobody may be named. */
function isShared(src: string): boolean {
  return (OWNERS.get(src)?.length ?? 0) > 1;
}

/**
 * "What the thing is", taken from the product's verified `collection` field
 * (e.g. `4-Series™ Rack-Mount Control System`). The mid-dot separator the
 * catalog uses for display reads badly in speech, so it becomes a comma.
 */
function kindOf(product: Product): string {
  return product.collection.replace(/\s*·\s*/g, ', ').trim();
}

/** Brand + model + finish + what it is — used only where naming is verified. */
function describe(owner: Owner, finishName?: string): string {
  const { brandName, product } = owner;
  const subject = finishName ? `${brandName} ${product.name} in ${finishName}` : `${brandName} ${product.name}`;
  const kind = kindOf(product);
  return kind ? `${subject}, ${kind}` : subject;
}

/**
 * The canonical alt for an image file. Resolution order is documented at the top
 * of this file. Callers pass nothing but the `src`, which is what guarantees the
 * one-file-one-alt invariant.
 */
export function altFor(src: string): string {
  const drafted = DRAFTED_ALT[src];
  if (drafted) return drafted;
  if (DECORATIVE_ONLY.has(src)) return '';
  if (isShared(src)) return '';

  const owner = OWNERS.get(src)?.[0];
  if (owner) {
    const { product } = owner;
    // A finish image names its finish; two finishes sharing one image would make
    // that ambiguous, so it is only named when exactly one finish claims the file.
    const finishes = product.finishes.filter((f) => f.productImage === src);
    const finishName = finishes.length === 1 ? finishes[0].name : undefined;
    if (isRenderPath(src) || src === product.hero || finishes.length > 0) {
      return describe(owner, finishName);
    }
    // Single-owner lifestyle photograph we have not individually viewed: it may
    // or may not contain the product, so it asserts nothing.
    return '';
  }

  return CURATED[src] ?? '';
}
