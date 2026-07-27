/**
 * Keypad designer catalog.
 *
 * Collection, layout and finish data derive from the verified Black Nova product
 * catalog (see src/data/products.ts) — the same official source, no invented
 * data. Layout names and their maximum addressable buttons/touch points are
 * taken verbatim from each blacknova.co collection page.
 *
 * IMPORTANT: the *visual* button grid, the curated lucide icon set and the
 * backlight colour presets are illustrative — a re-skin of Black Nova's own
 * "Create your keypad" pipeline. Production engraving uses Black Nova's official
 * icon library and finishing. The designer surfaces a disclaimer to this effect.
 */
import { PRODUCT_BY_SLUG, type Finish } from '@/data/products';

export type LayoutType = 'buttons' | 'display' | 'matrix';

export type Layout = {
  id: string;
  /** Official model name, e.g. "ALBA 8". */
  name: string;
  /** Official max addressable buttons / touch points, e.g. "Max 12 addressable push buttons". */
  note: string;
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
      { id: 'alba-6', name: 'ALBA 6', note: 'Max 12 addressable push buttons', type: 'buttons', cols: 2, rows: 3 },
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
      { id: 'aria-slider', name: 'ARIA Slider', note: 'Max 12 addressable touch points', type: 'buttons', cols: 2, rows: 4 },
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
