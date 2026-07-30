/**
 * Keypad designer catalog.
 *
 * What is sourced, and what is not — read this before adding a value here.
 *
 * SOURCED (from Black Nova's own published material: the collection pages and
 * the per-layout datasheets, adjudicated row by row in
 * `docs/12-PROVENANCE/black-nova.md`):
 *   - collection names (ALBA, ARIA, ANY, AXES, BLACK JACK) and their kind;
 *   - layout names (ALBA 8, ARIA 12, AXES CH …) — each is a published tile;
 *   - finishes, which are not stored here at all but read from the verified
 *     product catalog in `src/data/products.ts` via `finishesFor()`.
 *
 * NOT SOURCED — illustrative only, and labelled as such to the visitor by the
 * designer's own disclaimer:
 *   - the visual button grid (`cols`/`rows`): an arrangement chosen to preview
 *     design intent, not a published faceplate drawing;
 *   - the curated lucide icon set — production engraving uses Black Nova's
 *     official icon library;
 *   - the backlight colour presets, which are a curated selection of RGB values.
 *
 * Per-layout `note` is OPTIONAL and carries a published figure only. A layout
 * for which Black Nova publishes no datasheet (ALBA 6, ARIA Slider — the name is
 * a published tile, the button/touch-point count is not published anywhere
 * across the 28 official PDFs; `docs/12-PROVENANCE/black-nova.md:238` and `:269`
 * adjudicate both as OMIT) simply carries no note. Never infer a count from the
 * numeral in a layout's name, and never carry a figure forward from a sibling.
 */
import { PRODUCT_BY_SLUG, type Finish } from '@/data/products';

export type LayoutType = 'buttons' | 'display' | 'matrix';

export type Layout = {
  id: string;
  /** Published layout name, e.g. "ALBA 8". */
  name: string;
  /**
   * Published descriptor for this layout, e.g. "Max 12 addressable push
   * buttons" — verbatim from the layout's own datasheet. Omitted entirely where
   * Black Nova publishes no such figure; the UI then renders nothing.
   */
  note?: string;
  type: LayoutType;
  /** Physical grid for `buttons` layouts (illustrative arrangement). */
  cols?: number;
  rows?: number;
};

export type Collection = {
  id: string;
  /** Official collection name. */
  name: string;
  /** Matching product slug in src/data/products.ts (source of finishes). */
  productSlug: string;
  /** Short descriptor of the collection kind. */
  kind: string;
  layouts: Layout[];
};

export const COLLECTIONS: Collection[] = [
  {
    id: 'alba',
    name: 'ALBA',
    productSlug: 'alba',
    kind: 'Push-button · metal & glass',
    layouts: [
      { id: 'alba-2', name: 'ALBA 2', note: 'Max 4 addressable push buttons', type: 'buttons', cols: 1, rows: 2 },
      { id: 'alba-4', name: 'ALBA 4', note: 'Max 12 addressable push buttons', type: 'buttons', cols: 2, rows: 2 },
      // ALBA 6: published tile, no datasheet — no addressable-button figure exists
      // to quote (docs/12-PROVENANCE/black-nova.md:238). No note, by design.
      { id: 'alba-6', name: 'ALBA 6', type: 'buttons', cols: 2, rows: 3 },
      { id: 'alba-8', name: 'ALBA 8', note: 'Max 12 addressable push buttons', type: 'buttons', cols: 2, rows: 4 },
      { id: 'alba-m1', name: 'ALBA M1', note: 'Multipurpose · temperature interface', type: 'display' },
    ],
  },
  {
    id: 'aria',
    name: 'ARIA',
    productSlug: 'aria',
    kind: 'Glass touch',
    layouts: [
      { id: 'aria-m1', name: 'ARIA M1', note: 'Max 6 addressable touch points', type: 'buttons', cols: 2, rows: 3 },
      { id: 'aria-12', name: 'ARIA 12', note: 'Max 12 addressable touch points', type: 'buttons', cols: 2, rows: 6 },
      // ARIA Slider: published tile, no datasheet — the touch-point figure is our
      // inference, not Black Nova's (docs/12-PROVENANCE/black-nova.md:269). No note.
      { id: 'aria-slider', name: 'ARIA Slider', type: 'buttons', cols: 2, rows: 4 },
    ],
  },
  {
    id: 'any',
    name: 'ANY',
    productSlug: 'any',
    kind: 'Smart touch panel',
    layouts: [
      { id: 'any-matrix', name: 'ANY', note: '841-LED matrix · multitouch', type: 'matrix' },
    ],
  },
  {
    id: 'axes',
    name: 'AXES',
    productSlug: 'axes',
    kind: 'Hospitality touch',
    layouts: [
      { id: 'axes-tt', name: 'AXES TT', note: 'Max 10 addressable touch points', type: 'buttons', cols: 2, rows: 5 },
      { id: 'axes-9', name: 'AXES 9', note: 'Max 9 addressable touch points', type: 'buttons', cols: 3, rows: 3 },
      { id: 'axes-ch', name: 'AXES CH', note: 'Card holder · max 5 touch points', type: 'buttons', cols: 1, rows: 5 },
      { id: 'axes-n3', name: 'AXES N3', note: 'Max 3 addressable touch points', type: 'buttons', cols: 1, rows: 3 },
      { id: 'axes-kn', name: 'AXES KN', note: 'Numeric keypad', type: 'buttons', cols: 3, rows: 4 },
    ],
  },
  {
    id: 'black-jack',
    name: 'BLACK JACK',
    productSlug: 'black-jack',
    kind: 'Capsule with Meljac',
    layouts: [
      { id: 'bj-2', name: 'Black Jack 2', note: 'Max 2 addressable push buttons', type: 'buttons', cols: 1, rows: 2 },
      { id: 'bj-4', name: 'Black Jack 4', note: 'Max 4 addressable push buttons', type: 'buttons', cols: 2, rows: 2 },
      { id: 'bj-6', name: 'Black Jack 6', note: 'Max 6 addressable push buttons', type: 'buttons', cols: 2, rows: 3 },
      { id: 'bj-8', name: 'Black Jack 8', note: 'Max 8 addressable push buttons', type: 'buttons', cols: 2, rows: 4 },
      { id: 'bj-m1', name: 'Black Jack M1', note: 'Multipurpose OLED display', type: 'display' },
    ],
  },
];

export const COLLECTION_BY_ID = Object.fromEntries(COLLECTIONS.map((c) => [c.id, c]));

/** Finishes for a collection, sourced from the verified product catalog. */
export function finishesFor(collectionId: string): Finish[] {
  const c = COLLECTION_BY_ID[collectionId];
  return c ? PRODUCT_BY_SLUG[c.productSlug]?.finishes ?? [] : [];
}

export function layoutById(collectionId: string, layoutId: string): Layout | undefined {
  return COLLECTION_BY_ID[collectionId]?.layouts.find((l) => l.id === layoutId);
}

/** Number of engravable buttons a layout renders (0 for display/matrix). */
export function buttonCount(layout: Layout | undefined): number {
  if (!layout || layout.type !== 'buttons') return 0;
  return (layout.cols ?? 1) * (layout.rows ?? 1);
}

// Backlight — the keypads carry an independently dimmable RGB backlight.
// These named presets are a curated selection of RGB colours.
export type Backlight = { id: string; name: string; color: string };
export const BACKLIGHTS: Backlight[] = [
  { id: 'amber', name: 'Amber Gold', color: '#C9A961' },
  { id: 'warm-white', name: 'Warm White', color: '#F5E6C8' },
  { id: 'ice-blue', name: 'Ice Blue', color: '#8FB8D8' },
  { id: 'magenta', name: 'Magenta', color: '#D061B0' },
  { id: 'emerald', name: 'Emerald', color: '#5FB98C' },
  { id: 'crimson', name: 'Crimson', color: '#D0574F' },
];
export const BACKLIGHT_BY_ID = Object.fromEntries(BACKLIGHTS.map((b) => [b.id, b]));

// Curated engraving icon set (illustrative — production uses Black Nova's own
// icon library). Each `id` maps to a lucide-react icon in KeypadPreview.
export type IconDef = { id: string; label: string };
export const ICONS: IconDef[] = [
  { id: 'sun', label: 'Lights' },
  { id: 'sun-dim', label: 'Dim' },
  { id: 'lightbulb', label: 'Lamp' },
  { id: 'blinds', label: 'Blinds' },
  { id: 'thermometer', label: 'Climate' },
  { id: 'snowflake', label: 'Cooling' },
  { id: 'fan', label: 'Fan' },
  { id: 'tv', label: 'TV' },
  { id: 'music', label: 'Music' },
  { id: 'volume', label: 'Volume' },
  { id: 'film', label: 'Cinema' },
  { id: 'leaf', label: 'Eco' },
  { id: 'flower', label: 'Spa' },
  { id: 'wine', label: 'Dinner' },
  { id: 'moon', label: 'Goodnight' },
  { id: 'sunrise', label: 'Morning' },
  { id: 'door', label: 'Door' },
  { id: 'bell', label: 'Service' },
  { id: 'power', label: 'All Off' },
];
export const ICON_BY_ID = Object.fromEntries(ICONS.map((i) => [i.id, i]));

/** Default rotation of icons used to seed a fresh button grid. */
export const DEFAULT_SEQUENCE = [
  'sun', 'sun-dim', 'blinds', 'thermometer', 'music', 'film', 'leaf', 'wine',
  'flower', 'moon', 'door', 'power',
];
